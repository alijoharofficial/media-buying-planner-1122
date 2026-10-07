import type { RateSource, Source, StepRecord, StepValue, Unit, ValueTag } from './types';

/** Safe division: returns 0 when the divisor is not positive. */
export const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export const val = (key: string, value: number, unit: Unit, tag: ValueTag = 'input', source?: Source | RateSource): StepValue => ({
  key,
  value,
  unit,
  tag,
  ...(source ? { source } : {}),
});

export const step = (id: string, inputs: StepValue[], value: number, unit: Unit, long = false): StepRecord => ({
  id,
  inputs,
  result: { value, unit },
  ...(long ? { long } : {}),
});
