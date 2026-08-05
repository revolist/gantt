import type {
  CalendarEntity,
  DependencyEntity,
  GanttPluginConfig,
  GanttTaskSourceRow,
  ISODateString,
} from '@revolist/revogrid-enterprise';

export const GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT = 100;
export const GANTT_HORIZONTAL_BIG_DATA_DEPENDENCY_COUNT = 194;
export const GANTT_HORIZONTAL_BIG_DATA_PROJECT_START = '2026-01-01';
export const GANTT_HORIZONTAL_BIG_DATA_PROJECT_END = '2045-12-31';
export const GANTT_HORIZONTAL_BIG_DATA_CALENDAR_ID = 'gantt-horizontal-big-data-calendar';

const DAY_IN_MS = 24 * 60 * 60 * 1_000;
const SECOND_DEPENDENCY_DISTANCE = 5;

export const ganttHorizontalBigDataConfig = {
  id: 'gantt-horizontal-big-data-project',
  name: 'Twenty-Year Program',
  version: '1',
  currency: 'USD',
  timeZone: 'UTC',
  primaryCalendarId: GANTT_HORIZONTAL_BIG_DATA_CALENDAR_ID,
  updatedAt: `${GANTT_HORIZONTAL_BIG_DATA_PROJECT_START}T00:00:00Z`,
  statusDate: GANTT_HORIZONTAL_BIG_DATA_PROJECT_START,
  zoomPreset: 'month-quarter',
} satisfies GanttPluginConfig;

export const ganttHorizontalBigDataCalendars: CalendarEntity[] = [{
  id: GANTT_HORIZONTAL_BIG_DATA_CALENDAR_ID,
  name: 'Every day',
  timeZone: 'UTC',
  workingDays: [1, 2, 3, 4, 5, 6, 7],
  holidays: [],
  hoursPerDay: 8,
}];

export interface GanttHorizontalBigDataSet {
  readonly tasks: GanttTaskSourceRow[];
  readonly dependencies: DependencyEntity[];
}

export function createGanttHorizontalBigDataSet(): GanttHorizontalBigDataSet {
  const tasks: GanttTaskSourceRow[] = [];
  const dependencies: DependencyEntity[] = [];
  const projectDayCount = daysBetween(
    GANTT_HORIZONTAL_BIG_DATA_PROJECT_START,
    GANTT_HORIZONTAL_BIG_DATA_PROJECT_END,
  ) + 1;

  for (let index = 0; index < GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT; index += 1) {
    const startDay = Math.round(
      index * (projectDayCount - 1) / (GANTT_HORIZONTAL_BIG_DATA_TASK_COUNT - 1),
    );
    const durationDays = 14 + (index % 29);
    const endDay = Math.min(projectDayCount - 1, startDay + durationDays - 1);

    tasks.push({
      id: taskId(index),
      name: `Program task ${String(index + 1).padStart(3, '0')}`,
      startDate: addUtcDays(GANTT_HORIZONTAL_BIG_DATA_PROJECT_START, startDay),
      endDate: addUtcDays(GANTT_HORIZONTAL_BIG_DATA_PROJECT_START, endDay),
      calendarId: GANTT_HORIZONTAL_BIG_DATA_CALENDAR_ID,
    });

    if (index > 0) {
      dependencies.push({
        id: `horizontal-chain-${index}`,
        predecessorTaskId: taskId(index - 1),
        successorTaskId: taskId(index),
        type: 'start-to-start',
        lagDays: 0,
      });
    }

    if (index >= SECOND_DEPENDENCY_DISTANCE) {
      dependencies.push({
        id: `horizontal-cross-${index}`,
        predecessorTaskId: taskId(index - SECOND_DEPENDENCY_DISTANCE),
        successorTaskId: taskId(index),
        type: 'start-to-start',
        lagDays: 0,
      });
    }
  }

  return { tasks, dependencies };
}

function taskId(index: number): string {
  return `horizontal-task-${index + 1}`;
}

function daysBetween(startDate: string, endDate: string): number {
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / DAY_IN_MS);
}

function addUtcDays(date: string, days: number): ISODateString {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_IN_MS)
    .toISOString()
    .slice(0, 10) as ISODateString;
}
