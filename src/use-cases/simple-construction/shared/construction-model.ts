import dependenciesCsv from '../csv/dependencies.csv?raw';
import lookAheadCsv from '../csv/lookahead.csv?raw';
import resourcesCsv from '../csv/resources.csv?raw';
import tasksCsv from '../csv/tasks.csv?raw';
import { parseCsv, type CsvRow } from './csv';
import type { ConstructionDepartment, ConstructionTask, ProjectEntity } from './construction-types';

const departmentLabels: Record<ConstructionDepartment, string> = {
  projects: 'Project',
  fabrication: 'Fabrication',
  installation: 'Installation',
  procurement: 'Procurement',
  external: 'External',
};

const sourceTasks = parseCsv(tasksCsv);
const sourceResources = parseCsv(resourcesCsv);
const sourceLookAhead = parseCsv(lookAheadCsv);
const sourceDependencies = parseCsv(dependenciesCsv);

const toNumber = (value: string | undefined) => Number(value || 0);
const taskId = (projectRef: string, legacyId: string) => `task:${projectRef}:${legacyId}`;
const projectId = (projectRef: string) => `project:${projectRef}`;
const resourceId = (name: string) => `resource:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

function normalizeDepartment(value: string): ConstructionDepartment {
  if (value === 'construction') return 'installation';
  if (value === 'fabrication' || value === 'procurement' || value === 'external') return value;
  return 'projects';
}

function workflowStatus(sourceStatus: string, percentDone: number) {
  if (percentDone >= 100) return 'done';
  if (sourceStatus === 'open') return 'blocked';
  if (sourceStatus === 'in_progress' || sourceStatus === 'confirmed' || percentDone > 0) return 'in-progress';
  return 'not-started';
}

function resourceNameFromLookAhead(name: string) {
  return name === 'Hired EWP' ? 'Hired EWP - scissor lift' : name;
}

function calendarIdForResource(resourceName: string | undefined, fallback: string) {
  const resource = resourceByName.get(resourceNameFromLookAhead(resourceName || ''));
  return resource?.calendarId || `cal-${fallback}`;
}

const projectSource = sourceTasks.filter(({ type }) => type === 'project');
const projectLegacyIds = new Set(projectSource.map(({ id }) => id));

export const constructionProjects: ProjectEntity[] = projectSource.map((row) => ({
  id: projectId(row.project_ref),
  projectRef: row.project_ref,
  legacyTaskId: row.id,
  name: row.name,
  startDate: row.start,
  endDate: row.finish,
  percentDone: toNumber(row.percent_complete),
  notes: row.notes,
}));

export function projectRow(project: ProjectEntity): ConstructionTask {
  const projectStatus = workflowStatus('', project.percentDone);
  return {
    id: project.id,
    parentId: null,
    projectRef: project.projectRef,
    legacyTaskId: project.legacyTaskId,
    entityKind: 'task',
    source: 'master',
    name: project.name,
    type: 'summary',
    startDate: project.startDate,
    endDate: project.endDate,
    percentDone: project.percentDone,
    workflowStatus: projectStatus,
    statusLabel: projectStatus,
    calendarId: 'cal-office_mon_fri',
    department: 'projects',
    departmentLabel: departmentLabels.projects,
    notes: project.notes,
  };
}

export const constructionResources = sourceResources.map((row) => ({
  id: resourceId(row.name),
  name: row.name,
  role: row.type,
  calendarId: `cal-${row.calendar || 'office_mon_fri'}`,
  allocationCapacity: 100,
  hourlyCost: 0,
  headcount: toNumber(row.headcount),
  capacityHoursPerDay: toNumber(row.capacity_hours_per_day),
  costBasis: row.cost_basis,
  notes: row.notes,
}));

const resourceByName = new Map(constructionResources.map((resource) => [resource.name, resource]));

function createMasterTask(row: CsvRow): ConstructionTask {
  const department = normalizeDepartment(row.department);
  const percentDone = toNumber(row.percent_complete);
  const parentId = row.parent_id
    ? projectLegacyIds.has(row.parent_id)
      ? projectId(row.project_ref)
      : taskId(row.project_ref, row.parent_id)
    : null;

  return {
    id: taskId(row.project_ref, row.id),
    parentId,
    projectRef: row.project_ref,
    legacyTaskId: row.id,
    entityKind: 'task',
    source: 'master',
    name: row.name,
    type: row.type === 'phase' ? 'summary' : row.type === 'milestone' ? 'milestone' : 'task',
    startDate: row.start,
    endDate: row.finish,
    percentDone,
    workflowStatus: workflowStatus('', percentDone),
    statusLabel: workflowStatus('', percentDone),
    calendarId: calendarIdForResource(row.owner, 'office_mon_fri'),
    department,
    departmentLabel: departmentLabels[department],
    resourceName: row.owner,
    notes: row.notes,
  };
}

const masterTasks = sourceTasks
  .filter(({ type }) => type !== 'project')
  .map(createMasterTask);
const masterByLegacyId = new Map(masterTasks.map((task) => [`${task.projectRef}:${task.legacyTaskId}`, task]));

function createConstraintsSummary(row: CsvRow): ConstructionTask {
  return {
    id: taskId(row.project_ref, 'constraints'),
    parentId: projectId(row.project_ref),
    projectRef: row.project_ref,
    entityKind: 'context',
    source: 'lookahead',
    name: 'Constraints & logistics',
    type: 'summary',
    startDate: row.start,
    endDate: row.finish,
    percentDone: 0,
    workflowStatus: 'not-started',
    statusLabel: 'Not started',
    calendarId: 'cal-site_mon_fri',
    department: 'projects',
    departmentLabel: departmentLabels.projects,
  };
}

function createLookAheadTask(row: CsvRow, parentId: string, hasMasterTask: boolean): ConstructionTask {
  const department: ConstructionDepartment = row.crew_or_party === 'Workshop Crew' ? 'fabrication' : 'installation';
  const percentDone = row.status === 'in_progress' ? 45 : 0;

  return {
    id: taskId(row.project_ref, `lookahead:${row.id}`),
    parentId,
    projectRef: row.project_ref,
    legacyTaskId: row.master_task_id || undefined,
    entityKind: hasMasterTask ? 'execution' : 'context',
    source: 'lookahead',
    name: row.name,
    type: row.activity_type === 'delivery' || row.activity_type === 'inspection' ? 'milestone' : 'task',
    startDate: row.start,
    endDate: row.finish,
    percentDone,
    workflowStatus: workflowStatus(row.status, percentDone),
    statusLabel: row.status.replace('_', ' '),
    calendarId: calendarIdForResource(row.crew_or_party, 'site_mon_fri'),
    department,
    departmentLabel: departmentLabels[department],
    workArea: row.work_area,
    resourceName: row.crew_or_party,
    notes: row.notes,
  };
}

function createLookAheadTasks() {
  const tasks: ConstructionTask[] = [];
  const projectRefs = new Set(constructionProjects.map(({ projectRef }) => projectRef));
  const constraintsByProject = new Map<string, string>();

  for (const row of sourceLookAhead) {
    // Project 2776 exists only in Look-Ahead data, so the demo deliberately does not invent it.
    if (!projectRefs.has(row.project_ref)) continue;

    const masterTask = row.master_task_id
      ? masterByLegacyId.get(`${row.project_ref}:${row.master_task_id}`)
      : undefined;
    let parentId = masterTask?.id;

    if (!parentId) {
      parentId = constraintsByProject.get(row.project_ref);
      if (!parentId) {
        const summary = createConstraintsSummary(row);
        parentId = summary.id;
        constraintsByProject.set(row.project_ref, parentId);
        tasks.push(summary);
      }
    }

    tasks.push(createLookAheadTask(row, parentId, Boolean(masterTask)));
  }

  return tasks;
}

export const constructionTasks = [...masterTasks, ...createLookAheadTasks()];

export const constructionAssignments = constructionTasks.flatMap((task) => {
  const resource = resourceByName.get(resourceNameFromLookAhead(task.resourceName || ''));
  if (!resource) return [];

  return [{
    id: `assignment:${task.id}:${resource.id}`,
    taskId: task.id,
    resourceId: resource.id,
    allocationUnits: 100,
    responsibility: 'assigned',
  }];
});

const sourceTaskById = new Map(sourceTasks.map((task) => [task.id, task]));

export const constructionDependencies = sourceDependencies.flatMap((row) => {
  const predecessor = sourceTaskById.get(row.predecessor_id);
  const successor = sourceTaskById.get(row.successor_id);
  if (!predecessor || !successor) return [];

  return [{
    id: `dependency:${row.id}`,
    predecessorTaskId: taskId(predecessor.project_ref, row.predecessor_id),
    successorTaskId: taskId(successor.project_ref, row.successor_id),
    type: row.type === 'SS' ? 'start-to-start' : 'finish-to-start',
    lagDays: toNumber(row.lag_days),
    notes: row.notes,
  }];
});

export const constructionCalendars = [
  { id: 'cal-office_mon_fri', name: 'Office Mon–Fri', workingDays: [1, 2, 3, 4, 5], holidays: [], hoursPerDay: 8 },
  { id: 'cal-workshop_mon_fri', name: 'Workshop Mon–Fri', workingDays: [1, 2, 3, 4, 5], holidays: [], hoursPerDay: 8 },
  { id: 'cal-site_mon_fri', name: 'Site Mon–Fri', workingDays: [1, 2, 3, 4, 5], holidays: [], hoursPerDay: 8 },
  { id: 'cal-site_mon_sat', name: 'Site Mon–Sat', workingDays: [1, 2, 3, 4, 5, 6], holidays: [], hoursPerDay: 10 },
  { id: 'cal-supplier_lead_time', name: 'Supplier lead time', workingDays: [1, 2, 3, 4, 5], holidays: [], hoursPerDay: 8 },
  { id: 'cal-builder_programme', name: 'Builder programme', workingDays: [1, 2, 3, 4, 5], holidays: [], hoursPerDay: 8 },
];
