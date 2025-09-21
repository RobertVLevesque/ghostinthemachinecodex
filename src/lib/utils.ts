import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const rng = (min: number, max: number) => Math.random() * (max - min) + min;

export const throttle = <Args extends unknown[]>(fn: (...args: Args) => void, delay: number) => {
  let last = 0;
  let timeout: number | undefined;

  return (...args: Args) => {
    const now = Date.now();
    const remaining = delay - (now - last);

    if (remaining <= 0) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
      last = now;
      fn(...args);
    } else if (!timeout) {
      timeout = window.setTimeout(() => {
        last = Date.now();
        timeout = undefined;
        fn(...args);
      }, remaining);
    }
  };
};

export const haptic = (pattern: VibratePattern | number) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};
