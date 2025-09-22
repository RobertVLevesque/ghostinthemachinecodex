import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { EllipsisVertical, RefreshCcw } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Ghost } from "./components/Ghost";
import { CipherNode } from "./components/CipherNode";
import { TerminalOverlay } from "./components/TerminalOverlay";
import { HUDHints } from "./components/HUDHints";
import { PulseSweep, type PulsePayload } from "./components/PulseSweep";
import { useGameState, type GamePhase, type NodeId } from "./lib/gameState";
import { haptic, prefersReducedMotion } from "./lib/utils";
import { playSound, warmAudio } from "./lib/audio";

const NODES: NodeId[] = [1, 2, 3];

const NODE_POSITIONS: Record<NodeId, string> = {
  1: "absolute left-6 top-6 sm:left-10 sm:top-10 md:left-16 md:top-12 lg:left-20 lg:top-16",
  2: "absolute right-6 top-6 sm:right-10 sm:top-10 md:right-16 md:top-12 lg:right-20 lg:top-16",
  3: "absolute right-8 bottom-8 sm:right-12 sm:bottom-12 md:right-16 md:bottom-16 lg:right-24 lg:bottom-20",
};

const NODE_LABELS: Record<NodeId, string> = {
  1: "Activate triangle alpha",
  2: "Activate triangle beta",
  3: "Activate triangle omega",
};

const NODE_PHASE_VISIBILITY: Record<NodeId, GamePhase[]> = {
  1: ["node1", "node2", "node3", "ghostRevealed"],
  2: ["node2", "node3", "ghostRevealed"],
  3: ["node3", "ghostRevealed"],
};

const NODE_APPEAR_DELAYS: Record<NodeId, number> = {
  1: 0,
  2: 2000,
  3: 720,
};

const createMounted = (): Record<NodeId, boolean> => ({ 1: false, 2: false, 3: false });
const createMicro = (): Record<NodeId, number | null> => ({ 1: null, 2: null, 3: null });

const nextNodeForPhase = (phase: GamePhase): NodeId | null => {
  switch (phase) {
    case "glyphHovered":
    case "node1":
      return 1;
    case "node2":
      return 2;
    case "node3":
      return 3;
    default:
      return null;
  }
};

function App() {
  const {
    phase,
    activatedNodes,
    terminalVisible,
    ghostVisible,
    muted,
    hoverGlyph,
    activateNode,
    revealGhost,
    reset,
    setMuted,
  } = useGameState();

  const [mountedNodes, setMountedNodes] = useState(createMounted);
  const [microKeys, setMicroKeys] = useState(createMicro);
  const [pulse, setPulse] = useState<PulsePayload | null>(null);
  const [eyeGlowKey, setEyeGlowKey] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());
  const [debugMode, setDebugMode] = useState(false);

  const ghostRef = useRef<HTMLDivElement>(null);
  const nodeRefs = {
    1: useRef<HTMLButtonElement>(null),
    2: useRef<HTMLButtonElement>(null),
    3: useRef<HTMLButtonElement>(null),
  } satisfies Record<NodeId, MutableRefObject<HTMLButtonElement | null>>;

  const expectedNode = useMemo(() => nextNodeForPhase(phase), [phase]);
  const nodeActivationStatus = useMemo(
    () => ({
      1: activatedNodes.includes(1 as NodeId),
      2: activatedNodes.includes(2 as NodeId),
      3: activatedNodes.includes(3 as NodeId),
    }),
    [activatedNodes]
  );
  const node1Mounted = mountedNodes[1];
  const node2Mounted = mountedNodes[2];
  const node3Mounted = mountedNodes[3];
  const node1Activated = nodeActivationStatus[1];
  const node2Activated = nodeActivationStatus[2];
  const node3Activated = nodeActivationStatus[3];
  const mountedSummary = useMemo(
    () => NODES.map((node) => `${node}:${mountedNodes[node] ? "on" : "off"}`).join(" "),
    [mountedNodes]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const evaluate = () => {
      const params = new URLSearchParams(window.location.search);
      setDebugMode(params.get("debug") === "1");
    };
    evaluate();
    const handle = () => evaluate();
    window.addEventListener("popstate", handle);
    window.addEventListener("hashchange", handle);
    return () => {
      window.removeEventListener("popstate", handle);
      window.removeEventListener("hashchange", handle);
    };
  }, []);

  useEffect(() => {
    if (phase === "glyphHovered") {
      setEyeGlowKey(Date.now());
    }
  }, [phase]);

  useEffect(() => {
    if (node1Mounted) return;
    const phases = NODE_PHASE_VISIBILITY[1];
    if (!phases.includes(phase) && !node1Activated) return;
    const timer = setTimeout(() => {
      setMountedNodes((prev) => {
        if (prev[1]) return prev;
        void playSound("blip", muted);
        return { ...prev, 1: true };
      });
    }, NODE_APPEAR_DELAYS[1]);
    return () => clearTimeout(timer);
  }, [phase, node1Activated, muted, node1Mounted]);

  useEffect(() => {
    if (node2Mounted) return;
    const phases = NODE_PHASE_VISIBILITY[2];
    if (!phases.includes(phase) && !node2Activated) return;
    const timer = setTimeout(() => {
      setMountedNodes((prev) => {
        if (prev[2]) return prev;
        void playSound("blip", muted);
        return { ...prev, 2: true };
      });
    }, NODE_APPEAR_DELAYS[2]);
    return () => clearTimeout(timer);
  }, [phase, node2Activated, muted, node2Mounted]);

  useEffect(() => {
    if (node3Mounted) return;
    const phases = NODE_PHASE_VISIBILITY[3];
    if (!phases.includes(phase) && !node3Activated) return;
    const timer = setTimeout(() => {
      setMountedNodes((prev) => {
        if (prev[3]) return prev;
        void playSound("blip", muted);
        return { ...prev, 3: true };
      });
    }, NODE_APPEAR_DELAYS[3]);
    return () => clearTimeout(timer);
  }, [phase, node3Activated, muted, node3Mounted]);

  const triggerPulse = (node: NodeId) => {
    const ghostEl = ghostRef.current;
    const nodeEl = nodeRefs[node].current;
    if (!ghostEl || !nodeEl) return;
    const ghostRect = ghostEl.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const originY = ghostRect.top + ghostRect.height * 0.72;
    setPulse({
      id: Date.now(),
      from: { x: ghostRect.left + ghostRect.width / 2, y: originY },
      to: { x: nodeRect.left + nodeRect.width / 2, y: nodeRect.top + nodeRect.height / 2 },
    });
  };

  const handleNodeActivate = (node: NodeId) => {
    if (nodeActivationStatus[node]) return;
    const success = activateNode(node);
    if (!success) return;
    setMicroKeys((prev) => ({ ...prev, [node]: Date.now() }));
    triggerPulse(node);
    void playSound("surge", muted);
    if (!reducedMotion) {
      haptic(30);
    }
    if (node === 3) {
      window.setTimeout(() => {
        revealGhost();
      }, reducedMotion ? 100 : 1200);
    }
  };

  const handleGlyphInteract = () => {
    const activated = hoverGlyph();
    void warmAudio();
    if (activated) {
      setEyeGlowKey(Date.now());
      if (!reducedMotion) haptic(18);
    }
  };

  const handleReset = () => {
    reset();
    setMountedNodes(createMounted());
    setMicroKeys(createMicro());
    setPulse(null);
    setEyeGlowKey(null);
  };

  const toggleMute = () => setMuted(!muted);

  const glyphLabel = phase === "idle" ? "Reveal link glyph" : "Glyph link active";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(36,86,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,255,235,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,24,48,0.35)_0%,transparent_60%)]" />
      </div>

      <header className="pointer-events-auto absolute left-6 top-6 z-40 flex items-center gap-4">
        <button
          type="button"
          onMouseEnter={handleGlyphInteract}
          onFocus={handleGlyphInteract}
          onPointerDown={() => {
            void warmAudio();
          }}
          className="rounded-full border border-accent-500/40 px-3 py-1 text-[0.7rem] uppercase tracking-[0.4em] text-accent-200 transition-colors hover:border-accent-300 hover:text-accent-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label={glyphLabel}
        >
          RL
        </button>
      </header>

      <div className="pointer-events-auto absolute right-6 top-6 z-40">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-500/30 text-accent-200 transition-colors hover:border-accent-400/60 hover:text-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Open system menu"
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={10}
              className="w-48 rounded-xl border border-accent-500/30 bg-black/90 p-2 text-sm text-accent-100 shadow-[0_8px_24px_rgba(10,30,70,0.45)] backdrop-blur"
            >
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault();
                  handleReset();
                }}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent-500/10 focus:bg-accent-500/10 focus:outline-none"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Experience</span>
              </DropdownMenu.Item>
              <DropdownMenu.Arrow className="fill-accent-500/30" />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pb-24 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(42,79,132,0.12)_0%,transparent_35%,transparent_60%,rgba(58,112,255,0.08)_100%)]" />
        </div>

        <Ghost
          ref={ghostRef}
          activatedNodes={activatedNodes}
          ghostVisible={ghostVisible}
          phase={phase}
          eyeGlowKey={eyeGlowKey}
        />

        <PulseSweep pulse={pulse} onComplete={() => setPulse(null)} />

        <div className="absolute inset-0 z-40">
          {NODES.map((node) =>
            mountedNodes[node] ? (
              <CipherNode
                key={node}
                id={node}
                ref={nodeRefs[node]}
                activated={nodeActivationStatus[node]}
                disabled={nodeActivationStatus[node] || expectedNode !== node}
                onActivate={handleNodeActivate}
                label={NODE_LABELS[node]}
                microRevealKey={microKeys[node]}
                positionClasses={NODE_POSITIONS[node]}
              />
            ) : null
          )}
        </div>
      </main>

      <TerminalOverlay visible={terminalVisible} activatedNodes={activatedNodes} phase={phase} onReset={handleReset} />
      <HUDHints phase={phase} activatedNodes={activatedNodes} ghostVisible={ghostVisible} muted={muted} onToggleMute={toggleMute} />

      <div className="pointer-events-none absolute bottom-8 right-8 z-10 flex gap-3 opacity-70">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 rounded-full bg-accent-500/50" />
        ))}
      </div>

      {debugMode && (
        <div className="pointer-events-none fixed bottom-6 left-6 z-50 space-y-1 font-mono text-[0.7rem] uppercase text-accent-400/80">
          <p>phase: {phase}</p>
          <p>mounted: {mountedSummary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
