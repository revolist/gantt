<template>
  <section class="construction-fabrication" aria-label="Simple Construction Gantt">
    <main class="construction-fabrication__main">
      <div class="construction-fabrication__command-deck">
        <div v-if="rootId" class="construction-simple__filter-tags" aria-label="Active filters">
          <button class="construction-simple__filter-tag" type="button" title="Clear project filter" @click="clearProjectFilter">Project: {{ selectedName }} ×</button>
          <button v-if="view === 'lookahead'" class="construction-simple__filter-tag" type="button" title="Clear date range filter" @click="clearDateRangeFilter">Date range: {{ startDate }} – {{ endDate }} ×</button>
        </div>
        <div v-if="rootId" class="construction-simple__lookahead-action">
          <button class="construction-fabrication__button construction-simple__lookahead-button" type="button" :aria-pressed="view === 'lookahead'" @click="showLookAhead">Look-Ahead</button>
        </div>
        <div v-if="view === 'lookahead'" class="construction-fabrication__command-actions">
          <label class="construction-fabrication__control-group">Start <input v-model="startDate" class="construction-fabrication__select" type="date"></label>
          <label class="construction-fabrication__control-group">Finish <input v-model="endDate" class="construction-fabrication__select" type="date"></label>
        </div>
      </div>

      <!-- Gantt configuration objects must be custom-element properties, not attributes. -->
      <RevoGrid
        ref="gridRef"
        class="construction-fabrication__grid skip-style cell-border"
        :source="rows"
        :theme="gridProperties.theme"
        :hide-attribution="gridProperties.hideAttribution"
        :readonly="gridProperties.readonly"
        :range="gridProperties.range"
        :resize="gridProperties.resize"
        :filter="gridProperties.filter"
        :row-size="gridProperties.rowSize"
        :plugins="gridProperties.plugins"
        :columns="gridProperties.columns"
        :row-headers.prop="gridProperties.rowHeaders"
        :row-order.prop="gridProperties.rowOrder"
        :tree.prop="gridProperties.tree"
        :gantt.prop="gridProperties.gantt"
        :gantt-dependencies.prop="gridProperties.ganttDependencies"
        :gantt-resources.prop="gridProperties.ganttResources"
        :gantt-assignments.prop="gridProperties.ganttAssignments"
        :gantt-calendars.prop="gridProperties.ganttCalendars"
        :trimmed-rows.prop="gridProperties.trimmedRows"
        @tree-state-changed="handleTreeState"
        @gantt-before-task-change="handleTaskChange"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import RevoGrid from '@revolist/vue3-datagrid';
import { createConstructionRows, rootName } from './shared/data';
import { applyProjectKeepOnlyFilter } from './shared/filters';
import { createSimpleGridBindings } from './shared/grid';
import { lookAheadExpandedRows } from './shared/lookahead';
import { applyTaskPatch } from './shared/tasks';
import { DEFAULT_PERIOD, type SimpleConstructionView } from './shared/types';
import './simple-construction.scss';

const rows = createConstructionRows();
const view = ref<SimpleConstructionView>('company');
const rootId = ref<string | null>(null);
const startDate = ref(DEFAULT_PERIOD.startDate);
const endDate = ref(DEFAULT_PERIOD.endDate);
const expandedRowIds = ref(new Set<string>());
const gridRef = ref<any>();
const state = computed(() => ({
  view: view.value,
  rootId: rootId.value,
  startDate: startDate.value,
  endDate: endDate.value,
}));
const selectedName = computed(() => rootName(rows, rootId.value));
const bindings = computed(() => createSimpleGridBindings(rows, state.value, expandedRowIds.value, selectRoot));
const gridProperties = computed(() => {
  const { source: _source, ...properties } = bindings.value;
  return properties;
});

function selectRoot(id: string) {
  rootId.value = id;
  view.value = 'project';
  expandedRowIds.value = new Set([id]);
  void applyProjectKeepOnlyFilter(gridRef.value?.$el, rows, id);
}
function clearProjectFilter() {
  view.value = 'company';
  rootId.value = null;
  expandedRowIds.value = new Set();
  void applyProjectKeepOnlyFilter(gridRef.value?.$el, rows, null);
}
function clearDateRangeFilter() {
  view.value = 'project';
  expandedRowIds.value = new Set(rootId.value ? [rootId.value] : []);
}
function showLookAhead() {
  if (!rootId.value) return;
  view.value = 'lookahead';
  expandedRowIds.value = lookAheadExpandedRows(rows, state.value);
}
function handleTreeState(event: CustomEvent<{ expandedRowIds: Set<string> }>) {
  expandedRowIds.value = new Set(event.detail.expandedRowIds);
}
function handleTaskChange(event: CustomEvent) {
  applyTaskPatch(rows, event.detail);
}
</script>
