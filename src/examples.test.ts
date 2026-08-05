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

  it('resolves the big-data example and keeps every framework loader registered', () => {
    const example = resolveGanttExample('?example=big-data');

    expect(example).toBe(GANTT_EXAMPLES['big-data']);
    expect(example.angularSelector).toBe('gantt-big-data-grid');
    expect(GANTT_EXAMPLE_IDS).toEqual(['showcase', 'big-data']);
    expect(typeof example.loadTs).toBe('function');
    expect(typeof example.loadReact).toBe('function');
    expect(typeof example.loadVue).toBe('function');
    expect(typeof example.loadAngular).toBe('function');
  });
});
