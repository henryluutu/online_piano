"use client";

import { audioEngine } from "@/audio/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useWorkstationStore } from "@/store/useWorkstationStore";

function EffectRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-300">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

export function EffectsPanel() {
  const reverb = useWorkstationStore((s) => s.reverb);
  const chorus = useWorkstationStore((s) => s.chorus);
  const delay = useWorkstationStore((s) => s.delay);
  const eqLow = useWorkstationStore((s) => s.eqLow);
  const eqMid = useWorkstationStore((s) => s.eqMid);
  const eqHigh = useWorkstationStore((s) => s.eqHigh);

  const setReverb = useWorkstationStore((s) => s.setReverb);
  const setChorus = useWorkstationStore((s) => s.setChorus);
  const setDelay = useWorkstationStore((s) => s.setDelay);
  const setEqLow = useWorkstationStore((s) => s.setEqLow);
  const setEqMid = useWorkstationStore((s) => s.setEqMid);
  const setEqHigh = useWorkstationStore((s) => s.setEqHigh);

  const applyEq = (low: number, mid: number, high: number) => {
    audioEngine.setEq(low, mid, high);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Effects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <EffectRow
          label="Reverb"
          value={reverb}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => {
            setReverb(value);
            audioEngine.setReverb(value);
          }}
        />
        <EffectRow
          label="Chorus"
          value={chorus}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => {
            setChorus(value);
            audioEngine.setChorus(value);
          }}
        />
        <EffectRow
          label="Delay"
          value={delay}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => {
            setDelay(value);
            audioEngine.setDelay(value);
          }}
        />

        <div className="h-px bg-white/10" />

        <EffectRow
          label="EQ Low"
          value={eqLow}
          min={-12}
          max={12}
          step={0.5}
          onChange={(value) => {
            setEqLow(value);
            applyEq(value, eqMid, eqHigh);
          }}
        />
        <EffectRow
          label="EQ Mid"
          value={eqMid}
          min={-12}
          max={12}
          step={0.5}
          onChange={(value) => {
            setEqMid(value);
            applyEq(eqLow, value, eqHigh);
          }}
        />
        <EffectRow
          label="EQ High"
          value={eqHigh}
          min={-12}
          max={12}
          step={0.5}
          onChange={(value) => {
            setEqHigh(value);
            applyEq(eqLow, eqMid, value);
          }}
        />
      </CardContent>
    </Card>
  );
}
