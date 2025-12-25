
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Whiteboard from './components/Whiteboard';
import RadialMenu from './components/RadialMenu'; // New import
import GlobalSettings from './components/GlobalSettings'; // Refactored GlobalSettings
import { ExerciseBlockState, ExerciseType, Difficulty, Tone } from './types';
import { EXERCISE_SIZE_OVERRIDES, DEFAULT_BLOCK_DIMENSIONS, calculateExerciseDuration, DIFFICULTY_LEVELS } from './constants';
import { MenuIcon } from './components/icons';

const APP_PREFIX = 'practiceGenie-';
const BLOCKS_KEY = `${APP_PREFIX}blocks`;
const PAGES_KEY = `${APP_PREFIX}pages`; // Kept for migration
const DIFFICULTY_KEY = `${APP_PREFIX}difficulty`;
const TONE_KEY = `${APP_PREFIX}tone`;
const THEME_KEY = `${APP_PREFIX}theme`;
const VOCAB_KEY = `${APP_PREFIX}focusVocabulary`;
const INCLUSION_RATE_KEY = `${APP_PREFIX}inclusionRate`;
const GRAMMAR_KEY = `${APP_PREFIX}focusGrammar`;
const GRAMMAR_RATE_KEY = `${APP_PREFIX}grammarInclusionRate`;


const App: React.FC = () => {
  const [blocks, setBlocks] = useState<ExerciseBlockState[]>(() => {
    try {
      // Migration Logic: Check for pages first
      const savedPages = localStorage.getItem(PAGES_KEY);
      if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          if (Array.isArray(parsedPages) && parsedPages.length > 0 && 'blocks' in parsedPages[0]) {
              console.log("Migrating from pages to infinite canvas...");
              // Flatten all blocks from all pages
              const migratedBlocks = parsedPages.flatMap((page: any) => 
                page.blocks.map((b: any) => ({...b, isGenerated: false}))
              );
              localStorage.removeItem(PAGES_KEY); // Clear old data
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
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
      // Migrate or default to B1
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
      } catch {
          return [];
      }
  });
  const [inclusionRate, setInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(INCLUSION_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [focusGrammar, setFocusGrammar] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem(GRAMMAR_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });
  const [grammarInclusionRate, setGrammarInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(GRAMMAR_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New state for modal
  const [presentingBlockId, setPresentingBlockId] = useState<number | null>(null);

  // Optimization: Use a ref to access latest state in callbacks without adding them as dependencies
  const stateRef = useRef({
      blocks,
      difficulty,
      tone,
      theme,
      focusVocabulary,
      inclusionRate,
      focusGrammar,
      grammarInclusionRate
  });

  useEffect(() => {
      stateRef.current = {
          blocks,
          difficulty,
          tone,
          theme,
          focusVocabulary,
          inclusionRate,
          focusGrammar,
          grammarInclusionRate
      };
  }, [blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate]);

  // Save state to localStorage whenever it changes
  // Debounce blocks persistence to avoid synchronous JSON.stringify on every drag frame
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

  // Navigation logic for Presentation Mode
  const enterPresentation = useCallback((blockId: number) => {
      setPresentingBlockId(blockId);
      setIsSidebarOpen(false); // Auto-close sidebar for better view
      setIsSettingsModalOpen(false); // Auto-close settings modal
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

  // Export/Import/Clear Logic
  const handleExportState = useCallback(() => {
      const {
          blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
      } = stateRef.current;

      const data = {
          version: '2.1.0',
          timestamp: new Date().toISOString(),
          state: {
              blocks,
              difficulty,
              tone,
              theme,
              focusVocabulary,
              inclusionRate,
              focusGrammar,
              grammarInclusionRate
          }
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
                  if (state.blocks) setBlocks(state.blocks);
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
      // Reset input
      e.target.value = '';
  }, []);

  const handleClearBoard = useCallback(() => {
      if (window.confirm("Are you sure you want to clear the entire whiteboard? This cannot be undone unless you have exported your project.")) {
          setBlocks([]);
          // Optionally reset other states or keep them
      }
  }, []);


  const addBlock = useCallback((type: ExerciseType, dropX?: number, dropY?: number) => {
    const {
        difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
    } = stateRef.current;

    setBlocks(prevBlocks => {
      const { width: newBlockWidth, height: newBlockHeight } = EXERCISE_SIZE_OVERRIDES[type] || DEFAULT_BLOCK_DIMENSIONS;

      let finalPos;

      if (dropX !== undefined && dropY !== undefined) {
          // Place centered on drop coordinates
          finalPos = { x: Math.max(0, dropX - newBlockWidth / 2), y: Math.max(0, dropY - newBlockHeight / 2) };
      } else {
          // Find a free spot if added via button/key (fallback)
          const PADDING = 50;
          const GRID_STEP = 50;
          let positionFound = false;
          finalPos = { x: PADDING, y: PADDING };
          
          // Simple search for non-overlapping space in the top-left area
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
        difficulty,
        tone,
        theme,
        focusVocabulary,
        inclusionRate,
        focusGrammar,
        grammarInclusionRate,
        x: finalPos.x,
        y: finalPos.y,
        width: newBlockWidth,
        height: newBlockHeight,
        zIndex: newZ,
        isGenerated: false,
      };

      return [...prevBlocks, newBlock];
    });
  }, []);

  const updateBlock = useCallback((blockId: number, updates: Partial<ExerciseBlockState>) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  }, []);

  const removeBlock = useCallback((blockId: number) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    if (presentingBlockId === blockId) exitPresentation();
  }, [presentingBlockId, exitPresentation]);

  const focusBlock = useCallback((blockId: number) => {
    setBlocks(prevBlocks => {
      const maxZ = Math.max(0, ...prevBlocks.map(b => b.zIndex || 0));
      const newZ = maxZ + 1;

      return prevBlocks.map(block =>
        block.id === blockId ? { ...block, zIndex: newZ } : block
      );
    });
  }, []);

  const cycleDifficulty = useCallback(() => {
    setDifficulty(prevDiff => {
        const currentIndex = DIFFICULTY_LEVELS.indexOf(prevDiff);
        const nextIndex = (currentIndex + 1) % DIFFICULTY_LEVELS.length;
        return DIFFICULTY_LEVELS[nextIndex] as Difficulty;
    });
  }, []);

  // Callbacks for Sidebar and RadialMenu
  const handleToggleSettings = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const handleCloseSettings = useCallback(() => setIsSettingsModalOpen(false), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className="h-screen w-screen flex font-casual antialiased overflow-hidden bg-slate-800">
      {/* Radial Menu replaces fixed top bar */}
      <RadialMenu 
          onToggleSettings={handleToggleSettings}
          onToggleSidebar={handleToggleSidebar}
          onExportState={handleExportState}
          difficulty={difficulty}
          onCycleDifficulty={cycleDifficulty}
      />

      {/* Settings Modal - conditionally rendered */}
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
        onAddExercise={addBlock} // Passed directly as it handles optional arguments safely
        onExportState={handleExportState}
        onImportState={handleImportState}
        onClearBoard={handleClearBoard}
      />
      
      {/* Overlay for mobile - Smooth transition */}
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

export default App;