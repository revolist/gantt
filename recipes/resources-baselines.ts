import {
  ASSIGNMENTS,
  BASELINES,
  RESOURCES,
  TASKS_SLIPPED,
  makeGanttConfig,
} from '../src/shared/gantt-project-data';

export const resourcesAndBaselinesRecipe = {
  config: makeGanttConfig({ visuals: { showBaseline: true } }),
  tasks: TASKS_SLIPPED,
  resources: RESOURCES,
  assignments: ASSIGNMENTS,
  baselines: BASELINES,
};

