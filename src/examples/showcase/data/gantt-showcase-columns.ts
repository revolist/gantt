/** Project column presets owned by the showcase example. */
import type { ColumnRegular } from '@revolist/revogrid';
import { createDefaultTaskTableColumn, isGanttAddTaskRow } from '@revolist/gantt';
import { getShowcaseTaskIcon } from './gantt-showcase-icons';

const SHOWCASE_TAG_TONES: Record<string, string> = {
  Backend: 'red',
  Design: 'blue',
  Frontend: 'green',
  DevOps: 'neutral',
  QA: 'blue',
  Security: 'red',
};

function renderShowcaseNameCell(h: Parameters<Required<ColumnRegular>['cellTemplate']>[0], model: any) {
  const tag = model.tags?.[0];
  const tagTone = tag ? SHOWCASE_TAG_TONES[tag] ?? 'neutral' : '';
  const statusKey = model.statusKey ?? 'not-started';

  return h('div', { class: { 'gantt-showcase-task-cell': true } }, [
    h('span', {
      class: 'gantt-showcase-status-icon',
      title: String(model.name ?? tag ?? statusKey),
      'aria-label': String(model.name ?? tag ?? statusKey),
      innerHTML: getShowcaseTaskIcon(model.id, tag),
    }),
    h('span', { class: { 'gantt-showcase-task-name': true }, title: model.name }, model.name),
    tag
      ? h('span', {
          class: `gantt-status-badge gantt-status-badge--${tagTone}`,
          title: tag,
        }, [
          h('span', { class: 'gantt-status-badge__dot', 'aria-hidden': 'true' }),
          h('span', { class: 'gantt-status-badge__label' }, tag),
        ])
      : null,
  ]);
}

function isShowcaseRootTask(model: any) {
  return model.parentId === null || model.parentId === undefined || model.parentId === '';
}

function showcaseCellProperties({ model }: any) {
  return {
    class: {
      'gantt-showcase-cell--root': isShowcaseRootTask(model),
      'gantt-showcase-cell--summary': model.taskKind === 'summary',
    },
  };
}

export const SHOWCASE_COLUMNS_POLISHED: ColumnRegular[] = [
  {
    ...createDefaultTaskTableColumn('wbs'),
    name: 'WBS',
    size: 72,
    cellProperties: showcaseCellProperties,
  },
  {
    ...createDefaultTaskTableColumn('name'),
    name: 'Task',
    size: 292,
    cellTemplate: (h, { model }) => renderShowcaseNameCell(h, model),
    cellProperties: showcaseCellProperties,
  },
  {
    ...createDefaultTaskTableColumn('assignees'),
    size: 102,
    cellProperties: showcaseCellProperties,
  },
  {
    ...createDefaultTaskTableColumn('cost' as any),
    size: 114,
    cellProperties: showcaseCellProperties,
  },
  {
    ...createDefaultTaskTableColumn('startDate'),
    name: 'Start',
    size: 116,
    cellProperties: showcaseCellProperties,
  },
  {
    ...createDefaultTaskTableColumn('duration'),
    name: 'Dur',
    size: 90,
    cellProperties: showcaseCellProperties,
  },
];

export const SHOWCASE_COLUMNS_WITH_ROW_SELECT: ColumnRegular[] = [
  {
    prop: 'selected',
    name: '',
    rowSelect: ({ model }: any) => !isGanttAddTaskRow(model),
    size: 56,
    readonly: true,
    filter: false,
  },
  ...SHOWCASE_COLUMNS_POLISHED,
];

const showcaseDoneColumn: ColumnRegular = {
  prop: 'done',
  name: '',
  rowStatus: { attribute: 'data-done' },
  size: 58,
  readonly: ({ model }: any) => isGanttAddTaskRow(model),
  filter: false,
};

const showcaseWbsColumn: ColumnRegular = {
  ...SHOWCASE_COLUMNS_POLISHED[0]!,
  filter: false,
};
const showcaseTaskColumns = SHOWCASE_COLUMNS_POLISHED.slice(1);

export const SHOWCASE_COLUMNS_WITH_COMPLETION: ColumnRegular[] = [
  showcaseWbsColumn,
  showcaseDoneColumn,
  ...showcaseTaskColumns,
];

function hasClass(node: any, className: string) {
  const nodeClass = node?.props?.class;

  if (typeof nodeClass === 'string') {
    return nodeClass.split(/\s+/).includes(className);
  }

  return Boolean(nodeClass?.[className]);
}

function estimateTaskLabelWidth(label: string) {
  return Array.from(label).reduce((width, character) => {
    if (/\s/.test(character)) return width + 3;
    if (/[ilI1.,'|]/.test(character)) return width + 3.2;
    if (/[MW@#%&]/.test(character)) return width + 8.2;
    if (/[A-Z0-9]/.test(character)) return width + 6.5;
    return width + 5.7;
  }, 0);
}

function canShowTaskLabel(row: any) {
  const label = typeof row.taskLabel === 'string' ? row.taskLabel.trim() : '';
  const barWidth = row.ganttLayout?.width;

  if (!label || typeof barWidth !== 'number') {
    return false;
  }

  const assigneeCount = row.assigneeDetails?.length ?? 0;
  const labelStart = assigneeCount > 0 ? 30 + (assigneeCount > 1 ? 5 : 0) : 10;
  const requiredWidth = labelStart + estimateTaskLabelWidth(label) + 10;

  return barWidth >= requiredWidth;
}

export function renderShowcaseTaskBarContent({ h, row, defaultContent }: any) {
  const content = row.taskKind === 'summary' || row.type === 'summary' || !canShowTaskLabel(row)
    ? defaultContent.filter((node: any) => !hasClass(node, 'gantt-bar__label'))
    : defaultContent;

  if (!row.assigneeDetails?.length) {
    return content;
  }

  const primaryAssignee = row.assigneeDetails[0];
  const secondaryAssignee = row.assigneeDetails[1];
  const badge = (assignee: any, kind: 'primary' | 'secondary') => h('span', {
    class: {
      'gantt-bar__assignee-badge': true,
      [`gantt-bar__assignee-badge--${kind}`]: true,
    },
    style: { background: assignee.color },
  }, assignee.initials);

  return [
    ...content,
    h('span', {
      class: {
        'gantt-bar__assignee-stack': true,
        'gantt-bar__assignee-stack--multiple': Boolean(secondaryAssignee),
      },
      title: row.assigneeDetails.map((assignee: any) => assignee.name).join(', '),
      'aria-hidden': 'true',
    }, [
      secondaryAssignee ? badge(secondaryAssignee, 'secondary') : null,
      badge(primaryAssignee, 'primary'),
    ].filter(Boolean)),
  ];
}

export function renderShowcaseTaskBarColor({ row }: any) {
  if (row.done !== true) {
    return undefined;
  }

  return {
    className: 'gantt-showcase-bar--finished',
  };
}
