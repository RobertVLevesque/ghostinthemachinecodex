import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { prefersReducedMotion } from "../lib/utils";

type Point = { x: number; y: number };

export type PulsePayload = {
  id: number;
  from: Point;
  to: Point;
};

type PulseSweepProps = {
  pulse: PulsePayload | null;
  onComplete: () => void;
};

export const PulseSweep = ({ pulse, onComplete }: PulseSweepProps) => {
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (pulse && reducedMotion) {
      const timeout = window.setTimeout(onComplete, 50);
      return () => window.clearTimeout(timeout);
    }
  }, [pulse, reducedMotion, onComplete]);

  const geometry = useMemo(() => {
    if (!pulse) return null;
    const dx = pulse.to.x - pulse.from.x;
    const dy = pulse.to.y - pulse.from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      length,
      angle,
      left: pulse.from.x,
      top: pulse.from.y,
    };
  }, [pulse]);

  if (!pulse || reducedMotion) return null;

  return (
    <AnimatePresence>
      {geometry && (
        <motion.div
          key={pulse.id}
          className="pointer-events-none"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.6, ease: [0.45, 0, 0.25, 1] }}
          style={{
            position: "fixed",
            left: geometry.left,
            top: geometry.top,
            width: geometry.length,
            height: 2,
            transform: `translateY(-1px) rotate(${geometry.angle}deg)`,
            transformOrigin: "0% 50%",
            zIndex: 50,
            background:
              "linear-gradient(90deg, rgba(58, 112, 255, 0.2) 0%, rgba(80, 237, 255, 0.9) 45%, rgba(58, 112, 255, 0.1) 100%)",
            boxShadow: "0 0 25px rgba(80, 237, 255, 0.35)",
          }}
          onAnimationComplete={onComplete}
        />
      )}
    </AnimatePresence>
  );
};
