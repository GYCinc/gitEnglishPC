
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ExerciseBlock from './ExerciseBlock';
import { ExerciseType, Difficulty, Tone, ExerciseBlockState } from '../types';
import { MagicWandIcon } from './icons';
import GlobalSettings from './GlobalSettings';

interface WhiteboardProps {
  blocks: ExerciseBlockState[];
  onAddBlock: (type: ExerciseType, x: number, y: number) => void;
  onUpdateBlock: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
  onRemoveBlock: (blockId: number) => void;
  onFocusBlock: (blockId: number) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  theme: string;
  setTheme: (t: string) => void;
  totalTime: number;
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

const Whiteboard: React.FC<WhiteboardProps> = ({ 
    blocks, onAddBlock, onUpdateBlock, onRemoveBlock, onFocusBlock, 
    difficulty, setDifficulty, tone, setTone, theme, setTheme, totalTime,
    presentingBlockId, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide
}) => {
  const [activeInteraction, setActiveInteraction] = useState<{ blockId: number } | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  // Canvas View State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const isWorkspaceEmpty = blocks.length === 0;

  // -- PAN & ZOOM HANDLERS --

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle mouse (1) or Right mouse (2) to pan
    if (e.button === 2 || e.button === 1) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
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
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on wheel
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale + scaleAmount), 4);
    
    // Optional: Zoom towards mouse pointer logic could go here
    // For simplicity, we zoom center or current view
    setScale(newScale);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent right-click menu
  };

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
        // canvasX = (screenX - panX) / scale
        const x = (e.clientX - rect.left - pan.x) / scale;
        const y = (e.clientY - rect.top - pan.y) / scale;
        onAddBlock(type, x, y);
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

  const calculateSnapping = (
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

      // Simple snapping logic
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
  };

  const handleInteraction = (blockId: number, newPos: {x: number, y: number, width: number, height: number}) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    if (!activeInteraction) {
        setActiveInteraction({ blockId });
    }
    const { snappedX, snappedY, newSnapLines } = calculateSnapping(block, blocks, newPos);
    setSnapLines(newSnapLines);
    onUpdateBlock(blockId, { ...newPos, x: snappedX, y: snappedY });
  };
  
  const handleInteractionStop = (blockId: number, finalPos: {x: number, y: number, width: number, height: number}) => {
      onUpdateBlock(blockId, finalPos);
      setActiveInteraction(null);
      setSnapLines([]);
  }

  // -- AUTO-CENTER LOGIC --
  const centerOnBlock = (block: ExerciseBlockState) => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const viewportW = container.clientWidth;
      const viewportH = container.clientHeight;
      
      const blockCenterX = block.x + block.width / 2;
      const blockCenterY = block.y + block.height / 2;

      const newPanX = (viewportW / 2) - (blockCenterX * scale);
      const newPanY = (viewportH / 2) - (blockCenterY * scale);

      setPan({ x: newPanX, y: newPanY });
  };

  const handleFocusAndCenter = (blockId: number) => {
      onFocusBlock(blockId);
      const block = blocks.find(b => b.id === blockId);
      if (block) {
          centerOnBlock(block);
      }
  };

  return (
    <main 
      ref={containerRef}
      id="whiteboard-main"
      className={`flex-grow bg-slate-200 relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
        <div className={`fixed top-4 left-4 right-4 z-50 pointer-events-none flex justify-center transition-opacity duration-300 ${presentingBlockId ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="pointer-events-auto">
                <GlobalSettings
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  tone={tone}
                  setTone={setTone}
                  theme={theme}
                  setTheme={setTheme}
                  totalTime={totalTime}
                />
            </div>
        </div>

        {isWorkspaceEmpty && (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-slate-500 pointer-events-none p-4 z-0 select-none">
                <MagicWandIcon />
                <h2 className="text-2xl font-bold mt-4">Welcome to the Practice Genie!</h2>
                <p className="mt-2 text-lg">Your infinite whiteboard is empty.</p>
                <p className="mt-1">Drag an exercise from the sidebar to anywhere on the canvas.</p>
                <p className="mt-4 text-sm opacity-70">Right-click drag to pan • Scroll to zoom</p>
            </div>
        )}

        <div 
            ref={canvasRef}
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
                    onUpdate={(blockId, updates) => onUpdateBlock(blockId, updates)}
                    onRemove={onRemoveBlock}
                    onFocus={handleFocusAndCenter}
                    onDrag={(e, data) => handleInteraction(block.id, { ...block, x: data.x, y: data.y })}
                    onDragStop={(e, data) => handleInteractionStop(block.id, { ...block, x: data.x, y: data.y })}
                    onResize={(e, direction, ref, delta, position) => handleInteraction(block.id, { ...block, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...position })}
                    onResizeStop={(e, direction, ref, delta, position) => handleInteractionStop(block.id, { ...block, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...position })}
                    bounds="parent"
                    isPresenting={presentingBlockId === block.id}
                    onEnterPresentation={() => onEnterPresentation(block.id)}
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
