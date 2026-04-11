"use client";

/**
 * text-animation.tsx
 *
 * Text animation components using CSS clip technique.
 * Each word wraps in overflow:hidden → child translates from below.
 * IntersectionObserver on container adds "visible" to all children.
 * Zero React state. Zero jitter.
 */

import { useEffect, useRef } from "react";

/* ─── Word Clip Reveal ─────────────────────────────────────
 *
 * Usage:
 *   <WordReveal text="Your DMs, automated." tag="h1" className="t-display" />
 *
 * Each space-separated word gets wrapped in:
 *   <span class="clip-wrap">
 *     <span class="clip-word d-N">word</span>
 *   </span>
 *
 * IntersectionObserver on the outer element fires once,
 * then adds "visible" to every .clip-word inside it.
 * CSS transitions handle the actual animation.
 */
export function WordReveal({
  text,
  tag: Tag = "span",
  className = "",
  style = {},
  stagger = 0.065,    // seconds between each word
  baseDelay = 0,      // initial offset in seconds
  italic = false,
}: {
  text: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
  baseDelay?: number;
  italic?: boolean;
}) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>(".clip-word");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          words.forEach((w) => w.classList.add("visible"));
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  const parts = text.split(" ");

  return (
    // @ts-ignore
    <Tag
      ref={containerRef}
      className={className}
      style={{ display: "inline", ...style }}
    >
      {parts.map((word, i) => (
        <span
          key={i}
          className="clip-wrap"
          style={{
            marginRight: i < parts.length - 1 ? "0.25em" : 0,
          }}
        >
          <span
            className="clip-word"
            style={{
              transitionDelay: `${baseDelay + i * stagger}s`,
              fontStyle: italic ? "italic" : "inherit",
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ─── Shimmer Text — pure CSS gradient sweep ───────────────
 * No JS after mount. Just a CSS animation class.
 */
export function ShimmerText({
  text,
  tag: Tag = "span",
  className = "",
  style = {},
}: {
  text: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // @ts-ignore
    <Tag className={`shimmer-text ${className}`} style={style}>
      {text}
    </Tag>
  );
}

/* ─── Ghost Number (image 2 reference) ─────────────────────
 * Large outline-only number behind content.
 * Purely decorative.
 */
export function GhostNumber({
  n,
  className = "",
  style = {},
}: {
  n: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`t-ghost ${className}`}
      style={style}
    >
      {n}
    </span>
  );
}

/* ─── Section Number (image 4 reference) ───────────────────
 * Small "01" editorial label above section titles.
 */
export function SectionN({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`t-num ${className}`}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

/* ─── Inline reveal — single element clip animation ─────── */
export function ClipReveal({
  children,
  staggerIndex = 0,
  baseDelay = 0,
}: {
  children: React.ReactNode;
  staggerIndex?: number;
  baseDelay?: number;
}) {
  return (
    <span className="clip-wrap">
      <span
        className="clip-word"
        style={{ transitionDelay: `${baseDelay + staggerIndex * 0.07}s` }}
      >
        {children}
      </span>
    </span>
  );
}