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

const OPERATIONS_CALENDAR_ID = 'internal-operations-core';
const GOVERNANCE_CALENDAR_ID = 'internal-governance';
const CUSTOMER_CALENDAR_ID = 'internal-customer-readiness';
const taskDefaults = {
  team: 'Release Operations',
  owner: 'Nia Santos',
  sourceSystem: 'Release Hub',
  approval: 'Not required',
  readiness: 'Planned',
  calendarId: OPERATIONS_CALENDAR_ID,
  tags: [] as readonly string[],
};
const task = (
  row: Omit<IndustryTaskRow, keyof typeof taskDefaults> & Partial<Pick<IndustryTaskRow, keyof typeof taskDefaults>>,
): IndustryTaskRow => ({ ...taskDefaults, ...row } as IndustryTaskRow);

export const INTERNAL_TOOLS_TASK_IDS = [
  'release-48-program',
  'source-ownership-check',
  'engineering-release',
  'release-scope-freeze',
  'feature-flag-configuration',
  'data-migration-rehearsal',
  'release-candidate-build',
  'production-deployment',
  'security-legal-governance',
  'security-threat-model',
  'security-penetration-test',
  'privacy-legal-signoff',
  'commercial-billing-readiness',
  'price-book-sync',
  'billing-configuration-approval',
  'customer-operations-readiness',
  'support-runbook',
  'support-team-enablement',
  'customer-success-onboarding',
  'marketing-release-brief',
  'customer-readiness-checkpoint',
  'release-48-general-availability',
] as const;

export const INTERNAL_TOOLS_TASKS: IndustryTaskRow[] = [
  task({ id: 'release-48-program', parentId: null, type: 'summary', name: 'Release 4.8 customer readiness', statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-03', endDate: '2026-10-13', duration: 52, percentDone: 58, approval: 'Gate at risk', readiness: '58%', risk: 'Billing approval is late and now gates production deployment and customer onboarding' }),
  task({ id: 'source-ownership-check', parentId: 'release-48-program', type: 'task', name: 'Source ownership and permission check', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-03', endDate: '2026-08-05', duration: 3, percentDone: 100, approval: 'Owners confirmed', readiness: '100%', risk: 'The release hub links source records; each owning system remains authoritative' }),

  task({ id: 'engineering-release', parentId: 'release-48-program', type: 'summary', name: 'Engineering release', team: 'Engineering', owner: 'René Becker', sourceSystem: 'Linear', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-08-06', endDate: '2026-10-05', duration: 43, percentDone: 68, approval: 'Release review', readiness: '68%' }),
  task({ id: 'release-scope-freeze', parentId: 'engineering-release', type: 'task', name: 'Release scope and owner freeze', team: 'Product + Engineering', owner: 'René Becker', sourceSystem: 'Linear', statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-06', endDate: '2026-08-12', duration: 5, percentDone: 100, approval: 'Approved', readiness: '100%' }),
  task({ id: 'feature-flag-configuration', parentId: 'engineering-release', type: 'task', name: 'Feature flag and rollout configuration', team: 'Platform Engineering', owner: 'Leah Kim', sourceSystem: 'GitHub', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-08-13', endDate: '2026-08-26', duration: 10, percentDone: 82, approval: 'Peer review', readiness: '82%' }),
  task({ id: 'data-migration-rehearsal', parentId: 'engineering-release', type: 'task', name: 'Customer data migration rehearsal', team: 'Data Engineering', owner: 'Omar Khalil', sourceSystem: 'GitHub', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-08-27', endDate: '2026-09-09', duration: 10, percentDone: 64, approval: 'QA review', readiness: '64%' }),
  task({ id: 'release-candidate-build', parentId: 'engineering-release', type: 'task', name: 'Release candidate build and verification', team: 'Release Engineering', owner: 'René Becker', sourceSystem: 'GitHub', statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-09-10', endDate: '2026-09-23', duration: 10, percentDone: 36, approval: 'Change review', readiness: '36%' }),
  task({ id: 'production-deployment', parentId: 'engineering-release', type: 'milestone', name: 'Production deployment', team: 'Release Engineering', owner: 'René Becker', sourceSystem: 'GitHub', statusLabel: 'Approval hold', workflowStatus: 'blocked', startDate: '2026-10-05', endDate: '2026-10-05', duration: 0, percentDone: 0, deadlineDate: '2026-09-30', approval: 'Billing + legal', readiness: 'Blocked', risk: 'Deployment waits for billing configuration and governance approval' }),

  task({ id: 'security-legal-governance', parentId: 'release-48-program', type: 'summary', name: 'Security and legal governance', team: 'Security + Legal', owner: 'Maya Okafor', sourceSystem: 'Vanta', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'In review', workflowStatus: 'in-progress', startDate: '2026-08-06', endDate: '2026-09-18', duration: 32, percentDone: 76, approval: 'Joint sign-off', readiness: '76%' }),
  task({ id: 'security-threat-model', parentId: 'security-legal-governance', type: 'task', name: 'Security threat model refresh', team: 'Application Security', owner: 'Maya Okafor', sourceSystem: 'Vanta', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-06', endDate: '2026-08-19', duration: 10, percentDone: 100, approval: 'Approved', readiness: '100%' }),
  task({ id: 'security-penetration-test', parentId: 'security-legal-governance', type: 'task', name: 'Penetration test findings closure', team: 'Application Security', owner: 'Maya Okafor', sourceSystem: 'Vanta', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'In review', workflowStatus: 'in-progress', startDate: '2026-08-20', endDate: '2026-09-04', duration: 12, percentDone: 75, approval: 'Security review', readiness: '75%' }),
  task({ id: 'privacy-legal-signoff', parentId: 'security-legal-governance', type: 'milestone', name: 'Privacy and legal sign-off', team: 'Legal', owner: 'Ana Martins', sourceSystem: 'Ironclad', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-09-18', endDate: '2026-09-18', duration: 0, percentDone: 0, deadlineDate: '2026-09-18', approval: 'Legal approval', readiness: 'Forecast' }),

  task({ id: 'commercial-billing-readiness', parentId: 'release-48-program', type: 'summary', name: 'Commercial and billing readiness', team: 'Finance + Billing', owner: 'Leo Martins', sourceSystem: 'Stripe', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-08-10', endDate: '2026-10-02', duration: 40, percentDone: 55, approval: 'Finance gate', readiness: '55%', risk: 'Configuration approval is one week beyond the approved plan' }),
  task({ id: 'price-book-sync', parentId: 'commercial-billing-readiness', type: 'task', name: 'Price book and entitlement sync', team: 'Revenue Operations', owner: 'Leo Martins', sourceSystem: 'Salesforce', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'Complete', workflowStatus: 'done', startDate: '2026-08-10', endDate: '2026-08-21', duration: 10, percentDone: 100, approval: 'Approved', readiness: '100%' }),
  task({ id: 'billing-configuration-approval', parentId: 'commercial-billing-readiness', type: 'task', name: 'Billing configuration approval', team: 'Billing Operations', owner: 'Leo Martins', sourceSystem: 'Stripe', calendarId: GOVERNANCE_CALENDAR_ID, statusLabel: 'Approval delayed', workflowStatus: 'blocked', startDate: '2026-09-24', endDate: '2026-10-02', duration: 7, percentDone: 35, deadlineDate: '2026-09-25', approval: 'Finance pending', readiness: '35%', risk: 'Tax and proration scenarios need owner approval before deployment and onboarding can proceed' }),

  task({ id: 'customer-operations-readiness', parentId: 'release-48-program', type: 'summary', name: 'Customer operations readiness', team: 'Customer Operations', owner: 'Aisha Rahman', sourceSystem: 'Zendesk', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'At risk', workflowStatus: 'blocked', startDate: '2026-09-07', endDate: '2026-10-12', duration: 26, percentDone: 44, approval: 'Readiness review', readiness: '44%', risk: 'Onboarding cannot finish until the billing gate and production deployment close' }),
  task({ id: 'support-runbook', parentId: 'customer-operations-readiness', type: 'task', name: 'Support runbook and escalation paths', team: 'Support', owner: 'Aisha Rahman', sourceSystem: 'Zendesk', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-09-07', endDate: '2026-09-18', duration: 10, percentDone: 78, approval: 'Support review', readiness: '78%' }),
  task({ id: 'support-team-enablement', parentId: 'customer-operations-readiness', type: 'task', name: 'Support team enablement sessions', team: 'Support Enablement', owner: 'Aisha Rahman', sourceSystem: 'Zendesk', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-09-21', endDate: '2026-09-25', duration: 5, percentDone: 40, approval: 'Team leads', readiness: '40%' }),
  task({ id: 'customer-success-onboarding', parentId: 'customer-operations-readiness', type: 'task', name: 'Customer Success onboarding sequence', team: 'Customer Success', owner: 'Priya Shah', sourceSystem: 'Salesforce', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'Blocked', workflowStatus: 'blocked', startDate: '2026-10-06', endDate: '2026-10-09', duration: 4, percentDone: 0, approval: 'Billing gate', readiness: 'Blocked', risk: 'Sequence starts only after billing approval and the production deployment' }),
  task({ id: 'marketing-release-brief', parentId: 'customer-operations-readiness', type: 'task', name: 'Customer release brief and status page', team: 'Marketing Operations', owner: 'Tomás Vale', sourceSystem: 'Contentful', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'In progress', workflowStatus: 'in-progress', startDate: '2026-09-14', endDate: '2026-09-25', duration: 10, percentDone: 55, approval: 'Comms review', readiness: '55%' }),
  task({ id: 'customer-readiness-checkpoint', parentId: 'customer-operations-readiness', type: 'milestone', name: 'Customer readiness checkpoint', team: 'Customer Operations', owner: 'Nia Santos', sourceSystem: 'Release Hub', calendarId: CUSTOMER_CALENDAR_ID, statusLabel: 'Forecast', workflowStatus: 'not-started', startDate: '2026-10-12', endDate: '2026-10-12', duration: 0, percentDone: 0, deadlineDate: '2026-10-08', approval: 'Cross-team gate', readiness: 'Forecast' }),
  task({ id: 'release-48-general-availability', parentId: 'release-48-program', type: 'milestone', name: 'Release 4.8 general availability', team: 'Release Operations', owner: 'Nia Santos', sourceSystem: 'Release Hub', statusLabel: 'Late forecast', workflowStatus: 'blocked', startDate: '2026-10-13', endDate: '2026-10-13', duration: 0, percentDone: 0, deadlineDate: '2026-10-09', approval: 'Executive gate', readiness: 'At risk', risk: 'Forecast moved two working days beyond the approved release date' }),
];

export const INTERNAL_TOOLS_CALENDARS: CalendarEntity[] = [
  { id: OPERATIONS_CALENDAR_ID, name: 'Release operations calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4, 5], workingHours: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }], holidays: ['2026-10-05'], hoursPerDay: 8 },
  { id: GOVERNANCE_CALENDAR_ID, name: 'Governance approval calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4, 5], workingHours: [{ start: '09:30', end: '13:00' }, { start: '14:00', end: '17:30' }], holidays: [], hoursPerDay: 7 },
  { id: CUSTOMER_CALENDAR_ID, name: 'Customer operations calendar', timeZone: 'Europe/Lisbon', workingDays: [1, 2, 3, 4, 5], workingHours: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }], holidays: [], hoursPerDay: 8 },
];

export const INTERNAL_TOOLS_RESOURCES: ResourceEntity[] = [
  { id: 'release-ops', name: 'Nia Santos', role: 'Release operations lead', calendarId: OPERATIONS_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 155 },
  { id: 'engineering-lead', name: 'René Becker', role: 'Release engineering lead', calendarId: OPERATIONS_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 170 },
  { id: 'platform-team', name: 'Platform Engineering', role: 'Rollout configuration team', calendarId: OPERATIONS_CALENDAR_ID, allocationCapacity: 3, hourlyCost: 360 },
  { id: 'data-lead', name: 'Omar Khalil', role: 'Data engineering lead', calendarId: OPERATIONS_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 165 },
  { id: 'security-lead', name: 'Maya Okafor', role: 'Application security lead', calendarId: GOVERNANCE_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 180 },
  { id: 'legal-counsel', name: 'Ana Martins', role: 'Product counsel', calendarId: GOVERNANCE_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 195 },
  { id: 'billing-owner', name: 'Leo Martins', role: 'Billing operations owner', calendarId: GOVERNANCE_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 160 },
  { id: 'revenue-ops', name: 'Revenue Operations', role: 'Commercial systems team', calendarId: GOVERNANCE_CALENDAR_ID, allocationCapacity: 2, hourlyCost: 245 },
  { id: 'support-lead', name: 'Aisha Rahman', role: 'Support readiness lead', calendarId: CUSTOMER_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 135 },
  { id: 'customer-success-lead', name: 'Priya Shah', role: 'Customer Success lead', calendarId: CUSTOMER_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 145 },
  { id: 'marketing-ops', name: 'Tomás Vale', role: 'Marketing Operations lead', calendarId: CUSTOMER_CALENDAR_ID, allocationCapacity: 1, hourlyCost: 130 },
];

const primaryResourceForTask: Readonly<Record<string, string>> = {
  'release-48-program': 'release-ops',
  'source-ownership-check': 'release-ops',
  'engineering-release': 'engineering-lead',
  'release-scope-freeze': 'engineering-lead',
  'feature-flag-configuration': 'platform-team',
  'data-migration-rehearsal': 'data-lead',
  'release-candidate-build': 'engineering-lead',
  'production-deployment': 'engineering-lead',
  'security-legal-governance': 'security-lead',
  'security-threat-model': 'security-lead',
  'security-penetration-test': 'security-lead',
  'privacy-legal-signoff': 'legal-counsel',
  'commercial-billing-readiness': 'billing-owner',
  'price-book-sync': 'revenue-ops',
  'billing-configuration-approval': 'billing-owner',
  'customer-operations-readiness': 'support-lead',
  'support-runbook': 'support-lead',
  'support-team-enablement': 'support-lead',
  'customer-success-onboarding': 'customer-success-lead',
  'marketing-release-brief': 'marketing-ops',
  'customer-readiness-checkpoint': 'release-ops',
  'release-48-general-availability': 'release-ops',
};
export const INTERNAL_TOOLS_ASSIGNMENTS: AssignmentEntity[] = Object.entries(primaryResourceForTask).map(
  ([taskId, resourceId], index) => ({
    id: `internal-a-${index + 1}`,
    taskId,
    resourceId,
    allocationUnits: taskId === 'feature-flag-configuration' ? 2 : 1,
    responsibility: taskId.includes('approval') || taskId.includes('signoff') ? 'Accountable approver' : 'Named owner',
  }),
);

const dependencyPairs = [
  ['source-ownership-check', 'release-scope-freeze', 'finish-to-start', 0],
  ['source-ownership-check', 'security-threat-model', 'finish-to-start', 0],
  ['source-ownership-check', 'price-book-sync', 'finish-to-start', 2],
  ['release-scope-freeze', 'feature-flag-configuration', 'finish-to-start', 0],
  ['feature-flag-configuration', 'data-migration-rehearsal', 'finish-to-start', 0],
  ['data-migration-rehearsal', 'release-candidate-build', 'finish-to-start', 0],
  ['security-threat-model', 'security-penetration-test', 'finish-to-start', 0],
  ['security-penetration-test', 'privacy-legal-signoff', 'finish-to-start', 1],
  ['price-book-sync', 'billing-configuration-approval', 'finish-to-start', 22],
  ['privacy-legal-signoff', 'billing-configuration-approval', 'finish-to-start', 3],
  ['release-candidate-build', 'production-deployment', 'finish-to-start', 7],
  ['privacy-legal-signoff', 'production-deployment', 'finish-to-start', 10],
  ['billing-configuration-approval', 'production-deployment', 'finish-to-start', 0],
  ['release-candidate-build', 'support-runbook', 'start-to-start', -3],
  ['support-runbook', 'support-team-enablement', 'finish-to-start', 0],
  ['billing-configuration-approval', 'customer-success-onboarding', 'finish-to-start', 1],
  ['production-deployment', 'customer-success-onboarding', 'finish-to-start', 0],
  ['support-team-enablement', 'customer-readiness-checkpoint', 'finish-to-start', 10],
  ['customer-success-onboarding', 'customer-readiness-checkpoint', 'finish-to-start', 0],
  ['marketing-release-brief', 'customer-readiness-checkpoint', 'finish-to-start', 10],
  ['production-deployment', 'customer-readiness-checkpoint', 'finish-to-start', 3],
  ['customer-readiness-checkpoint', 'release-48-general-availability', 'finish-to-start', 0],
] as const;
export const INTERNAL_TOOLS_DEPENDENCIES: DependencyEntity[] = dependencyPairs.map(
  ([predecessorTaskId, successorTaskId, type, lagDays], index) => ({
    id: `internal-d-${index + 1}`,
    predecessorTaskId,
    successorTaskId,
    type,
    lagDays,
  }),
);

const approvedDates: Readonly<Record<string, readonly [string, string]>> = {
  'release-48-program': ['2026-08-03', '2026-10-09'],
  'engineering-release': ['2026-08-06', '2026-09-30'],
  'production-deployment': ['2026-09-30', '2026-09-30'],
  'commercial-billing-readiness': ['2026-08-10', '2026-09-25'],
  'billing-configuration-approval': ['2026-09-14', '2026-09-25'],
  'customer-operations-readiness': ['2026-09-07', '2026-10-08'],
  'customer-success-onboarding': ['2026-09-28', '2026-10-02'],
  'customer-readiness-checkpoint': ['2026-10-08', '2026-10-08'],
  'release-48-general-availability': ['2026-10-09', '2026-10-09'],
};
export const INTERNAL_TOOLS_BASELINES: BaselineSnapshot[] = [{
  id: 'internal-release-48-approved',
  name: 'Approved Release 4.8 readiness plan',
  capturedAt: '2026-07-31T15:00:00Z',
  tasks: INTERNAL_TOOLS_TASKS.map((item) => {
    const [startDate, endDate] = approvedDates[item.id] ?? [item.startDate, item.endDate ?? item.startDate];
    return { taskId: item.id, startDate, endDate, duration: item.type === 'milestone' ? 0 : Number(item.duration) * 8, progressPercent: 0 };
  }),
} as BaselineSnapshot];

const badgeClass = (value: unknown): string => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const ownerColumn: ColumnRegular = {
  prop: 'owner',
  name: 'Owner',
  size: 72,
  readonly: true,
  cellTemplate: (h, { model }) => {
    const owner = String(model.owner ?? 'Unassigned');
    const initials = owner.split(/\s+/).map((part: string) => part[0]).filter(Boolean).slice(0, 2).join('');
    return h('span', { class: 'internal-owner', title: `${owner} · ${model.team}` }, [
      h('span', { class: 'internal-owner__avatar', 'aria-hidden': 'true' }, initials),
      h('span', { class: 'internal-owner__name' }, owner),
    ]);
  },
};

const sourceColumn: ColumnRegular = {
  prop: 'sourceSystem',
  name: 'Source',
  size: 54,
  readonly: true,
  cellTemplate: (h, { model }) => h('span', {
    class: `internal-source internal-source--${badgeClass(model.sourceSystem)}`,
    title: `${model.sourceSystem} remains the source of truth`,
  }, [
    h('span', { class: 'internal-source__dot', 'aria-hidden': 'true' }, ''),
    h('span', { class: 'internal-source__label' }, model.sourceSystem),
  ]),
};

const approvalColumn: ColumnRegular = {
  prop: 'approval',
  name: 'Approval',
  size: 58,
  readonly: true,
  cellTemplate: (h, { model }) => {
    const approval = String(model.approval ?? 'Not required');
    const state = /approved|confirmed/i.test(approval)
      ? 'approved'
      : /pending|hold|risk|gate/i.test(approval)
        ? 'attention'
        : /review/i.test(approval)
          ? 'review'
          : 'neutral';
    return h('span', {
      class: `internal-approval internal-approval--${state}`,
      title: model.risk ?? approval,
    }, approval);
  },
};

const readinessColumn: ColumnRegular = {
  prop: 'readiness',
  name: 'Ready',
  size: 44,
  readonly: true,
  cellTemplate: (h, { model }) => {
    const readiness = String(model.readiness ?? 'Planned');
    const percent = Number.parseInt(readiness, 10);
    const workflowStatus = model.workflowStatusKey ?? model.workflowStatus;
    const width = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : workflowStatus === 'done' ? 100 : 10;
    return h('span', {
      class: `internal-readiness internal-readiness--${workflowStatus ?? 'not-started'}`,
      title: `${model.name} · ${readiness} readiness`,
    }, [
      h('span', { class: 'internal-readiness__label' }, readiness),
      h('span', { class: 'internal-readiness__track', 'aria-hidden': 'true' }, [
        h('span', { class: 'internal-readiness__fill', style: { width: `${width}%` } }, ''),
      ]),
    ]);
  },
};

export const INTERNAL_TOOLS_COLUMNS: ColumnRegular[] = [
  { ...createDefaultTaskTableColumn('name'), name: 'Release item', size: 123 },
  ownerColumn,
  sourceColumn,
  approvalColumn,
  readinessColumn,
];

export const INTERNAL_TOOLS_GANTT_CONFIG: GanttPluginConfig = {
  id: 'internal-release-48-readiness-2026',
  name: 'Release 4.8 customer readiness',
  version: '1',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  primaryCalendarId: OPERATIONS_CALENDAR_ID,
  updatedAt: '2026-09-08T09:15:00Z',
  statusDate: '2026-09-08',
  zoomPreset: 'month-quarter',
  weekStartsOn: 1,
  allowTaskCreate: false,
  scheduling: { excludeHolidaysFromDuration: true, taskModeDefault: 'auto', autoDependencyViolationBehavior: 'warn', lagCalendar: 'working-days', resourceLeveling: 'warn' },
  dateFormats: { locale: 'en-GB', timeZone: 'Europe/Lisbon', table: { day: '2-digit', month: 'short' } },
  visuals: {
    showDependencies: true,
    showBaseline: false,
    baselineId: 'internal-release-48-approved',
    showCriticalPath: true,
    showTaskLabels: 'tasks',
    shadeNonWorkingTime: true,
    showTodayLine: false,
    projectLineDate: '2026-09-08',
    timeRanges: [{ id: 'internal-billing-approval-risk', startDate: '2026-09-24', endDate: '2026-10-02', label: 'Billing approval risk', color: '#fbedf4' }],
    milestoneLines: [
      { id: 'internal-deployment-target', date: '2026-09-30', label: 'Deployment target', color: '#a23a6d' },
      { id: 'internal-ga-commitment', date: '2026-10-09', label: 'GA commitment', color: '#6f244c' },
    ],
    taskTooltipFields: ['status', 'startDate', 'endDate', 'percentDone', 'assignees'],
  },
};

export const INTERNAL_TOOLS_INDUSTRY_DEFINITION: IndustryGanttDefinition = {
  id: 'industry-internal-tools',
  productLabel: 'Relay Ops / Releases / 4.8',
  title: 'Customer readiness',
  subtitle: 'A live coordination layer — owners and connected source systems stay authoritative',
  scheduleLabel: 'Timeline · cross-functional release plan',
  riskLegendLabel: 'Approval or handoff blocked',
  updatedLabel: 'Owner checked · synced 09:15',
  mark: 'R',
  metrics: [
    { label: 'Release ready', value: '58%', tone: 'warning' },
    { label: 'Connected sources', value: '8' },
    { label: 'Blocked approvals', value: '2', tone: 'danger' },
    { label: 'GA forecast', value: '13 Oct', tone: 'warning' },
  ],
  grid: {
    theme: 'adaptiveCompact',
    rowSize: 34,
    rowHeaders: false,
    cellBorders: false,
    timelinePanelWidth: '69.6%',
  },
  tasks: INTERNAL_TOOLS_TASKS,
  dependencies: INTERNAL_TOOLS_DEPENDENCIES,
  calendars: INTERNAL_TOOLS_CALENDARS,
  resources: INTERNAL_TOOLS_RESOURCES,
  assignments: INTERNAL_TOOLS_ASSIGNMENTS,
  baselines: INTERNAL_TOOLS_BASELINES,
  columns: INTERNAL_TOOLS_COLUMNS,
  gantt: INTERNAL_TOOLS_GANTT_CONFIG,
  taskBarColorHook: ({ row }) => {
    const workflowStatus = row.workflowStatusKey ?? row.workflowStatus;
    return workflowStatus === 'blocked'
      ? { barColor: '#dc4f6d', progressColor: '#9f2f4a', borderColor: '#b43b58', textColor: '#fff' }
      : workflowStatus === 'done'
        ? { barColor: '#a8a3b3', progressColor: '#716a82', borderColor: '#8c859a', textColor: '#fff' }
        : row.type === 'summary'
          ? { barColor: '#5f2d79', progressColor: '#3f1957', borderColor: '#4d2066', textColor: '#fff' }
          : { barColor: '#8b5cf6', progressColor: '#6d35d8', borderColor: '#7042d8', textColor: '#fff' };
  },
};
