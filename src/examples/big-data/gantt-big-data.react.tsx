import './gantt-big-data.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  createGanttBigDataSet,
  ganttBigDataCalendars,
  ganttBigDataConfig,
} from './gantt-big-data-data';

export default function GanttBigData(_props: { rows?: any[] }) {
  const [isDark, setIsDark] = useState(() => currentTheme().isDark());
  const data = useMemo(() => createGanttBigDataSet(), []);
  const plugins = useMemo(() => [GanttPlugin], []);
  const source = useMemo(() => data.tasks, [data.tasks]);
  const columns = useMemo(() => [createDefaultTaskTableColumn('name')], []);
  const gantt = useMemo(() => ganttBigDataConfig, []);
  const dependencies = useMemo(() => data.dependencies, [data.dependencies]);
  const calendars = useMemo(() => ganttBigDataCalendars, []);

  useEffect(() => observeCurrentTheme(setIsDark), []);

  return (
    <section className="gantt-big-data-demo">
      <RevoGrid
        className="gantt-big-data-grid"
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
