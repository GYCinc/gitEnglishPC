import React, { useState, useEffect, useCallback } from 'react';
import { EXERCISE_CATEGORIES, PEDAGOGY_COLORS, EXERCISE_PEDAGOGY } from '../constants';
import { ExerciseType } from '../enums';
import { EXERCISE_INFO } from './exerciseInfo';
import { 
    ChevronDownIcon, 
    VocabularyIcon, 
    XCircleIcon, 
    DifficultyIndicatorIcon, 
    GrammarIcon,
    PPPIcon,
    InputIcon,
    LexisIcon,
    SkillsIcon,
    TBLTIcon,
    SocialIcon,
    CRIcon,
    ProductionIcon,
    PlusIcon,
    PencilSquareIcon,
    ListBulletIcon,
    ArrowsRightLeftIcon,
    ChatBubbleBottomCenterTextIcon,
    SpeakerWaveIcon,
    EyeIcon,
    BookOpenIcon,
    PhotoIcon,
    SparklesIcon,
    PuzzlePieceIcon,
    UserGroupIcon,
    DownloadIcon,
    UploadIcon,
    TrashIcon
} from './icons';
import { useActivityLogger } from '../ActivityContext'; // Import logger context

interface VocabularyFocusProps {
    focusVocabulary: string[];
    setFocusVocabulary: (vocab: string[]) => void;
    inclusionRate: number;
    setInclusionRate: (rate: number) => void;
}

const VocabularyFocus: React.FC<VocabularyFocusProps> = ({ focusVocabulary, setFocusVocabulary, inclusionRate, setInclusionRate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { logger, startActivity, endActivity, logFocusItem } = useActivityLogger();

    useEffect(() => {
        if (isOpen) {
            startActivity('vocab_focus_open', 'config_change', 'Vocabulary Focus Opened');
        } else {
            endActivity();
        }
    }, [isOpen, startActivity, endActivity]);

    const handleAddVocab = () => {
        const newVocab = inputValue.trim();
        if (newVocab && !focusVocabulary.includes(newVocab.toLowerCase())) {
            setFocusVocabulary([...focusVocabulary, newVocab.toLowerCase()]);
            setInputValue('');
            logFocusItem('Settings', 'Add Vocabulary', 0.1, null, 1, [], newVocab);
        }
    };

    const handleRemoveVocab = (vocabToRemove: string) => {
        setFocusVocabulary(focusVocabulary.filter(v => v !== vocabToRemove));
        logFocusItem('Settings', 'Remove Vocabulary', 0.1, null, 1, [], vocabToRemove);
    };

    const handleInclusionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRate = Number(e.target.value);
        setInclusionRate(newRate);
        logFocusItem('Settings', 'Vocabulary Inclusion Rate', 0.1, null, 1, [], `Rate: ${newRate}%`);
    };

    return (
        <div className="mb-4 bg-slate-800/40 backdrop-blur-md rounded-2xl ring-1 ring-white/10 overflow-hidden font-casual shadow-lg transition-all duration-300 hover:bg-slate-800/50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-yellow-500/20 rounded-lg ring-1 ring-yellow-500/30">
                        <VocabularyIcon className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="font-bold text-slate-100 text-sm tracking-wide">Vocabulary Focus</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-white/5 space-y-5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddVocab()}
                                placeholder="Add target word..."
                                className="w-full bg-slate-900/50 text-slate-200 border border-white/10 rounded-lg shadow-inner px-3 py-2 text-xs focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 focus:outline-none placeholder-slate-500 transition-all"
                                aria-label="Add target vocabulary word"
                            />
                            <button onClick={handleAddVocab} className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-slate-900 font-bold p-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-yellow-900/20" aria-label="Add word">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {focusVocabulary.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {focusVocabulary.map(v => (
                                    <span key={v} className="flex items-center bg-yellow-500/10 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full border border-yellow-500/20 shadow-sm backdrop-blur-sm group hover:border-yellow-500/40 transition-colors">
                                        {v}
                                        <button onClick={() => handleRemoveVocab(v)} className="ml-1.5 text-yellow-500/70 hover:text-yellow-200 transition-colors" aria-label={`Remove ${v}`}>
                                            <XCircleIcon className="w-3.5 h-3.5"/>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            <span>Inclusion Rate</span>
                            <span className="text-yellow-400">{inclusionRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={inclusionRate}
                            onChange={handleInclusionRateChange}
                            className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer range-thumb-yellow accent-yellow-500"
                            aria-label="Vocabulary inclusion rate slider"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface GrammarFocusProps {
    focusGrammar: string[];
    setFocusGrammar: (grammar: string[]) => void;
    grammarInclusionRate: number;
    setGrammarInclusionRate: (rate: number) => void;
}

const GrammarFocus: React.FC<GrammarFocusProps> = ({ focusGrammar, setFocusGrammar, grammarInclusionRate, setGrammarInclusionRate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { logger, startActivity, endActivity, logFocusItem } = useActivityLogger();

    useEffect(() => {
        if (isOpen) {
            startActivity('grammar_focus_open', 'config_change', 'Grammar Focus Opened');
        } else {
            endActivity();
        }
    }, [isOpen, startActivity, endActivity]);

    const handleAddGrammar = () => {
        const newGrammar = inputValue.trim();
        if (newGrammar && !focusGrammar.includes(newGrammar.toLowerCase())) {
            setFocusGrammar([...focusGrammar, newGrammar.toLowerCase()]);
            setInputValue('');
            logFocusItem('Settings', 'Add Grammar Point', 0.1, null, 1, [], newGrammar);
        }
    };

    const handleRemoveGrammar = (grammarToRemove: string) => {
        setFocusGrammar(focusGrammar.filter(g => g !== grammarToRemove));
        logFocusItem('Settings', 'Remove Grammar Point', 0.1, null, 1, [], grammarToRemove);
    };

    const handleInclusionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRate = Number(e.target.value);
        setGrammarInclusionRate(newRate);
        logFocusItem('Settings', 'Grammar Inclusion Rate', 0.1, null, 1, [], `Rate: ${newRate}%`);
    };

    return (
        <div className="mb-6 bg-slate-800/40 backdrop-blur-md rounded-2xl ring-1 ring-white/10 overflow-hidden font-casual shadow-lg transition-all duration-300 hover:bg-slate-800/50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/30">
                        <GrammarIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-100 text-sm tracking-wide">Grammar Focus</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-white/5 space-y-5 bg-black/20 animate-in slide-in-from-top-2 duration-200">
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddGrammar()}
                                placeholder="Add grammar point..."
                                className="w-full bg-slate-900/50 text-slate-200 border border-white/10 rounded-lg shadow-inner px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none"
                                aria-label="Add target grammar point"
                            />
                             <button onClick={handleAddGrammar} className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-900 font-bold p-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-900/20" aria-label="Add grammar point">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {focusGrammar.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {focusGrammar.map(g => (
                                    <span key={g} className="flex items-center bg-emerald-500/10 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm backdrop-blur-sm group hover:border-emerald-500/40 transition-colors">
                                        {g}
                                        <button onClick={() => handleRemoveGrammar(g)} className="ml-1.5 text-emerald-500/70 hover:text-emerald-200 transition-colors" aria-label={`Remove ${g}`}>
                                            <XCircleIcon className="w-3.5 h-3.5"/>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                         <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            <span>Inclusion Rate</span>
                            <span className="text-emerald-400">{grammarInclusionRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={grammarInclusionRate}
                            onChange={handleInclusionRateChange}
                            className="w-full h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer range-thumb-emerald accent-emerald-500"
                            aria-label="Grammar inclusion rate slider"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Map exercise types to specific icons
const EXERCISE_ICONS: Record<ExerciseType, React.FC<{className?: string}>> = {
    [ExerciseType.FITB]: PencilSquareIcon,
    [ExerciseType.CollocationGapFill]: PencilSquareIcon,
    [ExerciseType.PhrasalVerbGapFill]: PencilSquareIcon,
    [ExerciseType.WordFormation]: PencilSquareIcon,
    [ExerciseType.ClozeParagraph]: PencilSquareIcon,
    [ExerciseType.DialogueCompletion]: ChatBubbleBottomCenterTextIcon,
    [ExerciseType.ErrorCorrection]: PencilSquareIcon,
    [ExerciseType.FunctionalWriting]: PencilSquareIcon,
    [ExerciseType.DictoGloss]: PencilSquareIcon,
    
    [ExerciseType.MultipleChoice]: ListBulletIcon,
    [ExerciseType.Prediction]: ListBulletIcon,
    [ExerciseType.RuleDiscovery]: PuzzlePieceIcon,
    [ExerciseType.SpotTheDifference]: EyeIcon,
    [ExerciseType.PolitenessScenarios]: UserGroupIcon,
    [ExerciseType.InferringMeaning]: PuzzlePieceIcon,
    [ExerciseType.CollocationOddOneOut]: ListBulletIcon,
    [ExerciseType.RegisterSort]: ArrowsRightLeftIcon,
    
    [ExerciseType.Matching]: ArrowsRightLeftIcon,
    [ExerciseType.FunctionMatching]: ArrowsRightLeftIcon,
    [ExerciseType.SentenceScramble]: ArrowsRightLeftIcon,
    [ExerciseType.StorySequencing]: ArrowsRightLeftIcon,

    [ExerciseType.PicturePrompt]: PhotoIcon,
    [ExerciseType.PictureComparison]: PhotoIcon,
    
    [ExerciseType.MoralDilemma]: SparklesIcon,
    [ExerciseType.ProblemSolvingScenario]: SparklesIcon,
    [ExerciseType.RolePlayScenario]: ChatBubbleBottomCenterTextIcon,
    [ExerciseType.StorytellingFromPrompts]: SparklesIcon,
    [ExerciseType.JustifyYourOpinion]: SparklesIcon,
    
    [ExerciseType.ReadingGist]: BookOpenIcon,
    [ExerciseType.ReadingDetail]: EyeIcon,
    [ExerciseType.InformationTransfer]: PencilSquareIcon,
    
    [ExerciseType.ListeningSpecificInfo]: SpeakerWaveIcon,
};

// Map category names to icons for stable usage in CategoryAccordion
const CATEGORY_ICONS: Record<string, React.FC<{className?: string}>> = {
    'PPP': PPPIcon,
    'Input': InputIcon,
    'Lexis': LexisIcon,
    'Skills': SkillsIcon,
    'TBLT': TBLTIcon,
    'Social English': SocialIcon,
    'C-R': CRIcon,
    'Production': ProductionIcon
};


interface DraggableExerciseCardProps {
    type: ExerciseType;
    onAdd: (type: ExerciseType) => void;
}

// Memoized to prevent re-rendering all cards when one category is toggled
const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = React.memo(({ type, onAdd }) => {
    const { logger, logFocusItem } = useActivityLogger();

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
        e.dataTransfer.setData('exerciseType', type);
        e.dataTransfer.effectAllowed = 'copy';
        logFocusItem('Project Management', 'Drag Exercise Card', 0.1, null, 1, [], type);
    };

    const handleDoubleClick = () => {
        onAdd(type);
        logFocusItem('Project Management', 'Double Click Exercise Card', 0.1, null, 1, [], type);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAdd(type);
            logFocusItem('Project Management', 'Keyboard Add Exercise Card', 0.1, null, 1, [], type);
        }
    };

    const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default';
    const colors = PEDAGOGY_COLORS[pedagogy];
    const info = EXERCISE_INFO[type];
    const displayName = type.split('(')[0].trim();
    const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon;
    const tooltipId = `tooltip-${type.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="relative group">
            <button
                draggable
                onDragStart={handleDragStart}
                onDoubleClick={handleDoubleClick}
                onKeyDown={handleKeyDown}
                className={`w-full text-left p-3 rounded-xl cursor-grab active:cursor-grabbing active:scale-95 transition-all duration-300
                          border ${colors.border} bg-slate-800/40 backdrop-blur-sm
                          hover:bg-slate-700/60 hover:shadow-lg hover:-translate-y-0.5
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:${colors.border.replace('border-', 'ring-')}
                          group-hover:border-opacity-50 group-hover:bg-opacity-80`}
                aria-label={`Add ${type} exercise`}
                aria-describedby={tooltipId}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg bg-white/5 ${colors.textOnDark} bg-opacity-10`}>
                             <SpecificIcon className={`w-4 h-4 opacity-90`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">{displayName}</h3>
                        </div>
                    </div>
                    <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                         <DifficultyIndicatorIcon rating={info.difficultyRating} />
                    </div>
                </div>
            </button>
            {/* Tooltip - Enhanced Glass */}
            <div
                id={tooltipId}
                role="tooltip"
                className={`absolute left-full top-0 ml-4 w-72
                           p-5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]
                           opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 invisible group-hover:visible group-focus-within:visible
                           transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 pointer-events-none`}
            >
                <div className={`absolute top-5 -left-2 w-4 h-4 bg-slate-900/95 border-b border-l border-white/10 transform rotate-45`}></div>
                <h4 className={`font-bold ${colors.textOnDark} text-lg mb-2`}>{info.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colors.border} bg-white/5 ${colors.textOnDark}`}>{pedagogy}</span>
                     <span className="text-xs text-slate-500">•</span>
                     <span className="text-xs text-slate-300 font-medium">Difficulty: {info.difficultyRating}</span>
                </div>
                <p className="text-slate-300 text-sm mb-5 leading-relaxed font-light">{info.description}</p>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-3 backdrop-blur-sm">
                    <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Example</p>
                    <p className="text-sm text-slate-200 font-mono italic leading-relaxed">"{info.example}"</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Double-click to add</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Drag to place</span>
                </div>
            </div>
        </div>
    );
});


// Memoized accordion to accept stable props and avoid re-rendering inactive categories
const CategoryAccordion: React.FC<{ 
    category: typeof EXERCISE_CATEGORIES[0], 
    isOpen: boolean, 
    onToggle: (name: string) => void, // Changed to accept name argument
    Icon: React.FC<{className?: string}>, // Changed to accept component type
    onAddExercise: (type: ExerciseType) => void
}> = React.memo(({ category, isOpen, onToggle, Icon, onAddExercise }) => {
    const colors = PEDAGOGY_COLORS[category.name];
    const { logger, logFocusItem } = useActivityLogger();

    const handleToggle = () => {
        onToggle(category.name);
        logFocusItem('General UI', 'Accordion Toggled', 0.1, null, 1, [], `Category: ${category.name}, State: ${!isOpen ? 'Open' : 'Closed'}`);
    };

    return (
        <div className="mb-3 font-casual">
            <button 
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 border ${isOpen ? `bg-slate-800/60 backdrop-blur-md ${colors.border} shadow-lg ring-1 ring-white/5` : 'bg-transparent border-transparent hover:bg-slate-800/30'}`}
                aria-expanded={isOpen}
                aria-controls={`panel-${category.name.replace(/\s/g, '-')}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-white/10' : 'bg-transparent'}`}>
                         <div className={`${colors.textOnDark}`}>
                            <Icon className="w-5 h-5"/>
                        </div>
                    </div>
                    {/* Always apply color for better visibility */}
                    <span className={`font-bold text-sm ${colors.textOnDark} tracking-wide transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-80'}`}>{category.name}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? `rotate-180 ${colors.textOnDark}` : 'text-slate-600'}`} />
            </button>
            
            <div id={`panel-${category.name.replace(/\s/g, '-')}`} role="region" aria-hidden={!isOpen} className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className={`min-h-0 space-y-2 pl-2 border-l-2 ${colors.border.replace('border-', 'border-opacity-20 ')} ml-5 my-1`}>
                    {category.types.map(type => (
                        <DraggableExerciseCard key={type} type={type} onAdd={onAddExercise} />
                    ))}
                </div>
            </div>
        </div>
    );
});


interface SidebarProps {
    focusVocabulary: string[];
    setFocusVocabulary: (vocab: string[]) => void;
    inclusionRate: number;
    setInclusionRate: (rate: number) => void;
    focusGrammar: string[];
    setFocusGrammar: (grammar: string[]) => void;
    grammarInclusionRate: number;
    setGrammarInclusionRate: (rate: number) => void;
    isSidebarOpen: boolean;
    onAddExercise: (type: ExerciseType) => void;
    onExportState: () => void;
    onImportState: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearBoard: () => void;
}

const Sidebar = React.memo(({
    focusVocabulary, setFocusVocabulary, inclusionRate, setInclusionRate,
    focusGrammar, setFocusGrammar, grammarInclusionRate, setGrammarInclusionRate,
    isSidebarOpen, onAddExercise, onExportState, onImportState, onClearBoard
}: SidebarProps) => {
  const [openCategory, setOpenCategory] = useState<string | null>('PPP');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { logger, logFocusItem } = useActivityLogger();

  // Log sidebar open/close
  useEffect(() => {
    if (isSidebarOpen) {
        logger?.startActivity('sidebar_opened', 'navigation', 'Sidebar Opened');
    } else {
        logger?.endActivity(); // Ends the sidebar_opened activity
    }
  }, [isSidebarOpen, logger]);

  // Stable callback for toggling categories
  const toggleCategory = useCallback((name: string) => {
      setOpenCategory(prev => prev === name ? null : name);
  }, []);

  const handleConfigToggle = () => {
    setIsConfigOpen(!isConfigOpen);
    logFocusItem('General UI', 'Configuration Panel', 0.1, null, 1, [], `State: ${!isConfigOpen ? 'Open' : 'Closed'}`);
  };

  const handleExportClick = () => {
    onExportState();
    logFocusItem('Project Management', 'Export Project', 0.1);
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImportState(e);
    logFocusItem('Project Management', 'Import Project', 0.1, null, 1, [], `File: ${e.target.files?.[0]?.name}`);
  };

  const handleClearBoardClick = () => {
    onClearBoard();
    logFocusItem('Project Management', 'Clear Board', 0.1);
  };


  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900/80 backdrop-blur-xl text-white flex flex-col h-screen transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform border-r border-white/10 shadow-2xl
                     lg:static lg:translate-x-0
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} font-casual`}>
      
      <div className="p-6 pb-4 flex-shrink-0 border-b border-white/10 bg-slate-900/50 z-10 backdrop-blur-md">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warm-orange-400 to-action-amber-400 font-playful drop-shadow-sm">gitEnglish™</h1>
        <h2 className="text-xs font-bold text-slate-400 mt-1 tracking-[0.2em] uppercase opacity-80">Practice Genie</h2>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar-dark p-4 space-y-6">
          
          <div className="animate-in slide-in-from-left-2 duration-300 delay-100">
              <button 
                onClick={handleConfigToggle}
                className="flex items-center justify-between w-full p-2 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors group"
                aria-label="Toggle Configuration Panel"
              >
                  <span className="group-hover:translate-x-1 transition-transform">Configuration</span>
                  <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isConfigOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${isConfigOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <VocabularyFocus 
                    focusVocabulary={focusVocabulary}
                    setFocusVocabulary={setFocusVocabulary}
                    inclusionRate={inclusionRate}
                    setInclusionRate={setInclusionRate}
                />
                
                <GrammarFocus
                    focusGrammar={focusGrammar}
                    setFocusGrammar={setFocusGrammar}
                    grammarInclusionRate={grammarInclusionRate}
                    setGrammarInclusionRate={setGrammarInclusionRate}
                />
              </div>
          </div>

          <div className="pb-4 animate-in slide-in-from-left-2 duration-300 delay-200">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Exercise Library</h3>
              {EXERCISE_CATEGORIES.map((category) => (
                  <CategoryAccordion 
                      key={category.name}
                      category={category}
                      isOpen={openCategory === category.name}
                      onToggle={toggleCategory}
                      Icon={CATEGORY_ICONS[category.name] || PencilSquareIcon}
                      onAddExercise={onAddExercise}
                  />
              ))}
          </div>
      </div>
      
      <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md space-y-3 z-10">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Project Actions</h3>
           <div className="grid grid-cols-2 gap-2">
                <button onClick={handleExportClick} className="col-span-1 flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all active:scale-95" aria-label="Export current project">
                    <DownloadIcon className="w-4 h-4 text-primary-blue-400" /> Export
                </button>
                <label className="col-span-1 flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all cursor-pointer active:scale-95" aria-label="Import project from file">
                    <UploadIcon className="w-4 h-4 text-accent-green-400" /> Import
                    <input type="file" accept=".json" onChange={handleImportChange} className="hidden" />
                </label>
                <button onClick={handleClearBoardClick} className="col-span-2 flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-slate-300 hover:text-energy-red-400 bg-white/5 hover:bg-energy-red-900/20 border border-white/5 hover:border-energy-red-500/30 rounded-xl transition-all active:scale-95" aria-label="Clear all exercises from board">
                    <TrashIcon className="w-4 h-4" /> Clear Board
                </button>
           </div>

           <div className="pt-2 text-center">
              <span className="text-[10px] font-medium text-slate-600 block">v2.1.0 • Infinite Canvas</span>
           </div>
      </div>

      <style>{`
        /* Custom scrollbar for dark sidebar */
        .custom-scrollbar-dark::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Custom range slider thumb styles */
        .range-thumb-yellow::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #eab308; /* yellow-500 */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #0f172a; /* slate-900 */
            box-shadow: 0 0 0 1px #eab308;
            transition: transform 0.1s;
        }
        .range-thumb-yellow::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }

        .range-thumb-emerald::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #10b981; /* emerald-500 */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #0f172a; /* slate-900 */
            box-shadow: 0 0 0 1px #10b981;
            transition: transform 0.1s;
        }
         .range-thumb-emerald::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
      `}</style>
    </aside>
  );
});

export default Sidebar;
