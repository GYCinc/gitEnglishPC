import React from 'react';
import { useGamification } from '../hooks/useGamification';
import { SparklesIcon } from './icons';

export const GamificationHUD: React.FC = () => {
    const { level, xp, streak } = useGamification();

    return (
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-white font-casual">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg border border-white/10">
                        {level}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Level</p>
                        <p className="text-sm font-bold leading-none">Novice Genie</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-orange-400 font-bold">
                        <SparklesIcon className="w-4 h-4" />
                        <span>{streak}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Day Streak</p>
                </div>
            </div>

            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(xp % 100)}%` }} // Simplified visual for demo
                ></div>
            </div>
            <p className="text-[10px] text-slate-500 text-right mt-1">{xp} XP Total</p>
        </div>
    );
};
