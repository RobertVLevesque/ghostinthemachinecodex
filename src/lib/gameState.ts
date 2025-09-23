import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GamePhase = "idle" | "glyphHovered" | "node1" | "node2" | "node3" | "ghostRevealed";
export type NodeId = 1 | 2 | 3;

/** Order the finite states */
const phaseOrder: Record<GamePhase, GamePhase | null> = {
  idle: "glyphHovered",
  glyphHovered: "node1",
  node1: "node2",
  node2: "node3",
  node3: "ghostRevealed",
  ghostRevealed: null,
};

let glyphAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

const clearGlyphTimer = () => {
  if (glyphAdvanceTimer) {
    clearTimeout(glyphAdvanceTimer);
    glyphAdvanceTimer = null;
  }
};

const scheduleGlyphAdvance = (
  getState: () => GameStore,
  setState: (partial: Partial<GameStore>) => void
) => {
  clearGlyphTimer();
  glyphAdvanceTimer = setTimeout(() => {
    const { phase } = getState();
    if (phase !== "glyphHovered") return;
    console.debug("[Ghost FSM] glyphHovered -> node1 (auto advance)");
    setState({ phase: "node1" });
    clearGlyphTimer();
  }, 1200)
