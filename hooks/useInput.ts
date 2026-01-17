import { useEffect, useRef } from 'react';
import { InputState } from '../types';

export const useInput = () => {
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    dash: false,
    attack: false,
    interact: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
          inputRef.current.up = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          inputRef.current.down = true;
          break;
        case 'Space':
        case 'KeyZ':
          inputRef.current.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          inputRef.current.dash = true;
          break;
        case 'KeyX':
          inputRef.current.attack = true;
          break;
        case 'ArrowUp': // Alternative interact
        case 'KeyE':
          inputRef.current.interact = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
          inputRef.current.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          inputRef.current.down = false;
          break;
        case 'Space':
        case 'KeyZ':
          inputRef.current.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          inputRef.current.dash = false;
          break;
        case 'KeyX':
          inputRef.current.attack = false;
          break;
        case 'ArrowUp':
        case 'KeyE':
          inputRef.current.interact = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return inputRef;
};