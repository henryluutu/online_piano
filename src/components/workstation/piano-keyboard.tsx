"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { audioEngine } from "@/audio/engine";
import { cn } from "@/lib/utils";
import { isBlackKey } from "@/lib/music";
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
const WHITE_KEY_PX = 26;  // px per white key
const WHITE_COUNT = 52;   // total white keys on 88-key piano
const MIN_WIDTH = WHITE_KEY_PX * WHITE_COUNT; // 1352px
const BLACK_WIDTH = Math.round(WHITE_KEY_PX * 0.62);

// C4 = MIDI 60 → white key index 23 counted from A0
const C4_WHITE_INDEX = 23;

export function PianoKeyboard() {
  const activeNotes = useWorkstationStore((s) => s.activeNotes);
  const noteOn = useWorkstationStore((s) => s.noteOn);
  const noteOff = useWorkstationStore((s) => s.noteOff);
  const scrollRef = useRef<HTMLDivElement>(null);

  const keyboard = useMemo(() => buildKeys(START_MIDI, KEY_COUNT), []);
  const activeSet = useMemo(() => activeNotes, [activeNotes]);

  // Scroll to center around C4 on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const c4Px = C4_WHITE_INDEX * WHITE_KEY_PX;
    el.scrollLeft = Math.max(0, c4Px - el.clientWidth / 2);
  }, []);

  const handleDown = (midi: number, velocity = 0.85) => {
    audioEngine.noteOn(midi, velocity);
    noteOn(midi);
  };

  const handleUp = (midi: number) => {
    audioEngine.noteOff(midi);
    noteOff(midi);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-zinc-400">88-Key Piano · A0 – C8</p>
        <p className="text-xs text-zinc-500">scroll to explore ←→</p>
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
      <div className="relative h-[190px]" style={{ width: `${MIN_WIDTH}px` }}>
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
              style={{ left: `${key.whiteIndex * WHITE_KEY_PX}px`, width: `${WHITE_KEY_PX - 1}px` }}
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
                "absolute top-0 z-10 h-[130px] rounded-b-lg border border-black/50 bg-gradient-to-b from-zinc-700 to-black shadow-xl",
                isActive && "from-indigo-500 to-indigo-800",
              )}
              style={{ left: `${key.whiteIndex * WHITE_KEY_PX - BLACK_WIDTH / 2}px`, width: `${BLACK_WIDTH}px` }}
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
