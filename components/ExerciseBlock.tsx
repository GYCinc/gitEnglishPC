import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { ExerciseBlockState, ExerciseType, Difficulty, Tone } from '../types';
import { generateExercises } from '../services/geminiService';
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
  onDrag: RndDragCallback;
  onDragStop: RndDragCallback;
  onResize: RndResizeCallback;
  onResizeStop: RndResizeCallback;
  bounds: string;
  isPresenting: boolean;
  onEnterPresentation: () => void;
  onExitPresentation: () => void;
  onNextSlide: () => void; // Global next slide (for next block in app.tsx)
  onPrevSlide: () => void; // Global prev slide (for prev block in app.tsx)
  scale?: number; // Current zoom scale of the whiteboard
}

// Header Component
const Header = React.forwardRef<HTMLDivElement, {
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
    const { logger } = useActivityLogger();

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Project Management', 'Exercise Block Removed', 0.1, null, 1, [], title);
        onRemove();
    };

    const handleRegenerate = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Activity Management', 'Exercise Regenerated', 0.1, null, 1, [], title);
        onRegenerate();
    };

    const handleGenerate = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Activity Management', 'Exercise Generated', 0.1, null, 1, [], `${title} x${generateAmount}`);
        onGenerate();
    };

    const handleToggleSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Settings', `Block Settings ${isSettingsOpen ? 'Closed' : 'Opened'}`, 0.1, null, 1, [], title);
        onToggleSettings();
    };

    const handleEnterPresentation = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.startActivity(`presentation_${title.replace(/\s/g, '_')}_${Date.now()}`, 'presentation', `Presenting: ${title}`);
        logger?.logFocusItem('Interaction', 'Entered Live Mode', 0.1);
        onEnterPresentation?.();
    };

    const handleExitPresentation = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Exited Live Mode', 0.1);
        logger?.endActivity(); // Ends the presentation activity
        onExitPresentation?.();
    };

    const handleNextItem = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Presentation Next Item', 0.1, null, 1, [], `Block: ${title}, Item: ${currentItem + 1}/${totalItems}`);
        onNextItem?.();
    };

    const handlePrevItem = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger?.logFocusItem('Interaction', 'Presentation Previous Item', 0.1, null, 1, [], `Block: ${title}, Item: ${currentItem - 1}/${totalItems}`);
        onPrevItem?.();
    };

    return (
        <div ref={ref} className={`handle bg-slate-800 text-white p-3 ${isPresenting ? 'rounded-none p-6' : 'rounded-t-2xl'} flex justify-between items-center cursor-move flex-shrink-0 border-b border-slate-700 relative z-10 font-casual`}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {isPresenting && (
                     <button onMouseDown={(e) => e.stopPropagation()} onClick={handleExitPresentation} className="p-2 rounded-full hover:bg-slate-700 text-neutral-gray-400 hover:text-white transition-colors mr-2 relative z-50" title="Exit Live Mode">
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
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={handlePrevItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === 1}><ChevronLeftIcon className="w-6 h-6" /></button>
                          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleNextItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === totalItems}><ChevronRightIcon className="w-6 h-6" /></button>
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
                             >
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                <span className="text-xs uppercase tracking-wider">Live</span>
                             </button>
                         )}

                         {isGenerated ? (
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={handleRegenerate} className="p-1.5 rounded-full hover:bg-primary-blue-500/20 text-primary-blue-400 hover:text-primary-blue-300 transition-colors" title="Regenerate">
                                <ResetIcon className="w-4 h-4" />
                            </button>
                         ) : (
                            <button onMouseDown={(e) => e.stopPropagation()} onClick={handleGenerate} className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-warm-orange-500 to-innovation-pink-500 text-white font-bold hover:brightness-110 transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap" title="Generate">
                                <MagicWandIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Generate</span>
                            </button>
                         )}
                         <button onMouseDown={(e) => e.stopPropagation()} onClick={handleToggleSettings} className={`p-1.5 rounded-full ${isSettingsOpen ? 'bg-slate-700 text-white' : 'text-neutral-gray-400 hover:text-white'} transition-colors`} title="Settings">
                            <SettingsIcon className="w-4 h-4" />
                        </button>
                        <button onMouseDown={(e) => e.stopPropagation()} onClick={handleRemove} className="p-1.5 rounded-full hover:bg-energy-red-500/20 text-energy-red-400 hover:text-energy-red-300 transition-colors" title="Remove">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                     </>
                 )}
            </div>
        </div>
    );
});
Header.displayName = 'Header';

// Settings Component
const Settings = React.forwardRef<HTMLDivElement, {
    blockState: ExerciseBlockState;
    onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
}>(({ blockState, onUpdate }, ref) => {
    const { logger } = useActivityLogger();

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = e.target.value as Difficulty;
        onUpdate(blockState.id, { difficulty: newDifficulty });
        logger?.logFocusItem('Settings', 'Block Difficulty Changed', 0.1, null, 1, [], `Block: ${blockState.exerciseType}, Set to: ${newDifficulty}`);
    };

    const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTone = e.target.value as Tone;
        onUpdate(blockState.id, { tone: newTone });
        logger?.logFocusItem('Settings', 'Block Tone Changed', 0.1, null, 1, [], `Block: ${blockState.exerciseType}, Set to: ${newTone}`);
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTheme = e.target.value;
        onUpdate(blockState.id, { theme: newTheme });
        logger?.logFocusItem('Settings', 'Block Theme Changed', 0.1, null, 1, [], `Block: ${blockState.exerciseType}, Set to: ${newTheme}`);
    };

    return (
        <div ref={ref} className="p-3 border-b border-neutral-gray-100 bg-paper-bg grid grid-cols-2 gap-3 flex-shrink-0 relative z-10 font-casual">
            <label htmlFor={`block-difficulty-${blockState.id}`} className="sr-only">Block Difficulty</label>
            <select
                id={`block-difficulty-${blockState.id}`}
                value={blockState.difficulty}
                onChange={handleDifficultyChange}
                className="text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400"
            >
                {DIFFICULTY_LEVELS.map(d => (
                    <option key={d} value={d}>
                        {DIFFICULTY_LABELS[d] || d}
                    </option>
                ))}
            </select>
            <label htmlFor={`block-tone-${blockState.id}`} className="sr-only">Block Tone</label>
            <select
                id={`block-tone-${blockState.id}`}
                value={blockState.tone}
                onChange={handleToneChange}
                className="text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400"
            >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label htmlFor={`block-theme-${blockState.id}`} className="sr-only">Block Theme</label>
            <input
                id={`block-theme-${blockState.id}`}
                type="text"
                value={blockState.theme}
                onChange={handleThemeChange}
                onBlur={handleThemeChange} // Log on blur for text input
                className="col-span-2 text-xs font-bold text-neutral-gray-600 p-2 rounded-lg border border-neutral-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-primary-blue-400 placeholder-neutral-gray-400"
                placeholder="Theme (e.g., travel, food)"
            />
        </div>
    );
});
Settings.displayName = 'Settings';

// ExerciseContent component now uses activeIndex to show a single question
const ExerciseContent: React.FC<{ type: ExerciseType; content: any[]; colors: any; activeIndex?: number; blockId: number; exerciseType: ExerciseType }> = ({ type, content, colors, activeIndex, blockId, exerciseType }) => {
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
};

const PlaceholderView: React.FC<{ amount: number; exerciseType: ExerciseType; }> = ({ amount, exerciseType }) => (
    <div className="space-y-4">
        {Array.from({ length: amount }).map((_, i) => (
            <ExerciseTemplate key={i} type={exerciseType} index={i} />
        ))}
    </div>
);

const ExerciseBlock: React.FC<ExerciseBlockProps> = ({ 
    blockState, onUpdate, onRemove, onFocus, bounds,
    onDrag, onDragStop, onResize, onResizeStop,
    isPresenting, onEnterPresentation, onExitPresentation, onNextSlide, onPrevSlide,
    scale = 1
}) => {
    const { id, x, y, width, height, zIndex, exerciseType, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, isGenerated, quantity } = blockState;
    const [content, setContent] = useState<any[] | { error: string }>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const { logger, startActivity, endActivity } = useActivityLogger();

    // Presentation Mode Internal State
    const [currentSlide, setCurrentSlide] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null); // Ref for content inner wrapper
    
    // Scale for Presentation Mode - Huge Max Scale for "Zoom into your face" effect
    // 5.0 is a safe upper limit to fill 4k screens even if the component is small
    const presentationScale = useResponsiveScale(900, contentWrapperRef, 5.0);

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

                    // Apply change if it differs significantly to prevent micro-jitter
                    if (Math.abs(desiredWidth - width) > 5 || Math.abs(desiredHeight - height) > 5) {
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
    }, [content, isGenerated, isSettingsOpen, id, onUpdate, width, height, isPresenting]);


    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        startActivity(`generate_block_${id}`, 'activity', `Generate Block: ${exerciseType}`);
        const result = await generateExercises(
            exerciseType, difficulty, tone, debouncedTheme, generateAmount, 
            focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
        );
        setContent(result);
        setIsLoading(false);
        if (!('error' in result)) {
            onUpdate(id, { isGenerated: true });
        }
        endActivity(); // End generation activity
    }, [exerciseType, difficulty, tone, debouncedTheme, generateAmount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, onUpdate, id, startActivity, endActivity]);

    const handleRegenerate = () => {
        onUpdate(id, { isGenerated: false });
        // Logger already handles logging in Header component
    };
    
    // Presentation Navigation Handlers (for individual items within this block)
    const handleNextItem = useCallback(() => {
        if (Array.isArray(content) && currentSlide < content.length - 1) {
            setCurrentSlide(prev => prev + 1);
            // Logger already handles logging in Header
        }
    }, [content, currentSlide]);

    const handlePrevItem = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
            // Logger already handles logging in Header
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
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-full min-h-[200px]">
                    <LoadingIcon className="w-12 h-12 text-neutral-gray-300 animate-spin" />
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
    };

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
            onDrag={onDrag}
            onDragStop={onDragStop}
            onResize={onResize}
            onResizeStop={onResizeStop}
            disableDragging={isPresenting}
            enableResizing={!isPresenting}
            minWidth={350}
            minHeight={150}
            bounds={bounds}
            dragHandleClassName="handle"
            scale={isPresenting ? 1 : scale} // Rnd's internal scale for dragging/resizing, independent of visual content scale
            style={{ zIndex: isPresenting ? 9999 : zIndex }}
            className={`rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] ${presentationRndStyle}`}
            onMouseDown={() => onFocus(id)}
            onDoubleClick={() => {
                if (isGenerated && !isPresenting && onEnterPresentation) onEnterPresentation();
            }}
        >
            {/* This inner div is the actual visible "paper card" */}
            <div className={`card-visual flex flex-col h-full w-full bg-paper-bg border-4 ${colors.border} ${presentationCardVisualClasses}`}>
                <Header
                    ref={headerRef}
                    title={exerciseType}
                    pedagogy={pedagogy}
                    textColor={colors.textOnDark}
                    onRemove={() => onRemove(id)}
                    onRegenerate={handleRegenerate}
                    onToggleSettings={() => setIsSettingsOpen(prev => !prev)}
                    isSettingsOpen={isSettingsOpen}
                    isGenerated={isGenerated}
                    onGenerate={handleGenerate}
                    generateAmount={generateAmount}
                    estimatedDuration={estimatedDuration}
                    quantity={quantity}
                    onQuantityChange={(val) => onUpdate(id, { quantity: val })}
                    isSingleInstance={isSingleInstance}
                    isPresenting={isPresenting}
                    onEnterPresentation={onEnterPresentation}
                    onExitPresentation={onExitPresentation}
                    onPrevItem={handlePrevItem}
                    onNextItem={handleNextItem}
                    currentItem={currentSlide + 1}
                    totalItems={Array.isArray(content) ? content.length : 1}
                />

                {isSettingsOpen && !isPresenting && <Settings ref={settingsRef} blockState={blockState} onUpdate={onUpdate} />}
                
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
        </Rnd>
    );
};

export default ExerciseBlock;