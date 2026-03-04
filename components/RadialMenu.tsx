import React, { useState, useEffect } from 'react';
import { SettingsIcon, DifficultyIcon, DownloadIcon, MenuIcon, XMarkIcon, ThemeIcon, PencilIcon } from './icons';

interface RadialMenuProps {
    onToggleSettings: () => void;
    onToggleSidebar: () => void;
    onExportState: () => void;
    difficulty: string;
    onCycleDifficulty: () => void;
    isDrawingMode: boolean;
    onToggleDrawing: () => void;
}

const RadialMenu = React.memo(({ onToggleSettings, onToggleSidebar, onExportState, difficulty, onCycleDifficulty, isDrawingMode, onToggleDrawing }: RadialMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

    // Close menu on click outside or Escape
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // Prevent closing if clicking inside the menu container itself
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
        { icon: <SettingsIcon className="w-5 h-5" />, label: "Config", action: onToggleSettings },
        { icon: <DifficultyIcon className="w-5 h-5" />, label: `Difficulty: ${difficulty}`, action: onCycleDifficulty },
        { icon: <DownloadIcon className="w-5 h-5" />, label: "Export", action: onExportState },
        { 
          icon: <PencilIcon className={`w-5 h-5 ${isDrawingMode ? 'text-amber-500' : ''}`} />, 
          label: isDrawingMode ? "Stop Drawing" : "Draw Mode", 
          action: onToggleDrawing 
        },
        { icon: <ThemeIcon className="w-5 h-5" />, label: "Themes", action: () => console.log("Theme toggle - Future feature") }, 
    ];

    const radius = 80;

    return (
        <div id="radial-menu-container" className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-center font-casual"
             onMouseEnter={() => !isOpen && setHoveredLabel('Menu')}
             onMouseLeave={() => setHoveredLabel(null)}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-[102]
                            ${isOpen ? 'bg-blue-800 text-white rotate-90 scale-110' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-blue-500/30'}
                            border-4 border-white/20 backdrop-blur-sm ring-1 ring-black/5`}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
                aria-expanded={isOpen}
                onMouseEnter={() => setHoveredLabel(isOpen ? 'Close' : 'Menu')}
                onMouseLeave={() => setHoveredLabel(null)}
            >
                {isOpen ? <XMarkIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </button>

            {menuItems.map((item, index) => {
                const angleDegree = 160 - (index * (120 / (menuItems.length - 1)));
                const angleRad = (angleDegree * Math.PI) / 180;
                
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);

                const style = isOpen
                    ? { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, pointerEvents: 'auto', transitionDelay: `${index * 50}ms` }
                    : { transform: `translate(0px, 0px) scale(0.5)`, opacity: 0, pointerEvents: 'none', transitionDelay: `${(menuItems.length - 1 - index) * 50}ms` };

                return (
                    <button
                        key={index}
                        onClick={() => { 
                            item.action(); 
                            setIsOpen(false); 
                        }}
                        style={style}
                        className="absolute w-10 h-10 bg-white text-blue-800 rounded-full shadow-lg border border-slate-200 
                                   flex items-center justify-center transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:scale-110"
                        title={item.label}
                        aria-label={item.label}
                        onMouseEnter={() => setHoveredLabel(item.label)}
                        onMouseLeave={() => setHoveredLabel(null)}
                    >
                        {item.icon}
                    </button>
                );
            })}
            
            {hoveredLabel && (
                 <div className="absolute top-16 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/90 px-2 py-1 rounded-md shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-1 whitespace-nowrap z-[101]">
                     {hoveredLabel}
                 </div>
            )}
        </div>
    );
});

export default RadialMenu;