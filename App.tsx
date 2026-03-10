import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Whiteboard from './components/Whiteboard';
import RadialMenu from './components/RadialMenu';
import GlobalSettings from './components/GlobalSettings';
import { ExerciseType, Difficulty, Tone } from './enums';
import { DrawingPath, ExerciseBlockState } from "./types";
import { EXERCISE_SIZE_OVERRIDES, DEFAULT_BLOCK_DIMENSIONS, calculateExerciseDuration, DIFFICULTY_LEVELS } from './constants';
import { GamificationProvider } from './GamificationContext';
import GamificationHUD from './components/GamificationHUD';
import { useDebouncedSave } from './hooks/useDebouncedSave';
import { findFreePosition } from './placementUtils';
import { useStudentId } from './ActivityContext';

const APP_PREFIX = 'practiceGenie-';

const getStorageKey = (baseKey: string, studentId: string | null): string => {
  return studentId ? `${APP_PREFIX}${studentId}-${baseKey}` : `${APP_PREFIX}${baseKey}`;
};

const useStudentStorageKeys = (studentId: string | null) => {
  return useMemo(() => ({
    BLOCKS_KEY: getStorageKey('blocks', studentId),
    PATHS_KEY: getStorageKey('paths', studentId),
    PAGES_KEY: getStorageKey('pages', studentId),
    DIFFICULTY_KEY: getStorageKey('difficulty', studentId),
    TONE_KEY: getStorageKey('tone', studentId),
    THEME_KEY: getStorageKey('theme', studentId),
    VOCAB_KEY: getStorageKey('focusVocabulary', studentId),
    INCLUSION_RATE_KEY: getStorageKey('inclusionRate', studentId),
    GRAMMAR_KEY: getStorageKey('focusGrammar', studentId),
    GRAMMAR_RATE_KEY: getStorageKey('grammarInclusionRate', studentId),
  }), [studentId]);
};

const App: React.FC = () => {
  const studentId = useStudentId();
  const storageKeys = useStudentStorageKeys(studentId);

  const [{ blocks, totalTime }, setBoardState] = useState<{blocks: ExerciseBlockState[], totalTime: number}>(() => {
    let initialBlocks: ExerciseBlockState[] = [];
    try {
      const savedPages = localStorage.getItem(storageKeys.PAGES_KEY);
      if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          if (Array.isArray(parsedPages) && parsedPages.length > 0 && 'blocks' in parsedPages[0]) {
              const migratedBlocks = parsedPages.flatMap((page: any) => 
                page.blocks.map((b: any) => ({...b, isGenerated: false}))
              );
              localStorage.removeItem(storageKeys.PAGES_KEY);
              initialBlocks = migratedBlocks;
          }
      }

      if (initialBlocks.length === 0) {
        const savedBlocks = localStorage.getItem(storageKeys.BLOCKS_KEY);
        const parsedBlocks = savedBlocks ? JSON.parse(savedBlocks) : [];
        if (Array.isArray(parsedBlocks)) {
            initialBlocks = parsedBlocks.map((b: any) => ({ ...b, isGenerated: false }));
        }
      }
    } catch {
      // Ignore
    }
    const initialTime = initialBlocks.reduce((sum, block) => sum + calculateExerciseDuration(block.exerciseType, block.height, block.quantity), 0);
    return { blocks: initialBlocks, totalTime: initialTime };
  });

  const [paths, setPaths] = useState<DrawingPath[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeys.PATHS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
      const saved = localStorage.getItem(storageKeys.DIFFICULTY_KEY);
      if (saved && Object.values(Difficulty).includes(saved as Difficulty)) {
          return saved as Difficulty;
      }
      return Difficulty.B1;
  });
  const [tone, setTone] = useState<Tone>(() => (localStorage.getItem(storageKeys.TONE_KEY) as Tone) || Tone.Casual);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(storageKeys.THEME_KEY) || 'Daily Conversations');
  
  const [focusVocabulary, setFocusVocabulary] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem(storageKeys.VOCAB_KEY);
          return saved ? JSON.parse(saved) : [];
      } catch {
          return [];
      }
  });
  const [inclusionRate, setInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(storageKeys.INCLUSION_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [focusGrammar, setFocusGrammar] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem(storageKeys.GRAMMAR_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });
  const [grammarInclusionRate, setGrammarInclusionRate] = useState<number>(() => {
      const saved = localStorage.getItem(storageKeys.GRAMMAR_RATE_KEY);
      return saved ? Number(saved) : 50;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'General' | 'Vocabulary' | 'Grammar' | null>(null);
  const [presentingBlockId, setPresentingBlockId] = useState<number | null>(null);

  const stateRef = useRef({
      blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
  });

  useEffect(() => {
      stateRef.current = {
          blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate
      };
  }, [blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate]);

  useDebouncedSave(storageKeys.BLOCKS_KEY, blocks, 500);
  useDebouncedSave(storageKeys.PATHS_KEY, paths, 500);
  useDebouncedSave(storageKeys.DIFFICULTY_KEY, difficulty);
  useDebouncedSave(storageKeys.TONE_KEY, tone);
  useDebouncedSave(storageKeys.THEME_KEY, theme);
  useDebouncedSave(storageKeys.VOCAB_KEY, focusVocabulary);
  useDebouncedSave(storageKeys.INCLUSION_RATE_KEY, inclusionRate);
  useDebouncedSave(storageKeys.GRAMMAR_KEY, focusGrammar);
  useDebouncedSave(storageKeys.GRAMMAR_RATE_KEY, grammarInclusionRate);



  const enterPresentation = useCallback((blockId: number) => {
      setPresentingBlockId(blockId);
      setIsSidebarOpen(false);
      setSettingsModalTab(null);
  }, []);

  const exitPresentation = useCallback(() => setPresentingBlockId(null), []);

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
      const { blocks, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate } = stateRef.current;
      const data = {
          version: '2.1.0', timestamp: new Date().toISOString(),
          state: { blocks, paths, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate }
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
  }, [paths]);

  const handleImportState = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.state) {
                  const { state } = json;
                  if (state.blocks) setBoardState({ blocks: state.blocks, totalTime: state.blocks.reduce((sum: number, block: ExerciseBlockState) => sum + calculateExerciseDuration(block.exerciseType, block.height, block.quantity), 0) });
                  if (state.paths) setPaths(state.paths);
                  if (state.difficulty) setDifficulty(state.difficulty);
                  if (state.tone) setTone(state.tone);
                  if (state.theme) setTheme(state.theme);
                  if (state.focusVocabulary) setFocusVocabulary(state.focusVocabulary);
                  if (state.inclusionRate) setInclusionRate(state.inclusionRate);
                  if (state.focusGrammar) setFocusGrammar(state.focusGrammar);
                  if (state.grammarInclusionRate) setGrammarInclusionRate(state.grammarInclusionRate);
              }
          } catch (error) {
              alert("Invalid project file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  }, []);

  const handleClearBoard = useCallback(() => {
      if (window.confirm("Are you sure you want to clear the entire whiteboard?")) {
          setBoardState({ blocks: [], totalTime: 0 });
          setPaths([]);
      }
  }, []);

  const addBlock = useCallback((type: ExerciseType, dropX?: number, dropY?: number) => {
    const { difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate } = stateRef.current;
    setBoardState(prevState => {
      const prevBlocks = prevState.blocks;
      const { width: newBlockWidth, height: newBlockHeight } = EXERCISE_SIZE_OVERRIDES[type] || DEFAULT_BLOCK_DIMENSIONS;
      let finalPos = (dropX !== undefined && dropY !== undefined) 
          ? { x: Math.max(0, dropX - newBlockWidth / 2), y: Math.max(0, dropY - newBlockHeight / 2) }
          : findFreePosition(prevBlocks, newBlockWidth, newBlockHeight);
      let maxZ = 0;
      for (const b of prevBlocks) { if ((b.zIndex || 0) > maxZ) maxZ = b.zIndex || 0; }
      const newBlock: ExerciseBlockState = {
        id: Date.now(), exerciseType: type, difficulty, tone, theme, focusVocabulary, inclusionRate, focusGrammar, grammarInclusionRate,
        x: finalPos.x, y: finalPos.y, width: newBlockWidth, height: newBlockHeight, zIndex: maxZ + 1, isGenerated: false,
      };

      const duration = calculateExerciseDuration(newBlock.exerciseType, newBlock.height, newBlock.quantity);

      return {
          blocks: [...prevBlocks, newBlock],
          totalTime: prevState.totalTime + duration
      };
    });
  }, []);

  const updateBlock = useCallback((blockId: number, updates: Partial<ExerciseBlockState>) => {
    setBoardState(prevState => {
      const prevBlocks = prevState.blocks;
      const blockIndex = prevBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevState;

      const block = prevBlocks[blockIndex];
      const updatedBlock = { ...block, ...updates };

      const oldDuration = calculateExerciseDuration(block.exerciseType, block.height, block.quantity);
      const newDuration = calculateExerciseDuration(updatedBlock.exerciseType, updatedBlock.height, updatedBlock.quantity);

      const newBlocks = [...prevBlocks];
      newBlocks[blockIndex] = updatedBlock;

      return {
          blocks: newBlocks,
          totalTime: prevState.totalTime - oldDuration + newDuration
      };
    });
  }, []);

  const removeBlock = useCallback((blockId: number) => {
    setBoardState(prevState => {
      const prevBlocks = prevState.blocks;
      const blockIndex = prevBlocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return prevState;

      const block = prevBlocks[blockIndex];
      const duration = calculateExerciseDuration(block.exerciseType, block.height, block.quantity);

      const newBlocks = [...prevBlocks];
      newBlocks.splice(blockIndex, 1);

      return {
          blocks: newBlocks,
          totalTime: prevState.totalTime - duration
      };
    });
    if (presentingBlockId === blockId) exitPresentation();
  }, [presentingBlockId, exitPresentation]);

  const focusBlock = useCallback((blockId: number) => {
    setBoardState(prevState => {
      const prevBlocks = prevState.blocks;
      let maxZ = 0;
      let currentZ = -1;
      let maxZCount = 0;
      for (const b of prevBlocks) {
          const z = b.zIndex || 0;
          if (z > maxZ) { maxZ = z; maxZCount = 1; } else if (z === maxZ) { maxZCount++; }
          if (b.id === blockId) currentZ = z;
      }
      if (currentZ === maxZ && maxZCount === 1) return prevState;
      return {
          ...prevState,
          blocks: prevBlocks.map(block => block.id === blockId ? { ...block, zIndex: maxZ + 1 } : block)
      };
    });
  }, []);

  const cycleDifficulty = useCallback(() => {
    setDifficulty(prevDiff => {
        const currentIndex = DIFFICULTY_LEVELS.indexOf(prevDiff);
        const nextIndex = (currentIndex + 1) % DIFFICULTY_LEVELS.length;
        return DIFFICULTY_LEVELS[nextIndex] as Difficulty;
    });
  }, []);

  const handleOpenSettings = useCallback((tab: 'General' | 'Vocabulary' | 'Grammar') => setSettingsModalTab(tab), []);
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const handleCloseSettings = useCallback(() => setSettingsModalTab(null), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const handleAddPath = useCallback((path: DrawingPath) => setPaths(prev => [...prev, path]), []);
  const handleToggleDrawing = useCallback(() => setIsDrawingMode(prev => !prev), []);

  return (
    <GamificationProvider>
    <div className="h-screen w-screen flex font-casual antialiased overflow-hidden bg-slate-800 text-slate-200">
      <GamificationHUD />

      <RadialMenu 
          onOpenSettingsTab={handleOpenSettings}
          onToggleSidebar={handleToggleSidebar}
          onExportState={handleExportState}
          difficulty={difficulty}
          onCycleDifficulty={cycleDifficulty}
          isDrawingMode={isDrawingMode}
          onToggleDrawing={handleToggleDrawing}
      />

      {settingsModalTab && (
          <GlobalSettings 
              difficulty={difficulty} setDifficulty={setDifficulty}
              tone={tone} setTone={setTone}
              theme={theme} setTheme={setTheme}
              focusVocabulary={focusVocabulary} setFocusVocabulary={setFocusVocabulary}
              inclusionRate={inclusionRate} setInclusionRate={setInclusionRate}
              focusGrammar={focusGrammar} setFocusGrammar={setFocusGrammar}
              grammarInclusionRate={grammarInclusionRate} setGrammarInclusionRate={setGrammarInclusionRate}
              totalTime={totalTime}
              onClose={handleCloseSettings}
              initialTab={settingsModalTab}
          />
      )}

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        onAddExercise={addBlock}
        onExportState={handleExportState}
        onImportState={handleImportState}
        onClearBoard={handleClearBoard}
      />
      
      <div 
          onClick={handleCloseSidebar}
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out ${
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
          paths={paths}
          onAddPath={handleAddPath}
          isDrawingMode={isDrawingMode}
          disableInteraction={isSidebarOpen}
        />
      </div>
    </div>
    </GamificationProvider>
  );
};

export default App;