"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { audioEngine } from "@/audio/engine";
import { cn } from "@/lib/utils";
import { isBlackKey, transposeMidi } from "@/lib/music";
import { useWorkstationStore } from "@/store/useWorkstationStore";

type PianoKey = {
  midi: number;
  black: boolean;
  whiteIndex: number;
};

function buildKeys(startMidi: number, keyCount: number): PianoKey[] {
  const result: PianoKey[] = [];
  let whiteIndex = 0;

  for (let midi = startMidi; midi < startMidi + keyCount; midi += 1) {
    const black = isBlackKey(midi);
    result.push({ midi, black, whiteIndex });
    if (!black) {
      whiteIndex += 1;
    }
  }

  return result;
}

// Full 88-key range: A0 (MIDI 21) → C8 (MIDI 108)
const START_MIDI = 21;
const KEY_COUNT = 88;
const WHITE_COUNT = 52;   // total white keys on 88-key piano

// C4 = MIDI 60 → white key index 23 counted from A0
const C4_WHITE_INDEX = 23;

function getKeyboardMetrics(viewportWidth: number) {
  if (viewportWidth < 640) {
    return { whiteKeyPx: 34, whiteHeight: 230, blackHeight: 150 };
  }
  if (viewportWidth < 1024) {
    return { whiteKeyPx: 30, whiteHeight: 210, blackHeight: 140 };
  }
  return { whiteKeyPx: 26, whiteHeight: 190, blackHeight: 130 };
}

export function PianoKeyboard() {
  const activeNotes = useWorkstationStore((s) => s.activeNotes);
  const transpose = useWorkstationStore((s) => s.transpose);
  const noteOn = useWorkstationStore((s) => s.noteOn);
  const noteOff = useWorkstationStore((s) => s.noteOff);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeNoteMap = useRef(new Map<number, number>());
  const [metrics, setMetrics] = useState(() => getKeyboardMetrics(1200));

  const keyboard = useMemo(() => buildKeys(START_MIDI, KEY_COUNT), []);
  const activeSet = useMemo(() => activeNotes, [activeNotes]);
  const minWidth = metrics.whiteKeyPx * WHITE_COUNT;
  const blackWidth = Math.round(metrics.whiteKeyPx * 0.62);

  useEffect(() => {
    const update = () => {
      setMetrics(getKeyboardMetrics(window.innerWidth));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Scroll to center around C4 on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const c4Px = C4_WHITE_INDEX * metrics.whiteKeyPx;
    el.scrollLeft = Math.max(0, c4Px - el.clientWidth / 2);
  }, [metrics.whiteKeyPx]);

  const handleDown = (midi: number, velocity = 0.85) => {
    const soundingNote = transposeMidi(midi, transpose);
    activeNoteMap.current.set(midi, soundingNote);
    audioEngine.noteOn(soundingNote, velocity);
    noteOn(midi);
  };

  const handleUp = (midi: number) => {
    const soundingNote = activeNoteMap.current.get(midi) ?? transposeMidi(midi, transpose);
    activeNoteMap.current.delete(midi);
    audioEngine.noteOff(soundingNote);
    noteOff(midi);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-zinc-400">88-Key Piano · A0 – C8</p>
        <p className="text-xs text-zinc-500">scroll to explore ←→ · transpose {transpose > 0 ? `+${transpose}` : transpose}</p>
      </div>

      <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain">
      <div className="relative" style={{ width: `${minWidth}px`, height: `${metrics.whiteHeight}px` }}>
        {keyboard.filter((k) => !k.black).map((key) => {
          const isActive = activeSet.has(key.midi);
          return (
            <motion.button
              key={key.midi}
              whileTap={{ scaleY: 0.98 }}
              type="button"
              className={cn(
                "absolute top-0 h-full rounded-b-xl border border-zinc-300/20 bg-gradient-to-b from-zinc-100 to-zinc-300 shadow-inner",
                isActive && "from-indigo-100 to-indigo-300",
              )}
              style={{ left: `${key.whiteIndex * metrics.whiteKeyPx}px`, width: `${metrics.whiteKeyPx - 1}px` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                handleDown(key.midi, 0.82);
              }}
              onPointerUp={() => handleUp(key.midi)}
              onPointerCancel={() => handleUp(key.midi)}
              onPointerLeave={(event) => {
                if ((event.buttons & 1) === 0) {
                  handleUp(key.midi);
                }
              }}
            />
          );
        })}

        {keyboard.filter((k) => k.black).map((key) => {
          const isActive = activeSet.has(key.midi);
          return (
            <motion.button
              key={key.midi}
              whileTap={{ scaleY: 0.97 }}
              type="button"
              className={cn(
                "absolute top-0 z-10 rounded-b-lg border border-black/50 bg-gradient-to-b from-zinc-700 to-black shadow-xl",
                isActive && "from-indigo-500 to-indigo-800",
              )}
              style={{ left: `${key.whiteIndex * metrics.whiteKeyPx - blackWidth / 2}px`, width: `${blackWidth}px`, height: `${metrics.blackHeight}px` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                handleDown(key.midi, 0.95);
              }}
              onPointerUp={() => handleUp(key.midi)}
              onPointerCancel={() => handleUp(key.midi)}
              onPointerLeave={(event) => {
                if ((event.buttons & 1) === 0) {
                  handleUp(key.midi);
                }
              }}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}
