import { useState, useEffect, RefObject } from 'react';

export const useResponsiveScale = (
  targetWidth: number,
  containerRef: RefObject<HTMLElement>
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth < targetWidth) {
          setScale(containerWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    if (!containerRef.current) return;

    // Initial calculation
    calculateScale();
    
    // Using ResizeObserver is more performant than window resize event
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      if (containerRef.current) {
        // In some rare cases, the ref might be null on cleanup.
        // It's good practice to check before calling unobserve.
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [targetWidth, containerRef]);

  return scale;
};
