import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const feature = JSON.parse(
  readFileSync(new URL('../../feature.json', import.meta.url), 'utf8'),
) as { title: string };

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
