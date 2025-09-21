import { beforeEach, describe, expect, it } from "vitest";
import { initialState, useGameState, type NodeId, hasCompletedSequence } from "../gameState";

const resetStore = () => {
  useGameState.setState({
    ...initialState,
    activatedNodes: [...initialState.activatedNodes],
    lastActivation: null,
  });
};

describe("gameState machine", () => {
  beforeEach(() => {
    resetStore();
  });

  it("starts idle", () => {
    const state = useGameState.getState();
    expect(state.phase).toBe("idle");
    expect(state.terminalVisible).toBe(false);
    expect(state.ghostVisible).toBe(false);
  });

  it("activates glyph hover once", () => {
    const state = useGameState.getState();
    expect(state.hoverGlyph()).toBe(true);
    const after = useGameState.getState();
    expect(after.phase).toBe("glyphHovered");
    expect(after.terminalVisible).toBe(true);
    expect(after.hoverGlyph()).toBe(false);
  });

  it("requires node activation in order", () => {
    const store = useGameState.getState();
    store.hoverGlyph();

    // cannot skip node 1
    expect(store.activateNode(2)).toBe(false);
    expect(store.activateNode(1)).toBe(true);
    expect(useGameState.getState().phase).toBe("node1");

    // cannot repeat node 1
    expect(store.activateNode(1)).toBe(false);
    expect(store.activateNode(2)).toBe(true);
    expect(useGameState.getState().phase).toBe("node2");

    expect(store.activateNode(3)).toBe(true);
    expect(useGameState.getState().phase).toBe("node3");
  });

  it("reveals ghost after final node", () => {
    const store = useGameState.getState();
    store.hoverGlyph();
    store.activateNode(1);
    store.activateNode(2);
    store.activateNode(3);
    expect(hasCompletedSequence(useGameState.getState().activatedNodes)).toBe(true);
    expect(store.revealGhost()).toBe(true);
    const next = useGameState.getState();
    expect(next.phase).toBe("ghostRevealed");
    expect(next.ghostVisible).toBe(true);
  });

  it("reset returns to initial state", () => {
    const store = useGameState.getState();
    store.hoverGlyph();
    store.activateNode(1);
    store.reset();
    const resetState = useGameState.getState();
    expect(resetState.phase).toBe("idle");
    expect(resetState.activatedNodes).toEqual<NodeId[]>([]);
    expect(resetState.terminalVisible).toBe(false);
  });

  it("can toggle mute flag", () => {
    const store = useGameState.getState();
    expect(store.muted).toBe(false);
    store.setMuted(true);
    expect(useGameState.getState().muted).toBe(true);
  });
});
