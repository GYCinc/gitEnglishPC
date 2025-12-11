import React, { useState, useCallback, useRef, useEffect } from 'react';
import ExerciseBlock from './ExerciseBlock';
import { ExerciseType, Difficulty, Tone, ExerciseBlockState } from '../types';
import { MagicWandIcon } from './icons';
import { useActivityLogger } from '../ActivityContext'; // Import logger context

interface WhiteboardProps {
  blocks: ExerciseBlockState[];
  onAddBlock: (type: ExerciseType, x: number, y: number) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
  onRemoveBlock: (blockId: number) => void;
  onFocusBlock: (blockId: number) => void;
  // Props for presentation mode
  presentingBlockId: number | null;
  onEnterPresentation: (id: number) => void;
  onExitPresentation: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  // Global settings setters are no longer passed here as GlobalSettings is handled in App.tsx
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  theme: string;
  setTheme: (t: string) => void;
  totalTime: number;
}

type SnapLine = {
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
}

const SNAP_THRESHOLD = 10;

const Whiteboard: React.FC<WhiteboardProps> = ({ 
    blocks, onAddBlock, onUpdateBlock, onRemoveBlock, onFocusBlock, 
    presentingBlockId, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide
}) => {
  const [activeInteraction, setActiveInteraction] = useState<{ blockId: number } | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  // Canvas View State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false); // Track spacebar for alternative pan

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null); // Ref for the main element to get clientWidth/Height

  const isWorkspaceEmpty = blocks.length === 0;
  const { logger } = useActivityLogger();

  // -- PAN & ZOOM HANDLERS --

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow panning if not already interacting with a block (dragging/resizing)
    if (activeInteraction) return;

    // Check if target is the background container (the big grid div) or the main container
    const target = e.target as HTMLElement;
    const isBackground = target.id === 'whiteboard-background' || target.id === 'whiteboard-main';

    // Allow panning if:
    // 1. Middle mouse (1) or Right mouse (2) is used anywhere
    // 2. Left mouse (0) is used ON THE BACKGROUND (empty space) OR if Spacebar is held down
    if (e.button === 1 || e.button === 2 || (e.button === 0 && (isBackground || isSpacePressed))) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      
      // Prevent default browser drag behaviors (e.g., image drag, text selection)
      e.preventDefault(); 
      e.stopPropagation(); // Stop propagation to prevent triggering onFocus for blocks
      logger?.startActivity('canvas_panning', 'movement', 'Canvas Panning');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if(isPanning) {
        setIsPanning(false);
        logger?.endActivity(); // End canvas panning activity
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Multiplicative zoom for smoother feel
    // zoomFactor > 1 zooms in, < 1 zooms out
    const zoomFactor = Math.exp(-e.deltaY * 0.001); 
    const newScale = Math.min(Math.max(0.1, scale * zoomFactor), 4);
    
    // Zoom towards mouse pointer for better UX
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate world coordinates before zoom
        const worldX = (mouseX - pan.x) / scale;
        const worldY = (mouseY - pan.y) / scale;

        // Calculate new pan to keep world point under mouse
        const newPanX = mouseX - worldX * newScale;
        const newPanY = mouseY - worldY * newScale;

        setPan({ x: newPanX, y: newPanY });
        logger?.logFocusItem('Movement', 'Canvas Zoom', 0.1, null, 1, [], `Scale: ${newScale.toFixed(2)}`);
    }
    setScale(newScale);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent right-click menu to allow right-click panning
  };
  
  // Track Spacebar for "Hand Tool" emulation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => { 
          if (e.code === 'Space' && e.target === document.body) { // Only if space is pressed on body
              e.preventDefault(); // Prevent scrolling page with space
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

  // -- DROP LOGIC UPDATED FOR SCALE/PAN --
  
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
        // Convert screen coords to canvas coords:
        // canvasX = (screenX - containerLeft - panX) / scale
        const x = (e.clientX - rect.left - pan.x) / scale;
        const y = (e.clientY - rect.top - pan.y) / scale;
        onAddBlock(type, x, y);
        logger?.logFocusItem('Project Management', 'Block Added via Drag', 0.1, null, 1, [], `Type: ${type}, Pos: (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
  };
  
  // -- SNAPPING & BLOCK INTERACTION --
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
      const { vPoints, hPoints } = getSnapPoints(allBlocks, movingBlock.id);
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
    // We cannot use 'blocks' state directly here if we want stability across pan/zoom IF 'blocks' changes on every pan.
    // However, blocks DOES NOT change on pan. Pan is local state in Whiteboard.
    // So 'blocks' is stable during pan.

    // We need to find the block object.
    // Using blocks from closure.
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setActiveInteraction(prev => prev || { blockId });

    const { snappedX, snappedY, newSnapLines } = calculateSnapping(block, blocks, newPos);
    setSnapLines(newSnapLines);
    onUpdateBlock(blockId, { ...newPos, x: snappedX, y: snappedY });
  }, [blocks, calculateSnapping, onUpdateBlock]);
  
  const handleInteractionStop = useCallback((blockId: number, finalPos: {x: number, y: number, width: number, height: number}) => {
      onUpdateBlock(blockId, finalPos);
      setActiveInteraction(null);
      setSnapLines([]);
  }, [onUpdateBlock]);

  // -- AUTO-CENTER LOGIC --
  const centerOnBlock = (block: ExerciseBlockState) => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const viewportW = container.clientWidth;
      const viewportH = container.clientHeight;
      
      const blockCenterX = block.x + block.width / 2;
      const blockCenterY = block.y + block.height / 2;

      // Center block in viewport accounting for scale
      const newPanX = (viewportW / 2) - (blockCenterX * scale);
      const newPanY = (viewportH / 2) - (blockCenterY * scale);

      setPan({ x: newPanX, y: newPanY });
      logger?.logFocusItem('Movement', 'Center on Block', 0.1, null, 1, [], `Block: ${block.exerciseType}, Pos: (${block.x.toFixed(0)}, ${block.y.toFixed(0)})`);
  };

  const handleFocus = useCallback((blockId: number) => {
      onFocusBlock(blockId);
      // Removed centerOnBlock(block) to prevent jarring movement on every click
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
            ref={canvasRef}
            id="whiteboard-background"
            className="absolute top-0 left-0 w-full h-full transition-transform duration-75 ease-out origin-top-left"
            style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                width: '100000px', // Massive virtual size
                height: '100000px',
                pointerEvents: isPanning ? 'none' : 'auto' // Optimize drag performance
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
             {snapLines.map((line, i) => {
                const style: React.CSSProperties = {
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                    zIndex: 9999,
                };
                if (line.axis === 'x') {
                    style.left = line.position;
                    style.top = line.start;
                    style.width = `${1 / scale}px`; 
                    style.height = line.end - line.start;
                } else {
                    style.top = line.position;
                    style.left = line.start;
                    style.height = `${1 / scale}px`;
                    style.width = line.end - line.start;
                }
                return <div key={i} style={style} />;
            })}

            {blocks.map(block => (
                <ExerciseBlock
                    key={block.id}
                    blockState={block}
                    onUpdate={onUpdateBlock}
                    onRemove={onRemoveBlock}
                    onFocus={handleFocus}
                    onInteraction={handleInteraction}
                    onInteractionStop={handleInteractionStop}
                    bounds="parent"
                    isPresenting={presentingBlockId === block.id}
                    onEnterPresentation={onEnterPresentation}
                    onExitPresentation={onExitPresentation}
                    onNextSlide={onNextSlide}
                    onPrevSlide={onPrevSlide}
                    scale={scale}
                />
            ))}
        </div>
    </main>
  );
};

export default Whiteboard;