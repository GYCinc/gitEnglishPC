import React, { useState, useRef, useCallback } from 'react';
import { DrawingPath, Point } from '../types';
import { useActivityLogger } from '../ActivityContext';

interface DrawingLayerProps {
    paths: DrawingPath[];
    onAddPath: (path: DrawingPath) => void;
    isDrawingMode: boolean;
    scale: number;
    color?: string;
    width?: number;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = React.memo(({
    paths,
    onAddPath,
    isDrawingMode,
    scale,
    color = '#ef4444',
    width = 3
}) => {
    const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const logger = useActivityLogger();

    const getLocalCoordinates = (e: React.MouseEvent): Point => {
        if (!svgRef.current) return { x: 0, y: 0 };
        // Since the SVG is inside the transformed container,
        // client coordinates need to be mapped, but offsetX/Y might be enough if the target is the SVG.
        // However, if we click on an existing path, the target changes.
        // Best to use getBoundingClientRect of the SVG.
        const rect = svgRef.current.getBoundingClientRect();
        // The rect is affected by the scale of the parent.
        // We need the position relative to the top-left of the SVG element itself (0,0 in local space).

        // This is tricky because of the CSS transform scale on the parent.
        // clientX - rect.left gives x in "screen pixels" relative to the visual top-left of the SVG.
        // We need to divide by the scale to get "SVG local units".

        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isDrawingMode) return;
        // Only start if left click
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        const point = getLocalCoordinates(e);
        setCurrentPath([point]);

        logger?.logFocusItem('Pedagogy', 'Tracing Started', 0.5);
    }, [isDrawingMode, scale, logger]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!currentPath) return;

        e.preventDefault();
        e.stopPropagation();

        const point = getLocalCoordinates(e);
        setCurrentPath(prev => prev ? [...prev, point] : null);
    }, [currentPath, scale]);

    const handleMouseUp = useCallback(() => {
        if (currentPath && currentPath.length > 1) {
            const newPath: DrawingPath = {
                id: Date.now().toString(),
                points: currentPath,
                color,
                width
            };
            onAddPath(newPath);
            logger?.logFocusItem('Pedagogy', 'Tracing Completed', 1.0, null, 1, [], `Points: ${currentPath.length}`);
        }
        setCurrentPath(null);
    }, [currentPath, color, width, onAddPath, logger]);

    // Render paths as SVG <polyline> or <path>
    // Using polyline is easier for array of points.
    const renderPath = (points: Point[]) => {
        return points.map(p => `${p.x},${p.y}`).join(' ');
    };

    // Stroke width should be adjusted by scale so it looks consistent on screen?
    // If I zoom out (scale < 1), everything gets smaller.
    // If I want the line to appear 3px thick on screen, the SVG stroke width needs to be 3 / scale.
    // Wait, if the SVG is scaled with the content, then a 3px line becomes smaller visually when zoomed out.
    // This mimics a physical whiteboard where ink has fixed physical size.
    // "Tracing" usually implies writing on the board. If I zoom out, the text I wrote should shrink.
    // So fixed stroke width (in local units) is actually better for "writing on the board".
    // If I write "Hello" at zoom 1, and zoom out to 0.5, "Hello" should be half size.
    // So I will NOT divide by scale. I will use constant width.
    const effectiveWidth = width;

    return (
        <svg
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-auto"
            style={{
                zIndex: isDrawingMode ? 9999 : 0, // Above everything when drawing, below otherwise?
                // Actually, if it's below blocks, we can't draw over them.
                // It should be above blocks (z-index wise) to allow annotating ON blocks.
                // But if not in drawing mode, it should let clicks pass through.
                pointerEvents: isDrawingMode ? 'all' : 'none',
                overflow: 'visible'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {paths.map(path => (
                <polyline
                    key={path.id}
                    points={renderPath(path.points)}
                    stroke={path.color}
                    strokeWidth={path.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ))}
            {currentPath && (
                <polyline
                    points={renderPath(currentPath)}
                    stroke={color}
                    strokeWidth={effectiveWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.7 }}
                />
            )}
        </svg>
    );
});

DrawingLayer.displayName = 'DrawingLayer';
