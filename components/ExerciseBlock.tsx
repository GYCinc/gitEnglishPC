
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import { ExerciseBlockState, ExerciseType, Difficulty, Tone } from '../types';
import { generateExercises } from '../services/geminiService';
import { LoadingIcon, TrashIcon, SettingsIcon, ResetIcon, MagicWandIcon, PlayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useDebounce } from '../hooks/useDebounce';
import { useResponsiveScale } from '../hooks/useResponsiveScale';
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
} from './InteractiveExercises';

export interface ExerciseBlockProps {
  blockState: ExerciseBlockState;
  onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
  onRemove: (blockId: number) => void;
  onFocus: (blockId: number) => void;
  onDrag: RndDragCallback;
  onDragStop: RndDragCallback;
  onResize: RndResizeCallback;
  onResizeStop: RndResizeCallback;
  bounds: string;
  isPresenting: boolean;
  onEnterPresentation: () => void;
  onExitPresentation: () => void;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  scale?: number;
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
  onPrevItem?: () => void;
  onNextItem?: () => void;
  currentItem?: number;
  totalItems?: number;
}>(({ 
    title, pedagogy, textColor, onRemove, onRegenerate, onToggleSettings, isSettingsOpen, isGenerated, onGenerate, 
    generateAmount, estimatedDuration, quantity, onQuantityChange, isSingleInstance,
    isPresenting, onEnterPresentation, onExitPresentation, onPrevItem, onNextItem, currentItem, totalItems
}, ref) => (
    <div ref={ref} className={`handle bg-slate-800 text-white p-3 ${isPresenting ? 'rounded-none p-6' : 'rounded-t-[14px]'} flex justify-between items-center cursor-move flex-shrink-0 border-b border-slate-700`}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
            {isPresenting && (
                 <button onClick={onExitPresentation} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors mr-2" title="Exit Presentation Mode">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                 <h3 className={`font-playful font-bold ${isPresenting ? 'text-3xl' : 'text-lg'} select-none ${textColor} tracking-wide truncate`}>{title}</h3>
                 <div className="flex gap-2 items-center">
                    <span className={`${isPresenting ? 'text-sm px-3 py-1.5' : 'text-[10px] px-2 py-1'} uppercase tracking-widest font-bold bg-slate-900/50 text-slate-400 rounded-full border border-slate-700 select-none whitespace-nowrap`}>{pedagogy}</span>
                    <span className={`${isPresenting ? 'text-sm px-3 py-1.5' : 'text-[10px] px-2 py-1 hidden sm:flex'} font-bold bg-slate-700 text-slate-300 rounded-full border border-slate-600 select-none flex items-center gap-1 whitespace-nowrap`} title="Estimated completion time">
                        <span>⏱</span> ~{estimatedDuration}m
                    </span>
                 </div>
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
             {/* Navigation Controls in Header for Presentation Mode */}
             {isPresenting && totalItems && totalItems > 1 && (
                 <div className="flex items-center gap-4 mr-4 border-r border-slate-700 pr-4">
                     <span className="text-sm font-mono font-bold text-slate-400">{currentItem} / {totalItems}</span>
                     <button onClick={onPrevItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === 1}><ChevronLeftIcon className="w-6 h-6" /></button>
                     <button onClick={onNextItem} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentItem === totalItems}><ChevronRightIcon className="w-6 h-6" /></button>
                 </div>
             )}

             {/* Qty Input (Hide in presentation) */}
             {!isGenerated && !isSingleInstance && !isPresenting && (
                 <div className={`flex items-center bg-slate-900/50 rounded-lg px-2 py-1 border ${quantity ? 'border-blue-500/50' : 'border-slate-600'} mr-1 transition-colors`}>
                    <span className={`text-[10px] font-bold uppercase mr-1.5 ${quantity ? 'text-blue-400' : 'text-slate-500'}`}>Qty</span>
                    <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={generateAmount} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onQuantityChange(isNaN(val) || val < 1 ? undefined : val);
                        }}
                        className={`w-6 bg-transparent text-center text-xs font-bold outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none ${quantity ? 'text-blue-400' : 'text-slate-300'}`}
                        title="Manually set amount (overrides auto-size)"
                    />
                 </div>
             )}

             {/* Standard Controls */}
             {!isPresenting && (
                 <>
                    {/* Presentation Button */}
                     {isGenerated && (
                         <button onClick={onEnterPresentation} className="p-1.5 rounded-full hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors" title="Start Presentation Mode">
                            <PlayIcon className="w-4 h-4" />
                         </button>
                     )}

                     {isGenerated ? (
                        <button onClick={onRegenerate} className="p-1.5 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Regenerate">
                            <ResetIcon className="w-4 h-4" />
                        </button>
                     ) : (
                        <button onClick={onGenerate} className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold hover:brightness-110 transition-all shadow-lg flex items-center gap-1.5 whitespace-nowrap" title="Generate">
                            <MagicWandIcon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Generate</span>
                        </button>
                     )}
                     <button onClick={onToggleSettings} className={`p-1.5 rounded-full ${isSettingsOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'} transition-colors`} title="Settings">
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                    <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" title="Remove">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                 </>
             )}
        </div>
    </div>
));
Header.displayName = 'Header';

// Settings Component
const Settings = React.forwardRef<HTMLDivElement, {
    blockState: ExerciseBlockState;
    onUpdate: (blockId: number, updates: Partial<ExerciseBlockState>) => void;
}>(({ blockState, onUpdate }, ref) => {
    return (
        <div ref={ref} className="p-3 border-b border-slate-100 bg-slate-50 grid grid-cols-2 gap-3 flex-shrink-0">
            <select
                value={blockState.difficulty}
                onChange={(e) => onUpdate(blockState.id, { difficulty: e.target.value as Difficulty })}
                className="text-xs font-bold text-slate-600 p-2 rounded-lg border border-slate-300 bg-white w-full outline-none focus:ring-2 focus:ring-blue-400"
            >
                {DIFFICULTY_LEVELS.map(d => (
                    <option key={d} value={d}>
                        {DIFFICULTY_LABELS[d] || d}
                    </option>
                ))}
            </select>
            <select
                value={blockState.tone}
                onChange={(e) => onUpdate(blockState.id, { tone: e.target.value as Tone })}
                className="text-xs font-bold text-slate-600 p-2 rounded-lg border border-slate-300 bg-white w-full outline-none focus:ring-2 focus:ring-blue-400"
            >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
                type="text"
                value={blockState.theme}
                onChange={(e) => onUpdate(blockState.id, { theme: e.target.value })}
                className="col-span-2 text-xs font-bold text-slate-600 p-2 rounded-lg border border-slate-300 bg-white w-full outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400"
                placeholder="Theme (e.g., travel, food)"
            />
        </div>
    );
});
Settings.displayName = 'Settings';

const ExerciseContent: React.FC<{ type: ExerciseType; content: any[]; colors: any; activeIndex?: number }> = ({ type, content, colors, activeIndex }) => {
    const renderExercise = (ex: any, i: number) => {
        let component;
        switch (type) {
            case ExerciseType.FITB:
            case ExerciseType.CollocationGapFill:
            case ExerciseType.PhrasalVerbGapFill:
                component = <InteractiveFITB key={i} exercise={ex} colors={colors} />;
                break;
            case ExerciseType.WordFormation:
                component = <InteractiveWordFormation key={i} exercise={ex} colors={colors} />;
                break;
            case ExerciseType.MultipleChoice:
            case ExerciseType.Prediction:
            case ExerciseType.RuleDiscovery:
            case ExerciseType.SpotTheDifference:
            case ExerciseType.PolitenessScenarios:
            case ExerciseType.InferringMeaning:
                component = <InteractiveMCQ key={i} exercise={ex} colors={colors} />;
                break;
            case ExerciseType.SentenceScramble:
                 component = <InteractiveSentenceScramble key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.ClozeParagraph:
            case ExerciseType.DialogueCompletion:
                 component = <InteractiveClozeOrDialogue key={i} exercise={ex} colors={colors} />;
                 break;
             case ExerciseType.Matching:
             case ExerciseType.FunctionMatching:
                 component = <InteractiveMatching key={i} exercise={ex} colors={colors} />;
                 break;
             case ExerciseType.StorySequencing:
                 component = <InteractiveStorySequencing key={i} exercise={ex} colors={colors} />;
                 break;
             case ExerciseType.ErrorCorrection:
                  component = <InteractiveErrorCorrection key={i} exercise={ex} colors={colors} />;
                  break;
            case ExerciseType.PicturePrompt:
                 component = <InteractivePicturePrompt key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.MoralDilemma:
            case ExerciseType.FunctionalWriting:
            case ExerciseType.ProblemSolvingScenario:
            case ExerciseType.RolePlayScenario:
            case ExerciseType.StorytellingFromPrompts:
            case ExerciseType.JustifyYourOpinion:
            case ExerciseType.PictureComparison:
                 component = <InteractiveOpenResponseTask key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.ReadingGist:
                 component = <InteractiveReadingGist key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.ReadingDetail:
                 component = <InteractiveReadingDetail key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.DictoGloss:
                 component = <InteractiveDictoGloss key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.CollocationOddOneOut:
                 component = <InteractiveCollocationOddOneOut key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.InformationTransfer:
                 component = <InteractiveInformationTransfer key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.ListeningSpecificInfo:
                 component = <InteractiveListening key={i} exercise={ex} colors={colors} />;
                 break;
            case ExerciseType.RegisterSort:
                 component = <InteractiveRegisterSort key={i} exercise={ex} colors={colors} />;
                 break;
            default:
                component = <p className={colors.textOnLight}>Unsupported exercise type.</p>;
        }

        // In presentation mode, only show the active index.
        // We use 'hidden' class to preserve state in DOM but hide visually.
        if (activeIndex !== undefined) {
            return (
                <div key={i} className={`${activeIndex === i ? 'block' : 'hidden'} w-full`}>
                    {component}
                </div>
            );
        }
        
        // Normal mode: render in list
        return <div key={i} className="mb-8 last:mb-0">{component}</div>;
    };
    
    // If activeIndex is defined (Presentation Mode), wrap in centering div
    if (activeIndex !== undefined) {
        return (
            <div className="flex flex-col justify-center items-center w-full h-full min-h-[50vh]">
                <div className="w-full max-w-5xl transform transition-all">
                     {content.map((ex, i) => renderExercise(ex, i))}
                </div>
            </div>
        );
    }
    
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
    
    // Presentation Mode Internal State
    const [currentSlide, setCurrentSlide] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    
    // Scale for Presentation Mode
    const presentationScale = useResponsiveScale(900, contentWrapperRef);

    const debouncedTheme = useDebounce(theme, 500);
    const pedagogy = EXERCISE_PEDAGOGY[exerciseType] || 'Default';
    const colors = PEDAGOGY_COLORS[pedagogy];

    const amount = useMemo(() => calculateExerciseAmount(exerciseType, height), [exerciseType, height]);
    const generateAmount = quantity ?? amount;
    const estimatedDuration = useMemo(() => calculateExerciseDuration(exerciseType, height, quantity), [exerciseType, height, quantity]);
    const isSingleInstance = SINGLE_INSTANCE_TYPES.includes(exerciseType);

    // Precise Snap-to-Content Logic (Active only when NOT presenting)
    useEffect(() => {
        if (!isGenerated || !contentWrapperRef.current || isPresenting) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === contentWrapperRef.current) {
                    const contentWidth = entry.contentRect.width;
                    const contentHeight = entry.contentRect.height;
                    
                    const headerHeight = headerRef.current?.offsetHeight || 0;
                    const settingsHeight = settingsRef.current?.offsetHeight || 0;
                    
                    const desiredWidth = Math.max(350, contentWidth + 48);
                    const desiredHeight = headerHeight + settingsHeight + contentHeight + 48;

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
        const result = await generateExercises(
            exerciseType, difficulty, tone, debouncedTheme, generateAmount, 
            focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
        );
        setContent(result);
        setIsLoading(false);
        if (!('error' in result)) {
            onUpdate(id, { isGenerated: true });
        }
    }, [exerciseType, difficulty, tone, debouncedTheme, generateAmount, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate, onUpdate, id]);

    const handleRegenerate = () => {
        onUpdate(id, { isGenerated: false });
    };
    
    // Presentation Navigation Handlers
    const handleNextItem = useCallback(() => {
        if (Array.isArray(content) && currentSlide < content.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    }, [content, currentSlide]);

    const handlePrevItem = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

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
                    <LoadingIcon className="w-12 h-12 text-slate-300 animate-spin" />
                </div>
            );
        }
        if (!isGenerated) {
            return <PlaceholderView amount={generateAmount} exerciseType={exerciseType} />;
        }
        
        const instruction = EXERCISE_INSTRUCTIONS[exerciseType];
        
        return (
            <>
                {instruction && <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-casual">{instruction}</p>}
                {('error' in content) ? (
                    <div className="text-red-500 text-sm p-4 bg-red-50 rounded-xl border-2 border-red-100">
                        <p className="font-bold mb-1">Oops!</p>
                        <p>{content.error}</p>
                    </div>
                ) : (
                    <ExerciseContent 
                        type={exerciseType} 
                        content={content} 
                        colors={colors} 
                        activeIndex={isPresenting ? currentSlide : undefined} 
                    />
                )}
            </>
        );
    };

    // Presentation Mode Overrides
    const presentationStyle = isPresenting ? "!fixed !inset-0 !z-[9999] !transform-none !w-screen !h-screen !rounded-none !border-0" : "";
    const presentationBg = isPresenting ? "!bg-slate-900/95 !backdrop-blur-md" : "";

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
            scale={isPresenting ? 1 : scale}
            style={{ zIndex: isPresenting ? 9999 : zIndex }}
            className={`bg-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex flex-col border-4 ${colors.border} overflow-hidden transition-shadow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] ${presentationStyle} ${presentationBg}`}
            onMouseDown={() => onFocus(id)}
            onDoubleClick={() => {
                if (isGenerated && !isPresenting && onEnterPresentation) onEnterPresentation();
            }}
        >
            <div className={`flex flex-col h-full w-full ${isPresenting ? 'max-w-7xl mx-auto bg-white shadow-2xl rounded-lg border-x border-slate-700' : ''}`}>
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
                        className={`w-fit max-w-[900px] ${isGenerated ? '' : 'w-full'} origin-top transition-transform duration-200`}
                         // Scale logic for Presentation Mode (150% focus)
                         style={isPresenting ? { transform: `scale(${Math.max(1.5, presentationScale)})` } : {}}
                    >
                        {renderContent()}
                    </div>
                </div>
            </div>
        </Rnd>
    );
};

export default ExerciseBlock;
