<template>
  <div :class="shellClass">
    <div ref="toolbarRef" class="gantt-showcase-toolbar"></div>
    <RevoGrid
      ref="gridRef"
      class="gantt-showcase-grid skip-style cell-border"
      hide-attribution
      :readonly="false"
      :range="true"
      :resize="true"
      :row-size="42"
      :row-headers="false"
      :auto-size-column="false"
      :theme="gridTheme"
      :plugins="plugins"
      :hide-columns.prop="hiddenColumns"
      :source="source"
      :columns="columns"
      :gantt.prop="ganttConfig"
      :gantt-dependencies.prop="dependencies"
      :gantt-calendars.prop="calendars"
      :gantt-resources.prop="resources"
      :gantt-assignments.prop="assignments"
      :gantt-baselines.prop="baselines"
    />
  </div>
</template>

<script setup lang="ts">
import '@revolist/ui/styles.css';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import RevoGrid from '@revolist/vue3-datagrid';
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

// ── Static grid data ──────────────────────────────────────────────────────────
const plugins = ref<unknown[]>([]);
const source      = ref([...SHOWCASE_TASKS]);
const dependencies = ref([...SHOWCASE_DEPENDENCIES]);
const calendars    = ref([{ ...STANDARD_CALENDAR }]);
const resources    = ref([...SHOWCASE_RESOURCES]);
const assignments  = ref([...SHOWCASE_ASSIGNMENTS]);
const baselines    = ref([...SHOWCASE_BASELINES]);
const columns      = ref([...SHOWCASE_COLUMNS_WITH_COMPLETION]);
const hiddenColumns = [...SHOWCASE_DEFAULT_HIDDEN];
const isDark = ref(currentTheme().isDark());
let disconnectTheme: (() => void) | undefined;
const gridTheme = computed(() => (isDark.value ? 'darkCompact' : 'compact'));
const shellClass = computed(() => [
  'gantt-showcase',
  'gantt-showcase-shell',
  'grow',
  'h-full',
  isDark.value ? 'gantt-showcase-shell--dark' : 'gantt-showcase-shell--light',
]);

const ganttConfig = computed(() => ({
  ...SHOWCASE_GANTT_CONFIG,
  visuals: {
    ...SHOWCASE_GANTT_CONFIG.visuals,
    showBaseline: false,
    taskBarColorHook: renderShowcaseTaskBarColor,
    taskBarContentHook: renderShowcaseTaskBarContent,
  },
}));

// ── Refs ──────────────────────────────────────────────────────────────────────
const gridRef    = ref<InstanceType<typeof RevoGrid> | HTMLRevoGridElement | null>(null);

const toolbarRef = ref<HTMLElement | null>(null);
let disposeToolbar: (() => void) | undefined;
let disposed = false;

onMounted(async () => {
  disconnectTheme = observeCurrentTheme((value) => {
    isDark.value = value;
  });
  const { GanttPlugin } = await import('@revolist/gantt');

  plugins.value = [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
  await nextTick();
  const grid = ((gridRef.value as any)?.$el ?? gridRef.value) as HTMLRevoGridElement | null;
  const { mountShowcaseToolbar } = await import('./showcase-toolbar');
  if (!disposed && toolbarRef.value && grid) {
    disposeToolbar = mountShowcaseToolbar(toolbarRef.value, grid);
  }
});

onBeforeUnmount(() => {
  disposed = true;
  disposeToolbar?.();
  disconnectTheme?.();
});
</script>

<style src="./gantt.scss" lang="scss"></style>

<style scoped>
.gantt-showcase :deep(revo-grid) {
  flex: 1;
  min-height: 0;
}
</style>
