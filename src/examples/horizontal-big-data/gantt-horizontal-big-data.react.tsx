import './gantt-horizontal-big-data.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  createGanttHorizontalBigDataSet,
  ganttHorizontalBigDataCalendars,
  ganttHorizontalBigDataConfig,
} from './gantt-horizontal-big-data-data';

export default function GanttHorizontalBigData(_props: { rows?: any[] }) {
  const [isDark, setIsDark] = useState(() => currentTheme().isDark());
  const data = useMemo(() => createGanttHorizontalBigDataSet(), []);
  const plugins = useMemo(() => [GanttPlugin], []);
  const source = useMemo(() => data.tasks, [data.tasks]);
  const columns = useMemo(() => [createDefaultTaskTableColumn('name')], []);
  const gantt = useMemo(() => ganttHorizontalBigDataConfig, []);
  const dependencies = useMemo(() => data.dependencies, [data.dependencies]);
  const calendars = useMemo(() => ganttHorizontalBigDataCalendars, []);

  useEffect(() => observeCurrentTheme(setIsDark), []);

  return (
    <section className="gantt-horizontal-big-data-demo">
      <RevoGrid
        className="gantt-horizontal-big-data-grid"
        hideAttribution
        theme={isDark ? 'darkCompact' : 'compact'}
        plugins={plugins}
        source={source}
        columns={columns}
        gantt={gantt}
        ganttDependencies={dependencies}
        ganttCalendars={calendars}
      />
    </section>
  );
}
