import type { ColumnRegular } from '@revolist/revogrid';
import { SHOWCASE_COLUMNS_POLISHED } from './data/gantt-project-data';

function taskColor(row: { id?: string; taskKind?: string; type?: string }) {
  if (row.taskKind === 'summary') return 'var(--gantt-summary-bg)';
  if (row.taskKind === 'milestone' || row.type === 'milestone')
    return 'var(--gantt-milestone-bg)';
  if (
    row.id === 'design' ||
    row.id === 'test-plan' ||
    row.id === 'integration-tests'
  )
    return 'var(--gantt-summary-bg)';
  return 'var(--gantt-task-bg)';
}

export const showcaseColumns: ColumnRegular[] = SHOWCASE_COLUMNS_POLISHED.map(
  (column) =>
    column.prop !== 'name'
      ? column
      : {
          ...column,
          cellTemplate: (h, { model }) =>
            h('div', { class: 'gantt-showcase-task-cell' }, [
              h('span', {
                class: 'gantt-showcase-task-dot',
                'aria-hidden': 'true',
                style: { backgroundColor: taskColor(model) },
              }),
              h(
                'span',
                { class: 'gantt-showcase-task-name', title: model.name },
                model.name,
              ),
            ]),
        },
);

export function showcaseTaskBarColor({
  row,
}: {
  row: { id?: string; taskKind?: string; type?: string };
}) {
  return { barColor: taskColor(row) };
}
