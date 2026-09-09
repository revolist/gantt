// src/examples/showcase/gantt.ts
import './gantt.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
defineCustomElements();

import { GanttPlugin } from '@revolist/gantt';
import { ExportExcelPlugin, RowStatusPlugin } from '@revolist/revogrid-pro';
import {
  STANDARD_CALENDAR,
  SHOWCASE_ASSIGNMENTS,
  SHOWCASE_BASELINES,
  SHOWCASE_COLUMNS_WITH_COMPLETION,
  SHOWCASE_DEFAULT_HIDDEN,
  SHOWCASE_DEPENDENCIES,
  SHOWCASE_GANTT_CONFIG,
  SHOWCASE_RESOURCES,
  SHOWCASE_TASKS,
  SHOWCASE_TIMELINE_SCALE_OPTIONS,
  applyShowcaseTimelineScale,
  observeShowcaseTaskBarLabels,
  renderShowcaseTaskBarColor,
  renderShowcaseTaskBarContent,
  type ShowcaseTimelineScale,
} from './data/gantt-project-data';
import { currentTheme, observeCurrentTheme } from '../../theme';

// ─── Entry point ──────────────────────────────────────────────────────────────

export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;
  const darkTheme = currentTheme().isDark();

  const container = document.createElement('div');
  container.className = `gantt-showcase-shell grow h-full ${darkTheme ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`;
  parent.appendChild(container);

  const grid = document.createElement('revo-grid') as HTMLRevoGridElement;
  const toolbar = document.createElement('div');
  toolbar.className = 'gantt-showcase-toolbar';
  const controls = document.createElement('div');
  controls.className = 'gantt-showcase-controls gantt-showcase-visual-controls';
  const zoomControls = document.createElement('div');
  zoomControls.className = 'gantt-showcase-zoom rv-segmented-switch';
  zoomControls.setAttribute('role', 'group');
  zoomControls.setAttribute('aria-label', 'Timeline scale');
  toolbar.append(controls, zoomControls);
  container.appendChild(toolbar);

  grid.theme          = darkTheme ? 'darkCompact' : 'compact';
  grid.readonly       = false;
  grid.range          = true;
  grid.resize         = true;
  grid.rowSize        = 42;
  grid.rowHeaders     = false;
  grid.hideAttribution = true;
  grid.autoSizeColumn = false;
  grid.classList.add('gantt-showcase-grid');
  grid.plugins        = [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
  grid.hideColumns    = [...SHOWCASE_DEFAULT_HIDDEN];
  grid.columns        = [...SHOWCASE_COLUMNS_WITH_COMPLETION];
  grid.ganttDependencies = [...SHOWCASE_DEPENDENCIES];
  grid.ganttCalendars = [{ ...STANDARD_CALENDAR }];
  grid.ganttResources = [...SHOWCASE_RESOURCES];
  grid.ganttAssignments = [...SHOWCASE_ASSIGNMENTS];
  grid.ganttBaselines = [...SHOWCASE_BASELINES];
  const disconnectTheme = observeCurrentTheme((isDark) => {
    grid.theme = isDark ? 'darkCompact' : 'compact';
    container.classList.toggle('gantt-showcase-shell--dark', isDark);
    container.classList.toggle('gantt-showcase-shell--light', !isDark);
  });
  let showCriticalPath = Boolean(SHOWCASE_GANTT_CONFIG.visuals.showCriticalPath);
  let showBaseline = false;
  let timelineScale: ShowcaseTimelineScale = 'week';

  function applyGanttConfig() {
    grid.gantt = {
      ...SHOWCASE_GANTT_CONFIG,
      visuals: {
        ...SHOWCASE_GANTT_CONFIG.visuals,
        showCriticalPath,
        showBaseline,
        taskBarColorHook: renderShowcaseTaskBarColor,
        taskBarContentHook: renderShowcaseTaskBarContent,
      },
    } as typeof grid.gantt;
  }

  function createToggle(label: string, checked: () => boolean, onChange: (value: boolean) => void) {
    const control = document.createElement('label');
    control.className = 'gantt-showcase-control';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'gantt-showcase-control__input';
    const text = document.createElement('span');
    text.className = 'gantt-showcase-control__label';
    text.textContent = label;
    const sync = () => {
      input.checked = checked();
    };
    input.addEventListener('change', () => {
      onChange(input.checked);
      applyGanttConfig();
    });
    control.append(input, text);
    sync();
    return control;
  }

  controls.append(
    createToggle('Critical path', () => showCriticalPath, (value) => {
      showCriticalPath = value;
    }),
    createToggle('Baselines', () => showBaseline, (value) => {
      showBaseline = value;
    }),
  );

  const zoomButtons = SHOWCASE_TIMELINE_SCALE_OPTIONS.map((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rv-segmented-switch-item';
    button.textContent = option.label;
    const sync = () => {
      const active = timelineScale === option.value;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
    };
    button.addEventListener('click', async () => {
      if (await applyShowcaseTimelineScale(grid, option.value)) {
        timelineScale = option.value;
        zoomButtons.forEach((item) => item.sync());
      }
    });
    sync();
    return { button, sync };
  });
  zoomControls.append(...zoomButtons.map(({ button }) => button));

  applyGanttConfig();
  container.appendChild(grid);
  grid.source = [...SHOWCASE_TASKS];
  const disconnectLabels = observeShowcaseTaskBarLabels(grid);

  return () => {
    disconnectTheme();
    disconnectLabels();
    container.remove();
  };
}
