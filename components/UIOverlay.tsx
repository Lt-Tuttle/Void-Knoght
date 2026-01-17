import React from 'react';
import { GameState, Player } from '../types';
import { Skull, Heart, CircleDashed } from 'lucide-react';
import { COLORS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  player: Player | null;
  onStart: () => void;
  onRestart: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  player,
  onStart,
  onRestart
}) => {
  // --- HUD ---
  if (gameState === GameState.PLAYING || gameState === GameState.LORE_READING) {
    if (!player) return null;

    return (
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start">
        {/* Health Masks */}
        <div className="flex gap-2">
          {Array.from({ length: player.maxHealth }).map((_, i) => (
            <div key={i} className={`relative transition-opacity duration-300 ${i < player.health ? 'opacity-100' : 'opacity-20'}`}>
              <div className="w-10 h-12 bg-slate-100 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center">
                 {/* Mask Eyes */}
                 <div className="flex gap-1 mt-2">
                   <div className="w-2 h-4 bg-black rounded-full"></div>
                   <div className="w-2 h-4 bg-black rounded-full"></div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Soul Vessel */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-300 bg-slate-900/50 overflow-hidden flex items-end justify-center">
             <div 
               className="w-full bg-slate-100 transition-all duration-200 opacity-80"
               style={{ height: `${(player.soul / player.maxSoul) * 100}%` }}
             ></div>
          </div>
          <div className="absolute inset-0 border-4 border-slate-400 rounded-full shadow-lg"></div>
        </div>
      </div>
    );
  }

  // --- Main Menu ---
  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50">
        <h1 className="text-6xl text-slate-100 font-serif mb-4 tracking-widest uppercase">Void Knight</h1>
        <p className="text-slate-400 mb-12 font-serif italic">A hollow vessel for a lost kingdom.</p>
        
        <div className="flex flex-col gap-4 items-center">
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-transparent border border-slate-400 text-slate-200 font-serif hover:bg-slate-800 hover:border-white transition-all duration-300 text-xl tracking-wider"
          >
            Begin Journey
          </button>
          
          <div className="mt-8 text-slate-500 text-sm grid grid-cols-2 gap-x-8 gap-y-2 text-center">
             <span>Move: Arrows / WASD</span>
             <span>Jump: Space / Z</span>
             <span>Attack: X</span>
             <span>Dash: Shift / C</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Game Over ---
  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 animate-in fade-in duration-1000">
        <Skull className="w-24 h-24 text-slate-300 mb-6 opacity-80" />
        <h2 className="text-5xl text-slate-300 font-serif mb-2 tracking-widest">DEFEATED</h2>
        <p className="text-slate-500 mb-8 font-serif text-lg">The shade returns to the void.</p>
        
        <button 
            onClick={onRestart}
            className="px-8 py-3 bg-transparent border border-slate-500 text-slate-300 font-serif hover:bg-slate-800 hover:border-slate-200 transition-all duration-300"
          >
            Wake Again
          </button>
      </div>
    );
  }

  return null;
};