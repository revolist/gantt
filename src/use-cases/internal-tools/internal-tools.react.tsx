import '../shared/industry-use-case.scss';
import './internal-tools.presentation.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { INTERNAL_TOOLS_INDUSTRY_DEFINITION as definition } from './internal-tools.data';
import { createIndustryGanttConfig } from '../shared/industry-use-case.types';
import {
  industryGridClass,
  industryGridTheme,
  industryPlugins,
  industryShellClass,
} from '../shared/industry-use-case.shared';

const EnterpriseRevoGrid = RevoGrid as React.ComponentType<any>;

export default function InternalToolsGanttDemo() {
  const [dark, setDark] = useState(() => currentTheme().isDark());
  const [showBaseline, setShowBaseline] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const plugins = useMemo(() => industryPlugins(definition), []);
  const columns = useMemo(() => [...definition.columns], []);
  const source = useMemo(() => [...definition.tasks], []);
  const dependencies = useMemo(() => [...definition.dependencies], []);
  const calendars = useMemo(() => [...definition.calendars], []);
  const resources = useMemo(() => [...definition.resources], []);
  const assignments = useMemo(() => [...definition.assignments], []);
  const baselines = useMemo(() => [...definition.baselines], []);
  const gantt = useMemo(
    () => createIndustryGanttConfig(definition, showBaseline, showCriticalPath),
    [showBaseline, showCriticalPath],
  );

  useEffect(() => observeCurrentTheme(setDark), []);

  return (
    <section className={industryShellClass(dark, definition.id)} aria-label={`${definition.productLabel} ${definition.title}`}>
      <header className="industry-gantt-header">
        <div className="industry-gantt-identity">
          <span className="industry-gantt-mark">{definition.mark}</span>
          <div>
            <div className="industry-gantt-product">{definition.productLabel}</div>
            <h1 className="industry-gantt-title">{definition.title}</h1>
            <p className="industry-gantt-subtitle">{definition.subtitle}</p>
          </div>
        </div>
        <div className="industry-gantt-metrics">
          {definition.metrics.map((metric) => (
            <div key={metric.label} className={`industry-gantt-metric industry-gantt-metric--${metric.tone ?? 'default'}`}>
              <strong className="industry-gantt-metric__value">{metric.value}</strong>
              <span className="industry-gantt-metric__label">{metric.label}</span>
            </div>
          ))}
        </div>
        <div className="industry-gantt-sync"><span className="industry-gantt-sync__dot" />{definition.updatedLabel}</div>
      </header>
      <div className="industry-gantt-toolbar">
        <span className="industry-gantt-toolbar__label">{definition.scheduleLabel}</span>
        <span className="industry-gantt-toolbar__legend">{definition.riskLegendLabel}</span>
        <button type="button" className="industry-gantt-toggle" aria-pressed={showBaseline} onClick={() => setShowBaseline((value) => !value)}>Baseline</button>
        <button type="button" className="industry-gantt-toggle" aria-pressed={showCriticalPath} onClick={() => setShowCriticalPath((value) => !value)}>Critical path</button>
      </div>
      <EnterpriseRevoGrid
        className={industryGridClass(definition)}
        theme={industryGridTheme(definition, dark)}
        hideAttribution
        readonly={false}
        range
        resize
        rowSize={definition.grid?.rowSize ?? 34}
        rowHeaders={definition.grid?.rowHeaders ?? false}
        autoSizeColumn={false}
        plugins={plugins}
        columns={columns}
        source={source}
        gantt={gantt}
        ganttDependencies={dependencies}
        ganttCalendars={calendars}
        ganttResources={resources}
        ganttAssignments={assignments}
        ganttBaselines={baselines}
      />
    </section>
  );
}
