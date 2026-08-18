import { mountConstructionFabricationWorkspace } from './construction-fabrication.workspace';
export function load(parentSelector: string): (() => void) | undefined { const parent = document.querySelector<HTMLElement>(parentSelector); return parent ? mountConstructionFabricationWorkspace(parent) : undefined; }
