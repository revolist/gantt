import type { GanttEntryDefinition } from './gantt-entry';

export const GANTT_EXAMPLE_IDS = ['showcase', 'big-data', 'horizontal-big-data'] as const;

export type GanttExampleId = typeof GANTT_EXAMPLE_IDS[number];
export type GanttExampleDefinition = GanttEntryDefinition<GanttExampleId>;

export const DEFAULT_GANTT_EXAMPLE_ID: GanttExampleId = 'showcase';

export const GANTT_EXAMPLES: Readonly<Record<GanttExampleId, GanttExampleDefinition>> = {
  showcase: {
    id: 'showcase',
    angularSelector: 'gantt-showcase-grid',
    loadTs: async () => (await import('./examples/showcase/gantt')).load,
    loadReact: async () => (await import('./examples/showcase/gantt.react')).default,
    loadVue: async () => (await import('./examples/showcase/gantt.vue')).default,
    loadAngular: async () => (await import('./examples/showcase/gantt.angular')).GanttShowcaseGridComponent,
  },
  'big-data': {
    id: 'big-data',
    angularSelector: 'gantt-big-data-grid',
    loadTs: async () => (await import('./examples/big-data/gantt-big-data')).load,
    loadReact: async () => (await import('./examples/big-data/gantt-big-data.react')).default,
    loadVue: async () => (await import('./examples/big-data/gantt-big-data.vue')).default,
    loadAngular: async () => (await import('./examples/big-data/gantt-big-data.angular')).GanttBigDataGridComponent,
  },
  'horizontal-big-data': {
    id: 'horizontal-big-data',
    angularSelector: 'gantt-horizontal-big-data-grid',
    loadTs: async () => (await import('./examples/horizontal-big-data/gantt-horizontal-big-data')).load,
    loadReact: async () => (await import('./examples/horizontal-big-data/gantt-horizontal-big-data.react')).default,
    loadVue: async () => (await import('./examples/horizontal-big-data/gantt-horizontal-big-data.vue')).default,
    loadAngular: async () => (await import('./examples/horizontal-big-data/gantt-horizontal-big-data.angular')).GanttHorizontalBigDataGridComponent,
  },
};

export function resolveGanttExample(search: string): GanttExampleDefinition {
  const requestedId = new URLSearchParams(search).get('example');
  if (requestedId && GANTT_EXAMPLE_IDS.includes(requestedId as GanttExampleId)) {
    return GANTT_EXAMPLES[requestedId as GanttExampleId];
  }
  return GANTT_EXAMPLES[DEFAULT_GANTT_EXAMPLE_ID];
}
