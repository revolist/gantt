import React, { useMemo, useRef, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { createConstructionRows, rootName } from './shared/data';
import { applyProjectKeepOnlyFilter } from './shared/filters';
import { createSimpleGridBindings } from './shared/grid';
import { lookAheadExpandedRows } from './shared/lookahead';
import { applyTaskPatch } from './shared/tasks';
import { DEFAULT_PERIOD, type SimpleConstructionView } from './shared/types';
import './simple-construction.scss';

export default function SimpleConstructionGantt() {
  const rows = useMemo(createConstructionRows, []);
  const [view, setView] = useState<SimpleConstructionView>('company');
  const [rootId, setRootId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(DEFAULT_PERIOD.startDate);
  const [endDate, setEndDate] = useState(DEFAULT_PERIOD.endDate);
  const [expandedRowIds, setExpandedRowIds] = useState(new Set<string>());
  const gridRef = useRef<HTMLRevoGridElement>(null);
  const state = useMemo(() => ({ view, rootId, startDate, endDate }), [view, rootId, startDate, endDate]);

  const selectRoot = (id: string) => {
    setRootId(id);
    setView('project');
    setExpandedRowIds(new Set([id]));
    void applyProjectKeepOnlyFilter(gridRef.current, rows, id);
  };

  const clearProjectFilter = () => {
    setView('company');
    setRootId(null);
    setExpandedRowIds(new Set());
    void applyProjectKeepOnlyFilter(gridRef.current, rows, null);
  };

  const clearDateRangeFilter = () => {
    setView('project');
    setExpandedRowIds(new Set(rootId ? [rootId] : []));
  };

  const showLookAhead = () => {
    if (!rootId) return;
    const nextState = { ...state, view: 'lookahead' as const };
    setView('lookahead');
    setExpandedRowIds(lookAheadExpandedRows(rows, nextState));
  };

  const bindings = useMemo(
    () => createSimpleGridBindings(rows, state, expandedRowIds, selectRoot),
    [rows, state, expandedRowIds],
  );
  const gridEvents = {
    'onTree-state-changed': (event: CustomEvent<{ expandedRowIds: Set<string> }>) => setExpandedRowIds(new Set(event.detail.expandedRowIds)),
    'onGantt-before-task-change': (event: CustomEvent) => applyTaskPatch(rows, event.detail),
  } as any;
  const { source: _source, ...gridProperties } = bindings;

  return <section className="construction-fabrication" aria-label="Simple Construction Gantt">
    <main className="construction-fabrication__main">
      <div className="construction-fabrication__command-deck">
        {rootId && <div className="construction-simple__filter-tags" aria-label="Active filters">
          <button className="construction-simple__filter-tag" type="button" title="Clear project filter" onClick={clearProjectFilter}>
            Project: {rootName(rows, rootId)} ×
          </button>
          {view === 'lookahead' && <button className="construction-simple__filter-tag" type="button" title="Clear date range filter" onClick={clearDateRangeFilter}>
            Date range: {startDate} – {endDate} ×
          </button>}
        </div>}
        {rootId && <div className="construction-simple__lookahead-action">
          <button className="construction-fabrication__button construction-simple__lookahead-button" type="button" aria-pressed={view === 'lookahead'} onClick={showLookAhead}>Look-Ahead</button>
        </div>}
        {view === 'lookahead' && <div className="construction-fabrication__command-actions">
          <label className="construction-fabrication__control-group">Start <input className="construction-fabrication__select" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
          <label className="construction-fabrication__control-group">Finish <input className="construction-fabrication__select" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        </div>}
      </div>
      <RevoGrid
        ref={gridRef}
        className="construction-fabrication__grid skip-style cell-border"
        {...gridProperties}
        source={rows}
        {...gridEvents}
      />
    </main>
  </section>;
}
