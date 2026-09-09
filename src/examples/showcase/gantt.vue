<template>
  <div :class="shellClass">
    <div class="gantt-showcase-toolbar">
      <div class="gantt-showcase-controls gantt-showcase-visual-controls">
        <label class="gantt-showcase-control">
          <input v-model="showCriticalPath" class="gantt-showcase-control__input" type="checkbox" />
          <span class="gantt-showcase-control__label">Critical path</span>
        </label>
        <label class="gantt-showcase-control">
          <input v-model="showBaseline" class="gantt-showcase-control__input" type="checkbox" />
          <span class="gantt-showcase-control__label">Baselines</span>
        </label>
      </div>
      <div class="gantt-showcase-zoom rv-segmented-switch" role="group" aria-label="Timeline scale">
        <button
          v-for="option in SHOWCASE_TIMELINE_SCALE_OPTIONS"
          :key="option.value"
          class="rv-segmented-switch-item"
          :class="{ on: timelineScale === option.value }"
          type="button"
          :aria-pressed="timelineScale === option.value"
          @click="setTimelineScale(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
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
  SHOWCASE_TIMELINE_SCALE_OPTIONS,
  applyShowcaseTimelineScale,
  observeShowcaseTaskBarLabels,
  renderShowcaseTaskBarColor,
  renderShowcaseTaskBarContent,
  type ShowcaseTimelineScale,
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
const showCriticalPath = ref(Boolean(SHOWCASE_GANTT_CONFIG.visuals.showCriticalPath));
const showBaseline = ref(false);
const timelineScale = ref<ShowcaseTimelineScale>('week');
const isDark = ref(currentTheme().isDark());
let disconnectTheme: (() => void) | undefined;
let disconnectLabels: (() => void) | undefined;
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
    showCriticalPath: showCriticalPath.value,
    showBaseline: showBaseline.value,
    taskBarColorHook: renderShowcaseTaskBarColor,
    taskBarContentHook: renderShowcaseTaskBarContent,
  },
}));

// ── Refs ──────────────────────────────────────────────────────────────────────
const gridRef    = ref<InstanceType<typeof RevoGrid> | HTMLRevoGridElement | null>(null);

async function setTimelineScale(scale: ShowcaseTimelineScale) {
  const grid = ((gridRef.value as any)?.$el ?? gridRef.value) as HTMLRevoGridElement | null;

  if (grid && await applyShowcaseTimelineScale(grid, scale)) {
    timelineScale.value = scale;
  }
}

onMounted(async () => {
  disconnectTheme = observeCurrentTheme((value) => {
    isDark.value = value;
  });
  const { GanttPlugin } = await import('@revolist/gantt');

  plugins.value = [GanttPlugin, ExportExcelPlugin, RowStatusPlugin];
  await nextTick();
  const grid = ((gridRef.value as any)?.$el ?? gridRef.value) as HTMLRevoGridElement | null;
  if (grid) disconnectLabels = observeShowcaseTaskBarLabels(grid);
});

onBeforeUnmount(() => {
  disconnectTheme?.();
  disconnectLabels?.();
});
</script>

<style src="./gantt.scss" lang="scss"></style>

<style scoped>
.gantt-showcase :deep(revo-grid) {
  flex: 1;
  min-height: 0;
}
</style>
