export type GanttEntryFramework = 'ts' | 'react' | 'vue' | 'angular';

export interface GanttEntryDefinition<TId extends string = string> {
  readonly id: TId;
  readonly angularSelector: string;
  /** Frameworks intentionally supported by this entry. Unsupported builds fall back to Vanilla TS. */
  readonly frameworks?: readonly GanttEntryFramework[];
  readonly loadTs: () => Promise<(parentSelector: string) => (() => void) | undefined>;
  readonly loadReact: () => Promise<unknown>;
  readonly loadVue: () => Promise<unknown>;
  readonly loadAngular: () => Promise<unknown>;
}
