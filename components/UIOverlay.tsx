import React from 'react';
import { GameState, Player, InputState } from '../types';
import { Skull, ArrowLeft, ArrowRight, Sword, Wind, ArrowUp, Zap } from 'lucide-react';
import { COLORS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  player: Player | null;
  onStart: () => void;
  onRestart: () => void;
  inputRef: React.MutableRefObject<InputState>;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  player,
  onStart,
  onRestart,
  inputRef
}) => {
  // --- Touch Handlers ---
  // We use direct ref manipulation for performance (avoiding React renders on every frame)
  const handleTouchStart = (key: keyof InputState) => (e: React.TouchEvent) => {
    // Prevent default to stop scrolling/zooming/selection
    if (e.cancelable) e.preventDefault();
    if (inputRef.current) inputRef.current[key] = true;
  };

  const handleTouchEnd = (key: keyof InputState) => (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    if (inputRef.current) inputRef.current[key] = false;
  };

  // Helper to render a touch button
  const TouchButton = ({ 
    action, 
    icon: Icon, 
    className 
  }: { 
    action: keyof InputState; 
    icon: React.ElementType; 
    className: string 
  }) => (
    <div
      className={`absolute flex items-center justify-center bg-slate-800/60 border-2 border-slate-500 rounded-full text-white active:bg-slate-600/80 active:scale-95 transition-transform backdrop-blur-sm touch-none select-none ${className}`}
      onTouchStart={handleTouchStart(action)}
      onTouchEnd={handleTouchEnd(action)}
      // Also support mouse for testing on desktop
      onMouseDown={() => inputRef.current[action] = true}
      onMouseUp={() => inputRef.current[action] = false}
      onMouseLeave={() => inputRef.current[action] = false}
    >
      <Icon size={32} />
    </div>
  );

  // --- HUD ---
  if (gameState === GameState.PLAYING || gameState === GameState.LORE_READING) {
    if (!player) return null;

    return (
      <>
        {/* HUD Top Bar */}
        <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
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

        {/* Touch Controls - Visible on screens, usually hidden on large desktop if strictly mobile, but kept here for playability */}
        <div className="absolute inset-0 pointer-events-none z-20 lg:hidden">
          {/* D-Pad Area (Left) */}
          <div className="absolute bottom-8 left-8 w-48 h-32 pointer-events-auto">
             <TouchButton action="left" icon={ArrowLeft} className="w-20 h-20 left-0 bottom-0" />
             <TouchButton action="right" icon={ArrowRight} className="w-20 h-20 right-0 bottom-0" />
          </div>

          {/* Action Buttons (Right) */}
          <div className="absolute bottom-8 right-8 w-56 h-48 pointer-events-auto">
             {/* Jump (Primary - Bottom Center) */}
             <TouchButton action="jump" icon={ArrowUp} className="w-24 h-24 bottom-0 right-16 border-slate-400" />
             
             {/* Attack (Secondary - Left of Jump) */}
             <TouchButton action="attack" icon={Sword} className="w-20 h-20 bottom-4 left-0 border-red-900/50 bg-red-900/30" />
             
             {/* Dash (Tertiary - Right of Jump) */}
             <TouchButton action="dash" icon={Wind} className="w-16 h-16 bottom-8 -right-2 border-slate-600" />
             
             {/* Interact (Top Center) */}
             <TouchButton action="interact" icon={Zap} className="w-14 h-14 top-0 right-20 border-yellow-900/50 bg-yellow-900/30" />
          </div>
        </div>
      </>
    );
  }

  // --- Main Menu ---
  if (gameState === GameState.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50">
        <h1 className="text-6xl text-slate-100 font-serif mb-4 tracking-widest uppercase text-center px-4">Void Knight</h1>
        <p className="text-slate-400 mb-12 font-serif italic text-center px-4">A hollow vessel for a lost kingdom.</p>
        
        <div className="flex flex-col gap-4 items-center">
          <button 
            onClick={onStart}
            className="px-8 py-3 bg-transparent border border-slate-400 text-slate-200 font-serif hover:bg-slate-800 hover:border-white transition-all duration-300 text-xl tracking-wider cursor-pointer"
          >
            Begin Journey
          </button>
          
          <div className="mt-8 text-slate-500 text-sm grid grid-cols-2 gap-x-8 gap-y-2 text-center">
             <span>Move: Arrows / WASD</span>
             <span>Jump: Space / Z</span>
             <span>Attack: X</span>
             <span>Dash: Shift / C</span>
          </div>
          
          <div className="mt-4 text-slate-600 text-xs text-center lg:hidden">
             Touch controls enabled
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
            className="px-8 py-3 bg-transparent border border-slate-500 text-slate-300 font-serif hover:bg-slate-800 hover:border-slate-200 transition-all duration-300 cursor-pointer"
          >
            Wake Again
          </button>
      </div>
    );
  }

  return null;
};