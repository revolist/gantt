import { describe, expect, it } from 'vitest';
import {
  GANTT_USE_CASES,
  GANTT_USE_CASE_IDS,
  resolveGanttUseCase,
} from '.';

describe('Gantt use-case registry', () => {
  it('keeps all industry use cases in the dedicated registry', () => {
    expect(GANTT_USE_CASE_IDS).toEqual([
      'industry-erp',
      'industry-professional-services',
      'industry-construction',
      'industry-manufacturing',
      'industry-resource-planning',
      'industry-internal-tools',
    ]);
  });

  it('resolves the dedicated use-case query with every framework loader', () => {
    for (const id of GANTT_USE_CASE_IDS) {
      const useCase = resolveGanttUseCase(`?use-case=${id}`);
      expect(useCase).toBe(GANTT_USE_CASES[id]);
      expect(useCase?.angularSelector).toBe('industry-gantt-grid');
      expect(typeof useCase?.loadTs).toBe('function');
      expect(typeof useCase?.loadReact).toBe('function');
      expect(typeof useCase?.loadVue).toBe('function');
      expect(typeof useCase?.loadAngular).toBe('function');
    }
  });

  it('does not resolve example routes from the use-case registry', () => {
    expect(resolveGanttUseCase('?example=industry-erp')).toBeUndefined();
    expect(resolveGanttUseCase('?use-case=unknown')).toBeUndefined();
    expect(resolveGanttUseCase('?example=big-data')).toBeUndefined();
  });
});
