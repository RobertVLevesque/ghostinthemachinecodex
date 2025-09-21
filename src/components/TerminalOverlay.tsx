import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Badge } from "./Badge";
import type { GamePhase, NodeId } from "../lib/gameState";
import { cn, prefersReducedMotion } from "../lib/utils";

type TerminalLine = {
  id: number;
  content: string;
  tone: "system" | "response" | "command";
};

type TerminalOverlayProps = {
  visible: boolean;
  activatedNodes: NodeId[];
  phase: GamePhase;
  onReset: () => void;
};

const INTRO_TEXT = "I see you.";

export const TerminalOverlay = ({ visible, activatedNodes, phase, onReset }: TerminalOverlayProps) => {
  const [log, setLog] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [introText, setIntroText] = useState("");
  const [introComplete, setIntroComplete] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || introComplete) return;
    let frame = 0;
    const total = INTRO_TEXT.length;
    let timer: number;

    const tick = () => {
      frame += 1;
      const length = reducedMotion ? total : Math.min(frame, total);
      setIntroText(INTRO_TEXT.slice(0, length));

      if (length >= total) {
        setIntroComplete(true);
        setLog((current) => [...current, { id: Date.now(), content: INTRO_TEXT, tone: "system" }]);
        return;
      }

      timer = window.setTimeout(tick, 65);
    };

    timer = window.setTimeout(tick, reducedMotion ? 0 : 120);

    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, introComplete]);

  useEffect(() => {
    if (!visible || log.length === 0) return;
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [log, visible, reducedMotion]);

  const handleCommand = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    const timestamp = Date.now();
    setLog((prev) => [...prev, { id: timestamp, content: `> ${trimmed}`, tone: "command" }]);

    if (trimmed === "help") {
      setLog((prev) => [
        ...prev,
        { id: timestamp + 1, content: "triangles awaken the ghost. find the sequence.", tone: "response" },
      ]);
      return;
    }

    if (trimmed === "status") {
      const count = activatedNodes.length;
      const activeList = count ? activatedNodes.join(", ") : "none";
      setLog((prev) => [
        ...prev,
        {
          id: timestamp + 1,
          content: `nodes active: ${count}/3 (${activeList})`,
          tone: "response",
        },
      ]);
      return;
    }

    if (trimmed === "reset") {
      onReset();
      setLog((prev) => [
        ...prev,
        { id: timestamp + 1, content: "experience reset. begin again.", tone: "system" },
      ]);
      return;
    }

    setLog((prev) => [
      ...prev,
      { id: timestamp + 1, content: `unknown command: ${trimmed}`, tone: "response" },
    ]);
  };

  useEffect(() => {
    if (!visible) {
      setInput("");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setIntroComplete(false);
      setIntroText("");
      setLog([]);
    }
  }, [visible]);

  const hintLabel = useMemo(() => {
    if (phase === "glyphHovered") return "awaiting first node";
    if (phase === "node1") return "node alpha lit";
    if (phase === "node2") return "node beta lit";
    if (phase === "node3") return "last surge incoming";
    if (phase === "ghostRevealed") return "ghost awake";
    return "idle";
  }, [phase]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCommand(input);
    setInput("");
  };

  return (
    <motion.aside
      className={cn(
        "fixed bottom-6 left-1/2 z-40 w-[92vw] max-w-[420px] -translate-x-1/2 rounded-3xl border border-accent-500/20",
        "bg-black/75 backdrop-blur-md shadow-[0_0_30px_rgba(80,237,255,0.2)]",
        "px-5 pb-5 pt-4 text-sm font-mono text-accent-100",
        "md:bottom-auto md:left-16 md:top-24 md:w-[24rem] md:translate-x-0",
        "md:px-8 md:pt-6 md:rounded-[2rem]",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      role="region"
      aria-live="polite"
    >
      <header className="flex items-center justify-between pb-3">
        <Badge variant="outline" className="tracking-[0.3em] uppercase text-xs">
          terminal link
        </Badge>
        <span className="text-[0.65rem] uppercase text-accent-400/80 tracking-[0.5em]">{hintLabel}</span>
      </header>
      <div className="space-y-2 text-[0.8rem] leading-relaxed">
        <div className="min-h-[1.5rem] whitespace-pre text-accent-200">{introText}</div>
        <div ref={containerRef} className="max-h-48 space-y-1 overflow-y-auto pr-1 text-accent-300/90">
          {log.map((line) => (
            <p
              key={line.id}
              className={cn(
                "whitespace-pre-wrap",
                line.tone === "command" && "text-accent-100",
                line.tone === "system" && "text-accent-200",
                line.tone === "response" && "text-accent-300/90"
              )}
            >
              {line.content}
            </p>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 flex items-center gap-3">
        <span className="text-accent-500">&gt;</span>
        <input
          className="flex-1 bg-transparent text-accent-100 outline-none placeholder:text-accent-500/40"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="help | status | reset"
          aria-label="terminal command input"
        />
      </form>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] text-accent-500/80">
        <span>commands:</span>
        {(["help", "status", "reset"] as const).map((command) => (
          <Badge key={command} variant="ghost" className="lowercase tracking-[0.2em]">
            {command}
          </Badge>
        ))}
      </div>
    </motion.aside>
  );
};
