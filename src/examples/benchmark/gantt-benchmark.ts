import './gantt-benchmark.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { createGanttBenchmarkDataset, GANTT_BENCHMARK_SEED, ganttBenchmarkCalendars } from './gantt-benchmark-data';
import { median, percentile95, roundMetric } from './gantt-benchmark-math';
import {
  GANTT_BENCHMARK_DENSITIES,
  GANTT_BENCHMARK_TASK_COUNTS,
  GANTT_BENCHMARK_TIMELINE_SPANS,
  type GanttBenchmarkController,
  type GanttBenchmarkDensity,
  type GanttBenchmarkDomFootprint,
  type GanttBenchmarkOptions,
  type GanttBenchmarkTaskCount,
  type GanttBenchmarkTimelineSpan,
} from './gantt-benchmark.types';

defineCustomElements();

const DEFAULT_OPTIONS: GanttBenchmarkOptions = {
  taskCount: 1_000,
  density: 'normal',
  timelineSpan: 'quarter',
  seed: GANTT_BENCHMARK_SEED,
};

export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  document.title = 'RevoGrid Gantt Browser Benchmark';
  const initialOptions = optionsFromSearch(window.location.search);
  const root = document.createElement('section');
  root.className = 'gantt-benchmark';
  root.innerHTML = benchmarkMarkup(initialOptions);
  parent.appendChild(root);

  const stage = root.querySelector<HTMLElement>('[data-benchmark-stage]')!;
  const status = root.querySelector<HTMLElement>('[data-benchmark-status]')!;
  const results = root.querySelector<HTMLElement>('[data-benchmark-results]')!;
  const form = root.querySelector<HTMLFormElement>('form')!;
  let controller: GanttBenchmarkController | undefined;

  const mount = (options: GanttBenchmarkOptions) => {
    controller?.destroy();
    status.textContent = 'Generating deterministic project…';
    results.hidden = true;
    const next = createBenchmarkController(stage, options, status);
    controller = next;
    window.__GANTT_BENCHMARK__ = next;
    void next.readiness.then((readiness) => {
      results.hidden = false;
      results.innerHTML = `
        <div><span>Apply → interactive</span><strong>${readiness.applyToInteractiveMs.toFixed(1)} ms</strong></div>
        <div><span>Navigation → interactive</span><strong>${readiness.navigationToInteractiveMs.toFixed(1)} ms</strong></div>
        <div><span>Dataset generation</span><strong>${readiness.datasetGenerationMs.toFixed(1)} ms</strong></div>
        <div><span>Mounted DOM</span><strong>${readiness.dom.totalNodes.toLocaleString('en-US')} nodes</strong></div>
      `;
      status.textContent = `${readiness.taskCount.toLocaleString('en-US')} tasks · ${readiness.dependencyCount.toLocaleString('en-US')} dependencies · interactive`;
    }).catch((error) => {
      status.textContent = error instanceof Error ? error.message : String(error);
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const options = {
      taskCount: Number(data.get('tasks')) as GanttBenchmarkTaskCount,
      density: String(data.get('density')) as GanttBenchmarkDensity,
      timelineSpan: String(data.get('span')) as GanttBenchmarkTimelineSpan,
      seed: GANTT_BENCHMARK_SEED,
    } satisfies GanttBenchmarkOptions;
    const url = new URL(window.location.href);
    url.searchParams.set('example', 'benchmark');
    url.searchParams.set('tasks', String(options.taskCount));
    url.searchParams.set('density', options.density);
    url.searchParams.set('span', options.timelineSpan);
    history.replaceState(null, '', url);
    mount(options);
  });

  mount(initialOptions);

  return () => {
    controller?.destroy();
    delete window.__GANTT_BENCHMARK__;
    root.remove();
  };
}

export function optionsFromSearch(search: string): GanttBenchmarkOptions {
  const params = new URLSearchParams(search);
  const taskCount = Number(params.get('tasks'));
  const density = params.get('density');
  const timelineSpan = params.get('span');
  return {
    taskCount: GANTT_BENCHMARK_TASK_COUNTS.includes(taskCount as GanttBenchmarkTaskCount)
      ? taskCount as GanttBenchmarkTaskCount
      : DEFAULT_OPTIONS.taskCount,
    density: GANTT_BENCHMARK_DENSITIES.includes(density as GanttBenchmarkDensity)
      ? density as GanttBenchmarkDensity
      : DEFAULT_OPTIONS.density,
    timelineSpan: GANTT_BENCHMARK_TIMELINE_SPANS.includes(timelineSpan as GanttBenchmarkTimelineSpan)
      ? timelineSpan as GanttBenchmarkTimelineSpan
      : DEFAULT_OPTIONS.timelineSpan,
    seed: GANTT_BENCHMARK_SEED,
  };
}

function createBenchmarkController(
  stage: HTMLElement,
  options: GanttBenchmarkOptions,
  status: HTMLElement,
): GanttBenchmarkController {
  const generationStartedAt = performance.now();
  const dataset = createGanttBenchmarkDataset(options);
  const datasetGenerationMs = performance.now() - generationStartedAt;
  const grid = document.createElement('revo-grid');
  grid.className = 'gantt-benchmark__grid';
  grid.hideAttribution = true;
  grid.theme = currentTheme().isDark() ? 'darkCompact' : 'compact';
  grid.plugins = [GanttPlugin];
  grid.columns = [createDefaultTaskTableColumn('name')];
  stage.replaceChildren(grid);
  const disconnectTheme = observeCurrentTheme((isDark) => {
    grid.theme = isDark ? 'darkCompact' : 'compact';
  });

  const applyStartedAt = performance.now();
  const firstRender = once(grid, 'aftergridrender');
  grid.gantt = dataset.config;
  grid.ganttCalendars = ganttBenchmarkCalendars;
  grid.ganttDependencies = dataset.dependencies;
  grid.source = dataset.tasks;

  const waitForPaint = async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  };

  const readiness = (async () => {
    await firstRender;
    await waitForCondition(async () => {
      const plugins = await grid.getPlugins();
      const plugin = plugins.find((candidate) => typeof (candidate as { getProjectSnapshot?: unknown }).getProjectSnapshot === 'function') as { getProjectSnapshot?: () => { tasks?: unknown[]; dependencies?: unknown[] } } | undefined;
      const snapshot = plugin?.getProjectSnapshot?.();
      const bar = [...grid.querySelectorAll<HTMLElement>('.gantt-bar--task[data-gantt-task-id]')]
        .find((candidate) => intersectsViewport(candidate.getBoundingClientRect()));
      const timeline = grid.querySelector<HTMLElement>('revogr-viewport-scroll.colPinEnd');
      if (!snapshot || snapshot.tasks?.length !== dataset.tasks.length || snapshot.dependencies?.length !== dataset.dependencies.length || !bar || !timeline) return false;
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(window.innerWidth - 1, rect.left + Math.min(rect.width / 2, 8)));
      const y = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
      return rect.width > 0 && rect.height > 0 && document.elementFromPoint(x, y) !== null;
    }, 30_000);
    await waitForPaint();
    const visibleTask = getVisibleTask(grid);
    if (!visibleTask) throw new Error('Benchmark rendered without a measurable task bar.');
    return {
      navigationToInteractiveMs: performance.now(),
      datasetGenerationMs,
      applyToInteractiveMs: performance.now() - applyStartedAt,
      taskCount: dataset.tasks.length,
      dependencyCount: dataset.dependencies.length,
      visibleTaskId: visibleTask.id,
      dom: getDomFootprint(grid),
    };
  })();

  const controller: GanttBenchmarkController = {
    options,
    readiness,
    getGrid: () => grid,
    getDomFootprint: () => getDomFootprint(grid),
    getVisibleTask: () => getVisibleTask(grid),
    waitForPaint,
    async measureScroll(axis, durationMs = 1_200) {
      await readiness;
      const scroll = grid.querySelector<HTMLElement>(axis === 'vertical'
        ? 'revogr-viewport-scroll.rgCol .vertical-inner'
        : 'revogr-viewport-scroll.colPinEnd');
      if (!scroll) throw new Error(`Unable to locate ${axis} Gantt viewport.`);
      const longTasks: number[] = [];
      const observer = typeof PerformanceObserver !== 'undefined'
        ? new PerformanceObserver((list) => list.getEntries().forEach((entry) => longTasks.push(entry.duration)))
        : null;
      try { observer?.observe({ type: 'longtask', buffered: true }); } catch { /* unsupported browser */ }
      const frameTimes: number[] = [];
      const startedAt = performance.now();
      let previous = startedAt;
      let frameCount = 0;
      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          const elapsed = now - startedAt;
          frameTimes.push(now - previous);
          previous = now;
          frameCount += 1;
          const progress = Math.min(1, elapsed / durationMs);
          if (axis === 'vertical') scroll.scrollTop = progress * Math.max(0, scroll.scrollHeight - scroll.clientHeight);
          else if (typeof (scroll as HTMLElement & { setScroll?: (event: { dimension: 'rgCol'; coordinate: number }) => Promise<void> }).setScroll === 'function') {
            void (scroll as HTMLElement & { setScroll: (event: { dimension: 'rgCol'; coordinate: number }) => Promise<void> }).setScroll({ dimension: 'rgCol', coordinate: progress * Math.max(0, scroll.scrollWidth - scroll.clientWidth) });
          } else scroll.scrollLeft = progress * Math.max(0, scroll.scrollWidth - scroll.clientWidth);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      observer?.disconnect();
      const rawFps = frameCount / (durationMs / 1_000);
      return {
        axis,
        durationMs,
        rawFps: roundMetric(rawFps),
        displayCappedFps: roundMetric(Math.min(60, rawFps)),
        frameCount,
        droppedFrames: frameTimes.filter((duration) => duration > 20).length,
        frameTimeMedianMs: roundMetric(median(frameTimes)),
        frameTimeP95Ms: roundMetric(percentile95(frameTimes)),
        longTaskCount: longTasks.length,
        longTaskTotalMs: roundMetric(longTasks.reduce((sum, duration) => sum + duration, 0)),
        longTaskMaxMs: roundMetric(Math.max(0, ...longTasks)),
      };
    },
    async measureDependencyUpdate() {
      await readiness;
      const dependency = dataset.dependencies[0];
      if (!dependency) throw new Error('Dependency benchmark requires at least one dependency.');
      const next = dataset.dependencies.map((entry, index) => index === 0 ? { ...entry, lagDays: entry.lagDays === 0 ? 1 : 0 } : entry);
      const render = once(grid, 'aftergridrender');
      const startedAt = performance.now();
      grid.ganttDependencies = next;
      await render;
      await waitForPaint();
      dataset.dependencies.splice(0, dataset.dependencies.length, ...next);
      return {
        latencyMs: roundMetric(performance.now() - startedAt),
        dependencyCount: next.length,
        affectedTaskId: dependency.successorTaskId,
      };
    },
    async measureHierarchyProjection() {
      await readiness;
      const plugins = await grid.getPlugins();
      const tree = plugins.find((candidate) => typeof (candidate as { collapseAll?: unknown }).collapseAll === 'function' && typeof (candidate as { expandAll?: unknown }).expandAll === 'function') as {
        collapseAll: () => void;
        expandAll: () => void;
        getExpandedRowIds: () => Set<string>;
      } | undefined;
      if (!tree) throw new Error('Unable to locate TreeDataPlugin for hierarchy benchmark.');
      const expandedRows = dataset.tasks.length;
      let startedAt = performance.now();
      tree.collapseAll();
      await waitForCondition(() => tree.getExpandedRowIds().size === 0, 10_000);
      await waitForPaint();
      const collapseMs = performance.now() - startedAt;
      const collapsedRows = dataset.summaryTaskIds.length;
      startedAt = performance.now();
      tree.expandAll();
      await waitForCondition(() => tree.getExpandedRowIds().size === dataset.summaryTaskIds.length, 10_000);
      await waitForPaint();
      return {
        collapseMs: roundMetric(collapseMs),
        expandMs: roundMetric(performance.now() - startedAt),
        expandedRows,
        collapsedRows,
      };
    },
    async sampleHeap(count = 5) {
      const values: Array<number | null> = [];
      for (let index = 0; index < count; index += 1) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        values.push(memory?.usedJSHeapSize ?? null);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return values;
    },
    destroy() {
      disconnectTheme();
      grid.remove();
      status.textContent = 'Benchmark stopped';
    },
  };
  return controller;
}

function benchmarkMarkup(options: GanttBenchmarkOptions): string {
  const taskOptions = GANTT_BENCHMARK_TASK_COUNTS.map((count) => `<option value="${count}" ${count === options.taskCount ? 'selected' : ''}>${count.toLocaleString('en-US')}</option>`).join('');
  const densityOptions = GANTT_BENCHMARK_DENSITIES.map((density) => `<option value="${density}" ${density === options.density ? 'selected' : ''}>${density[0].toUpperCase()}${density.slice(1)}</option>`).join('');
  const spanOptions = GANTT_BENCHMARK_TIMELINE_SPANS.map((span) => `<option value="${span}" ${span === options.timelineSpan ? 'selected' : ''}>${span === 'quarter' ? 'Three months' : 'Twenty years'}</option>`).join('');
  return `
    <header class="gantt-benchmark__header">
      <div><span class="gantt-benchmark__eyebrow">Reproducible browser benchmark</span><h1>RevoGrid Gantt at measurable scale</h1><p><a href="?example=big-data">10,000 editable tasks and 19,796 dependencies in a live browser demo</a></p></div>
      <a class="gantt-benchmark__raw" href="./benchmarks/latest.json">Raw JSON</a>
    </header>
    <form class="gantt-benchmark__controls">
      <label>Tasks<select name="tasks">${taskOptions}</select></label>
      <label>Dependencies<select name="density">${densityOptions}</select></label>
      <label>Timeline<select name="span">${spanOptions}</select></label>
      <button type="submit">Run workload</button>
    </form>
    <div class="gantt-benchmark__status" data-benchmark-status role="status">Preparing benchmark…</div>
    <div class="gantt-benchmark__results" data-benchmark-results hidden></div>
    <div class="gantt-benchmark__stage" data-benchmark-stage></div>
    <footer>Reference results use a fixed MacBook Pro and exact Chromium build. Live values vary by device and are not a cross-vendor comparison.</footer>
  `;
}

function getDomFootprint(grid: HTMLElement): GanttBenchmarkDomFootprint {
  return {
    totalNodes: document.querySelectorAll('*').length,
    mountedRowElements: grid.querySelectorAll('.rgRow').length,
    uniqueMountedRows: uniqueMountedRows(grid),
    mountedCells: grid.querySelectorAll('.rgCell, [data-rgcol]').length,
    taskBars: grid.querySelectorAll('.gantt-bar').length,
    dependencyElements: grid.querySelectorAll('.gantt-dependency').length,
  };
}

function uniqueMountedRows(grid: HTMLElement): number {
  return new Set([...grid.querySelectorAll<HTMLElement>('[data-rgrow]')].map((row) => row.dataset.rgrow).filter(Boolean)).size;
}

function getVisibleTask(grid: HTMLRevoGridElement): { id: string; startDate?: string; endDate?: string } | null {
  const bar = [...grid.querySelectorAll<HTMLElement>('.gantt-bar--task[data-gantt-task-id]')]
    .find((candidate) => intersectsViewport(candidate.getBoundingClientRect()));
  const id = bar?.dataset.ganttTaskId;
  if (!id) return null;
  const source = grid.source?.find((task) => task.id === id) as { id: string; startDate?: string; endDate?: string } | undefined;
  return source ?? { id };
}

function intersectsViewport(rect: DOMRect): boolean {
  return rect.width > 0
    && rect.height > 0
    && rect.right > 0
    && rect.bottom > 0
    && rect.left < window.innerWidth
    && rect.top < window.innerHeight;
}

function once(target: EventTarget, eventName: string): Promise<Event> {
  return new Promise((resolve) => target.addEventListener(eventName, resolve, { once: true }));
}

async function waitForCondition(check: () => boolean | Promise<boolean>, timeoutMs: number): Promise<void> {
  const startedAt = performance.now();
  while (!(await check())) {
    if (performance.now() - startedAt > timeoutMs) throw new Error('Timed out waiting for Gantt benchmark readiness.');
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
