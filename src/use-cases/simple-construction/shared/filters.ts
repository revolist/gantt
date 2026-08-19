import type { ColumnFilterConfig, HTMLRevoGridElement } from '@revolist/revogrid';
import type { ConstructionTask } from './construction-types';

/**
 * Keeps every row belonging to the selected project.
 *
 * `projectRef` is shared by a project summary and all of its descendants, so
 * this scope composes with regular column filters such as Duration.
 */
export function projectKeepOnlyFilter(
  rows: ConstructionTask[],
  rootId: string | null,
): ColumnFilterConfig {
  const projectRef = rootId ? rows.find((row) => row.id === rootId)?.projectRef : '';
  return {
    multiFilterItems: projectRef
      ? { projectRef: [{ id: 1, type: 'eq', value: projectRef, relation: 'and' }] }
      : {},
  };
}

/** Applies the project scope without replacing the Gantt's source. */
export async function applyProjectKeepOnlyFilter(
  grid: HTMLRevoGridElement | null | undefined,
  rows: ConstructionTask[],
  rootId: string | null,
): Promise<void> {
  if (!grid) return;
  const filter = (await grid.getPlugins()).find((plugin): plugin is {
    onFilterChange(items: NonNullable<ColumnFilterConfig['multiFilterItems']>): Promise<void>;
  } => typeof (plugin as { onFilterChange?: unknown }).onFilterChange === 'function');
  await filter?.onFilterChange(projectKeepOnlyFilter(rows, rootId).multiFilterItems ?? {});
}
