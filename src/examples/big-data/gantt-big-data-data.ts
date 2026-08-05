import type {
  CalendarEntity,
  DependencyEntity,
  GanttPluginConfig,
  GanttTaskSourceRow,
  ISODateString,
} from '@revolist/revogrid-enterprise';

export const GANTT_BIG_DATA_TASK_COUNT = 10_000;
export const GANTT_BIG_DATA_PROJECT_START = '2026-01-01';
export const GANTT_BIG_DATA_PROJECT_END = '2026-03-31';
export const GANTT_BIG_DATA_CALENDAR_ID = 'gantt-big-data-calendar';

const PROJECT_DAY_COUNT = 90;
const MAX_TASK_DURATION_DAYS = 7;
const TASK_START_DAY_COUNT = PROJECT_DAY_COUNT - MAX_TASK_DURATION_DAYS + 1;
const TASKS_PER_START_DAY = Math.ceil(GANTT_BIG_DATA_TASK_COUNT / TASK_START_DAY_COUNT);
const DAY_IN_MS = 24 * 60 * 60 * 1_000;

export const ganttBigDataConfig = {
  id: 'gantt-big-data-project',
  name: '10,000 Task Project',
  version: '1',
  currency: 'USD',
  timeZone: 'UTC',
  primaryCalendarId: GANTT_BIG_DATA_CALENDAR_ID,
  updatedAt: `${GANTT_BIG_DATA_PROJECT_START}T00:00:00Z`,
  statusDate: GANTT_BIG_DATA_PROJECT_START,
  zoomPreset: 'day-week',
} satisfies GanttPluginConfig;

export const ganttBigDataCalendars: CalendarEntity[] = [{
  id: GANTT_BIG_DATA_CALENDAR_ID,
  name: 'Every day',
  timeZone: 'UTC',
  workingDays: [1, 2, 3, 4, 5, 6, 7],
  holidays: [],
  hoursPerDay: 8,
}];

export interface GanttBigDataSet {
  readonly tasks: GanttTaskSourceRow[];
  readonly dependencies: DependencyEntity[];
}

export const GANTT_BIG_DATA_DEPENDENCY_COUNT =
  (GANTT_BIG_DATA_TASK_COUNT - TASK_START_DAY_COUNT)
  + (GANTT_BIG_DATA_TASK_COUNT - TASKS_PER_START_DAY);

export function createGanttBigDataSet(): GanttBigDataSet {
  const tasks: GanttTaskSourceRow[] = [];
  const dependencies: DependencyEntity[] = [];

  for (let index = 0; index < GANTT_BIG_DATA_TASK_COUNT; index += 1) {
    const startDay = Math.floor(index / TASKS_PER_START_DAY);
    const duration = 2 + (index % (MAX_TASK_DURATION_DAYS - 1));
    const taskNumber = index + 1;

    tasks.push({
      id: taskId(index),
      name: `Task ${taskNumber.toLocaleString('en-US')}`,
      startDate: addUtcDays(GANTT_BIG_DATA_PROJECT_START, startDay),
      endDate: addUtcDays(GANTT_BIG_DATA_PROJECT_START, startDay + duration - 1),
      calendarId: GANTT_BIG_DATA_CALENDAR_ID,
    });

    if (index > 0 && startDay === Math.floor((index - 1) / TASKS_PER_START_DAY)) {
      dependencies.push({
        id: `dependency-lane-${index}`,
        predecessorTaskId: taskId(index - 1),
        successorTaskId: taskId(index),
        type: 'start-to-start',
        lagDays: 0,
      });
    }

    if (index >= TASKS_PER_START_DAY) {
      dependencies.push({
        id: `dependency-day-${index}`,
        predecessorTaskId: taskId(index - TASKS_PER_START_DAY),
        successorTaskId: taskId(index),
        type: 'start-to-start',
        lagDays: 1,
      });
    }
  }

  return { tasks, dependencies };
}

function taskId(index: number): string {
  return `big-task-${index + 1}`;
}

function addUtcDays(date: string, days: number): ISODateString {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * DAY_IN_MS)
    .toISOString()
    .slice(0, 10) as ISODateString;
}
