import { Component, NO_ERRORS_SCHEMA, ViewEncapsulation } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { RevoGrid } from '@revolist/angular-datagrid';
import type { GanttPluginConfig } from '@revolist/gantt';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { CONSTRUCTION_INDUSTRY_DEFINITION as definition } from './construction.data';
import { createIndustryGanttConfig } from '../shared/industry-use-case.types';
import {
  industryGridClass,
  industryGridTheme,
  industryPlugins,
  industryShellClass,
} from '../shared/industry-use-case.shared';

@Component({
  selector: 'construction-gantt-grid',
  standalone: true,
  imports: [RevoGrid],
  schemas: [NO_ERRORS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../shared/industry-use-case.scss', './construction.presentation.scss'],
  host: { class: 'industry-gantt-angular-host' },
  template: `
    <section [class]="shellClass" [attr.aria-label]="definition.productLabel + ' ' + definition.title">
      <header class="industry-gantt-header">
        <div class="industry-gantt-identity">
          <span class="industry-gantt-mark">{{ definition.mark }}</span>
          <div>
            <div class="industry-gantt-product">{{ definition.productLabel }}</div>
            <h1 class="industry-gantt-title">{{ definition.title }}</h1>
            <p class="industry-gantt-subtitle">{{ definition.subtitle }}</p>
          </div>
        </div>
        <div class="industry-gantt-metrics">
          @for (metric of definition.metrics; track metric.label) {
            <div [class]="'industry-gantt-metric industry-gantt-metric--' + (metric.tone ?? 'default')">
              <strong class="industry-gantt-metric__value">{{ metric.value }}</strong>
              <span class="industry-gantt-metric__label">{{ metric.label }}</span>
            </div>
          }
        </div>
        <div class="industry-gantt-sync"><span class="industry-gantt-sync__dot"></span>{{ definition.updatedLabel }}</div>
      </header>
      <div class="industry-gantt-toolbar">
        <span class="industry-gantt-toolbar__label">{{ definition.scheduleLabel }}</span>
        <span class="industry-gantt-toolbar__legend">{{ definition.riskLegendLabel }}</span>
        <button type="button" class="industry-gantt-toggle" [attr.aria-pressed]="showBaseline" (click)="toggleBaseline()">Baseline</button>
        <button type="button" class="industry-gantt-toggle" [attr.aria-pressed]="showCriticalPath" (click)="toggleCriticalPath()">Critical path</button>
      </div>
      <revo-grid
        [class]="gridClass"
        [theme]="theme"
        [hideAttribution]="true"
        [readonly]="false"
        [range]="true"
        [resize]="true"
        [rowSize]="definition.grid?.rowSize ?? 34"
        [rowHeaders]="definition.grid?.rowHeaders ?? false"
        [autoSizeColumn]="false"
        [plugins]="plugins"
        [columns]="columns"
        [source]="source"
        [gantt]="gantt"
        [ganttDependencies]="dependencies"
        [ganttCalendars]="calendars"
        [ganttResources]="resources"
        [ganttAssignments]="assignments"
        [ganttBaselines]="baselines">
      </revo-grid>
    </section>
  `,
})
export class ConstructionGanttComponent implements OnDestroy {
  readonly definition = definition;
  readonly plugins = industryPlugins(definition);
  readonly columns = [...definition.columns];
  readonly source = [...definition.tasks];
  readonly dependencies = [...definition.dependencies];
  readonly calendars = [...definition.calendars];
  readonly resources = [...definition.resources];
  readonly assignments = [...definition.assignments];
  readonly baselines = [...definition.baselines];
  readonly gridClass = industryGridClass(definition);
  showBaseline = false;
  showCriticalPath = true;
  gantt: GanttPluginConfig = createIndustryGanttConfig(definition, false, true);
  private dark = currentTheme().isDark();
  theme = industryGridTheme(definition, this.dark);
  shellClass = industryShellClass(this.dark, definition.id);
  private readonly disconnectTheme = observeCurrentTheme((value) => {
    this.dark = value;
    this.theme = industryGridTheme(definition, value);
    this.shellClass = industryShellClass(value, definition.id);
  });

  toggleBaseline() {
    this.showBaseline = !this.showBaseline;
    this.refreshGantt();
  }

  toggleCriticalPath() {
    this.showCriticalPath = !this.showCriticalPath;
    this.refreshGantt();
  }

  ngOnDestroy() {
    this.disconnectTheme();
  }

  private refreshGantt() {
    this.gantt = createIndustryGanttConfig(definition, this.showBaseline, this.showCriticalPath);
  }
}
