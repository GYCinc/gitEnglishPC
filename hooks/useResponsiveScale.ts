import { useState, useEffect, RefObject } from 'react';

export const useResponsiveScale = (
  targetWidth: number,
  contentRef: RefObject<HTMLElement>, // Refers to the inner content div's ideal width
  maxScale: number = 1.5 // Default max scale, can be overridden
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (contentRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate scale to fit the content's ideal width (targetWidth) within the viewport
        // with some padding.
        const horizontalPadding = 40; // Reduced padding for better fit in presentation
        const verticalPadding = 40;

        const effectiveViewportWidth = viewportWidth - horizontalPadding;
        const effectiveViewportHeight = viewportHeight - verticalPadding;

        // Scale needed for content to fit width-wise
        const scaleToFitWidth = effectiveViewportWidth / targetWidth;
        
        // If content has a natural height, we might also need to scale to fit height-wise
        // This is more complex because content height is dynamic. For now, prioritize width.
        // If content height becomes an issue, we can introduce max-height/overflow-y or a more complex scale.

        const minScaleDown = 0.5; // Allow scaling down to 50%

        let newScale = 1;

        // If the content, when displayed at maxScale, is wider than the effective viewport,
        // we must scale down to fit the width.
        if (targetWidth * maxScale > effectiveViewportWidth) {
          newScale = scaleToFitWidth;
        } else {
          // Otherwise, we can try to scale up to the desired maxScale
          newScale = maxScale;
        }

        // Also check height constraint if in presentation mode (implied by high maxScale)
        if (maxScale > 2 && contentRef.current) {
             const contentHeight = contentRef.current.scrollHeight;
             const scaleToFitHeight = effectiveViewportHeight / contentHeight;
             newScale = Math.min(newScale, scaleToFitHeight);
        }
        
        // Ensure scale is within acceptable min/max bounds
        newScale = Math.min(maxScale, Math.max(minScaleDown, newScale));
        
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
  }, [targetWidth, contentRef, maxScale]); // Depend on maxScale

  return scale;
};
