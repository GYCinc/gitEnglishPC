import React, { useState, useEffect } from 'react';
import { EXERCISE_CATEGORIES, PEDAGOGY_COLORS, EXERCISE_PEDAGOGY } from '../constants';
import { ExerciseType } from '../types';
import { EXERCISE_INFO } from './exerciseInfo';
import { 
    ChevronDownIcon, 
    VocabularyIcon, 
    XCircleIcon, 
    DifficultyIndicatorIcon, 
    GrammarIcon, // Added GrammarIcon
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
        <div className="mb-4 bg-slate-900/50 rounded-xl ring-1 ring-slate-700 overflow-hidden font-casual">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                    <VocabularyIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    <span className="font-semibold text-slate-200 text-sm">Vocabulary Focus</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-3 border-t border-slate-700 space-y-4 bg-slate-900/30">
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddVocab()}
                                placeholder="Add target word..."
                                className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-md shadow-sm px-3 py-1.5 text-xs focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none placeholder-slate-500"
                                aria-label="Add target vocabulary word"
                            />
                            <button onClick={handleAddVocab} className="bg-yellow-500 text-slate-900 font-bold p-1.5 rounded-md hover:bg-yellow-400 transition-colors" aria-label="Add word">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {focusVocabulary.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {focusVocabulary.map(v => (
                                    <span key={v} className="flex items-center bg-yellow-500/10 text-yellow-300 text-xs font-medium px-2.5 py-1 rounded-full border border-yellow-500/20">
                                        {v}
                                        <button onClick={() => handleRemoveVocab(v)} className="ml-1.5 text-yellow-400 hover:text-white" aria-label={`Remove ${v}`}>
                                            <XCircleIcon className="w-3.5 h-3.5"/>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                            <span>Inclusion Rate</span>
                            <span>{inclusionRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={inclusionRate}
                            onChange={handleInclusionRateChange}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-yellow"
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
        <div className="mb-6 bg-slate-900/50 rounded-xl ring-1 ring-slate-700 overflow-hidden font-casual">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                    <GrammarIcon className="w-5 h-5 mr-2 text-emerald-400" />
                    <span className="font-semibold text-slate-200 text-sm">Grammar Focus</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-3 border-t border-slate-700 space-y-4 bg-slate-900/30">
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddGrammar()}
                                placeholder="Add grammar point..."
                                className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded-md shadow-sm px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                                aria-label="Add target grammar point"
                            />
                             <button onClick={handleAddGrammar} className="bg-emerald-500 text-slate-900 font-bold p-1.5 rounded-md hover:bg-emerald-400 transition-colors" aria-label="Add grammar point">
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        {focusGrammar.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {focusGrammar.map(g => (
                                    <span key={g} className="flex items-center bg-emerald-500/10 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/20">
                                        {g}
                                        <button onClick={() => handleRemoveGrammar(g)} className="ml-1.5 text-emerald-400 hover:text-white" aria-label={`Remove ${g}`}>
                                            <XCircleIcon className="w-3.5 h-3.5"/>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                         <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                            <span>Inclusion Rate</span>
                            <span>{grammarInclusionRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={grammarInclusionRate}
                            onChange={handleInclusionRateChange}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-emerald"
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

interface DraggableExerciseCardProps {
    type: ExerciseType;
    onAdd: (type: ExerciseType) => void;
}

const DraggableExerciseCard: React.FC<DraggableExerciseCardProps> = ({ type, onAdd }) => {
    const { logger, logFocusItem } = useActivityLogger();

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
        e.dataTransfer.setData('exerciseType', type);
        e.dataTransfer.effectAllowed = 'copy';
        logFocusItem('Project Management', 'Drag Exercise Card', 0.1, null, 1, [], type);
    };

    const handleClick = () => {
        onAdd(type);
        logFocusItem('Project Management', 'Click Exercise Card', 0.1, null, 1, [], type);
    };

    const pedagogy = EXERCISE_PEDAGOGY[type] || 'Default';
    const colors = PEDAGOGY_COLORS[pedagogy];
    const info = EXERCISE_INFO[type];
    const displayName = type.split('(')[0].trim();
    const SpecificIcon = EXERCISE_ICONS[type] || PencilSquareIcon;

    return (
        <div className="relative group">
            <button
                draggable
                onDragStart={handleDragStart}
                onClick={handleClick}
                className={`w-full text-left p-2.5 rounded-md cursor-pointer active:scale-95 transition-all duration-200 border ${colors.border} ${colors.bgOnDark} hover:bg-opacity-100 hover:translate-x-1 hover:shadow-lg group-hover:ring-1 ring-opacity-50 ring-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:${colors.border.replace('border-', 'ring-')}`}
                aria-label={`Add ${type} exercise`}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                        <SpecificIcon className={`w-4 h-4 ${colors.textOnDark} opacity-70`} />
                        <div className="min-w-0">
                            <h3 className={`text-xs font-medium truncate ${colors.textOnDark}`}>{displayName}</h3>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                         <DifficultyIndicatorIcon rating={info.difficultyRating} />
                    </div>
                </div>
            </button>
            {/* Tooltip */}
            <div className={`absolute left-full top-0 ml-4 w-72 
                           p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl 
                           opacity-0 group-hover:opacity-100 invisible group-hover:visible 
                           transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 pointer-events-none`}>
                <div className={`absolute top-4 -left-2 w-4 h-4 bg-slate-900 border-b border-l border-slate-700 transform rotate-45`}></div>
                <h4 className={`font-bold ${colors.textOnDark} text-base mb-1.5`}>{info.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                     <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.border} ${colors.bgOnDark} ${colors.textOnDark} bg-opacity-50`}>{pedagogy}</span>
                     <span className="text-xs text-slate-500">•</span>
                     <span className="text-xs text-slate-400">{info.difficultyRating}</span>
                </div>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{info.description}</p>
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 mb-2">
                    <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Example</p>
                    <p className="text-xs text-slate-300 font-mono italic">"{info.example}"</p>
                </div>
                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest pt-1">Click to add • Drag to place</p>
            </div>
        </div>
    );
}

const CategoryAccordion: React.FC<{ 
    category: typeof EXERCISE_CATEGORIES[0], 
    isOpen: boolean, 
    onToggle: () => void,
    icon: React.ReactNode,
    onAddExercise: (type: ExerciseType) => void
}> = ({ category, isOpen, onToggle, icon, onAddExercise }) => {
    const colors = PEDAGOGY_COLORS[category.name];
    const { logger, logFocusItem } = useActivityLogger();

    const handleToggle = () => {
        onToggle();
        logFocusItem('General UI', 'Accordion Toggled', 0.1, null, 1, [], `Category: ${category.name}, State: ${!isOpen ? 'Open' : 'Closed'}`);
    };

    return (
        <div className="mb-2 font-casual">
            <button 
                onClick={handleToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 border ${isOpen ? `${colors.bgOnDark} ${colors.border} shadow-lg` : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'}`}
                aria-expanded={isOpen}
                aria-controls={`panel-${category.name.replace(/\s/g, '-')}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`${colors.textOnDark}`}>
                        {icon}
                    </div>
                    {/* Always apply color for better visibility */}
                    <span className={`font-bold text-sm ${colors.textOnDark} transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-90'}`}>{category.name}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? `rotate-180 ${colors.textOnDark}` : 'text-slate-500'}`} />
            </button>
            
            <div id={`panel-${category.name.replace(/\s/g, '-')}`} role="region" aria-hidden={!isOpen} className={`grid transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className={`min-h-0 space-y-2 pl-2 border-l-2 ${colors.border.replace('border-', 'border-opacity-30 ')} ml-4`}>
                    {category.types.map(type => (
                        <DraggableExerciseCard key={type} type={type} onAdd={onAddExercise} />
                    ))}
                </div>
            </div>
        </div>
    );
};


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

const Sidebar: React.FC<SidebarProps> = ({ 
    focusVocabulary, setFocusVocabulary, inclusionRate, setInclusionRate,
    focusGrammar, setFocusGrammar, grammarInclusionRate, setGrammarInclusionRate,
    isSidebarOpen, onAddExercise, onExportState, onImportState, onClearBoard
}) => {
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


  const toggleCategory = (name: string) => {
      setOpenCategory(prev => prev === name ? null : name);
  };

  const getCategoryIcon = (name: string) => {
      switch(name) {
          case 'PPP': return <PPPIcon />;
          case 'Input': return <InputIcon />;
          case 'Lexis': return <LexisIcon />;
          case 'Skills': return <SkillsIcon />;
          case 'TBLT': return <TBLTIcon />;
          case 'Social English': return <SocialIcon />;
          case 'C-R': return <CRIcon />;
          case 'Production': return <ProductionIcon />;
          default: return <div className="w-5 h-5" />;
      }
  };

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
    <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out will-change-transform border-r border-slate-800 shadow-2xl
                     lg:static lg:translate-x-0
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} font-casual`}>
      
      <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-800 bg-slate-900 z-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warm-orange-400 to-action-amber-400 font-playful">gitEnglish™</h1>
        <h2 className="text-sm font-medium text-neutral-gray-400 mt-0.5 tracking-wide uppercase">Practice Genie</h2>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar-dark p-4">
          
          <div className="mb-6">
              <button 
                onClick={handleConfigToggle}
                className="flex items-center justify-between w-full p-2 mb-2 text-xs font-bold text-neutral-gray-500 uppercase tracking-wider hover:text-neutral-gray-300 transition-colors"
                aria-label="Toggle Configuration Panel"
              >
                  <span>Configuration</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`space-y-2 overflow-hidden transition-all duration-300 ${isConfigOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
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

          <div className="pb-8">
              <h3 className="text-xs font-bold text-neutral-gray-500 uppercase tracking-wider mb-3 ml-3">Exercise Library</h3>
              {EXERCISE_CATEGORIES.map((category) => (
                  <CategoryAccordion 
                      key={category.name}
                      category={category}
                      isOpen={openCategory === category.name}
                      onToggle={() => toggleCategory(category.name)}
                      icon={getCategoryIcon(category.name)}
                      onAddExercise={onAddExercise}
                  />
              ))}
          </div>

           <div className="mt-4 border-t border-slate-800 pt-6">
                <h3 className="text-xs font-bold text-neutral-gray-500 uppercase tracking-wider mb-3 ml-3">Project Actions</h3>
                <div className="flex flex-col gap-2">
                    <button onClick={handleExportClick} className="flex items-center gap-2 w-full p-2 text-sm font-medium text-neutral-gray-300 hover:bg-slate-800 rounded-lg transition-colors" aria-label="Export current project">
                        <DownloadIcon className="w-4 h-4 text-primary-blue-400" /> Export Project
                    </button>
                    <label className="flex items-center gap-2 w-full p-2 text-sm font-medium text-neutral-gray-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" aria-label="Import project from file">
                        <UploadIcon className="w-4 h-4 text-accent-green-400" /> Import Project
                        <input type="file" accept=".json" onChange={handleImportChange} className="hidden" />
                    </label>
                    <button onClick={handleClearBoardClick} className="flex items-center gap-2 w-full p-2 text-sm font-medium text-neutral-gray-300 hover:bg-energy-red-900/20 hover:text-energy-red-400 rounded-lg transition-colors" aria-label="Clear all exercises from board">
                        <TrashIcon className="w-4 h-4" /> Clear Board
                    </button>
                     <button onClick={() => logger?.downloadLog()} className="flex items-center gap-2 w-full p-2 text-sm font-medium text-neutral-gray-300 hover:bg-slate-800 rounded-lg transition-colors" aria-label="Download session activity log">
                        <DownloadIcon className="w-4 h-4 text-calm-teal-400" /> Download Activity Log
                    </button>
                </div>
            </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-neutral-gray-600">
          v2.1.0 • Infinite Canvas
      </div>

      <style>{`
        /* Custom scrollbar for dark sidebar */
        .custom-scrollbar-dark::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
            background: #334155; /* slate-700 */
            border-radius: 3px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
            background: #475569; /* slate-600 */
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
            border: 2px solid #1e293b; /* slate-900 */
            box-shadow: 0 0 0 1px #eab308;
        }
        .range-thumb-emerald::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: #10b981; /* emerald-500 */
            cursor: pointer;
            border-radius: 50%;
            border: 2px solid #1e293b; /* slate-900 */
            box-shadow: 0 0 0 1px #10b981;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;