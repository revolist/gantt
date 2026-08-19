import type { GanttTaskSourceRow } from '@revolist/gantt';

export type ConstructionDepartment = 'projects' | 'fabrication' | 'installation' | 'procurement' | 'external';

export type ConstructionTask = Omit<GanttTaskSourceRow, 'id' | 'parentId' | 'type' | 'startDate' | 'endDate' | 'duration'> & {
  id: string;
  parentId: string | null;
  type: 'task' | 'summary' | 'milestone';
  startDate: string;
  endDate: string;
  duration?: number | string;
  projectRef: string;
  legacyTaskId?: string;
  entityKind: 'task' | 'execution' | 'context' | 'supplemental';
  department: ConstructionDepartment;
  departmentLabel: string;
  resourceName?: string;
  workArea?: string;
  source: 'master' | 'lookahead';
  notes?: string;
};

export interface ProjectEntity {
  id: string;
  projectRef: string;
  legacyTaskId: string;
  name: string;
  startDate: string;
  endDate: string;
  percentDone: number;
  notes: string;
}
