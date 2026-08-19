import {
  constructionAssignments,
  constructionCalendars,
  constructionDependencies,
  constructionProjects,
  constructionResources,
  constructionTasks,
  projectRow,
} from './construction-model';
import type { ConstructionTask } from './construction-types';

function durationDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86_400_000) + 1);
}

/** Creates the one mutable source used by all simple Gantt views. */
export function createConstructionRows(): ConstructionTask[] {
  return constructionProjects.flatMap((project) => [
    { ...projectRow(project), duration: durationDays(project.startDate, project.endDate) },
    ...constructionTasks
      .filter((task) => task.projectRef === project.projectRef)
      .map((task) => ({
        ...task,
        // Numeric input uses the Gantt project's default working-day unit.
        duration: task.duration ?? durationDays(task.startDate, task.endDate),
      })),
  ]);
}

export function rootName(rows: ConstructionTask[], rootId: string | null): string {
  return rows.find((row) => row.id === rootId)?.name ?? 'Company Master';
}

export { constructionAssignments, constructionCalendars, constructionDependencies, constructionResources };
