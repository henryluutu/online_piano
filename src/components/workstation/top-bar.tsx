"use client";

import { useRef } from "react";
import { Play, Square, Timer, WandSparkles } from "lucide-react";
import { audioEngine } from "@/audio/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { STYLES, VOICES, useWorkstationStore, type Variation } from "@/store/useWorkstationStore";

const VARIATIONS: Variation[] = ["A", "B", "C", "D"];

export function TopBar() {
  const tapHistory = useRef<number[]>([]);
  const voice = useWorkstationStore((s) => s.voice);
  const tempo = useWorkstationStore((s) => s.tempo);
  const midiDeviceName = useWorkstationStore((s) => s.midiDeviceName);
  const midiChannel = useWorkstationStore((s) => s.midiChannel);
  const style = useWorkstationStore((s) => s.style);
  const variation = useWorkstationStore((s) => s.variation);
  const isPlaying = useWorkstationStore((s) => s.isPlaying);
  const isMetronomeOn = useWorkstationStore((s) => s.isMetronomeOn);
  const syncStart = useWorkstationStore((s) => s.syncStart);
  const reverb = useWorkstationStore((s) => s.reverb);
  const chorus = useWorkstationStore((s) => s.chorus);
  const delay = useWorkstationStore((s) => s.delay);
  const eqLow = useWorkstationStore((s) => s.eqLow);
  const eqMid = useWorkstationStore((s) => s.eqMid);
  const eqHigh = useWorkstationStore((s) => s.eqHigh);

  const setVoice = useWorkstationStore((s) => s.setVoice);
  const setTempo = useWorkstationStore((s) => s.setTempo);
  const setMidiChannel = useWorkstationStore((s) => s.setMidiChannel);
  const setStyle = useWorkstationStore((s) => s.setStyle);
  const setVariation = useWorkstationStore((s) => s.setVariation);
  const setIsPlaying = useWorkstationStore((s) => s.setIsPlaying);
  const setMetronome = useWorkstationStore((s) => s.setMetronome);
  const setSyncStart = useWorkstationStore((s) => s.setSyncStart);
  const setReverb = useWorkstationStore((s) => s.setReverb);
  const setChorus = useWorkstationStore((s) => s.setChorus);
  const setDelay = useWorkstationStore((s) => s.setDelay);
  const setEqLow = useWorkstationStore((s) => s.setEqLow);
  const setEqMid = useWorkstationStore((s) => s.setEqMid);
  const setEqHigh = useWorkstationStore((s) => s.setEqHigh);

  const toggleStartStop = async () => {
    if (isPlaying) {
      audioEngine.stopAccompaniment();
      setIsPlaying(false);
      return;
    }
    await audioEngine.startAccompaniment();
    setIsPlaying(true);
  };

  const onTapTempo = () => {
    const now = performance.now();
    tapHistory.current = [...tapHistory.current, now].slice(-5);

    if (tapHistory.current.length >= 2) {
      const gaps = tapHistory.current.slice(1).map((t, i) => t - tapHistory.current[i]);
      const avg = gaps.reduce((acc, cur) => acc + cur, 0) / gaps.length;
      const bpm = Math.round(60000 / avg);
      const nextTempo = Math.min(200, Math.max(40, bpm));
      setTempo(nextTempo);
      audioEngine.setTempo(nextTempo);
    }

    void audioEngine.tapTempo();
  };

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <div className="grid gap-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <Select
          value={voice}
          onValueChange={(value) => {
            setVoice(value as (typeof VOICES)[number]["id"]);
            audioEngine.setVoice(value as (typeof VOICES)[number]["id"]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Voice" />
          </SelectTrigger>
          <SelectContent>
            {VOICES.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="rounded-xl border border-white/10 px-3 py-2">
          <div className="mb-1 flex justify-between text-xs text-zinc-300">
            <span>Tempo</span>
            <span>{tempo} BPM</span>
          </div>
          <Slider
            value={[tempo]}
            min={40}
            max={200}
            step={1}
            onValueChange={(val) => {
              const next = val[0] ?? 120;
              setTempo(next);
              audioEngine.setTempo(next);
            }}
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5">
          <Badge className="max-w-[180px] truncate">{midiDeviceName}</Badge>
          <Select value={String(midiChannel)} onValueChange={(v) => setMidiChannel(Number(v))}>
            <SelectTrigger className="w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                <SelectItem key={ch} value={String(ch)}>
                  Ch {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant={isPlaying ? "destructive" : "default"} onClick={toggleStartStop}>
            {isPlaying ? <Square className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
            {isPlaying ? "Stop" : "Start"}
          </Button>
          <Button variant="secondary" onClick={onTapTempo}>
            <Timer className="mr-2 size-4" />
            Tap
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <details className="rounded-xl border border-white/10 bg-white/5 p-2">
          <summary className="cursor-pointer text-sm font-medium text-zinc-100">Style & Arranger</summary>
          <div className="mt-2 space-y-2">
            <Select
              value={style}
              onValueChange={(value) => {
                setStyle(value as (typeof STYLES)[number]["id"]);
                audioEngine.setStyle(value as (typeof STYLES)[number]["id"]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-4 gap-1.5">
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
                  {v}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => audioEngine.triggerFill()}>
                <WandSparkles className="mr-1 size-3.5" />Fill
              </Button>
              <Button size="sm" variant="secondary" onClick={() => audioEngine.triggerFill()}>
                Intro
              </Button>
              <Button size="sm" variant="secondary" onClick={() => audioEngine.stopAccompaniment()}>
                Ending
              </Button>
            </div>
          </div>
        </details>

        <details className="rounded-xl border border-white/10 bg-white/5 p-2">
          <summary className="cursor-pointer text-sm font-medium text-zinc-100">FX</summary>
          <div className="mt-2 space-y-2">
            <div className="text-xs text-zinc-300">Reverb {reverb.toFixed(2)}</div>
            <Slider value={[reverb]} min={0} max={1} step={0.01} onValueChange={(v) => {
              const value = v[0] ?? reverb;
              setReverb(value);
              audioEngine.setReverb(value);
            }} />
            <div className="text-xs text-zinc-300">Chorus {chorus.toFixed(2)}</div>
            <Slider value={[chorus]} min={0} max={1} step={0.01} onValueChange={(v) => {
              const value = v[0] ?? chorus;
              setChorus(value);
              audioEngine.setChorus(value);
            }} />
            <div className="text-xs text-zinc-300">Delay {delay.toFixed(2)}</div>
            <Slider value={[delay]} min={0} max={1} step={0.01} onValueChange={(v) => {
              const value = v[0] ?? delay;
              setDelay(value);
              audioEngine.setDelay(value);
            }} />
          </div>
        </details>

        <details className="rounded-xl border border-white/10 bg-white/5 p-2" open>
          <summary className="cursor-pointer text-sm font-medium text-zinc-100">Mix & Toggles</summary>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <label className="flex items-center gap-2">
                <Switch
                  checked={syncStart}
                  onCheckedChange={(value) => {
                    setSyncStart(value);
                  }}
                />
                Sync
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={isMetronomeOn}
                  onCheckedChange={(value) => {
                    setMetronome(value);
                    audioEngine.setMetronome(value);
                  }}
                />
                Metronome
              </label>
            </div>
            <div className="text-xs text-zinc-300">EQ Low {eqLow.toFixed(1)}</div>
            <Slider value={[eqLow]} min={-12} max={12} step={0.5} onValueChange={(v) => {
              const value = v[0] ?? eqLow;
              setEqLow(value);
              audioEngine.setEq(value, eqMid, eqHigh);
            }} />
            <div className="text-xs text-zinc-300">EQ Mid {eqMid.toFixed(1)}</div>
            <Slider value={[eqMid]} min={-12} max={12} step={0.5} onValueChange={(v) => {
              const value = v[0] ?? eqMid;
              setEqMid(value);
              audioEngine.setEq(eqLow, value, eqHigh);
            }} />
            <div className="text-xs text-zinc-300">EQ High {eqHigh.toFixed(1)}</div>
            <Slider value={[eqHigh]} min={-12} max={12} step={0.5} onValueChange={(v) => {
              const value = v[0] ?? eqHigh;
              setEqHigh(value);
              audioEngine.setEq(eqLow, eqMid, value);
            }} />
          </div>
        </details>
      </div>
    </div>
  );
}
