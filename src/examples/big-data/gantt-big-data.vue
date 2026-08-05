<template>
  <section class="gantt-big-data-demo">
    <RevoGrid
      class="gantt-big-data-grid"
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
  createGanttBigDataSet,
  ganttBigDataCalendars,
  ganttBigDataConfig,
} from './gantt-big-data-data';

const plugins = [GanttPlugin];
const data = createGanttBigDataSet();
const rows = ref(data.tasks);
const dependencies = ref(data.dependencies);
const columns = ref([createDefaultTaskTableColumn('name')]);
const ganttConfig = ref(ganttBigDataConfig);
const calendars = ref(ganttBigDataCalendars);
const isDark = ref(currentTheme().isDark());
const disconnectTheme = observeCurrentTheme((value) => {
  isDark.value = value;
});

onBeforeUnmount(disconnectTheme);
</script>

<style src="./gantt-big-data.scss" lang="scss"></style>
