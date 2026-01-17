import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameState, LoreTablet, Player, InputState } from '../types';
import { COLORS } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onPlayerUpdate: (player: Player) => void;
  onLoreInteract: (tablet: LoreTablet) => void;
  inputRef: React.MutableRefObject<InputState>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  onPlayerUpdate,
  onLoreInteract,
  inputRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const requestRef = useRef<number>();

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Set actual canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    engineRef.current = new GameEngine(canvas.width, canvas.height);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game Loop
  const tick = () => {
    if (!canvasRef.current || !engineRef.current) return;

    if (gameState === GameState.PLAYING) {
      // Use the passed inputRef which contains merged keyboard and touch inputs
      const { loreInteraction } = engineRef.current.update(inputRef.current);
      
      // Sync React State
      onPlayerUpdate({ ...engineRef.current.world.player });

      // Handle Interactions
      if (loreInteraction) {
        onLoreInteract(loreInteraction);
        setGameState(GameState.LORE_READING);
      }

      // Check Death
      if (engineRef.current.world.player.health <= 0) {
        setGameState(GameState.GAME_OVER);
      }
    }

    render(canvasRef.current, engineRef.current);
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]); // Restart loop logic if state changes

  const render = (canvas: HTMLCanvasElement, engine: GameEngine) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const { player, platforms, enemies, particles, loreTablets } = engine.world;

    // --- Camera Follow Logic ---
    const targetCamX = player.x + player.w / 2 - width / 2;
    const targetCamY = player.y + player.h / 2 - height / 2;
    
    const maxCamX = engine.world.width - width;
    const maxCamY = engine.world.height - height;
    
    engine.world.camera.x += (Math.max(0, Math.min(targetCamX, maxCamX)) - engine.world.camera.x) * 0.1;
    engine.world.camera.y += (Math.max(0, Math.min(targetCamY, maxCamY)) - engine.world.camera.y) * 0.1;

    const camX = engine.world.camera.x;
    const camY = engine.world.camera.y;

    // --- Clear & Background ---
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // Parallax elements
    ctx.fillStyle = '#0f172a'; // darker
    ctx.fillRect(200 - camX * 0.5, 0, 100, height);
    ctx.fillRect(800 - camX * 0.5, 0, 150, height);
    ctx.fillRect(1500 - camX * 0.5, 0, 120, height);

    ctx.save();
    ctx.translate(-camX, -camY);

    // --- Draw Platforms ---
    ctx.fillStyle = COLORS.ground;
    platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#334155';
      ctx.fillRect(p.x, p.y, p.w, 4);
      ctx.fillStyle = COLORS.ground;
    });

    // --- Draw Lore Tablets ---
    loreTablets.forEach(t => {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(t.x, t.y + t.h);
      ctx.lineTo(t.x + t.w, t.y + t.h);
      ctx.lineTo(t.x + t.w * 0.8, t.y);
      ctx.lineTo(t.x + t.w * 0.2, t.y);
      ctx.fill();
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px serif';
      ctx.fillText('?', t.x + t.w/2 - 5, t.y + t.h/2);

      const dist = Math.hypot(player.x - t.x, player.y - t.y);
      if (dist < 100) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        // On mobile we might not see this text easily, but UI buttons will handle it
        ctx.fillText('Press UP/Interact', t.x - 20, t.y - 10);
      }
    });

    // --- Draw Enemies ---
    enemies.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      if (e.direction > 0) {
        ctx.fillRect(e.x + e.w - 15, e.y + 15, 5, 5);
      } else {
        ctx.fillRect(e.x + 10, e.y + 15, 5, 5);
      }
    });

    // --- Draw Player ---
    if (player.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      // Blink
    } else {
      ctx.fillStyle = COLORS.playerCloak;
      ctx.beginPath();
      ctx.moveTo(player.x + 5, player.y + player.h);
      ctx.lineTo(player.x + player.w - 5, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + 20);
      ctx.lineTo(player.x, player.y + 20);
      ctx.fill();

      ctx.fillStyle = COLORS.player;
      const headHeight = 35;
      ctx.fillRect(player.x, player.y, player.w, headHeight);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x - 5, player.y - 15);
      ctx.lineTo(player.x + 10, player.y);
      
      ctx.moveTo(player.x + player.w, player.y);
      ctx.lineTo(player.x + player.w + 5, player.y - 15);
      ctx.lineTo(player.x + player.w - 10, player.y);
      ctx.fill();

      ctx.fillStyle = '#000';
      const eyeSize = 8;
      const eyeY = player.y + 15;
      if (player.facingRight) {
        ctx.fillRect(player.x + player.w - 10, eyeY, eyeSize, eyeSize * 1.5);
        ctx.fillRect(player.x + player.w - 25, eyeY, eyeSize, eyeSize * 1.5);
      } else {
        ctx.fillRect(player.x + 2, eyeY, eyeSize, eyeSize * 1.5);
        ctx.fillRect(player.x + 17, eyeY, eyeSize, eyeSize * 1.5);
      }

      if (player.attacking) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (player.facingRight) {
          ctx.arc(player.x + player.w/2, player.y + player.h/2, 50, -Math.PI/2, Math.PI/2);
        } else {
          ctx.arc(player.x + player.w/2, player.y + player.h/2, 50, Math.PI/2, -Math.PI/2);
        }
        ctx.stroke();
      }
    }

    // --- Draw Particles ---
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full"
    />
  );
};