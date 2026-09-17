// src/examples/showcase/gantt.react.tsx
import './gantt.scss';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { GanttPlugin } from '@revolist/gantt';
import { ExportExcelPlugin, RowStatusPlugin } from '@revolist/revogrid-pro';
import {
  STANDARD_CALENDAR,
  SHOWCASE_ASSIGNMENTS,
  SHOWCASE_BASELINES,
  SHOWCASE_COLUMNS_WITH_COMPLETION,
  SHOWCASE_DEFAULT_HIDDEN,
  SHOWCASE_DEPENDENCIES,
  SHOWCASE_GANTT_CONFIG,
  SHOWCASE_RESOURCES,
  SHOWCASE_TASKS,
  SHOWCASE_TIMELINE_SCALE_OPTIONS,
  applyShowcaseTimelineScale,
  renderShowcaseTaskBarColor,
  renderShowcaseTaskBarContent,
  type ShowcaseTimelineScale,
} from './data/gantt-project-data';
import type { GanttPluginConfig } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';

const plugins = [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
const source      = [...SHOWCASE_TASKS];
const dependencies = [...SHOWCASE_DEPENDENCIES];
const calendars    = [{ ...STANDARD_CALENDAR }];
const resources    = [...SHOWCASE_RESOURCES];
const assignments  = [...SHOWCASE_ASSIGNMENTS];
const baselines    = [...SHOWCASE_BASELINES];
const columns      = [...SHOWCASE_COLUMNS_WITH_COMPLETION];
const hiddenColumns = [...SHOWCASE_DEFAULT_HIDDEN];

function GanttShowcase() {
  const [darkTheme, setDarkTheme] = useState(() => currentTheme().isDark());
  const gridRef = useRef<HTMLRevoGridElement>(null);
  const [showCriticalPath, setShowCriticalPath] = useState(Boolean(SHOWCASE_GANTT_CONFIG.visuals.showCriticalPath));
  const [showBaseline, setShowBaseline] = useState(false);
  const [timelineScale, setTimelineScale] = useState<ShowcaseTimelineScale>('week');
  const ganttConfig: GanttPluginConfig = useMemo(() => ({
    ...SHOWCASE_GANTT_CONFIG,
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      showCriticalPath,
      showBaseline,
      taskBarColorHook: renderShowcaseTaskBarColor,
      taskBarContentHook: renderShowcaseTaskBarContent,
    },
  } as GanttPluginConfig), [showCriticalPath, showBaseline]);

  useEffect(() => observeCurrentTheme(setDarkTheme), []);
  const selectTimelineScale = async (scale: ShowcaseTimelineScale) => {
    if (gridRef.current && await applyShowcaseTimelineScale(gridRef.current, scale)) {
      setTimelineScale(scale);
    }
  };

  return (
    <div className={`gantt-showcase-shell grow h-full ${darkTheme ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`}>
      <div className="gantt-showcase-toolbar">
        <div className="gantt-showcase-controls gantt-showcase-visual-controls">
          <label className="gantt-showcase-control">
            <input
              className="gantt-showcase-control__input"
              type="checkbox"
              checked={showCriticalPath}
              onChange={(event) => setShowCriticalPath(event.currentTarget.checked)}
            />
            <span className="gantt-showcase-control__label">Critical path</span>
          </label>
          <label className="gantt-showcase-control">
            <input
              className="gantt-showcase-control__input"
              type="checkbox"
              checked={showBaseline}
              onChange={(event) => setShowBaseline(event.currentTarget.checked)}
            />
            <span className="gantt-showcase-control__label">Baselines</span>
          </label>
        </div>
        <div className="gantt-showcase-zoom rv-segmented-switch" role="group" aria-label="Timeline scale">
          {SHOWCASE_TIMELINE_SCALE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`rv-segmented-switch-item ${timelineScale === option.value ? 'on' : ''}`}
              type="button"
              aria-pressed={timelineScale === option.value}
              onClick={() => void selectTimelineScale(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <RevoGrid
        ref={gridRef}
        className="gantt-showcase-grid"
        theme={darkTheme ? 'darkCompact' : 'compact'}
        hideAttribution
        readonly={false}
        range
        resize
        rowSize={42}
        rowHeaders={false}
        autoSizeColumn={false}
        plugins={plugins}
        hideColumns={hiddenColumns}
        source={source}
        columns={columns}
        gantt={ganttConfig}
        ganttDependencies={dependencies}
        ganttCalendars={calendars}
        ganttResources={resources}
        ganttAssignments={assignments}
        ganttBaselines={baselines}
      />
    </div>
  );
}

export default GanttShowcase;
