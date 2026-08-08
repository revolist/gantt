import type { ColumnRegular } from '@revolist/revogrid';
import {
  createDefaultTaskTableColumn,
  type AssignmentEntity,
  type BaselineSnapshot,
  type CalendarEntity,
  type DependencyEntity,
  type GanttPluginConfig,
  type ResourceEntity,
} from '@revolist/revogrid-enterprise';
import { resolveIndustryWorkflowStatus, type IndustryGanttDefinition, type IndustryTaskRow } from '../industry-use-case.types';

const FULL_TIME_CALENDAR_ID = 'resource-full-time';
const FLEX_CALENDAR_ID = 'resource-flex-four-day';
const TEST_LAB_CALENDAR_ID = 'resource-test-lab';
const taskDefaults = {
  projectCode: 'PORT-Q4',
  team: 'Portfolio',
  role: 'Delivery lead',
  owner: 'Elena Costa',
  allocation: '—',
  calendarId: FULL_TIME_CALENDAR_ID,
  tags: [] as readonly string[],
};
const task = (
  row: Omit<IndustryTaskRow, keyof typeof taskDefaults> & Partial<Pick<IndustryTaskRow, keyof typeof taskDefaults>>,
): IndustryTaskRow => ({ ...taskDefaults, ...row } as IndustryTaskRow);

export const RESOURCE_PLANNING_TASK_IDS = [
  'capacity-portfolio',
  'solution-architect-overlap-review',
  'test-lab-booking-review',
  'product-launch',
  'launch-brief',
  'product-solution-blueprint',
  'integration-build',
  'product-lab-validation',
  'release-readiness',
  'product-go-live',
  'client-onboarding',
  'client-discovery',
  'client-solution-design',
  'client-data-migration',
  'client-lab-validation',
  'client-handoff',
  'operations-readiness',
  'support-coverage-model',
  'test-lab-certification',
  'operations-runbook',
  'operations-ready',
  'portfolio-release-gate',
] as const;

export const RESOURCE_PLANNING_TASKS: IndustryTaskRow[] = [
  task({ id: 'capacity-portfolio', parentId: null, type: 'summary', name: 'Q4 delivery capacity portfolio', statusLabel: 'Needs alignment', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-10-23', duration: 60, percentDone: 47, risk: 'Two shared-capacity decisions need agreement across delivery leads' }),
  task({ id: 'solution-architect-overlap-review', parentId: 'capacity-portfolio', type: 'task', name: 'Solution architect overlap review', projectCode: 'PORT-Q4', team: 'Portfolio', role: 'Capacity decision', owner: 'Elena Costa', allocation: 'Shared 150%', statusLabel: 'Planning conversation', workflowStatus: 'blocked', startDate: '2026-08-10', endDate: '2026-08-14', duration: 5, percentDone: 25, deadlineDate: '2026-08-14', risk: 'Delivery leads agree which sessions need the architect live and which can use delegated review' }),
  task({ id: 'test-lab-booking-review', parentId: 'capacity-portfolio', type: 'task', name: 'Test lab booking review', projectCode: 'PORT-Q4', team: 'Portfolio', role: 'Capacity decision', owner: 'Elena Costa', allocation: 'Shared 175%', statusLabel: 'Planning conversation', workflowStatus: 'blocked', startDate: '2026-09-24', endDate: '2026-09-25', duration: 2, percentDone: 0, deadlineDate: '2026-09-25', risk: 'Owners agree a safe validation sequence; the warning is about the plan, not the teams' }),

  task({ id: 'product-launch', parentId: 'capacity-portfolio', type: 'summary', name: 'Atlas product launch', projectCode: 'ATL-2608', team: 'Product', role: 'Launch team', owner: 'Maria Lopes', allocation: '6 people', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-10-12', duration: 51, percentDone: 61, risk: 'Architecture and test-lab capacity reduce release recovery time' }),
  task({ id: 'launch-brief', parentId: 'product-launch', type: 'task', name: 'Launch brief and scope agreement', projectCode: 'ATL-2608', team: 'Product', role: 'Product lead', owner: 'Maria Lopes', allocation: '100%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-03', endDate: '2026-08-14', duration: 10, percentDone: 100 }),
  task({ id: 'product-solution-blueprint', parentId: 'product-launch', type: 'task', name: 'Product solution blueprint', projectCode: 'ATL-2608', team: 'Architecture', role: 'Solution architect', owner: 'Amina Rahman', allocation: '100%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-17', endDate: '2026-09-04', duration: 15, percentDone: 100, risk: 'Overlaps client solution design at 50% for ten working days' }),
  task({ id: 'integration-build', parentId: 'product-launch', type: 'task', name: 'Platform integration build', projectCode: 'ATL-2608', team: 'Engineering', role: 'Integration squad', owner: 'Theo Martins', allocation: '2.0 FTE', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-09-07', endDate: '2026-09-23', duration: 13, percentDone: 36 }),
  task({ id: 'product-lab-validation', parentId: 'product-launch', type: 'task', name: 'Atlas release validation in Test Lab A', projectCode: 'ATL-2608', team: 'Quality', role: 'QA lead + lab', owner: 'Julian Park', allocation: 'Lab 100%', calendarId: TEST_LAB_CALENDAR_ID, statusLabel: 'Capacity conflict', workflowStatus: 'blocked', startDate: '2026-09-28', endDate: '2026-10-02', duration: 5, percentDone: 0, risk: 'Test Lab A also carries the client validation booking' }),
  task({ id: 'release-readiness', parentId: 'product-launch', type: 'task', name: 'Release readiness and support sign-off', projectCode: 'ATL-2608', team: 'Release', role: 'Release manager', owner: 'Elena Costa', allocation: '60%', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-10-05', endDate: '2026-10-09', duration: 5, percentDone: 0, deadlineDate: '2026-10-09' }),
  task({ id: 'product-go-live', parentId: 'product-launch', type: 'milestone', name: 'Atlas production release', projectCode: 'ATL-2608', team: 'Release', role: 'Release gate', owner: 'Elena Costa', allocation: 'Milestone', statusLabel: 'Committed', workflowStatus: 'not-started', startDate: '2026-10-12', endDate: '2026-10-12', duration: 0, percentDone: 0, deadlineDate: '2026-10-12' }),

  task({ id: 'client-onboarding', parentId: 'capacity-portfolio', type: 'summary', name: 'Northstar client onboarding', projectCode: 'NST-2611', team: 'Client delivery', role: 'Onboarding team', owner: 'Priya Nair', allocation: '5 people', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-10', endDate: '2026-10-16', duration: 50, percentDone: 49, risk: 'Shared architect and lab bookings may move the handoff' }),
  task({ id: 'client-discovery', parentId: 'client-onboarding', type: 'task', name: 'Client discovery and success plan', projectCode: 'NST-2611', team: 'Client delivery', role: 'Engagement lead', owner: 'Priya Nair', allocation: '100%', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-10', endDate: '2026-08-21', duration: 10, percentDone: 100 }),
  task({ id: 'client-solution-design', parentId: 'client-onboarding', type: 'task', name: 'Client solution design', projectCode: 'NST-2611', team: 'Architecture', role: 'Solution architect', owner: 'Amina Rahman', allocation: '50%', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-08-24', endDate: '2026-09-11', duration: 15, percentDone: 72, risk: 'The shared architecture role is at 150% while the Atlas blueprint remains active' }),
  task({ id: 'client-data-migration', parentId: 'client-onboarding', type: 'task', name: 'Customer data migration rehearsal', projectCode: 'NST-2611', team: 'Data services', role: 'Data engineer', owner: 'Daniel Kim', allocation: '100%', statusLabel: 'Ready', workflowStatus: 'not-started', startDate: '2026-09-14', endDate: '2026-10-02', duration: 15, percentDone: 15 }),
  task({ id: 'client-lab-validation', parentId: 'client-onboarding', type: 'task', name: 'Northstar integration validation in Test Lab A', projectCode: 'NST-2611', team: 'Quality', role: 'QA lead + lab', owner: 'Julian Park', allocation: 'Lab 75%', calendarId: TEST_LAB_CALENDAR_ID, statusLabel: 'Capacity conflict', workflowStatus: 'blocked', startDate: '2026-09-28', endDate: '2026-10-09', duration: 10, percentDone: 0, risk: 'Urgent validation overlaps Atlas and lab certification bookings' }),
  task({ id: 'client-handoff', parentId: 'client-onboarding', type: 'milestone', name: 'Northstar onboarding handoff', projectCode: 'NST-2611', team: 'Client delivery', role: 'Client success gate', owner: 'Priya Nair', allocation: 'Milestone', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-16', endDate: '2026-10-16', duration: 0, percentDone: 0, deadlineDate: '2026-10-15', risk: 'One-day variance remains until shared-lab capacity is agreed' }),

  task({ id: 'operations-readiness', parentId: 'capacity-portfolio', type: 'summary', name: 'Operations readiness', projectCode: 'OPS-2609', team: 'Operations', role: 'Readiness team', owner: 'Marcus Reed', allocation: '4 people', statusLabel: 'On track', workflowStatus: 'in-progress', startDate: '2026-08-31', endDate: '2026-10-13', duration: 32, percentDone: 35 }),
  task({ id: 'support-coverage-model', parentId: 'operations-readiness', type: 'task', name: 'Support coverage and rota design', projectCode: 'OPS-2609', team: 'Support', role: 'Service lead', owner: 'Sofia Duarte', allocation: '60%', calendarId: FLEX_CALENDAR_ID, statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-08-31', endDate: '2026-09-18', duration: 12, percentDone: 58 }),
  task({ id: 'test-lab-certification', parentId: 'operations-readiness', type: 'task', name: 'Test Lab A operations certification', projectCode: 'OPS-2609', team: 'Operations', role: 'Lab coordinator', owner: 'Noor Hassan', allocation: 'Lab 100%', calendarId: TEST_LAB_CALENDAR_ID, statusLabel: 'Capacity conflict', workflowStatus: 'blocked', startDate: '2026-10-05', endDate: '2026-10-09', duration: 5, percentDone: 0, risk: 'Certification competes with the final client validation window' }),
  task({ id: 'operations-runbook', parentId: 'operations-readiness', type: 'task', name: 'Incident and release runbook', projectCode: 'OPS-2609', team: 'Operations', role: 'Operations lead', owner: 'Marcus Reed', allocation: '75%', statusLabel: 'Planned', workflowStatus: 'not-started', startDate: '2026-09-21', endDate: '2026-10-09', duration: 15, percentDone: 0 }),
  task({ id: 'operations-ready', parentId: 'operations-readiness', type: 'milestone', name: 'Operations ready for launch', projectCode: 'OPS-2609', team: 'Operations', role: 'Readiness gate', owner: 'Marcus Reed', allocation: 'Milestone', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-13', endDate: '2026-10-13', duration: 0, percentDone: 0 }),

  task({ id: 'portfolio-release-gate', parentId: 'capacity-portfolio', type: 'milestone', name: 'Portfolio release and handoff gate', projectCode: 'PORT-Q4', team: 'Portfolio', role: 'Executive gate', owner: 'Elena Costa', allocation: 'Milestone', statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-23', endDate: '2026-10-23', duration: 0, percentDone: 0, deadlineDate: '2026-10-23' }),
];

export const RESOURCE_PLANNING_CALENDARS: CalendarEntity[] = [
  { id: FULL_TIME_CALENDAR_ID, name: 'Portfolio full-time calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4, 5], workingHours: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }], holidays: ['2026-10-05'], hoursPerDay: 8 },
  { id: FLEX_CALENDAR_ID, name: 'Flexible four-day delivery calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4], workingHours: [{ start: '09:00', end: '12:30' }, { start: '13:30', end: '16:00' }], holidays: [], hoursPerDay: 6 },
  { id: TEST_LAB_CALENDAR_ID, name: 'Test Lab A booking calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4, 5], workingHours: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }], holidays: [], hoursPerDay: 8 },
];

export const RESOURCE_PLANNING_RESOURCES: ResourceEntity[] = [
  { id: 'portfolio-lead', name: 'Elena Costa', role: 'Portfolio delivery lead', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 170 },
  { id: 'product-lead', name: 'Maria Lopes', role: 'Product lead', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 145 },
  { id: 'solution-architect', name: 'Amina Rahman', role: 'Solution architect', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 185 },
  { id: 'integration-squad', name: 'Atlas integration squad', role: 'Product engineering team', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 2, hourlyCost: 290 },
  { id: 'qa-lead', name: 'Julian Park', role: 'Quality assurance lead', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 150 },
  { id: 'client-lead', name: 'Priya Nair', role: 'Client delivery lead', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 165 },
  { id: 'data-engineer', name: 'Daniel Kim', role: 'Data engineer', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 155 },
  { id: 'service-lead', name: 'Sofia Duarte', role: 'Service lead', calendarId: FLEX_CALENDAR_ID, allocationCapacity: 0.75, hourlyCost: 135 },
  { id: 'operations-lead', name: 'Marcus Reed', role: 'Operations lead', calendarId: FULL_TIME_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 150 },
  { id: 'lab-coordinator', name: 'Noor Hassan', role: 'Lab coordinator', calendarId: TEST_LAB_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 125 },
  { id: 'test-lab-a', name: 'Test Lab A', role: 'Shared validation facility', calendarId: TEST_LAB_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 220 },
];

const primaryAssignments = [
  ['launch-brief', 'product-lead', 1, 'Product owner'],
  ['product-solution-blueprint', 'solution-architect', 1, 'Lead architect'],
  ['integration-build', 'integration-squad', 2, 'Delivery squad'],
  ['product-lab-validation', 'qa-lead', 0.5, 'Validation lead'],
  ['release-readiness', 'portfolio-lead', 0.6, 'Release manager'],
  ['product-go-live', 'portfolio-lead', 0.4, 'Release gate owner'],
  ['client-discovery', 'client-lead', 1, 'Engagement lead'],
  ['client-solution-design', 'solution-architect', 0.5, 'Solution design'],
  ['client-data-migration', 'data-engineer', 1, 'Migration lead'],
  ['client-lab-validation', 'qa-lead', 0.5, 'Validation lead'],
  ['client-handoff', 'client-lead', 0.5, 'Client handoff owner'],
  ['support-coverage-model', 'service-lead', 0.6, 'Coverage design'],
  ['test-lab-certification', 'lab-coordinator', 1, 'Certification lead'],
  ['operations-runbook', 'operations-lead', 0.75, 'Runbook owner'],
  ['operations-ready', 'operations-lead', 0.25, 'Readiness gate owner'],
  ['solution-architect-overlap-review', 'portfolio-lead', 0.4, 'Facilitates capacity conversation'],
  ['test-lab-booking-review', 'portfolio-lead', 0.4, 'Facilitates booking decision'],
  ['portfolio-release-gate', 'portfolio-lead', 0.4, 'Portfolio gate owner'],
] as const;

export const RESOURCE_PLANNING_ASSIGNMENTS: AssignmentEntity[] = [
  ...primaryAssignments.map(([taskId, resourceId, allocationUnits, responsibility], index) => ({
    id: `resource-a-${index + 1}`,
    taskId,
    resourceId,
    allocationUnits,
    responsibility,
  })),
  { id: 'resource-a-product-lab', taskId: 'product-lab-validation', resourceId: 'test-lab-a', allocationUnits: 1, responsibility: 'Reserved validation facility' },
  { id: 'resource-a-client-lab', taskId: 'client-lab-validation', resourceId: 'test-lab-a', allocationUnits: 0.75, responsibility: 'Reserved validation facility' },
  { id: 'resource-a-certification-lab', taskId: 'test-lab-certification', resourceId: 'test-lab-a', allocationUnits: 1, responsibility: 'Facility certification window' },
  { id: 'resource-a-architect-demand-review', taskId: 'solution-architect-overlap-review', resourceId: 'solution-architect', allocationUnits: 150, responsibility: 'Consolidated portfolio demand at the decision point' },
  { id: 'resource-a-lab-demand-review', taskId: 'test-lab-booking-review', resourceId: 'test-lab-a', allocationUnits: 175, responsibility: 'Consolidated booking pressure at the decision point' },
  { id: 'resource-a-lab-coordinator-review', taskId: 'test-lab-booking-review', resourceId: 'lab-coordinator', allocationUnits: 0.5, responsibility: 'Booking options and safety review' },
];

const dependencyPairs = [
  ['launch-brief', 'product-solution-blueprint', 'finish-to-start', 0],
  ['product-solution-blueprint', 'integration-build', 'finish-to-start', 0],
  ['integration-build', 'product-lab-validation', 'finish-to-start', 2],
  ['product-lab-validation', 'release-readiness', 'finish-to-start', 0],
  ['release-readiness', 'product-go-live', 'finish-to-start', 1],
  ['client-discovery', 'client-solution-design', 'finish-to-start', 0],
  ['client-solution-design', 'client-data-migration', 'finish-to-start', 0],
  ['client-data-migration', 'client-lab-validation', 'start-to-start', 10],
  ['client-lab-validation', 'client-handoff', 'finish-to-start', 4],
  ['support-coverage-model', 'operations-runbook', 'finish-to-start', 0],
  ['operations-runbook', 'operations-ready', 'finish-to-start', 1],
  ['test-lab-certification', 'operations-ready', 'finish-to-start', 1],
  ['solution-architect-overlap-review', 'product-solution-blueprint', 'finish-to-start', 0],
  ['solution-architect-overlap-review', 'client-solution-design', 'finish-to-start', 0],
  ['solution-architect-overlap-review', 'release-readiness', 'finish-to-start', 0],
  ['solution-architect-overlap-review', 'client-data-migration', 'finish-to-start', 10],
  ['integration-build', 'test-lab-booking-review', 'finish-to-start', 0],
  ['test-lab-booking-review', 'product-lab-validation', 'finish-to-start', 0],
  ['test-lab-booking-review', 'client-lab-validation', 'finish-to-start', 0],
  ['test-lab-booking-review', 'test-lab-certification', 'finish-to-start', 5],
  ['product-go-live', 'portfolio-release-gate', 'finish-to-start', 8],
  ['client-handoff', 'portfolio-release-gate', 'finish-to-start', 5],
  ['operations-ready', 'portfolio-release-gate', 'finish-to-start', 7],
] as const;

export const RESOURCE_PLANNING_DEPENDENCIES: DependencyEntity[] = dependencyPairs.map(
  ([predecessorTaskId, successorTaskId, type, lagDays], index) => ({
    id: `resource-d-${index + 1}`,
    predecessorTaskId,
    successorTaskId,
    type,
    lagDays,
  }),
);

const approvedDates: Readonly<Record<string, readonly [string, string]>> = {
  'capacity-portfolio': ['2026-08-03', '2026-10-20'],
  'product-launch': ['2026-08-03', '2026-10-09'],
  'integration-build': ['2026-09-07', '2026-09-21'],
  'product-lab-validation': ['2026-09-22', '2026-09-25'],
  'release-readiness': ['2026-09-28', '2026-10-02'],
  'product-go-live': ['2026-10-09', '2026-10-09'],
  'client-onboarding': ['2026-08-10', '2026-10-15'],
  'client-lab-validation': ['2026-09-30', '2026-10-07'],
  'client-handoff': ['2026-10-15', '2026-10-15'],
  'operations-readiness': ['2026-08-31', '2026-10-12'],
  'test-lab-certification': ['2026-10-08', '2026-10-09'],
  'operations-ready': ['2026-10-12', '2026-10-12'],
  'portfolio-release-gate': ['2026-10-20', '2026-10-20'],
};

export const RESOURCE_PLANNING_BASELINES: BaselineSnapshot[] = [{
  id: 'resource-approved-q4-capacity',
  name: 'Approved Q4 capacity plan',
  capturedAt: '2026-07-31T16:00:00Z',
  tasks: RESOURCE_PLANNING_TASKS.map((item) => {
    const [startDate, endDate] = approvedDates[item.id] ?? [item.startDate, item.endDate ?? item.startDate];
    return {
      taskId: item.id,
      startDate,
      endDate,
      duration: item.type === 'milestone' ? 0 : Number(item.duration) * 8,
      progressPercent: 0,
    };
  }),
} as BaselineSnapshot];

const resourceCellProperties = (role: 'name' | 'role' | 'capacity' | 'peak') => () => ({
  class: {
    'capacity-grid-cell': true,
    [`capacity-grid-cell--${role}`]: true,
  },
});

const capacityColumn: ColumnRegular = {
  ...createDefaultTaskTableColumn('resourceCapacity'),
  name: 'Cap.',
  size: 62,
  sortable: false,
  filter: false,
  columnProperties: () => ({ title: 'Capacity' }),
  cellProperties: resourceCellProperties('capacity'),
  cellTemplate: (h, { model }) => h('span', {
    class: 'capacity-resource-capacity',
    title: `${model.name} capacity`,
  }, model.resourceCapacity || '—'),
};

const resourceRoleColumn: ColumnRegular = {
  ...createDefaultTaskTableColumn('resourceRole'),
  name: 'Role',
  size: 106,
  sortable: false,
  filter: false,
  cellProperties: resourceCellProperties('role'),
  cellTemplate: (h, { model }) => h('span', {
    class: 'capacity-resource-role',
    title: `${model.name} · ${model.resourceRole}`,
  }, model.resourceRole || '—'),
};

const peakLoadColumn: ColumnRegular = {
  ...createDefaultTaskTableColumn('resourceLoadSummary'),
  name: 'Peak',
  size: 54,
  sortable: false,
  filter: false,
  columnProperties: () => ({ title: 'Peak load' }),
  cellProperties: resourceCellProperties('peak'),
  cellTemplate: (h, { model }) => {
    const loadSummary = String(model.resourceLoadSummary ?? 'No load');
    const peak = Number.parseFloat(loadSummary);
    const overCapacity = Number.isFinite(peak) && peak > 100;
    return h('span', {
      class: `capacity-resource-load${overCapacity ? ' capacity-resource-load--conversation' : ''}`,
      title: overCapacity
        ? `${model.name} is above planned capacity; open a planning conversation`
        : `${model.name} · ${loadSummary}`,
    }, loadSummary.replace(/\s+max$/i, ''));
  },
};

export const RESOURCE_PLANNING_COLUMNS: ColumnRegular[] = [
  { ...createDefaultTaskTableColumn('name'), name: 'Resource', size: 162, sortable: false, filter: false, cellProperties: resourceCellProperties('name') },
  resourceRoleColumn,
  capacityColumn,
  peakLoadColumn,
];

export const RESOURCE_PLANNING_GANTT_CONFIG: GanttPluginConfig = {
  id: 'resource-portfolio-q4-2026',
  name: 'Q4 delivery capacity portfolio',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: FULL_TIME_CALENDAR_ID,
  updatedAt: '2026-09-08T08:40:00Z',
  statusDate: '2026-09-08',
  zoomPreset: 'day-week',
  weekStartsOn: 1,
  allowTaskCreate: false,
  scheduling: {
    excludeHolidaysFromDuration: true,
    taskModeDefault: 'auto',
    autoDependencyViolationBehavior: 'warn',
    lagCalendar: 'working-days',
    resourceLeveling: 'warn',
  },
  resourcePlanning: {
    enabled: true,
    loadGranularity: 'week',
    capacityDisplay: 'line',
    overAllocationDisplay: 'highlight',
  },
  dateFormats: { locale: 'en-GB', timeZone: 'Europe/Lisbon', table: { day: '2-digit', month: 'short' } },
  visuals: {
    showDependencies: true,
    showBaseline: false,
    baselineId: 'resource-approved-q4-capacity',
    showCriticalPath: true,
    showTaskLabels: 'tasks',
    shadeNonWorkingTime: true,
    showTodayLine: false,
    projectLineDate: '2026-09-08',
    timeRanges: [
      { id: 'resource-architect-overlap', startDate: '2026-08-24', endDate: '2026-09-04', label: 'Shared architecture 150%', color: '#f8ead8' },
      { id: 'resource-lab-overlap', startDate: '2026-09-28', endDate: '2026-10-09', label: 'Test Lab A conversation', color: '#fff3df' },
    ],
    milestoneLines: [
      { id: 'resource-atlas-release', date: '2026-10-12', label: 'Atlas release', color: '#2b7a55' },
      { id: 'resource-portfolio-gate', date: '2026-10-23', label: 'Portfolio gate', color: '#174b38' },
    ],
    taskTooltipFields: ['status', 'startDate', 'endDate', 'percentDone', 'assignees'],
  },
};

export const RESOURCE_PLANNING_INDUSTRY_DEFINITION: IndustryGanttDefinition = {
  id: 'industry-resource-planning',
  productLabel: 'Pace · Portfolio capacity · Week 37',
  title: 'People & shared capacity',
  subtitle: 'See trade-offs early — across people, teams and shared facilities',
  scheduleLabel: 'Weekly capacity · 10 people & teams + Test Lab A',
  riskLegendLabel: 'Above capacity · open a planning conversation',
  updatedLabel: 'Availability + project plans synced 08:40',
  mark: 'PC',
  metrics: [
    { label: 'People / teams + lab', value: '10 + 1' },
    { label: 'Decisions to make', value: '2', tone: 'warning' },
    { label: 'Shared architect peak', value: '150%', tone: 'warning' },
    { label: 'Test Lab A peak', value: '175%', tone: 'warning' },
  ],
  grid: { theme: 'adaptiveMaterial', rowSize: 40, rowHeaders: false, cellBorders: false, timelinePanelWidth: '66.7%' },
  tasks: RESOURCE_PLANNING_TASKS,
  dependencies: RESOURCE_PLANNING_DEPENDENCIES,
  calendars: RESOURCE_PLANNING_CALENDARS,
  resources: RESOURCE_PLANNING_RESOURCES,
  assignments: RESOURCE_PLANNING_ASSIGNMENTS,
  baselines: RESOURCE_PLANNING_BASELINES,
  columns: RESOURCE_PLANNING_COLUMNS,
  gantt: RESOURCE_PLANNING_GANTT_CONFIG,
  taskBarColorHook: ({ row }) => {
    const workflowStatus = resolveIndustryWorkflowStatus(row);
    return workflowStatus === 'blocked'
      ? { barColor: '#c98558', progressColor: '#8f5938', borderColor: '#a76e47', textColor: '#fff' }
      : workflowStatus === 'done'
        ? { barColor: '#a6b5aa', progressColor: '#647a69', borderColor: '#819185', textColor: '#fff' }
        : row.type === 'summary'
          ? { barColor: '#47775a', progressColor: '#294f3a', borderColor: '#294f3a', textColor: '#fff' }
          : { barColor: '#8fbd9c', progressColor: '#4d8662', borderColor: '#679475', textColor: '#183b29' };
  },
};
