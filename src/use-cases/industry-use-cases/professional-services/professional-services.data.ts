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

const CALENDAR_ID = 'psa-client-delivery';
const taskDefaults = {
  clientName: 'Portfolio',
  commercialModel: 'Mixed',
  projectCode: 'PSA-Q3',
  phase: 'Portfolio',
  owner: 'Elena Rossi',
  budgetBurn: '52%',
  grossMargin: '37%',
  calendarId: CALENDAR_ID,
  tags: [] as readonly string[],
};
const task = (
  row: Omit<IndustryTaskRow, keyof typeof taskDefaults> & Partial<Pick<IndustryTaskRow, keyof typeof taskDefaults>>,
): IndustryTaskRow => ({ ...taskDefaults, ...row } as IndustryTaskRow);

export const PROFESSIONAL_SERVICES_TASK_IDS = [
  'psa-portfolio',
  'orion',
  'orion-discovery',
  'orion-design',
  'orion-build',
  'orion-uat-readiness',
  'orion-uat',
  'orion-go-live',
  'meridian',
  'meridian-discovery',
  'meridian-design',
  'meridian-build',
  'meridian-review',
  'meridian-launch',
  'governance',
  'governance-steerco',
  'governance-commercial',
  'governance-capacity',
  'governance-close',
] as const;

export const PROFESSIONAL_SERVICES_TASKS: IndustryTaskRow[] = [
  task({ id: 'psa-portfolio', parentId: null, type: 'summary', name: 'Client delivery portfolio · Q3', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-10', endDate: '2026-10-23', duration: 55, percentDone: 43, risk: 'Senior consultant capacity' }),
  task({ id: 'orion', parentId: 'psa-portfolio', type: 'summary', name: 'Orion operating model rollout', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Delivery', owner: 'Elena Rossi', budgetBurn: '68%', grossMargin: '31%', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-10', endDate: '2026-10-02', duration: 40, percentDone: 58, risk: 'UAT readiness and shared specialist' }),
  task({ id: 'orion-discovery', parentId: 'orion', type: 'task', name: 'Discovery and process mapping', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Discovery', owner: 'Noah Williams', budgetBurn: '100%', grossMargin: '36%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-10', endDate: '2026-08-21', duration: 10, percentDone: 100 }),
  task({ id: 'orion-design', parentId: 'orion', type: 'task', name: 'Target operating model design', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Design', owner: 'Amelia Grant', budgetBurn: '92%', grossMargin: '33%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-24', endDate: '2026-09-04', duration: 10, percentDone: 100 }),
  task({ id: 'orion-build', parentId: 'orion', type: 'task', name: 'Workflow configuration and build', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Build', owner: 'Lucas Meyer', budgetBurn: '61%', grossMargin: '29%', statusLabel: 'In delivery', workflowStatus: 'in-progress', startDate: '2026-09-07', endDate: '2026-09-18', duration: 10, percentDone: 62 }),
  task({ id: 'orion-uat-readiness', parentId: 'orion', type: 'task', name: 'UAT readiness workshop', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'UAT', owner: 'Amelia Grant', budgetBurn: '18%', grossMargin: '24%', statusLabel: 'Capacity risk', workflowStatus: 'blocked', startDate: '2026-09-16', endDate: '2026-09-22', duration: 5, percentDone: 20, deadlineDate: '2026-09-21', risk: 'Senior consultant double-booked with Meridian' }),
  task({ id: 'orion-uat', parentId: 'orion', type: 'task', name: 'Client UAT and issue closure', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'UAT', owner: 'Sofia Martins', budgetBurn: '8%', grossMargin: '28%', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-23', endDate: '2026-09-30', duration: 6, percentDone: 0 }),
  task({ id: 'orion-go-live', parentId: 'orion', type: 'milestone', name: 'Orion go-live', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Go-live', owner: 'Elena Rossi', budgetBurn: '0%', grossMargin: '31%', statusLabel: 'Committed', workflowStatus: 'not-started', startDate: '2026-10-02', endDate: '2026-10-02', duration: 0, percentDone: 0, deadlineDate: '2026-10-02' }),
  task({ id: 'meridian', parentId: 'psa-portfolio', type: 'summary', name: 'Meridian analytics foundation', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'Delivery', owner: 'Priya Shah', budgetBurn: '39%', grossMargin: '44%', statusLabel: 'On track', workflowStatus: 'in-progress', startDate: '2026-08-31', endDate: '2026-10-16', duration: 35, percentDone: 34 }),
  task({ id: 'meridian-discovery', parentId: 'meridian', type: 'task', name: 'Data landscape discovery', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'Discovery', owner: 'Amelia Grant', budgetBurn: '88%', grossMargin: '46%', statusLabel: 'In delivery', workflowStatus: 'in-progress', startDate: '2026-08-31', endDate: '2026-09-08', duration: 7, percentDone: 84 }),
  task({ id: 'meridian-design', parentId: 'meridian', type: 'task', name: 'Platform and backlog design', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'Design', owner: 'Daniel Kim', budgetBurn: '32%', grossMargin: '45%', statusLabel: 'Ready', workflowStatus: 'not-started', startDate: '2026-09-09', endDate: '2026-09-18', duration: 8, percentDone: 0 }),
  task({ id: 'meridian-build', parentId: 'meridian', type: 'task', name: 'Analytics foundation build', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'Build', owner: 'Maya Chen', budgetBurn: '12%', grossMargin: '43%', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-21', endDate: '2026-10-07', duration: 13, percentDone: 0 }),
  task({ id: 'meridian-review', parentId: 'meridian', type: 'task', name: 'Client validation and enablement', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'UAT', owner: 'Priya Shah', budgetBurn: '0%', grossMargin: '42%', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-10-08', endDate: '2026-10-14', duration: 5, percentDone: 0 }),
  task({ id: 'meridian-launch', parentId: 'meridian', type: 'milestone', name: 'Meridian launch', clientName: 'Meridian Bank', commercialModel: 'Time & materials', projectCode: 'MER-1096', phase: 'Go-live', owner: 'Priya Shah', budgetBurn: '0%', grossMargin: '44%', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-16', endDate: '2026-10-16', duration: 0, percentDone: 0 }),
  task({ id: 'governance', parentId: 'psa-portfolio', type: 'summary', name: 'Portfolio governance', clientName: 'Portfolio', commercialModel: 'Mixed', projectCode: 'PSA-Q3', phase: 'Governance', owner: 'Elena Rossi', budgetBurn: '51%', grossMargin: '37%', statusLabel: 'Active', workflowStatus: 'in-progress', startDate: '2026-08-28', endDate: '2026-10-23', duration: 41, percentDone: 48 }),
  task({ id: 'governance-steerco', parentId: 'governance', type: 'milestone', name: 'September steering committee', clientName: 'Portfolio', commercialModel: 'Mixed', projectCode: 'PSA-Q3', phase: 'Governance', owner: 'Elena Rossi', budgetBurn: '100%', grossMargin: '37%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-09-04', endDate: '2026-09-04', duration: 0, percentDone: 100 }),
  task({ id: 'governance-commercial', parentId: 'governance', type: 'task', name: 'Fixed-fee burn and margin review', clientName: 'Orion Foods', commercialModel: 'Fixed fee', projectCode: 'ORI-2418', phase: 'Governance', owner: 'Fatima Costa', budgetBurn: '54%', grossMargin: '31%', statusLabel: 'In review', workflowStatus: 'in-progress', startDate: '2026-09-10', endDate: '2026-09-14', duration: 3, percentDone: 55 }),
  task({ id: 'governance-capacity', parentId: 'governance', type: 'task', name: 'Senior consultant capacity review', clientName: 'Portfolio', commercialModel: 'Mixed', projectCode: 'PSA-Q3', phase: 'Governance', owner: 'Elena Rossi', budgetBurn: '0%', grossMargin: '37%', statusLabel: 'Action needed', workflowStatus: 'blocked', startDate: '2026-09-15', endDate: '2026-09-18', duration: 4, percentDone: 10, risk: 'Resolve Amelia Grant overlap before UAT' }),
  task({ id: 'governance-close', parentId: 'governance', type: 'milestone', name: 'Q3 portfolio close', clientName: 'Portfolio', commercialModel: 'Mixed', projectCode: 'PSA-Q3', phase: 'Governance', owner: 'Elena Rossi', budgetBurn: '0%', grossMargin: '37%', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-23', endDate: '2026-10-23', duration: 0, percentDone: 0 }),
];

export const PROFESSIONAL_SERVICES_CALENDARS: CalendarEntity[] = [{
  id: CALENDAR_ID,
  name: 'Client delivery calendar',
  timeZone: 'Europe/Lisbon',
  workingDays: [1, 2, 3, 4, 5],
  workingHours: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }],
  holidays: ['2026-10-05'],
  hoursPerDay: 8,
}];

export const PROFESSIONAL_SERVICES_RESOURCES: ResourceEntity[] = [
  ['elena', 'Elena Rossi', 'Portfolio director', 190],
  ['noah', 'Noah Williams', 'Engagement lead', 165],
  ['amelia', 'Amelia Grant', 'Senior consultant', 180],
  ['lucas', 'Lucas Meyer', 'Solution consultant', 145],
  ['sofia', 'Sofia Martins', 'Change consultant', 135],
  ['priya', 'Priya Shah', 'Engagement lead', 170],
  ['daniel', 'Daniel Kim', 'Data architect', 175],
  ['maya', 'Maya Chen', 'Data engineer', 150],
  ['fatima', 'Fatima Costa', 'Commercial manager', 130],
].map(([id, name, role, hourlyCost]) => ({ id, name, role, calendarId: CALENDAR_ID, allocationCapacity: 1, hourlyCost } as ResourceEntity));

const ownerResource: Record<string, string> = {
  'Elena Rossi': 'elena', 'Noah Williams': 'noah', 'Amelia Grant': 'amelia', 'Lucas Meyer': 'lucas', 'Sofia Martins': 'sofia',
  'Priya Shah': 'priya', 'Daniel Kim': 'daniel', 'Maya Chen': 'maya', 'Fatima Costa': 'fatima',
};
const taskOwnerAssignments: AssignmentEntity[] = PROFESSIONAL_SERVICES_TASKS
  .filter(({ type }) => type !== 'summary')
  .map((item, index) => ({ id: `psa-a-${index + 1}`, taskId: item.id, resourceId: ownerResource[item.owner!], allocationUnits: item.id === 'meridian-discovery' ? 0.75 : 1, responsibility: 'Owner' }));
export const PROFESSIONAL_SERVICES_ASSIGNMENTS: AssignmentEntity[] = [
  ...taskOwnerAssignments,
  { id: 'psa-a-capacity-overlap', taskId: 'meridian-design', resourceId: 'amelia', allocationUnits: 0.5, responsibility: 'Solution assurance' },
];

const dependencyPairs = [
  ['orion-discovery', 'orion-design', 'finish-to-start'],
  ['orion-design', 'orion-build', 'finish-to-start'],
  ['orion-design', 'orion-uat-readiness', 'finish-to-start'],
  ['orion-build', 'orion-uat', 'finish-to-start'],
  ['orion-uat-readiness', 'orion-uat', 'finish-to-start'],
  ['orion-uat', 'orion-go-live', 'finish-to-start'],
  ['meridian-discovery', 'meridian-design', 'finish-to-start'],
  ['meridian-design', 'meridian-build', 'finish-to-start'],
  ['meridian-build', 'meridian-review', 'finish-to-start'],
  ['meridian-review', 'meridian-launch', 'finish-to-start'],
  ['governance-steerco', 'governance-commercial', 'finish-to-start'],
  ['governance-commercial', 'governance-capacity', 'finish-to-start'],
  ['orion-go-live', 'governance-close', 'finish-to-start'],
  ['meridian-launch', 'governance-close', 'finish-to-start'],
] as const;
export const PROFESSIONAL_SERVICES_DEPENDENCIES: DependencyEntity[] = dependencyPairs.map(
  ([predecessorTaskId, successorTaskId, type], index) => ({ id: `psa-d-${index + 1}`, predecessorTaskId, successorTaskId, type, lagDays: 0 }),
);

const approvedDateOverrides: Record<string, readonly [string, string]> = {
  orion: ['2026-08-10', '2026-09-29'],
  'orion-build': ['2026-09-07', '2026-09-16'],
  'orion-uat-readiness': ['2026-09-14', '2026-09-18'],
  'orion-uat': ['2026-09-21', '2026-09-25'],
  'orion-go-live': ['2026-09-29', '2026-09-29'],
  governance: ['2026-08-28', '2026-10-20'],
  'governance-close': ['2026-10-20', '2026-10-20'],
};
export const PROFESSIONAL_SERVICES_BASELINES: BaselineSnapshot[] = [{
  id: 'psa-approved-q3',
  name: 'Approved Q3 client plan',
  capturedAt: '2026-08-07T11:00:00Z',
  tasks: PROFESSIONAL_SERVICES_TASKS.map((item) => {
    const [startDate, endDate] = approvedDateOverrides[item.id] ?? [item.startDate, item.endDate ?? item.startDate];
    return { taskId: item.id, startDate, endDate, duration: item.type === 'milestone' ? 0 : Number(item.duration) * 8, progressPercent: 0 };
  }),
} as BaselineSnapshot];

type PsaCellRole = 'client' | 'engagement' | 'team';
type PsaCellContext = Parameters<NonNullable<ColumnRegular['cellProperties']>>[0];

const psaCellProperties = (role: PsaCellRole) => ({ model }: PsaCellContext) => {
  const taskModel = model as IndustryTaskRow;
  const workflowStatus = resolveIndustryWorkflowStatus(taskModel);
  return {
    class: {
      'psa-grid-cell': true,
      [`psa-grid-cell--${role}`]: true,
      'psa-grid-cell--portfolio-root': taskModel.id === 'psa-portfolio',
      'psa-grid-cell--engagement-group': taskModel.type === 'summary' && taskModel.id !== 'psa-portfolio',
      'psa-grid-cell--orion': taskModel.projectCode === 'ORI-2418',
      'psa-grid-cell--meridian': taskModel.projectCode === 'MER-1096',
      'psa-grid-cell--governance': taskModel.id === 'governance' || taskModel.parentId === 'governance',
      'psa-grid-cell--risk': workflowStatus === 'blocked',
      'psa-grid-cell--done': workflowStatus === 'done',
      'psa-grid-cell--milestone': taskModel.type === 'milestone',
    },
  };
};

const healthLabel = (model: IndustryTaskRow) => {
  const workflowStatus = resolveIndustryWorkflowStatus(model);
  if (workflowStatus === 'blocked') return 'Watch';
  if (workflowStatus === 'done') return 'Done';
  if (workflowStatus === 'in-progress') return 'Active';
  return 'Ready';
};

const clientTone = (model: IndustryTaskRow) => model.projectCode === 'ORI-2418'
  ? 'orion'
  : model.projectCode === 'MER-1096'
    ? 'meridian'
    : model.id === 'governance' || model.parentId === 'governance'
      ? 'governance'
      : 'portfolio';

const clientColumn: ColumnRegular = {
  prop: 'clientName', name: 'Client', size: 114, readonly: true,
  cellProperties: psaCellProperties('client'),
  cellTemplate: (h, { model }) => h('div', { class: 'psa-client-cell', title: `${model.clientName} · ${model.projectCode}` }, [
    h('span', { class: 'psa-client-cell__identity' }, [
      h('span', { class: `psa-client-cell__dot psa-client-cell__dot--${clientTone(model as IndustryTaskRow)}`, 'aria-hidden': 'true' }),
      h('span', { class: 'psa-client-cell__name' }, model.clientName),
    ]),
    h('span', { class: 'psa-client-cell__details' }, [
      h('span', { class: 'psa-client-cell__code' }, model.projectCode),
      h('span', { class: `psa-health-label psa-health-label--${resolveIndustryWorkflowStatus(model as IndustryTaskRow)}` }, healthLabel(model as IndustryTaskRow)),
    ]),
  ]),
};
const ownerColumn: ColumnRegular = {
  prop: 'owner', name: 'Team / terms', size: 135, readonly: true,
  cellProperties: psaCellProperties('team'),
  cellTemplate: (h, { model }) => h('div', { class: 'psa-consultant', title: model.owner }, [
    h('span', { class: `psa-consultant__avatar psa-consultant__avatar--${clientTone(model as IndustryTaskRow)}`, 'aria-hidden': 'true' }, String(model.owner ?? '').split(' ').map((part: string) => part[0]).slice(0, 2).join('')),
    h('span', { class: 'psa-consultant__copy' }, [
      h('span', { class: 'psa-consultant__name' }, String(model.owner ?? '').split(' ')[0]),
      h('span', { class: 'psa-consultant__meta' }, [
        h('span', { class: 'psa-context-label psa-context-label--phase' }, model.phase),
        h('span', { class: 'psa-context-label psa-context-label--terms' }, model.commercialModel === 'Time & materials' ? 'T&M' : model.commercialModel),
        h('span', { class: 'psa-context-label psa-context-label--margin' }, model.grossMargin),
      ]),
    ]),
  ]),
};
const engagementColumn: ColumnRegular = {
  ...createDefaultTaskTableColumn('name'),
  name: 'Engagement / phase',
  size: 142,
  cellProperties: psaCellProperties('engagement'),
};
export const PROFESSIONAL_SERVICES_COLUMNS: ColumnRegular[] = [
  clientColumn,
  engagementColumn,
  ownerColumn,
];

export const PROFESSIONAL_SERVICES_GANTT_CONFIG: GanttPluginConfig = {
  id: 'psa-client-portfolio-q3-2026',
  name: 'Client delivery portfolio · Q3',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: CALENDAR_ID,
  updatedAt: '2026-09-08T09:15:00Z',
  statusDate: '2026-09-08',
  zoomPreset: 'day-week',
  weekStartsOn: 1,
  allowTaskCreate: false,
  scheduling: { excludeHolidaysFromDuration: true, taskModeDefault: 'auto', autoDependencyViolationBehavior: 'warn', lagCalendar: 'working-days', resourceLeveling: 'warn' },
  dateFormats: { locale: 'en-GB', timeZone: 'Europe/Lisbon', table: { day: '2-digit', month: 'short' } },
  visuals: {
    showDependencies: true,
    showBaseline: false,
    baselineId: 'psa-approved-q3',
    showCriticalPath: true,
    showTaskLabels: 'tasks',
    shadeNonWorkingTime: true,
    showTodayLine: false,
    projectLineDate: '2026-09-08',
    timeRanges: [{ id: 'psa-capacity-window', startDate: '2026-09-14', endDate: '2026-09-22', label: 'Capacity recovery', color: '#fff1f0' }],
    milestoneLines: [{ id: 'orion-commit', date: '2026-10-02', label: 'Orion go-live', color: '#147d87' }, { id: 'meridian-forecast', date: '2026-10-16', label: 'Meridian launch', color: '#5b4bdb' }],
    taskTooltipFields: ['status', 'startDate', 'endDate', 'percentDone', 'assignees'],
  },
};

export const PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION: IndustryGanttDefinition = {
  id: 'industry-professional-services',
  productLabel: 'Helio Consulting Studio · Client Portfolio',
  title: 'Client work, beautifully aligned',
  subtitle: 'People, promises and commercial health across every active engagement',
  scheduleLabel: 'Client engagements · August—October 2026',
  riskLegendLabel: 'Senior capacity watch',
  updatedLabel: 'Studio plan refreshed 09:15 · 8 Sep 2026',
  mark: 'H',
  metrics: [
    { label: 'Client engagements', value: '02' },
    { label: 'Team utilisation', value: '82%', tone: 'positive' },
    { label: 'Needs attention', value: '01', tone: 'danger' },
    { label: 'Blended margin', value: '37%', tone: 'warning' },
  ],
  grid: { theme: 'adaptiveMaterial', rowSize: 40, rowHeaders: false, cellBorders: false, timelinePanelWidth: '66%' },
  tasks: PROFESSIONAL_SERVICES_TASKS,
  dependencies: PROFESSIONAL_SERVICES_DEPENDENCIES,
  calendars: PROFESSIONAL_SERVICES_CALENDARS,
  resources: PROFESSIONAL_SERVICES_RESOURCES,
  assignments: PROFESSIONAL_SERVICES_ASSIGNMENTS,
  baselines: PROFESSIONAL_SERVICES_BASELINES,
  columns: PROFESSIONAL_SERVICES_COLUMNS,
  gantt: PROFESSIONAL_SERVICES_GANTT_CONFIG,
  taskBarColorHook: ({ row }) => {
    const workflowStatus = resolveIndustryWorkflowStatus(row);
    return workflowStatus === 'blocked'
      ? { barColor: '#e95143', progressColor: '#c83f35', borderColor: '#d7453a', textColor: '#fff' }
      : workflowStatus === 'done'
        ? { barColor: '#88aaa2', progressColor: '#587c74', borderColor: '#76948d', textColor: '#fff' }
        : { barColor: '#52aa9c', progressColor: '#277f77', borderColor: '#3a9488', textColor: '#153c39' };
  },
};
