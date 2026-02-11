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
  const loggerRef = useRef<ActivityLogger | null>(null);
  // Force update to propagate logger changes
  const [, setForceUpdate] = useState({});

  // Initialize logger only once or when studentId/moduleId changes
  useEffect(() => {
    if (studentId) {
      localStorage.setItem('studentId', studentId);
      loggerRef.current = new ActivityLogger(moduleId, studentId);
      loggerRef.current.startSession();
    } else {
      localStorage.removeItem('studentId');
      // If studentId is cleared, end current session and clear logger
      if (loggerRef.current) {
        loggerRef.current.endSession();
        loggerRef.current = null;
      }
    }
    setForceUpdate({});

    // Cleanup on unmount or if studentId is changed/cleared
    return () => {
      if (loggerRef.current && studentId) {
        loggerRef.current.endSession(); // Ensure session ends cleanly
        loggerRef.current = null;
      }
    };
  }, [studentId, moduleId]);

  const isValidStudentId = useCallback((id: string) => {
    return VALID_STUDENT_IDS.includes(id);
  }, []);

  // Memoized functions to safely call logger methods
  const logFocusItem = useCallback((category: FocusCategory, concept: string, timeSpentSeconds: number, score: number | null = null, attempts: number = 1, errors: string[] = [], contentText: string | null = null) => {
    loggerRef.current?.logFocusItem(category, concept, timeSpentSeconds, score, attempts, errors, contentText);
  }, []);

  const startActivity = useCallback((activityId: string, type: ActivityType, name: string) => {
    loggerRef.current?.startActivity(activityId, type, name);
  }, []);

  const endActivity = useCallback(() => {
    loggerRef.current?.endActivity();
  }, []);


  const value = useMemo(() => ({
    logger: loggerRef.current,
    studentId,
    setStudentId,
    moduleId,
    isValidStudentId,
    logFocusItem,
    startActivity,
    endActivity,
  }), [loggerRef.current, studentId, moduleId, isValidStudentId, logFocusItem, startActivity, endActivity]);

  return (
    <ActivityLoggerContext.Provider value={value}>
      {children}
    </ActivityLoggerContext.Provider>
  );
};