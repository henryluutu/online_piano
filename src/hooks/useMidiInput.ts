"use client";

import { useEffect } from "react";
import { audioEngine } from "@/audio/engine";
import { parseNoteFromMidiMessage } from "@/lib/music";
import { useWorkstationStore } from "@/store/useWorkstationStore";

type MidiAccess = {
  inputs: Map<string, MIDIInput>;
  onstatechange: (() => void) | null;
};

export function useMidiInput() {
  const midiChannel = useWorkstationStore((s) => s.midiChannel);
  const octaveShift = useWorkstationStore((s) => s.octaveShift);
  const setMidiDeviceName = useWorkstationStore((s) => s.setMidiDeviceName);
  const noteOn = useWorkstationStore((s) => s.noteOn);
  const noteOff = useWorkstationStore((s) => s.noteOff);

  useEffect(() => {
    let cancelled = false;
    const listeners: Array<() => void> = [];

    const init = async () => {
      if (!("requestMIDIAccess" in navigator)) {
        setMidiDeviceName("Web MIDI unavailable");
        return;
      }

      const access = (await navigator.requestMIDIAccess()) as unknown as MidiAccess;
      if (cancelled) return;

      const bindInputs = () => {
        const inputs = [...access.inputs.values()];
        setMidiDeviceName(inputs[0]?.name ?? "No MIDI device");

        for (const input of inputs) {
          const handleMessage = (event: MIDIMessageEvent) => {
            if (!event.data) return;
            const parsed = parseNoteFromMidiMessage(event.data);
            if (parsed.channel !== midiChannel) return;
            const shiftedNote = Math.max(0, Math.min(127, parsed.note + octaveShift * 12));

            if (parsed.isNoteOn) {
              const velocity = parsed.velocity / 127;
              audioEngine.noteOn(shiftedNote, velocity);
              noteOn(shiftedNote);
            }

            if (parsed.isNoteOff) {
              audioEngine.noteOff(shiftedNote);
              noteOff(shiftedNote);
            }
          };

          input.addEventListener("midimessage", handleMessage);
          listeners.push(() => input.removeEventListener("midimessage", handleMessage));
        }
      };

      bindInputs();

      access.onstatechange = () => {
        listeners.splice(0).forEach((off) => off());
        bindInputs();
      };
    };

    void init();

    return () => {
      cancelled = true;
      listeners.forEach((off) => off());
    };
  }, [midiChannel, noteOff, noteOn, octaveShift, setMidiDeviceName]);
}
