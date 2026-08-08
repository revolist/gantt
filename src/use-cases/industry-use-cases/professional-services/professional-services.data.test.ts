import { describe, expect, it } from 'vitest';
import {
  PROFESSIONAL_SERVICES_ASSIGNMENTS,
  PROFESSIONAL_SERVICES_BASELINES,
  PROFESSIONAL_SERVICES_CALENDARS,
  PROFESSIONAL_SERVICES_DEPENDENCIES,
  PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION,
  PROFESSIONAL_SERVICES_RESOURCES,
  PROFESSIONAL_SERVICES_TASK_IDS,
  PROFESSIONAL_SERVICES_TASKS,
} from './professional-services.data';

describe('professional-services industry Gantt fixture', () => {
  it('models a stable client portfolio with commercial and delivery context', () => {
    expect(PROFESSIONAL_SERVICES_TASKS.map(({ id }) => id)).toEqual(PROFESSIONAL_SERVICES_TASK_IDS);
    expect(new Set(PROFESSIONAL_SERVICES_TASK_IDS).size).toBe(PROFESSIONAL_SERVICES_TASK_IDS.length);
    expect(PROFESSIONAL_SERVICES_TASKS).toHaveLength(19);
    for (const task of PROFESSIONAL_SERVICES_TASKS) {
      expect(task).toEqual(expect.objectContaining({
        clientName: expect.any(String),
        commercialModel: expect.any(String),
        projectCode: expect.any(String),
        phase: expect.any(String),
        owner: expect.any(String),
        budgetBurn: expect.stringMatching(/%$/),
        grossMargin: expect.stringMatching(/%$/),
        statusLabel: expect.any(String),
        startDate: expect.stringMatching(/^2026-(08|09|10)-/),
      }));
    }
    expect(PROFESSIONAL_SERVICES_TASKS.some(({ type }) => type === 'milestone')).toBe(true);
    expect(PROFESSIONAL_SERVICES_TASKS.map(({ phase }) => phase)).toEqual(expect.arrayContaining(['Discovery', 'Design', 'Build', 'UAT', 'Go-live']));
    expect(PROFESSIONAL_SERVICES_TASKS.find(({ id }) => id === 'orion-uat-readiness')).toMatchObject({ name: 'UAT readiness workshop', workflowStatus: 'blocked', risk: expect.stringContaining('double-booked') });
  });

  it('keeps hierarchy, dependency, calendar, assignment, and full baseline references valid', () => {
    const tasks = new Set<string>(PROFESSIONAL_SERVICES_TASK_IDS);
    const calendars = new Set(PROFESSIONAL_SERVICES_CALENDARS.map(({ id }) => id));
    const resources = new Set(PROFESSIONAL_SERVICES_RESOURCES.map(({ id }) => id));
    for (const task of PROFESSIONAL_SERVICES_TASKS) {
      if (task.parentId) expect(tasks.has(task.parentId)).toBe(true);
      expect(calendars.has(task.calendarId!)).toBe(true);
    }
    expect(PROFESSIONAL_SERVICES_DEPENDENCIES.length).toBeGreaterThanOrEqual(10);
    for (const dependency of PROFESSIONAL_SERVICES_DEPENDENCIES) {
      expect(tasks.has(dependency.predecessorTaskId)).toBe(true);
      expect(tasks.has(dependency.successorTaskId)).toBe(true);
    }
    for (const assignment of PROFESSIONAL_SERVICES_ASSIGNMENTS) {
      expect(tasks.has(assignment.taskId)).toBe(true);
      expect(resources.has(assignment.resourceId)).toBe(true);
    }
    expect(new Set(PROFESSIONAL_SERVICES_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.gantt).toMatchObject({ id: 'psa-client-portfolio-q3-2026', visuals: { showDependencies: true, baselineId: 'psa-approved-q3', showCriticalPath: true } });
  });

  it('shows the senior consultant capacity conflict across both client engagements', () => {
    const amelia = PROFESSIONAL_SERVICES_RESOURCES.find(({ name }) => name === 'Amelia Grant');
    const assignedTaskIds = PROFESSIONAL_SERVICES_ASSIGNMENTS.filter(({ resourceId }) => resourceId === amelia?.id).map(({ taskId }) => taskId);
    expect(assignedTaskIds).toEqual(expect.arrayContaining(['orion-design', 'orion-uat-readiness', 'meridian-discovery', 'meridian-design']));
    const orion = PROFESSIONAL_SERVICES_TASKS.find(({ id }) => id === 'orion-uat-readiness')!;
    const meridian = PROFESSIONAL_SERVICES_TASKS.find(({ id }) => id === 'meridian-design')!;
    expect(orion.startDate <= meridian.endDate! && meridian.startDate <= orion.endDate!).toBe(true);
  });

  it('uses a consulting-studio grid with client and commercial context', () => {
    expect(PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.grid).toEqual({ theme: 'adaptiveMaterial', rowSize: 40, rowHeaders: false, cellBorders: false, timelinePanelWidth: '66%' });
    expect(PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.columns.map(({ prop }) => prop)).toEqual(['clientName', 'name', 'owner']);
    expect(PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.columns.map(({ size }) => size)).toEqual([114, 142, 135]);
    expect(PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.columns.reduce((total, { size = 0 }) => total + size, 0)).toBe(391);
    const riskTask = PROFESSIONAL_SERVICES_TASKS.find(({ id }) => id === 'orion-uat-readiness')!;
    const engagement = PROFESSIONAL_SERVICES_TASKS.find(({ id }) => id === 'orion')!;
    for (const column of PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION.columns) {
      expect(column.cellProperties?.({ model: riskTask } as never)).toMatchObject({ class: { 'psa-grid-cell': true, 'psa-grid-cell--risk': true, 'psa-grid-cell--orion': true } });
      expect(column.cellProperties?.({ model: engagement } as never)).toMatchObject({ class: { 'psa-grid-cell--engagement-group': true } });
    }
  });
});
