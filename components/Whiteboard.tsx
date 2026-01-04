import React, { useState, useCallback, useRef, useEffect } from 'react';
import ExerciseBlock from './ExerciseBlock';
import { ExerciseType, ExerciseBlockState } from '../types';
import { MagicWandIcon, XMarkIcon } from './icons';
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
}

type SnapLine = {
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
}

const SNAP_THRESHOLD = 10;

// Minimap Component
const Minimap: React.FC<{
    blocks: ExerciseBlockState[];
    scale: number;
    pan: { x: number, y: number };
    viewportSize: { w: number, h: number };
    onPanTo: (x: number, y: number) => void;
}> = ({ blocks, scale, pan, viewportSize, onPanTo }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (blocks.length === 0) return null;

    // Calculate bounding box of all blocks
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    blocks.forEach(b => {
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.width);
        maxY = Math.max(maxY, b.y + b.height);
    });

    // Add padding
    const padding = 200;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;

    // Determine minimap display size
    const MAX_DISPLAY_SIZE = 150;
    const aspectRatio = mapWidth / mapHeight;
    let displayWidth = MAX_DISPLAY_SIZE;
    let displayHeight = MAX_DISPLAY_SIZE / aspectRatio;

    if (displayHeight > MAX_DISPLAY_SIZE) {
        displayHeight = MAX_DISPLAY_SIZE;
        displayWidth = MAX_DISPLAY_SIZE * aspectRatio;
    }

    const mapScale = displayWidth / mapWidth;

    const handleMapClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert click to world coords
        const worldX = minX + (clickX / mapScale);
        const worldY = minY + (clickY / mapScale);

        // Center view on this world coordinate
        // newPan = center - world * scale
        const newPanX = (viewportSize.w / 2) - (worldX * scale);
        const newPanY = (viewportSize.h / 2) - (worldY * scale);

        onPanTo(newPanX, newPanY);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 p-2 bg-slate-900 text-slate-400 rounded-lg shadow-lg hover:text-white transition-colors border border-slate-700 font-bold text-xs uppercase tracking-wide"
            >
                Map
            </button>
        );
    }

    // Viewport rectangle on minimap
    // visible area in world coords:
    // left = -panX / scale
    // top = -panY / scale
    // width = vpW / scale
    const vpWorldX = -pan.x / scale;
    const vpWorldY = -pan.y / scale;
    const vpWorldW = viewportSize.w / scale;
    const vpWorldH = viewportSize.h / scale;

    const vpRectX = (vpWorldX - minX) * mapScale;
    const vpRectY = (vpWorldY - minY) * mapScale;
    const vpRectW = vpWorldW * mapScale;
    const vpRectH = vpWorldH * mapScale;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-2xl p-2 transition-all">
             <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Minimap</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                    <XMarkIcon className="w-3 h-3" />
                </button>
             </div>
             <div
                className="relative bg-slate-800 rounded border border-slate-700 cursor-crosshair overflow-hidden"
                style={{ width: displayWidth, height: displayHeight }}
                onMouseDown={handleMapClick}
             >
                 {blocks.map(b => (
                     <div
                        key={b.id}
                        className="absolute bg-blue-500/50 rounded-sm"
                        style={{
                            left: (b.x - minX) * mapScale,
                            top: (b.y - minY) * mapScale,
                            width: Math.max(2, b.width * mapScale),
                            height: Math.max(2, b.height * mapScale)
                        }}
                     />
                 ))}

                 {/* Viewport Indicator */}
                 <div
                    className="absolute border-2 border-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.3)] pointer-events-none"
                    style={{
                        left: vpRectX,
                        top: vpRectY,
                        width: vpRectW,
                        height: vpRectH
                    }}
                 />
             </div>
        </div>
    );
};


const Whiteboard: React.FC<WhiteboardProps> = ({ 
    blocks, onAddBlock, onUpdateBlock, onRemoveBlock, onFocusBlock, 
    presentingBlockId, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide
}) => {
  // Optimization: Local state for active interaction to prevent 60fps re-renders of the App component
  const [activeInteraction, setActiveInteraction] = useState<{ blockId: number, x: number, y: number, width: number, height: number } | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  // Canvas View State
  const [scale, setScale] = useState(1);
  const pan = useRef({ x: 0, y: 0 });
  const [panState, setPanState] = useState({ x: 0, y: 0 }); // Sync state for Minimap (less frequent updates)
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false); // Track spacebar for alternative pan
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const canvasRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null); // Ref for the background grid
  const containerRef = useRef<HTMLElement>(null); // Ref for the main element to get clientWidth/Height

  const isWorkspaceEmpty = blocks.length === 0;
  const { logger } = useActivityLogger();

  useEffect(() => {
      const updateSize = () => {
          if (containerRef.current) {
              setViewportSize({
                  w: containerRef.current.clientWidth,
                  h: containerRef.current.clientHeight
              });
          }
      };
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Optimization: Keep a ref to blocks to avoid re-creating handleInteraction on every render
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Performance: Cache snap points during interaction to avoid O(N) recalculation on every drag frame
  const snapPointsCache = useRef<{ vPoints: number[], hPoints: number[] } | null>(null);

  // Helper to update DOM transform manually
  const updateTransform = () => {
       if (canvasRef.current) {
          canvasRef.current.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${scale})`;
      }
      if (backgroundRef.current) {
          backgroundRef.current.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px)`;
      }
  };

  const setPan = (x: number, y: number) => {
      pan.current = { x, y };
      updateTransform();
      // Debounce state update for minimap to avoid re-rendering entire tree on every mouse move
      // We accept that minimap trails slightly behind real-time 60fps pan
      if (!isPanning) {
          setPanState({ x, y });
      }
  };

  // Throttled update for minimap
  useEffect(() => {
      if (isPanning) {
          const id = requestAnimationFrame(() => setPanState({ ...pan.current }));
          return () => cancelAnimationFrame(id);
      }
  }, [isPanning, pan.current.x, pan.current.y]); // Relying on re-render for this effect might be slow, but isPanning triggers re-renders anyway


  // -- PAN & ZOOM HANDLERS --

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeInteraction) return;

    const target = e.target as HTMLElement;
    const isBackground = target.id === 'whiteboard-background' || target.id === 'whiteboard-main' || target.id === 'whiteboard-content';

    if (e.button === 1 || e.button === 2 || (e.button === 0 && (isBackground || isSpacePressed))) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault(); 
      e.stopPropagation();
      logger?.startActivity('canvas_panning', 'movement', 'Canvas Panning');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      pan.current = { x: pan.current.x + dx, y: pan.current.y + dy };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateTransform();
    }
  };

  const handleMouseUp = () => {
    if(isPanning) {
        setIsPanning(false);
        setPanState({ ...pan.current }); // Sync final position
        logger?.endActivity();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
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
        updateTransform();
        logger?.logFocusItem('Movement', 'Canvas Zoom', 0.1, null, 1, [], `Scale: ${newScale.toFixed(2)}`);
    }
    setScale(newScale);
    setPanState({ ...pan.current });
  };

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
        const x = (e.clientX - rect.left - pan.current.x) / scale;
        const y = (e.clientY - rect.top - pan.current.y) / scale;
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
      onUpdateBlock(blockId, finalPos);
      setActiveInteraction(null);
      setSnapLines([]);
      snapPointsCache.current = null;
  }, [onUpdateBlock]);


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
            className="absolute top-0 left-0 w-full h-full transition-transform duration-75 ease-out origin-top-left pointer-events-none"
            style={{ 
                transform: `translate(${pan.current.x}px, ${pan.current.y}px)`,
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                width: '100000px',
                height: '100000px',
            }}
        />

        <div
            ref={canvasRef}
            id="whiteboard-content"
            className="absolute top-0 left-0 w-full h-full transition-transform duration-75 ease-out origin-top-left"
            style={{
                transform: `translate(${pan.current.x}px, ${pan.current.y}px) scale(${scale})`,
                width: '100000px',
                height: '100000px',
                pointerEvents: isPanning ? 'none' : 'auto'
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

            {blocks.map(block => {
                const isDragging = activeInteraction?.blockId === block.id;
                const effectiveBlockState = isDragging
                    ? { ...block, ...activeInteraction }
                    : block;

                return (
                    <ExerciseBlock
                        key={block.id}
                        blockState={effectiveBlockState}
                        onUpdate={onUpdateBlock}
                        onRemove={onRemoveBlock}
                        onFocus={handleFocus}
                        onInteraction={handleInteraction}
                        onInteractionStop={handleInteractionStop}
                        isPresenting={presentingBlockId === block.id}
                        onEnterPresentation={onEnterPresentation}
                        onExitPresentation={onExitPresentation}
                        onNextSlide={onNextSlide}
                        onPrevSlide={onPrevSlide}
                        scale={scale}
                    />
                );
            })}
        </div>

        <Minimap
            blocks={blocks}
            scale={scale}
            pan={panState}
            viewportSize={viewportSize}
            onPanTo={setPan}
        />
    </main>
  );
};

export default React.memo(Whiteboard);