import './industry-use-case.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { RevoGrid } from '@revolist/react-datagrid';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { resolveIndustryGantt } from './industry-use-case.catalog';
import { createIndustryGanttConfig } from './industry-use-case.types';
import { industryGridClass, industryGridTheme, industryPlugins, industryShellClass } from './industry-use-case.shared';

// Enterprise plugin properties augment the custom element at runtime; the
// core React wrapper's generated prop surface does not include them yet.
const EnterpriseRevoGrid = RevoGrid as React.ComponentType<any>;

export default function IndustryGanttDemo() {
  const definition = useMemo(() => resolveIndustryGantt(window.location.search), []); const [dark, setDark] = useState(() => currentTheme().isDark()); const [baseline, setBaseline] = useState(false); const [critical, setCritical] = useState(true);
  const plugins = useMemo(() => industryPlugins(definition), [definition]); const columns = useMemo(() => [...definition.columns], [definition]); const source = useMemo(() => [...definition.tasks], [definition]); const dependencies = useMemo(() => [...definition.dependencies], [definition]); const calendars = useMemo(() => [...definition.calendars], [definition]); const resources = useMemo(() => [...definition.resources], [definition]); const assignments = useMemo(() => [...definition.assignments], [definition]); const baselines = useMemo(() => [...definition.baselines], [definition]); const additionalData = useMemo(() => ({ industryUseCase: definition.id }), [definition]); const gantt = useMemo(() => createIndustryGanttConfig(definition, baseline, critical), [definition, baseline, critical]);
  useEffect(() => observeCurrentTheme(setDark), []);
  return <section className={industryShellClass(dark, definition.id)} aria-label={`${definition.productLabel} ${definition.title}`}>
    <header className="industry-gantt-header"><div className="industry-gantt-identity"><span className="industry-gantt-mark">{definition.mark}</span><div><div className="industry-gantt-product">{definition.productLabel}</div><h1 className="industry-gantt-title">{definition.title}</h1><p className="industry-gantt-subtitle">{definition.subtitle}</p></div></div><div className="industry-gantt-metrics">{definition.metrics.map((metric) => <div key={metric.label} className={`industry-gantt-metric industry-gantt-metric--${metric.tone ?? 'default'}`}><strong className="industry-gantt-metric__value">{metric.value}</strong><span className="industry-gantt-metric__label">{metric.label}</span></div>)}</div><div className="industry-gantt-sync"><span className="industry-gantt-sync__dot" />{definition.updatedLabel}</div></header>
    <div className="industry-gantt-toolbar"><span className="industry-gantt-toolbar__label">{definition.scheduleLabel}</span><span className="industry-gantt-toolbar__legend">{definition.riskLegendLabel}</span><button type="button" className="industry-gantt-toggle" aria-pressed={baseline} onClick={() => setBaseline((value) => !value)}>Baseline</button><button type="button" className="industry-gantt-toggle" aria-pressed={critical} onClick={() => setCritical((value) => !value)}>Critical path</button></div>
    <EnterpriseRevoGrid className={industryGridClass(definition)} theme={industryGridTheme(definition, dark)} hideAttribution readonly={false} range resize rowSize={definition.grid?.rowSize ?? 34} rowHeaders={definition.grid?.rowHeaders ?? false} autoSizeColumn={false} plugins={plugins} columns={columns} source={source} additionalData={additionalData} gantt={gantt} ganttDependencies={dependencies} ganttCalendars={calendars} ganttResources={resources} ganttAssignments={assignments} ganttBaselines={baselines} />
  </section>;
}
