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
  stagger = 0.065,
  baseDelay = 0,
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const inner = (
    <>
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
    </>
  );

  /* Render a real div as the observed root, then style it to match
     the requested tag visually via className. The Tag prop controls
     display semantics via className (t-display, t-headline, etc.)
     — the ref always lives on a div so TypeScript is happy.        */
  if (Tag === "div" || Tag === "span" || Tag === "p") {
    const El = Tag as "div" | "span" | "p";
    return (
      <El
        ref={containerRef as React.RefObject<HTMLDivElement & HTMLSpanElement & HTMLParagraphElement>}
        className={className}
        style={{ display: "inline", ...style }}
      >
        {inner}
      </El>
    );
  }

  /* For semantic heading tags (h1–h6) render the heading with a
     nested div as the observed root — avoids the union type issue. */
  const HeadingEl = Tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <HeadingEl className={className} style={style}>
      <div ref={containerRef} style={{ display: "inline" }}>
        {inner}
      </div>
    </HeadingEl>
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
  /* Same pattern — narrow to known safe tags */
  if (Tag === "div" || Tag === "p") {
    const El = Tag as "div" | "p";
    return (
      <El className={`shimmer-text ${className}`} style={style}>
        {text}
      </El>
    );
  }
  return (
    <span className={`shimmer-text ${className}`} style={style}>
      {text}
    </span>
  );
}

/* ─── Ghost Number ──────────────────────────────────────────
 * Large outline-only number behind content. Purely decorative.
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

/* ─── Section Number ────────────────────────────────────────
 * Small "01" editorial label above section titles.
 */
export function SectionN({
  n,
  className = "",
}: {
  n: number;
  className?: string;
}) {
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