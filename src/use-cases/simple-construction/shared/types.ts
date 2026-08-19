export type SimpleConstructionView = 'company' | 'project' | 'lookahead';

export interface SimpleConstructionState {
  view: SimpleConstructionView;
  rootId: string | null;
  startDate: string;
  endDate: string;
}

export const DEFAULT_PERIOD = { startDate: '2026-08-17', endDate: '2026-08-30' };
