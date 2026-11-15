import '@revolist/ui/styles.css';
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
  renderShowcaseTaskBarColor,
  renderShowcaseTaskBarContent,
} from './data/gantt-project-data';
import type { GanttPluginConfig } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { mountShowcaseToolbar } from './showcase-toolbar';

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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const ganttConfig: GanttPluginConfig = useMemo(() => ({
    ...SHOWCASE_GANTT_CONFIG,
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      showBaseline: false,
      taskBarColorHook: renderShowcaseTaskBarColor,
      taskBarContentHook: renderShowcaseTaskBarContent,
    },
  } as GanttPluginConfig), []);

  useEffect(() => observeCurrentTheme(setDarkTheme), []);
  useEffect(() => {
    if (toolbarRef.current && gridRef.current) {
      return mountShowcaseToolbar(toolbarRef.current, gridRef.current);
    }
  }, []);

  return (
    <div className={`gantt-showcase-shell grow h-full ${darkTheme ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`}>
      <div ref={toolbarRef} className="gantt-showcase-toolbar" />
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
