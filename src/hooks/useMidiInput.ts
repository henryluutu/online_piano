"use client";

import { useEffect } from "react";
import { audioEngine } from "@/audio/engine";
import { parseNoteFromMidiMessage } from "@/lib/music";
import { useWorkstationStore } from "@/store/useWorkstationStore";

type MidiAccess = {
  inputs: Map<string, MIDIInput>;
  addEventListener(type: "statechange", handler: EventListener): void;
  removeEventListener(type: "statechange", handler: EventListener): void;
};

export function useMidiInput() {
  const midiChannel = useWorkstationStore((s) => s.midiChannel);
  const octaveShift = useWorkstationStore((s) => s.octaveShift);
  const setMidiDeviceName = useWorkstationStore((s) => s.setMidiDeviceName);
  const noteOn = useWorkstationStore((s) => s.noteOn);
  const noteOff = useWorkstationStore((s) => s.noteOff);

  useEffect(() => {
    let cancelled = false;
    const msgListeners: Array<() => void> = [];
    let access: MidiAccess | null = null;
    let stateChangeHandler: EventListener | null = null;

    const bindInputs = (acc: MidiAccess) => {
      const inputs = [...acc.inputs.values()];
      const names = inputs.map((i) => i.name).filter(Boolean).join(", ");
      setMidiDeviceName(names || "No MIDI device");

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
        msgListeners.push(() => input.removeEventListener("midimessage", handleMessage));
      }
    };

    const init = async () => {
      if (!("requestMIDIAccess" in navigator)) {
        setMidiDeviceName("Web MIDI unavailable");
        return;
      }

      const acc = (await navigator.requestMIDIAccess({ sysex: false })) as unknown as MidiAccess;
      if (cancelled) return;

      access = acc;
      bindInputs(acc);

      // Hot-plug: fires whenever a device is connected or disconnected
      stateChangeHandler = () => {
        if (cancelled) return;
        msgListeners.splice(0).forEach((off) => off());
        bindInputs(acc);
      };

      acc.addEventListener("statechange", stateChangeHandler);
    };

    void init();

    return () => {
      cancelled = true;
      msgListeners.forEach((off) => off());
      if (access && stateChangeHandler) {
        access.removeEventListener("statechange", stateChangeHandler);
      }
    };
  }, [midiChannel, noteOff, noteOn, octaveShift, setMidiDeviceName]);
}
