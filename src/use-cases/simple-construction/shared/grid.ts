import folderIcon from '@fortawesome/fontawesome-free/svgs/solid/folder.svg?raw';
import folderOpenIcon from '@fortawesome/fontawesome-free/svgs/solid/folder-open.svg?raw';
import { createDefaultTaskTableColumn, GanttPlugin, normalizePinnedTaskColumns } from '@revolist/gantt';
import { FIlTER_SLIDER, rowHeaders } from '@revolist/revogrid-pro';
import { currentTheme } from '../../../theme';
import type { ConstructionTask } from './construction-types';
import {
  constructionAssignments,
  constructionCalendars,
  constructionDependencies,
  constructionResources,
} from './data';
import { constructionViewTrimmedRows } from './lookahead';
import type { SimpleConstructionState } from './types';

/** The Gantt exposes formatted working days while its source keeps dates. */
function workingDurationDays(model: { formattedDuration?: unknown; duration?: unknown }): number {
  const formatted = String(model.formattedDuration ?? '');
  const value = Number(formatted.match(/^([0-9]+(?:\.[0-9]+)?)/)?.[1]);
  return Number.isFinite(value) ? value : Number(model.duration ?? 0);
}

function createSimpleColumns(
  expandedRowIds: ReadonlySet<string>,
  selectRoot: (id: string) => void,
): any[] {
  const activity = {
    ...createDefaultTaskTableColumn('name'),
    name: 'Activity',
    size: 310,
    rowDrag: false,
    cellTemplate: (h: any, { model }: { model: ConstructionTask }) => {
      if (model.parentId != null) return h('span', {}, model.name);
      const open = expandedRowIds.has(model.id);
      return h('button', {
        class: 'construction-simple__project-link',
        title: `Show only ${model.name}`,
        onClick: (event: Event) => { event.stopPropagation(); selectRoot(model.id); },
      }, [
        h('span', { class: 'construction-simple__folder', innerHTML: open ? folderOpenIcon : folderIcon, 'aria-hidden': 'true' }),
        h('span', {}, model.name),
      ]);
    },
  };
  return [
    activity,
    { prop: 'duration', name: 'Duration', size: 112, filter: [FIlTER_SLIDER], cellParser: (model: ConstructionTask) => workingDurationDays(model) },
    { prop: 'startDate', name: 'Start', size: 132 },
    { prop: 'endDate', name: 'Finish', size: 132 },
    { prop: 'resourceName', name: 'Resource', size: 142, readonly: true },
    { prop: 'percentDone', name: 'Progress', size: 112 },
  ];
}

export function createSimpleGridBindings(
  rows: ConstructionTask[],
  state: SimpleConstructionState,
  expandedRowIds: ReadonlySet<string>,
  selectRoot: (id: string) => void,
) {
  const gantt = {
    id: 'simple-construction-gantt', name: 'Simple Construction Gantt', version: '1',
    currency: 'AUD', timeZone: 'Australia/Sydney', primaryCalendarId: 'cal-site_mon_fri',
    calendars: constructionCalendars, zoomPreset: 'day-week' as const,
    scrollToTaskOnCellClick: true, contextMenu: { colorPalette: true },
    ...(state.view === 'lookahead' ? { timelineRange: { startDate: state.startDate, endDate: state.endDate } } : {}),
  };
  return {
    theme: currentTheme().isDark() ? 'darkCompact' : 'compact',
    hideAttribution: true, readonly: false, range: true, resize: true, filter: true, rowSize: 34,
    plugins: [GanttPlugin],
    columns: normalizePinnedTaskColumns(createSimpleColumns(expandedRowIds, selectRoot), () => gantt, () => ({ prop: 'name', previewProp: 'name' })),
    rowHeaders: { ...rowHeaders({ rowDrag: true }), size: 52 },
    rowOrder: { prop: 'name', previewProp: 'name' },
    tree: { idField: 'id', parentIdField: 'parentId', rootParentId: null, expandedRowIds: new Set(expandedRowIds) },
    gantt,
    ganttDependencies: constructionDependencies,
    ganttResources: constructionResources,
    ganttAssignments: constructionAssignments,
    ganttCalendars: constructionCalendars,
    trimmedRows: constructionViewTrimmedRows(rows, state),
    source: rows,
  };
}
