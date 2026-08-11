import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const resultsDirectory = resolve(import.meta.dirname, '../../../benchmarks/results');
const result = JSON.parse(readFileSync(resolve(resultsDirectory, 'latest.json'), 'utf8')) as {
  schemaVersion: number;
  methodology: { warmupRuns: number; measuredRuns: number; claim: string };
  environment: Record<string, unknown> & { revogrid: Record<string, string>; machine: Record<string, string> };
  cases: Array<{ id: string; taskCount: number; density: string; dependencyTarget: number }>;
  samples: Array<{ warmup: boolean }>;
  aggregates: Array<{ measuredRuns: number; metrics: Record<string, { median: number; p95: number; samples: number[] }> }>;
};

describe('published Gantt benchmark result', () => {
  it('matches the canonical matrix and raw-sample schema', () => {
    expect(result.schemaVersion).toBe(1);
    expect(result.methodology).toMatchObject({
      warmupRuns: 1,
      measuredRuns: 5,
      claim: '10,000 editable tasks and 19,796 dependencies in a live browser demo',
    });
    expect(result.cases).toHaveLength(12);
    expect(new Set(result.cases.map(({ taskCount }) => taskCount))).toEqual(new Set([100, 1_000, 5_000, 10_000]));
    expect(new Set(result.cases.map(({ density }) => density))).toEqual(new Set(['sparse', 'normal', 'high']));
    expect(result.cases.find(({ id }) => id === '10000-normal')?.dependencyTarget).toBe(19_796);
    expect(result.samples).toHaveLength(576);
    expect(result.samples.filter(({ warmup }) => warmup)).toHaveLength(96);
    expect(result.aggregates).toHaveLength(96);
    for (const aggregate of result.aggregates) {
      expect(aggregate.measuredRuns).toBe(5);
      for (const metric of Object.values(aggregate.metrics)) {
        expect(metric.samples).toHaveLength(5);
        expect(Number.isFinite(metric.median)).toBe(true);
        expect(Number.isFinite(metric.p95)).toBe(true);
      }
    }
  });

  it('publishes the allowlisted environment, CSV samples, and media', () => {
    expect(Object.keys(result.environment).sort()).toEqual([
      'browser', 'deviceScaleFactor', 'gitCommit', 'machine', 'node', 'playwright', 'pnpm', 'revogrid', 'viewport',
    ]);
    expect(Object.keys(result.environment.machine).sort()).toEqual([
      'architecture', 'chip', 'cores', 'memory', 'model', 'os', 'osBuild',
    ]);
    expect(result.environment.revogrid).toMatchObject({ core: '4.25.1', pro: '2.6.2', enterprise: '2.6.2' });
    expect(readFileSync(resolve(resultsDirectory, 'latest.csv'), 'utf8').trim().split('\n')).toHaveLength(577);
    expect(statSync(resolve(resultsDirectory, 'gantt-benchmark-reference.png')).size).toBeGreaterThan(100_000);
    expect(statSync(resolve(resultsDirectory, 'gantt-benchmark-walkthrough.webm')).size).toBeGreaterThan(100_000);
  });
});
