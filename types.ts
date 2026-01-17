export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER,
  LORE_READING
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  vx: number;
  vy: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface Platform extends Rect {
  type: 'solid' | 'oneway';
}

export interface Player extends Entity {
  facingRight: boolean;
  grounded: boolean;
  dashing: boolean;
  dashCooldown: number;
  attacking: boolean;
  attackCooldown: number;
  health: number;
  maxHealth: number;
  soul: number;
  maxSoul: number;
  invulnerable: number;
}

export interface Enemy extends Entity {
  id: number;
  health: number;
  patrolStart: number;
  patrolEnd: number;
  direction: number; // 1 or -1
  type: 'crawler' | 'flyer';
}

export interface LoreTablet extends Rect {
  id: string;
  interacted: boolean;
  content: string | null; // Cached content
  prompt: string;
}

export interface GameWorld {
  player: Player;
  platforms: Platform[];
  enemies: Enemy[];
  particles: Particle[];
  loreTablets: LoreTablet[];
  camera: Vector2;
  width: number;
  height: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  dash: boolean;
  attack: boolean;
  interact: boolean;
}