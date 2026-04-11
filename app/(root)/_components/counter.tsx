"use client";

import { useEffect, useRef } from "react";

/**
 * counter.tsx
 *
 * Counts from 0 to `end` using requestAnimationFrame.
 * Only ONE IntersectionObserver per element.
 * Updates DOM directly via ref.textContent — no React state, no re-renders.
 * Result: buttery smooth with zero jitter.
 */

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function Counter({
  end,
  prefix = "",
  suffix = "",
  duration = 1500,
  className = "",
  style = {},
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const spanRef  = useRef<HTMLSpanElement>(null);
  const started  = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    // Set initial text
    el.textContent = `${prefix}0${suffix}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const update = (now: number) => {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value    = Math.round(easeOutExpo(progress) * end);
            el.textContent = `${prefix}${value.toLocaleString("en-IN")}${suffix}`;
            if (progress < 1) requestAnimationFrame(update);
          };

          requestAnimationFrame(update);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, prefix, suffix, duration]);

  return (
    <span
      ref={spanRef}
      className={className}
      style={style}
      suppressHydrationWarning
    />
  );
}