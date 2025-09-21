import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GamePhase = "idle" | "glyphHovered" | "node1" | "node2" | "node3" | "ghostRevealed";
export type NodeId = 1 | 2 | 3;

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
  }, 1200);
};

const logTransition = (from: GamePhase, to: GamePhase, reason: string) => {
  if (from === to) return;
  console.debug(`[Ghost FSM] ${from} -> ${to} (${reason})`);
};

type BaseState = {
  phase: GamePhase;
  activatedNodes: NodeId[];
  terminalVisible: boolean;
  ghostVisible: boolean;
  lastActivation: NodeId | null;
  muted: boolean;
};

export const initialState: BaseState = {
  phase: "idle",
  activatedNodes: [],
  terminalVisible: false,
  ghostVisible: false,
  lastActivation: null,
  muted: false,
};

type GameStore = BaseState & {
  hoverGlyph: () => boolean;
  activateNode: (node: NodeId) => boolean;
  revealGhost: () => boolean;
  reset: () => void;
  setMuted: (muted: boolean) => void;
};

type PersistedState = Pick<BaseState, "phase" | "activatedNodes" | "terminalVisible" | "ghostVisible" | "muted">;

const expectedNodeForPhase: Record<GamePhase, NodeId | null> = {
  idle: null,
  glyphHovered: 1,
  node1: 1,
  node2: 2,
  node3: 3,
  node1: 2,
  node2: 3,
  node3: null,
  ghostRevealed: null,
};

export const useGameState = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      hoverGlyph: () => {
        const { phase } = get();
        if (phase !== "idle") return false;
        logTransition(phase, "glyphHovered", "glyph hover");
        set({ phase: "glyphHovered", terminalVisible: true, lastActivation: null });
        scheduleGlyphAdvance(get, (partial) => set(partial));
        set({ phase: "glyphHovered", terminalVisible: true, lastActivation: null });
        return true;
      },
      activateNode: (node) => {
        const { phase, activatedNodes } = get();
        const expected = expectedNodeForPhase[phase];
        if (expected !== node) return false;
        if (activatedNodes.includes(node)) return false;

        if (phase === "glyphHovered") {
          clearGlyphTimer();
        }

        const nextPhase = phaseOrder[phase];
        const patch: Partial<BaseState> = {
          activatedNodes: [...activatedNodes, node],
          lastActivation: node,
        };
        const shouldAdvancePhase =
          nextPhase && !(phase === "node3" && node === 3);
        if (shouldAdvancePhase) {
          logTransition(phase, nextPhase as GamePhase, `activate node ${node}`);
          set({ ...patch, phase: nextPhase as GamePhase });
        } else {
          if (phase === "node3" && node === 3) {
            console.debug("[Ghost FSM] node3 -> node3 (final node armed)");
          }
          set(patch);
        }
        const nextPhase = phaseOrder[phase];
        set({
          phase: (nextPhase ?? phase) as GamePhase,
          activatedNodes: [...activatedNodes, node],
          lastActivation: node,
        });
        return true;
      },
      revealGhost: () => {
        const { phase, ghostVisible } = get();
        if (ghostVisible) return false;
        if (phase !== "node3" && phase !== "ghostRevealed") return false;
        logTransition(phase, "ghostRevealed", "reveal ghost");
        if (phase !== "node3" || ghostVisible) return false;
        set({ phase: "ghostRevealed", ghostVisible: true });
        return true;
      },
      reset: () => {
        clearGlyphTimer();
        logTransition(get().phase, "idle", "reset");
        set({ ...initialState });
      },
      setMuted: (muted) => set({ muted }),
    }),
    {
      name: "ghost-machine-state",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage<PersistedState>(() => window.localStorage)
          : undefined,
      partialize: (state) => ({
        phase: state.phase,
        activatedNodes: state.activatedNodes,
        terminalVisible: state.terminalVisible,
        ghostVisible: state.ghostVisible,
        muted: state.muted,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.phase === "ghostRevealed") {
          state.ghostVisible = true;
        }
        if (state.phase === "glyphHovered") {
          scheduleGlyphAdvance(useGameState.getState, (partial) => useGameState.setState(partial));
        }
      },
    }
  )
);

export const getNodeStatus = (node: NodeId, activated: NodeId[]): "locked" | "armed" | "activated" => {
  if (activated.includes(node)) return "activated";
  return "armed";
};

export const hasCompletedSequence = (activatedNodes: NodeId[]) => activatedNodes.length === 3;
