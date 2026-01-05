import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { soundEffects } from '../services/SoundEffectsService';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastLogin: string | null;
  achievements: string[];
}

interface GamificationContextType extends GamificationState {
  addXp: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const XP_PER_LEVEL = 1000;
const STORAGE_KEY = 'practiceGenie-gamification';

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load gamification state", e);
    }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastLogin: null,
      achievements: []
    };
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Streak logic on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      setState(prev => {
        let newStreak = prev.streak;
        if (prev.lastLogin === yesterdayStr) {
          newStreak += 1;
        } else if (prev.lastLogin !== today) {
           // Reset streak if gap > 1 day, unless it's first login
           if (prev.lastLogin) newStreak = 1;
           else newStreak = 1;
        }

        return {
          ...prev,
          lastLogin: today,
          streak: newStreak
        };
      });
    }
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

      if (newLevel > prev.level) {
        setShowLevelUp(true);
        soundEffects.playLevelUp();
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState(prev => {
      if (prev.achievements.includes(id)) return prev;
      // Could trigger specific sound or toast here
      soundEffects.playSuccess();
      return {
        ...prev,
        achievements: [...prev.achievements, id]
      };
    });
  }, []);

  const value = useMemo(() => ({
    ...state,
    addXp,
    unlockAchievement,
    showLevelUp,
    setShowLevelUp
  }), [state, addXp, unlockAchievement, showLevelUp]);

  return (
    <GamificationContext.Provider value={value}>
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
