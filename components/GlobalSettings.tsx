
import React from 'react';
import { Difficulty, Tone } from '../types';
import { DIFFICULTY_LEVELS, TONES, DIFFICULTY_LABELS } from '../constants';
import { DifficultyIcon, ToneIcon, ThemeIcon, InfoIcon } from './icons';

interface GlobalSettingsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  theme: string;
  setTheme: (t: string) => void;
  totalTime: number;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ difficulty, setDifficulty, tone, setTone, theme, setTheme, totalTime }) => {
  return (
    <div className="bg-slate-800/90 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700 p-2 text-slate-300 flex flex-wrap justify-center items-center gap-y-2 sm:space-x-4 w-fit mx-auto">

      {/* Difficulty Setting */}
      <div className="flex items-center space-x-1.5" title="Difficulty">
        <DifficultyIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="w-40 bg-slate-700 text-orange-400 font-semibold border border-slate-600 rounded-md shadow-sm px-2 py-1 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 truncate"
        >
          {DIFFICULTY_LEVELS.map(opt => (
            <option key={opt} value={opt}>
              {DIFFICULTY_LABELS[opt] || opt}
            </option>
          ))}
        </select>
      </div>

      {/* Tone Setting */}
      <div className="flex items-center space-x-1.5" title="Tone">
        <ToneIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          className="w-32 bg-slate-700 text-orange-400 font-semibold border border-slate-600 rounded-md shadow-sm px-2 py-1 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        >
          {TONES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      {/* Theme Setting */}
      <div className="flex items-center space-x-1.5" title="Theme">
        <ThemeIcon className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g. Travel"
          className="w-36 bg-slate-700 text-orange-400 font-semibold border border-slate-600 rounded-md shadow-sm px-2 py-1 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder-orange-400/70"
        />
      </div>

      {/* Total Time Indicator */}
      <div className="flex items-center px-3 py-1 rounded-md bg-slate-900/50 border border-slate-600 ml-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 tracking-wider">Total Time</span>
          <span className="text-sm font-bold text-green-400">~{totalTime}m</span>
      </div>

      {/* Info Tooltip */}
      <div className="relative group flex items-center">
        <InfoIcon className="w-5 h-5 text-yellow-400 cursor-pointer" />
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs
                      bg-slate-900 text-white text-center text-xs rounded-md p-2
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
            New blocks use these settings. You can override them individually.
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
