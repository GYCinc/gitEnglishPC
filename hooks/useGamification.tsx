import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  streakLastUpdated: string | null;
}

interface GamificationContextType {
  xp: number;
  level: number;
  streak: number;
  addXP: (amount: number) => void;
  triggerSuccess: () => void;
  triggerFailure: () => void;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

// Sound synthesizer using Web Audio API to avoid external assets
class AudioSynth {
    ctx: AudioContext | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
    }

    playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playSuccess() {
        if (!this.ctx) return;
        this.ctx.resume().then(() => {
             this.playTone(440, 'sine', 0.1, 0);       // A4
             this.playTone(554.37, 'sine', 0.1, 0.1);  // C#5
             this.playTone(659.25, 'sine', 0.3, 0.2);  // E5
        });
    }

    playFailure() {
        if (!this.ctx) return;
        this.ctx.resume().then(() => {
            this.playTone(300, 'sawtooth', 0.2, 0);
            this.playTone(200, 'sawtooth', 0.3, 0.15);
        });
    }

    playPop() {
         if (!this.ctx) return;
         this.ctx.resume().then(() => {
            this.playTone(800, 'sine', 0.05, 0);
         });
    }
}

const synth = new AudioSynth();

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem('practiceGenie-gamification');
      return saved ? JSON.parse(saved) : { xp: 0, level: 1, streak: 0, streakLastUpdated: null };
    } catch {
      return { xp: 0, level: 1, streak: 0, streakLastUpdated: null };
    }
  });

  useEffect(() => {
    localStorage.setItem('practiceGenie-gamification', JSON.stringify(state));
  }, [state]);

  const calculateLevel = (xp: number) => {
      let level = 1;
      for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
          if (xp >= LEVEL_THRESHOLDS[i]) {
              level = i + 1;
          } else {
              break;
          }
      }
      return level;
  };

  const addXP = useCallback((amount: number) => {
    setState(prev => {
        const newXP = prev.xp + amount;
        const newLevel = calculateLevel(newXP);

        // Check for streak update
        const today = new Date().toISOString().split('T')[0];
        let newStreak = prev.streak;
        let lastUpdated = prev.streakLastUpdated;

        if (lastUpdated !== today) {
             const yesterday = new Date();
             yesterday.setDate(yesterday.getDate() - 1);
             const yesterdayStr = yesterday.toISOString().split('T')[0];

             if (lastUpdated === yesterdayStr) {
                 newStreak += 1;
             } else {
                 newStreak = 1; // Reset or start new
             }
             lastUpdated = today;
        }

        return { ...prev, xp: newXP, level: newLevel, streak: newStreak, streakLastUpdated: lastUpdated };
    });
  }, []);

  const triggerSuccess = useCallback(() => {
      synth.playSuccess();
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#a855f7']
      });
  }, []);

  const triggerFailure = useCallback(() => {
      synth.playFailure();
  }, []);

  return (
    <GamificationContext.Provider value={{ ...state, addXP, triggerSuccess, triggerFailure }}>
      {children}
    </GamificationContext.Provider>
  );
};
