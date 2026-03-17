"use client";

import { Play, Square, WandSparkles } from "lucide-react";
import { audioEngine } from "@/audio/engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, useWorkstationStore, type Variation } from "@/store/useWorkstationStore";

const VARIATIONS: Variation[] = ["A", "B", "C", "D"];

export function StylesPanel() {
  const style = useWorkstationStore((s) => s.style);
  const variation = useWorkstationStore((s) => s.variation);
  const isPlaying = useWorkstationStore((s) => s.isPlaying);

  const setStyle = useWorkstationStore((s) => s.setStyle);
  const setVariation = useWorkstationStore((s) => s.setVariation);
  const setIsPlaying = useWorkstationStore((s) => s.setIsPlaying);

  const toggleStartStop = async () => {
    if (isPlaying) {
      audioEngine.stopAccompaniment();
      setIsPlaying(false);
      return;
    }
    await audioEngine.startAccompaniment();
    setIsPlaying(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Styles / Beats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={style}
          onValueChange={(value) => {
            setStyle(value as (typeof STYLES)[number]["id"]);
            audioEngine.setStyle(value as (typeof STYLES)[number]["id"]);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Button variant={isPlaying ? "destructive" : "default"} onClick={toggleStartStop}>
            {isPlaying ? <Square className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
            {isPlaying ? "Stop" : "Start"}
          </Button>
          <Button variant="secondary" onClick={() => audioEngine.triggerFill()}>
            <WandSparkles className="mr-2 size-4" />
            Fill
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
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
      </CardContent>
    </Card>
  );
}
