import type { DependencyEntity, GanttPluginConfig, GanttTaskSourceRow } from '@revolist/gantt';

export const GANTT_BENCHMARK_TASK_COUNTS = [100, 1_000, 5_000, 10_000] as const;
export const GANTT_BENCHMARK_DENSITIES = ['sparse', 'normal', 'high'] as const;
export const GANTT_BENCHMARK_TIMELINE_SPANS = ['quarter', 'twenty-year'] as const;

export type GanttBenchmarkTaskCount = typeof GANTT_BENCHMARK_TASK_COUNTS[number];
export type GanttBenchmarkDensity = typeof GANTT_BENCHMARK_DENSITIES[number];
export type GanttBenchmarkTimelineSpan = typeof GANTT_BENCHMARK_TIMELINE_SPANS[number];
export type GanttBenchmarkScenario = 'initial' | 'vertical' | 'horizontal' | 'move' | 'resize' | 'dependency' | 'hierarchy' | 'memory-dom';

export interface GanttBenchmarkOptions {
  readonly taskCount: GanttBenchmarkTaskCount;
  readonly density: GanttBenchmarkDensity;
  readonly timelineSpan: GanttBenchmarkTimelineSpan;
  readonly seed: number;
}

export interface GanttBenchmarkDataset {
  readonly config: GanttPluginConfig;
  readonly tasks: GanttTaskSourceRow[];
  readonly dependencies: DependencyEntity[];
  readonly summaryTaskIds: readonly string[];
  readonly leafTaskIds: readonly string[];
  readonly projectStart: string;
  readonly projectEnd: string;
}

export interface GanttBenchmarkDomFootprint {
  readonly totalNodes: number;
  readonly mountedRowElements: number;
  readonly uniqueMountedRows: number;
  readonly mountedCells: number;
  readonly taskBars: number;
  readonly dependencyElements: number;
}

export interface GanttBenchmarkReadiness {
  readonly navigationToInteractiveMs: number;
  readonly datasetGenerationMs: number;
  readonly applyToInteractiveMs: number;
  readonly taskCount: number;
  readonly dependencyCount: number;
  readonly visibleTaskId: string;
  readonly dom: GanttBenchmarkDomFootprint;
}

export interface GanttBenchmarkScrollMetrics {
  readonly axis: 'vertical' | 'horizontal';
  readonly durationMs: number;
  readonly rawFps: number;
  readonly displayCappedFps: number;
  readonly frameCount: number;
  readonly droppedFrames: number;
  readonly frameTimeMedianMs: number;
  readonly frameTimeP95Ms: number;
  readonly longTaskCount: number;
  readonly longTaskTotalMs: number;
  readonly longTaskMaxMs: number;
}

export interface GanttBenchmarkDependencyMetrics {
  readonly latencyMs: number;
  readonly dependencyCount: number;
  readonly affectedTaskId: string;
}

export interface GanttBenchmarkHierarchyMetrics {
  readonly collapseMs: number;
  readonly expandMs: number;
  readonly expandedRows: number;
  readonly collapsedRows: number;
}

export interface GanttBenchmarkEnvironment {
  readonly gitCommit: string;
  readonly browser: string;
  readonly playwright: string;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly deviceScaleFactor: number;
  readonly node: string;
  readonly pnpm: string;
  readonly revogrid: { readonly core: string; readonly pro: string; readonly enterprise: string };
  readonly machine: {
    readonly model: string;
    readonly chip: string;
    readonly cores: string;
    readonly memory: string;
    readonly architecture: string;
    readonly os: string;
    readonly osBuild: string;
  };
}

export interface GanttBenchmarkRawSample {
  readonly caseId: string;
  readonly taskCount: GanttBenchmarkTaskCount;
  readonly density: GanttBenchmarkDensity;
  readonly timelineSpan: GanttBenchmarkTimelineSpan;
  readonly dependencyCount: number;
  readonly scenario: GanttBenchmarkScenario;
  readonly runIndex: number;
  readonly warmup: boolean;
  readonly metrics: Readonly<Record<string, number | string | Array<number | null>>>;
}

export interface GanttBenchmarkAggregateMetric {
  readonly median: number;
  readonly p95: number;
  readonly samples: readonly number[];
}

export interface GanttBenchmarkAggregate {
  readonly caseId: string;
  readonly taskCount: GanttBenchmarkTaskCount;
  readonly density: GanttBenchmarkDensity;
  readonly timelineSpan: GanttBenchmarkTimelineSpan;
  readonly scenario: GanttBenchmarkScenario;
  readonly measuredRuns: number;
  readonly metrics: Readonly<Record<string, GanttBenchmarkAggregateMetric>>;
}

export interface GanttBenchmarkController {
  readonly options: GanttBenchmarkOptions;
  readonly readiness: Promise<GanttBenchmarkReadiness>;
  getGrid(): HTMLRevoGridElement;
  getDomFootprint(): GanttBenchmarkDomFootprint;
  getVisibleTask(): { id: string; startDate?: string; endDate?: string } | null;
  measureScroll(axis: 'vertical' | 'horizontal', durationMs?: number): Promise<GanttBenchmarkScrollMetrics>;
  measureDependencyUpdate(): Promise<GanttBenchmarkDependencyMetrics>;
  measureHierarchyProjection(): Promise<GanttBenchmarkHierarchyMetrics>;
  sampleHeap(count?: number): Promise<Array<number | null>>;
  waitForPaint(): Promise<void>;
  destroy(): void;
}

declare global {
  interface Window {
    __GANTT_BENCHMARK__?: GanttBenchmarkController;
  }
}
