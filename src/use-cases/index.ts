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

const industryUseCase = (id: GanttUseCaseId): GanttUseCaseDefinition => ({
  id,
  angularSelector: 'industry-gantt-grid',
  loadTs: async () => (await import('./industry-use-cases/industry-use-case')).load,
  loadReact: async () => (await import('./industry-use-cases/industry-use-case.react')).default,
  loadVue: async () => (await import('./industry-use-cases/industry-use-case.vue')).default,
  loadAngular: async () => (await import('./industry-use-cases/industry-use-case.angular')).IndustryGanttGridComponent,
});

const simpleConstructionUseCase: GanttUseCaseDefinition = {
  id: 'simple-construction',
  angularSelector: 'simple-construction-gantt',
  loadTs: async () => (await import('./simple-construction/simple-construction')).load,
  loadReact: async () => (await import('./simple-construction/simple-construction.react')).default,
  loadVue: async () => (await import('./simple-construction/simple-construction.vue')).default,
  loadAngular: async () => (await import('./simple-construction/simple-construction.angular')).SimpleConstructionGanttComponent,
};

export const GANTT_USE_CASES: Readonly<Record<GanttUseCaseId, GanttUseCaseDefinition>> = Object.fromEntries(
  GANTT_USE_CASE_IDS.map((id) => [id, id === 'simple-construction' ? simpleConstructionUseCase : industryUseCase(id)]),
) as unknown as Readonly<Record<GanttUseCaseId, GanttUseCaseDefinition>>;

export function resolveGanttUseCase(search: string): GanttUseCaseDefinition | undefined {
  const requestedId = new URLSearchParams(search).get('use-case');
  return requestedId && GANTT_USE_CASE_IDS.includes(requestedId as GanttUseCaseId)
    ? GANTT_USE_CASES[requestedId as GanttUseCaseId]
    : undefined;
}
