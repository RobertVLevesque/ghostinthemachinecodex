import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useState, type ReactElement } from "react";
import { CircuitBoard, Sparkles, Waves } from "lucide-react";
import type { NodeId } from "../lib/gameState";
import { cn, prefersReducedMotion } from "../lib/utils";

const SIGILS: Record<NodeId, ReactElement> = {
  1: <CircuitBoard className="h-5 w-5" strokeWidth={1.5} />,
  2: <Waves className="h-5 w-5" strokeWidth={1.5} />,
  3: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
};

type CipherNodeProps = {
  id: NodeId;
  visible: boolean;
  activated: boolean;
  disabled?: boolean;
  onActivate: (id: NodeId) => void;
  label: string;
  microRevealKey: number | null;
  positionClasses: string;
};

export const CipherNode = forwardRef<HTMLButtonElement, CipherNodeProps>(
  ({ id, activated, disabled, onActivate, label, microRevealKey, positionClasses }, ref) => {
  ({ id, visible, activated, disabled, onActivate, label, microRevealKey, positionClasses }, ref) => {
    const reducedMotion = prefersReducedMotion();
    const [reveal, setReveal] = useState(false);

    useEffect(() => {
      if (microRevealKey == null) return;
      setReveal(true);
      const timeout = window.setTimeout(() => setReveal(false), 700);
      return () => window.clearTimeout(timeout);
    }, [microRevealKey]);

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          "group relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32",
          "pointer-events-auto opacity-100 z-40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          positionClasses
        )}
        aria-label={label}
        disabled={disabled}
          "group relative flex h-32 w-32 items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "transition-opacity duration-500",
          positionClasses,
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={label}
        disabled={disabled || !visible}
        onClick={() => onActivate(id)}
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      >
        <div
          className={cn(
            "relative h-full w-full", 
            "overflow-hidden rounded-none", 
            "[clip-path:polygon(50%_-8%,0%_100%,100%_100%)]"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 border border-accent-500/50",
              "bg-accent-500/5 backdrop-blur-sm",
              activated ? "shadow-[0_0_25px_rgba(80,237,255,0.35)]" : "shadow-[0_0_12px_rgba(80,237,255,0.15)]",
              "transition-all duration-500"
            )}
          />
          <div
            className={cn(
              "absolute inset-[14%] border border-accent-400/30",
              activated ? "bg-accent-500/20" : "bg-black/60"
            )}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: activated ? 0.6 : 0.15 }}
            transition={{ duration: 0.5, ease: [0.45, 0, 0.2, 1] }}
            style={{ background: "radial-gradient(circle at 50% 25%, rgba(80,237,255,0.35), transparent 70%)" }}
          />
          <AnimatePresence>
            {reveal && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-accent-100"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {SIGILS[id]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: activated ? 0.4 : 0.12 }}
          transition={{ duration: 0.4, ease: [0.45, 0, 0.2, 1] }}
          style={{
            background:
              "radial-gradient(circle at 50% 85%, rgba(58,112,255,0.4) 0%, rgba(58,112,255,0) 70%)",
          }}
        />
      </motion.button>
    );
  }
);

CipherNode.displayName = "CipherNode";
