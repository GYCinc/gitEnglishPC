import React, { useEffect, useRef, useCallback } from 'react';
import { useActivityLogger } from '../ActivityContext';
import { useDebounce } from './useDebounce'; // Reuse debounce if needed, or implement throttling

/**
 * useAttentionTracker
 * ===================
 * A hook that tracks mouse movements and hover events on a target element
 * to approximate user attention/gaze.
 *
 * It logs data to the ActivityLogger using `logStreamEvent`.
 *
 * @param targetRef - The RefObject of the element to track (e.g., the exercise content div)
 * @param isActive - Whether tracking should be active (e.g., only when in Live Mode or when user is interacting)
 * @param throttleMs - Minimum interval between mouse move events (default 100ms)
 */
export const useAttentionTracker = (
  targetRef: React.RefObject<HTMLElement>,
  isActive: boolean = true,
  throttleMs: number = 100
) => {
  const { logger } = useActivityLogger();
  const lastLogTime = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || !logger || !targetRef.current) return;

    const now = Date.now();
    if (now - lastLogTime.current < throttleMs) return;

    // Calculate relative coordinates within the target element
    // This is more useful than screen coordinates for analysis
    const rect = targetRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Only log if inside bounds (though mousemove listener is usually attached to element)
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        logger.logStreamEvent('cursor_gaze', {
            x,
            y,
            w: Math.round(rect.width),
            h: Math.round(rect.height)
        });
        lastLogTime.current = now;
    }
  }, [isActive, logger, targetRef, throttleMs]);

  const handleMouseEnter = useCallback(() => {
    if (!isActive || !logger) return;
    logger.logStreamEvent('gaze_enter', { timestamp: Date.now() });
  }, [isActive, logger]);

  const handleMouseLeave = useCallback(() => {
    if (!isActive || !logger) return;
    logger.logStreamEvent('gaze_leave', { timestamp: Date.now() });
  }, [isActive, logger]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !isActive) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [targetRef, isActive, handleMouseMove, handleMouseEnter, handleMouseLeave]);
};
