import { GanttPlugin } from '@revolist/gantt';
import { ExportExcelPlugin } from '@revolist/revogrid-pro';
import {
  STANDARD_CALENDAR,
  SHOWCASE_ASSIGNMENTS,
  SHOWCASE_BASELINES,
  SHOWCASE_DEFAULT_HIDDEN,
  SHOWCASE_DEPENDENCIES,
  SHOWCASE_RESOURCES,
  SHOWCASE_TASKS,
  SHOWCASE_COLUMN_OPTIONS,
} from './data/gantt-project-data';
import { showcaseColumns } from './gantt-showcase-appearance';
import { createShowcaseConfig } from './gantt-showcase-toolbar';

export function createGanttShowcaseState() {
  return {
    plugins: [GanttPlugin, ExportExcelPlugin],
    source: [...SHOWCASE_TASKS],
    dependencies: [...SHOWCASE_DEPENDENCIES],
    calendars: [{ ...STANDARD_CALENDAR }],
    resources: [...SHOWCASE_RESOURCES],
    assignments: [...SHOWCASE_ASSIGNMENTS],
    baselines: [...SHOWCASE_BASELINES],
    columns: [...showcaseColumns],
    hiddenColumns: [...SHOWCASE_DEFAULT_HIDDEN],
    gantt: createShowcaseConfig(),
    toolbarColumns: SHOWCASE_COLUMN_OPTIONS.map(
      ({ prop, label, defaultVisible }) => ({
        prop,
        label,
        visible: defaultVisible,
      }),
    ),
  };
}
