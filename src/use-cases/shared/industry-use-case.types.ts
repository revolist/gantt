import type { ColumnRegular } from '@revolist/revogrid';
import type { AssignmentEntity, BaselineSnapshot, CalendarEntity, DependencyEntity, GanttPluginConfig, GanttTaskBarColorHook, GanttTaskSourceRow, ResourceEntity } from '@revolist/gantt';

export interface IndustryMetric {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'default' | 'positive' | 'warning' | 'danger';
}

export type IndustryGridTheme =
  | 'adaptiveCompact'
  | 'adaptiveMaterial'
  | 'compact'
  | 'material'
  | 'darkCompact'
  | 'darkMaterial';

export interface IndustryGridPresentation {
  readonly theme: IndustryGridTheme;
  readonly rowSize: number;
  readonly rowHeaders: boolean;
  readonly cellBorders: boolean;
  readonly timelinePanelWidth?: number | string;
}

export interface IndustryGanttDefinition<TTask extends GanttTaskSourceRow = GanttTaskSourceRow> {
  readonly id: string;
  readonly productLabel: string;
  readonly title: string;
  readonly subtitle: string;
  readonly scheduleLabel: string;
  readonly riskLegendLabel: string;
  readonly updatedLabel: string;
  readonly mark: string;
  readonly metrics: readonly IndustryMetric[];
  readonly grid?: IndustryGridPresentation;
  readonly tasks: readonly TTask[];
  readonly dependencies: readonly DependencyEntity[];
  readonly calendars: readonly CalendarEntity[];
  readonly resources: readonly ResourceEntity[];
  readonly assignments: readonly AssignmentEntity[];
  readonly baselines: readonly BaselineSnapshot[];
  readonly columns: readonly ColumnRegular[];
  readonly gantt: GanttPluginConfig;
  readonly taskBarColorHook?: GanttTaskBarColorHook;
}

export function createIndustryGanttConfig(definition: IndustryGanttDefinition, showBaseline: boolean, showCriticalPath: boolean): GanttPluginConfig {
  return { ...definition.gantt, visuals: { ...definition.gantt.visuals, showBaseline, showCriticalPath, taskBarColorHook: definition.taskBarColorHook } };
}

export function resolveIndustryWorkflowStatus(row: { readonly workflowStatus?: string; readonly workflowStatusKey?: string }): string | undefined {
  return row.workflowStatusKey ?? row.workflowStatus;
}
