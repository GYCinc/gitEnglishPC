// Using Web Audio API to avoid external assets and keep it "vibe coded"
// Simple synth sounds

class SoundEffectsService {
    private audioCtx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor() {
        // Initialize on first user interaction if possible, or lazy load
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
                this.masterGain = this.audioCtx.createGain();
                this.masterGain.connect(this.audioCtx.destination);
                this.masterGain.gain.value = 0.2; // Keep it subtle
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
        if (!this.audioCtx || !this.masterGain) return;

        // Resume if suspended (browser policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.audioCtx.currentTime + startTime);
        osc.stop(this.audioCtx.currentTime + startTime + duration);
    }

    playCorrect() {
        // Happy major chord arpeggio
        this.playTone(440, 'sine', 0.5, 0); // A4
        this.playTone(554.37, 'sine', 0.5, 0.1); // C#5
        this.playTone(659.25, 'sine', 0.8, 0.2); // E5
    }

    playIncorrect() {
        // Low discordant sound
        this.playTone(150, 'sawtooth', 0.4, 0);
        this.playTone(140, 'sawtooth', 0.4, 0.1);
    }

    playLevelUp() {
        // Victory fanfare
        this.playTone(523.25, 'square', 0.2, 0); // C5
        this.playTone(523.25, 'square', 0.2, 0.1); // C5
        this.playTone(523.25, 'square', 0.2, 0.2); // C5
        this.playTone(659.25, 'square', 0.6, 0.3); // E5
        this.playTone(523.25, 'square', 0.2, 0.6); // C5
        this.playTone(659.25, 'square', 0.8, 0.7); // E5
    }
}

export const soundEffects = new SoundEffectsService();
