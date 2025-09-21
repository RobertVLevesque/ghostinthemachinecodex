import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameState, hasCompletedSequence } from "../gameState";

const resetStore = () => {
  useGameState.getState().reset();
};

describe("gameState machine", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    resetStore();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
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

  it("auto advances to node1 within 1.5s of glyph hover", () => {
    vi.useFakeTimers();
    const store = useGameState.getState();
    expect(store.hoverGlyph()).toBe(true);
    expect(useGameState.getState().phase).toBe("glyphHovered");
    vi.advanceTimersByTime(1400);
    expect(useGameState.getState().phase).toBe("node1");
  });

  it("requires node activation in order", () => {
    vi.useFakeTimers();
    const store = useGameState.getState();
    store.hoverGlyph();
    vi.advanceTimersByTime(1300);

    expect(store.activateNode(2)).toBe(false);
    expect(store.activateNode(1)).toBe(true);
    expect(useGameState.getState().phase).toBe("node2");

    expect(store.activateNode(1)).toBe(false);
    expect(store.activateNode(3)).toBe(false);
    expect(store.activateNode(2)).toBe(true);
    expect(useGameState.getState().phase).toBe("node3");

    expect(store.activateNode(3)).toBe(true);
    expect(useGameState.getState().phase).toBe("node3");
  });

  it("reveals ghost after final node", () => {
    vi.useFakeTimers();
    const store = useGameState.getState();
    store.hoverGlyph();
    vi.advanceTimersByTime(1300);
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
    vi.useFakeTimers();
    const store = useGameState.getState();
    store.hoverGlyph();
    vi.advanceTimersByTime(1300);
    store.activateNode(1);
    store.reset();
    const resetState = useGameState.getState();
    expect(resetState.phase).toBe("idle");
    expect(resetState.activatedNodes).toEqual([]);
    expect(resetState.terminalVisible).toBe(false);
  });

  it("can toggle mute flag", () => {
    const store = useGameState.getState();
    expect(store.muted).toBe(false);
    store.setMuted(true);
    expect(useGameState.getState().muted).toBe(true);
  });
});
