import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ActivityLogger, FocusCategory, ActivityType } from './ActivityLogger';
import { VALID_STUDENT_IDS } from './constants'; // Import valid student IDs

interface ActivityLoggerContextType {
  logger: ActivityLogger | null;
  studentId: string | null;
  setStudentId: (id: string | null) => void;
  moduleId: string;
  isValidStudentId: (id: string) => boolean;
  logFocusItem: (category: FocusCategory, concept: string, timeSpentSeconds: number, score?: number | null, attempts?: number, errors?: string[], contentText?: string | null) => void;
  startActivity: (activityId: string, type: ActivityType, name: string) => void;
  endActivity: () => void;
}

const ActivityLoggerContext = createContext<ActivityLoggerContextType | undefined>(undefined);

export const useActivityLogger = () => {
  const context = useContext(ActivityLoggerContext);
  if (!context) {
    throw new Error('useActivityLogger must be used within an ActivityLoggerProvider');
  }
  return context;
};

interface ActivityLoggerProviderProps {
  children: React.ReactNode;
  moduleId: string;
}

export const ActivityLoggerProvider: React.FC<ActivityLoggerProviderProps> = ({ children, moduleId }) => {
  const [studentId, setStudentId] = useState<string | null>(() => localStorage.getItem('studentId') || null);
  const [logger, setLogger] = useState<ActivityLogger | null>(null);

  // Initialize logger only once or when studentId/moduleId changes
  useEffect(() => {
    let newLogger: ActivityLogger | null = null;
    if (studentId) {
      localStorage.setItem('studentId', studentId);
      newLogger = new ActivityLogger(moduleId, studentId);
      newLogger.startSession();
      setLogger(newLogger);
    } else {
      localStorage.removeItem('studentId');
      setLogger(null);
    }

    // Cleanup on unmount or if studentId is changed/cleared
    return () => {
      if (newLogger) {
        newLogger.endSession(); // Ensure session ends cleanly
      } else if (logger) {
        logger.endSession();
      }
    };
  }, [studentId, moduleId]);

  const isValidStudentId = useCallback((id: string) => {
    return VALID_STUDENT_IDS.includes(id);
  }, []);

  // Memoized functions to safely call logger methods
  const logFocusItem = useCallback((category: FocusCategory, concept: string, timeSpentSeconds: number, score: number | null = null, attempts: number = 1, errors: string[] = [], contentText: string | null = null) => {
    logger?.logFocusItem(category, concept, timeSpentSeconds, score, attempts, errors, contentText);
  }, [logger]);

  const startActivity = useCallback((activityId: string, type: ActivityType, name: string) => {
    logger?.startActivity(activityId, type, name);
  }, [logger]);

  const endActivity = useCallback(() => {
    logger?.endActivity();
  }, [logger]);


  const value = useMemo(() => ({
    logger,
    studentId,
    setStudentId,
    moduleId,
    isValidStudentId,
    logFocusItem,
    startActivity,
    endActivity,
  }), [logger, studentId, moduleId, isValidStudentId, logFocusItem, startActivity, endActivity]);

  return (
    <ActivityLoggerContext.Provider value={value}>
      {children}
    </ActivityLoggerContext.Provider>
  );
};