<template><div ref="host" /></template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { mountConstructionFabricationWorkspace } from './construction-fabrication.workspace';
const host = ref<HTMLElement>(); let dispose: (() => void) | undefined;
onMounted(() => { if (host.value) dispose = mountConstructionFabricationWorkspace(host.value); }); onBeforeUnmount(() => dispose?.());
</script>
