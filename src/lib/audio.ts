import { prefersReducedMotion } from "./utils";

export type SoundName = "blip" | "surge";

type SoundShape = {
  frequency: number;
  duration: number;
  type: OscillatorType;
  attack: number;
  release: number;
  gain: number;
};

const SOUND_MAP: Record<SoundName, SoundShape> = {
  blip: { frequency: 680, duration: 0.18, type: "triangle", attack: 0.01, release: 0.12, gain: 0.25 },
  surge: { frequency: 160, duration: 0.42, type: "sawtooth", attack: 0.02, release: 0.3, gain: 0.35 },
};

let audioContext: AudioContext | null = null;

const ensureContext = async () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
};

export const playSound = async (name: SoundName, muted: boolean) => {
  if (muted || prefersReducedMotion()) return;
  const context = await ensureContext();
  if (!context) return;

  const now = context.currentTime;
  const { frequency, duration, type, attack, release, gain } = SOUND_MAP[name];

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const attackEnd = now + attack;
  const releaseStart = now + duration;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gain, attackEnd);
  gainNode.gain.setValueAtTime(gain * 0.85, releaseStart);
  gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + release);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(releaseStart + release + 0.01);
};

export const warmAudio = () => ensureContext();
