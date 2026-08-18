import { describe, expect, it } from 'vitest';
import { applyConstructionTaskPatch, buildConstructionModel, CONSTRUCTION_MODEL, DEFAULT_LOOK_AHEAD, moveLookAheadPeriod, projectSource, trimmedLookAheadRows, parseCsv } from './construction-fabrication.data';

describe('Pebblestone construction CSV adapter', () => {
  it('parses malformed notes by joining surplus fields', () => {
    expect(parseCsv('id,notes\n1,calendar day, not working day')).toEqual([{ id: '1', notes: 'calendar day, not working day' }]);
  });
  it('keeps source counts, unique namespaced ids and separate projects', () => {
    expect(CONSTRUCTION_MODEL.projects).toHaveLength(3); expect(CONSTRUCTION_MODEL.tasks.filter((task) => task.entityKind === 'task')).toHaveLength(38);
    const ids = CONSTRUCTION_MODEL.tasks.map(({ id }) => id); expect(new Set(ids).size).toBe(ids.length); expect(CONSTRUCTION_MODEL.projects.map(({ name }) => name)).toContain('Riverbank Apartments');
  });
  it('links hierarchy, dependencies, resources and diagnostics', () => {
    const riverbank = projectSource(CONSTRUCTION_MODEL, '2801'); const glass = riverbank.find((task) => task.name === 'Install glass panels L1 East')!;
    expect(glass.parentId).toBe('task:2801:22'); expect(CONSTRUCTION_MODEL.dependencies).toHaveLength(26); expect(CONSTRUCTION_MODEL.dependencies.every((dependency) => riverbank.some((task) => task.id === dependency.predecessorTaskId) || dependency.predecessorTaskId.startsWith('task:2814:'))).toBe(true);
    expect(CONSTRUCTION_MODEL.assignments.some((assignment) => assignment.taskId === glass.id && assignment.resourceId.includes('install-crew-a'))).toBe(true); expect(CONSTRUCTION_MODEL.diagnostics.orphanLookAheadRows).toEqual(['9', '10']); expect(CONSTRUCTION_MODEL.diagnostics.residualTaskIds).toContain('task:2801:22:residual');
  });
  it('retains ancestors for inclusive Look-Ahead overlap filters', () => {
    const source = projectSource(CONSTRUCTION_MODEL, '2801'); const trimmed = trimmedLookAheadRows(source, DEFAULT_LOOK_AHEAD, { department: 'installation', workArea: 'Level 1 East' });
    const visible = source.filter((_, index) => !trimmed[index]).map(({ id }) => id); expect(visible).toContain('task:2801:lookahead:3'); expect(visible).toContain('task:2801:22'); expect(visible).toContain('task:2801:20'); expect(visible).toContain('project:2801'); expect(visible).not.toContain('task:2801:lookahead:8');
  });
  it('moves windows in exact two-week increments and preserves cross-view task patches', () => {
    expect(moveLookAheadPeriod(DEFAULT_LOOK_AHEAD, 1)).toEqual({ start: '2026-08-31', end: '2026-09-13' }); const changed = applyConstructionTaskPatch(CONSTRUCTION_MODEL.tasks, { taskId: 'task:2801:lookahead:3', sourcePatch: { endDate: '2026-09-02', percentDone: 58 } });
    expect(projectSource(CONSTRUCTION_MODEL, '2801', changed).find((task) => task.id === 'task:2801:lookahead:3')).toMatchObject({ endDate: '2026-09-02', percentDone: 58 }); expect(projectSource(CONSTRUCTION_MODEL, '2814', changed).find((task) => task.name === 'Issue purchase order - louvre system')?.endDate).toBe('2026-08-21');
  });
  it('does not create metadata for an unmatched source project', () => { const model = buildConstructionModel(); expect(model.projects.some((project) => project.projectRef === '2776')).toBe(false); });
});
