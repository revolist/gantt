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

function getTaskBarLabels(grid: HTMLRevoGridElement) {
  const labels: HTMLElement[] = [];
  const ElementClass = grid.ownerDocument?.defaultView?.Element;
  const collectLabels = (root: ParentNode) => {
    labels.push(...root.querySelectorAll<HTMLElement>('.gantt-bar__label'));
    if (ElementClass && root instanceof ElementClass && root.shadowRoot) {
      collectLabels(root.shadowRoot);
    }
    root.querySelectorAll<HTMLElement>('*').forEach((element) => {
      if (element.shadowRoot) {
        collectLabels(element.shadowRoot);
      }
    });
  };
  collectLabels(grid);
  return labels;
}

function syncTaskBarLabelVisibility(grid: HTMLRevoGridElement) {
  getTaskBarLabels(grid).forEach((label) => {
    label.removeAttribute('data-showcase-label-overflow');
    if (label.scrollWidth > label.clientWidth) {
      label.setAttribute('data-showcase-label-overflow', 'true');
    }
  });
}

export function observeShowcaseTaskBarLabels(grid: HTMLRevoGridElement) {
  const view = grid.ownerDocument?.defaultView;
  const MutationObserverClass = view?.MutationObserver;
  const requestFrame = view?.requestAnimationFrame?.bind(view);
  let frame = 0;
  const scheduleSync = () => {
    if (!requestFrame) {
      syncTaskBarLabelVisibility(grid);
      return;
    }
    if (frame) return;
    frame = requestFrame(() => {
      frame = 0;
      syncTaskBarLabelVisibility(grid);
    });
  };
  const observer = MutationObserverClass
    ? new MutationObserverClass(scheduleSync)
    : undefined;

  observer?.observe(grid, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style'],
  });
  scheduleSync();

  return () => {
    observer?.disconnect();
    if (frame && view?.cancelAnimationFrame) view.cancelAnimationFrame(frame);
  };
}

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
