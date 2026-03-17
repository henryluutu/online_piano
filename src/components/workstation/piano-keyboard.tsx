"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { audioEngine } from "@/audio/engine";
import { cn } from "@/lib/utils";
import { isBlackKey } from "@/lib/music";
import { Button } from "@/components/ui/button";
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

const START_MIDI = 36;
const KEY_COUNT = 61;

export function PianoKeyboard() {
  const activeNotes = useWorkstationStore((s) => s.activeNotes);
  const octaveShift = useWorkstationStore((s) => s.octaveShift);
  const setOctaveShift = useWorkstationStore((s) => s.setOctaveShift);
  const noteOn = useWorkstationStore((s) => s.noteOn);
  const noteOff = useWorkstationStore((s) => s.noteOff);

  const keyboard = useMemo(() => buildKeys(START_MIDI + octaveShift * 12, KEY_COUNT), [octaveShift]);
  const whiteCount = useMemo(() => keyboard.filter((k) => !k.black).length, [keyboard]);
  const whiteWidth = 100 / whiteCount;
  const blackWidth = whiteWidth * 0.62;
  const activeSet = useMemo(() => activeNotes, [activeNotes]);

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
        <p className="text-xs uppercase tracking-wider text-zinc-400">61-Key Manual (Octave Shift)</p>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOctaveShift(Math.max(-2, octaveShift - 1))}
          >
            Oct-
          </Button>
          <span className="w-12 text-center text-xs text-zinc-300">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOctaveShift(Math.min(2, octaveShift + 1))}
          >
            Oct+
          </Button>
        </div>
      </div>

      <div className="relative h-[190px] w-full">
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
              style={{ left: `${key.whiteIndex * whiteWidth}%`, width: `${whiteWidth}%` }}
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
              style={{ left: `${key.whiteIndex * whiteWidth - blackWidth / 2}%`, width: `${blackWidth}%` }}
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
  );
}
