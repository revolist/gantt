import { describe, expect, it } from 'vitest';
import {
  CONSTRUCTION_ASSIGNMENTS,
  CONSTRUCTION_BASELINES,
  CONSTRUCTION_CALENDARS,
  CONSTRUCTION_DEPENDENCIES,
  CONSTRUCTION_INDUSTRY_DEFINITION,
  CONSTRUCTION_RESOURCES,
  CONSTRUCTION_TASK_IDS,
  CONSTRUCTION_TASKS,
} from '../../../../src/use-cases/construction/construction.data';

describe('construction industry Gantt fixture', () => {
  it('models a stable clinic programme with site delivery context', () => {
    expect(CONSTRUCTION_TASKS.map(({ id }) => id)).toEqual(CONSTRUCTION_TASK_IDS);
    expect(new Set(CONSTRUCTION_TASK_IDS).size).toBe(CONSTRUCTION_TASK_IDS.length);
    expect(CONSTRUCTION_TASKS).toHaveLength(21);
    for (const task of CONSTRUCTION_TASKS) {
      expect(task).toEqual(expect.objectContaining({
        wbs: expect.any(String),
        site: expect.any(String),
        phase: expect.any(String),
        contractor: expect.any(String),
        crew: expect.any(String),
        inspection: expect.any(String),
        statusLabel: expect.any(String),
        startDate: expect.stringMatching(/^2026-(08|09|10|11)-/),
      }));
    }
    expect(CONSTRUCTION_TASKS.filter(({ type }) => type === 'milestone')).toHaveLength(5);
    expect(CONSTRUCTION_TASKS.map(({ phase }) => phase)).toEqual(expect.arrayContaining(['Foundations', 'Structure', 'Envelope', 'MEP', 'Commissioning', 'Handover']));
  });

  it('keeps hierarchy, dependencies, assignments, calendar, and full baseline references valid', () => {
    const tasks = new Set<string>(CONSTRUCTION_TASK_IDS);
    const calendars = new Set(CONSTRUCTION_CALENDARS.map(({ id }) => id));
    const resources = new Set(CONSTRUCTION_RESOURCES.map(({ id }) => id));
    for (const item of CONSTRUCTION_TASKS) {
      if (item.parentId) expect(tasks.has(item.parentId)).toBe(true);
      expect(calendars.has(item.calendarId!)).toBe(true);
    }
    expect(CONSTRUCTION_DEPENDENCIES.length).toBeGreaterThanOrEqual(12);
    for (const dependency of CONSTRUCTION_DEPENDENCIES) {
      expect(tasks.has(dependency.predecessorTaskId)).toBe(true);
      expect(tasks.has(dependency.successorTaskId)).toBe(true);
    }
    for (const assignment of CONSTRUCTION_ASSIGNMENTS) {
      expect(tasks.has(assignment.taskId)).toBe(true);
      expect(resources.has(assignment.resourceId)).toBe(true);
    }
    expect(new Set(CONSTRUCTION_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(CONSTRUCTION_INDUSTRY_DEFINITION).toMatchObject({
      grid: { theme: 'adaptiveMaterial', rowSize: 32, rowHeaders: true, cellBorders: true },
      gantt: { id: 'riverside-clinic-expansion-2026', visuals: { showDependencies: true, baselineId: 'construction-approved-2026', showCriticalPath: true } },
    });
  });

  it('uses compact rows, readable references, and no task-row drag affordance', () => {
    const [referenceColumn, taskColumn, tradeColumn] = CONSTRUCTION_INDUSTRY_DEFINITION.columns;

    expect(CONSTRUCTION_INDUSTRY_DEFINITION.columns).toHaveLength(3);
    expect(referenceColumn).toMatchObject({ prop: 'wbs', name: 'REF', size: 72 });
    expect(taskColumn).toMatchObject({ prop: 'name', name: 'Look-ahead activity', size: 204, rowDrag: false });
    expect(tradeColumn).toMatchObject({ prop: 'contractor', name: 'Trade', size: 84 });
    expect(CONSTRUCTION_INDUSTRY_DEFINITION.columns.reduce((total, { size = 0 }) => total + size, 0)).toBe(360);
  });

  it('connects the late switchgear receipt to electrical rough-in and downstream commissioning', () => {
    const switchgear = CONSTRUCTION_TASKS.find(({ id }) => id === 'switchgear-delivery')!;
    const baseline = CONSTRUCTION_BASELINES[0].tasks.find(({ taskId }) => taskId === switchgear.id)!;
    expect(switchgear).toMatchObject({ name: 'Switchgear delivery and inspection', workflowStatus: 'blocked', deadlineDate: '2026-10-12', supplier: 'Iberia Switchgear', risk: expect.stringContaining('commissioning float') });
    expect(switchgear.endDate! > baseline.endDate!).toBe(true);
    expect(CONSTRUCTION_DEPENDENCIES).toEqual(expect.arrayContaining([
      expect.objectContaining({ predecessorTaskId: 'switchgear-delivery', successorTaskId: 'electrical-rough-in', type: 'finish-to-start' }),
      expect.objectContaining({ predecessorTaskId: 'electrical-rough-in', successorTaskId: 'first-fix-inspection', type: 'finish-to-start' }),
      expect.objectContaining({ predecessorTaskId: 'first-fix-inspection', successorTaskId: 'systems-commissioning', type: 'finish-to-start' }),
    ]));
  });

  it('uses a site-control bar palette instead of the generic showcase colors', () => {
    const colorFor = (id: string) => {
      const task = CONSTRUCTION_TASKS.find((candidate) => candidate.id === id)!;
      return CONSTRUCTION_INDUSTRY_DEFINITION.taskBarColorHook!({
        row: { ...task, taskKind: task.type, workflowStatusKey: task.workflowStatus },
      } as Parameters<NonNullable<typeof CONSTRUCTION_INDUSTRY_DEFINITION.taskBarColorHook>>[0]);
    };
    expect(colorFor('clinic-expansion')).toMatchObject({ barColor: '#c83b26', textColor: '#fffaf0' });
    expect(colorFor('site-foundations')).toMatchObject({ barColor: '#343b40', progressColor: '#f26722' });
    expect(colorFor('concrete-foundations')).toMatchObject({ barColor: '#f26722', borderColor: '#9d3c17' });
    expect(colorFor('site-mobilisation')).toMatchObject({ barColor: '#8d958e', progressColor: '#3f534a' });
    expect(colorFor('structure-envelope')).toMatchObject({ barColor: '#343b40', progressColor: '#f26722' });
    expect(colorFor('foundation-inspection')).toMatchObject({ barColor: '#f0a12d', borderColor: '#8d551d' });
  });
});
