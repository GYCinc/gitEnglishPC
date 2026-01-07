import React, { useEffect, useState } from 'react';
import { useGamification } from '../GamificationContext';

const GamificationHUD: React.FC = () => {
  const { xp, level, streak } = useGamification();
  const [animateXP, setAnimateXP] = useState(false);

  useEffect(() => {
    setAnimateXP(true);
    const timer = setTimeout(() => setAnimateXP(false), 500);
    return () => clearTimeout(timer);
  }, [xp]);

  return (
    <div className="fixed top-4 right-20 z-50 flex gap-4 font-casual select-none">
      <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur text-white px-3 py-1.5 rounded-full border border-slate-700 shadow-lg">
        <span className="text-xl">🔥</span>
        <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-slate-400 uppercase">Streak</span>
            <span className="font-bold text-orange-400">{streak}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur text-white px-3 py-1.5 rounded-full border border-slate-700 shadow-lg">
        <span className="text-xl">⭐</span>
        <div className="flex flex-col leading-none">
             <span className="text-xs font-bold text-slate-400 uppercase">Lvl {level}</span>
             <span className={`font-bold transition-all duration-300 ${animateXP ? 'text-yellow-300 scale-125' : 'text-yellow-500'}`}>
                 {xp} XP
             </span>
        </div>
      </div>
    </div>
  );
};

export default GamificationHUD;
