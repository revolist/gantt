import { describe, expect, it } from 'vitest';
import { median, percentile95, roundMetric } from '../../../../src/examples/benchmark/gantt-benchmark-math';

describe('benchmark aggregation', () => {
  it('calculates medians for odd and even sample counts', () => {
    expect(median([8, 1, 3, 5, 2])).toBe(3);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBe(0);
  });

  it('calculates nearest-rank p95 and stable rounding', () => {
    expect(percentile95(Array.from({ length: 20 }, (_, index) => index + 1))).toBe(19);
    expect(roundMetric(12.3456)).toBe(12.35);
  });
});
