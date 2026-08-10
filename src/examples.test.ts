import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GANTT_EXAMPLE_ID,
  GANTT_EXAMPLES,
  GANTT_EXAMPLE_IDS,
  resolveGanttExample,
} from './examples';

describe('Gantt example registry', () => {
  it('contains technical examples only', () => {
    expect(GANTT_EXAMPLE_IDS).toEqual(['showcase', 'big-data', 'horizontal-big-data', 'benchmark']);
    expect(GANTT_EXAMPLE_IDS.some((id) => id.startsWith('industry-'))).toBe(false);
  });

  it('uses the showcase for missing, unknown, and use-case ids', () => {
    expect(resolveGanttExample('').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
    expect(resolveGanttExample('?example=unknown').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
    expect(resolveGanttExample('?example=industry-erp').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
    expect(resolveGanttExample('?use-case=industry-erp').id).toBe(DEFAULT_GANTT_EXAMPLE_ID);
  });

  it('resolves technical examples with every framework loader', () => {
    for (const id of GANTT_EXAMPLE_IDS) {
      const example = resolveGanttExample(`?example=${id}`);
      expect(example).toBe(GANTT_EXAMPLES[id]);
      expect(typeof example.loadTs).toBe('function');
      expect(typeof example.loadReact).toBe('function');
      expect(typeof example.loadVue).toBe('function');
      expect(typeof example.loadAngular).toBe('function');
    }
  });
});
