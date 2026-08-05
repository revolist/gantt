<template>
  <section class="gantt-horizontal-big-data-demo">
    <RevoGrid
      class="gantt-horizontal-big-data-grid"
      hide-attribution
      :theme="isDark ? 'darkCompact' : 'compact'"
      :plugins="plugins"
      :source="rows"
      :columns="columns"
      :gantt.prop="ganttConfig"
      :gantt-dependencies.prop="dependencies"
      :gantt-calendars.prop="calendars"
    />
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import RevoGrid from '@revolist/vue3-datagrid';
import { GanttPlugin, createDefaultTaskTableColumn } from '@revolist/revogrid-enterprise';
import { currentTheme, observeCurrentTheme } from '../../theme';
import {
  createGanttHorizontalBigDataSet,
  ganttHorizontalBigDataCalendars,
  ganttHorizontalBigDataConfig,
} from './gantt-horizontal-big-data-data';

const plugins = [GanttPlugin];
const data = createGanttHorizontalBigDataSet();
const rows = ref(data.tasks);
const dependencies = ref(data.dependencies);
const columns = ref([createDefaultTaskTableColumn('name')]);
const ganttConfig = ref(ganttHorizontalBigDataConfig);
const calendars = ref(ganttHorizontalBigDataCalendars);
const isDark = ref(currentTheme().isDark());
const disconnectTheme = observeCurrentTheme((value) => {
  isDark.value = value;
});

onBeforeUnmount(disconnectTheme);
</script>

<style src="./gantt-horizontal-big-data.scss" lang="scss"></style>
