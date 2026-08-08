import { CONSTRUCTION_INDUSTRY_DEFINITION } from './construction/construction.data';
import { ERP_INDUSTRY_DEFINITION } from './erp/erp.data';
import type { IndustryGanttDefinition } from './industry-use-case.types';
import { MANUFACTURING_INDUSTRY_DEFINITION } from './manufacturing/manufacturing.data';
import { PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION } from './professional-services/professional-services.data';
import { RESOURCE_PLANNING_INDUSTRY_DEFINITION } from './resource-planning/resource-planning.data';
import { INTERNAL_TOOLS_INDUSTRY_DEFINITION } from './internal-tools/internal-tools.data';

export const INDUSTRY_GANTT_IDS = ['industry-erp', 'industry-professional-services', 'industry-construction', 'industry-manufacturing', 'industry-resource-planning', 'industry-internal-tools'] as const;
export type IndustryGanttId = typeof INDUSTRY_GANTT_IDS[number];
export const INDUSTRY_GANTT_DEFINITIONS: Readonly<Record<IndustryGanttId, IndustryGanttDefinition>> = {
  'industry-erp': ERP_INDUSTRY_DEFINITION,
  'industry-professional-services': PROFESSIONAL_SERVICES_INDUSTRY_DEFINITION,
  'industry-construction': CONSTRUCTION_INDUSTRY_DEFINITION,
  'industry-manufacturing': MANUFACTURING_INDUSTRY_DEFINITION,
  'industry-resource-planning': RESOURCE_PLANNING_INDUSTRY_DEFINITION,
  'industry-internal-tools': INTERNAL_TOOLS_INDUSTRY_DEFINITION,
};

export function resolveIndustryGantt(search: string): IndustryGanttDefinition {
  const requested = new URLSearchParams(search).get('use-case');
  return requested && INDUSTRY_GANTT_IDS.includes(requested as IndustryGanttId) ? INDUSTRY_GANTT_DEFINITIONS[requested as IndustryGanttId] : INDUSTRY_GANTT_DEFINITIONS['industry-erp'];
}
