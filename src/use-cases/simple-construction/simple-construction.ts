import { currentTheme } from '../../theme';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { createConstructionRows, rootName } from './shared/data';
import { applyProjectKeepOnlyFilter } from './shared/filters';
import { createSimpleGridBindings } from './shared/grid';
import { lookAheadExpandedRows } from './shared/lookahead';
import { applyTaskPatch } from './shared/tasks';
import { DEFAULT_PERIOD, type SimpleConstructionState } from './shared/types';
import './simple-construction.scss';

defineCustomElements();

function button(label: string, onClick: () => void, kind = 'tab') {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.className = `construction-fabrication__button construction-fabrication__button--${kind}`;
  element.addEventListener('click', onClick);
  return element;
}

export function load(parentSelector: string): (() => void) | undefined {
  const host = document.querySelector<HTMLElement>(parentSelector);
  if (!host) return undefined;

  const rows = createConstructionRows();
  const state: SimpleConstructionState = { view: 'company', rootId: null, ...DEFAULT_PERIOD };
  let expandedRowIds = new Set<string>();

  const shell = document.createElement('section');
  shell.className = `construction-fabrication${currentTheme().isDark() ? ' construction-fabrication--dark' : ''}`;
  shell.setAttribute('aria-label', 'Simple Construction Gantt');
  const main = document.createElement('main');
  main.className = 'construction-fabrication__main';
  const deck = document.createElement('div');
  deck.className = 'construction-fabrication__command-deck';
  const tabs = document.createElement('div');
  tabs.className = 'construction-simple__lookahead-action';
  const lookAhead = button('Look-Ahead', showLookAhead, 'lookahead');
  const filterTags = document.createElement('div');
  filterTags.className = 'construction-simple__filter-tags';
  filterTags.setAttribute('aria-label', 'Active filters');
  const dates = document.createElement('div');
  dates.className = 'construction-fabrication__command-actions';
  const start = document.createElement('input');
  const finish = document.createElement('input');
  for (const input of [start, finish]) {
    input.type = 'date';
    input.className = 'construction-fabrication__select';
  }
  start.value = state.startDate;
  finish.value = state.endDate;
  start.addEventListener('change', () => { state.startDate = start.value; update(); });
  finish.addEventListener('change', () => { state.endDate = finish.value; update(); });
  dates.append('Start ', start, ' Finish ', finish);
  tabs.append(lookAhead);
  deck.append(filterTags, tabs, dates);
  const grid = document.createElement('revo-grid') as HTMLRevoGridElement;
  grid.className = 'construction-fabrication__grid skip-style cell-border';
  main.append(deck, grid);
  shell.append(main);
  host.replaceChildren(shell);

  function selectRoot(id: string) {
    state.rootId = id;
    state.view = 'project';
    expandedRowIds = new Set([id]);
    void applyProjectKeepOnlyFilter(grid, rows, id);
    update();
  }

  function clearProjectFilter() {
    state.view = 'company';
    state.rootId = null;
    expandedRowIds = new Set();
    void applyProjectKeepOnlyFilter(grid, rows, null);
    update();
  }

  function clearDateRangeFilter() {
    state.view = 'project';
    expandedRowIds = new Set(state.rootId ? [state.rootId] : []);
    update();
  }

  function showLookAhead() {
    if (!state.rootId) return;
    state.view = 'lookahead';
    expandedRowIds = lookAheadExpandedRows(rows, state);
    update();
  }

  function update() {
    const bindings = createSimpleGridBindings(rows, state, expandedRowIds, selectRoot);

    // Keep the mounted source stable: task edits update the Gantt incrementally.
    // Only this view's projection settings change when the user navigates or filters.
    grid.columns = bindings.columns;
    grid.tree = bindings.tree;
    grid.gantt = bindings.gantt;
    grid.trimmedRows = bindings.trimmedRows;
    filterTags.replaceChildren();
    filterTags.hidden = !state.rootId;
    if (state.rootId) {
      const projectTag = document.createElement('button');
      projectTag.className = 'construction-simple__filter-tag';
      projectTag.type = 'button';
      projectTag.title = 'Clear project filter';
      projectTag.textContent = `Project: ${rootName(rows, state.rootId)} ×`;
      projectTag.addEventListener('click', clearProjectFilter);
      filterTags.append(projectTag);
      if (state.view === 'lookahead') {
        const periodTag = document.createElement('button');
        periodTag.className = 'construction-simple__filter-tag';
        periodTag.type = 'button';
        periodTag.title = 'Clear date range filter';
        periodTag.textContent = `Date range: ${state.startDate} – ${state.endDate} ×`;
        periodTag.addEventListener('click', clearDateRangeFilter);
        filterTags.append(periodTag);
      }
    }
    dates.hidden = state.view !== 'lookahead';
    tabs.hidden = !state.rootId;
    lookAhead.setAttribute('aria-pressed', String(state.view === 'lookahead'));
  }

  grid.addEventListener('tree-state-changed', (event: Event) => {
    expandedRowIds = new Set((event as CustomEvent<{ expandedRowIds: Set<string> }>).detail.expandedRowIds);
    update();
  });
  grid.addEventListener('gantt-before-task-change', (event: Event) => applyTaskPatch(rows, (event as CustomEvent).detail));
  const bindings = createSimpleGridBindings(rows, state, expandedRowIds, selectRoot);
  Object.assign(grid, bindings);
  // Source is assigned last so the custom element receives its Gantt configuration first.
  grid.source = rows;
  update();
  return () => shell.remove();
}
