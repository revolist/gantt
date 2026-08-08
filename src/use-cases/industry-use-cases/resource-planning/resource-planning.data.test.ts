import { describe, expect, it } from 'vitest';
import {
  createTaskGridConfig,
  InMemoryAssignmentStore,
  InMemoryResourceStore,
  InMemoryTaskStore,
  type GanttGridRow,
  type ProjectSnapshot,
} from '@revolist/revogrid-enterprise';
import {
  RESOURCE_PLANNING_ASSIGNMENTS,
  RESOURCE_PLANNING_BASELINES,
  RESOURCE_PLANNING_CALENDARS,
  RESOURCE_PLANNING_DEPENDENCIES,
  RESOURCE_PLANNING_GANTT_CONFIG,
  RESOURCE_PLANNING_INDUSTRY_DEFINITION,
  RESOURCE_PLANNING_RESOURCES,
  RESOURCE_PLANNING_TASK_IDS,
  RESOURCE_PLANNING_TASKS,
} from './resource-planning.data';

const overlaps = (firstId: string, secondId: string): boolean => {
  const first = RESOURCE_PLANNING_TASKS.find(({ id }) => id === firstId)!;
  const second = RESOURCE_PLANNING_TASKS.find(({ id }) => id === secondId)!;
  return first.startDate <= (second.endDate ?? second.startDate) && second.startDate <= (first.endDate ?? first.startDate);
};

const projectResourceRows = (): readonly GanttGridRow[] => {
  const project: ProjectSnapshot = {
    ...RESOURCE_PLANNING_GANTT_CONFIG,
    tasks: RESOURCE_PLANNING_TASKS as unknown as ProjectSnapshot['tasks'],
    dependencies: RESOURCE_PLANNING_DEPENDENCIES,
    calendars: RESOURCE_PLANNING_CALENDARS,
    resources: RESOURCE_PLANNING_RESOURCES,
    assignments: RESOURCE_PLANNING_ASSIGNMENTS,
    baselines: RESOURCE_PLANNING_BASELINES,
  };
  const grid = createTaskGridConfig(
    project,
    new InMemoryTaskStore(project.tasks),
    new InMemoryResourceStore(project.resources),
    new InMemoryAssignmentStore(project.assignments),
    RESOURCE_PLANNING_GANTT_CONFIG.zoomPreset ?? 'day-week',
    undefined,
    'en-GB',
    undefined,
    { resourcePlanning: RESOURCE_PLANNING_GANTT_CONFIG.resourcePlanning },
    { weekStartsOn: 1 },
  );
  return grid.source as unknown as readonly GanttGridRow[];
};

describe('resource-planning industry Gantt fixture', () => {
  it('models a stable cross-project portfolio with complete capacity context', () => {
    expect(RESOURCE_PLANNING_TASKS.map(({ id }) => id)).toEqual(RESOURCE_PLANNING_TASK_IDS);
    expect(new Set(RESOURCE_PLANNING_TASK_IDS).size).toBe(RESOURCE_PLANNING_TASK_IDS.length);
    expect(RESOURCE_PLANNING_TASKS).toHaveLength(22);
    for (const task of RESOURCE_PLANNING_TASKS) {
      expect(task).toEqual(expect.objectContaining({
        name: expect.any(String),
        projectCode: expect.any(String),
        team: expect.any(String),
        role: expect.any(String),
        owner: expect.any(String),
        allocation: expect.any(String),
        statusLabel: expect.any(String),
        startDate: expect.stringMatching(/^2026-(08|09|10)-/),
      }));
    }
    expect(RESOURCE_PLANNING_TASKS.filter(({ type }) => type === 'milestone')).toHaveLength(4);
    expect(RESOURCE_PLANNING_TASKS.map(({ projectCode }) => projectCode)).toEqual(expect.arrayContaining(['ATL-2608', 'NST-2611', 'OPS-2609', 'PORT-Q4']));
  });

  it('keeps hierarchy, dependencies, assignments, calendars, and the full baseline valid', () => {
    const tasks = new Set<string>(RESOURCE_PLANNING_TASK_IDS);
    const calendars = new Set(RESOURCE_PLANNING_CALENDARS.map(({ id }) => id));
    const resources = new Set(RESOURCE_PLANNING_RESOURCES.map(({ id }) => id));
    for (const item of RESOURCE_PLANNING_TASKS) {
      if (item.parentId) expect(tasks.has(item.parentId)).toBe(true);
      expect(calendars.has(item.calendarId!)).toBe(true);
    }
    expect(RESOURCE_PLANNING_CALENDARS).toHaveLength(3);
    expect(RESOURCE_PLANNING_DEPENDENCIES.length).toBeGreaterThanOrEqual(20);
    for (const dependency of RESOURCE_PLANNING_DEPENDENCIES) {
      expect(tasks.has(dependency.predecessorTaskId)).toBe(true);
      expect(tasks.has(dependency.successorTaskId)).toBe(true);
    }
    for (const assignment of RESOURCE_PLANNING_ASSIGNMENTS) {
      expect(tasks.has(assignment.taskId)).toBe(true);
      expect(resources.has(assignment.resourceId)).toBe(true);
    }
    expect(new Set(RESOURCE_PLANNING_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.gantt).toMatchObject({
      id: 'resource-portfolio-q4-2026',
      scheduling: { resourceLeveling: 'warn' },
      resourcePlanning: {
        enabled: true,
        loadGranularity: 'week',
        capacityDisplay: 'line',
        overAllocationDisplay: 'highlight',
      },
      visuals: { showDependencies: true, baselineId: 'resource-approved-q4-capacity', showCriticalPath: true },
    });
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.grid).toEqual({ theme: 'adaptiveMaterial', rowSize: 40, rowHeaders: false, cellBorders: false, timelinePanelWidth: '66.7%' });
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.columns.map(({ name }) => name)).toEqual(['Resource', 'Role', 'Cap.', 'Peak']);
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.columns.map(({ prop }) => prop)).toEqual(['name', 'resourceRole', 'resourceCapacity', 'resourceLoadSummary']);
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.columns.map(({ size }) => size)).toEqual([162, 106, 62, 54]);
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.columns.reduce((total, column) => total + Number(column.size), 0)).toBe(384);
    expect(RESOURCE_PLANNING_INDUSTRY_DEFINITION.columns.every(({ sortable, filter }) => sortable === false && filter === false)).toBe(true);
  });

  it('projects native weekly resource rows with the intended visible overload peaks', () => {
    const rows = projectResourceRows();
    expect(rows).toHaveLength(RESOURCE_PLANNING_RESOURCES.length);
    expect(rows.every(({ rowKind }) => rowKind === 'resource')).toBe(true);

    const amina = rows.find(({ name }) => name === 'Amina Rahman');
    expect(amina).toMatchObject({
      resourceRole: 'Solution architect',
      resourceCapacity: '100%',
      resourceLoadSummary: '150% max',
      resourcePlanning: {
        loadGranularity: 'week',
        capacityDisplay: 'line',
        overAllocationDisplay: 'highlight',
        maxAllocatedUnits: 150,
      },
    });
    expect(amina?.resourcePlanning?.segments).toEqual(expect.arrayContaining([
      expect.objectContaining({ allocatedUnits: 150, capacityUnits: 100, isOverallocated: true }),
    ]));

    const lab = rows.find(({ name }) => name === 'Test Lab A');
    expect(lab).toMatchObject({
      resourceRole: 'Shared validation facility',
      resourceCapacity: '100%',
      resourceLoadSummary: '175% max',
      resourcePlanning: { maxAllocatedUnits: 175 },
    });
    expect(lab?.resourcePlanning?.segments).toEqual(expect.arrayContaining([
      expect.objectContaining({ allocatedUnits: 175, capacityUnits: 100, isOverallocated: true }),
    ]));
  });

  it('represents shared-person and shared-lab conflicts in dates and assignment units', () => {
    const architectReview = RESOURCE_PLANNING_TASKS.find(({ id }) => id === 'solution-architect-overlap-review')!;
    expect(architectReview).toMatchObject({
      name: 'Solution architect overlap review',
      workflowStatus: 'blocked',
      statusLabel: 'Planning conversation',
      allocation: 'Shared 150%',
      risk: expect.stringContaining('agree which sessions'),
    });
    expect(overlaps('product-solution-blueprint', 'client-solution-design')).toBe(true);
    const architectLoad = RESOURCE_PLANNING_ASSIGNMENTS
      .filter(({ resourceId, taskId }) => resourceId === 'solution-architect' && ['product-solution-blueprint', 'client-solution-design'].includes(taskId))
      .reduce((sum, { allocationUnits }) => sum + allocationUnits, 0);
    expect(architectLoad).toBe(1.5);

    expect(overlaps('product-lab-validation', 'client-lab-validation')).toBe(true);
    const labLoad = RESOURCE_PLANNING_ASSIGNMENTS
      .filter(({ resourceId, taskId }) => resourceId === 'test-lab-a' && ['product-lab-validation', 'client-lab-validation'].includes(taskId))
      .reduce((sum, { allocationUnits }) => sum + allocationUnits, 0);
    expect(labLoad).toBe(1.75);
    expect(RESOURCE_PLANNING_RESOURCES.find(({ id }) => id === 'test-lab-a')).toMatchObject({ allocationCapacity: 1, role: 'Shared validation facility' });

    expect(RESOURCE_PLANNING_DEPENDENCIES).toEqual(expect.arrayContaining([
      expect.objectContaining({ predecessorTaskId: 'solution-architect-overlap-review', successorTaskId: 'release-readiness' }),
      expect.objectContaining({ predecessorTaskId: 'solution-architect-overlap-review', successorTaskId: 'client-data-migration' }),
      expect.objectContaining({ predecessorTaskId: 'test-lab-booking-review', successorTaskId: 'product-lab-validation' }),
      expect.objectContaining({ predecessorTaskId: 'test-lab-booking-review', successorTaskId: 'client-lab-validation' }),
      expect.objectContaining({ predecessorTaskId: 'product-go-live', successorTaskId: 'portfolio-release-gate' }),
      expect.objectContaining({ predecessorTaskId: 'client-handoff', successorTaskId: 'portfolio-release-gate' }),
    ]));
  });
});
