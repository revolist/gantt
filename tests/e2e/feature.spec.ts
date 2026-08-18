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
  const grid = page.locator('revo-grid').first();
  await expect(grid).toBeVisible({ timeout: 15_000 });
  await expect(grid.locator('.gantt-bar').first()).toBeVisible({ timeout: 15_000 });
  const criticalPath = page.getByRole('checkbox', { name: 'Critical path' });
  const baselines = page.getByRole('checkbox', { name: 'Baselines' });
  await expect(criticalPath).toBeVisible();
  await expect(baselines).toBeVisible();
  await baselines.check();
  await expect(baselines).toBeChecked();
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
  expect(errors).toEqual([]);
});

test('Construction + Fabrication Operations drills into Riverbank and retains Look-Ahead edits', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?use-case=industry-construction-fabrication');
  const shell = page.locator('.construction-fabrication');
  await expect(shell).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Riverbank Apartments', exact: true }).first()).toBeVisible();
  await expect.poll(async () => page.locator('revo-grid').evaluate((element) => (element as HTMLRevoGridElement).source?.filter((row: any) => String(row.id).startsWith('project:')).length)).toBe(3);
  const riverbankCell = page.getByRole('gridcell', { name: /Riverbank Apartments/ }).first();
  await expect(riverbankCell.locator('[data-folder-state]')).toHaveAttribute('data-folder-state', 'open');
  await riverbankCell.locator('.tree-toggle').click();
  await expect(riverbankCell.locator('[data-folder-state]')).toHaveAttribute('data-folder-state', 'closed');
  await riverbankCell.locator('.tree-toggle').click();
  await expect(riverbankCell.locator('[data-folder-state]')).toHaveAttribute('data-folder-state', 'open');
  await page.getByRole('button', { name: 'Riverbank Apartments', exact: true }).first().click();
  const projectGrid = page.locator('revo-grid');
  await expect(page.locator('.construction-fabrication__header')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Days', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => projectGrid.evaluate((element) => (element as HTMLRevoGridElement).gantt?.zoomPreset)).toBe('day-week');
  await expect.poll(async () => projectGrid.evaluate((element) => ({
    fabrication: (element as HTMLRevoGridElement).source?.some((row: any) => row.name === 'Fabrication'),
    installation: (element as HTMLRevoGridElement).source?.some((row: any) => row.name === 'Installation'),
  }))).toEqual({ fabrication: true, installation: true });
  await page.getByRole('button', { name: 'Weeks', exact: true }).click();
  await expect.poll(async () => page.locator('revo-grid').evaluate((element) => (element as HTMLRevoGridElement).gantt?.zoomPreset)).toBe('week-month');
  await page.getByRole('button', { name: 'Days', exact: true }).click();
  await page.getByRole('button', { name: 'Open 2-week Look-Ahead', exact: true }).click();
  await expect(page.getByText('17 Aug 2026 – 30 Aug 2026')).toBeVisible();
  await page.getByRole('button', { name: 'Installation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Installation', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const lookAheadGrid = page.locator('revo-grid');
  await lookAheadGrid.evaluate(async (element) => {
    const grid = element as HTMLRevoGridElement;
    const plugins = await grid.getPlugins();
    const gantt = plugins.find((plugin: any) => typeof plugin.updateTask === 'function') as any;
    await gantt.updateTask('task:2801:lookahead:3', { endDate: '2026-09-02', percentDone: 58 });
  });
  await page.getByRole('button', { name: 'Riverbank Apartments', exact: true }).first().click();
  await expect.poll(async () => page.locator('revo-grid').evaluate((element) => (element as HTMLRevoGridElement).source?.find((row: any) => row.id === 'task:2801:lookahead:3')?.endDate)).toBe('2026-09-02');
  const viewport = await shell.evaluate((element) => ({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, gridFits: (() => { const grid = element.querySelector('revo-grid')!.getBoundingClientRect(); const frame = element.getBoundingClientRect(); return grid.left >= frame.left && grid.right <= frame.right + 1; })() }));
  expect(viewport).toEqual({ overflowX: 0, gridFits: true }); expect(errors).toEqual([]);
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
