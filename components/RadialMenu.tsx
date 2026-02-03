import React, { useState, useEffect } from 'react';
import { SettingsIcon, DifficultyIcon, DownloadIcon, MenuIcon, XMarkIcon, ThemeIcon } from './icons';

interface RadialMenuProps {
    onToggleSettings: () => void;
    onToggleSidebar: () => void;
    onExportState: () => void;
    difficulty: string;
    onCycleDifficulty: () => void;
}

const RadialMenu = React.memo(({ onToggleSettings, onToggleSidebar, onExportState, difficulty, onCycleDifficulty }: RadialMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Close menu on click outside or Escape
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // Prevent closing if clicking inside the menu container itself (handled by stopPropagation, but extra safety here)
            if (isOpen && !(e.target as Element).closest('#radial-menu-container')) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const menuItems = [
        { icon: <SettingsIcon className="w-6 h-6" />, label: "Config", action: onToggleSettings, color: "text-amber-400" },
        { icon: <DifficultyIcon className="w-6 h-6" />, label: difficulty, subLabel: "Difficulty", action: onCycleDifficulty, color: "text-emerald-400" },
        { icon: <DownloadIcon className="w-6 h-6" />, label: "Export", action: onExportState, color: "text-blue-400" },
        { icon: <ThemeIcon className="w-6 h-6" />, label: "Themes", action: () => console.log("Theme toggle - Future feature"), color: "text-purple-400" },
    ];

    const radius = 100; // Increased radius for larger buttons

    return (
        <div id="radial-menu-container" className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-center font-casual perspective-[1000px]"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
            {/* Visual Arc Grouping (Only visible when open) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                 <div className="w-[240px] h-[120px] rounded-b-full border-b-2 border-dashed border-white/10 mask-image-gradient"></div>
            </div>

            {/* Main Orb */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`relative w-16 h-16 rounded-full shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 z-[102]
                            ${isOpen ? 'bg-slate-900 text-white rotate-90 scale-105 ring-4 ring-white/10' : 'bg-slate-800/80 text-white hover:bg-slate-700 hover:scale-105 hover:shadow-blue-500/20 ring-1 ring-white/20'}
                            backdrop-blur-xl border border-white/10 group`}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
                aria-expanded={isOpen}
            >
                {isOpen ? <XMarkIcon className="w-8 h-8 transition-transform duration-300 rotate-90" /> : <MenuIcon className="w-8 h-8" />}

                {/* Pulse effect when closed and idle */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-white/10 opacity-20 duration-1000 pointer-events-none"></span>
                )}
            </button>

            {/* Satellites */}
            {menuItems.map((item, index) => {
                // Distribute items in a semi-circle below the main button
                const angleDegree = 160 - (index * 40); // From 160deg (left-down) to 40deg (right-down)
                const angleRad = (angleDegree * Math.PI) / 180;
                
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);

                // Animation calculation
                const style = isOpen 
                    ? {
                        transform: `translate(${x}px, ${y}px) scale(1)`,
                        opacity: 1,
                        pointerEvents: 'auto' as const,
                        transitionDelay: `${index * 40}ms`
                      }
                    : {
                        transform: `translate(0px, 0px) scale(0.3)`,
                        opacity: 0,
                        pointerEvents: 'none' as const,
                        transitionDelay: `${(menuItems.length - 1 - index) * 30}ms`
                      };

                return (
                    <div
                        key={index}
                        style={style}
                        className="absolute flex flex-col items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    >
                        <button
                            onClick={() => {
                                item.action();
                                setIsOpen(false);
                            }}
                            className={`w-14 h-14 rounded-full shadow-lg border border-white/10 backdrop-blur-md
                                       flex items-center justify-center transition-all duration-200
                                       hover:scale-110 hover:shadow-xl hover:bg-slate-800 hover:border-white/30
                                       bg-slate-900/80 text-slate-200 group/btn`}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <div className={`${item.color} drop-shadow-sm transition-transform group-hover/btn:scale-110`}>
                                {item.icon}
                            </div>
                        </button>

                        {/* Persistent Label for Clarity */}
                        <div className="absolute top-full mt-2 flex flex-col items-center">
                            <span className="px-2 py-0.5 bg-slate-900/90 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-sm border border-white/10 whitespace-nowrap tracking-wide">
                                {item.label}
                            </span>
                            {item.subLabel && (
                                <span className="text-[8px] font-medium text-slate-400 mt-0.5 tracking-wider uppercase">
                                    {item.subLabel}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {/* Main Label tooltip when closed */}
            {!isOpen && isHovered && (
                 <div className="absolute top-20 text-[10px] font-bold uppercase tracking-widest text-slate-200 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/10 animate-in fade-in slide-in-from-top-1">
                     Open Menu
                 </div>
            )}
        </div>
    );
});

export default RadialMenu;
