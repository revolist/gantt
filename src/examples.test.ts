import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GANTT_EXAMPLE_ID,
  GANTT_EXAMPLES,
  GANTT_EXAMPLE_IDS,
  resolveGanttExample,
} from './examples';

describe('Gantt example registry', () => {
  it('uses the showcase for missing and unknown example ids', () => {
    expect(resolveGanttExample('').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
    expect(resolveGanttExample('?example=unknown').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
  });

  it('resolves both big-data examples and keeps every framework loader registered', () => {
    const example = resolveGanttExample('?example=big-data');
    const horizontalExample = resolveGanttExample('?example=horizontal-big-data');

    expect(example).toBe(GANTT_EXAMPLES['big-data']);
    expect(example.angularSelector).toBe('gantt-big-data-grid');
    expect(horizontalExample).toBe(GANTT_EXAMPLES['horizontal-big-data']);
    expect(horizontalExample.angularSelector).toBe('gantt-horizontal-big-data-grid');
    expect(GANTT_EXAMPLE_IDS).toEqual(['showcase', 'big-data', 'horizontal-big-data']);
    for (const registeredExample of [example, horizontalExample]) {
      expect(typeof registeredExample.loadTs).toBe('function');
      expect(typeof registeredExample.loadReact).toBe('function');
      expect(typeof registeredExample.loadVue).toBe('function');
      expect(typeof registeredExample.loadAngular).toBe('function');
    }
  });
});
