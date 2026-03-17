"use client";

import { Play, Square } from "lucide-react";
import { audioEngine } from "@/audio/engine";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useWorkstationStore, type Variation } from "@/store/useWorkstationStore";

const VARIATIONS: Variation[] = ["A", "B", "C", "D"];

export function ArrangerControls() {
  const isPlaying = useWorkstationStore((s) => s.isPlaying);
  const variation = useWorkstationStore((s) => s.variation);
  const isMetronomeOn = useWorkstationStore((s) => s.isMetronomeOn);
  const syncStart = useWorkstationStore((s) => s.syncStart);

  const setVariation = useWorkstationStore((s) => s.setVariation);
  const setIsPlaying = useWorkstationStore((s) => s.setIsPlaying);
  const setMetronome = useWorkstationStore((s) => s.setMetronome);
  const setSyncStart = useWorkstationStore((s) => s.setSyncStart);

  const togglePlayback = async () => {
    if (isPlaying) {
      audioEngine.stopAccompaniment();
      setIsPlaying(false);
      return;
    }

    await audioEngine.startAccompaniment();
    setIsPlaying(true);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button onClick={togglePlayback}>
          {isPlaying ? <Square className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
          {isPlaying ? "Stop" : "Start"}
        </Button>
        <Button variant="secondary" onClick={() => audioEngine.triggerFill()}>
          Fill
        </Button>
        <Button variant="secondary" onClick={() => audioEngine.triggerFill()}>
          Intro
        </Button>
        <Button variant="secondary" onClick={() => audioEngine.stopAccompaniment()}>
          Ending
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[auto_auto_1fr] md:items-center">
        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <Switch
            checked={syncStart}
            onCheckedChange={(value) => {
              setSyncStart(value);
            }}
          />
          Sync Start
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-200">
          <Switch
            checked={isMetronomeOn}
            onCheckedChange={(value) => {
              setMetronome(value);
              audioEngine.setMetronome(value);
            }}
          />
          Metronome
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {VARIATIONS.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={variation === v ? "default" : "secondary"}
              onClick={() => {
                setVariation(v);
                audioEngine.setVariation(v);
              }}
            >
              Variation {v}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
