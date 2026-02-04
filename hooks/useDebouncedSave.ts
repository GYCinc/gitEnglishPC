import { useEffect } from 'react';

/**
 * Custom hook to debounce localStorage writes.
 * Prevents main-thread blocking during rapid state updates (e.g. sliders, dragging).
 *
 * @param key localStorage key
 * @param value value to persist
 * @param delay debounce delay in ms (default 500)
 */
export function useDebouncedSave<T>(key: string, value: T, delay: number = 500) {
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        let valueToSave: string;

        // Handle serialization
        if (typeof value === 'string') {
            valueToSave = value;
        } else {
            valueToSave = JSON.stringify(value);
        }

        localStorage.setItem(key, valueToSave);
      } catch (error) {
        console.warn(`Error saving to localStorage key "${key}":`, error);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [key, value, delay]);
}
