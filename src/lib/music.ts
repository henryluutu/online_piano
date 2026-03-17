const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const BLACK_KEY_NAMES = new Set(["C#", "D#", "F#", "G#", "A#"]);

export function midiToNoteName(midi: number): string {
  const pitch = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}${octave}`;
}

export function isBlackKey(midi: number): boolean {
  const name = NOTE_NAMES[midi % 12];
  return BLACK_KEY_NAMES.has(name);
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function transposeMidi(midi: number, semitones: number) {
  return clamp(midi + semitones, 0, 127);
}

export function parseNoteFromMidiMessage(data: Uint8Array) {
  const [status, note, velocity = 0] = data;
  const command = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  return {
    command,
    channel,
    note,
    velocity,
    isNoteOn: command === 0x90 && velocity > 0,
    isNoteOff: command === 0x80 || (command === 0x90 && velocity === 0),
  };
}
