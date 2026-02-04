import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { ExerciseType, Difficulty, Tone } from '../enums';
import { ExerciseBlockState } from '../types';
import { generateExercises } from '../services/mistralService';
import { LoadingIcon, TrashIcon, SettingsIcon, ResetIcon, PlayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, MagicWandIcon } from './icons';
import { useDebounce } from '../hooks/useDebounce';
import { useResponsiveScale } from '../hooks/useResponsiveScale';
import { useAttentionTracker } from '../hooks/useAttentionTracker'; // Import new hook
import { DIFFICULTY_LEVELS, TONES, PEDAGOGY_COLORS, EXERCISE_PEDAGOGY, calculateExerciseAmount, calculateExerciseDuration, SINGLE_INSTANCE_TYPES, DIFFICULTY_LABELS } from '../constants';
import ExerciseTemplate from './ExerciseTemplate';
import { EXERCISE_INSTRUCTIONS } from './exerciseInstructions';
import { 
    InteractiveFITB, InteractiveWordFormation, InteractiveMCQ, InteractiveSentenceScramble, 
    InteractiveClozeOrDialogue, InteractiveMatching, InteractiveErrorCorrection, 
    InteractiveStorySequencing, InteractiveReadingGist, InteractiveReadingDetail, 
    InteractivePicturePrompt, InteractiveOpenResponseTask, InteractiveDictoGloss, 
    InteractiveCollocationOddOneOut, InteractiveInformationTransfer, InteractiveListening, 
    InteractiveRegisterSort 
} from './InteractiveExercises'; // Import all interactive components
import { useActivityLogger } from '../ActivityContext'; // Import logger context

export interface ExerciseBlockProps {
  blockState: ExerciseBlockState;
  onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
  onRemove: (blockId: number) => void;
  onFocus: (blockId: number) => void; // Called onMouseDown on the block
  // Stable handlers for interaction (replacing inline Rnd callbacks)
  onInteraction: (blockId: number, newPos: {x: number, y: number, width: number, height: number}) => void;
  onInteractionStop: (blockId: number, finalPos: {x: number, y: number, width: number, height: number}) => void;
  isPresenting: boolean;
  onEnterPresentation: (id: number) => void; // Expects ID to be passed
  onExitPresentation: () => void;
  onNextSlide: () => void; // Global next slide (for next block in app.tsx)
  onPrevSlide: () => void; // Global prev slide (for prev block in app.tsx)
  scaleRef: React.MutableRefObject<number>; // Ref to current zoom scale (optimization)
}

// Header Component
const Header = React.memo(React.forwardRef<HTMLDivElement, {
  title: string;
  pedagogy: string;
  textColor: string;
  onRemove: () => void;
  onRegenerate: () => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  isGenerated: boolean;
  onGenerate: () => void;
  generateAmount: number;
  estimatedDuration: number;
  quantity?: number;
  onQuantityChange: (val: number | undefined) => void;
  isSingleInstance: boolean;
  // Presentation Props
  isPresenting?: boolean;
  onEnterPresentation?: () => void;
  onExitPresentation?: () => void;
  onPrevItem?: () => void; // Navigates items WITHIN this block
  onNextItem?: () => void; // Navigates items WITHIN this block
  currentItem?: number;
  totalItems?: number;
}>(({ 
    title, pedagogy, textColor, onRemove, onRegenerate, onToggleSettings, isSettingsOpen, isGenerated, onGenerate, 
    generateAmount, estimatedDuration, quantity, onQuantityChange, isSingleInstance,
    isPresenting, onEnterPresentation, onExitPresentation, onPrevItem, onNextItem, currentItem, totalItems
}, ref) => {
    // Header is now memoized to prevent re-renders during drag operations.
    // Callbacks passed here must be stable.

    // Note: We are logging interactions inside the callbacks which are passed as props or defined here.
    // Since Header is memoized, we need to ensure logging doesn't break memoization if logger changes.
    // However, logger from context is stable enough or we assume it is.

    // We can't use hooks here for logic that depends on block props unless passed in.
    // The previous implementation had logging logic inside handlers defined in Header.
    // We will keep them here.

    const { logger } = useActivityLogger();

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Project Management', 'Exercise Block Removed', 0.1, null, 1, [], title);
        onRemove();
    }, [logger, onRemove, title]);

    const handleRegenerate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Activity Management', 'Exercise Regenerated', 0.1, null, 1, [], title);
        onRegenerate();
    }, [logger, onRegenerate, title]);

    const handleGenerate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Activity Management', 'Exercise Generated', 0.1, null, 1, [], `${title} x${generateAmount}`);
        onGenerate();
    }, [logger, onGenerate, title, generateAmount]);

    const handleToggleSettings = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Settings', `Block Settings ${isSettingsOpen ? 'Closed' : 'Opened'}`, 0.1, null, 1, [], title);
        onToggleSettings();
    }, [logger, onToggleSettings, isSettingsOpen, title]);

    const handleEnterPresentation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.startActivity(`presentation_${title.replace(/\s/g, '_')}_${Date.now()}`, 'presentation', `Presenting: ${title}`);
        logger?.logFocusItem('Interaction', 'Entered Live Mode', 0.1);
        onEnterPresentation?.();
    }, [logger, onEnterPresentation, title]);

    const handleExitPresentation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Exited Live Mode', 0.1);
        logger?.endActivity(); // Ends the presentation activity
        onExitPresentation?.();
    }, [logger, onExitPresentation]);

    const handleNextItem = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Presentation Next Item', 0.1, null, 1, [], `Block: ${title}, Item: ${(currentItem || 0) + 1}/${totalItems}`);
        onNextItem?.();
    }, [logger, onNextItem, currentItem, totalItems, title]);

    const handlePrevItem = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Presentation Previous Item', 0.1, null, 1, [], `Block: ${title}, Item: ${(currentItem || 0) - 1}/${totalItems}`);
        onPrevItem?.();
    }, [logger, onPrevItem, currentItem, totalItems, title]);

    return (
        <div ref={ref} className={`handle bg-slate-800 text-white p-3 ${isPresenting ? 'rounded-none p-6' : 'rounded-t-2xl'} flex justify-between items-center cursor-move flex-shrink-0 border-b border-slate-700 relative z-10 font-casual`}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {isPresenting && (
                     <button onMouseDown={(e) => e.stopPropagation()} onClick={handleExitPresentation} className="p-2 rounded-full hover:bg-slate-700 text-neutral-gray-400 hover:text-white transition-colors mr-2 relative z-50" title="Exit Live Mode" aria-label="Exit Live Mode">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                     <h3 className={`font-playful font-bold ${isPresenting ? 'text-3xl' : 'text-lg'} select-none ${textColor} tracking-wide truncate`}>{title}</h3>
                     <div className="flex gap-2 items-center">
                        <span className={`${isPresenting ? 'text-sm px-3 py-1.5' : 'text-[10px] px-2 py-1'} uppercase tracking-widest font-bold bg-slate-900/50 text-neutral-gray-400 rounded-full border border-slate-700 select-none whitespace-nowrap`}>{pedagogy}</span>
                        <span className={`${isPresenting ? 'text-sm px-3 py-1.5' : 'text-[10px] px-2 py-1 hidden sm:flex'} font-bold bg-slate-700 text-neutral-gray-300 rounded-full border border-slate-600 select-none flex items-center gap-1 whitespace-nowrap`} title="Estimated completion time">
                            <span>⏱</span> ~{estimatedDuration}m
                        </span>
                     </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 relative z-50">
                 {/* Navigation Controls in Header for Presentation Mode */}
                 {isPresenting && totalItems && totalItems > 1 && (
                     <div className="flex items-center gap-4 mr-4 border-r border-slate-700 pr-4">
                         <span className="text-sm font-mono font-bold text-neutral-gray-400">{currentItem} / {totalItems}</span>
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={handlePrevItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === 1} aria-label="Previous item"><ChevronLeftIcon className="w-6 h-6" /></button>
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleNextItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === totalItems} aria-label="Next item"><ChevronRightIcon className="w-6 h-6" /></button>
                     </div>
                 )}

                 {/* Qty Input (Hide in presentation) */}
                 {!isGenerated && !isSingleInstance && !isPresenting && (
                     <div className={`flex items-center bg-slate-900/50 rounded-lg px-2 py-1 border ${quantity ? 'border-primary-blue-500/50' : 'border-slate-600'} mr-1 transition-colors`}>
                        <span className={`text-[10px] font-bold uppercase mr-1.5 ${quantity ? 'text-primary-blue-400' : 'text-neutral-gray-500'}`}>Qty</span>
                        <input 
                            type="number" 
                            min="1" 
                            max="50"
                            value={generateAmount} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onQuantityChange(isNaN(val) || val < 1 ? undefined : val);
                            }}
                             onMouseDown={(e) => e.stopPropagation()}
                            className={`w-6 bg-transparent text-center text-xs font-bold outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none ${quantity ? 'text-primary-blue-400' : 'text-neutral-gray-300'}`}
                            title="Manually set amount (overrides auto-size)"
                            aria-label="Exercise quantity"
                        />
                     </div>
                 )}

                 {/* Standard Controls */}
                 {!isPresenting && (
                     <>
                        {/* Presentation Button - Prominent Live Mode */}
                         {isGenerated && (
                             <button
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={handleEnterPresentation}
                                className="px-3 py-1.5 rounded-full bg-red-600 text-white font-bold hover:bg-red-500 transition-all shadow-lg hover:shadow-red-500/30 active:scale-95 flex items-center gap-2 mr-2 animate-pulse-slow"
                                title="Start Live Mode"
                                aria-label="Start Live Mode"
                             >
                                <PlayIcon className="w-3.5 h-3.5 fill-current" />
                                <span className="text-xs uppercase tracking-wider">Live</span>
                             </button>
                         )}

                         {isGenerated ? (
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={handleRegenerate} className="p-1.5 rounded-full hover:bg-primary-blue-500/20 text-primary-blue-400 hover:text-primary-blue-300 transition-colors" title="Regenerate" aria-label="Regenerate exercise">
                                <ResetIcon className="w-4 h-4" />
                            </button>
                         ) : (
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={handleGenerate} className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-warm-orange-500 to-innovation-pink-500 text-white font-bold hover:brightness-110 transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap" title="Generate" aria-label="Generate exercise">
                                <MagicWandIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Generate</span>
                            </button>
                         )}
                         <button onMouseDown={(e) => e.stopPropagation()} onClick={handleToggleSettings} className={`p-1.5 rounded-full ${isSettingsOpen ? 'bg-slate-700 text-white' : 'text-neutral-gray-400 hover:text-white'} transition-colors`} title="Settings" aria-label="Exercise settings">
                            <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button onMouseDown={(e) => e.stopPropagation()} onClick={handleRemove} className="p-1.5 rounded-full hover:bg-energy-red-500/20 text-energy-red-400 hover:text-energy-red-300 transition-colors" title="Remove" aria-label="Remove exercise block">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                     </>
                 )}
            </div>
        </div>
    );
}));
Header.displayName = 'Header';

// Settings Component
// Refactored to accept granular props to avoid re-render on block position change (drag)
const Settings = React.memo(React.forwardRef<HTMLDivElement, {
    id: number;
    difficulty: Difficulty;
    tone: Tone;
    theme: string;
    exerciseType: ExerciseType;
    onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
}>(({ id, difficulty, tone, theme, exerciseType, onUpdate }, ref) => {
    const { logger } = useActivityLogger();

    const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = e.target.value as Difficulty;
        onUpdate(id, { difficulty: newDifficulty });
        logger?.logFocusItem('Settings', 'Block Difficulty Changed', 0.1, null, 1, [], `Block: ${exerciseType}, Set to: ${newDifficulty}`);
    }, [id, exerciseType, onUpdate, logger]);

    const handleToneChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTone = e.target.value as Tone;
        onUpdate(id, { tone: newTone });
        logger?.logFocusItem('Settings', 'Block Tone Changed', 0.1, null, 1, [], `Block: ${exerciseType}, Set to: ${newTone}`);
    }, [id, exerciseType, onUpdate, logger]);

    const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTheme = e.target.value;
        onUpdate(id, { theme: newTheme });
        logger?.logFocusItem('Settings', 'Block Theme Changed', 0.1, null, 1, [], `Block: ${exerciseType}, Set to: ${newTheme}`);
    }, [id, exerciseType, onUpdate, logger]);

    return (
        <div ref={ref} className="p-3 border-b border-neutral-gray-100 bg-paper-bg grid grid-cols-2 gap-3 flex-shrink-0 relative z-10 font-casual">
            <label htmlFor={`block-difficulty-${id}`} className="sr-only">Block Difficulty</label>
            <select
                id={`block-difficulty-${id}`}
                value={difficulty}
                onChange={handleDifficultyChange}
                className="text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400"
            >
                {DIFFICULTY_LEVELS.map(d => (
                    <option key={d} value={d}>
                        {DIFFICULTY_LABELS[d] || d}
                    </option>
                ))}
            </select>
            <label htmlFor={`block-tone-${id}`} className="sr-only">Block Tone</label>
            <select
                id={`block-tone-${id}`}
                value={tone}
                onChange={handleToneChange}
                className="text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400"
            >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label htmlFor={`block-theme-${id}`} className="sr-only">Block Theme</label>
            <input
                id={`block-theme-${id}`}
                type="text"
                value={theme}
                onChange={handleThemeChange}
                onBlur={handleThemeChange} // Log on blur for text input
                className="col-span-2 text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400 placeholder-neutral-gray-400"
                placeholder="Theme (e.g., travel, food)"
            />
        </div>
    );
}));
Settings.displayName = 'Settings';

// ExerciseContent component now uses activeIndex to show a single question
const ExerciseContent: React.FC<{ type: ExerciseType; content: any[]; colors: any; activeIndex?: number; blockId: number; exerciseType: ExerciseType }> = React.memo(({ type, content, colors, activeIndex, blockId, exerciseType }) => {
    const { logger, startActivity, endActivity, logFocusItem } = useActivityLogger();

    // Start activity for the specific exercise block content when it's first rendered in full
    useEffect(() => {
        startActivity(`exercise_content_${blockId}`, type as any, `Exercise: ${type}`);
        return () => endActivity();
    }, [blockId, type, startActivity, endActivity]);

    const renderExercise = (ex: any, i: number) => {
        let component;
        // Generate a unique ID for each focus item to be used for logging
        const focusItemId = `${blockId}_item_${i}`;
        
        switch (type) {
            case ExerciseType.FITB:
            case ExerciseType.CollocationGapFill:
            case ExerciseType.PhrasalVerbGapFill:
                component = <InteractiveFITB key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                break;
            case ExerciseType.WordFormation:
                component = <InteractiveWordFormation key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                break;
            case ExerciseType.MultipleChoice:
            case ExerciseType.Prediction:
            case ExerciseType.RuleDiscovery:
            case ExerciseType.SpotTheDifference:
            case ExerciseType.PolitenessScenarios:
            case ExerciseType.InferringMeaning:
                component = <InteractiveMCQ key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                break;
            case ExerciseType.SentenceScramble:
                 component = <InteractiveSentenceScramble key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.ClozeParagraph:
            case ExerciseType.DialogueCompletion:
                 component = <InteractiveClozeOrDialogue key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
             case ExerciseType.Matching:
             case ExerciseType.FunctionMatching:
                 component = <InteractiveMatching key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
             case ExerciseType.StorySequencing:
                 component = <InteractiveStorySequencing key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
             case ExerciseType.ErrorCorrection:
                  component = <InteractiveErrorCorrection key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                  break;
            case ExerciseType.PicturePrompt:
                 component = <InteractivePicturePrompt key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.MoralDilemma:
            case ExerciseType.FunctionalWriting:
            case ExerciseType.ProblemSolvingScenario:
            case ExerciseType.RolePlayScenario:
            case ExerciseType.StorytellingFromPrompts:
            case ExerciseType.JustifyYourOpinion:
            case ExerciseType.PictureComparison:
                 component = <InteractiveOpenResponseTask key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.ReadingGist:
                 component = <InteractiveReadingGist key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.ReadingDetail:
                 component = <InteractiveReadingDetail key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.DictoGloss:
                 component = <InteractiveDictoGloss key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.CollocationOddOneOut:
                 component = <InteractiveCollocationOddOneOut key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.InformationTransfer:
                 component = <InteractiveInformationTransfer key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.ListeningSpecificInfo:
                 component = <InteractiveListening key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            case ExerciseType.RegisterSort:
                 component = <InteractiveRegisterSort key={focusItemId} exercise={ex} colors={colors} focusItemId={focusItemId} logFocusItem={logFocusItem} />;
                 break;
            default:
                component = <p className={colors.textOnLight}>Unsupported exercise type.</p>;
        }

        // In presentation mode, use 'hidden' for non-active slides to preserve state
        if (activeIndex !== undefined) {
            return (
                <div key={focusItemId} className={`${activeIndex === i ? 'block' : 'hidden'} w-full`}>
                    {component}
                </div>
            );
        }
        
        // Normal mode: render in list
        return <div key={focusItemId} className="mb-8 last:mb-0">{component}</div>;
    };
    
    // In presentation mode, we render all items but only one is visible at a time via CSS.
    // This preserves the state of user inputs when navigating.
    return <div className="space-y-8">{content.map((ex, i) => renderExercise(ex, i))}</div>;
});

const PlaceholderView: React.FC<{ amount: number; exerciseType: ExerciseType; }> = React.memo(({ amount, exerciseType }) => (
    <div className="space-y-4">
        {Array.from({ length: amount }).map((_, i) => (
            <ExerciseTemplate key={i} type={exerciseType} index={i} />
        ))}
    </div>
));

// Extracted Content Component for Performance
interface ExerciseBlockContentProps {
    colors: any;
    presentationCardVisualClasses: string;
    exerciseType: ExerciseType;
    pedagogy: string;
    handleRemoveWrapper: () => void;
    handleRegenerate: () => void;
    handleToggleSettingsWrapper: () => void;
    isSettingsOpen: boolean;
    isGenerated: boolean;
    handleGenerate: () => void;
    generateAmount: number;
    estimatedDuration: number;
    quantity: number | undefined;
    handleQuantityChangeWrapper: (val: number | undefined) => void;
    isSingleInstance: boolean;
    isPresenting: boolean;
    handleEnterPresentationWrapper: () => void;
    onExitPresentation: () => void;
    handlePrevItem: () => void;
    handleNextItem: () => void;
    currentSlide: number;
    content: any;
    id: number;
    difficulty: Difficulty;
    tone: Tone;
    theme: string;
    onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
    presentationScale: number;
    renderContent: () => React.ReactNode;
    headerRef: React.RefObject<HTMLDivElement>;
    settingsRef: React.RefObject<HTMLDivElement>;
    contentWrapperRef: React.RefObject<HTMLDivElement>;
}

const ExerciseBlockContent: React.FC<ExerciseBlockContentProps> = React.memo(({
    colors, presentationCardVisualClasses, exerciseType, pedagogy, handleRemoveWrapper, handleRegenerate,
    handleToggleSettingsWrapper, isSettingsOpen, isGenerated, handleGenerate, generateAmount, estimatedDuration,
    quantity, handleQuantityChangeWrapper, isSingleInstance, isPresenting, handleEnterPresentationWrapper,
    onExitPresentation, handlePrevItem, handleNextItem, currentSlide, content, id, difficulty, tone, theme,
    onUpdate, presentationScale, renderContent, headerRef, settingsRef, contentWrapperRef
}) => {
    return (
        <div className={`card-visual flex flex-col h-full w-full bg-paper-bg border-4 ${colors.border} ${presentationCardVisualClasses}`}>
            <Header
                ref={headerRef}
                title={exerciseType}
                pedagogy={pedagogy}
                textColor={colors.textOnDark}
                onRemove={handleRemoveWrapper}
                onRegenerate={handleRegenerate}
                onToggleSettings={handleToggleSettingsWrapper}
                isSettingsOpen={isSettingsOpen}
                isGenerated={isGenerated}
                onGenerate={handleGenerate}
                generateAmount={generateAmount}
                estimatedDuration={estimatedDuration}
                quantity={quantity}
                onQuantityChange={handleQuantityChangeWrapper}
                isSingleInstance={isSingleInstance}
                isPresenting={isPresenting}
                onEnterPresentation={handleEnterPresentationWrapper}
                onExitPresentation={onExitPresentation}
                onPrevItem={handlePrevItem}
                onNextItem={handleNextItem}
                currentItem={currentSlide + 1}
                totalItems={Array.isArray(content) ? content.length : 1}
            />

            {isSettingsOpen && !isPresenting && (
                <Settings
                    ref={settingsRef}
                    id={id}
                    difficulty={difficulty}
                    tone={tone}
                    theme={theme}
                    exerciseType={exerciseType}
                    onUpdate={onUpdate}
                />
            )}

            <div className={`p-5 min-h-0 overflow-hidden flex-grow overflow-y-auto custom-scrollbar-light ${isPresenting ? 'flex justify-center items-center' : ''}`}>
                <div
                    ref={contentWrapperRef}
                    className={`w-fit max-w-[900px] ${isGenerated ? '' : 'w-full'} origin-center transition-transform duration-200`}
                        style={isPresenting ? { transform: `scale(${presentationScale})` } : {}}
                >
                    {renderContent()}
                </div>
            </div>
        </div>
    );
});

const ExerciseBlock: React.FC<ExerciseBlockProps> = React.memo(({
    blockState, onUpdate, onRemove, onFocus,
    onInteraction, onInteractionStop,
    isPresenting, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide,
    scaleRef
}) => {
    const { id, x, y, width, height, zIndex, exerciseType, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, isGenerated, quantity } = blockState;
    const [content, setContent] = useState<any[] | { error: string }>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Performance Optimization: Local state for Rnd scale
    // We avoid passing the changing 'scale' prop directly to prevent re-rendering all blocks on zoom.
    // Instead, we update this local state only when interaction starts.
    const [internalScale, setInternalScale] = useState(scaleRef.current);
    
    const { logger, startActivity, endActivity } = useActivityLogger();

    // Optimization: Keep a ref to blockState to avoid re-creating interaction handlers on every render
    const blockStateRef = useRef(blockState);
    // Update ref via useLayoutEffect to ensure it's up-to-date before any effects or event handlers run
    useLayoutEffect(() => {
        blockStateRef.current = blockState;
    }, [blockState]);

    // Presentation Mode Internal State
    const [currentSlide, setCurrentSlide] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null); // Ref for content inner wrapper
    
    // Scale for Presentation Mode - Huge Max Scale for "Zoom into your face" effect
    // 5.0 is a safe upper limit to fill 4k screens even if the component is small
    const presentationScale = useResponsiveScale(900, contentWrapperRef, 5.0, isPresenting);

    // Attach tracking to content
    // We only track when there is content and we are presenting or interacting
    useAttentionTracker(contentWrapperRef, isGenerated, 100);

    const debouncedTheme = useDebounce(theme, 500);
    const pedagogy = EXERCISE_PEDAGOGY[exerciseType] || 'Default';
    const colors = PEDAGOGY_COLORS[pedagogy];

    const autoAmount = useMemo(() => calculateExerciseAmount(exerciseType, height), [exerciseType, height]);
    const generateAmount = quantity ?? autoAmount;
    const estimatedDuration = useMemo(() => calculateExerciseDuration(exerciseType, height, quantity), [exerciseType, height, quantity]);
    const isSingleInstance = SINGLE_INSTANCE_TYPES.includes(exerciseType);

    // Precise Snap-to-Content Logic (Active only when NOT presenting)
    useEffect(() => {
        // Only run resize observer if NOT presenting and content is generated
        if (!isGenerated || !contentWrapperRef.current || isPresenting) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === contentWrapperRef.current) {
                    // contentWidth & contentHeight are the intrinsic size of the content
                    const contentWidth = entry.contentRect.width;
                    const contentHeight = entry.contentRect.height;
                    
                    const headerHeight = headerRef.current?.offsetHeight || 0;
                    const settingsHeight = isSettingsOpen ? (settingsRef.current?.offsetHeight || 0) : 0;
                    
                    // Add padding/border for the Rnd container (p-5 on content = 40px vertical/horizontal)
                    // Border of the outer div (border-4 = 8px total)
                    const horizontalPadding = 40 + 8; 
                    const verticalPadding = 40 + 8;

                    const desiredWidth = Math.max(350, contentWidth + horizontalPadding); // Min width to prevent UI crushing
                    const desiredHeight = headerHeight + settingsHeight + contentHeight + verticalPadding;

                    // Optimization: Read current width/height from ref to avoid adding them to dependency array
                    // This prevents destroying and recreating the ResizeObserver on every size update (thrashing)
                    const currentWidth = blockStateRef.current.width;
                    const currentHeight = blockStateRef.current.height;

                    // Apply change if it differs significantly to prevent micro-jitter
                    if (Math.abs(desiredWidth - currentWidth) > 5 || Math.abs(desiredHeight - currentHeight) > 5) {
                         onUpdate(id, { 
                            width: desiredWidth,
                            height: desiredHeight 
                        });
                    }
                }
            }
        });

        resizeObserver.observe(contentWrapperRef.current);
        return () => resizeObserver.disconnect();
    }, [content, isGenerated, isSettingsOpen, id, onUpdate, isPresenting]); // Removed width, height to prevent loop


    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        startActivity(`generate_block_${id}`, 'activity', `Generate Block: ${exerciseType}`);
        const result = await generateExercises(
            exerciseType, difficulty, tone, debouncedTheme, generateAmount, 
            focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
        );
        setContent(result);
        setIsLoading(false);
        onUpdate(id, { isGenerated: true });
        endActivity(); // End generation activity
    }, [exerciseType, difficulty, tone, debouncedTheme, generateAmount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, onUpdate, id, startActivity, endActivity]);

    // Stable callback for regenerate
    const handleRegenerate = useCallback(() => {
        onUpdate(id, { isGenerated: false });
        // Logger handled in Header component
    }, [onUpdate, id]);
    
    // Presentation Navigation Handlers (for individual items within this block)
    const handleNextItem = useCallback(() => {
        if (Array.isArray(content) && currentSlide < content.length - 1) {
            setCurrentSlide(prev => prev + 1);
            // Logger handled in Header
        }
    }, [content, currentSlide]);

    const handlePrevItem = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
            // Logger handled in Header
        }
    }, [currentSlide]);

    // Reset slide index when entering presentation mode
    useEffect(() => {
        if (isPresenting) {
            setCurrentSlide(0);
        }
    }, [isPresenting]);

    // Keyboard Navigation for Presentation Mode
    useEffect(() => {
        if (!isPresenting) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                handleNextItem();
            } else if (e.key === 'ArrowLeft') {
                handlePrevItem();
            } else if (e.key === 'Escape' && onExitPresentation) {
                onExitPresentation();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresenting, handleNextItem, handlePrevItem, onExitPresentation]);
    
    // Stable render function to prevent re-renders of ExerciseBlockContent
    const renderContent = useCallback(() => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-full min-h-[200px]" role="status" aria-live="polite" aria-label="Generating exercise content">
                    <LoadingIcon className="w-12 h-12 text-neutral-gray-300 animate-spin" />
                    <span className="sr-only">Generating exercise content...</span>
                </div>
            );
        }
        if (!isGenerated) {
            return <PlaceholderView amount={generateAmount} exerciseType={exerciseType} />;
        }
        
        const instruction = EXERCISE_INSTRUCTIONS[exerciseType];
        
        return (
            <>
                {instruction && <p className="text-xs font-bold uppercase tracking-widest text-neutral-gray-500 mb-4 font-casual">{instruction}</p>}
                {('error' in content) ? (
                    <div className="text-energy-red-500 text-sm p-4 bg-energy-red-50 rounded-xl border-2 border-energy-red-100">
                        <p className="font-bold mb-1">Oops!</p>
                        <p>{content.error}</p>
                    </div>
                ) : (
                    <ExerciseContent 
                        type={exerciseType} 
                        content={content} 
                        colors={colors} 
                        activeIndex={isPresenting ? currentSlide : undefined} // Only pass activeIndex if presenting
                        blockId={id} // Pass blockId for logging from InteractiveExercises
                        exerciseType={exerciseType} // Pass exerciseType for logging from InteractiveExercises
                    />
                )}
            </>
        );
    }, [isLoading, isGenerated, generateAmount, exerciseType, content, colors, isPresenting, currentSlide, id]);

    // Stable handlers to create interaction data and pass to parent
    // Optimization: Use blockStateRef to keep these callbacks stable (avoid recreation on every drag frame)
    const handleDrag: RndDragCallback = useCallback((e, data) => {
        onInteraction(id, { ...blockStateRef.current, x: data.x, y: data.y });
    }, [id, onInteraction]);

    const handleDragStop: RndDragCallback = useCallback((e, data) => {
        onInteractionStop(id, { ...blockStateRef.current, x: data.x, y: data.y });
    }, [id, onInteractionStop]);

    const handleResize: RndResizeCallback = useCallback((e, direction, ref, delta, position) => {
        const state = blockStateRef.current;
        onInteraction(id, {
            ...blockStateRef.current,
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
            ...position
        });
    }, [id, onInteraction]);

    const handleResizeStop: RndResizeCallback = useCallback((e, direction, ref, delta, position) => {
        const state = blockStateRef.current;
        onInteractionStop(id, {
            ...blockStateRef.current,
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
            ...position
        });
    }, [id, onInteractionStop]);

    // Stable wrappers for inline callbacks passed to Header
    const handleRemoveWrapper = useCallback(() => onRemove(id), [onRemove, id]);
    const handleToggleSettingsWrapper = useCallback(() => setIsSettingsOpen(prev => !prev), []);
    const handleQuantityChangeWrapper = useCallback((val: number | undefined) => onUpdate(id, { quantity: val }), [onUpdate, id]);
    const handleEnterPresentationWrapper = useCallback(() => onEnterPresentation && onEnterPresentation(id), [onEnterPresentation, id]);

    // Presentation Mode Overrides
    // Rnd is the invisible draggable/resizable wrapper.
    // The inner div `card-visual` handles the actual visual styling and content.
    const presentationRndStyle = isPresenting ? "!fixed !inset-0 !z-[9999] !transform-none !w-screen !h-screen !rounded-none !border-0 flex justify-center items-center" : "";
    // Remove max-w restriction in presentation mode to allow full scaling
    const presentationCardVisualClasses = isPresenting ? "rounded-lg border-x border-neutral-gray-700" : "rounded-2xl";

    return (
        <Rnd
            size={isPresenting ? { width: '100%', height: '100%' } : { width, height }}
            position={isPresenting ? { x: 0, y: 0 } : { x, y }}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            disableDragging={isPresenting}
            enableResizing={!isPresenting}
            minWidth={350}
            minHeight={150}
            // Remove bounds="parent" to allow dragging anywhere, including "above" the initial viewport
            dragHandleClassName="handle"
            scale={isPresenting ? 1 : internalScale} // Use internal scale which updates on interaction
            style={{
                zIndex: isPresenting ? 9999 : zIndex,
                // Optimization: Skip layout/paint for off-screen blocks
                contentVisibility: isPresenting ? 'visible' : 'auto',
                containIntrinsicSize: `${width}px ${height}px`
            }}
            className={`rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] ${presentationRndStyle}`}
            onMouseDown={() => {
                // Update internal scale before drag starts to ensure correct delta calculation
                if (scaleRef.current !== internalScale) {
                    setInternalScale(scaleRef.current);
                }
                onFocus(id);
            }}
            onDoubleClick={() => {
                if (isGenerated && !isPresenting && onEnterPresentation) onEnterPresentation(id);
            }}
        >
             {/*
                Optimization: Memoize the inner content to prevent expensive re-renders when parent 'scale' prop changes.
                The 'scale' prop from Whiteboard only affects Rnd's coordinate system, not the internal visual content (unless presenting).
                This allows zooming the canvas without re-diffing the heavy DOM tree of every block.
             */}
             <ExerciseBlockContent
                colors={colors}
                presentationCardVisualClasses={presentationCardVisualClasses}
                exerciseType={exerciseType}
                pedagogy={pedagogy}
                handleRemoveWrapper={handleRemoveWrapper}
                handleRegenerate={handleRegenerate}
                handleToggleSettingsWrapper={handleToggleSettingsWrapper}
                isSettingsOpen={isSettingsOpen}
                isGenerated={isGenerated}
                handleGenerate={handleGenerate}
                generateAmount={generateAmount}
                estimatedDuration={estimatedDuration}
                quantity={quantity}
                handleQuantityChangeWrapper={handleQuantityChangeWrapper}
                isSingleInstance={isSingleInstance}
                isPresenting={isPresenting}
                handleEnterPresentationWrapper={handleEnterPresentationWrapper}
                onExitPresentation={onExitPresentation}
                handlePrevItem={handlePrevItem}
                handleNextItem={handleNextItem}
                currentSlide={currentSlide}
                content={content}
                id={id}
                difficulty={difficulty}
                tone={tone}
                theme={theme}
                onUpdate={onUpdate}
                presentationScale={presentationScale}
                renderContent={renderContent}
                headerRef={headerRef}
                settingsRef={settingsRef}
                contentWrapperRef={contentWrapperRef}
            />
        </Rnd>
    );
});

export default ExerciseBlock;