<template>
  <section :class="shellClass" :aria-label="`${definition.productLabel} ${definition.title}`">
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
        <div v-for="metric in definition.metrics" :key="metric.label" :class="`industry-gantt-metric industry-gantt-metric--${metric.tone ?? 'default'}`">
          <strong class="industry-gantt-metric__value">{{ metric.value }}</strong>
          <span class="industry-gantt-metric__label">{{ metric.label }}</span>
        </div>
      </div>
      <div class="industry-gantt-sync"><span class="industry-gantt-sync__dot" />{{ definition.updatedLabel }}</div>
    </header>
    <div class="industry-gantt-toolbar">
      <span class="industry-gantt-toolbar__label">{{ definition.scheduleLabel }}</span>
      <span class="industry-gantt-toolbar__legend">{{ definition.riskLegendLabel }}</span>
      <button type="button" class="industry-gantt-toggle" :aria-pressed="showBaseline" @click="showBaseline = !showBaseline">Baseline</button>
      <button type="button" class="industry-gantt-toggle" :aria-pressed="showCriticalPath" @click="showCriticalPath = !showCriticalPath">Critical path</button>
    </div>
    <RevoGrid
      :class="gridClass"
      :theme="theme"
      hide-attribution
      :readonly="false"
      :range="true"
      :resize="true"
      :row-size="definition.grid?.rowSize ?? 34"
      :row-headers="definition.grid?.rowHeaders ?? false"
      :auto-size-column="false"
      :plugins="plugins"
      :columns="columns"
      :source="source"
      :gantt.prop="gantt"
      :gantt-dependencies.prop="dependencies"
      :gantt-calendars.prop="calendars"
      :gantt-resources.prop="resources"
      :gantt-assignments.prop="assignments"
      :gantt-baselines.prop="baselines"
    />
  </section>
</template>

<script setup lang="ts">
import '../shared/industry-use-case.scss';
import './erp.presentation.scss';
import { computed, onBeforeUnmount, ref } from 'vue';
import RevoGrid from '@revolist/vue3-datagrid';
import { currentTheme, observeCurrentTheme } from '../../theme';
import { ERP_INDUSTRY_DEFINITION as definition } from './erp.data';
import { createIndustryGanttConfig } from '../shared/industry-use-case.types';
import {
  industryGridClass,
  industryGridTheme,
  industryPlugins,
  industryShellClass,
} from '../shared/industry-use-case.shared';

const plugins = industryPlugins(definition);
const columns = [...definition.columns];
const source = ref([...definition.tasks]);
const dependencies = [...definition.dependencies];
const calendars = [...definition.calendars];
const resources = [...definition.resources];
const assignments = [...definition.assignments];
const baselines = [...definition.baselines];
const showBaseline = ref(false);
const showCriticalPath = ref(true);
const gantt = computed(() => createIndustryGanttConfig(definition, showBaseline.value, showCriticalPath.value));
const dark = ref(currentTheme().isDark());
const theme = computed(() => industryGridTheme(definition, dark.value));
const gridClass = industryGridClass(definition);
const shellClass = computed(() => industryShellClass(dark.value, definition.id));
const disconnectTheme = observeCurrentTheme((value) => {
  dark.value = value;
});
onBeforeUnmount(disconnectTheme);
</script>
