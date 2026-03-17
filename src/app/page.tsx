"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { audioEngine } from "@/audio/engine";
import { AdsenseSlot } from "@/components/ads/adsense-slot";
import { PianoKeyboard } from "@/components/workstation/piano-keyboard";
import { TopBar } from "@/components/workstation/top-bar";
import { useMidiInput } from "@/hooks/useMidiInput";
import { useWorkstationStore } from "@/store/useWorkstationStore";

export default function Home() {
  useMidiInput();

  const tempo = useWorkstationStore((s) => s.tempo);
  const voice = useWorkstationStore((s) => s.voice);
  const style = useWorkstationStore((s) => s.style);
  const variation = useWorkstationStore((s) => s.variation);
  const reverb = useWorkstationStore((s) => s.reverb);
  const chorus = useWorkstationStore((s) => s.chorus);
  const delay = useWorkstationStore((s) => s.delay);
  const eqLow = useWorkstationStore((s) => s.eqLow);
  const eqMid = useWorkstationStore((s) => s.eqMid);
  const eqHigh = useWorkstationStore((s) => s.eqHigh);

  useEffect(() => {
    audioEngine.setTempo(tempo);
  }, [tempo]);

  useEffect(() => {
    audioEngine.setVoice(voice);
  }, [voice]);

  useEffect(() => {
    audioEngine.setStyle(style);
  }, [style]);

  useEffect(() => {
    audioEngine.setVariation(variation);
  }, [variation]);

  useEffect(() => {
    audioEngine.setReverb(reverb);
  }, [reverb]);

  useEffect(() => {
    audioEngine.setChorus(chorus);
  }, [chorus]);

  useEffect(() => {
    audioEngine.setDelay(delay);
  }, [delay]);

  useEffect(() => {
    audioEngine.setEq(eqLow, eqMid, eqHigh);
  }, [eqHigh, eqLow, eqMid]);

  return (
    <main className="workstation-bg min-h-dvh overflow-x-hidden overflow-y-auto p-2 text-zinc-100 md:h-screen md:overflow-hidden md:p-3">
      <div className="mx-auto flex h-full min-h-dvh w-full max-w-[1500px] flex-col gap-3 md:min-h-0">
        <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <TopBar />
        </motion.header>

        <AdsenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? ""} className="hidden min-h-[90px] md:block" format="horizontal" />

        <div className="min-h-[280px] flex-1 md:min-h-0">
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-full min-h-[280px]">
            <PianoKeyboard />
          </motion.section>
        </div>

        <AdsenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM ?? ""} className="min-h-[56px] md:min-h-[90px]" format="horizontal" />
      </div>
    </main>
  );
}
