import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { LoreModal } from './components/LoreModal';
import { GameState, Player, LoreTablet } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [playerState, setPlayerState] = useState<Player | null>(null);
  const [activeTablet, setActiveTablet] = useState<LoreTablet | null>(null);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    // Ideally we would reset the engine here. 
    // For this prototype, reloading the window or re-mounting the canvas works.
    window.location.reload(); 
  };

  const handlePlayerUpdate = useCallback((p: Player) => {
    // Only update React state if strictly necessary to avoid lag
    // Debouncing or checking diffs could help performance
    setPlayerState(prev => {
        if (!prev) return p;
        if (prev.health !== p.health || Math.abs(prev.soul - p.soul) > 1) {
            return p;
        }
        return prev;
    });
  }, []);

  const handleLoreInteract = (tablet: LoreTablet) => {
    setActiveTablet(tablet);
    // Game loop automatically pauses/switches state via prop in GameCanvas
    // We just need to handle the UI here
  };

  const closeLore = () => {
    setActiveTablet(null);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        onPlayerUpdate={handlePlayerUpdate}
        onLoreInteract={handleLoreInteract}
      />
      
      <UIOverlay 
        gameState={gameState} 
        player={playerState} 
        onStart={handleStart}
        onRestart={handleRestart}
      />

      {gameState === GameState.LORE_READING && (
        <LoreModal tablet={activeTablet} onClose={closeLore} />
      )}
    </div>
  );
}

export default App;