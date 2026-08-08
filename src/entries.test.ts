import { describe, expect, it } from 'vitest';
import { resolveGanttEntry } from './entries';

describe('Gantt entry routing', () => {
  it('routes technical examples and use cases through separate query parameters', () => {
    expect(resolveGanttEntry('?example=big-data').id).toBe('big-data');
    expect(resolveGanttEntry('?use-case=industry-resource-planning').id).toBe('industry-resource-planning');
  });

  it('keeps industry ids out of example routes and preserves the showcase fallback', () => {
    expect(resolveGanttEntry('?example=industry-internal-tools').id).toBe('showcase');
    expect(resolveGanttEntry('?use-case=unknown').id).toBe('showcase');
  });
});
