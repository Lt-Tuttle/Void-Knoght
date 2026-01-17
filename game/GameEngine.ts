import { 
  GameWorld, 
  Player, 
  InputState, 
  Platform, 
  Rect, 
  Enemy, 
  Particle,
  LoreTablet
} from '../types';
import { 
  GRAVITY, 
  TERMINAL_VELOCITY, 
  MOVE_SPEED, 
  JUMP_FORCE, 
  DASH_SPEED, 
  DASH_DURATION, 
  DASH_COOLDOWN,
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
  COLORS,
  PLAYER_WIDTH,
  PLAYER_HEIGHT
} from '../constants';

// Helper for AABB collision
function checkCollision(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}

export class GameEngine {
  world: GameWorld;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.world = this.initWorld(canvasWidth, canvasHeight);
  }

  initWorld(width: number, height: number): GameWorld {
    return {
      width: 2000,
      height: 1000,
      camera: { x: 0, y: 0 },
      player: {
        x: 100,
        y: 600,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        color: COLORS.player,
        facingRight: true,
        grounded: false,
        dashing: false,
        dashCooldown: 0,
        attacking: false,
        attackCooldown: 0,
        health: 5,
        maxHealth: 5,
        soul: 0,
        maxSoul: 100,
        invulnerable: 0,
      },
      platforms: [
        // Ground
        { x: 0, y: 800, w: 2000, h: 200, type: 'solid' },
        // Walls
        { x: -50, y: 0, w: 50, h: 1000, type: 'solid' },
        { x: 2000, y: 0, w: 50, h: 1000, type: 'solid' },
        // Floating Platforms
        { x: 300, y: 650, w: 200, h: 20, type: 'solid' },
        { x: 600, y: 500, w: 150, h: 20, type: 'solid' },
        { x: 900, y: 400, w: 200, h: 20, type: 'solid' },
        { x: 1300, y: 550, w: 100, h: 20, type: 'solid' },
        { x: 1600, y: 700, w: 200, h: 20, type: 'solid' },
        { x: 1200, y: 250, w: 300, h: 20, type: 'solid' }, // High platform for lore
      ],
      enemies: [
        { 
          x: 700, y: 760, w: 40, h: 40, vx: 2, vy: 0, 
          color: COLORS.enemy, type: 'crawler', 
          health: 3, id: 1, patrolStart: 500, patrolEnd: 1000, direction: 1 
        },
        { 
          x: 1400, y: 760, w: 50, h: 50, vx: 3, vy: 0, 
          color: COLORS.enemyInfected, type: 'crawler', 
          health: 5, id: 2, patrolStart: 1300, patrolEnd: 1800, direction: 1 
        }
      ],
      particles: [],
      loreTablets: [
        {
          id: 'tablet-1',
          x: 1300,
          y: 200,
          w: 40,
          h: 50,
          interacted: false,
          content: null,
          prompt: "The tablet depicts a warrior gazing into a void. The text speaks of the cost of power and the emptiness of the vessel."
        }
      ]
    };
  }

  update(input: InputState): { loreInteraction: LoreTablet | null } {
    const { player, platforms, enemies } = this.world;
    let loreInteraction = null;

    // --- Player Movement ---
    
    // Dash Logic
    if (player.dashCooldown > 0) player.dashCooldown--;

    if (input.dash && player.dashCooldown === 0 && !player.dashing) {
      player.dashing = true;
      player.dashCooldown = DASH_COOLDOWN;
      player.vx = player.facingRight ? DASH_SPEED : -DASH_SPEED;
      player.vy = 0; // Dash defies gravity temporarily
      // Create Dash Particles
      for(let i=0; i<5; i++) {
        this.addParticle(player.x + player.w/2, player.y + player.h/2, -player.vx * 0.5 + (Math.random()-0.5), (Math.random()-0.5));
      }
    }

    if (player.dashing) {
       // Stop dashing if velocity drops (friction) or time passes (handled by custom logic usually, here simplified)
       // Actually, let's use a timer approach for dash duration or just rely on drag
       if (Math.abs(player.vx) < DASH_SPEED * 0.5) {
         player.dashing = false;
         player.vx = 0;
       }
    } else {
      // Normal Movement
      if (input.left) {
        player.vx = -MOVE_SPEED;
        player.facingRight = false;
      } else if (input.right) {
        player.vx = MOVE_SPEED;
        player.facingRight = true;
      } else {
        player.vx = 0;
      }

      // Jump
      if (input.jump && player.grounded) {
        player.vy = JUMP_FORCE;
        player.grounded = false;
        // Jump Dust
         for(let i=0; i<5; i++) {
           this.addParticle(player.x + player.w/2, player.y + player.h, (Math.random()-0.5)*2, 1);
         }
      }

      // Gravity
      player.vy += GRAVITY;
      if (player.vy > TERMINAL_VELOCITY) player.vy = TERMINAL_VELOCITY;
    }

    // --- Attack Logic ---
    if (player.attackCooldown > 0) player.attackCooldown--;

    if (input.attack && player.attackCooldown === 0) {
      player.attacking = true;
      player.attackCooldown = ATTACK_COOLDOWN;
      
      // Determine Attack Hitbox
      const attackRange = 60;
      const attackRect: Rect = {
        x: player.facingRight ? player.x + player.w : player.x - attackRange,
        y: player.y,
        w: attackRange,
        h: player.h
      };

      // Check Enemy Hits
      enemies.forEach(enemy => {
        if (checkCollision(attackRect, enemy)) {
          enemy.health--;
          player.soul = Math.min(player.soul + 15, player.maxSoul);
          // Hit particles
          for(let i=0; i<8; i++) {
             this.addParticle(enemy.x + enemy.w/2, enemy.y + enemy.h/2, (Math.random()-0.5)*5, (Math.random()-0.5)*5, COLORS.player);
          }
          
          // Knockback
          enemy.vx = player.facingRight ? 5 : -5;
          player.vx = player.facingRight ? -3 : 3; // Recoil

          // Pogo effect (down slashing - simplified here to just recoil)
        }
      });
    } else {
      player.attacking = false;
    }

    // --- Physics Update ---
    player.x += player.vx;
    
    // Horizontal Collision
    for (const plat of platforms) {
      if (plat.type === 'solid' && checkCollision(player, plat)) {
        if (player.vx > 0) player.x = plat.x - player.w;
        else if (player.vx < 0) player.x = plat.x + plat.w;
        player.vx = 0;
      }
    }

    player.y += player.vy;
    player.grounded = false;

    // Vertical Collision
    for (const plat of platforms) {
      if (checkCollision(player, plat)) {
        // Landing
        if (player.vy > 0 && player.y + player.h - player.vy <= plat.y) {
          player.y = plat.y - player.h;
          player.vy = 0;
          player.grounded = true;
        } 
        // Hitting head
        else if (player.vy < 0 && plat.type === 'solid' && player.y - player.vy >= plat.y + plat.h) {
          player.y = plat.y + plat.h;
          player.vy = 0;
        }
      }
    }

    // --- Enemy Logic ---
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (enemy.health <= 0) {
        // Enemy death particles
         for(let k=0; k<15; k++) {
           this.addParticle(enemy.x + enemy.w/2, enemy.y + enemy.h/2, (Math.random()-0.5)*8, (Math.random()-0.5)*8, COLORS.enemy);
         }
        enemies.splice(i, 1);
        continue;
      }

      // Patrol
      if (enemy.x <= enemy.patrolStart) enemy.direction = 1;
      if (enemy.x >= enemy.patrolEnd) enemy.direction = -1;
      
      enemy.vx = enemy.direction * 2; // Speed
      enemy.x += enemy.vx;
      
      // Player Damage
      if (player.invulnerable === 0 && checkCollision(player, enemy)) {
        player.health--;
        player.invulnerable = 60; // 1 second @ 60fps
        // Knockback
        player.vy = -5;
        player.vx = enemy.x < player.x ? 5 : -5;
        if (player.health < 0) player.health = 0;
      }
    }

    // --- Lore Interaction ---
    for (const tablet of this.world.loreTablets) {
      if (checkCollision(player, tablet) && input.interact) {
        loreInteraction = tablet;
      }
    }

    // --- Particles ---
    this.updateParticles();

    // --- Invulnerability Tick ---
    if (player.invulnerable > 0) player.invulnerable--;

    return { loreInteraction };
  }

  addParticle(x: number, y: number, vx: number, vy: number, color: string = COLORS.particle) {
    this.world.particles.push({
      x, y, vx, vy, color,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      size: Math.random() * 3 + 1
    });
  }

  updateParticles() {
    for (let i = this.world.particles.length - 1; i >= 0; i--) {
      const p = this.world.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vy += 0.2; // Gravity for particles
      if (p.life <= 0) {
        this.world.particles.splice(i, 1);
      }
    }
  }
}