"use client";

import { useEffect, useRef, RefObject } from "react";

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/** Hook: returns a ref. When element enters view, adds "visible" class. */
export function useInView<T extends Element>(
  options: InViewOptions = {}
): RefObject<T | null> {
  const {
    threshold  = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once       = true,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          if (once) observer.disconnect();
        } else if (!once) {
          el.classList.remove("visible");
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/** Component wrappers — thin wrappers around the hook */

export function FadeUp({
  children,
  delay = "d-0",
  className = "",
  style = {},
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`anim-fade-up ${delay} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  delay = "d-0",
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useInView<HTMLDivElement>({ threshold: 0.05 });
  return (
    <div ref={ref} className={`anim-fade ${delay} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function FadeLeft({
  children,
  delay = "d-0",
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`anim-fade-left ${delay} ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Animated horizontal rule — expands from left to right */
export function AnimLine({ className = "" }: { className?: string }) {
  const ref = useInView<HTMLDivElement>({ threshold: 0.8 });
  return (
    <div
      ref={ref}
      className={`hr anim-line ${className}`}
    />
  );
}