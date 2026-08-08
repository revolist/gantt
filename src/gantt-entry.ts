export type GanttEntryFramework = 'ts' | 'react' | 'vue' | 'angular';

export interface GanttEntryDefinition<TId extends string = string> {
  readonly id: TId;
  readonly angularSelector: string;
  readonly loadTs: () => Promise<(parentSelector: string) => (() => void) | undefined>;
  readonly loadReact: () => Promise<unknown>;
  readonly loadVue: () => Promise<unknown>;
  readonly loadAngular: () => Promise<unknown>;
}
