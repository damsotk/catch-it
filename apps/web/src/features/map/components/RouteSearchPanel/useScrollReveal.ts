"use client";

import { useEffect, type RefObject } from "react";

const DURATION_MS = 650;

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  trigger: unknown,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const distance = element.scrollHeight - element.clientHeight;
    if (distance <= 0) return;

    if (prefersReducedMotion()) {
      element.scrollTop = 0;
      return;
    }

    element.scrollTop = distance;

    let frame = 0;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      element.scrollTop = distance * (1 - ease(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref, trigger]);
}
