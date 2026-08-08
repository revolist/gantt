import { resolveGanttExample } from './examples';
import type { GanttEntryDefinition } from './gantt-entry';
import { resolveGanttUseCase } from './use-cases';

export function resolveGanttEntry(search: string): GanttEntryDefinition {
  return resolveGanttUseCase(search) ?? resolveGanttExample(search);
}
