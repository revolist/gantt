import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { RevoGrid } from '@revolist/angular-datagrid';
import { createConstructionRows, rootName } from './shared/data';
import { applyProjectKeepOnlyFilter } from './shared/filters';
import { createSimpleGridBindings } from './shared/grid';
import { lookAheadExpandedRows } from './shared/lookahead';
import { applyTaskPatch } from './shared/tasks';
import { DEFAULT_PERIOD, type SimpleConstructionState, type SimpleConstructionView } from './shared/types';

@Component({
  selector: 'simple-construction-gantt',
  standalone: true,
  imports: [RevoGrid],
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./simple-construction.scss'],
  template: `
    <section class="construction-fabrication" aria-label="Simple Construction Gantt">
      <main class="construction-fabrication__main">
        <div class="construction-fabrication__command-deck">
          @if (rootId) {
            <div class="construction-simple__filter-tags" aria-label="Active filters">
              <button class="construction-simple__filter-tag" type="button" title="Clear project filter" (click)="clearProjectFilter()">Project: {{ selectedName }} ×</button>
              @if (view === 'lookahead') { <button class="construction-simple__filter-tag" type="button" title="Clear date range filter" (click)="clearDateRangeFilter()">Date range: {{ startDate }} – {{ endDate }} ×</button> }
            </div>
          }
          @if (rootId) {
            <div class="construction-simple__lookahead-action">
              <button class="construction-fabrication__button construction-simple__lookahead-button" type="button" [attr.aria-pressed]="view === 'lookahead'" (click)="showLookAhead()">Look-Ahead</button>
            </div>
          }
          @if (view === 'lookahead') {
            <div class="construction-fabrication__command-actions">
              <label class="construction-fabrication__control-group">Start <input class="construction-fabrication__select" type="date" [value]="startDate" (change)="setStartDate($event)"></label>
              <label class="construction-fabrication__control-group">Finish <input class="construction-fabrication__select" type="date" [value]="endDate" (change)="setEndDate($event)"></label>
            </div>
          }
        </div>
        <revo-grid #grid
          class="construction-fabrication__grid skip-style cell-border"
          [theme]="bindings.theme"
          [hideAttribution]="true"
          [readonly]="false"
          [range]="true"
          [resize]="true"
          [filter]="bindings.filter"
          [rowSize]="34"
          [plugins]="bindings.plugins"
          [columns]="bindings.columns"
          [rowHeaders]="bindings.rowHeaders"
          [rowOrder]="bindings.rowOrder"
          [tree]="bindings.tree"
          [gantt]="bindings.gantt"
          [ganttDependencies]="bindings.ganttDependencies"
          [ganttResources]="bindings.ganttResources"
          [ganttAssignments]="bindings.ganttAssignments"
          [ganttCalendars]="bindings.ganttCalendars"
          [trimmedRows]="bindings.trimmedRows"
          [source]="rows"
          (tree-state-changed)="handleTreeState($event)"
          (gantt-before-task-change)="handleTaskChange($event)"
        ></revo-grid>
      </main>
    </section>
  `,
})
export class SimpleConstructionGanttComponent {
  @ViewChild('grid', { read: ElementRef }) private gridElement?: ElementRef<HTMLRevoGridElement>;
  readonly rows = createConstructionRows();
  view: SimpleConstructionView = 'company';
  rootId: string | null = null;
  startDate = DEFAULT_PERIOD.startDate;
  endDate = DEFAULT_PERIOD.endDate;
  expandedRowIds = new Set<string>();
  bindings: ReturnType<typeof createSimpleGridBindings>;

  constructor() {
    this.bindings = this.createBindings();
  }

  get state(): SimpleConstructionState {
    return {
      view: this.view,
      rootId: this.rootId,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  get selectedName() {
    return rootName(this.rows, this.rootId);
  }

  selectRoot = (id: string) => {
    this.rootId = id;
    this.view = 'project';
    this.expandedRowIds = new Set([id]);
    void applyProjectKeepOnlyFilter(this.gridElement?.nativeElement, this.rows, id);
    this.refresh();
  };

  clearProjectFilter() {
    this.view = 'company';
    this.rootId = null;
    this.expandedRowIds = new Set();
    void applyProjectKeepOnlyFilter(this.gridElement?.nativeElement, this.rows, null);
    this.refresh();
  }

  clearDateRangeFilter() {
    this.view = 'project';
    this.expandedRowIds = new Set(this.rootId ? [this.rootId] : []);
    this.refresh();
  }

  showLookAhead() {
    if (!this.rootId) return;
    this.view = 'lookahead';
    this.expandedRowIds = lookAheadExpandedRows(this.rows, this.state);
    this.refresh();
  }

  setStartDate(event: Event) {
    this.startDate = (event.target as HTMLInputElement).value;
    this.refresh();
  }

  setEndDate(event: Event) {
    this.endDate = (event.target as HTMLInputElement).value;
    this.refresh();
  }

  handleTreeState(event: CustomEvent<{ expandedRowIds: Set<string> }>) {
    this.expandedRowIds = new Set(event.detail.expandedRowIds);
    this.refresh();
  }

  handleTaskChange(event: CustomEvent) {
    applyTaskPatch(this.rows, event.detail);
  }

  private createBindings() { return createSimpleGridBindings(this.rows, this.state, this.expandedRowIds, this.selectRoot); }
  private refresh() {
    this.bindings = this.createBindings();
  }
}
