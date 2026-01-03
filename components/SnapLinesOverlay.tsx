import React from 'react';

type SnapLine = {
    axis: 'x' | 'y';
    position: number;
    start: number;
    end: number;
}

interface SnapLinesOverlayProps {
    lines: SnapLine[];
    scale: number;
}

export const SnapLinesOverlay: React.FC<SnapLinesOverlayProps> = React.memo(({ lines, scale }) => {
    return (
        <>
            {lines.map((line, i) => {
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
        </>
    );
});
