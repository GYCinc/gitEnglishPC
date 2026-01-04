import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soundService } from './services/soundEffects';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
}

interface GamificationContextType extends GamificationState {
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  playSuccessSound: () => void;
  playErrorSound: () => void;
  playPopSound: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const XP_PER_LEVEL = 100;
const STORAGE_KEY = 'practiceGenie-gamification';

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { xp: 0, level: 1, streak: 0, lastActivityDate: null };
    } catch {
      return { xp: 0, level: 1, streak: 0, lastActivityDate: null };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXP = (amount: number) => {
    setState(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let leveledUp = false;

      while (newXP >= newLevel * XP_PER_LEVEL) {
        newXP -= newLevel * XP_PER_LEVEL;
        newLevel++;
        leveledUp = true;
      }

      if (leveledUp) {
        soundService.playFanfare();
      }

      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastActivityDate === today) return; // Already logged for today

    setState(prev => {
       const lastDate = prev.lastActivityDate ? new Date(prev.lastActivityDate) : null;
       const currentDate = new Date();

       let newStreak = 1;
       if (lastDate) {
           const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

           if (diffDays <= 2) { // 1 day difference roughly, allowing for slight timing diffs
               newStreak = prev.streak + 1;
           }
       }

       return { ...prev, streak: newStreak, lastActivityDate: today };
    });
  };

  const playSuccessSound = () => soundService.playSuccess();
  const playErrorSound = () => soundService.playError();
  const playPopSound = () => soundService.playPop();

  return (
    <GamificationContext.Provider value={{
      ...state,
      addXP,
      incrementStreak,
      playSuccessSound,
      playErrorSound,
      playPopSound
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
