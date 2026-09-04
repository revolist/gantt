import { describe, expect, it } from 'vitest';
import { industryGridClass, industryGridTheme } from '../../../../src/use-cases/shared/industry-use-case.shared';
import { resolveIndustryWorkflowStatus, type IndustryGanttDefinition, type IndustryGridPresentation } from '../../../../src/use-cases/shared/industry-use-case.types';

const definitionWithGrid = (grid: IndustryGridPresentation) => ({
  id: 'industry-test',
  grid,
}) as IndustryGanttDefinition;

describe('industry Gantt grid presentation', () => {
  it('resolves adaptive grid families against the host color scheme', () => {
    const compact = definitionWithGrid({ theme: 'adaptiveCompact', rowSize: 30, rowHeaders: true, cellBorders: true });
    const material = definitionWithGrid({ theme: 'adaptiveMaterial', rowSize: 40, rowHeaders: false, cellBorders: false });

    expect(industryGridTheme(compact, false)).toBe('compact');
    expect(industryGridTheme(compact, true)).toBe('darkCompact');
    expect(industryGridTheme(material, false)).toBe('material');
    expect(industryGridTheme(material, true)).toBe('darkMaterial');
  });

  it('preserves an explicit grid theme and independently controls cell borders', () => {
    const definition = definitionWithGrid({ theme: 'darkCompact', rowSize: 32, rowHeaders: true, cellBorders: false });

    expect(industryGridTheme(definition, false)).toBe('darkCompact');
    expect(industryGridClass(definition)).toBe('industry-gantt-grid skip-style');
  });

  it('keeps the original compact bordered grid as the compatibility default', () => {
    const definition = { id: 'industry-legacy' } as IndustryGanttDefinition;

    expect(industryGridTheme(definition, false)).toBe('compact');
    expect(industryGridTheme(definition, true)).toBe('darkCompact');
    expect(industryGridClass(definition)).toBe('industry-gantt-grid skip-style cell-border');
  });

  it('prefers the projected workflow-status key used by rendered Gantt bars', () => {
    expect(resolveIndustryWorkflowStatus({ workflowStatus: 'not-started', workflowStatusKey: 'blocked' })).toBe('blocked');
    expect(resolveIndustryWorkflowStatus({ workflowStatus: 'done' })).toBe('done');
  });
});
