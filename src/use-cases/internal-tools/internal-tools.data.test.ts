import { describe, expect, it } from 'vitest';
import {
  INTERNAL_TOOLS_ASSIGNMENTS,
  INTERNAL_TOOLS_BASELINES,
  INTERNAL_TOOLS_CALENDARS,
  INTERNAL_TOOLS_DEPENDENCIES,
  INTERNAL_TOOLS_INDUSTRY_DEFINITION,
  INTERNAL_TOOLS_RESOURCES,
  INTERNAL_TOOLS_TASK_IDS,
  INTERNAL_TOOLS_TASKS,
} from './internal-tools.data';

describe('internal-tools industry Gantt fixture', () => {
  it('models a stable cross-functional release plan with source and ownership context', () => {
    expect(INTERNAL_TOOLS_TASKS.map(({ id }) => id)).toEqual(INTERNAL_TOOLS_TASK_IDS);
    expect(new Set(INTERNAL_TOOLS_TASK_IDS).size).toBe(INTERNAL_TOOLS_TASK_IDS.length);
    expect(INTERNAL_TOOLS_TASKS).toHaveLength(22);
    for (const task of INTERNAL_TOOLS_TASKS) {
      expect(task).toEqual(expect.objectContaining({
        name: expect.any(String),
        team: expect.any(String),
        owner: expect.any(String),
        sourceSystem: expect.any(String),
        approval: expect.any(String),
        readiness: expect.any(String),
        statusLabel: expect.any(String),
        startDate: expect.stringMatching(/^2026-(08|09|10)-/),
      }));
    }
    expect(INTERNAL_TOOLS_TASKS.filter(({ type }) => type === 'milestone')).toHaveLength(4);
    expect(new Set(INTERNAL_TOOLS_TASKS.map(({ team }) => team)).size).toBeGreaterThanOrEqual(7);
    expect(INTERNAL_TOOLS_TASKS.map(({ team }) => team)).toEqual(expect.arrayContaining([
      'Engineering',
      'Application Security',
      'Legal',
      'Billing Operations',
      'Support',
      'Customer Success',
      'Marketing Operations',
    ]));
  });

  it('keeps hierarchy, dependencies, calendars, assignments, and the full baseline valid', () => {
    const tasks = new Set<string>(INTERNAL_TOOLS_TASK_IDS);
    const calendars = new Set(INTERNAL_TOOLS_CALENDARS.map(({ id }) => id));
    const resources = new Set(INTERNAL_TOOLS_RESOURCES.map(({ id }) => id));
    for (const item of INTERNAL_TOOLS_TASKS) {
      if (item.parentId) expect(tasks.has(item.parentId)).toBe(true);
      expect(calendars.has(item.calendarId!)).toBe(true);
    }
    expect(INTERNAL_TOOLS_CALENDARS).toHaveLength(3);
    expect(INTERNAL_TOOLS_DEPENDENCIES).toHaveLength(22);
    for (const dependency of INTERNAL_TOOLS_DEPENDENCIES) {
      expect(tasks.has(dependency.predecessorTaskId)).toBe(true);
      expect(tasks.has(dependency.successorTaskId)).toBe(true);
    }
    for (const assignment of INTERNAL_TOOLS_ASSIGNMENTS) {
      expect(tasks.has(assignment.taskId)).toBe(true);
      expect(resources.has(assignment.resourceId)).toBe(true);
    }
    expect(new Set(INTERNAL_TOOLS_ASSIGNMENTS.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(new Set(INTERNAL_TOOLS_BASELINES[0].tasks.map(({ taskId }) => taskId))).toEqual(tasks);
    expect(INTERNAL_TOOLS_INDUSTRY_DEFINITION.gantt).toMatchObject({
      id: 'internal-release-48-readiness-2026',
      visuals: { showDependencies: true, baselineId: 'internal-release-48-approved', showCriticalPath: true },
    });
    expect(INTERNAL_TOOLS_INDUSTRY_DEFINITION.grid).toEqual({
      theme: 'adaptiveCompact',
      rowSize: 34,
      rowHeaders: false,
      cellBorders: false,
      timelinePanelWidth: '69.6%',
    });
    expect(INTERNAL_TOOLS_INDUSTRY_DEFINITION.columns.map(({ prop }) => prop)).toEqual([
      'name',
      'owner',
      'sourceSystem',
      'approval',
      'readiness',
    ]);
    expect(INTERNAL_TOOLS_INDUSTRY_DEFINITION.columns.map(({ size }) => size)).toEqual([
      123,
      72,
      54,
      58,
      44,
    ]);
  });

  it('connects delayed billing approval to deployment, onboarding, and the release gate', () => {
    const billingApproval = INTERNAL_TOOLS_TASKS.find(({ id }) => id === 'billing-configuration-approval')!;
    const approvedBilling = INTERNAL_TOOLS_BASELINES[0].tasks.find(({ taskId }) => taskId === billingApproval.id)!;
    expect(billingApproval).toMatchObject({
      name: 'Billing configuration approval',
      sourceSystem: 'Stripe',
      workflowStatus: 'blocked',
      deadlineDate: '2026-09-25',
      approval: 'Finance pending',
      risk: expect.stringContaining('deployment and onboarding'),
    });
    expect(billingApproval.startDate > approvedBilling.startDate).toBe(true);

    expect(INTERNAL_TOOLS_DEPENDENCIES).toEqual(expect.arrayContaining([
      expect.objectContaining({ predecessorTaskId: 'price-book-sync', successorTaskId: 'billing-configuration-approval' }),
      expect.objectContaining({ predecessorTaskId: 'privacy-legal-signoff', successorTaskId: 'billing-configuration-approval' }),
      expect.objectContaining({ predecessorTaskId: 'billing-configuration-approval', successorTaskId: 'production-deployment' }),
      expect.objectContaining({ predecessorTaskId: 'billing-configuration-approval', successorTaskId: 'customer-success-onboarding' }),
      expect.objectContaining({ predecessorTaskId: 'production-deployment', successorTaskId: 'customer-readiness-checkpoint' }),
      expect.objectContaining({ predecessorTaskId: 'customer-readiness-checkpoint', successorTaskId: 'release-48-general-availability' }),
    ]));
    expect(INTERNAL_TOOLS_TASKS.find(({ id }) => id === 'production-deployment')).toMatchObject({ workflowStatus: 'blocked', deadlineDate: '2026-09-30' });
    expect(INTERNAL_TOOLS_TASKS.find(({ id }) => id === 'customer-success-onboarding')).toMatchObject({ workflowStatus: 'blocked', sourceSystem: 'Salesforce' });
    expect(INTERNAL_TOOLS_TASKS.find(({ id }) => id === 'release-48-general-availability')).toMatchObject({ startDate: '2026-10-13', deadlineDate: '2026-10-09' });

    const taskBarColorHook = INTERNAL_TOOLS_INDUSTRY_DEFINITION.taskBarColorHook!;
    const blockedColors = taskBarColorHook({
      row: { ...billingApproval, workflowStatus: 'in-progress', workflowStatusKey: 'blocked' },
    } as unknown as Parameters<typeof taskBarColorHook>[0]);
    expect(blockedColors).toMatchObject({ barColor: '#dc4f6d', progressColor: '#9f2f4a' });

    const activeColors = taskBarColorHook({
      row: INTERNAL_TOOLS_TASKS.find(({ id }) => id === 'feature-flag-configuration')!,
    } as unknown as Parameters<typeof taskBarColorHook>[0]);
    expect(activeColors).toMatchObject({ barColor: '#8b5cf6', progressColor: '#6d35d8' });
  });
});
