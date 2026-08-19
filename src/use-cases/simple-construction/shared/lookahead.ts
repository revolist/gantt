import type { ConstructionTask } from './construction-types';
import type { SimpleConstructionState } from './types';

function descendantIds(rows: ConstructionTask[], rootId: string): Set<string> {
  const ids = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows) {
      if (row.parentId != null && ids.has(String(row.parentId)) && !ids.has(row.id)) {
        ids.add(row.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function visibleConstructionIds(
  rows: ConstructionTask[],
  state: SimpleConstructionState,
): Set<string> {
  if (state.view === 'company') return new Set(rows.map(({ id }) => id));

  const rootId = state.rootId ?? 'project:2801';
  const projectIds = descendantIds(rows, rootId);
  if (state.view === 'project') return projectIds;

  const byId = new Map(rows.map((row) => [row.id, row]));
  const visible = new Set<string>();
  for (const row of rows) {
    if (!projectIds.has(row.id)) continue;
    if (String(row.startDate) > state.endDate || String(row.endDate) < state.startDate) continue;
    let current: ConstructionTask | undefined = row;
    while (current && projectIds.has(current.id)) {
      visible.add(current.id);
      current = current.parentId == null ? undefined : byId.get(String(current.parentId));
    }
  }
  return visible;
}

export function constructionTrimmedRows(
  rows: ConstructionTask[],
  state: SimpleConstructionState,
): Record<number, boolean> {
  const visible = visibleConstructionIds(rows, state);
  const children = new Map<string | null, ConstructionTask[]>();
  for (const row of rows) {
    const parentId = row.parentId == null ? null : String(row.parentId);
    const siblings = children.get(parentId) ?? [];
    siblings.push(row);
    children.set(parentId, siblings);
  }
  const ordered: ConstructionTask[] = [];
  const appendChildren = (parentId: string | null) => {
    for (const row of children.get(parentId) ?? []) {
      ordered.push(row);
      appendChildren(row.id);
    }
  };

  appendChildren(null);
  return Object.fromEntries(ordered.map((row, index) => [index, !visible.has(row.id)]));
}

export function constructionViewTrimmedRows(
  rows: ConstructionTask[],
  state: SimpleConstructionState,
): Record<number, boolean> | undefined {
  return state.view === 'lookahead'
    ? constructionTrimmedRows(rows, state)
    : undefined;
}

export function lookAheadExpandedRows(
  rows: ConstructionTask[],
  state: SimpleConstructionState,
): Set<string> {
  const visible = visibleConstructionIds(rows, state);
  const parentIds = new Set(rows
    .filter((row) => visible.has(row.id) && row.parentId != null)
    .map((row) => String(row.parentId)));
  return new Set([...parentIds].filter((id) => visible.has(id)));
}
