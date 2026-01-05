class SoundEffectsService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      // Initialize AudioContext lazily on user interaction usually, but here we prep it
      // Note: Browsers require user interaction to resume AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3; // Default volume
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  private async ensureContext() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.3, this.audioContext?.currentTime || 0);
    }
  }

  public playClick() {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  public playSuccess() {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const now = this.audioContext.currentTime;

    // Arpeggio C Major
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  public playError() {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const now = this.audioContext.currentTime;

    // Dissonant low chord
    const freqs = [150, 145];

    freqs.forEach(freq => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq - 50, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    });
  }

  public playLevelUp() {
    if (this.isMuted || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const now = this.audioContext.currentTime;

    // Victory Fanfare
    const melody = [
        { f: 523.25, t: 0, d: 0.1 },   // C5
        { f: 523.25, t: 0.1, d: 0.1 }, // C5
        { f: 523.25, t: 0.2, d: 0.1 }, // C5
        { f: 659.25, t: 0.3, d: 0.3 }, // E5
        { f: 783.99, t: 0.6, d: 0.3 }, // G5
        { f: 1046.50, t: 0.9, d: 0.6 } // C6
    ];

    melody.forEach(note => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.type = 'square';
        osc.frequency.value = note.f;

        const startTime = now + note.t;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.d);

        osc.start(startTime);
        osc.stop(startTime + note.d);
    });
  }
}

export const soundEffects = new SoundEffectsService();
