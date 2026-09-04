import { describe, expect, it } from 'vitest';
import {
  createGanttHorizontalBigDataSet,
  GANTT_HORIZONTAL_BIG_DATA_DEPENDENCY_COUNT,
  GANTT_HORIZONTAL_BIG_DATA_PROJECT_END,
  GANTT_HORIZONTAL_BIG_DATA_PROJECT_START,
  GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT,
  ganttHorizontalBigDataConfig,
} from '../../../../src/examples/horizontal-big-data/gantt-horizontal-big-data-data';

describe('Gantt horizontal big-data fixture', () => {
  it('creates exact, dependency-safe data across twenty calendar years', () => {
    const { tasks, dependencies } = createGanttHorizontalBigDataSet();
    const taskIndexById = new Map(tasks.map((task, index) => [task.id, index]));
    const dependencyIds = new Set(dependencies.map((dependency) => dependency.id));
    const dependencyRelationships = new Set(dependencies.map((dependency) => [
      dependency.predecessorTaskId,
      dependency.successorTaskId,
      dependency.type,
      dependency.lagDays ?? 0,
    ].join('|')));

    expect(tasks).toHaveLength(GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT);
    expect(dependencies).toHaveLength(GANTT_HORIZONTAL_BIG_DATA_DEPENDENCY_COUNT);
    expect(taskIndexById.size).toBe(GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT);
    expect(dependencyIds.size).toBe(GANTT_HORIZONTAL_BIG_DATA_DEPENDENCY_COUNT);
    expect(dependencyRelationships.size).toBe(GANTT_HORIZONTAL_BIG_DATA_DEPENDENCY_COUNT);
    expect(tasks[0]?.startDate).toBe(GANTT_HORIZONTAL_BIG_DATA_PROJECT_START);
    expect(tasks.at(-1)?.endDate).toBe(GANTT_HORIZONTAL_BIG_DATA_PROJECT_END);
    expect(ganttHorizontalBigDataConfig.zoomPreset).toBe('month-quarter');

    for (const task of tasks) {
      expect(task.startDate >= GANTT_HORIZONTAL_BIG_DATA_PROJECT_START).toBe(true);
      expect(task.endDate).toBeDefined();
      expect(task.endDate! <= GANTT_HORIZONTAL_BIG_DATA_PROJECT_END).toBe(true);
      expect(task.startDate <= task.endDate!).toBe(true);
    }
    for (const dependency of dependencies) {
      const predecessorIndex = taskIndexById.get(dependency.predecessorTaskId);
      const successorIndex = taskIndexById.get(dependency.successorTaskId);
      expect(predecessorIndex).toBeDefined();
      expect(successorIndex).toBeDefined();
      expect(predecessorIndex!).toBeLessThan(successorIndex!);
    }
  });

  it('spreads task starts across every project year and preserves leap-day arithmetic', () => {
    const { tasks } = createGanttHorizontalBigDataSet();
    const years = new Set(tasks.map((task) => task.startDate.slice(0, 4)));
    const inclusiveProjectDays = Math.round(
      (Date.parse(`${GANTT_HORIZONTAL_BIG_DATA_PROJECT_END}T00:00:00Z`)
        - Date.parse(`${GANTT_HORIZONTAL_BIG_DATA_PROJECT_START}T00:00:00Z`))
      / (24 * 60 * 60 * 1_000),
    ) + 1;

    expect(years).toEqual(new Set(Array.from(
      { length: 20 },
      (_, index) => String(2026 + index),
    )));
    expect(inclusiveProjectDays).toBe(7_305);
    for (const leapYear of [2028, 2032, 2036, 2040, 2044]) {
      expect(new Date(Date.parse(`${leapYear}-02-28T00:00:00Z`) + 24 * 60 * 60 * 1_000)
        .toISOString()
        .slice(0, 10)).toBe(`${leapYear}-02-29`);
    }
  });
});
