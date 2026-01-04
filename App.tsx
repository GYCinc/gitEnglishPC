
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Whiteboard from './components/Whiteboard';
import RadialMenu from './components/RadialMenu';
import GlobalSettings from './components/GlobalSettings';
import { ExerciseBlockState, ExerciseType, Difficulty, Tone } from './types';
import { EXERCISE_SIZE_OVERRIDES, DEFAULT_BLOCK_DIMENSIONS, calculateExerciseDuration, DIFFICULTY_LEVELS } from './constants';
import { GamificationProvider, useGamification } from './GamificationContext';
import { UndoIcon, RedoIcon, MenuIcon } from './components/icons';
import { ConfettiExplosion } from './components/Confetti';
import { useActivityLogger } from './ActivityContext';

const APP_PREFIX = 'practiceGenie-';
const BLOCKS_KEY = `${APP_PREFIX}blocks`;
const PAGES_KEY = `${APP_PREFIX}pages`;
const DIFFICULTY_KEY = `${APP_PREFIX}difficulty`;
const TONE_KEY = `${APP_PREFIX}tone`;
const THEME_KEY = `${APP_PREFIX}theme`;
const VOCAB_KEY = `${APP_PREFIX}focusVocabulary`;
const INCLUSION_RATE_KEY = `${APP_PREFIX}inclusionRate`;
const GRAMMAR_KEY = `${APP_PREFIX}focusGrammar`;
const GRAMMAR_RATE_KEY = `${APP_PREFIX}grammarInclusionRate`;

// Internal helper for history management
// Accepts a value or a lazy initializer function
function useHistory<T>(initialState: T | (() => T)) {
    const [history, setHistory] = useState<{
        past: T[];
        present: T;
        future: T[];
    }>(() => {
        const init = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
        return {
            past: [],
            present: init,
            future: []
        };
    });

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const undo = useCallback(() => {
        setHistory(curr => {
            if (curr.past.length === 0) return curr;
            const previous = curr.past[curr.past.length - 1];
            const newPast = curr.past.slice(0, curr.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(curr => {
            if (curr.future.length === 0) return curr;
            const next = curr.future[0];
            const newFuture = curr.future.slice(1);
            return {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresent: T | ((curr: T) => T)) => {
        setHistory(curr => {
            const nextState = typeof newPresent === 'function' ? (newPresent as (c: T) => T)(curr.present) : newPresent;
            if (nextState === curr.present) return curr;
            return {
                past: [...curr.past, curr.present],
                present: nextState,
                future: []
            };
        });
    }, []);

    const reset = useCallback((state: T) => {
        setHistory({
            past: [],
            present: state,
            future: []
        });
    }, []);

    return { state: history.present, set, undo, redo, canUndo, canRedo, reset };
}

// Inner App Component to consume Contexts
const AppContent: React.FC = () => {
  const { xp, level, streak, addXP, incrementStreak, playPopSound } = useGamification();
  const { logger } = useActivityLogger();

  // Load initial blocks
  const loadInitialBlocks = (): ExerciseBlockState[] => {
    try {
      const savedPages = localStorage.getItem(PAGES_KEY);
      if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          if (Array.isArray(parsedPages) && parsedPages.length > 0 && 'blocks' in parsedPages[0]) {
              console.log("Migrating from pages to infinite canvas...");
              const migratedBlocks = parsedPages.flatMap((page: any) => 
                page.blocks.map((b: any) => ({...b, isGenerated: false}))
              );
              localStorage.removeItem(PAGES_KEY);
              return migratedBlocks;
          }
      }
      const savedBlocks = localStorage.getItem(BLOCKS_KEY);
      const parsedBlocks = savedBlocks ? JSON.parse(savedBlocks) : [];
      if (Array.isArray(parsedBlocks)) {
          return parsedBlocks.map(b => ({ ...b, isGenerated: false }));
      }
      return [];
    } catch {
      return [];
    }
  };

  // Pass function reference for lazy initialization
  const { state: blocks, set: setBlocks, undo, redo, canUndo, canRedo, reset: resetBlocks } = useHistory<ExerciseBlockState[]>(loadInitialBlocks);

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
      const saved = localStorage.getItem(DIFFICULTY_KEY);
      if (saved && Object.values(Difficulty).includes(saved as Difficulty)) {
          return saved as Difficulty;
      }
      return Difficulty.B1;
  });
  const [tone, setTone] = useState<Tone>(() => (localStorage.getItem(TONE_KEY) as Tone) || Tone.Casual);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(THEME_KEY) || 'Daily Conversations');
  
  const [focusVocabulary, setFocusVocabulary] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem(VOCAB_KEY);
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });
  const [inclusionRate, setInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(INCLUSION_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [focusGrammar, setFocusGrammar] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem(GRAMMAR_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [grammarInclusionRate, setGrammarInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(GRAMMAR_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [presentingBlockId, setPresentingBlockId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on level up
  const lastLevelRef = useRef(level);
  useEffect(() => {
    if (level > lastLevelRef.current) {
        setShowConfetti(true);
    }
    lastLevelRef.current = level;
  }, [level]);

  // Log streak update on mount
  useEffect(() => {
    incrementStreak();
  }, [incrementStreak]);

  const stateRef = useRef({
      blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
  });

  useEffect(() => {
      stateRef.current = {
          blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
      };
  }, [blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate]);

  // Debounced persistence
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
    }, 500);
    return () => clearTimeout(handler);
  }, [blocks]);

  useEffect(() => { localStorage.setItem(DIFFICULTY_KEY, difficulty) }, [difficulty]);
  useEffect(() => { localStorage.setItem(TONE_KEY, tone) }, [tone]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme) }, [theme]);
  useEffect(() => { localStorage.setItem(VOCAB_KEY, JSON.stringify(focusVocabulary))}, [focusVocabulary]);
  useEffect(() => { localStorage.setItem(INCLUSION_RATE_KEY, String(inclusionRate))}, [inclusionRate]);
  useEffect(() => { localStorage.setItem(GRAMMAR_KEY, JSON.stringify(focusGrammar))}, [focusGrammar]);
  useEffect(() => { localStorage.setItem(GRAMMAR_RATE_KEY, String(grammarInclusionRate))}, [grammarInclusionRate]);

  const totalTime = useMemo(() => {
      return blocks.reduce((sum, block) => sum + calculateExerciseDuration(block.exerciseType, block.height, block.quantity), 0);
  }, [blocks]);

  const enterPresentation = useCallback((blockId: number) => {
      setPresentingBlockId(blockId);
      setIsSidebarOpen(false);
      setIsSettingsModalOpen(false);
  }, []);

  const exitPresentation = useCallback(() => {
      setPresentingBlockId(null);
  }, []);

  const nextSlide = useCallback(() => {
      if (presentingBlockId === null) return;
      const currentIndex = blocks.findIndex(b => b.id === presentingBlockId);
      if (currentIndex !== -1 && currentIndex < blocks.length - 1) {
          setPresentingBlockId(blocks[currentIndex + 1].id);
      }
  }, [blocks, presentingBlockId]);

  const prevSlide = useCallback(() => {
      if (presentingBlockId === null) return;
      const currentIndex = blocks.findIndex(b => b.id === presentingBlockId);
      if (currentIndex > 0) {
          setPresentingBlockId(blocks[currentIndex - 1].id);
      }
  }, [blocks, presentingBlockId]);

  const handleExportState = useCallback(() => {
      const current = stateRef.current;
      const data = {
          version: '2.2.0',
          timestamp: new Date().toISOString(),
          state: current
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `practice-genie-project-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }, []);

  const handleImportState = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.state) {
                  const { state } = json;
                  if (state.blocks) resetBlocks(state.blocks);
                  if (state.difficulty) setDifficulty(state.difficulty);
                  if (state.tone) setTone(state.tone);
                  if (state.theme) setTheme(state.theme);
                  if (state.focusVocabulary) setFocusVocabulary(state.focusVocabulary);
                  if (state.inclusionRate) setInclusionRate(state.inclusionRate);
                  if (state.focusGrammar) setFocusGrammar(state.focusGrammar);
                  if (state.grammarInclusionRate) setGrammarInclusionRate(state.grammarInclusionRate);
              }
          } catch (error) {
              console.error("Failed to parse project file", error);
              alert("Invalid project file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  }, [resetBlocks]);

  const handleClearBoard = useCallback(() => {
      if (window.confirm("Are you sure you want to clear the entire whiteboard?")) {
          setBlocks([]);
      }
  }, [setBlocks]);


  const addBlock = useCallback((type: ExerciseType, dropX?: number, dropY?: number) => {
    const current = stateRef.current;

    // Play sound
    playPopSound();

    // Award XP for creating content
    addXP(10);

    setBlocks((prevBlocks) => {
      const { width: newBlockWidth, height: newBlockHeight } = EXERCISE_SIZE_OVERRIDES[type] || DEFAULT_BLOCK_DIMENSIONS;
      let finalPos;

      if (dropX !== undefined && dropY !== undefined) {
          finalPos = { x: Math.max(0, dropX - newBlockWidth / 2), y: Math.max(0, dropY - newBlockHeight / 2) };
      } else {
          const PADDING = 50;
          const GRID_STEP = 50;
          let positionFound = false;
          finalPos = { x: PADDING, y: PADDING };
          
          for (let y = PADDING; y < 3000 && !positionFound; y += GRID_STEP) {
            for (let x = PADDING; x < 3000 && !positionFound; x += GRID_STEP) {
               const newRect = { x: x, y: y, width: newBlockWidth, height: newBlockHeight };
               let hasOverlap = false;
               for (const existingBlock of prevBlocks) {
                    if (
                        newRect.x < existingBlock.x + existingBlock.width + PADDING &&
                        newRect.x + newRect.width + PADDING > existingBlock.x &&
                        newRect.y < existingBlock.y + existingBlock.height + PADDING &&
                        newRect.y + newRect.height + PADDING > existingBlock.y
                    ) {
                        hasOverlap = true;
                        break;
                    }
               }
               if (!hasOverlap) {
                   finalPos = { x, y };
                   positionFound = true;
               }
            }
          }
      }

      const maxZ = Math.max(0, ...prevBlocks.map(b => b.zIndex || 0));
      const newZ = maxZ + 1;

      const newBlock: ExerciseBlockState = {
        id: Date.now(),
        exerciseType: type,
        difficulty: current.difficulty,
        tone: current.tone,
        theme: current.theme,
        focusVocabulary: current.focusVocabulary,
        inclusionRate: current.inclusionRate,
        focusGrammar: current.focusGrammar,
        grammarInclusionRate: current.grammarInclusionRate,
        x: finalPos.x,
        y: finalPos.y,
        width: newBlockWidth,
        height: newBlockHeight,
        zIndex: newZ,
        isGenerated: false,
      };

      return [...prevBlocks, newBlock];
    });
  }, [setBlocks, playPopSound, addXP]);

  const updateBlock = useCallback((blockId: number, updates: Partial<ExerciseBlockState>) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, [setBlocks]);

  const removeBlock = useCallback((blockId: number) => {
    setBlocks((prevBlocks) => prevBlocks.filter(block => block.id !== blockId));
    if (presentingBlockId === blockId) exitPresentation();
  }, [presentingBlockId, exitPresentation, setBlocks]);

  const focusBlock = useCallback((blockId: number) => {
    setBlocks((prevBlocks) => {
      const maxZ = Math.max(0, ...prevBlocks.map(b => b.zIndex || 0));
      const newZ = maxZ + 1;
      return prevBlocks.map(block =>
        block.id === blockId ? { ...block, zIndex: newZ } : block
      );
    });
  }, [setBlocks]);

  const cycleDifficulty = useCallback(() => {
    setDifficulty(prevDiff => {
        const currentIndex = DIFFICULTY_LEVELS.indexOf(prevDiff);
        const nextIndex = (currentIndex + 1) % DIFFICULTY_LEVELS.length;
        return DIFFICULTY_LEVELS[nextIndex] as Difficulty;
    });
  }, []);

  const handleToggleSettings = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const handleCloseSettings = useCallback(() => setIsSettingsModalOpen(false), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Key Bindings for Undo/Redo
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              undo();
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
              e.preventDefault();
              redo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen w-screen flex font-casual antialiased overflow-hidden bg-slate-800 relative">
      <ConfettiExplosion active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Gamification Status Bar (Top Right) */}
      <div className="fixed top-4 right-4 z-[50] flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-slate-700 shadow-xl">
          <div className="flex flex-col items-center px-2 border-r border-slate-700">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
             <span className="text-xl font-black text-white leading-none">{level}</span>
          </div>
          <div className="flex flex-col gap-1 w-24">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>XP</span>
                  <span>{xp % 100}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${xp % 100}%` }}
                  />
              </div>
          </div>
          <div className="flex flex-col items-center px-2 border-l border-slate-700" title="Daily Streak">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Streak</span>
             <span className="text-lg font-black text-orange-500 leading-none">🔥 {streak}</span>
          </div>
      </div>

      {/* Undo/Redo Controls (Bottom Left, avoiding collision with Minimap) */}
      <div className="fixed bottom-4 left-4 z-[50] flex gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-3 bg-slate-900 text-white rounded-full shadow-lg border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all"
            title="Undo (Ctrl+Z)"
          >
              <UndoIcon className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-3 bg-slate-900 text-white rounded-full shadow-lg border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all"
            title="Redo (Ctrl+Y)"
          >
              <RedoIcon className="w-5 h-5" />
          </button>
      </div>

      <RadialMenu 
          onToggleSettings={handleToggleSettings}
          onToggleSidebar={handleToggleSidebar}
          onExportState={handleExportState}
          difficulty={difficulty}
          onCycleDifficulty={cycleDifficulty}
      />

      {isSettingsModalOpen && (
          <GlobalSettings 
              difficulty={difficulty} setDifficulty={setDifficulty}
              tone={tone} setTone={setTone}
              theme={theme} setTheme={setTheme}
              totalTime={totalTime}
              onClose={handleCloseSettings}
          />
      )}

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        focusVocabulary={focusVocabulary}
        setFocusVocabulary={setFocusVocabulary}
        inclusionRate={inclusionRate}
        setInclusionRate={setInclusionRate}
        focusGrammar={focusGrammar}
        setFocusGrammar={setFocusGrammar}
        grammarInclusionRate={grammarInclusionRate}
        setGrammarInclusionRate={setGrammarInclusionRate}
        onAddExercise={addBlock}
        onExportState={handleExportState}
        onImportState={handleImportState}
        onClearBoard={handleClearBoard}
      />
      
      <div 
          onClick={handleCloseSidebar}
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden="true"
      ></div>

      <div className="flex-grow flex flex-col relative">
        <Whiteboard 
          blocks={blocks}
          onAddBlock={addBlock}
          onUpdateBlock={updateBlock} 
          onRemoveBlock={removeBlock} 
          onFocusBlock={focusBlock}
          presentingBlockId={presentingBlockId}
          onEnterPresentation={enterPresentation}
          onExitPresentation={exitPresentation}
          onNextSlide={nextSlide}
          onPrevSlide={prevSlide}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GamificationProvider>
       <AppContent />
    </GamificationProvider>
  );
};

export default App;
