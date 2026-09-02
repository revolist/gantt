import { describe, expect, it } from 'vitest';
import {
  constructionTrimmedRows,
  constructionViewTrimmedRows,
  visibleConstructionIds,
} from '../../../../src/use-cases/simple-construction/shared/lookahead';
import { createConstructionRows } from '../../../../src/use-cases/simple-construction/shared/data';
import { projectKeepOnlyFilter } from '../../../../src/use-cases/simple-construction/shared/filters';
import { DEFAULT_PERIOD } from '../../../../src/use-cases/simple-construction/shared/types';

describe('simple construction Gantt filters', () => {
  const rows = createConstructionRows();

  it('supplies working-day durations for the Gantt Duration filter', () => {
    expect(rows.find((row) => row.id === 'project:2801')?.duration).toBeGreaterThan(0);
    expect(rows.find((row) => row.name === 'Contract Award')?.duration).toBeGreaterThan(0);
  });

  it('starts with three root projects and every task in one source', () => {
    expect(rows.filter((row) => row.parentId == null)).toHaveLength(3);
    expect(rows.some((row) => row.source === 'lookahead')).toBe(true);
    const trimmedRows = constructionViewTrimmedRows(
      rows,
      { view: 'company', rootId: null, ...DEFAULT_PERIOD },
    );
    expect(trimmedRows).toBeUndefined();
  });

  it('keeps only one complete project hierarchy after project selection', () => {
    const state = { view: 'project' as const, rootId: 'project:2801', ...DEFAULT_PERIOD };
    const visible = visibleConstructionIds(rows, state);
    expect(visible.has('project:2801')).toBe(true);
    expect(visible.has('project:2814')).toBe(false);
    expect(rows.filter((row) => visible.has(row.id)).every((row) => row.projectRef === '2801')).toBe(true);
  });

  it('keeps the selected project scope on the shared project reference', () => {
    expect(projectKeepOnlyFilter(rows, 'project:2801').multiFilterItems).toEqual({
      projectRef: [{ id: 1, type: 'eq', value: '2801', relation: 'and' }],
    });
    expect(projectKeepOnlyFilter(rows, null).multiFilterItems).toEqual({});
  });

  it('applies an inclusive Look-Ahead date range and retains ancestors', () => {
    const state = { view: 'lookahead' as const, rootId: 'project:2801', ...DEFAULT_PERIOD };
    const visible = visibleConstructionIds(rows, state);
    expect(visible.has('task:2801:lookahead:3')).toBe(true);
    expect(visible.has('task:2801:22')).toBe(true);
    expect(visible.has('project:2801')).toBe(true);
    expect(constructionTrimmedRows(rows, state)).toHaveProperty(String(rows.findIndex((row) => row.id === 'project:2814')), true);
  });

  it('treats a task moved to the root as a project-level hierarchy', () => {
    const reorderedRows = createConstructionRows();
    const fabrication = reorderedRows.find((row) => row.projectRef === '2801' && row.name === 'Fabrication')!;
    fabrication.parentId = null;
    const visible = visibleConstructionIds(reorderedRows, {
      view: 'project',
      rootId: fabrication.id,
      ...DEFAULT_PERIOD,
    });

    expect(reorderedRows.filter((row) => row.parentId == null)).toHaveLength(4);
    expect(visible.has(fabrication.id)).toBe(true);
    expect([...visible].some((id) => id !== fabrication.id)).toBe(true);
  });
});
