import { Component, NO_ERRORS_SCHEMA, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RevoGrid } from '@revolist/angular-datagrid';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/revogrid-enterprise';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  createGanttBigDataSet,
  ganttBigDataCalendars,
  ganttBigDataConfig,
} from './gantt-big-data-data';

@Component({
  selector: 'gantt-big-data-grid',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [RevoGrid],
  template: `
    <section class="gantt-big-data-demo">
      <revo-grid
        class="gantt-big-data-grid"
        [hideAttribution]="true"
        [theme]="theme"
        [plugins]="plugins"
        [source]="tasks"
        [columns]="columns"
        [gantt]="ganttConfig"
        [ganttDependencies]="dependencies"
        [ganttCalendars]="calendars"
      ></revo-grid>
    </section>
  `,
  styleUrls: ['./gantt-big-data.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GanttBigDataGridComponent implements OnDestroy {
  private readonly data = createGanttBigDataSet();
  private readonly disconnectTheme = observeCurrentTheme((isDark) => {
    this.theme = isDark ? 'darkCompact' : 'compact';
  });

  theme = currentTheme().isDark() ? 'darkCompact' : 'compact';
  readonly plugins = [GanttPlugin];
  readonly tasks = this.data.tasks;
  readonly dependencies = this.data.dependencies;
  readonly columns = [createDefaultTaskTableColumn('name')];
  readonly ganttConfig = ganttBigDataConfig;
  readonly calendars = ganttBigDataCalendars;

  ngOnDestroy(): void {
    this.disconnectTheme();
  }
}
