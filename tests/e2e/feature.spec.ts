import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const feature = JSON.parse(
  readFileSync(new URL('../../feature.json', import.meta.url), 'utf8'),
) as { title: string };

const industryUseCases = [
  { id: 'industry-erp', project: 'erp-production-release-0826', tasks: 19, dependencies: 15, bar: '.gantt-bar' },
  { id: 'industry-professional-services', project: 'psa-client-portfolio-q3-2026', tasks: 19, dependencies: 14, bar: '.gantt-bar' },
  { id: 'industry-construction', project: 'riverside-clinic-expansion-2026', tasks: 21, dependencies: 18, bar: '.gantt-bar' },
  { id: 'industry-manufacturing', project: 'manufacturing-valve-actuator-cell-2026', tasks: 21, dependencies: 17, bar: '.gantt-bar' },
  { id: 'industry-resource-planning', project: 'resource-portfolio-q4-2026', tasks: 22, dependencies: 23, bar: '.gantt-resource-load' },
  { id: 'industry-internal-tools', project: 'internal-release-48-readiness-2026', tasks: 22, dependencies: 22, bar: '.gantt-bar' },
] as const;

test(`${feature.title} mounts without browser errors`, async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('revo-grid').first()).toBeVisible({ timeout: 15_000 });
  const screenshot = await page.locator('body').screenshot({ animations: 'disabled' });
  expect(screenshot.byteLength).toBeGreaterThan(10_000);
  expect(errors).toEqual([]);
});

test('mounts the 10,000-task example from the multi-example host', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?example=big-data');
  const grid = page.locator('revo-grid');
  await expect(grid).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => grid.evaluate((element) => {
    const ganttGrid = element as HTMLRevoGridElement;
    return {
      tasks: ganttGrid.source?.length ?? 0,
      dependencies: ganttGrid.ganttDependencies?.length ?? 0,
    };
  }), { timeout: 20_000 }).toEqual({ tasks: 10_000, dependencies: 19_796 });
  await expect(grid.locator('.gantt-bar').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('mounts the twenty-year horizontal example from the multi-example host', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?example=horizontal-big-data');
  const grid = page.locator('revo-grid');
  await expect(grid).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => grid.evaluate((element) => {
    const ganttGrid = element as HTMLRevoGridElement;
    return {
      tasks: ganttGrid.source?.length ?? 0,
      dependencies: ganttGrid.ganttDependencies?.length ?? 0,
      zoomPreset: ganttGrid.gantt?.zoomPreset,
    };
  }), { timeout: 20_000 }).toEqual({
    tasks: 100,
    dependencies: 194,
    zoomPreset: 'month-quarter',
  });
  await expect(grid.locator('.gantt-bar').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('mounts the reproducible browser benchmark with a measurable readiness contract', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?example=benchmark&tasks=100&density=normal&span=quarter');
  await page.waitForFunction(() => Boolean(window.__GANTT_BENCHMARK__), undefined, { timeout: 20_000 });
  const readiness = await page.evaluate(() => window.__GANTT_BENCHMARK__!.readiness);
  expect(readiness.taskCount).toBe(100);
  expect(readiness.dependencyCount).toBe(198);
  expect(readiness.applyToInteractiveMs).toBeGreaterThan(0);
  expect(readiness.dom.taskBars).toBeGreaterThan(0);
  expect(readiness.dom.uniqueMountedRows).toBeLessThan(100);
  await expect(page.getByText('10,000 editable tasks and 19,796 dependencies in a live browser demo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Methodology & results' })).toHaveAttribute('href', 'https://rv-grid.com/benchmarks/gantt');
  expect(errors).toEqual([]);
});

for (const useCase of industryUseCases) {
  test(`${useCase.id} renders its polished Gantt without viewport artifacts`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`/?use-case=${useCase.id}`);
    const shell = page.locator('.industry-gantt-shell');
    const grid = page.locator('revo-grid').first();
    const visibleBar = page.locator(useCase.bar).first();
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(grid).toBeVisible({ timeout: 20_000 });
    await expect(visibleBar).toBeVisible({ timeout: 20_000 });

    await expect.poll(async () => grid.evaluate(async (element) => {
      const ganttGrid = element as HTMLRevoGridElement;
      const plugins = await ganttGrid.getPlugins();
      const ganttPlugin = plugins.find((plugin) => (
        typeof (plugin as { getProjectSnapshot?: unknown }).getProjectSnapshot === 'function'
      )) as { getProjectSnapshot?: () => { tasks?: unknown[]; dependencies?: unknown[] } } | undefined;
      const snapshot = ganttPlugin?.getProjectSnapshot?.();
      return {
        project: ganttGrid.gantt?.id,
        tasks: snapshot?.tasks?.length ?? ganttGrid.source?.length ?? 0,
        dependencies: snapshot?.dependencies?.length ?? ganttGrid.ganttDependencies?.length ?? 0,
      };
    }), { timeout: 20_000 }).toEqual({
      project: useCase.project,
      tasks: useCase.tasks,
      dependencies: useCase.dependencies,
    });

    const bounds = await page.evaluate(() => {
      const shellElement = document.querySelector<HTMLElement>('.industry-gantt-shell');
      const gridElement = document.querySelector<HTMLElement>('revo-grid');
      if (!shellElement || !gridElement) return null;
      const shellRect = shellElement.getBoundingClientRect();
      const gridRect = gridElement.getBoundingClientRect();
      return {
        bodyOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodyOverflowY: document.documentElement.scrollHeight - document.documentElement.clientHeight,
        gridInsideShell: gridRect.left >= shellRect.left
          && gridRect.right <= shellRect.right + 1
          && gridRect.top >= shellRect.top
          && gridRect.bottom <= shellRect.bottom + 1,
        gridWidth: Math.round(gridRect.width),
        gridHeight: Math.round(gridRect.height),
      };
    });
    expect(bounds).not.toBeNull();
    expect(bounds?.bodyOverflowX).toBe(0);
    expect(bounds?.bodyOverflowY).toBe(0);
    expect(bounds?.gridInsideShell).toBe(true);
    expect(bounds?.gridWidth).toBeGreaterThanOrEqual(1_190);
    expect(bounds?.gridHeight).toBeGreaterThanOrEqual(500);

    const baseline = page.getByRole('button', { name: 'Baseline', exact: true });
    const criticalPath = page.getByRole('button', { name: 'Critical path', exact: true });
    await baseline.click();
    await expect(baseline).toHaveAttribute('aria-pressed', 'true');
    await criticalPath.click();
    await expect(criticalPath).toHaveAttribute('aria-pressed', 'false');
    await expect(visibleBar).toBeVisible();
    expect(errors).toEqual([]);
  });
}
