import {
  TIMELINE_ZOOM_PRESET_LEVELS,
  fitGanttToProject,
  getGanttTimelineNavigationRuntime,
  type TimelineZoomLevel,
} from '@revolist/gantt';

export type ShowcaseTimelineScale = 'fit' | 'week' | 'month';

export const SHOWCASE_TIMELINE_SCALE_OPTIONS: readonly {
  value: ShowcaseTimelineScale;
  label: string;
}[] = [
  { value: 'fit', label: 'Fit' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export const SHOWCASE_TIMELINE_LEVELS = {
  week: 'day-week',
  month: 'week-month',
} as const;

function getPresetLevel(id: string): TimelineZoomLevel {
  const level = TIMELINE_ZOOM_PRESET_LEVELS.find((candidate) => candidate.id === id);

  if (!level) {
    throw new Error(`Missing Gantt timeline zoom level: ${id}`);
  }

  return level;
}

export const SHOWCASE_TIMELINE_ZOOM_LEVELS: readonly TimelineZoomLevel[] = [
  {
    ...getPresetLevel(SHOWCASE_TIMELINE_LEVELS.week),
    tickWidth: 44,
  },
  getPresetLevel(SHOWCASE_TIMELINE_LEVELS.month),
];

export async function applyShowcaseTimelineScale(
  grid: HTMLRevoGridElement,
  scale: ShowcaseTimelineScale,
): Promise<boolean> {
  if (scale === 'fit') {
    const applied = await fitGanttToProject(grid);

    if (applied) {
      await grid.refresh?.('all');
    }

    return applied;
  }

  const runtime = await getGanttTimelineNavigationRuntime(grid);
  const levelId = SHOWCASE_TIMELINE_LEVELS[scale];

  if (!runtime?.setZoomLevel) {
    return false;
  }

  if (runtime.getZoomLevel?.()?.id === levelId) {
    return true;
  }

  const applied = runtime.setZoomLevel(levelId);

  if (applied) {
    await grid.refresh?.('all');
  }

  return applied;
}
