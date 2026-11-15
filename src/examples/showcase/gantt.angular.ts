import '@revolist/ui/styles.css';
// src/examples/showcase/gantt.angular.ts
import {
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { AfterViewInit, OnDestroy } from '@angular/core';
import { RevoGrid } from '@revolist/angular-datagrid';
import { GanttPlugin } from '@revolist/gantt';
import type { GanttPluginConfig } from '@revolist/gantt';
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
import { currentTheme, observeCurrentTheme } from '../../theme';
import { mountShowcaseToolbar } from './showcase-toolbar';

function createGanttConfig(): GanttPluginConfig {
  return {
    ...SHOWCASE_GANTT_CONFIG,
    visuals: {
      ...SHOWCASE_GANTT_CONFIG.visuals,
      showBaseline: false,
      taskBarColorHook: renderShowcaseTaskBarColor,
      taskBarContentHook: renderShowcaseTaskBarContent,
    },
  } as GanttPluginConfig;
}

@Component({
  selector: 'gantt-showcase-grid',
  standalone: true,
  host: {
    class: 'gantt-showcase-angular-host',
  },
  // Allows Angular demos to bind RevoGrid plugin props that are not wrapper inputs.
  schemas: [NO_ERRORS_SCHEMA],
  imports: [RevoGrid],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./gantt.scss'],
  template: `
    <div [class]="shellClass">
      <div #toolbar class="gantt-showcase-toolbar"></div>
      <revo-grid
        #grid
        class="gantt-showcase-grid skip-style cell-border"
        [theme]="theme"
        [hideAttribution]="true"
        [readonly]="false"
        [range]="true"
        [resize]="true"
        [rowSize]="42"
        [rowHeaders]="false"
        [autoSizeColumn]="false"
        [plugins]="plugins"
        [hideColumns]="hiddenColumns"
        [source]="source"
        [columns]="columns"
        [gantt]="ganttConfig"
        [ganttDependencies]="dependencies"
        [ganttCalendars]="calendars"
        [ganttResources]="resources"
        [ganttAssignments]="assignments"
        [ganttBaselines]="baselines"
      ></revo-grid>
    </div>
  `,
})
export class GanttShowcaseGridComponent implements AfterViewInit, OnDestroy {
  @ViewChild('grid', { read: ElementRef }) private gridElement?: ElementRef<HTMLRevoGridElement>;
  @ViewChild('toolbar', { read: ElementRef }) private toolbarElement?: ElementRef<HTMLElement>;
  private disposeToolbar?: () => void;
  isDark                = currentTheme().isDark();
  theme                 = this.isDark ? 'darkCompact' : 'compact';
  shellClass            = `gantt-showcase-shell grow h-full ${this.isDark ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`;
  private readonly disconnectTheme = observeCurrentTheme((isDark) => {
    this.isDark = isDark;
    this.theme = isDark ? 'darkCompact' : 'compact';
    this.shellClass = `gantt-showcase-shell grow h-full ${isDark ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light'}`;
  });
  readonly plugins      = [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
  ganttConfig = createGanttConfig();
  readonly source       = [...SHOWCASE_TASKS];
  readonly dependencies = [...SHOWCASE_DEPENDENCIES];
  readonly calendars    = [{ ...STANDARD_CALENDAR }];
  readonly resources    = [...SHOWCASE_RESOURCES];
  readonly assignments  = [...SHOWCASE_ASSIGNMENTS];
  readonly baselines    = [...SHOWCASE_BASELINES];
  readonly columns      = [...SHOWCASE_COLUMNS_WITH_COMPLETION];
  readonly hiddenColumns = [...SHOWCASE_DEFAULT_HIDDEN];
  ngAfterViewInit(): void {
    if (this.toolbarElement && this.gridElement) {
      this.disposeToolbar = mountShowcaseToolbar(this.toolbarElement.nativeElement, this.gridElement.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.disposeToolbar?.();
    this.disconnectTheme();
  }
}
