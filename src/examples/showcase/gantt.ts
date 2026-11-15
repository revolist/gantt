import '@revolist/ui/styles.css';
// src/examples/showcase/gantt.ts
import './gantt.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
defineCustomElements();

import { GanttPlugin } from '@revolist/gantt';
import { mountShowcaseToolbar } from './showcase-toolbar';
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
  renderShowcaseTaskBarColor,
  renderShowcaseTaskBarContent,
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
  grid.gantt = {
    ...SHOWCASE_GANTT_CONFIG,
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      showBaseline: false,
      taskBarColorHook: renderShowcaseTaskBarColor,
      taskBarContentHook: renderShowcaseTaskBarContent,
    },
  } as typeof grid.gantt;
  container.appendChild(grid);
  grid.source = [...SHOWCASE_TASKS];
  const disposeToolbar = mountShowcaseToolbar(toolbar, grid);

  return () => {
    disposeToolbar();
    disconnectTheme();
    container.remove();
  };
}
