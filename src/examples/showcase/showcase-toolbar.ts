import { defineGanttToolbar, destroyGanttToolbar } from '@revolist/gantt';
import { SHOWCASE_COLUMN_OPTIONS, SHOWCASE_COLUMNS_WITH_COMPLETION } from './data/gantt-project-data';

/** Share the public Gantt command bar across all framework examples. */
export function mountShowcaseToolbar(host: HTMLElement, grid: HTMLRevoGridElement) {
  defineGanttToolbar(host, {
    grid,
    columns: SHOWCASE_COLUMN_OPTIONS.filter(column =>
      SHOWCASE_COLUMNS_WITH_COMPLETION.some(configured => configured.prop === column.prop),
    ).map(column => ({
      prop: column.prop,
      label: column.label,
      visible: column.defaultVisible,
    })),
    controls: { baseline: true },
  });
  return () => destroyGanttToolbar(host);
}
