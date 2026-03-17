import { clamp, midiToFrequency } from "@/lib/music";
import type { StyleId, Variation, VoiceId } from "@/store/useWorkstationStore";

type VoicePreset = {
  oscillator: "sine" | "triangle" | "square" | "sawtooth";
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
};

const VOICE_PRESETS: Record<VoiceId, VoicePreset> = {
  grand_piano: { oscillator: "triangle", envelope: { attack: 0.005, decay: 0.25, sustain: 0.2, release: 1.2 } },
  bright_piano: { oscillator: "sine", envelope: { attack: 0.003, decay: 0.2, sustain: 0.15, release: 0.8 } },
  electric_piano: { oscillator: "triangle", envelope: { attack: 0.01, decay: 0.3, sustain: 0.35, release: 1.1 } },
  organ: { oscillator: "square", envelope: { attack: 0.02, decay: 0.1, sustain: 0.95, release: 0.2 } },
  strings: { oscillator: "sawtooth", envelope: { attack: 0.15, decay: 0.4, sustain: 0.75, release: 1.8 } },
  brass: { oscillator: "sawtooth", envelope: { attack: 0.04, decay: 0.25, sustain: 0.6, release: 0.45 } },
  choir: { oscillator: "sine", envelope: { attack: 0.08, decay: 0.2, sustain: 0.8, release: 1.6 } },
  synth_pad: { oscillator: "triangle", envelope: { attack: 0.3, decay: 0.5, sustain: 0.75, release: 2.2 } },
  guitar: { oscillator: "triangle", envelope: { attack: 0.004, decay: 0.45, sustain: 0.1, release: 0.7 } },
  bass: { oscillator: "square", envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.25 } },
};

type StylePattern = {
  kick: number[];
  snare: number[];
  hat: number[];
  hatOpen?: number[];
};

const STYLE_PATTERNS: Record<StyleId, StylePattern> = {
  pop: { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
  gospel: { kick: [0, 5, 8, 11], snare: [4, 12], hat: [0, 2, 3, 6, 8, 10, 14] },
  rock: { kick: [0, 6, 8, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
  ballad: { kick: [0, 8], snare: [4, 12], hat: [0, 4, 8, 12], hatOpen: [14] },
  afrobeat: { kick: [0, 3, 7, 10], snare: [4, 12, 15], hat: [0, 2, 5, 6, 8, 11, 13, 14] },
  funk: { kick: [0, 3, 8, 11], snare: [4, 10, 12], hat: [0, 2, 4, 5, 8, 10, 12, 14] },
  dance: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], hatOpen: [7, 15] },
};

class WorkstationAudioEngine {
  private Tone: any = null;
  private isInitialized = false;

  private synth: any;
  private reverb: any;
  private chorus: any;
  private delay: any;
  private eq: any;

  private kick: any;
  private snare: any;
  private hat: any;
  private click: any;

  private stepLoop: any = null;
  private metronomeLoop: any = null;
  private currentStep = 0;
  private currentStyle: StyleId = "pop";
  private currentVariation: Variation = "A";
  private pendingTempo = 120;

  async init() {
    if (this.isInitialized || typeof window === "undefined") return;

    this.Tone = await import("tone");
    const Tone = this.Tone;

    await Tone.start();

    this.synth = new Tone.PolySynth(Tone.Synth, { volume: -7 });
    this.reverb = new Tone.Reverb({ decay: 2.4, wet: 0.2 });
    this.chorus = new Tone.Chorus({ frequency: 1.2, delayTime: 2.5, depth: 0.4, wet: 0.2 });
    this.delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.3, wet: 0.1 });
    this.eq = new Tone.EQ3({ low: 0, mid: 0, high: 0 });

    this.kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 8 });
    this.snare = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.22, sustain: 0 },
    });
    this.hat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 3200,
      octaves: 1.5,
    });

    this.click = new Tone.MembraneSynth({
      octaves: 2,
      pitchDecay: 0.01,
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.04 },
    });

    this.synth.chain(this.chorus, this.delay, this.reverb, this.eq, Tone.Destination);
    this.kick.connect(this.eq);
    this.snare.connect(this.eq);
    this.hat.connect(this.eq);
    this.click.connect(Tone.Destination);

    await this.reverb.generate();

    this.stepLoop = new Tone.Loop((time: number) => this.runStep(time), "16n");
    this.metronomeLoop = new Tone.Loop((time: number) => {
      this.click.triggerAttackRelease("C6", "32n", time, 0.2);
    }, "4n");

    Tone.Transport.bpm.value = this.pendingTempo;
    this.isInitialized = true;
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  private runStep(time: number) {
    const pattern = STYLE_PATTERNS[this.currentStyle];
    const step = this.currentStep;

    if (pattern.kick.includes(step)) this.kick.triggerAttackRelease("C1", "8n", time, 0.95);
    if (pattern.snare.includes(step)) this.snare.triggerAttackRelease("16n", time, 0.6);

    const hatVelocity = this.currentVariation === "D" ? 0.5 : 0.35;
    if (pattern.hat.includes(step)) this.hat.triggerAttackRelease("32n", time, hatVelocity);
    if (pattern.hatOpen?.includes(step)) this.hat.triggerAttackRelease("16n", time, 0.6);

    if (this.currentVariation === "B" && step === 7) this.snare.triggerAttackRelease("32n", time, 0.35);
    if (this.currentVariation === "C" && (step === 6 || step === 14)) {
      this.kick.triggerAttackRelease("C1", "16n", time, 0.6);
    }

    this.currentStep = (this.currentStep + 1) % 16;
  }

  noteOn(midi: number, velocity = 0.8) {
    void this.ensureInitialized().then(() => {
      if (!this.synth || !this.Tone) return;
      this.synth.triggerAttack(midiToFrequency(midi), this.Tone.now(), clamp(velocity, 0, 1));
    });
  }

  noteOff(midi: number) {
    if (!this.synth || !this.Tone) return;
    this.synth.triggerRelease(midiToFrequency(midi), this.Tone.now());
  }

  allNotesOff() {
    if (!this.synth) return;
    this.synth.releaseAll();
  }

  setVoice(voice: VoiceId) {
    const preset = VOICE_PRESETS[voice];
    if (!this.synth) return;
    this.synth.set({ oscillator: { type: preset.oscillator }, envelope: preset.envelope });
  }

  setTempo(bpm: number) {
    this.pendingTempo = clamp(bpm, 40, 200);
    if (!this.Tone) return;
    this.Tone.Transport.bpm.rampTo(this.pendingTempo, 0.06);
  }

  setStyle(style: StyleId) {
    this.currentStyle = style;
    this.currentStep = 0;
  }

  setVariation(variation: Variation) {
    this.currentVariation = variation;
  }

  async startAccompaniment() {
    await this.ensureInitialized();
    if (!this.Tone) return;
    this.currentStep = 0;
    this.stepLoop?.start(0);
    this.Tone.Transport.start();
  }

  stopAccompaniment() {
    if (!this.Tone) return;
    this.stepLoop?.stop(0);
    this.Tone.Transport.stop();
    this.currentStep = 0;
  }

  triggerFill() {
    if (!this.Tone) return;
    const now = this.Tone.now();
    [0.02, 0.09, 0.16, 0.24].forEach((offset, index) => {
      const note = index % 2 === 0 ? "D1" : "F#1";
      this.kick?.triggerAttackRelease(note, "32n", now + offset, 0.5);
      this.snare?.triggerAttackRelease("64n", now + offset + 0.02, 0.3);
    });
  }

  setReverb(value: number) {
    if (!this.reverb) return;
    this.reverb.wet.rampTo(clamp(value, 0, 1), 0.08);
  }

  setChorus(value: number) {
    if (!this.chorus) return;
    this.chorus.wet.rampTo(clamp(value, 0, 1), 0.08);
  }

  setDelay(value: number) {
    if (!this.delay) return;
    this.delay.wet.rampTo(clamp(value, 0, 1), 0.08);
  }

  setEq(low: number, mid: number, high: number) {
    if (!this.eq) return;
    this.eq.low.value = clamp(low, -12, 12);
    this.eq.mid.value = clamp(mid, -12, 12);
    this.eq.high.value = clamp(high, -12, 12);
  }

  setMetronome(value: boolean) {
    if (!this.Tone) return;
    if (value) {
      this.metronomeLoop?.start(0);
      if (this.Tone.Transport.state !== "started") this.Tone.Transport.start();
      return;
    }
    this.metronomeLoop?.stop(0);
  }

  async tapTempo() {
    await this.ensureInitialized();
    if (!this.Tone) return;
    this.click?.triggerAttackRelease("G6", "32n", this.Tone.now(), 0.35);
  }
}

export const audioEngine = new WorkstationAudioEngine();
