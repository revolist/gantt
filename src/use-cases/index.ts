import type { GanttEntryDefinition } from '../gantt-entry';

export const GANTT_USE_CASE_IDS = [
  'industry-erp',
  'industry-professional-services',
  'industry-construction',
  'industry-manufacturing',
  'industry-resource-planning',
  'industry-internal-tools',
  'simple-construction',
] as const;

export type GanttUseCaseId = typeof GANTT_USE_CASE_IDS[number];
export type GanttUseCaseDefinition = GanttEntryDefinition<GanttUseCaseId>;

export const GANTT_USE_CASES: Readonly<Record<GanttUseCaseId, GanttUseCaseDefinition>> = {
  'industry-erp': {
    id: 'industry-erp',
    angularSelector: 'erp-gantt-grid',
    loadTs: async () => (await import('./erp/erp')).load,
    loadReact: async () => (await import('./erp/erp.react')).default,
    loadVue: async () => (await import('./erp/erp.vue')).default,
    loadAngular: async () => (await import('./erp/erp.angular')).ErpGanttComponent,
  },
  'industry-professional-services': {
    id: 'industry-professional-services',
    angularSelector: 'professional-services-gantt-grid',
    loadTs: async () => (await import('./professional-services/professional-services')).load,
    loadReact: async () => (await import('./professional-services/professional-services.react')).default,
    loadVue: async () => (await import('./professional-services/professional-services.vue')).default,
    loadAngular: async () => (await import('./professional-services/professional-services.angular')).ProfessionalServicesGanttComponent,
  },
  'industry-construction': {
    id: 'industry-construction',
    angularSelector: 'construction-gantt-grid',
    loadTs: async () => (await import('./construction/construction')).load,
    loadReact: async () => (await import('./construction/construction.react')).default,
    loadVue: async () => (await import('./construction/construction.vue')).default,
    loadAngular: async () => (await import('./construction/construction.angular')).ConstructionGanttComponent,
  },
  'industry-manufacturing': {
    id: 'industry-manufacturing',
    angularSelector: 'manufacturing-gantt-grid',
    loadTs: async () => (await import('./manufacturing/manufacturing')).load,
    loadReact: async () => (await import('./manufacturing/manufacturing.react')).default,
    loadVue: async () => (await import('./manufacturing/manufacturing.vue')).default,
    loadAngular: async () => (await import('./manufacturing/manufacturing.angular')).ManufacturingGanttComponent,
  },
  'industry-resource-planning': {
    id: 'industry-resource-planning',
    angularSelector: 'resource-planning-gantt-grid',
    loadTs: async () => (await import('./resource-planning/resource-planning')).load,
    loadReact: async () => (await import('./resource-planning/resource-planning.react')).default,
    loadVue: async () => (await import('./resource-planning/resource-planning.vue')).default,
    loadAngular: async () => (await import('./resource-planning/resource-planning.angular')).ResourcePlanningGanttComponent,
  },
  'industry-internal-tools': {
    id: 'industry-internal-tools',
    angularSelector: 'internal-tools-gantt-grid',
    loadTs: async () => (await import('./internal-tools/internal-tools')).load,
    loadReact: async () => (await import('./internal-tools/internal-tools.react')).default,
    loadVue: async () => (await import('./internal-tools/internal-tools.vue')).default,
    loadAngular: async () => (await import('./internal-tools/internal-tools.angular')).InternalToolsGanttComponent,
  },
  'simple-construction': {
    id: 'simple-construction',
    angularSelector: 'simple-construction-gantt',
    loadTs: async () => (await import('./simple-construction/simple-construction')).load,
    loadReact: async () => (await import('./simple-construction/simple-construction.react')).default,
    loadVue: async () => (await import('./simple-construction/simple-construction.vue')).default,
    loadAngular: async () => (await import('./simple-construction/simple-construction.angular')).SimpleConstructionGanttComponent,
  },
};

export function resolveGanttUseCase(search: string): GanttUseCaseDefinition | undefined {
  const requestedId = new URLSearchParams(search).get('use-case');
  return requestedId && GANTT_USE_CASE_IDS.includes(requestedId as GanttUseCaseId)
    ? GANTT_USE_CASES[requestedId as GanttUseCaseId]
    : undefined;
}
