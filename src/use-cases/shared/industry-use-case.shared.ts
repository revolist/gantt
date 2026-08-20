import type { PluginProviders } from '@revolist/revogrid';
import { GanttPanelResizePlugin, GanttPlugin } from '@revolist/gantt';
import { ExportExcelPlugin, RowStatusPlugin } from '@revolist/revogrid-pro';
import type { IndustryGanttDefinition, IndustryGridTheme } from './industry-use-case.types';

export function industryPlugins(definition: IndustryGanttDefinition) {
  const initialWidth = definition.grid?.timelinePanelWidth;
  if (initialWidth === undefined) return [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
  class IndustryPanelResizePlugin extends GanttPanelResizePlugin {
    constructor(revogrid: HTMLRevoGridElement, providers: PluginProviders) {
      super(revogrid, providers, { initialWidth });
    }
  }
  return [IndustryPanelResizePlugin, GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
}

export const industryShellClass = (dark: boolean, definitionId: string) => `industry-gantt-shell industry-gantt-shell--${definitionId.replace(/^industry-/, '')} ${dark ? 'industry-gantt-shell--dark' : 'industry-gantt-shell--light'}`;
export const industryGridClass = (definition: IndustryGanttDefinition) => `industry-gantt-grid skip-style${definition.grid?.cellBorders === false ? '' : ' cell-border'}`;

export function industryGridTheme(definition: IndustryGanttDefinition, dark: boolean): string {
  const theme: IndustryGridTheme = definition.grid?.theme ?? 'adaptiveCompact';
  if (theme === 'adaptiveMaterial') return dark ? 'darkMaterial' : 'material';
  if (theme === 'adaptiveCompact') return dark ? 'darkCompact' : 'compact';
  return theme;
}
const appendText = (parent: HTMLElement, tag: string, className: string, text: string) => { const element = document.createElement(tag); element.className = className; element.textContent = text; parent.appendChild(element); return element; };

export function createIndustryHeader(definition: IndustryGanttDefinition): HTMLElement {
  const header = document.createElement('header'); header.className = 'industry-gantt-header';
  const identity = document.createElement('div'); identity.className = 'industry-gantt-identity'; appendText(identity, 'span', 'industry-gantt-mark', definition.mark);
  const copy = document.createElement('div'); appendText(copy, 'div', 'industry-gantt-product', definition.productLabel); appendText(copy, 'h1', 'industry-gantt-title', definition.title); appendText(copy, 'p', 'industry-gantt-subtitle', definition.subtitle); identity.appendChild(copy);
  const metrics = document.createElement('div'); metrics.className = 'industry-gantt-metrics';
  definition.metrics.forEach((metric) => { const card = document.createElement('div'); card.className = `industry-gantt-metric industry-gantt-metric--${metric.tone ?? 'default'}`; appendText(card, 'strong', 'industry-gantt-metric__value', metric.value); appendText(card, 'span', 'industry-gantt-metric__label', metric.label); metrics.appendChild(card); });
  const sync = document.createElement('div'); sync.className = 'industry-gantt-sync'; appendText(sync, 'span', 'industry-gantt-sync__dot', ''); appendText(sync, 'span', '', definition.updatedLabel);
  header.append(identity, metrics, sync); return header;
}

export function createIndustryToggle(label: string, pressed: boolean, action: (button: HTMLButtonElement) => void): HTMLButtonElement {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'industry-gantt-toggle'; button.textContent = label; button.setAttribute('aria-pressed', String(pressed)); button.addEventListener('click', () => action(button)); return button;
}
