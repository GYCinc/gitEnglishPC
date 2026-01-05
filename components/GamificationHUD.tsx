import React from 'react';
import { useGamification } from './GamificationContext';
import { Trophy, Flame, Star } from 'lucide-react';

const XP_PER_LEVEL = 1000;

const GamificationHUD: React.FC = () => {
  const { xp, level, streak } = useGamification();

  const xpProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200">

      {/* Level Circle */}
      <div className="relative group cursor-help">
         <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full text-white font-bold text-lg shadow-md border-2 border-indigo-200">
            {level}
         </div>
         {/* Tooltip */}
         <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Current Level
         </div>
      </div>

      {/* XP Bar */}
      <div className="flex flex-col w-32 group">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
            <span>XP</span>
            <span>{xp % XP_PER_LEVEL} / {XP_PER_LEVEL}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Streak Counter */}
      <div className="flex items-center space-x-1 pl-2 border-l border-gray-300" title="Daily Streak">
        <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} fill={streak > 0 ? "currentColor" : "none"} />
        <span className={`font-bold ${streak > 0 ? 'text-orange-600' : 'text-gray-400'}`}>{streak}</span>
      </div>

    </div>
  );
};

export default GamificationHUD;
