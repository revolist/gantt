import {
  DEFAULT_TIMELINE_ZOOM_LEVELS,
  defineGanttToolbar,
  destroyGanttToolbar,
  type GanttPluginConfig,
} from '@revolist/gantt';
import {
  SHOWCASE_COLUMN_OPTIONS,
  SHOWCASE_GANTT_CONFIG,
} from './data/gantt-project-data';
import { showcaseTaskBarColor } from './gantt-showcase-appearance';

export function createShowcaseConfig(): GanttPluginConfig {
  return {
    ...SHOWCASE_GANTT_CONFIG,
    taskCreateOnTimeline: true,
    scrollToTaskOnCellClick: true,
    zoom: {
      levels: DEFAULT_TIMELINE_ZOOM_LEVELS.filter((level) =>
        ['day-week', 'week-month', 'month-quarter', 'quarter-year'].includes(
          level.id,
        ),
      ).map((level) =>
        level.id === 'week-month' ? { ...level, tickWidth: 62 } : level,
      ),
    },
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      taskBarColorHook: showcaseTaskBarColor,
      showBaseline: false,
      showCriticalPath: false,
      shadeNonWorkingTime: false,
      taskLabelPlacement: 'auto',
    },
  };
}

export function mountShowcaseToolbar(
  host: HTMLElement,
  grid: HTMLRevoGridElement,
): () => void {
  defineGanttToolbar(host, {
    grid,
    columns: SHOWCASE_COLUMN_OPTIONS.map(
      ({ prop, label, defaultVisible }) => ({
        prop,
        label,
        visible: defaultVisible,
      }),
    ),
    controls: { baseline: true },
  });
  return () => destroyGanttToolbar(host);
}
