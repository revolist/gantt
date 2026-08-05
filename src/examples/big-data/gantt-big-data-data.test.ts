import { describe, expect, it } from 'vitest';
import {
  createGanttBigDataSet,
  GANTT_BIG_DATA_DEPENDENCY_COUNT,
  GANTT_BIG_DATA_PROJECT_END,
  GANTT_BIG_DATA_PROJECT_START,
  GANTT_BIG_DATA_TASK_COUNT,
} from './gantt-big-data-data';

describe('Gantt big-data fixture', () => {
  it('creates exact, dependency-safe data inside the three-month range', () => {
    const { tasks, dependencies } = createGanttBigDataSet();
    const taskIds = new Set(tasks.map((task) => task.id));
    const dependencyIds = new Set(dependencies.map((dependency) => dependency.id));
    const dependencyRelationships = new Set(dependencies.map((dependency) => [
      dependency.predecessorTaskId,
      dependency.successorTaskId,
      dependency.type,
      dependency.lagDays ?? 0,
    ].join('|')));

    expect(tasks).toHaveLength(GANTT_BIG_DATA_TASK_COUNT);
    expect(dependencies).toHaveLength(GANTT_BIG_DATA_DEPENDENCY_COUNT);
    expect(taskIds.size).toBe(GANTT_BIG_DATA_TASK_COUNT);
    expect(dependencyIds.size).toBe(GANTT_BIG_DATA_DEPENDENCY_COUNT);
    expect(dependencyRelationships.size).toBe(GANTT_BIG_DATA_DEPENDENCY_COUNT);
    expect(tasks.reduce((minimum, task) => task.startDate < minimum ? task.startDate : minimum, tasks[0]!.startDate))
      .toBe(GANTT_BIG_DATA_PROJECT_START);
    expect(tasks.reduce((maximum, task) => task.endDate! > maximum ? task.endDate! : maximum, tasks[0]!.endDate!))
      .toBe(GANTT_BIG_DATA_PROJECT_END);

    for (const task of tasks) {
      expect(task.startDate >= GANTT_BIG_DATA_PROJECT_START).toBe(true);
      expect(task.endDate).toBeDefined();
      expect(task.endDate! <= GANTT_BIG_DATA_PROJECT_END).toBe(true);
      expect(task.startDate <= task.endDate!).toBe(true);
    }
    for (const dependency of dependencies) {
      expect(taskIds.has(dependency.predecessorTaskId)).toBe(true);
      expect(taskIds.has(dependency.successorTaskId)).toBe(true);
    }
  });
});
