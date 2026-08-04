import {
  DEPENDENCIES,
  STANDARD_CALENDAR,
  TASKS,
  US_CALENDAR,
  makeGanttConfig,
} from '../src/shared/gantt-project-data';

export const dependenciesAndCalendarsRecipe = {
  config: makeGanttConfig(),
  tasks: TASKS,
  dependencies: DEPENDENCIES,
  calendars: [STANDARD_CALENDAR, US_CALENDAR],
};

