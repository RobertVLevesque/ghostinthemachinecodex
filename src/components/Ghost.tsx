import { motion, useMotionValue, useTransform } from "framer-motion";
import { forwardRef, useEffect, useMemo, useState } from "react";
import type { GamePhase, NodeId } from "../lib/gameState";
import { cn, prefersReducedMotion, throttle } from "../lib/utils";

const NODE_POSITIONS: Record<NodeId, { cx: number; cy: number }> = {
  1: { cx: 104, cy: 156 },
  2: { cx: 216, cy: 156 },
  3: { cx: 160, cy: 224 },
};

const NODE_MAPPING: Record<NodeId, NodeId> = {
  1: 1,
  2: 2,
  3: 3,
};

type GhostProps = {
  activatedNodes: NodeId[];
  ghostVisible: boolean;
  phase: GamePhase;
  eyeGlowKey: number | null;
};

export const Ghost = forwardRef<HTMLDivElement, GhostProps>(
  ({ activatedNodes, ghostVisible, phase, eyeGlowKey }, ref) => {
    const reducedMotion = prefersReducedMotion();
    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);

    useEffect(() => {
      if (reducedMotion) return;
      const handler = throttle((event: PointerEvent) => {
        const { innerWidth, innerHeight } = window;
        const offsetX = event.clientX / innerWidth - 0.5;
        const offsetY = event.clientY / innerHeight - 0.5;
        tiltX.set(offsetY * -18);
        tiltY.set(offsetX * 20);
      }, 80) as (event: PointerEvent) => void;

      window.addEventListener("pointermove", handler);
      return () => window.removeEventListener("pointermove", handler);
    }, [reducedMotion, tiltX, tiltY]);

    const rotateX = useTransform(tiltX, (value) => `${value}deg`);
    const rotateY = useTransform(tiltY, (value) => `${value}deg`);

    const [eyeBurst, setEyeBurst] = useState(false);

    useEffect(() => {
      if (eyeGlowKey == null) return;
      setEyeBurst(true);
      const timeout = window.setTimeout(() => setEyeBurst(false), 1600);
      return () => window.clearTimeout(timeout);
    }, [eyeGlowKey]);

    const nodeStates = useMemo(() => {
      const base: Record<NodeId, boolean> = { 1: false, 2: false, 3: false };
      activatedNodes.forEach((node) => {
        const mapped = NODE_MAPPING[node];
        base[mapped] = true;
      });
      return base;
    }, [activatedNodes]);

    const eyesVisible = phase !== "idle";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative mx-auto flex h-[420px] w-[320px] max-w-full items-center justify-center",
          "transition-opacity duration-700"
        )}
        style={reducedMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: ghostVisible ? 1 : 0.08 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <svg
              viewBox="0 0 320 360"
              className={cn(
                "h-full w-full",
                ghostVisible ? "drop-shadow-[0_0_35px_rgba(80,237,255,0.25)]" : ""
              )}
              aria-hidden
            >
            <defs>
              <linearGradient id="ghost-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(80,237,255,0.55)" />
                <stop offset="45%" stopColor="rgba(58,112,255,0.55)" />
                <stop offset="100%" stopColor="rgba(90,119,255,0.45)" />
              </linearGradient>
              <radialGradient id="ghost-core" cx="50%" cy="45%" r="65%">
                <stop offset="0%" stopColor="rgba(80,237,255,0.4)" />
                <stop offset="75%" stopColor="rgba(10,20,40,0.05)" />
                <stop offset="100%" stopColor="rgba(5,5,10,0)" />
              </radialGradient>
            </defs>
            <motion.path
              d="M160 20c-70 0-120 48-120 124v82c0 42 18 80 46 102l28-32 28 44 28-44 28 32c28-22 46-60 46-102v-82c0-76-50-124-120-124z"
              fill="url(#ghost-gradient)"
              fillOpacity={ghostVisible ? 0.52 : 0}
              stroke={ghostVisible ? "rgba(80,237,255,0.65)" : "rgba(80,237,255,0)"}
              strokeWidth={ghostVisible ? 2.5 : 1.2}
              className={ghostVisible ? "animate-ghost-glow" : ""}
              style={{ filter: ghostVisible ? "drop-shadow(0 0 45px rgba(80, 237, 255, 0.25))" : undefined }}
            />
            <motion.circle cx={160} cy={170} r={92} fill="url(#ghost-core)" animate={{ opacity: ghostVisible ? 0.45 : 0 }} />
            {([1, 2, 3] as NodeId[]).map((node) => (
              <motion.circle
                key={node}
                cx={NODE_POSITIONS[node].cx}
                cy={NODE_POSITIONS[node].cy}
                r={ghostVisible ? 14 : 10}
                fill={nodeStates[node] ? "rgba(80,237,255,0.85)" : "rgba(90,119,255,0.2)"}
                stroke={nodeStates[node] ? "rgba(80,237,255,0.85)" : "rgba(90,119,255,0.35)"}
                strokeWidth={1.6}
                animate={{
                  scale: nodeStates[node] ? [1, 1.08, 1] : 1,
                  opacity: ghostVisible ? 1 : nodeStates[node] ? 0.6 : 0.25,
                }}
                transition={{ duration: 1.4, repeat: nodeStates[node] ? Infinity : 0, repeatDelay: 2.2 }}
              />
            ))}
          </svg>
        </motion.div>
        {eyesVisible && (
          <div className="absolute top-[46%] flex w-[180px] -translate-y-1/2 items-center justify-between">
            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                className="h-3 w-16 rounded-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: eyeBurst ? [0.2, 1, 0.45] : ghostVisible ? 0.65 : 0.25,
                  filter: eyeBurst
                    ? "drop-shadow(0 0 12px rgba(255,48,66,0.75))"
                    : ghostVisible
                    ? "drop-shadow(0 0 8px rgba(255,48,66,0.4))"
                    : "drop-shadow(0 0 4px rgba(255,48,66,0.3))",
                }}
                transition={{ duration: eyeBurst ? 1.4 : 2.4, ease: [0.45, 0, 0.2, 1], repeat: eyeBurst ? 0 : Infinity, repeatType: "mirror", repeatDelay: ghostVisible ? 3.4 : 0 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

Ghost.displayName = "Ghost";
