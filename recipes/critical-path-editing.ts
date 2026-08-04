import {
  SHOWCASE_GANTT_CONFIG,
  SHOWCASE_TASKS,
} from '../src/shared/gantt-project-data';

export const criticalPathAndEditingRecipe = {
  config: {
    ...SHOWCASE_GANTT_CONFIG,
    allowTaskCreate: true,
    taskCreateRow: true,
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      showCriticalPath: true,
    },
  },
  tasks: SHOWCASE_TASKS,
};

