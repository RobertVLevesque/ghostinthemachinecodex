import { motion } from "framer-motion";
import type { GamePhase, NodeId } from "../lib/gameState";
import { Badge } from "./Badge";
import { cn } from "../lib/utils";

type HUDHintsProps = {
  phase: GamePhase;
  activatedNodes: NodeId[];
  ghostVisible: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

const phaseCopy: Record<GamePhase, string> = {
  idle: "standby",
  glyphHovered: "link established",
  node1: "node alpha engaged",
  node2: "node beta engaged",
  node3: "omega pending",
  ghostRevealed: "ghost online",
};

export const HUDHints = ({ phase, activatedNodes, ghostVisible, muted, onToggleMute }: HUDHintsProps) => {
  return (
    <motion.div
      className="pointer-events-auto fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2 text-[0.7rem] text-accent-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center gap-2">
        <Badge variant="ghost" className="uppercase tracking-[0.3em] text-[0.6rem]">
          status
        </Badge>
        <span className="text-accent-400/80">{phaseCopy[phase]}</span>
      </div>
      <div className="flex items-center gap-3 text-accent-400/90">
        <span>{activatedNodes.length}/3 nodes</span>
        <span className={cn("uppercase tracking-[0.3em]", ghostVisible ? "text-success" : "text-accent-500/70")}>{
          ghostVisible ? "ghost awake" : "ghost idle"
        }</span>
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        className={cn(
          "rounded-full border border-accent-500/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em]",
          "transition-colors hover:border-accent-400/60 hover:text-accent-200 focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          muted ? "text-accent-500/70" : "text-accent-200"
        )}
        aria-pressed={!muted}
        aria-label={muted ? "Unmute experience" : "Mute experience"}
      >
        {muted ? "audio muted" : "audio live"}
      </button>
    </motion.div>
  );
};
