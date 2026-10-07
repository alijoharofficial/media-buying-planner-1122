'use client';

import { useEffect, useRef } from 'react';

/** Lightweight aurora / gradient-mesh effect for the hero only. Low-res canvas + CSS blur, paused off-screen. */
export default function AuroraCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(document.documentElement);
    const colors = [1, 2, 3].map((i) => css.getPropertyValue(`--gradient-aurora-${i}`).trim() || '#6366f1');
    const blobs = colors.map((c, i) => ({ c, phase: i * 2.1, speed: 0.00012 + i * 0.00004, r: 0.45 + i * 0.08 }));
    let raf = 0;
    let visible = true;

    const resize = () => {
      const scale = 0.35; // low resolution keeps it cheap; CSS blur hides the pixels
      canvas.width = Math.max(1, Math.floor(canvas.offsetWidth * scale));
      canvas.height = Math.max(1, Math.floor(canvas.offsetHeight * scale));
    };
    const draw = (time: number) => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs) {
        const t = time * b.speed + b.phase;
        const x = w * (0.5 + 0.35 * Math.cos(t));
        const y = h * (0.45 + 0.3 * Math.sin(t * 1.3));
        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * b.r);
        g.addColorStop(0, `${b.c}88`);
        g.addColorStop(1, `${b.c}00`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-60 blur-3xl dark:opacity-50" />;
}
