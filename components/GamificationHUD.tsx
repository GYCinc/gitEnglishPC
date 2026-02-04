import React, { useEffect, useState } from 'react';
import { useGamification } from '../GamificationContext';

const BoltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.981 9.75h3.75a.75.75 0 0 1 .69 1.012l-7.5 11.25a.75.75 0 0 1-1.372-.635l1.993-7.307H6.75a.75.75 0 0 1-.69-1.012l7.5-11.25a.75.75 0 0 1 1.055-.213Z" clipRule="evenodd" />
    </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006Z" clipRule="evenodd" />
    </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.625v1.386a5.25 5.25 0 0 0-3.329 4.908.75.75 0 0 0 .75.75h13.86a.75.75 0 0 0 .75-.75 5.25 5.25 0 0 0-3.329-4.908v-1.386a6.753 6.753 0 0 0 6.138-5.625.75.75 0 0 0-.584-.859c-1.012-.213-2.036-.395-3.071-.543v-.858a.75.75 0 0 0-.75-.75H5.916a.75.75 0 0 0-.75.75Zm13.5 1.583c.915.217 1.828.436 2.736.66a5.252 5.252 0 0 1-4.236 4.62v-1.386c.52-.271 1.021-.572 1.5-1.908ZM6.134 4.204c.915.217 1.828.436 2.736.66v2.908a5.252 5.252 0 0 1-4.236-4.62c.5-.224 1-.39 1.5-1.908Z" clipRule="evenodd" />
        <path d="M10.5 19.5a1.5 1.5 0 0 0-1.5 1.5V22a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-1a1.5 1.5 0 0 0-1.5-1.5h-3Z" />
    </svg>
);

const GamificationHUD: React.FC = () => {
  const { xp, level, streak } = useGamification();
  const [animateXP, setAnimateXP] = useState(false);

  useEffect(() => {
    setAnimateXP(true);
    const timer = setTimeout(() => setAnimateXP(false), 500);
    return () => clearTimeout(timer);
  }, [xp]);

  return (
    <div className="fixed top-6 right-8 z-[90] flex gap-4 font-casual select-none">
      {/* Streak */}
      <div className="group flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors">
        <div className="p-1.5 bg-amber-500/10 rounded-lg ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
            <BoltIcon className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</span>
            <span className="font-bold text-slate-200 text-sm">{streak} <span className="text-xs font-medium text-slate-500">days</span></span>
        </div>
      </div>

      {/* Level & XP */}
      <div className="group flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-lg hover:bg-slate-800/60 transition-colors">
        <div className="flex items-center gap-3 border-r border-white/10 pr-4">
             <div className="p-1.5 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
                <TrophyIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level</span>
                <span className="font-bold text-slate-200 text-sm">{level}</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="p-1.5 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                <StarIcon className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${animateXP ? 'scale-125 text-blue-300' : ''}`} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</span>
                <span className={`font-bold text-sm transition-colors duration-300 ${animateXP ? 'text-blue-300' : 'text-slate-200'}`}>
                    {xp.toLocaleString()}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationHUD;
