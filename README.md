# Online Arranger Keyboard Workstation

Browser-based arranger keyboard inspired by Yamaha workstation workflows.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn-style UI components
- Tone.js audio engine
- Web MIDI API input
- Zustand state management
- Framer Motion animations

## Features

- 88-key responsive on-screen piano (mouse/touch)
- MIDI keyboard input with velocity and channel selection
- Multi-voice synth presets (piano, organ, strings, brass, bass, and more)
- Built-in style engine (Pop, Gospel, Rock, Ballad, Afrobeat, Funk, Dance)
- Arranger controls: Start/Stop, Fill, Intro, Ending, Variation A/B/C/D, Sync Start
- Tempo control (40-200 BPM), tap tempo, metronome
- Live effects: Reverb, Chorus, Delay, EQ (low/mid/high)
- Dark glassmorphism workstation layout for desktop/tablet

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build Check

```bash
npm run lint
npm run build
```

## Notes

- First interaction with keys/buttons unlocks browser audio.
- MIDI requires a secure context/browser support.
- Current voices are synthesis-based presets for low latency and fast loading.
