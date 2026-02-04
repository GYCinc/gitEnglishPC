import React, { useState, useEffect } from 'react';
import { Difficulty, Tone } from '../enums';
import { DIFFICULTY_LEVELS, TONES, DIFFICULTY_LABELS } from '../constants';
import {
    DifficultyIcon, ToneIcon, ThemeIcon, XMarkIcon, SettingsIcon,
    VocabularyIcon, GrammarIcon, PlusIcon, XCircleIcon
} from './icons';
import { useActivityLogger } from '../ActivityContext';

interface VocabularyFocusProps {
    focusVocabulary: string[];
    setFocusVocabulary: (vocab: string[]) => void;
    inclusionRate: number;
    setInclusionRate: (rate: number) => void;
}

const VocabularyFocus: React.FC<VocabularyFocusProps> = ({ focusVocabulary, setFocusVocabulary, inclusionRate, setInclusionRate }) => {
    const [inputValue, setInputValue] = useState('');
    const { logFocusItem } = useActivityLogger();

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

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddVocab()}
                        placeholder="Add target word..."
                        className="flex-grow bg-slate-900/50 text-slate-200 border border-white/10 rounded-lg shadow-inner px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder-slate-500 transition-all font-casual"
                    />
                    <button onClick={handleAddVocab} className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 font-bold px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-900/20">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                    {focusVocabulary.length === 0 ? (
                        <p className="text-slate-500 italic text-sm w-full text-center py-8">No vocabulary added yet.</p>
                    ) : (
                        focusVocabulary.map(v => (
                            <span key={v} className="flex items-center bg-amber-500/10 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-500/20 shadow-sm backdrop-blur-sm group hover:border-amber-500/40 transition-all animate-in zoom-in-50">
                                {v}
                                <button onClick={() => handleRemoveVocab(v)} className="ml-2 text-amber-500/70 hover:text-amber-200 transition-colors">
                                    <XCircleIcon className="w-4 h-4"/>
                                </button>
                            </span>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <span>Inclusion Rate</span>
                    <span className="text-amber-400">{inclusionRate}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={inclusionRate}
                    onChange={(e) => setInclusionRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer range-thumb-amber accent-amber-500"
                />
            </div>
        </div>
    );
};

interface GrammarFocusProps {
    focusGrammar: string[];
    setFocusGrammar: (grammar: string[]) => void;
    grammarInclusionRate: number;
    setGrammarInclusionRate: (rate: number) => void;
}

const GrammarFocus: React.FC<GrammarFocusProps> = ({ focusGrammar, setFocusGrammar, grammarInclusionRate, setGrammarInclusionRate }) => {
    const [inputValue, setInputValue] = useState('');
    const { logFocusItem } = useActivityLogger();

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

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddGrammar()}
                        placeholder="Add grammar point..."
                        className="flex-grow bg-slate-900/50 text-slate-200 border border-white/10 rounded-lg shadow-inner px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:outline-none placeholder-slate-500 transition-all font-casual"
                    />
                    <button onClick={handleAddGrammar} className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-900 font-bold px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-900/20">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                    {focusGrammar.length === 0 ? (
                         <p className="text-slate-500 italic text-sm w-full text-center py-8">No grammar points added yet.</p>
                    ) : (
                        focusGrammar.map(g => (
                            <span key={g} className="flex items-center bg-emerald-500/10 text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm backdrop-blur-sm group hover:border-emerald-500/40 transition-all animate-in zoom-in-50">
                                {g}
                                <button onClick={() => handleRemoveGrammar(g)} className="ml-2 text-emerald-500/70 hover:text-emerald-200 transition-colors">
                                    <XCircleIcon className="w-4 h-4"/>
                                </button>
                            </span>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <span>Inclusion Rate</span>
                    <span className="text-emerald-400">{grammarInclusionRate}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={grammarInclusionRate}
                    onChange={(e) => setGrammarInclusionRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer range-thumb-emerald accent-emerald-500"
                />
            </div>
        </div>
    );
};

interface GlobalSettingsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  theme: string;
  setTheme: (t: string) => void;
  totalTime: number;
  onClose: () => void;
  // New Props
  focusVocabulary: string[];
  setFocusVocabulary: (vocab: string[]) => void;
  inclusionRate: number;
  setInclusionRate: (rate: number) => void;
  focusGrammar: string[];
  setFocusGrammar: (grammar: string[]) => void;
  grammarInclusionRate: number;
  setGrammarInclusionRate: (rate: number) => void;
  initialTab?: 'General' | 'Vocabulary' | 'Grammar';
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
    difficulty, setDifficulty, tone, setTone, theme, setTheme, totalTime, onClose,
    focusVocabulary, setFocusVocabulary, inclusionRate, setInclusionRate,
    focusGrammar, setFocusGrammar, grammarInclusionRate, setGrammarInclusionRate,
    initialTab = 'General'
}) => {
  const [activeTab, setActiveTab] = useState<'General' | 'Vocabulary' | 'Grammar'>(initialTab);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none font-casual">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300" onClick={onClose}></div>
        
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 w-full max-w-lg pointer-events-auto transform transition-all animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="p-6 pb-0 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <SettingsIcon className="w-6 h-6 text-blue-400" />
                        Lesson Setup
                    </h2>
                    <p className="text-sm text-slate-400">Configure your practice session.</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 mt-6 border-b border-white/5 space-x-1">
                {(['General', 'Vocabulary', 'Grammar'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-bold transition-all relative ${
                            activeTab === tab
                            ? 'text-white'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar-dark flex-grow">
                {activeTab === 'General' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Difficulty */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                            <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <DifficultyIcon className="w-4 h-4 mr-2 text-blue-400" />
                                Difficulty Level
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {DIFFICULTY_LEVELS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setDifficulty(opt)}
                                        className={`p-2 rounded-lg text-xs font-bold transition-all border ${
                                            difficulty === opt
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]'
                                            : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                        }`}
                                    >
                                        {DIFFICULTY_LABELS[opt] || opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                             <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <ToneIcon className="w-4 h-4 mr-2 text-purple-400" />
                                Tone & Style
                            </label>
                             <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-horizontal">
                                {TONES.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setTone(opt)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                                            tone === opt
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]'
                                            : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                            <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                <ThemeIcon className="w-4 h-4 mr-2 text-green-400" />
                                Content Theme
                            </label>
                            <input
                                type="text"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="e.g. Travel, Business, Sci-Fi..."
                                className="w-full bg-slate-900/50 text-slate-200 border border-white/10 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 focus:outline-none transition-all placeholder-slate-600 font-casual"
                            />
                        </div>

                         <div className="pt-2 flex justify-between items-center opacity-80">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Time</span>
                            <span className="text-sm font-bold text-green-400 bg-green-900/20 px-3 py-1 rounded-lg border border-green-500/20">~{totalTime} min</span>
                        </div>
                    </div>
                )}

                {activeTab === 'Vocabulary' && (
                    <VocabularyFocus
                        focusVocabulary={focusVocabulary}
                        setFocusVocabulary={setFocusVocabulary}
                        inclusionRate={inclusionRate}
                        setInclusionRate={setInclusionRate}
                    />
                )}

                {activeTab === 'Grammar' && (
                    <GrammarFocus
                        focusGrammar={focusGrammar}
                        setFocusGrammar={setFocusGrammar}
                        grammarInclusionRate={grammarInclusionRate}
                        setGrammarInclusionRate={setGrammarInclusionRate}
                    />
                )}
            </div>

            <div className="p-6 pt-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
                 <button onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                    Save Configuration
                 </button>
            </div>
        </div>
        <style>{`
        .range-thumb-amber::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px; height: 16px; background: #f59e0b;
            border-radius: 50%; cursor: pointer; border: 2px solid #1e293b;
            box-shadow: 0 0 0 1px #f59e0b; transition: transform 0.1s;
        }
        .range-thumb-amber::-webkit-slider-thumb:hover { transform: scale(1.1); }
        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        `}</style>
    </div>
  );
};

export default GlobalSettings;
