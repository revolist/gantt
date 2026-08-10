import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'benchmarks', 'results');
const baseURL = 'http://127.0.0.1:4173';
const viewport = { width: 1440, height: 900 };
const taskCounts = [100, 1_000, 5_000, 10_000];
const densities = ['sparse', 'normal', 'high'];
const scenarios = ['initial', 'vertical', 'horizontal', 'move', 'resize', 'dependency', 'hierarchy', 'memory-dom'];
const smoke = process.argv.includes('--smoke');
const formatOnly = process.argv.includes('--format-only');
const measuredRuns = smoke ? 1 : 5;
const warmupRuns = smoke ? 0 : 1;

await mkdir(outputDir, { recursive: true });

if (formatOnly) {
  const existing = JSON.parse(await readFile(path.join(outputDir, 'latest.json'), 'utf8'));
  await writeFile(path.join(outputDir, 'latest.csv'), toCsv(existing.samples));
  console.log(`Formatted ${existing.samples.length} samples into benchmarks/results/latest.csv`);
  process.exit(0);
}

const server = spawn('pnpm', ['exec', 'vite', '--mode', 'ts', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += String(chunk); });
server.stderr.on('data', (chunk) => { serverOutput += String(chunk); });

try {
  await waitForServer();
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
  });
  const packageManifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const cases = (smoke ? [100] : taskCounts).flatMap((taskCount) =>
    (smoke ? ['sparse'] : densities).map((density) => ({
      id: `${taskCount}-${density}`,
      taskCount,
      density,
      dependencyTarget: Math.round(taskCount * ({ sparse: 0.5, normal: 1.9796, high: 4 })[density]),
    })),
  );
  const samples = [];

  for (const benchmarkCase of cases) {
    for (let runIndex = 0; runIndex < warmupRuns + measuredRuns; runIndex += 1) {
      const warmup = runIndex < warmupRuns;
      for (const scenario of scenarios) {
        const span = scenario === 'horizontal' ? 'twenty-year' : 'quarter';
        const sample = await runScenario(browser, benchmarkCase, scenario, span, runIndex, warmup);
        samples.push(sample);
        console.log(`${warmup ? 'warmup' : `run ${runIndex - warmupRuns + 1}`} ${benchmarkCase.id} ${scenario}`);
      }
    }
  }

  const runDate = new Date().toISOString();
  const dateId = runDate.slice(0, 10);
  const media = await captureMedia(browser);
  const output = {
    schemaVersion: 1,
    runDate,
    methodology: {
      warmupRuns,
      measuredRuns,
      isolatedPagePerScenario: true,
      longTaskThresholdMs: 50,
      interactiveDefinition: 'aftergridrender + exact plugin snapshot counts + mounted hit-testable task bar + initialized timeline viewport + two animation frames',
      claim: '10,000 editable tasks and 19,796 dependencies in a live browser demo',
    },
    environment: environmentManifest(browser.version(), packageManifest),
    cases,
    samples,
    aggregates: aggregateSamples(samples.filter((sample) => !sample.warmup)),
    assets: media,
    limitations: [
      'Measurements are machine- and browser-specific and are not a cross-vendor comparison.',
      'The reference harness uses Vanilla TypeScript; framework wrapper overhead is excluded.',
      'Chromium heap values describe the full page, not only RevoGrid allocations.',
      'Headless Chromium frame pacing is not identical to a physical display; raw and 60 Hz-capped FPS are both retained.',
      'Datasets are deterministic synthetic local projects; network, backend persistence, mobile hardware, and application-specific renderers are excluded.',
      'Interaction recalculation measurements include the associated browser render.',
    ],
  };

  const json = `${JSON.stringify(output, null, 2)}\n`;
  const csv = toCsv(samples);
  await Promise.all([
    writeFile(path.join(outputDir, `reference-${dateId}.json`), json),
    writeFile(path.join(outputDir, `reference-${dateId}.csv`), csv),
    writeFile(path.join(outputDir, 'latest.json'), json),
    writeFile(path.join(outputDir, 'latest.csv'), csv),
  ]);
  await browser.close();
  console.log(JSON.stringify({ runDate, cases: cases.length, rawSamples: samples.length, aggregates: output.aggregates.length, outputDir }, null, 2));
} finally {
  server.kill('SIGTERM');
}

async function runScenario(browser, benchmarkCase, scenario, span, runIndex, warmup) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await runScenarioAttempt(browser, benchmarkCase, scenario, span, runIndex, warmup);
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      console.warn(`retry ${benchmarkCase.id} ${scenario}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw lastError;
}

async function runScenarioAttempt(browser, benchmarkCase, scenario, span, runIndex, warmup) {
  const context = await browser.newContext({ viewport, colorScheme: 'light', deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    const url = `${baseURL}/?example=benchmark&automated=1&tasks=${benchmarkCase.taskCount}&density=${benchmarkCase.density}&span=${span}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForFunction(() => Boolean(window.__GANTT_BENCHMARK__), undefined, { timeout: 30_000 });
    const readiness = await page.evaluate(() => window.__GANTT_BENCHMARK__.readiness);
    let metrics;

  switch (scenario) {
    case 'initial':
      metrics = flattenObject(readiness);
      break;
    case 'vertical':
      metrics = flattenObject(await page.evaluate(() => window.__GANTT_BENCHMARK__.measureScroll('vertical')));
      break;
    case 'horizontal':
      metrics = flattenObject(await page.evaluate(() => window.__GANTT_BENCHMARK__.measureScroll('horizontal')));
      break;
    case 'move':
      metrics = await measurePointerInteraction(page, 'move');
      break;
    case 'resize':
      metrics = await measurePointerInteraction(page, 'resize');
      break;
    case 'dependency':
      metrics = flattenObject(await page.evaluate(() => window.__GANTT_BENCHMARK__.measureDependencyUpdate()));
      break;
    case 'hierarchy':
      metrics = flattenObject(await page.evaluate(() => window.__GANTT_BENCHMARK__.measureHierarchyProjection()));
      break;
    case 'memory-dom': {
      await collectGarbage(page);
      const heapInitial = await page.evaluate(() => window.__GANTT_BENCHMARK__.sampleHeap());
      await page.evaluate(async () => {
        await window.__GANTT_BENCHMARK__.measureScroll('vertical', 500);
        await window.__GANTT_BENCHMARK__.measureScroll('horizontal', 500);
        await window.__GANTT_BENCHMARK__.measureDependencyUpdate();
        await window.__GANTT_BENCHMARK__.measureHierarchyProjection();
      });
      await collectGarbage(page);
      const heapAfter = await page.evaluate(() => window.__GANTT_BENCHMARK__.sampleHeap());
      const dom = await page.evaluate(() => window.__GANTT_BENCHMARK__.getDomFootprint());
      metrics = {
        heapInitialSamplesBytes: heapInitial,
        heapInitialMedianBytes: median(heapInitial.filter(Number.isFinite)),
        heapAfterInteractionSamplesBytes: heapAfter,
        heapAfterInteractionMedianBytes: median(heapAfter.filter(Number.isFinite)),
        ...flattenObject(dom),
      };
      break;
    }
    default:
      throw new Error(`Unknown benchmark scenario: ${scenario}`);
  }

    if (errors.length) throw new Error(`${benchmarkCase.id}/${scenario} browser errors: ${errors.join(' | ')}`);
    return {
      caseId: benchmarkCase.id,
      taskCount: benchmarkCase.taskCount,
      density: benchmarkCase.density,
      timelineSpan: span,
      dependencyCount: readiness.dependencyCount,
      scenario,
      runIndex,
      warmup,
      metrics,
    };
  } finally {
    await context.close();
  }
}

async function measurePointerInteraction(page, kind) {
  const bar = page.locator('.gantt-bar--task[data-gantt-task-id]').filter({ visible: true }).first();
  await bar.hover();
  const barBox = await bar.boundingBox();
  if (!barBox) throw new Error(`No visible task bar for ${kind} benchmark.`);
  const taskId = await bar.getAttribute('data-gantt-task-id');
  const before = await page.evaluate(async (id) => {
    const grid = window.__GANTT_BENCHMARK__.getGrid();
    const plugins = await grid.getPlugins();
    const gantt = plugins.find((plugin) => typeof plugin.getProjectSnapshot === 'function');
    return gantt?.getProjectSnapshot()?.tasks.find((task) => task.id === id);
  }, taskId);
  await page.evaluate((expectedAction) => {
    window.__GANTT_POINTER_SAMPLE__ = { expectedAction, pointerDownAt: 0, mutationAt: 0 };
    const grid = window.__GANTT_BENCHMARK__.getGrid();
    grid.addEventListener('gantt-before-task-change', (event) => {
      if (event.detail?.action === expectedAction) window.__GANTT_POINTER_SAMPLE__.mutationAt = performance.now();
    }, { once: true });
  }, kind);

  let targetX = barBox.x + barBox.width / 2;
  const targetY = barBox.y + barBox.height / 2;
  if (kind === 'resize') {
    const handle = bar.locator('.gantt-bar__resize-handle--end');
    const handleBox = await handle.boundingBox();
    if (!handleBox) throw new Error('No visible resize handle for resize benchmark.');
    targetX = handleBox.x + handleBox.width / 2;
  }
  await page.mouse.move(targetX, targetY);
  await page.evaluate(() => { window.__GANTT_POINTER_SAMPLE__.pointerDownAt = performance.now(); });
  await page.mouse.down();
  await page.mouse.move(targetX + 36, targetY, { steps: 3 });
  await page.waitForSelector('.gantt-bar--interaction-active', { state: 'attached', timeout: 5_000 });
  const previewMs = await page.evaluate(() => performance.now() - window.__GANTT_POINTER_SAMPLE__.pointerDownAt);
  const pointerUpAt = await page.evaluate(() => performance.now());
  await page.mouse.up();
  await page.waitForFunction(() => window.__GANTT_POINTER_SAMPLE__.mutationAt > 0, undefined, { timeout: 10_000 });
  await page.evaluate(() => window.__GANTT_BENCHMARK__.waitForPaint());
  const result = await page.evaluate(async ({ id, pointerUpAt }) => {
    const grid = window.__GANTT_BENCHMARK__.getGrid();
    const plugins = await grid.getPlugins();
    const gantt = plugins.find((plugin) => typeof plugin.getProjectSnapshot === 'function');
    return {
      commitToPaintMs: performance.now() - pointerUpAt,
      mutationAfterPointerDownMs: window.__GANTT_POINTER_SAMPLE__.mutationAt - window.__GANTT_POINTER_SAMPLE__.pointerDownAt,
      after: gantt?.getProjectSnapshot()?.tasks.find((task) => task.id === id),
    };
  }, { id: taskId, pointerUpAt });
  const changed = kind === 'move'
    ? before?.startDate !== result.after?.startDate
    : before?.endDate !== result.after?.endDate;
  if (!changed) throw new Error(`${kind} interaction did not commit a visible schedule change for ${taskId}.`);
  return {
    previewMs: round(previewMs),
    commitToPaintMs: round(result.commitToPaintMs),
    mutationAfterPointerDownMs: round(result.mutationAfterPointerDownMs),
  };
}

async function captureMedia(browser) {
  const rawVideoDir = path.join(outputDir, 'video-raw');
  await mkdir(rawVideoDir, { recursive: true });
  const context = await browser.newContext({
    viewport,
    colorScheme: 'light',
    recordVideo: { dir: rawVideoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/?example=benchmark&tasks=10000&density=normal&span=quarter`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForFunction(() => Boolean(window.__GANTT_BENCHMARK__));
  await page.evaluate(() => window.__GANTT_BENCHMARK__.readiness);
  await page.screenshot({ path: path.join(outputDir, 'gantt-benchmark-reference.png'), fullPage: true, animations: 'disabled' });
  await page.evaluate(() => window.__GANTT_BENCHMARK__.measureScroll('vertical', 1_500));
  await page.evaluate(() => window.__GANTT_BENCHMARK__.measureDependencyUpdate());
  await page.evaluate(() => window.__GANTT_BENCHMARK__.measureHierarchyProjection());
  const video = page.video();
  await page.close();
  await context.close();
  const videoPath = await video.path();
  await copyFile(videoPath, path.join(outputDir, 'gantt-benchmark-walkthrough.webm'));
  await rm(rawVideoDir, { recursive: true, force: true });
  return {
    screenshot: './gantt-benchmark-reference.png',
    video: './gantt-benchmark-walkthrough.webm',
    json: './latest.json',
    csv: './latest.csv',
  };
}

function aggregateSamples(samples) {
  const groups = new Map();
  for (const sample of samples) {
    const key = `${sample.caseId}:${sample.timelineSpan}:${sample.scenario}`;
    const group = groups.get(key) ?? [];
    group.push(sample);
    groups.set(key, group);
  }
  return [...groups.entries()].map(([key, group]) => {
    const numericKeys = [...new Set(group.flatMap((sample) => Object.keys(sample.metrics).filter((metric) => Number.isFinite(sample.metrics[metric]))))];
    const metrics = {};
    for (const metric of numericKeys) {
      const values = group.map((sample) => sample.metrics[metric]).filter(Number.isFinite);
      metrics[metric] = { median: round(median(values)), p95: round(p95(values)), samples: values };
    }
    return {
      key,
      caseId: group[0].caseId,
      taskCount: group[0].taskCount,
      density: group[0].density,
      timelineSpan: group[0].timelineSpan,
      scenario: group[0].scenario,
      measuredRuns: group.length,
      metrics,
    };
  });
}

function environmentManifest(browserVersion, packageManifest) {
  const hardware = command('system_profiler', ['SPHardwareDataType']);
  const value = (label) => hardware.match(new RegExp(`^\\s*${label}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? 'unknown';
  return {
    gitCommit: command('git', ['rev-parse', 'HEAD']),
    browser: `Chromium ${browserVersion}`,
    playwright: dependencyVersion(packageManifest.devDependencies.playwright),
    viewport,
    deviceScaleFactor: 1,
    node: process.version,
    pnpm: command('pnpm', ['--version']),
    revogrid: {
      core: dependencyVersion(packageManifest.dependencies['@revolist/revogrid']),
      pro: dependencyVersion(packageManifest.dependencies['@revolist/revogrid-pro']),
      enterprise: dependencyVersion(packageManifest.dependencies['@revolist/revogrid-enterprise']),
    },
    machine: {
      model: value('Model Identifier'),
      chip: value('Chip'),
      cores: value('Total Number of Cores'),
      memory: value('Memory'),
      architecture: os.arch(),
      os: `${command('sw_vers', ['-productName'])} ${command('sw_vers', ['-productVersion'])}`,
      osBuild: command('sw_vers', ['-buildVersion']),
    },
  };
}

function dependencyVersion(value) {
  return String(value ?? 'unknown').match(/(\d+\.\d+\.\d+(?:-[\w.]+)?)/)?.[1] ?? String(value ?? 'unknown');
}

function flattenObject(value, prefix = '', output = {}) {
  for (const [key, item] of Object.entries(value ?? {})) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) flattenObject(item, pathKey, output);
    else output[pathKey] = item;
  }
  return output;
}

function toCsv(samples) {
  const metricKeys = [...new Set(samples.flatMap((sample) => Object.keys(sample.metrics)))].sort();
  const headers = ['caseId', 'taskCount', 'density', 'timelineSpan', 'dependencyCount', 'scenario', 'runIndex', 'warmup', ...metricKeys];
  const rows = samples.map((sample) => headers.map((header) => {
    const value = header in sample ? sample[header] : sample.metrics[header];
    return csvCell(Array.isArray(value) || (value && typeof value === 'object') ? JSON.stringify(value) : value);
  }).join(','));
  return `${headers.join(',')}\n${rows.join('\n')}\n`;
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function p95(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function collectGarbage(page) {
  const session = await page.context().newCDPSession(page);
  await session.send('HeapProfiler.collectGarbage');
  await session.detach();
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    if (server.exitCode != null) throw new Error(`Vite exited early (${server.exitCode}).\n${serverOutput}`);
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch { /* server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for Vite.\n${serverOutput}`);
}

function command(name, args) {
  try {
    return execFileSync(name, args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
