import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { chromium } from 'playwright';

const execFileAsync = promisify(execFile);
const demoRoot = resolve(import.meta.dirname, '..');
const argument = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
const example = argument('--example') ?? 'industry-erp';
const docsRoot = resolve(argument('--docs-root') ?? resolve(demoRoot, '../..'));
const skipBuild = process.argv.includes('--skip-build');
const captureSpecs = {
  'industry-erp': {
    assetId: 'erp',
    projectId: 'erp-production-release-0826',
    minimumTasks: 14,
    minimumDependencies: 8,
    interactionTarget: 'Coating batch approval',
    hoverBarIndex: 4,
    port: 4329,
  },
  'industry-professional-services': {
    assetId: 'professional-services',
    projectId: 'psa-client-portfolio-q3-2026',
    minimumTasks: 16,
    minimumDependencies: 10,
    interactionTarget: 'UAT readiness workshop',
    hoverBarIndex: 5,
    port: 4330,
  },
  'industry-construction': {
    assetId: 'construction',
    projectId: 'riverside-clinic-expansion-2026',
    minimumTasks: 18,
    minimumDependencies: 12,
    interactionTarget: 'Switchgear delivery and inspection',
    hoverBarIndex: 10,
    port: 4331,
  },
  'industry-manufacturing': {
    assetId: 'manufacturing',
    projectId: 'manufacturing-valve-actuator-cell-2026',
    minimumTasks: 20,
    minimumDependencies: 14,
    interactionTarget: 'CNC-07 changeover and setup',
    hoverBarIndex: 4,
    port: 4332,
  },
  'industry-resource-planning': {
    assetId: 'resource-planning',
    projectId: 'resource-portfolio-q4-2026',
    minimumTasks: 22,
    minimumDependencies: 20,
    interactionTarget: 'Amina Rahman',
    barSelector: '.gantt-resource-load--overallocated',
    hoverBarIndex: 0,
    port: 4333,
  },
  'industry-internal-tools': {
    assetId: 'internal-tools',
    projectId: 'internal-release-48-readiness-2026',
    minimumTasks: 22,
    minimumDependencies: 22,
    interactionTarget: 'Billing configuration approval',
    hoverBarIndex: 14,
    port: 4334,
  },
};
const captureSpec = captureSpecs[example];
if (!captureSpec) throw new Error(`Unknown industry Gantt example: ${example}`);
const { assetId } = captureSpec;

const host = '127.0.0.1';
const { port } = captureSpec;
// Render taller than the published media so a full 16:9 frame can be cut from
// inside the grid without including the product header or demo toolbar.
const viewport = { width: 1200, height: 900 };
const temporaryRoot = await mkdtemp(join(tmpdir(), `${assetId}-industry-gantt-`));
const screenshotDirectory = join(docsRoot, 'public/img/gantt-use-cases');
const videoDirectory = join(docsRoot, 'public/video/gantt-use-cases');
const screenshotTarget = join(screenshotDirectory, `${assetId}.webp`);
const videoTarget = join(videoDirectory, `${assetId}.mp4`);
const localVite = join(demoRoot, 'node_modules/.bin/vite');
const workspaceVite = resolve(demoRoot, '../../../../examples/revogrid-demos/pro-advanced-gantt/node_modules/.bin/vite');
const compatibleWorkspaceVite = resolve(demoRoot, '../core-free/node_modules/.bin/vite');
const parentVite = resolve(demoRoot, '../node_modules/.bin/vite');

async function chooseVite() {
  for (const candidate of [localVite, workspaceVite, compatibleWorkspaceVite, parentVite]) {
    try { await access(candidate); return candidate; } catch {}
  }
  throw new Error('Vite is unavailable. Run pnpm install for pro-advanced-gantt first.');
}

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd: demoRoot, stdio: 'inherit' });
    child.once('error', rejectRun);
    child.once('exit', (code) => code === 0 ? resolveRun() : rejectRun(new Error(`${command} exited with ${code}`)));
  });
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { const response = await fetch(`http://${host}:${port}/?use-case=${example}`); if (response.ok) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error('Timed out waiting for the industry Gantt preview');
}

const vite = await chooseVite();
if (!skipBuild) await run(vite, ['build', '--mode', 'ts']);
await mkdir(screenshotDirectory, { recursive: true });
await mkdir(videoDirectory, { recursive: true });
const preview = spawn(vite, ['preview', '--host', host, '--port', String(port)], { cwd: demoRoot, stdio: 'ignore' });
let browser;

try {
  await waitForPreview();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, colorScheme: 'light', locale: 'en-GB', timezoneId: 'UTC', recordVideo: { dir: temporaryRoot, size: viewport } });
  const page = await context.newPage();
  const rawVideo = page.video();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://${host}:${port}/?use-case=${example}`, { waitUntil: 'networkidle' });

  const grid = page.locator('revo-grid').first();
  await grid.waitFor({ state: 'visible', timeout: 20_000 });
  const barSelector = captureSpec.barSelector ?? '.gantt-bar';
  await page.locator(barSelector).first().waitFor({ state: 'visible', timeout: 20_000 });
  const realState = await grid.evaluate(async (element) => {
    const runtimePlugins = await element.getPlugins();
    const ganttPlugin = runtimePlugins.find((plugin) => typeof plugin?.applyGantt === 'function' && typeof plugin?.clearGantt === 'function');
    const projectSnapshot = ganttPlugin?.getProjectSnapshot?.();
    return {
      tasks: projectSnapshot?.tasks?.length ?? element.source?.length ?? 0,
      projectedRows: element.source?.length ?? 0,
      resources: projectSnapshot?.resources?.length ?? element.ganttResources?.length ?? 0,
      dependencies: projectSnapshot?.dependencies?.length ?? element.ganttDependencies?.length ?? 0,
      project: element.gantt?.id,
      registeredPluginCount: element.plugins?.length ?? 0,
      runtimePluginCount: runtimePlugins.length,
      hasGanttPlugin: Boolean(ganttPlugin),
    };
  });
  if (realState.tasks < captureSpec.minimumTasks || realState.dependencies < captureSpec.minimumDependencies || realState.project !== captureSpec.projectId || !realState.hasGanttPlugin) {
    throw new Error(`Real Gantt verification failed: ${JSON.stringify({ captureSpec, realState })}`);
  }

  const gridBox = await grid.boundingBox();
  if (!gridBox) throw new Error('Unable to resolve the Gantt grid capture bounds');
  const captureWidth = Math.floor(gridBox.width / 2) * 2;
  const captureHeight = Math.floor((captureWidth * 9 / 16) / 2) * 2;
  const captureX = Math.ceil(gridBox.x / 2) * 2;
  const captureY = Math.ceil(gridBox.y / 2) * 2;
  if (captureHeight > gridBox.height || captureX + captureWidth > viewport.width || captureY + captureHeight > viewport.height) {
    throw new Error(`Gantt grid is too small for the media crop: ${JSON.stringify({ gridBox, captureX, captureY, captureWidth, captureHeight })}`);
  }
  const captureClip = { x: captureX, y: captureY, width: captureWidth, height: captureHeight };

  await page.waitForTimeout(1_200);
  const baseline = page.getByRole('button', { name: 'Baseline', exact: true });
  const critical = page.getByRole('button', { name: 'Critical path', exact: true });
  await baseline.click();
  await page.waitForTimeout(1_700);
  if (await baseline.getAttribute('aria-pressed') !== 'true') throw new Error('Baseline control did not update');

  const png = join(temporaryRoot, `${assetId}.png`);
  await page.screenshot({ path: png, animations: 'disabled', clip: captureClip });
  await critical.click();
  await page.waitForTimeout(1_300);
  await critical.click();
  await page.waitForTimeout(1_500);
  const interactionTarget = page.getByText(captureSpec.interactionTarget, { exact: true }).first();
  await interactionTarget.waitFor({ state: 'visible', timeout: 10_000 });
  await interactionTarget.click();
  await page.waitForTimeout(1_300);
  await page.locator(barSelector).nth(captureSpec.hoverBarIndex).hover();
  await page.waitForTimeout(1_400);
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);

  await context.close();
  const rawVideoPath = await rawVideo.path();
  await execFileAsync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', 'scale=1200:675:flags=lanczos', '-c:v', 'libwebp', '-quality', '82', screenshotTarget]);
  // Crop the raw browser recording to the same grid-only rectangle. H.264
  // 4:2:0 requires an even coded height, hence the 1200×676 video output.
  await execFileAsync('ffmpeg', ['-loglevel', 'error', '-y', '-i', rawVideoPath, '-vf', `crop=${captureWidth}:${captureHeight}:${captureX}:${captureY},fps=30,scale=1200:676:flags=lanczos,tpad=stop_mode=clone:stop_duration=3,trim=duration=11,format=yuv420p`, '-aspect', '16:9', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-movflags', '+faststart', videoTarget]);
  console.log(JSON.stringify({ example, screenshotTarget, videoTarget, captureClip, realState }, null, 2));
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
  await rm(temporaryRoot, { recursive: true, force: true });
}
