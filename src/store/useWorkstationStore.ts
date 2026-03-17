import { create } from "zustand";

export type VoiceId =
  | "grand_piano"
  | "bright_piano"
  | "electric_piano"
  | "organ"
  | "strings"
  | "brass"
  | "choir"
  | "synth_pad"
  | "guitar"
  | "bass";

export type StyleId =
  | "pop"
  | "gospel"
  | "rock"
  | "ballad"
  | "afrobeat"
  | "funk"
  | "dance";

export type Variation = "A" | "B" | "C" | "D";

export const VOICES: Array<{ id: VoiceId; label: string }> = [
  { id: "grand_piano", label: "Grand Piano" },
  { id: "bright_piano", label: "Bright Piano" },
  { id: "electric_piano", label: "Electric Piano" },
  { id: "organ", label: "Organ" },
  { id: "strings", label: "Strings" },
  { id: "brass", label: "Brass" },
  { id: "choir", label: "Choir" },
  { id: "synth_pad", label: "Synth Pad" },
  { id: "guitar", label: "Guitar" },
  { id: "bass", label: "Bass" },
];

export const STYLES: Array<{ id: StyleId; label: string }> = [
  { id: "pop", label: "Pop" },
  { id: "gospel", label: "Gospel" },
  { id: "rock", label: "Rock" },
  { id: "ballad", label: "Ballad" },
  { id: "afrobeat", label: "Afrobeat" },
  { id: "funk", label: "Funk" },
  { id: "dance", label: "Dance" },
];

type WorkstationState = {
  activeNotes: Set<number>;
  voice: VoiceId;
  style: StyleId;
  variation: Variation;
  tempo: number;
  isPlaying: boolean;
  isMetronomeOn: boolean;
  midiDeviceName: string;
  midiChannel: number;
  octaveShift: number;
  syncStart: boolean;
  reverb: number;
  chorus: number;
  delay: number;
  eqLow: number;
  eqMid: number;
  eqHigh: number;
  noteOn: (midi: number) => void;
  noteOff: (midi: number) => void;
  setVoice: (voice: VoiceId) => void;
  setStyle: (style: StyleId) => void;
  setVariation: (variation: Variation) => void;
  setTempo: (tempo: number) => void;
  setIsPlaying: (value: boolean) => void;
  setMetronome: (value: boolean) => void;
  setMidiDeviceName: (name: string) => void;
  setMidiChannel: (channel: number) => void;
  setOctaveShift: (octave: number) => void;
  setSyncStart: (value: boolean) => void;
  setReverb: (value: number) => void;
  setChorus: (value: number) => void;
  setDelay: (value: number) => void;
  setEqLow: (value: number) => void;
  setEqMid: (value: number) => void;
  setEqHigh: (value: number) => void;
};

export const useWorkstationStore = create<WorkstationState>((set) => ({
  activeNotes: new Set(),
  voice: "grand_piano",
  style: "pop",
  variation: "A",
  tempo: 120,
  isPlaying: false,
  isMetronomeOn: false,
  midiDeviceName: "No MIDI device",
  midiChannel: 1,
  octaveShift: 0,
  syncStart: false,
  reverb: 0.2,
  chorus: 0.2,
  delay: 0.1,
  eqLow: 0,
  eqMid: 0,
  eqHigh: 0,
  noteOn: (midi) =>
    set((state) => {
      const next = new Set(state.activeNotes);
      next.add(midi);
      return { activeNotes: next };
    }),
  noteOff: (midi) =>
    set((state) => {
      const next = new Set(state.activeNotes);
      next.delete(midi);
      return { activeNotes: next };
    }),
  setVoice: (voice) => set({ voice }),
  setStyle: (style) => set({ style }),
  setVariation: (variation) => set({ variation }),
  setTempo: (tempo) => set({ tempo }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setMetronome: (isMetronomeOn) => set({ isMetronomeOn }),
  setMidiDeviceName: (midiDeviceName) => set({ midiDeviceName }),
  setMidiChannel: (midiChannel) => set({ midiChannel }),
  setOctaveShift: (octaveShift) => set({ octaveShift }),
  setSyncStart: (syncStart) => set({ syncStart }),
  setReverb: (reverb) => set({ reverb }),
  setChorus: (chorus) => set({ chorus }),
  setDelay: (delay) => set({ delay }),
  setEqLow: (eqLow) => set({ eqLow }),
  setEqMid: (eqMid) => set({ eqMid }),
  setEqHigh: (eqHigh) => set({ eqHigh }),
}));
