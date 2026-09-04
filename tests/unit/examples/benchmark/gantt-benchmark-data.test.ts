import { describe, expect, it } from 'vitest';
import { createGanttBenchmarkDataset, dependencyTarget, GANTT_BENCHMARK_GROUP_SIZE, GANTT_BENCHMARK_SEED } from '../../../../src/examples/benchmark/gantt-benchmark-data';
import { GANTT_BENCHMARK_DENSITIES, GANTT_BENCHMARK_TASK_COUNTS, type GanttBenchmarkOptions } from '../../../../src/examples/benchmark/gantt-benchmark.types';

const options = (taskCount: GanttBenchmarkOptions['taskCount'], density: GanttBenchmarkOptions['density'], timelineSpan: GanttBenchmarkOptions['timelineSpan'] = 'quarter'): GanttBenchmarkOptions => ({ taskCount, density, timelineSpan, seed: GANTT_BENCHMARK_SEED });

describe('Gantt benchmark dataset', () => {
  it('is deterministic and preserves exact tasks, hierarchy, and dependency targets', () => {
    for (const taskCount of GANTT_BENCHMARK_TASK_COUNTS) {
      for (const density of GANTT_BENCHMARK_DENSITIES) {
        const first = createGanttBenchmarkDataset(options(taskCount, density));
        const second = createGanttBenchmarkDataset(options(taskCount, density));
        expect(second).toEqual(first);
        expect(first.tasks).toHaveLength(taskCount);
        expect(first.dependencies).toHaveLength(dependencyTarget(taskCount, density));
        expect(first.summaryTaskIds).toHaveLength(Math.ceil(taskCount / GANTT_BENCHMARK_GROUP_SIZE));
        expect(first.summaryTaskIds.length + first.leafTaskIds.length).toBe(taskCount);
      }
    }
  });

  it('creates exactly 19,796 normal dependencies for 10,000 tasks', () => {
    expect(createGanttBenchmarkDataset(options(10_000, 'normal')).dependencies).toHaveLength(19_796);
  });

  it('uses unique acyclic leaf-only dependency endpoints', () => {
    const dataset = createGanttBenchmarkDataset(options(1_000, 'high'));
    const leafIndex = new Map(dataset.leafTaskIds.map((id, index) => [id, index]));
    const ids = new Set<string>();
    const pairs = new Set<string>();
    for (const dependency of dataset.dependencies) {
      expect(ids.has(dependency.id)).toBe(false);
      ids.add(dependency.id);
      const pair = `${dependency.predecessorTaskId}->${dependency.successorTaskId}`;
      expect(pairs.has(pair)).toBe(false);
      pairs.add(pair);
      expect(leafIndex.has(dependency.predecessorTaskId)).toBe(true);
      expect(leafIndex.has(dependency.successorTaskId)).toBe(true);
      expect(leafIndex.get(dependency.predecessorTaskId)!).toBeLessThan(leafIndex.get(dependency.successorTaskId)!);
    }
  });

  it('keeps every generated task inside the selected timeline', () => {
    for (const timelineSpan of ['quarter', 'twenty-year'] as const) {
      const dataset = createGanttBenchmarkDataset(options(100, 'normal', timelineSpan));
      for (const task of dataset.tasks) {
        expect(String(task.startDate) >= dataset.projectStart).toBe(true);
        expect(String(task.endDate) <= dataset.projectEnd).toBe(true);
      }
    }
  });
});
