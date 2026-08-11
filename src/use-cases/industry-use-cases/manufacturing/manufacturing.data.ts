import type { ColumnRegular } from '@revolist/revogrid';
import {
  createDefaultTaskTableColumn,
  type AssignmentEntity,
  type BaselineSnapshot,
  type CalendarEntity,
  type DependencyEntity,
  type GanttPluginConfig,
  type ResourceEntity,
} from '@revolist/gantt';
import { resolveIndustryWorkflowStatus, type IndustryGanttDefinition, type IndustryTaskRow } from '../industry-use-case.types';

const PRODUCTION_CALENDAR_ID = 'manufacturing-two-shift';
const QUALITY_CALENDAR_ID = 'manufacturing-quality-day';
const taskDefaults = {
  orderNumber: 'MFG-Q3',
  operation: 'PLAN',
  workCenter: 'Plant control',
  machine: '—',
  material: 'Mixed BOM',
  shift: 'Day',
  owner: 'Leonie Brandt',
  calendarId: PRODUCTION_CALENDAR_ID,
  tags: [] as readonly string[],
};
const task = (
  row: Omit<IndustryTaskRow, keyof typeof taskDefaults> & Partial<Pick<IndustryTaskRow, keyof typeof taskDefaults>>,
): IndustryTaskRow => ({ ...taskDefaults, ...row } as IndustryTaskRow);

export const MANUFACTURING_TASK_IDS = [
  'plant-production-plan',
  'valve-batch',
  'valve-material-release',
  'cnc-07-changeover',
  'valve-cnc-machining',
  'valve-in-process-inspection',
  'valve-heat-treatment',
  'valve-assembly',
  'valve-hydrostatic-test',
  'valve-batch-release',
  'actuator-batch',
  'actuator-material-staging',
  'actuator-cnc-milling',
  'coating-line-changeover',
  'actuator-protective-coating',
  'actuator-assembly',
  'actuator-electrical-test',
  'actuator-final-release',
  'dispatch-wave',
  'kit-packaging',
  'shipment-commitment',
] as const;

export const MANUFACTURING_TASKS: IndustryTaskRow[] = [
  task({ id: 'plant-production-plan', parentId: null, type: 'summary', name: 'September valve and actuator production plan', operation: 'PLAN', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-10-05', duration: 46, percentDone: 52, risk: 'Late valve material and CNC-07 contention move shipment beyond commitment' }),
  task({ id: 'valve-batch', parentId: 'plant-production-plan', type: 'summary', name: 'Valve batch · SO-48217', orderNumber: 'SO-48217', operation: 'VALVE', workCenter: 'Valve line', material: '17-4PH / seals', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-09-30', duration: 43, percentDone: 55, risk: 'Material release and CNC-07 changeover are behind baseline' }),
  task({ id: 'valve-material-release', parentId: 'valve-batch', type: 'task', name: 'Material release for valve batch', orderNumber: 'SO-48217', operation: 'OP-010', workCenter: 'Materials QA', machine: 'Receipt bay', material: '17-4PH bar', shift: 'Day', owner: 'Sara Duarte', statusLabel: 'Supplier delay', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-08-20', duration: 14, percentDone: 78, deadlineDate: '2026-08-14', risk: 'Mill certificates arrived late; CNC setup cannot release until incoming inspection closes' }),
  task({ id: 'cnc-07-changeover', parentId: 'valve-batch', type: 'task', name: 'CNC-07 changeover and setup', orderNumber: 'SO-48217', operation: 'OP-020', workCenter: 'Machining', machine: 'CNC-07', material: '17-4PH bar', shift: 'B', owner: 'Mateo Silva', statusLabel: 'Capacity hold', workflowStatus: 'blocked', startDate: '2026-08-25', endDate: '2026-08-26', duration: 2, percentDone: 0, risk: 'CNC-07 remains allocated to actuator milling; setup waits for both machine and released material' }),
  task({ id: 'valve-cnc-machining', parentId: 'valve-batch', type: 'task', name: 'Machine valve bodies and trim', orderNumber: 'SO-48217', operation: 'OP-030', workCenter: 'Machining', machine: 'CNC-07', material: '17-4PH bar', shift: 'A+B', owner: 'Mateo Silva', statusLabel: 'In production', workflowStatus: 'in-progress', startDate: '2026-08-27', endDate: '2026-09-09', duration: 10, percentDone: 68 }),
  task({ id: 'valve-in-process-inspection', parentId: 'valve-batch', type: 'milestone', name: 'In-process dimensional inspection', orderNumber: 'SO-48217', operation: 'QC-040', workCenter: 'Quality lab', machine: 'CMM-02', material: 'Machined bodies', shift: 'Day', owner: 'Sara Duarte', calendarId: QUALITY_CALENDAR_ID, statusLabel: 'Inspection', workflowStatus: 'not-started', startDate: '2026-09-10', endDate: '2026-09-10', duration: 0, percentDone: 0 }),
  task({ id: 'valve-heat-treatment', parentId: 'valve-batch', type: 'task', name: 'Heat treatment and hardness verification', orderNumber: 'SO-48217', operation: 'OP-050', workCenter: 'Thermal', machine: 'Furnace F-3', material: 'Valve bodies', shift: 'A', owner: 'Anika Weber', statusLabel: 'Queued', workflowStatus: 'not-started', startDate: '2026-09-11', endDate: '2026-09-17', duration: 5, percentDone: 0 }),
  task({ id: 'valve-assembly', parentId: 'valve-batch', type: 'task', name: 'Valve assembly and torque audit', orderNumber: 'SO-48217', operation: 'OP-060', workCenter: 'Assembly B', machine: 'Cell B-04', material: 'Bodies / seals', shift: 'A', owner: 'Ines Costa', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-18', endDate: '2026-09-25', duration: 6, percentDone: 0 }),
  task({ id: 'valve-hydrostatic-test', parentId: 'valve-batch', type: 'task', name: 'Hydrostatic final test', orderNumber: 'SO-48217', operation: 'QA-070', workCenter: 'Final test', machine: 'Hydro Bay 2', material: 'Assembled valves', shift: 'Day', owner: 'Sara Duarte', calendarId: QUALITY_CALENDAR_ID, statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-28', endDate: '2026-09-29', duration: 2, percentDone: 0 }),
  task({ id: 'valve-batch-release', parentId: 'valve-batch', type: 'milestone', name: 'Valve batch quality release', orderNumber: 'SO-48217', operation: 'REL-080', workCenter: 'Quality lab', machine: '—', material: 'Released valves', shift: 'Day', owner: 'Sara Duarte', calendarId: QUALITY_CALENDAR_ID, statusLabel: 'Release gate', workflowStatus: 'not-started', startDate: '2026-09-30', endDate: '2026-09-30', duration: 0, percentDone: 0 }),
  task({ id: 'actuator-batch', parentId: 'plant-production-plan', type: 'summary', name: 'Actuator batch · SO-48218', orderNumber: 'SO-48218', operation: 'ACTUATOR', workCenter: 'Actuator line', material: 'Al 6082 / PCB', statusLabel: 'On track', workflowStatus: 'in-progress', startDate: '2026-08-03', endDate: '2026-09-15', duration: 32, percentDone: 74 }),
  task({ id: 'actuator-material-staging', parentId: 'actuator-batch', type: 'task', name: 'Stage housings, motors and control boards', orderNumber: 'SO-48218', operation: 'OP-110', workCenter: 'Kitting', machine: 'Kitting 1', material: 'Al 6082 / PCB', shift: 'A', owner: 'Nuno Reis', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-03', endDate: '2026-08-07', duration: 5, percentDone: 100 }),
  task({ id: 'actuator-cnc-milling', parentId: 'actuator-batch', type: 'task', name: 'Mill actuator housings', orderNumber: 'SO-48218', operation: 'OP-120', workCenter: 'Machining', machine: 'CNC-07', material: 'Al 6082', shift: 'A+B', owner: 'Mateo Silva', statusLabel: 'In production', workflowStatus: 'in-progress', startDate: '2026-08-10', endDate: '2026-08-24', duration: 11, percentDone: 82, risk: 'Shared CNC-07 allocation leaves no recovery window for the valve setup' }),
  task({ id: 'coating-line-changeover', parentId: 'actuator-batch', type: 'task', name: 'Coat Line 2 colour changeover', orderNumber: 'SO-48218', operation: 'OP-130', workCenter: 'Coating', machine: 'Coat Line 2', material: 'Powder · navy', shift: 'B', owner: 'Eva Novak', statusLabel: 'Ready', workflowStatus: 'not-started', startDate: '2026-08-25', endDate: '2026-08-26', duration: 2, percentDone: 0 }),
  task({ id: 'actuator-protective-coating', parentId: 'actuator-batch', type: 'task', name: 'Protective powder coating', orderNumber: 'SO-48218', operation: 'OP-140', workCenter: 'Coating', machine: 'Coat Line 2', material: 'Milled housings', shift: 'A+B', owner: 'Eva Novak', statusLabel: 'Queued', workflowStatus: 'not-started', startDate: '2026-08-27', endDate: '2026-09-02', duration: 5, percentDone: 0 }),
  task({ id: 'actuator-assembly', parentId: 'actuator-batch', type: 'task', name: 'Motor, gearbox and PCB assembly', orderNumber: 'SO-48218', operation: 'OP-150', workCenter: 'Assembly A', machine: 'Cell A-02', material: 'Coated housing / PCB', shift: 'A', owner: 'Ines Costa', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-03', endDate: '2026-09-09', duration: 5, percentDone: 0 }),
  task({ id: 'actuator-electrical-test', parentId: 'actuator-batch', type: 'task', name: 'Electrical final test and calibration', orderNumber: 'SO-48218', operation: 'QA-160', workCenter: 'Final test', machine: 'EOL Bench 4', material: 'Assembled actuators', shift: 'Day', owner: 'Sara Duarte', calendarId: QUALITY_CALENDAR_ID, statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-10', endDate: '2026-09-14', duration: 3, percentDone: 0 }),
  task({ id: 'actuator-final-release', parentId: 'actuator-batch', type: 'milestone', name: 'Actuator final inspection release', orderNumber: 'SO-48218', operation: 'REL-170', workCenter: 'Quality lab', machine: '—', material: 'Released actuators', shift: 'Day', owner: 'Sara Duarte', calendarId: QUALITY_CALENDAR_ID, statusLabel: 'Release gate', workflowStatus: 'not-started', startDate: '2026-09-15', endDate: '2026-09-15', duration: 0, percentDone: 0 }),
  task({ id: 'dispatch-wave', parentId: 'plant-production-plan', type: 'summary', name: 'Customer kit and dispatch · NordFlow', orderNumber: 'SHIP-9204', operation: 'DISPATCH', workCenter: 'Outbound', material: 'Valve + actuator kits', shift: 'Day', owner: 'Joao Lima', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-09-30', endDate: '2026-10-05', duration: 4, percentDone: 0, risk: 'Valve release moves committed shipment beyond 2 October' }),
  task({ id: 'kit-packaging', parentId: 'dispatch-wave', type: 'task', name: 'Pair, label and package customer kits', orderNumber: 'SHIP-9204', operation: 'PK-180', workCenter: 'Outbound', machine: 'Pack Cell 3', material: 'Valve + actuator kits', shift: 'Day', owner: 'Joao Lima', statusLabel: 'Blocked', workflowStatus: 'blocked', startDate: '2026-10-01', endDate: '2026-10-02', duration: 2, percentDone: 0, risk: 'Cannot start until both batch releases are complete' }),
  task({ id: 'shipment-commitment', parentId: 'dispatch-wave', type: 'milestone', name: 'NordFlow shipment departs', orderNumber: 'SHIP-9204', operation: 'SHIP-190', workCenter: 'Outbound', machine: 'Dock 2', material: '24 paired kits', shift: 'Day', owner: 'Joao Lima', statusLabel: 'Late forecast', workflowStatus: 'blocked', startDate: '2026-10-05', endDate: '2026-10-05', duration: 0, percentDone: 0, deadlineDate: '2026-10-02', risk: 'Forecast one working day after customer commitment' }),
];

export const MANUFACTURING_CALENDARS: CalendarEntity[] = [
  {
    id: PRODUCTION_CALENDAR_ID,
    name: 'Porto plant two-shift calendar',
    timeZone: 'Europe/Lisbon',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: [{ start: '06:00', end: '14:00' }, { start: '14:00', end: '22:00' }],
    holidays: ['2026-08-15'],
    hoursPerDay: 16,
  },
  {
    id: QUALITY_CALENDAR_ID,
    name: 'Quality and release day shift',
    timeZone: 'Europe/Lisbon',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: [{ start: '07:30', end: '12:00' }, { start: '12:30', end: '16:00' }],
    holidays: [],
    hoursPerDay: 8,
  },
];

export const MANUFACTURING_RESOURCES: ResourceEntity[] = [
  { id: 'planning', name: 'Leonie Brandt', role: 'Production planner', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 88 },
  { id: 'materials-qa', name: 'Sara Duarte · Incoming QA', role: 'Material release', calendarId: QUALITY_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 72 },
  { id: 'cnc-07', name: 'CNC-07 machining centre', role: 'Five-axis machining', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 164 },
  { id: 'machining-crew', name: 'Mateo Silva · CNC crew', role: 'Machining', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 2, hourlyCost: 96 },
  { id: 'furnace-f3', name: 'Furnace F-3 cell', role: 'Heat treatment', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 142 },
  { id: 'assembly-b', name: 'Assembly Cell B', role: 'Valve assembly', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 118 },
  { id: 'assembly-a', name: 'Assembly Cell A', role: 'Actuator assembly', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 112 },
  { id: 'coat-line-2', name: 'Coat Line 2', role: 'Powder coating', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 128 },
  { id: 'quality-lab', name: 'Sara Duarte · Quality lab', role: 'Inspection and final test', calendarId: QUALITY_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 84 },
  { id: 'hydro-bay-2', name: 'Hydro Test Bay 2', role: 'Pressure testing', calendarId: QUALITY_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 138 },
  { id: 'dispatch', name: 'Joao Lima · Dispatch crew', role: 'Packaging and logistics', calendarId: PRODUCTION_CALENDAR_ID, allocationCapacity: 2, hourlyCost: 64 },
];

const primaryResourceForTask: Readonly<Record<string, string>> = {
  'valve-material-release': 'materials-qa',
  'cnc-07-changeover': 'cnc-07',
  'valve-cnc-machining': 'cnc-07',
  'valve-in-process-inspection': 'quality-lab',
  'valve-heat-treatment': 'furnace-f3',
  'valve-assembly': 'assembly-b',
  'valve-hydrostatic-test': 'hydro-bay-2',
  'valve-batch-release': 'quality-lab',
  'actuator-material-staging': 'planning',
  'actuator-cnc-milling': 'cnc-07',
  'coating-line-changeover': 'coat-line-2',
  'actuator-protective-coating': 'coat-line-2',
  'actuator-assembly': 'assembly-a',
  'actuator-electrical-test': 'quality-lab',
  'actuator-final-release': 'quality-lab',
  'kit-packaging': 'dispatch',
  'shipment-commitment': 'dispatch',
};
export const MANUFACTURING_ASSIGNMENTS: AssignmentEntity[] = [
  ...Object.entries(primaryResourceForTask).map(([taskId, resourceId], index) => ({
    id: `manufacturing-a-${index + 1}`,
    taskId,
    resourceId,
    allocationUnits: 1,
    responsibility: 'Primary work centre',
  })),
  { id: 'manufacturing-a-cnc-crew-1', taskId: 'cnc-07-changeover', resourceId: 'machining-crew', allocationUnits: 1, responsibility: 'Setup crew' },
  { id: 'manufacturing-a-cnc-crew-2', taskId: 'valve-cnc-machining', resourceId: 'machining-crew', allocationUnits: 1, responsibility: 'Operator' },
  { id: 'manufacturing-a-cnc-crew-3', taskId: 'actuator-cnc-milling', resourceId: 'machining-crew', allocationUnits: 1, responsibility: 'Operator' },
];

const dependencyPairs = [
  ['actuator-material-staging', 'actuator-cnc-milling', 'finish-to-start', 0],
  ['actuator-cnc-milling', 'coating-line-changeover', 'finish-to-start', 0],
  ['coating-line-changeover', 'actuator-protective-coating', 'finish-to-start', 0],
  ['actuator-protective-coating', 'actuator-assembly', 'finish-to-start', 0],
  ['actuator-assembly', 'actuator-electrical-test', 'finish-to-start', 0],
  ['actuator-electrical-test', 'actuator-final-release', 'finish-to-start', 0],
  ['valve-material-release', 'cnc-07-changeover', 'finish-to-start', 2],
  ['actuator-cnc-milling', 'cnc-07-changeover', 'finish-to-start', 0],
  ['cnc-07-changeover', 'valve-cnc-machining', 'finish-to-start', 0],
  ['valve-cnc-machining', 'valve-in-process-inspection', 'finish-to-start', 0],
  ['valve-in-process-inspection', 'valve-heat-treatment', 'finish-to-start', 0],
  ['valve-heat-treatment', 'valve-assembly', 'finish-to-start', 0],
  ['valve-assembly', 'valve-hydrostatic-test', 'finish-to-start', 0],
  ['valve-hydrostatic-test', 'valve-batch-release', 'finish-to-start', 0],
  ['valve-batch-release', 'kit-packaging', 'finish-to-start', 0],
  ['actuator-final-release', 'kit-packaging', 'finish-to-start', 0],
  ['kit-packaging', 'shipment-commitment', 'finish-to-start', 1],
] as const;
export const MANUFACTURING_DEPENDENCIES: DependencyEntity[] = dependencyPairs.map(
  ([predecessorTaskId, successorTaskId, type, lagDays], index) => ({
    id: `manufacturing-d-${index + 1}`,
    predecessorTaskId,
    successorTaskId,
    type,
    lagDays,
  }),
);

const approvedDates: Readonly<Record<string, readonly [string, string]>> = {
  'plant-production-plan': ['2026-08-03', '2026-10-02'],
  'valve-batch': ['2026-08-03', '2026-09-25'],
  'valve-material-release': ['2026-08-03', '2026-08-14'],
  'cnc-07-changeover': ['2026-08-17', '2026-08-18'],
  'valve-cnc-machining': ['2026-08-19', '2026-08-31'],
  'valve-in-process-inspection': ['2026-09-01', '2026-09-01'],
  'valve-heat-treatment': ['2026-09-02', '2026-09-08'],
  'valve-assembly': ['2026-09-09', '2026-09-16'],
  'valve-hydrostatic-test': ['2026-09-17', '2026-09-18'],
  'valve-batch-release': ['2026-09-21', '2026-09-21'],
  'dispatch-wave': ['2026-09-21', '2026-10-02'],
  'kit-packaging': ['2026-09-22', '2026-09-23'],
  'shipment-commitment': ['2026-10-02', '2026-10-02'],
};
export const MANUFACTURING_BASELINES: BaselineSnapshot[] = [{
  id: 'manufacturing-approved-september',
  name: 'Approved September production plan',
  capturedAt: '2026-07-31T14:00:00Z',
  tasks: MANUFACTURING_TASKS.map((item) => {
    const [startDate, endDate] = approvedDates[item.id] ?? [item.startDate, item.endDate ?? item.startDate];
    return { taskId: item.id, startDate, endDate, duration: item.type === 'milestone' ? 0 : Number(item.duration) * 8, progressPercent: 0 };
  }),
} as BaselineSnapshot];

export const MANUFACTURING_COLUMNS: ColumnRegular[] = [
  { prop: 'orderNumber', name: 'Order', size: 86, readonly: true },
  { ...createDefaultTaskTableColumn('name'), name: 'Operation', size: 187 },
  { prop: 'workCenter', name: 'Cell', size: 76, readonly: true },
];

export const MANUFACTURING_GANTT_CONFIG: GanttPluginConfig = {
  id: 'manufacturing-valve-actuator-cell-2026',
  name: 'September valve and actuator production plan',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: PRODUCTION_CALENDAR_ID,
  updatedAt: '2026-09-08T05:50:00Z',
  statusDate: '2026-09-08',
  zoomPreset: 'day-week',
  zoom: {
    enabled: true,
    levels: [{
      id: 'manufacturing-day-week',
      label: 'Manufacturing day plan',
      tickUnit: 'day',
      tickWidth: 34,
      headerRows: [{ id: 'week', unit: 'week' }, { id: 'day', unit: 'day' }],
      highlightVisibility: { weekends: true, holidays: true },
    }],
    defaultLevelId: 'manufacturing-day-week',
    minLevelId: 'manufacturing-day-week',
    maxLevelId: 'manufacturing-day-week',
    wheelZoomEnabled: false,
  },
  weekStartsOn: 1,
  allowTaskCreate: false,
  scheduling: { excludeHolidaysFromDuration: true, taskModeDefault: 'auto', autoDependencyViolationBehavior: 'warn', lagCalendar: 'working-days', resourceLeveling: 'warn' },
  dateFormats: { locale: 'en-GB', timeZone: 'Europe/Lisbon', table: { day: '2-digit', month: 'short' } },
  visuals: {
    showDependencies: true,
    showBaseline: false,
    baselineId: 'manufacturing-approved-september',
    showCriticalPath: true,
    showTaskLabels: 'tasks',
    shadeNonWorkingTime: true,
    showTodayLine: false,
    projectLineDate: '2026-09-08',
    timeRanges: [{ id: 'manufacturing-cnc-risk-window', startDate: '2026-08-20', endDate: '2026-08-26', label: 'Material + CNC constraint', color: '#e8f6fb' }],
    milestoneLines: [{ id: 'actuator-release-target', date: '2026-09-15', label: 'Actuator release', color: '#087ea4' }, { id: 'shipment-commitment-line', date: '2026-10-02', label: 'Ship commitment', color: '#123b63' }],
    taskTooltipFields: ['status', 'startDate', 'endDate', 'percentDone', 'assignees'],
  },
};

export const MANUFACTURING_INDUSTRY_DEFINITION: IndustryGanttDefinition = {
  id: 'industry-manufacturing',
  productLabel: 'NEXUS MES // PORTO-02',
  title: 'Cell 07 production command',
  subtitle: 'Live order routing · machine loading · material gates · quality release',
  scheduleLabel: 'Run queue // 8 Sep 05:50',
  riskLegendLabel: 'Constraint alarm',
  updatedLabel: 'PLC + ERP heartbeat 05:50:12 · live',
  mark: 'NX',
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
    timelinePanelWidth: '68.75%',
  },
  tasks: MANUFACTURING_TASKS,
  dependencies: MANUFACTURING_DEPENDENCIES,
  calendars: MANUFACTURING_CALENDARS,
  resources: MANUFACTURING_RESOURCES,
  assignments: MANUFACTURING_ASSIGNMENTS,
  baselines: MANUFACTURING_BASELINES,
  columns: MANUFACTURING_COLUMNS,
  gantt: MANUFACTURING_GANTT_CONFIG,
  taskBarColorHook: ({ row }) => {
    const workflowStatus = resolveIndustryWorkflowStatus(row);
    return workflowStatus === 'blocked'
      ? { barColor: '#df4a52', progressColor: '#c9323b', borderColor: '#c83a42', textColor: '#fff' }
      : workflowStatus === 'done'
        ? { barColor: '#0b4c75', progressColor: '#073552', borderColor: '#0a4165', textColor: '#fff' }
        : row.type === 'summary'
          ? { barColor: '#0b4c75', progressColor: '#073552', borderColor: '#0a4165', textColor: '#fff' }
          : { barColor: '#39abc3', progressColor: '#16839d', borderColor: '#167d96', textColor: '#fff' };
  },
};
