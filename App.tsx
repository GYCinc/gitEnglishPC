
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Whiteboard from './components/Whiteboard';
import { ExerciseBlockState, ExerciseType, Difficulty, Tone } from './types';
import { EXERCISE_SIZE_OVERRIDES, DEFAULT_BLOCK_DIMENSIONS, calculateExerciseDuration } from './constants';
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

  const [zCounter, setZCounter] = useState(() => {
    if (blocks.length > 0) {
        return Math.max(...blocks.map(b => b.zIndex)) + 1;
    }
    return 1;
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [presentingBlockId, setPresentingBlockId] = useState<number | null>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => { localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks)) }, [blocks]);
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


  const addBlock = useCallback((type: ExerciseType, dropX?: number, dropY?: number) => {
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

      const newZ = zCounter + 1;
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
      setZCounter(newZ);

      return [...prevBlocks, newBlock];
    });
  }, [difficulty, tone, theme, zCounter, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate]);

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
    const newZ = zCounter + 1;
    setZCounter(newZ);
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, zIndex: newZ } : block
      )
    );
  }, [zCounter]);

  return (
    <div className="h-screen w-screen flex font-sans antialiased overflow-hidden bg-slate-800">
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
        onAddExercise={(type) => addBlock(type)}
      />
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            aria-hidden="true"
        ></div>
      )}
      <div className="flex-grow flex flex-col relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-700/80 text-white rounded-full backdrop-blur-sm"
          aria-label="Toggle sidebar"
        >
            <MenuIcon />
        </button>
        <Whiteboard 
          blocks={blocks}
          onAddBlock={addBlock}
          onUpdateBlock={updateBlock} 
          onRemoveBlock={removeBlock} 
          onFocusBlock={focusBlock}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          tone={tone}
          setTone={setTone}
          theme={theme}
          setTheme={setTheme}
          totalTime={totalTime}
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
