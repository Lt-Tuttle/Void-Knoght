import React, { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { LoreModal } from './components/LoreModal';
import { GameState, Player, LoreTablet } from './types';
import { useInput } from './hooks/useInput';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [playerState, setPlayerState] = useState<Player | null>(null);
  const [activeTablet, setActiveTablet] = useState<LoreTablet | null>(null);
  
  // Lift input state so UI can write to it (touch) and Canvas can read it (game loop)
  const inputRef = useInput();

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    window.location.reload(); 
  };

  const handlePlayerUpdate = useCallback((p: Player) => {
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
  };

  const closeLore = () => {
    setActiveTablet(null);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none touch-none">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        onPlayerUpdate={handlePlayerUpdate}
        onLoreInteract={handleLoreInteract}
        inputRef={inputRef}
      />
      
      <UIOverlay 
        gameState={gameState} 
        player={playerState} 
        onStart={handleStart}
        onRestart={handleRestart}
        inputRef={inputRef}
      />

      {gameState === GameState.LORE_READING && (
        <LoreModal tablet={activeTablet} onClose={closeLore} />
      )}
    </div>
  );
}

export default App;