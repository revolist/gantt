import { describe, expect, it } from 'vitest';
import {
  MANUFACTURING_ASSIGNMENTS,
  MANUFACTURING_BASELINES,
  MANUFACTURING_CALENDARS,
  MANUFACTURING_COLUMNS,
  MANUFACTURING_DEPENDENCIES,
  MANUFACTURING_GANTT_CONFIG,
  MANUFACTURING_INDUSTRY_DEFINITION,
  MANUFACTURING_RESOURCES,
  MANUFACTURING_TASK_IDS,
  MANUFACTURING_TASKS,
} from '../../../../src/use-cases/manufacturing/manufacturing.data';

describe('manufacturing industry Gantt fixture', () => {
  it('models a stable production plan with complete shop-floor context', () => {
    expect(MANUFACTURING_INDUSTRY_DEFINITION).toMatchObject({
      productLabel: 'NEXUS MES // PORTO-02',
      title: 'Cell 07 production command',
      scheduleLabel: 'Run queue // 8 Sep 05:50',
      riskLegendLabel: 'Constraint alarm',
      metrics: [
        { label: 'Orders active', value: '02' },
        { label: 'Plan adherence', value: '86.4%', tone: 'warning' },
        { label: 'Alarms open', value: '02', tone: 'danger' },
        { label: 'Ship window', value: '02 OCT', tone: 'warning' },
      ],
      grid: {
        theme: 'compact',
        rowSize: 30,
        rowHeaders: true,
        cellBorders: true,
      },
    });
    expect(MANUFACTURING_TASKS.map(({ id }) => id)).toEqual(MANUFACTURING_TASK_IDS);
    expect(MANUFACTURING_COLUMNS.map(({ prop, name, size }) => ({ prop, name, size }))).toEqual([
      { prop: 'orderNumber', name: 'Order', size: 86 },
      { prop: 'name', name: 'Operation', size: 187 },
      { prop: 'workCenter', name: 'Cell', size: 76 },
    ]);
    expect(MANUFACTURING_COLUMNS.reduce((width, column) => width + Number(column.size), 0)).toBe(349);
    expect(MANUFACTURING_GANTT_CONFIG.zoom).toMatchObject({
      defaultLevelId: 'manufacturing-day-week',
      minLevelId: 'manufacturing-day-week',
      maxLevelId: 'manufacturing-day-week',
      wheelZoomEnabled: false,
      levels: [expect.objectContaining({ id: 'manufacturing-day-week', tickUnit: 'day', tickWidth: 34 })],
    });
    expect(new Set(MANUFACTURING_TASK_IDS).size).toBe(MANUFACTURING_TASK_IDS.length);
    expect(MANUFACTURING_TASKS).toHaveLength(21);
    for (const task of MANUFACTURING_TASKS) {
      expect(task).toEqual(expect.objectContaining({
        orderNumber: expect.any(String),
        operation: expect.any(String),
        workCenter: expect.any(String),
        machine: expect.any(String),
        material: expect.any(String),
        shift: expect.any(String),
        owner: expect.any(String),
        statusLabel: expect.any(String),
        startDate: expect.stringMatching(/^2026-(08|09|10)-/),
      }));
    }
    expect(MANUFACTURING_TASKS.filter(({ type }) => type === 'milestone')).toHaveLength(4);
    expect(MANUFACTURING_TASKS.map(({ workCenter }) => workCenter)).toEqual(expect.arrayContaining(['Machining', 'Thermal', 'Coating', 'Assembly A', 'Assembly B', 'Final test', 'Outbound']));
  });

  it('holds the manufacturing table and timeline split at the visual-contract width', () => {
    expect(MANUFACTURING_INDUSTRY_DEFINITION.grid?.timelinePanelWidth).toBe('68.75%');
  });

  it('keeps hierarchy, dependencies, assignments, calendars, and the full baseline valid', () => {
    const tasks = new Set<string>(MANUFACTURING_TASK_IDS);
    const calendars = new Set(MANUFACTURING_CALENDARS.map(({ id }) => id));
    const resources = new Set(MANUFACTURING_RESOURCES.map(({ id }) => id));
    for (const item of MANUFACTURING_TASKS) {
      if (item.parentId) expect(tasks.has(item.parentId)).toBe(true);
      expect(calendars.has(item.calendarId!)).toBe(true);
    }
    expect(MANUFACTURING_DEPENDENCIES.length).toBeGreaterThanOrEqual(14);
    for (const dependency of MANUFACTURING_DEPENDENCIES) {
      expect(tasks.has(dependency.predecessorTaskId)).toBe(true);
      expect(tasks.has(dependency.successorTaskId)).toBe(true);
    }
    for (const assignment of MANUFACTURING_ASSIGNMENTS) {
      expect(tasks.has(assignment.taskId)).toBe(true);
      expect(resources.has(assignment.resourceId)).toBe(true);
    }
    expect(new Set(MANUFACTURING_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(MANUFACTURING_INDUSTRY_DEFINITION.gantt).toMatchObject({ id: 'manufacturing-valve-actuator-cell-2026', visuals: { showDependencies: true, baselineId: 'manufacturing-approved-september', showCriticalPath: true } });
  });

  it('connects the late material release and shared CNC-07 changeover to quality and shipment', () => {
    const materialRelease = MANUFACTURING_TASKS.find(({ id }) => id === 'valve-material-release')!;
    const changeover = MANUFACTURING_TASKS.find(({ id }) => id === 'cnc-07-changeover')!;
    const approvedChangeover = MANUFACTURING_BASELINES[0].tasks.find(({ taskId }) => taskId === changeover.id)!;
    expect(materialRelease).toMatchObject({ name: 'Material release for valve batch', workflowStatus: 'blocked', deadlineDate: '2026-08-14', risk: expect.stringContaining('incoming inspection') });
    expect(changeover).toMatchObject({ name: 'CNC-07 changeover and setup', machine: 'CNC-07', workflowStatus: 'blocked', risk: expect.stringContaining('allocated to actuator milling') });
    expect(changeover.startDate > approvedChangeover.startDate).toBe(true);

    const cncResource = MANUFACTURING_RESOURCES.find(({ id }) => id === 'cnc-07')!;
    expect(MANUFACTURING_ASSIGNMENTS.filter(({ resourceId }) => resourceId === cncResource.id).map(({ taskId }) => taskId)).toEqual(expect.arrayContaining(['actuator-cnc-milling', 'cnc-07-changeover', 'valve-cnc-machining']));
    expect(MANUFACTURING_DEPENDENCIES).toEqual(expect.arrayContaining([
      expect.objectContaining({ predecessorTaskId: 'valve-material-release', successorTaskId: 'cnc-07-changeover' }),
      expect.objectContaining({ predecessorTaskId: 'actuator-cnc-milling', successorTaskId: 'cnc-07-changeover' }),
      expect.objectContaining({ predecessorTaskId: 'cnc-07-changeover', successorTaskId: 'valve-cnc-machining' }),
      expect.objectContaining({ predecessorTaskId: 'valve-hydrostatic-test', successorTaskId: 'valve-batch-release' }),
      expect.objectContaining({ predecessorTaskId: 'valve-batch-release', successorTaskId: 'kit-packaging' }),
      expect.objectContaining({ predecessorTaskId: 'kit-packaging', successorTaskId: 'shipment-commitment' }),
    ]));
    expect(MANUFACTURING_TASKS.find(({ id }) => id === 'shipment-commitment')).toMatchObject({ deadlineDate: '2026-10-02', startDate: '2026-10-05', workflowStatus: 'blocked' });
  });
});
