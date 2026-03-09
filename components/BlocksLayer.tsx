import React from 'react';
import ExerciseBlock from './ExerciseBlock';
import { ExerciseBlockState } from '../types';

interface BlocksLayerProps {
    blocks: ExerciseBlockState[];
    onUpdateBlock: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
    onRemoveBlock: (blockId: number) => void;
    onFocusBlock: (blockId: number) => void;
    onInteraction: (blockId: number, newPos: {x: number, y: number, width: number, height: number}) => void;
    onInteractionStop: (blockId: number, finalPos: {x: number, y: number, width: number, height: number}) => void;
    presentingBlockId: number | null;
    onEnterPresentation: (id: number) => void;
    onExitPresentation: () => void;
    onNextSlide: () => void;
    onPrevSlide: () => void;
    scaleRef: React.MutableRefObject<number>;
    disableInteraction?: boolean;
}

export const BlocksLayer: React.FC<BlocksLayerProps> = React.memo(({
    blocks,
    onUpdateBlock,
    onRemoveBlock,
    onFocusBlock,
    onInteraction,
    onInteractionStop,
    presentingBlockId,
    onEnterPresentation,
    onExitPresentation,
    onNextSlide,
    onPrevSlide,
    scaleRef,
    disableInteraction
}) => {
    return (
        <>
            {blocks.map(block => (
                <ExerciseBlock
                    key={block.id}
                    blockState={block}
                    onUpdate={onUpdateBlock}
                    onRemove={onRemoveBlock}
                    onFocus={onFocusBlock}
                    onInteraction={onInteraction}
                    onInteractionStop={onInteractionStop}
                    isPresenting={presentingBlockId === block.id}
                    onEnterPresentation={onEnterPresentation}
                    onExitPresentation={onExitPresentation}
                    onNextSlide={onNextSlide}
                    onPrevSlide={onPrevSlide}
                    scaleRef={scaleRef}
                    disableInteraction={disableInteraction}
                />
            ))}
        </>
    );
});
