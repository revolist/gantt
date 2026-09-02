import { describe, expect, it } from 'vitest';
import { dependenciesAndCalendarsRecipe } from '../../../recipes/dependencies-calendars';
import { resourcesAndBaselinesRecipe } from '../../../recipes/resources-baselines';
import { criticalPathAndEditingRecipe } from '../../../recipes/critical-path-editing';

describe('Gantt recipes', () => {
  it('keeps linked tasks and working calendars together', () => {
    expect(dependenciesAndCalendarsRecipe.dependencies.length).toBeGreaterThan(0);
    expect(dependenciesAndCalendarsRecipe.calendars).toHaveLength(2);
  });

  it('contains resources, assignments, and an approved baseline', () => {
    expect(resourcesAndBaselinesRecipe.resources.length).toBeGreaterThan(0);
    expect(resourcesAndBaselinesRecipe.assignments.length).toBeGreaterThan(0);
    expect(resourcesAndBaselinesRecipe.baselines[0]?.name).toBe('Approved Plan');
  });

  it('enables task creation and critical-path visuals', () => {
    expect(criticalPathAndEditingRecipe.config.allowTaskCreate).toBe(true);
    expect(criticalPathAndEditingRecipe.config.visuals.showCriticalPath).toBe(true);
  });
});

