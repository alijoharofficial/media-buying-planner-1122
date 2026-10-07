import { step, val } from './steps';
import type { Stepped } from './types';

/** 9.3 Blend low-volume actual CPA with a benchmark. */
export function workingCPA(
  actualCPA: number,
  results: number,
  minResults: number,
  benchmarkCPA?: number,
): Stepped<{ cpa: number; weight: number; lowConfidence: boolean }> {
  const weight = Math.min(minResults > 0 ? results / minResults : 1, 1);
  const hasBenchmark = benchmarkCPA !== undefined && benchmarkCPA > 0;
  const cpa = hasBenchmark ? weight * actualCPA + (1 - weight) * benchmarkCPA : actualCPA;
  const lowConfidence = weight < 1;
  return {
    cpa,
    weight,
    lowConfidence,
    steps: [
      step(
        hasBenchmark ? 'workingCPA' : 'workingCPANoBenchmark',
        [
          val('actualCPA', actualCPA, 'currency'),
          val('results', results, 'number'),
          val('minResultsForConfidence', minResults, 'number', 'setting'),
          ...(hasBenchmark ? [val('benchmarkCPA', benchmarkCPA, 'currency', 'assumption', 'benchmark')] : []),
        ],
        cpa,
        'currency',
        true,
      ),
    ],
  };
}
