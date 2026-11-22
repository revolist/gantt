import '@revolist/ui/styles.css';
// src/examples/showcase/gantt.ts
import './gantt.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
defineCustomElements();

import { createGanttShowcaseState } from './gantt-showcase-state';
import { mountShowcaseToolbar } from './gantt-showcase-toolbar';
import { currentTheme, observeCurrentTheme } from '../../theme';

// ─── Entry point ──────────────────────────────────────────────────────────────

export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;
  return mountShowcase(parent);
}

export function mountShowcase(parent: HTMLElement): () => void {
  const state = createGanttShowcaseState();
  const darkTheme = currentTheme().isDark();

  const container = document.createElement('div');
  container.className = `gantt-showcase-shell grow h-full ${darkTheme ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`;
  parent.appendChild(container);

  const grid = document.createElement('revo-grid') as HTMLRevoGridElement;
  const toolbar = document.createElement('div');
  toolbar.className = 'gantt-showcase-controls';
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
  grid.plugins        = state.plugins;
  grid.hideColumns    = state.hiddenColumns;
  grid.columns        = state.columns;
  grid.ganttDependencies = state.dependencies;
  grid.ganttCalendars = state.calendars;
  grid.ganttResources = state.resources;
  grid.ganttAssignments = state.assignments;
  grid.ganttBaselines = state.baselines;
  const disconnectTheme = observeCurrentTheme((isDark) => {
    grid.theme = isDark ? 'darkCompact' : 'compact';
    container.classList.toggle('gantt-showcase-shell--dark', isDark);
    container.classList.toggle('gantt-showcase-shell--light', !isDark);
  });
  grid.gantt = state.gantt;
  container.appendChild(grid);
  grid.source = state.source;
  const disposeToolbar = mountShowcaseToolbar(toolbar, grid);

  return () => {
    disposeToolbar();
    disconnectTheme();
    container.remove();
  };
}
