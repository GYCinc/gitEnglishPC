import React from 'react';
import { Difficulty, Tone } from '../enums';
import { DIFFICULTY_LEVELS, TONES, DIFFICULTY_LABELS } from '../constants';
// Add SettingsIcon import
import { DifficultyIcon, ToneIcon, ThemeIcon, InfoIcon, XMarkIcon, SettingsIcon } from './icons'; // XMarkIcon added

interface GlobalSettingsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  tone: Tone;
  setTone: (t: Tone) => void;
  theme: string;
  setTheme: (t: string) => void;
  totalTime: number;
  onClose: () => void; // New prop for closing the modal
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ difficulty, setDifficulty, tone, setTone, theme, setTheme, totalTime, onClose }) => {
  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200" onClick={onClose} aria-label="Close settings"></div>
        
        {/* Floating Card/Modal */}
        <div className="bg-[#fffbf0] rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md pointer-events-auto transform transition-all animate-in fade-in zoom-in-95 duration-200 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close settings">
                <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3 font-playful">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
                Lesson Configuration
            </h2>
            <p className="text-sm text-slate-600 mb-6 font-casual">Set the default parameters for new exercises.</p>

            <div className="space-y-5">
                {/* Difficulty Setting */}
                <div className="space-y-2">
                    <label htmlFor="global-difficulty" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                        <DifficultyIcon className="w-4 h-4 mr-2 text-blue-500" />
                        Difficulty Level
                    </label>
                    <select
                        id="global-difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none font-casual"
                    >
                        {DIFFICULTY_LEVELS.map(opt => (
                            <option key={opt} value={opt}>
                                {DIFFICULTY_LABELS[opt] || opt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tone Setting */}
                <div className="space-y-2">
                     <label htmlFor="global-tone" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                        <ToneIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Tone & Style
                    </label>
                    <select
                        id="global-tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as Tone)}
                        className="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all appearance-none font-casual"
                    >
                        {TONES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                
                {/* Theme Setting */}
                <div className="space-y-2">
                    <label htmlFor="global-theme" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wide font-casual">
                        <ThemeIcon className="w-4 h-4 mr-2 text-green-500" />
                        Content Theme
                    </label>
                    <input
                        id="global-theme"
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g. Travel, Business, Sci-Fi..."
                        className="w-full bg-slate-50 text-slate-900 font-medium border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-slate-500 font-casual"
                    />
                </div>

                {/* Total Time Indicator */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center font-casual">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Lesson Time</span>
                    <span className="text-lg font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">~{totalTime} min</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GlobalSettings;