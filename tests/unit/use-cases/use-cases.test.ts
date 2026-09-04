import { describe, expect, it } from 'vitest';
import {
  GANTT_USE_CASES,
  GANTT_USE_CASE_IDS,
  resolveGanttUseCase,
} from '../../../src/use-cases';

describe('Gantt use-case registry', () => {
  it('keeps all industry use cases in the dedicated registry', () => {
    expect(GANTT_USE_CASE_IDS).toEqual([
      'industry-erp',
      'industry-professional-services',
      'industry-construction',
      'industry-manufacturing',
      'industry-resource-planning',
      'industry-internal-tools',
      'simple-construction',
    ]);
  });

  it('resolves the dedicated use-case query with every framework loader', () => {
    const angularSelectors = {
      'industry-erp': 'erp-gantt-grid',
      'industry-professional-services': 'professional-services-gantt-grid',
      'industry-construction': 'construction-gantt-grid',
      'industry-manufacturing': 'manufacturing-gantt-grid',
      'industry-resource-planning': 'resource-planning-gantt-grid',
      'industry-internal-tools': 'internal-tools-gantt-grid',
      'simple-construction': 'simple-construction-gantt',
    } as const;

    for (const id of GANTT_USE_CASE_IDS) {
      const useCase = resolveGanttUseCase(`?use-case=${id}`);
      expect(useCase).toBe(GANTT_USE_CASES[id]);
      expect(useCase?.angularSelector).toBe(angularSelectors[id]);
      expect(typeof useCase?.loadTs).toBe('function');
      expect(typeof useCase?.loadReact).toBe('function');
      expect(typeof useCase?.loadVue).toBe('function');
      expect(typeof useCase?.loadAngular).toBe('function');
    }
  });

  it('uses a distinct lazy loader for every industry and framework', () => {
    const industries = GANTT_USE_CASE_IDS.filter((id) => id.startsWith('industry-'));
    for (const loader of ['loadTs', 'loadReact', 'loadVue', 'loadAngular'] as const) {
      expect(new Set(industries.map((id) => GANTT_USE_CASES[id][loader])).size).toBe(industries.length);
    }
  });

  it('does not resolve example routes from the use-case registry', () => {
    expect(resolveGanttUseCase('?example=industry-erp')).toBeUndefined();
    expect(resolveGanttUseCase('?use-case=unknown')).toBeUndefined();
    expect(resolveGanttUseCase('?example=big-data')).toBeUndefined();
  });
});
