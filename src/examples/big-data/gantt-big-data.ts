import './gantt-big-data.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/revogrid-enterprise';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  createGanttBigDataSet,
  ganttBigDataCalendars,
  ganttBigDataConfig,
} from './gantt-big-data-data';

defineCustomElements();

export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  const root = document.createElement('section');
  const grid = document.createElement('revo-grid');
  const data = createGanttBigDataSet();

  root.className = 'gantt-big-data-demo';
  grid.className = 'gantt-big-data-grid';
  grid.hideAttribution = true;
  grid.theme = currentTheme().isDark() ? 'darkCompact' : 'compact';
  grid.plugins = [GanttPlugin];
  grid.columns = [createDefaultTaskTableColumn('name')];
  grid.gantt = ganttBigDataConfig;
  grid.ganttDependencies = data.dependencies;
  grid.ganttCalendars = ganttBigDataCalendars;

  root.appendChild(grid);
  parent.appendChild(root);
  const disconnectTheme = observeCurrentTheme((isDark) => {
    grid.theme = isDark ? 'darkCompact' : 'compact';
  });

  grid.source = data.tasks;

  return () => {
    disconnectTheme();
    root.remove();
  };
}
