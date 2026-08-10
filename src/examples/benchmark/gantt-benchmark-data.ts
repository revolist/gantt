import type { CalendarEntity, DependencyEntity, GanttTaskSourceRow, ISODateString } from '@revolist/revogrid-enterprise';
import type { GanttBenchmarkDataset, GanttBenchmarkDensity, GanttBenchmarkOptions } from './gantt-benchmark.types';

export const GANTT_BENCHMARK_SEED = 20_260_810;
export const GANTT_BENCHMARK_CALENDAR_ID = 'gantt-benchmark-calendar';
export const GANTT_BENCHMARK_GROUP_SIZE = 25;

const DAY_IN_MS = 86_400_000;
const DENSITY_RATIO: Readonly<Record<GanttBenchmarkDensity, number>> = {
  sparse: 0.5,
  normal: 1.9796,
  high: 4,
};
const TIMELINES = {
  quarter: { start: '2026-01-01', end: '2026-03-31', days: 90, zoomPreset: 'day-week' },
  'twenty-year': { start: '2026-01-01', end: '2045-12-31', days: 7_305, zoomPreset: 'month-quarter' },
} as const;

export const ganttBenchmarkCalendars: CalendarEntity[] = [{
  id: GANTT_BENCHMARK_CALENDAR_ID,
  name: 'Every day',
  timeZone: 'UTC',
  workingDays: [1, 2, 3, 4, 5, 6, 7],
  holidays: [],
  hoursPerDay: 8,
}];

export function dependencyTarget(taskCount: number, density: GanttBenchmarkDensity): number {
  return Math.round(taskCount * DENSITY_RATIO[density]);
}
export function createGanttBenchmarkDataset(options: GanttBenchmarkOptions): GanttBenchmarkDataset {
  const timeline = TIMELINES[options.timelineSpan];
  const tasks: GanttTaskSourceRow[] = [];
  const summaryTaskIds: string[] = [];
  const leafTaskIds: string[] = [];
  const random = mulberry32(options.seed);
  const groupCount = Math.ceil(options.taskCount / GANTT_BENCHMARK_GROUP_SIZE);

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const firstIndex = groupIndex * GANTT_BENCHMARK_GROUP_SIZE;
    const parentId = `benchmark-summary-${groupIndex + 1}`;
    const groupLength = Math.min(GANTT_BENCHMARK_GROUP_SIZE, options.taskCount - firstIndex);
    const firstLeafPosition = Math.min(timeline.days - 2, Math.floor((firstIndex / options.taskCount) * (timeline.days - 1)));

    tasks.push({
      id: parentId,
      name: `Phase ${groupIndex + 1}`,
      type: 'summary',
      startDate: addUtcDays(timeline.start, firstLeafPosition),
      endDate: addUtcDays(timeline.start, Math.min(timeline.days - 1, firstLeafPosition + 6)),
      calendarId: GANTT_BENCHMARK_CALENDAR_ID,
    });
    summaryTaskIds.push(parentId);

    for (let offset = 1; offset < groupLength; offset += 1) {
      const taskIndex = firstIndex + offset;
      const taskId = `benchmark-task-${taskIndex + 1}`;
      const basePosition = Math.floor((taskIndex / Math.max(1, options.taskCount - 1)) * (timeline.days - 8));
      const jitter = Math.floor(random() * Math.min(5, Math.max(1, timeline.days - basePosition - 2)));
      const startDay = Math.min(timeline.days - 2, basePosition + jitter);
      const duration = 2 + Math.floor(random() * 6);

      tasks.push({
        id: taskId,
        parentId,
        name: `Task ${(taskIndex + 1).toLocaleString('en-US')}`,
        startDate: addUtcDays(timeline.start, startDay),
        endDate: addUtcDays(timeline.start, Math.min(timeline.days - 1, startDay + duration - 1)),
        calendarId: GANTT_BENCHMARK_CALENDAR_ID,
      });
      leafTaskIds.push(taskId);
    }
  }

  const dependencies = createDependencies(leafTaskIds, dependencyTarget(options.taskCount, options.density));

  return {
    config: {
      id: `gantt-benchmark-${options.taskCount}-${options.density}-${options.timelineSpan}`,
      name: `${options.taskCount.toLocaleString('en-US')} task ${options.density} benchmark`,
      version: 'benchmark-v1',
      currency: 'USD',
      timeZone: 'UTC',
      primaryCalendarId: GANTT_BENCHMARK_CALENDAR_ID,
      updatedAt: `${timeline.start}T00:00:00Z`,
      statusDate: timeline.start,
      zoomPreset: timeline.zoomPreset,
    },
    tasks,
    dependencies,
    summaryTaskIds,
    leafTaskIds,
    projectStart: timeline.start,
    projectEnd: timeline.end,
  };
}

function createDependencies(leafTaskIds: readonly string[], target: number): DependencyEntity[] {
  const maximum = leafTaskIds.length * (leafTaskIds.length - 1) / 2;
  const resolvedTarget = Math.min(target, maximum);
  const dependencies: DependencyEntity[] = [];

  for (let distance = 1; dependencies.length < resolvedTarget && distance < leafTaskIds.length; distance += 1) {
    for (let successorIndex = distance; successorIndex < leafTaskIds.length && dependencies.length < resolvedTarget; successorIndex += 1) {
      dependencies.push({
        id: `benchmark-dependency-${dependencies.length + 1}`,
        predecessorTaskId: leafTaskIds[successorIndex - distance],
        successorTaskId: leafTaskIds[successorIndex],
        type: distance % 4 === 0 ? 'finish-to-start' : 'start-to-start',
        lagDays: 0,
      });
    }
  }

  return dependencies;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4_294_967_296;
  };
}

function addUtcDays(date: string, days: number): ISODateString {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * DAY_IN_MS).toISOString().slice(0, 10) as ISODateString;
}
