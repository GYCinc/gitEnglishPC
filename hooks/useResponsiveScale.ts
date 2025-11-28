import { useState, useEffect, RefObject } from 'react';

export const useResponsiveScale = (
  targetWidth: number,
  contentRef: RefObject<HTMLElement> // Refers to the inner content div's ideal width
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (contentRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate scale to fit the content's ideal width (targetWidth) within the viewport
        // with some padding.
        const horizontalPadding = 100; // Total left/right padding
        const verticalPadding = 100; // Total top/bottom padding

        const effectiveViewportWidth = viewportWidth - horizontalPadding;
        const effectiveViewportHeight = viewportHeight - verticalPadding;

        // Scale needed for content to fit width-wise
        const scaleToFitWidth = effectiveViewportWidth / targetWidth;
        
        // If content has a natural height, we might also need to scale to fit height-wise
        // This is more complex because content height is dynamic. For now, prioritize width.
        // If content height becomes an issue, we can introduce max-height/overflow-y or a more complex scale.

        const maxScaleUp = 1.5;   // Target 150% zoom
        const minScaleDown = 0.5; // Allow scaling down to 50%

        let newScale = 1;

        // If the content, when displayed at maxScaleUp, is wider than the effective viewport,
        // we must scale down to fit the width.
        if (targetWidth * maxScaleUp > effectiveViewportWidth) {
          newScale = scaleToFitWidth;
        } else {
          // Otherwise, we can try to scale up to the desired maxScaleUp
          newScale = maxScaleUp;
        }
        
        // Ensure scale is within acceptable min/max bounds
        newScale = Math.min(maxScaleUp, Math.max(minScaleDown, newScale));
        
        setScale(newScale);
      }
    };

    // Recalculate on window resize
    window.addEventListener('resize', calculateScale);
    
    // Initial calculation. Use setTimeout to ensure ref.current is populated after render.
    const timeout = setTimeout(calculateScale, 100);

    return () => {
      window.removeEventListener('resize', calculateScale);
      clearTimeout(timeout);
    };
  }, [targetWidth, contentRef]); // Depend on contentRef to ensure recalculation if the ref target changes

  return scale;
};
