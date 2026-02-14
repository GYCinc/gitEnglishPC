import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BlocksLayer } from './BlocksLayer';
import { SnapLinesOverlay } from './SnapLinesOverlay';
import { ExerciseType } from '../enums';
import { ExerciseBlockState } from '../types';
import { MagicWandIcon } from './icons';
import { useActivityLogger } from '../ActivityContext';

interface WhiteboardProps {
  blocks: ExerciseBlockState[];
  onAddBlock: (type: ExerciseType, x: number, y: number) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
  onRemoveBlock: (blockId: number) => void;
  onFocusBlock: (blockId: number) => void;
  presentingBlockId: number | null;
  onEnterPresentation: (id: number) => void;
  onExitPresentation: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
}

type SnapLine = {
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
}

const SNAP_THRESHOLD = 10;
const FRICTION = 0.92; // Momentum decay factor
const VELOCITY_THRESHOLD = 0.1;

const Whiteboard: React.FC<WhiteboardProps> = ({ 
    blocks, onAddBlock, onUpdateBlock, onRemoveBlock, onFocusBlock, 
    presentingBlockId, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide
}) => {
  const [activeInteraction, setActiveInteraction] = useState<{ blockId: number, x: number, y: number, width: number, height: number } | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const lastZoomLogTime = useRef(0);
  const pan = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Momentum State
  const velocity = useRef({ x: 0, y: 0 });
  const lastTimestamp = useRef(0);
  const rafId = useRef<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const isWorkspaceEmpty = blocks.length === 0;
  const { logger } = useActivityLogger();

  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const snapPointsCache = useRef<{ vPoints: number[], hPoints: number[] } | null>(null);

  // -- PAN & ZOOM HANDLERS --

  const updateTransform = () => {
      if (canvasRef.current) {
          canvasRef.current.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${scale})`;
      }
      if (backgroundRef.current) {
          backgroundRef.current.style.backgroundPosition = `${Math.round(pan.current.x)}px ${Math.round(pan.current.y)}px`;
      }
  };

  const applyMomentum = useCallback(() => {
      if (Math.abs(velocity.current.x) < VELOCITY_THRESHOLD && Math.abs(velocity.current.y) < VELOCITY_THRESHOLD) {
          rafId.current = null;
          return;
      }

      pan.current.x += velocity.current.x * 16; // Approx per frame
      pan.current.y += velocity.current.y * 16;

      velocity.current.x *= FRICTION;
      velocity.current.y *= FRICTION;

      updateTransform();
      rafId.current = requestAnimationFrame(applyMomentum);
  }, [scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeInteraction) return;

    const target = e.target as HTMLElement;
    const isBackground = target.id === 'whiteboard-background' || target.id === 'whiteboard-main' || target.id === 'whiteboard-content';

    if (e.button === 1 || e.button === 2 || (e.button === 0 && (isBackground || isSpacePressed))) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastTimestamp.current = performance.now();

      // Stop any existing momentum
      if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
      }
      velocity.current = { x: 0, y: 0 };
      
      e.preventDefault(); 
      e.stopPropagation();
      logger?.startActivity('canvas_panning', 'movement', 'Canvas Panning');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const now = performance.now();
      const dt = now - lastTimestamp.current;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      pan.current = { x: pan.current.x + dx, y: pan.current.y + dy };
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Calculate velocity (pixels per ms)
      if (dt > 0) {
          // Smooth velocity slightly
          const newVx = dx / dt;
          const newVy = dy / dt;
          velocity.current = {
              x: newVx * 0.5 + velocity.current.x * 0.5,
              y: newVy * 0.5 + velocity.current.y * 0.5
          };
      }
      lastTimestamp.current = now;

      updateTransform();
    }
  };

  const handleMouseUp = () => {
    if(isPanning) {
        setIsPanning(false);
        logger?.endActivity();

        // Start Momentum
        rafId.current = requestAnimationFrame(applyMomentum);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (rafId.current) cancelAnimationFrame(rafId.current); // Stop momentum on wheel

    const zoomFactor = Math.exp(-e.deltaY * 0.001); 
    const newScale = Math.min(Math.max(0.1, scale * zoomFactor), 4);
    
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - pan.current.x) / scale;
        const worldY = (mouseY - pan.current.y) / scale;

        const newPanX = mouseX - worldX * newScale;
        const newPanY = mouseY - worldY * newScale;

        pan.current = { x: newPanX, y: newPanY };

        // Update transform immediately
        if (canvasRef.current) {
            canvasRef.current.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${newScale})`;
        }
        if (backgroundRef.current) {
            backgroundRef.current.style.backgroundPosition = `${Math.round(pan.current.x)}px ${Math.round(pan.current.y)}px`;
        }
    }

    const now = Date.now();
    if (now - lastZoomLogTime.current > 1000) {
        logger?.logFocusItem('Movement', 'Canvas Zoom', 0.1, null, 1, [], `Scale: ${newScale.toFixed(2)}`);
        lastZoomLogTime.current = now;
    }
    setScale(newScale);
  };

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
      // Update transform whenever scale changes via state (for wheel)
      updateTransform();
  }, [scale]);

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
  };
  
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => { 
          if (e.code === 'Space' && e.target === document.body) {
              e.preventDefault();
              setIsSpacePressed(true); 
              logger?.logFocusItem('Movement', 'Spacebar Panning Enabled', 0.1);
          }
      };
      const handleKeyUp = (e: KeyboardEvent) => { 
          if (e.code === 'Space') {
              setIsSpacePressed(false); 
              logger?.logFocusItem('Movement', 'Spacebar Panning Disabled', 0.1);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, [logger]);

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('exerciseType') as ExerciseType;
    if (!type || !Object.values(ExerciseType).includes(type)) return;

    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.current.x) / scale;
        const y = (e.clientY - rect.top - pan.current.y) / scale;
        onAddBlock(type, x, y);
        logger?.logFocusItem('Project Management', 'Block Added via Drag', 0.1, null, 1, [], `Type: ${type}, Pos: (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
  };
  
  const getSnapPoints = useCallback((allBlocks: ExerciseBlockState[], excludeId: number) => {
    const vPoints: number[] = [];
    const hPoints: number[] = [];
    allBlocks.forEach(block => {
        if (block.id !== excludeId) {
            vPoints.push(block.x, block.x + block.width / 2, block.x + block.width);
            hPoints.push(block.y, block.y + block.height / 2, block.y + block.height);
        }
    });
    return { vPoints, hPoints };
  }, []);

  const calculateSnapping = useCallback((
      movingBlock: ExerciseBlockState, 
      allBlocks: ExerciseBlockState[],
      newPosition: { x: number, y: number, width: number, height: number }
  ) => {
      let points = snapPointsCache.current;
      if (!points) {
         points = getSnapPoints(allBlocks, movingBlock.id);
         snapPointsCache.current = points;
      }

      const { vPoints, hPoints } = points;
      let snappedX = newPosition.x;
      let snappedY = newPosition.y;
      const newSnapLines: SnapLine[] = [];
      const movingVPoints = [newPosition.x, newPosition.x + newPosition.width / 2, newPosition.x + newPosition.width];
      const movingHPoints = [newPosition.y, newPosition.y + newPosition.height / 2, newPosition.y + newPosition.height];

      for (const vp of vPoints) {
          for (let i = 0; i < movingVPoints.length; i++) {
              if (Math.abs(movingVPoints[i] - vp) < SNAP_THRESHOLD) {
                  snappedX = vp - (i * (newPosition.width / 2));
                  newSnapLines.push({ axis: 'x', position: vp, start: newPosition.y - 100, end: newPosition.y + newPosition.height + 100 });
                  break;
              }
          }
          if (snappedX !== newPosition.x) break;
      }
      for (const hp of hPoints) {
          for (let i = 0; i < movingHPoints.length; i++) {
              if (Math.abs(movingHPoints[i] - hp) < SNAP_THRESHOLD) {
                  snappedY = hp - (i * (newPosition.height / 2));
                  newSnapLines.push({ axis: 'y', position: hp, start: newPosition.x - 100, end: newPosition.x + newPosition.width + 100 });
                  break;
              }
          }
          if (snappedY !== newPosition.y) break;
      }
      return { snappedX, snappedY, newSnapLines };
  }, [getSnapPoints]);

  const handleInteraction = useCallback((blockId: number, newPos: {x: number, y: number, width: number, height: number}) => {
    const currentBlocks = blocksRef.current;
    const block = currentBlocks.find(b => b.id === blockId);
    if (!block) return;

    const { snappedX, snappedY, newSnapLines } = calculateSnapping(block, currentBlocks, newPos);
    setSnapLines(newSnapLines);
    setActiveInteraction({ blockId, ...newPos, x: snappedX, y: snappedY });
  }, [calculateSnapping]);
  
  const handleInteractionStop = useCallback((blockId: number, finalPos: {x: number, y: number, width: number, height: number}) => {
      // Recalculate snap on drop to ensure the block lands on the line
      const currentBlocks = blocksRef.current;
      const block = currentBlocks.find(b => b.id === blockId);

      let finalX = finalPos.x;
      let finalY = finalPos.y;

      if (block) {
          const { snappedX, snappedY } = calculateSnapping(block, currentBlocks, finalPos);
          finalX = snappedX;
          finalY = snappedY;
      }

      onUpdateBlock(blockId, { ...finalPos, x: finalX, y: finalY });
      setActiveInteraction(null);
      setSnapLines([]);
      snapPointsCache.current = null;
  }, [onUpdateBlock, calculateSnapping]);

  const handleFocus = useCallback((blockId: number) => {
      onFocusBlock(blockId);
  }, [onFocusBlock]);

  return (
    <main 
      ref={containerRef}
      id="whiteboard-main"
      className={`flex-grow bg-slate-200 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : 'cursor-default')} font-casual`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
        {isWorkspaceEmpty && (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-neutral-gray-500 pointer-events-none p-4 z-0 select-none">
                <MagicWandIcon className="w-16 h-16 text-neutral-gray-400" />
                <h2 className="text-2xl font-bold mt-4">Welcome to the Practice Genie!</h2>
                <p className="mt-2 text-lg">Your infinite whiteboard is empty.</p>
                <p className="mt-1">Drag an exercise from the sidebar to anywhere on the canvas.</p>
                <p className="mt-4 text-sm opacity-70">
                   <span className="bg-neutral-gray-300/50 px-2 py-1 rounded">Click & Drag</span> empty space to pan • Scroll to zoom
                </p>
            </div>
        )}

        <div 
            ref={backgroundRef}
            id="whiteboard-background"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ 
                backgroundPosition: `${Math.round(pan.current.x)}px ${Math.round(pan.current.y)}px`,
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}
        />

        <div
            ref={canvasRef}
            id="whiteboard-content"
            className="absolute top-0 left-0 w-full h-full origin-top-left"
            style={{
                transform: `translate(${pan.current.x}px, ${pan.current.y}px) scale(${scale})`,
                width: '100000px',
                height: '100000px',
                pointerEvents: isPanning ? 'none' : 'auto'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <SnapLinesOverlay lines={snapLines} scale={scale} />

            <BlocksLayer
                blocks={blocks}
                onUpdateBlock={onUpdateBlock}
                onRemoveBlock={onRemoveBlock}
                onFocusBlock={handleFocus}
                onInteraction={handleInteraction}
                onInteractionStop={handleInteractionStop}
                presentingBlockId={presentingBlockId}
                onEnterPresentation={onEnterPresentation}
                onExitPresentation={onExitPresentation}
                onNextSlide={onNextSlide}
                onPrevSlide={onPrevSlide}
                scaleRef={scaleRef}
            />
        </div>
    </main>
  );
};

export default React.memo(Whiteboard);
