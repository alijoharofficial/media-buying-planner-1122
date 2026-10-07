'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Animated count-up. Screen readers get the final value only; reduced motion jumps straight to it. */
export function CountUp({ value, format, duration = 900 }: { value: number; format: (v: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const total = reduce ? 0 : duration;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = total ? Math.min(1, (now - start) / total) : 1;
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">{format(inView ? shown : 0)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
