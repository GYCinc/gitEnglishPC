import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
}

interface GamificationContextType extends GamificationState {
  addXP: (amount: number) => void;
  checkStreak: () => void; // Call this when the user performs a significant action
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STORAGE_KEY = 'practiceGenie-gamification';
const XP_PER_LEVEL = 500;

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse gamification state', e);
    }
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return {
        ...prev,
        xp: newXP,
        level: newLevel
      };
    });
  }, []);

  const checkStreak = useCallback(() => {
    setState(prev => {
      const today = new Date().toDateString();
      const last = prev.lastActiveDate;

      if (last === today) {
        return prev; // Already counted for today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let newStreak = prev.streak;

      if (last === yesterdayString) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset or start new
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: today
      };
    });
  }, []);

  // Check streak on mount (just to verify if they missed a day, but don't increment until they do something?)
  // Actually, let's only update streak when they do an action (checkStreak).
  // But we should probably reset it if they login and it's been days.
  useEffect(() => {
      // On load, if the last active date was > 1 day ago, reset streak to 0 visually?
      // Or wait for an action? Let's wait for an action to "bank" the day.
      // But we should visually show "0" if they broke the streak.
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // logic handled in render/checkStreak, but let's just leave state as is until action.
  }, []);

  return (
    <GamificationContext.Provider value={{ ...state, addXP, checkStreak }}>
      {children}
    </GamificationContext.Provider>
  );
};
