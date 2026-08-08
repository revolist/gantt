import './industry-use-case.scss';
import { defineCustomElements } from '@revolist/revogrid/loader';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { resolveIndustryGantt } from './industry-use-case.catalog';
import { createIndustryGanttConfig } from './industry-use-case.types';
import { createIndustryHeader, createIndustryToggle, industryGridClass, industryGridTheme, industryPlugins, industryShellClass } from './industry-use-case.shared';

defineCustomElements();
export function load(parentSelector: string): (() => void) | undefined {
  const parent = document.querySelector(parentSelector); if (!parent) return;
  const definition = resolveIndustryGantt(window.location.search); let showBaseline = false; let showCriticalPath = true;
  const shell = document.createElement('section'); shell.className = industryShellClass(currentTheme().isDark(), definition.id); shell.setAttribute('aria-label', `${definition.productLabel} ${definition.title}`); shell.appendChild(createIndustryHeader(definition));
  const toolbar = document.createElement('div'); toolbar.className = 'industry-gantt-toolbar'; const label = document.createElement('span'); label.className = 'industry-gantt-toolbar__label'; label.textContent = definition.scheduleLabel; const legend = document.createElement('span'); legend.className = 'industry-gantt-toolbar__legend'; legend.textContent = definition.riskLegendLabel;
  const grid = document.createElement('revo-grid') as HTMLRevoGridElement; const applyConfig = () => { grid.gantt = createIndustryGanttConfig(definition, showBaseline, showCriticalPath); };
  const baseline = createIndustryToggle('Baseline', showBaseline, (button) => { showBaseline = !showBaseline; button.setAttribute('aria-pressed', String(showBaseline)); applyConfig(); }); const critical = createIndustryToggle('Critical path', showCriticalPath, (button) => { showCriticalPath = !showCriticalPath; button.setAttribute('aria-pressed', String(showCriticalPath)); applyConfig(); }); toolbar.append(label, legend, baseline, critical); shell.appendChild(toolbar);
  grid.className = industryGridClass(definition); grid.theme = industryGridTheme(definition, currentTheme().isDark()); grid.hideAttribution = true; grid.readonly = false; grid.range = true; grid.resize = true; grid.rowSize = definition.grid?.rowSize ?? 34; grid.rowHeaders = definition.grid?.rowHeaders ?? false; grid.autoSizeColumn = false; grid.plugins = industryPlugins(definition); grid.columns = [...definition.columns]; grid.ganttDependencies = [...definition.dependencies]; grid.ganttCalendars = [...definition.calendars]; grid.ganttResources = [...definition.resources]; grid.ganttAssignments = [...definition.assignments]; grid.ganttBaselines = [...definition.baselines]; applyConfig();
  shell.appendChild(grid); parent.appendChild(shell); grid.source = [...definition.tasks];
  const disconnectTheme = observeCurrentTheme((dark) => { grid.theme = industryGridTheme(definition, dark); shell.className = industryShellClass(dark, definition.id); }); return () => { disconnectTheme(); shell.remove(); };
}
