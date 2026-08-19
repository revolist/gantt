import type { ConstructionTask } from './construction-types';

type TaskChangeDetail = {
  taskId?: string;
  action?: string;
  sourcePatch?: Partial<ConstructionTask>;
  changes?: Partial<ConstructionTask>;
};

/** Applies a package-provided task patch to the shared mutable collection. */
export function applyTaskPatch(rows: ConstructionTask[], detail: TaskChangeDetail | undefined): void {
  const patch = detail?.sourcePatch ?? (detail?.action === 'edit' ? detail?.changes : undefined);
  const row = rows.find((item) => item.id === String(detail?.taskId));
  if (row && patch) {
    Object.assign(row, patch);
  }
}
