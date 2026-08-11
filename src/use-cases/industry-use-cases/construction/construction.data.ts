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
import type { IndustryGanttDefinition, IndustryTaskRow } from '../industry-use-case.types';

const CALENDAR_ID = 'construction-site-calendar';
const taskDefaults = {
  site: 'Riverside Clinic · Porto',
  phase: 'Project',
  owner: 'Marta Costa',
  contractor: 'Alden Construction',
  crew: 'Site management',
  inspection: '—',
  supplier: '—',
  calendarId: CALENDAR_ID,
  tags: [] as readonly string[],
};
const task = (
  row: Omit<IndustryTaskRow, keyof typeof taskDefaults> & Partial<Pick<IndustryTaskRow, keyof typeof taskDefaults>>,
): IndustryTaskRow => ({ ...taskDefaults, ...row } as IndustryTaskRow);

export const CONSTRUCTION_TASK_IDS = [
  'clinic-expansion',
  'site-foundations',
  'site-mobilisation',
  'bulk-excavation',
  'underground-services',
  'concrete-foundations',
  'foundation-inspection',
  'structure-envelope',
  'steel-frame',
  'roof-facade',
  'watertight-gate',
  'mep-services',
  'switchgear-delivery',
  'electrical-rough-in',
  'mechanical-rough-in',
  'first-fix-inspection',
  'commissioning-handover',
  'systems-commissioning',
  'authority-inspection',
  'clinical-readiness',
  'practical-completion',
] as const;

export const CONSTRUCTION_TASKS: IndustryTaskRow[] = [
  task({ id: 'clinic-expansion', parentId: null, type: 'summary', name: 'Riverside Clinic Expansion', wbs: 'RCX', phase: 'Programme', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-11-27', duration: 85, percentDone: 47, risk: 'Late switchgear delivery threatens commissioning float' }),
  task({ id: 'site-foundations', parentId: 'clinic-expansion', type: 'summary', name: 'Site setup and foundations', wbs: '1.0', phase: 'Foundations', contractor: 'Alden Construction', crew: 'Groundworks', statusLabel: 'In delivery', workflowStatus: 'in-progress', startDate: '2026-08-03', endDate: '2026-09-11', duration: 30, percentDone: 78 }),
  task({ id: 'site-mobilisation', parentId: 'site-foundations', type: 'task', name: 'Mobilise site and temporary works', wbs: '1.1', phase: 'Site', contractor: 'Alden Construction', crew: 'Site logistics', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-03', endDate: '2026-08-07', duration: 5, percentDone: 100 }),
  task({ id: 'bulk-excavation', parentId: 'site-foundations', type: 'task', name: 'Bulk excavation and shoring', wbs: '1.2', phase: 'Groundworks', contractor: 'TerraWorks', crew: 'Earthworks A', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-10', endDate: '2026-08-21', duration: 10, percentDone: 100 }),
  task({ id: 'underground-services', parentId: 'site-foundations', type: 'task', name: 'Underground drainage and utilities', wbs: '1.3', phase: 'Groundworks', contractor: 'Flowline MEP', crew: 'Civils crew', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-17', endDate: '2026-08-28', duration: 10, percentDone: 100, inspection: 'Services survey' }),
  task({ id: 'concrete-foundations', parentId: 'site-foundations', type: 'task', name: 'Reinforced concrete foundations', wbs: '1.4', phase: 'Foundations', contractor: 'Luso Concrete', crew: 'Concrete crew', statusLabel: 'In delivery', workflowStatus: 'in-progress', startDate: '2026-08-24', endDate: '2026-09-08', duration: 12, percentDone: 72, inspection: 'Cube tests' }),
  task({ id: 'foundation-inspection', parentId: 'site-foundations', type: 'milestone', name: 'Foundation inspection passed', wbs: '1.5', phase: 'Foundations', contractor: 'Alden Construction', crew: 'QA / engineer', statusLabel: 'Inspection', workflowStatus: 'not-started', startDate: '2026-09-11', endDate: '2026-09-11', duration: 0, percentDone: 0, inspection: 'Structural engineer' }),
  task({ id: 'structure-envelope', parentId: 'clinic-expansion', type: 'summary', name: 'Structure and envelope', wbs: '2.0', phase: 'Envelope', contractor: 'Alden Construction', crew: 'Building shell', statusLabel: 'Ready', workflowStatus: 'not-started', startDate: '2026-09-14', endDate: '2026-10-09', duration: 20, percentDone: 0 }),
  task({ id: 'steel-frame', parentId: 'structure-envelope', type: 'task', name: 'Erect structural steel frame', wbs: '2.1', phase: 'Structure', contractor: 'Atlas Steel', crew: 'Steel crew', statusLabel: 'Ready', workflowStatus: 'not-started', startDate: '2026-09-14', endDate: '2026-09-25', duration: 10, percentDone: 0, supplier: 'Atlas Steel' }),
  task({ id: 'roof-facade', parentId: 'structure-envelope', type: 'task', name: 'Roofing and facade closure', wbs: '2.2', phase: 'Envelope', contractor: 'Norte Envelope', crew: 'Envelope crew', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-21', endDate: '2026-10-07', duration: 13, percentDone: 0, supplier: 'Norte Envelope' }),
  task({ id: 'watertight-gate', parentId: 'structure-envelope', type: 'milestone', name: 'Building watertight', wbs: '2.3', phase: 'Envelope', contractor: 'Alden Construction', crew: 'QA / engineer', statusLabel: 'Gate', workflowStatus: 'not-started', startDate: '2026-10-09', endDate: '2026-10-09', duration: 0, percentDone: 0, inspection: 'Envelope sign-off' }),
  task({ id: 'mep-services', parentId: 'clinic-expansion', type: 'summary', name: 'MEP services and first fix', wbs: '3.0', phase: 'MEP', contractor: 'Alden Construction', crew: 'MEP coordination', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-17', endDate: '2026-11-06', duration: 60, percentDone: 18, risk: 'Switchgear delivery is five working days late' }),
  task({ id: 'switchgear-delivery', parentId: 'mep-services', type: 'task', name: 'Switchgear delivery and inspection', wbs: '3.1', phase: 'Electrical', contractor: 'VoltWorks', crew: 'Electrical lead', statusLabel: 'Supplier delay', workflowStatus: 'blocked', startDate: '2026-08-17', endDate: '2026-10-19', duration: 46, percentDone: 45, deadlineDate: '2026-10-12', inspection: 'Factory + site receipt', supplier: 'Iberia Switchgear', risk: 'Shipment forecast five working days late; electrical start and commissioning float exposed' }),
  task({ id: 'electrical-rough-in', parentId: 'mep-services', type: 'task', name: 'Electrical containment and rough-in', wbs: '3.2', phase: 'Electrical', contractor: 'VoltWorks', crew: 'Electrical crew', statusLabel: 'Blocked', workflowStatus: 'blocked', startDate: '2026-10-20', endDate: '2026-11-02', duration: 10, percentDone: 0, inspection: 'Electrical first fix', supplier: 'Iberia Switchgear', risk: 'Cannot finish before switchgear receipt inspection' }),
  task({ id: 'mechanical-rough-in', parentId: 'mep-services', type: 'task', name: 'Mechanical services rough-in', wbs: '3.3', phase: 'Mechanical', contractor: 'Flowline MEP', crew: 'Mechanical crew', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-10-12', endDate: '2026-10-26', duration: 11, percentDone: 0, inspection: 'Pressure test' }),
  task({ id: 'first-fix-inspection', parentId: 'mep-services', type: 'milestone', name: 'MEP first-fix inspection', wbs: '3.4', phase: 'MEP', contractor: 'Alden Construction', crew: 'QA / MEP leads', statusLabel: 'Inspection', workflowStatus: 'not-started', startDate: '2026-11-06', endDate: '2026-11-06', duration: 0, percentDone: 0, inspection: 'Consultant witness' }),
  task({ id: 'commissioning-handover', parentId: 'clinic-expansion', type: 'summary', name: 'Commissioning and handover', wbs: '4.0', phase: 'Handover', contractor: 'Alden Construction', crew: 'Commissioning team', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-11-09', endDate: '2026-11-27', duration: 15, percentDone: 0 }),
  task({ id: 'systems-commissioning', parentId: 'commissioning-handover', type: 'task', name: 'Integrated systems commissioning', wbs: '4.1', phase: 'Commissioning', contractor: 'Alden / MEP JV', crew: 'Commissioning team', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-11-09', endDate: '2026-11-18', duration: 8, percentDone: 0, inspection: 'Witness testing' }),
  task({ id: 'authority-inspection', parentId: 'commissioning-handover', type: 'milestone', name: 'Authority inspection complete', wbs: '4.2', phase: 'Commissioning', contractor: 'Alden Construction', crew: 'Authority / QA', statusLabel: 'Booked', workflowStatus: 'not-started', startDate: '2026-11-20', endDate: '2026-11-20', duration: 0, percentDone: 0, inspection: 'Municipal authority' }),
  task({ id: 'clinical-readiness', parentId: 'commissioning-handover', type: 'task', name: 'Clinical rooms and handover dossier', wbs: '4.3', phase: 'Handover', contractor: 'Alden Construction', crew: 'Closeout team', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-11-23', endDate: '2026-11-25', duration: 3, percentDone: 0, inspection: 'Client readiness' }),
  task({ id: 'practical-completion', parentId: 'commissioning-handover', type: 'milestone', name: 'Practical completion', wbs: '4.4', phase: 'Handover', contractor: 'Alden Construction', crew: 'Project leadership', statusLabel: 'Commitment', workflowStatus: 'not-started', startDate: '2026-11-27', endDate: '2026-11-27', duration: 0, percentDone: 0, deadlineDate: '2026-11-27', inspection: 'Client acceptance' }),
];

export const CONSTRUCTION_CALENDARS: CalendarEntity[] = [{
  id: CALENDAR_ID,
  name: 'Riverside site calendar',
  timeZone: 'Europe/Lisbon',
  workingDays: [1, 2, 3, 4, 5],
  workingHours: [{ start: '07:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
  holidays: ['2026-10-05'],
  hoursPerDay: 8,
}];

export const CONSTRUCTION_RESOURCES: ResourceEntity[] = [
  ['site-management', 'Marta Costa', 'Project manager', 96],
  ['groundworks', 'TerraWorks crew A', 'Groundworks crew', 132],
  ['concrete', 'Luso Concrete team', 'Concrete crew', 144],
  ['steel', 'Atlas Steel crew', 'Structural steel', 156],
  ['envelope', 'Norte Envelope crew', 'Roof and facade', 138],
  ['electrical', 'VoltWorks crew', 'Electrical services', 148],
  ['mechanical', 'Flowline MEP crew', 'Mechanical services', 146],
  ['quality', 'Riverside inspection team', 'Quality and inspections', 104],
  ['commissioning', 'Integrated commissioning team', 'Commissioning and handover', 164],
].map(([id, name, role, hourlyCost]) => ({ id, name, role, calendarId: CALENDAR_ID, allocationCapacity: 1, hourlyCost } as ResourceEntity));

const resourceForTask: Readonly<Record<string, string>> = {
  'site-mobilisation': 'site-management',
  'bulk-excavation': 'groundworks',
  'underground-services': 'groundworks',
  'concrete-foundations': 'concrete',
  'foundation-inspection': 'quality',
  'steel-frame': 'steel',
  'roof-facade': 'envelope',
  'watertight-gate': 'quality',
  'switchgear-delivery': 'electrical',
  'electrical-rough-in': 'electrical',
  'mechanical-rough-in': 'mechanical',
  'first-fix-inspection': 'quality',
  'systems-commissioning': 'commissioning',
  'authority-inspection': 'quality',
  'clinical-readiness': 'commissioning',
  'practical-completion': 'site-management',
};
export const CONSTRUCTION_ASSIGNMENTS: AssignmentEntity[] = Object.entries(resourceForTask).map(([taskId, resourceId], index) => ({
  id: `construction-a-${index + 1}`,
  taskId,
  resourceId,
  allocationUnits: 1,
  responsibility: 'Package owner',
}));

const dependencyPairs = [
  ['site-mobilisation', 'bulk-excavation', 'finish-to-start', 0],
  ['bulk-excavation', 'underground-services', 'start-to-start', 5],
  ['bulk-excavation', 'concrete-foundations', 'finish-to-start', 0],
  ['underground-services', 'concrete-foundations', 'finish-to-start', 0],
  ['concrete-foundations', 'foundation-inspection', 'finish-to-start', 2],
  ['foundation-inspection', 'steel-frame', 'finish-to-start', 1],
  ['steel-frame', 'roof-facade', 'start-to-start', 5],
  ['roof-facade', 'watertight-gate', 'finish-to-start', 1],
  ['site-mobilisation', 'switchgear-delivery', 'finish-to-start', 5],
  ['watertight-gate', 'electrical-rough-in', 'finish-to-start', 6],
  ['switchgear-delivery', 'electrical-rough-in', 'finish-to-start', 0],
  ['watertight-gate', 'mechanical-rough-in', 'finish-to-start', 0],
  ['electrical-rough-in', 'first-fix-inspection', 'finish-to-start', 3],
  ['mechanical-rough-in', 'first-fix-inspection', 'finish-to-start', 8],
  ['first-fix-inspection', 'systems-commissioning', 'finish-to-start', 0],
  ['systems-commissioning', 'authority-inspection', 'finish-to-start', 1],
  ['authority-inspection', 'clinical-readiness', 'finish-to-start', 0],
  ['clinical-readiness', 'practical-completion', 'finish-to-start', 1],
] as const;
export const CONSTRUCTION_DEPENDENCIES: DependencyEntity[] = dependencyPairs.map(([predecessorTaskId, successorTaskId, type, lagDays], index) => ({
  id: `construction-d-${index + 1}`,
  predecessorTaskId,
  successorTaskId,
  type,
  lagDays,
}));

const approvedDates: Readonly<Record<string, readonly [string, string]>> = {
  'clinic-expansion': ['2026-08-03', '2026-11-20'],
  'mep-services': ['2026-08-17', '2026-10-30'],
  'switchgear-delivery': ['2026-08-17', '2026-10-12'],
  'electrical-rough-in': ['2026-10-13', '2026-10-23'],
  'first-fix-inspection': ['2026-10-30', '2026-10-30'],
  'commissioning-handover': ['2026-11-02', '2026-11-20'],
  'systems-commissioning': ['2026-11-02', '2026-11-11'],
  'authority-inspection': ['2026-11-13', '2026-11-13'],
  'clinical-readiness': ['2026-11-16', '2026-11-18'],
  'practical-completion': ['2026-11-20', '2026-11-20'],
};
export const CONSTRUCTION_BASELINES: BaselineSnapshot[] = [{
  id: 'construction-approved-2026',
  name: 'Approved construction programme',
  capturedAt: '2026-07-31T16:00:00Z',
  tasks: CONSTRUCTION_TASKS.map((item) => {
    const [startDate, endDate] = approvedDates[item.id] ?? [item.startDate, item.endDate ?? item.startDate];
    return { taskId: item.id, startDate, endDate, duration: item.type === 'milestone' ? 0 : Number(item.duration) * 8, progressPercent: 0 };
  }),
} as BaselineSnapshot];

export const CONSTRUCTION_COLUMNS: ColumnRegular[] = [
  { prop: 'wbs', name: 'REF', size: 72, readonly: true },
  { ...createDefaultTaskTableColumn('name'), name: 'Look-ahead activity', size: 204, rowDrag: false },
  { prop: 'contractor', name: 'Trade', size: 84, readonly: true },
];

export const CONSTRUCTION_GANTT_CONFIG: GanttPluginConfig = {
  id: 'riverside-clinic-expansion-2026',
  name: 'Riverside Clinic Expansion',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: CALENDAR_ID,
  updatedAt: '2026-09-08T06:45:00Z',
  statusDate: '2026-09-08',
  zoomPreset: 'day-week',
  weekStartsOn: 1,
  allowTaskCreate: false,
  scheduling: { excludeHolidaysFromDuration: true, taskModeDefault: 'auto', autoDependencyViolationBehavior: 'warn', lagCalendar: 'working-days', resourceLeveling: 'warn' },
  dateFormats: { locale: 'en-GB', timeZone: 'Europe/Lisbon', table: { day: '2-digit', month: 'short' } },
  visuals: {
    showDependencies: true,
    showBaseline: false,
    baselineId: 'construction-approved-2026',
    showCriticalPath: true,
    showTaskLabels: 'tasks',
    shadeNonWorkingTime: true,
    showTodayLine: false,
    projectLineDate: '2026-09-08',
    timeRanges: [{ id: 'construction-supplier-window', startDate: '2026-10-12', endDate: '2026-10-19', label: 'Switchgear delay', color: '#fff0ed' }],
    milestoneLines: [{ id: 'watertight-target', date: '2026-10-09', label: 'Watertight', color: '#16705a' }, { id: 'construction-completion', date: '2026-11-27', label: 'Practical completion', color: '#d4662d' }],
    taskTooltipFields: ['status', 'startDate', 'endDate', 'percentDone', 'assignees'],
  },
};

export const CONSTRUCTION_INDUSTRY_DEFINITION: IndustryGanttDefinition = {
  id: 'industry-construction',
  productLabel: 'FIELD CONTROL / RC-01 · RIVERSIDE CLINIC',
  title: 'Six-week look-ahead',
  subtitle: 'Permit gates, weather windows, trades and deliveries — sequenced for site',
  scheduleLabel: 'LOOK-AHEAD 06 · SITE + SUPPLY CHAIN',
  riskLegendLabel: 'Hold point / late delivery',
  updatedLabel: 'SITE REPORT 06:45 · 08 SEP · DRY / 22°C',
  mark: 'RC',
  metrics: [
    { label: 'Open fronts', value: '4' },
    { label: 'Built on site', value: '47%', tone: 'positive' },
    { label: 'Hold points', value: '1', tone: 'danger' },
    { label: 'Next inspection', value: '11 Sep', tone: 'warning' },
  ],
  grid: {
    theme: 'adaptiveMaterial',
    rowSize: 32,
    rowHeaders: true,
    cellBorders: true,
  },
  tasks: CONSTRUCTION_TASKS,
  dependencies: CONSTRUCTION_DEPENDENCIES,
  calendars: CONSTRUCTION_CALENDARS,
  resources: CONSTRUCTION_RESOURCES,
  assignments: CONSTRUCTION_ASSIGNMENTS,
  baselines: CONSTRUCTION_BASELINES,
  columns: CONSTRUCTION_COLUMNS,
  gantt: CONSTRUCTION_GANTT_CONFIG,
  taskBarColorHook: ({ row }) => {
    const workflowStatus = row.workflowStatusKey ?? row.workflowStatus;
    const taskKind = row.taskKind ?? row.type;
    if (workflowStatus === 'blocked' || workflowStatus === 'Blocked') {
      return { barColor: '#c83b26', progressColor: '#88291e', borderColor: '#86291e', textColor: '#fffaf0' };
    }
    if (workflowStatus === 'done' || workflowStatus === 'Done') {
      return { barColor: '#8d958e', progressColor: '#3f534a', borderColor: '#59655f', textColor: '#fffaf0' };
    }
    if (taskKind === 'summary') {
      return { barColor: '#343b40', progressColor: '#f26722', borderColor: '#1f2529', textColor: '#fffaf0' };
    }
    if (taskKind === 'milestone') {
      return { barColor: '#f0a12d', progressColor: '#b76518', borderColor: '#8d551d', textColor: '#1f2529' };
    }
    if (workflowStatus === 'in-progress' || workflowStatus === 'In Progress') {
      return { barColor: '#f26722', progressColor: '#b74317', borderColor: '#9d3c17', textColor: '#1f2529' };
    }
    return { barColor: '#e1a34e', progressColor: '#f26722', borderColor: '#98631e', textColor: '#1f2529' };
  },
};
