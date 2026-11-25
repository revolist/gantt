<template>
  <div ref="hostRef" class="gantt-showcase-host grow h-full"></div>
</template>

<script setup lang="ts">
import '@revolist/ui/styles.css';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { mountShowcase } from './gantt';

const hostRef = ref<HTMLElement | null>(null);
let disposeShowcase: (() => void) | undefined;

onMounted(() => {
  if (hostRef.value) disposeShowcase = mountShowcase(hostRef.value);
});

onBeforeUnmount(() => disposeShowcase?.());
</script>

<style src="./gantt.scss" lang="scss"></style>
