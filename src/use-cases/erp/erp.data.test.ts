import { describe, expect, it } from 'vitest';
import { ERP_ASSIGNMENTS, ERP_BASELINES, ERP_CALENDARS, ERP_DEPENDENCIES, ERP_INDUSTRY_DEFINITION, ERP_RESOURCES, ERP_TASK_IDS, ERP_TASKS } from './erp.data';

describe('ERP industry Gantt fixture', () => {
  it('keeps stable, unique production task ids and required business fields', () => {
    expect(ERP_TASKS.map(({ id }) => id)).toEqual(ERP_TASK_IDS);
    expect(new Set(ERP_TASK_IDS).size).toBe(ERP_TASK_IDS.length);
    expect(ERP_TASKS).toHaveLength(19);
    for (const task of ERP_TASKS) {
      expect(task).toEqual(expect.objectContaining({ orderNumber: expect.any(String), customer: expect.any(String), site: expect.any(String), workCenter: expect.any(String), statusLabel: expect.any(String), startDate: expect.stringMatching(/^2026-/) }));
    }
    expect(ERP_TASKS.some(({ type }) => type === 'milestone')).toBe(true);
    expect(ERP_TASKS.some(({ workflowStatus, risk }) => workflowStatus === 'blocked' && Boolean(risk))).toBe(true);
  });

  it('keeps hierarchy, dependency, calendar, resource, assignment, and baseline references valid', () => {
    const tasks = new Set<string>(ERP_TASK_IDS); const calendars = new Set(ERP_CALENDARS.map(({ id }) => id)); const resources = new Set(ERP_RESOURCES.map(({ id }) => id));
    for (const task of ERP_TASKS) { if (task.parentId) expect(tasks.has(task.parentId)).toBe(true); expect(calendars.has(task.calendarId!)).toBe(true); }
    for (const dependency of ERP_DEPENDENCIES) { expect(tasks.has(dependency.predecessorTaskId)).toBe(true); expect(tasks.has(dependency.successorTaskId)).toBe(true); }
    for (const assignment of ERP_ASSIGNMENTS) { expect(tasks.has(assignment.taskId)).toBe(true); expect(resources.has(assignment.resourceId)).toBe(true); }
    expect(new Set(ERP_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(ERP_INDUSTRY_DEFINITION.gantt.visuals).toMatchObject({ showDependencies: true, baselineId: 'erp-approved', showCriticalPath: true });
  });

  it('presents ERP as a production cockpit with operational metrics', () => {
    expect(ERP_INDUSTRY_DEFINITION).toMatchObject({
      title: 'Production cockpit',
      scheduleLabel: 'Work-center plan · Release REL-0826',
      riskLegendLabel: 'Supplier hold',
      grid: { theme: 'adaptiveCompact', rowSize: 30, rowHeaders: true, cellBorders: true },
      metrics: [
        { label: 'Open WOs', value: '2' },
        { label: 'Plan attainment', value: '93%', tone: 'positive' },
        { label: 'Material holds', value: '1', tone: 'danger' },
        { label: 'OTIF commit', value: '30 Sep', tone: 'warning' },
      ],
    });
  });

  it('keeps full work-order references and compact state pills inside the table width', () => {
    expect(ERP_INDUSTRY_DEFINITION.columns.map(({ size }) => size)).toEqual([103, 184, 87]);
    expect(ERP_INDUSTRY_DEFINITION.columns.reduce((total, { size = 0 }) => total + size, 0)).toBe(374);
    expect(ERP_INDUSTRY_DEFINITION.columns[0].cellTemplate).toBeTypeOf('function');
    expect(ERP_INDUSTRY_DEFINITION.columns[2].cellTemplate).toBeTypeOf('function');
  });
});
