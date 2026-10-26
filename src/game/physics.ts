import { PlayerState, Stage, Platform, Rect } from '../types/game';
import { sound } from '../services/audio';

export const PHYSICS_CONFIG = {
  GRAVITY: 1600,
  MOVE_SPEED: 320,
  ACCELERATION: 1800,
  FRICTION: 1400,
  AIR_ACCEL: 1200,
  AIR_FRICTION: 400,
  JUMP_FORCE: -580,
  MIN_JUMP_FORCE: -260,
  COYOTE_TIME: 0.12,
  JUMP_BUFFER_TIME: 0.12,
  MAX_FALL_SPEED: 850,
  HEAD_BOUNCE_FORCE: -620,
};

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  justJumped: boolean;
  jumpReleased: boolean;
}

export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export class PhysicsEngine {
  public updatePlayer(
    player: PlayerState,
    input: InputState,
    dt: number,
    stage: Stage,
    otherPlayers: PlayerState[],
    onPuzzleTrigger: (triggerId: string, active: boolean) => void,
    onCheckpoint: (cpIndex: number) => void,
    onStageComplete: () => void,
    onCoinCollected?: (coinId: string) => void
  ) {
    if (!player.isAlive) {
      player.respawnTimer -= dt;
      if (player.respawnTimer <= 0) {
        this.respawnPlayer(player, stage);
      }
      return;
    }

    // Update timers
    if (player.coyoteTimer > 0) player.coyoteTimer -= dt;
    if (player.jumpBufferTimer > 0) player.jumpBufferTimer -= dt;
    if (player.invulnerableTimer && player.invulnerableTimer > 0) {
      player.invulnerableTimer -= dt;
    }

    if (input.justJumped) {
      player.jumpBufferTimer = PHYSICS_CONFIG.JUMP_BUFFER_TIME;
    }

    // Horizontal Movement & Acceleration
    let targetVx = 0;
    if (input.left && !input.right) {
      targetVx = -PHYSICS_CONFIG.MOVE_SPEED;
      player.facing = -1;
    } else if (input.right && !input.left) {
      targetVx = PHYSICS_CONFIG.MOVE_SPEED;
      player.facing = 1;
    }

    const accel = player.isGrounded ? PHYSICS_CONFIG.ACCELERATION : PHYSICS_CONFIG.AIR_ACCEL;
    const friction = player.isGrounded ? PHYSICS_CONFIG.FRICTION : PHYSICS_CONFIG.AIR_FRICTION;

    if (targetVx !== 0) {
      if (player.vx < targetVx) {
        player.vx = Math.min(targetVx, player.vx + accel * dt);
      } else if (player.vx > targetVx) {
        player.vx = Math.max(targetVx, player.vx - accel * dt);
      }
    } else {
      if (player.vx > 0) {
        player.vx = Math.max(0, player.vx - friction * dt);
      } else if (player.vx < 0) {
        player.vx = Math.min(0, player.vx + friction * dt);
      }
    }

    // Gravity
    player.vy = Math.min(PHYSICS_CONFIG.MAX_FALL_SPEED, player.vy + PHYSICS_CONFIG.GRAVITY * dt);

    // Jump execution (Coyote time & Buffer)
    const canJump = player.isGrounded || player.coyoteTimer > 0;
    if (player.jumpBufferTimer > 0 && canJump) {
      player.vy = PHYSICS_CONFIG.JUMP_FORCE;
      player.isGrounded = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      sound.playJump();
    }

    // Variable jump height cut
    if (input.jumpReleased && player.vy < PHYSICS_CONFIG.MIN_JUMP_FORCE) {
      player.vy = PHYSICS_CONFIG.MIN_JUMP_FORCE;
    }

    // Moving platform carrier velocity attachment
    let standingOnPlatform: Platform | null = null;

    // Move X and resolve collisions
    player.x += player.vx * dt;
    this.resolveCollisionsX(player, stage);

    // Move Y and resolve collisions
    player.y += player.vy * dt;
    const wasGrounded = player.isGrounded;
    player.isGrounded = false;

    standingOnPlatform = this.resolveCollisionsY(player, stage, dt);

    if (player.isGrounded) {
      if (!wasGrounded) {
        sound.playLand();
      }
      player.coyoteTimer = PHYSICS_CONFIG.COYOTE_TIME;
    }

    // If standing on a moving platform, carry player along
    if (standingOnPlatform && standingOnPlatform.type === 'moving') {
      if (standingOnPlatform.vx) {
        player.x += standingOnPlatform.vx * dt;
      }
      if (standingOnPlatform.vy) {
        player.y += standingOnPlatform.vy * dt;
      }
    }

    // Head bounce on other players (cooperative mechanic)
    const playerRect: Rect = { x: player.x, y: player.y, w: player.width, h: player.height };
    for (const other of otherPlayers) {
      if (other.id !== player.id && other.isAlive) {
        const otherRect: Rect = { x: other.x, y: other.y, w: other.width, h: other.height };
        if (checkAABB(playerRect, otherRect)) {
          // Check if player landed on other player's head
          if (player.vy > 50 && player.y + player.height - player.vy * dt <= other.y + 12) {
            player.y = other.y - player.height;
            player.vy = PHYSICS_CONFIG.HEAD_BOUNCE_FORCE;
            player.coyoteTimer = PHYSICS_CONFIG.COYOTE_TIME;
            sound.playHeadBounce();
          }
        }
      }
    }

    // Springs
    for (const spring of stage.springs) {
      if (checkAABB(playerRect, spring)) {
        if (player.vy > 0 && player.y + player.height <= spring.y + 20) {
          player.y = spring.y - player.height;
          player.vy = spring.power;
          spring.bounceAnim = 1.0;
          sound.playSpring();
        }
      }
    }

    // Pressure plates
    for (const plate of stage.pressurePlates) {
      const plateDetectRect: Rect = {
        x: plate.x,
        y: plate.y - 4,
        w: plate.w,
        h: plate.h + 8,
      };

      // Check if this player or any other player is standing on this plate
      const isPlayerOnPlate = checkAABB(playerRect, plateDetectRect);
      const isOtherOnPlate = otherPlayers.some(
        o => o.isAlive && checkAABB({ x: o.x, y: o.y, w: o.width, h: o.height }, plateDetectRect)
      );

      const currentlyPressed = isPlayerOnPlate || isOtherOnPlate;
      if (currentlyPressed !== plate.isPressed) {
        plate.isPressed = currentlyPressed;
        sound.playButton(currentlyPressed);
        onPuzzleTrigger(plate.id, currentlyPressed);
      }
    }

    // Checkpoints
    for (const cp of stage.checkpoints) {
      if (!cp.isReached && checkAABB(playerRect, cp)) {
        cp.isReached = true;
        sound.playCheckpoint();
        onCheckpoint(cp.index);
      }
    }

    // Collectible Coins
    if (stage.coins && stage.coins.length > 0) {
      for (const coin of stage.coins) {
        if (!coin.isCollected) {
          const coinRect: Rect = { x: coin.x, y: coin.y, w: 24, h: 24 };
          if (checkAABB(playerRect, coinRect)) {
            coin.isCollected = true;
            sound.playCoin();
            if (onCoinCollected) {
              onCoinCollected(coin.id);
            }
          }
        }
      }
    }

    // Hazards (spikes, lava, active lasers)
    if (!player.invulnerableTimer || player.invulnerableTimer <= 0) {
      for (const hz of stage.hazards) {
        if (hz.isActive && checkAABB(playerRect, hz)) {
          this.killPlayer(player);
          return;
        }
      }
    }

    // World bounds fall out check
    if (player.y > stage.height + 100) {
      this.killPlayer(player);
      return;
    }

    // Stage Goal Portal
    if (checkAABB(playerRect, stage.portal)) {
      if (!stage.portal.playersInside.includes(player.id)) {
        stage.portal.playersInside.push(player.id);
      }
      player.atGoal = true;

      // Check if all players (both players) are alive and inside the portal!
      const allPlayers = [player, ...otherPlayers];
      const allAtGoal = allPlayers.length > 0 && allPlayers.every(p => p.isAlive && stage.portal.playersInside.includes(p.id));

      if (allAtGoal && !(stage.portal as any).hasTriggeredVictory) {
        (stage.portal as any).hasTriggeredVictory = true;
        sound.playVictory();
        onStageComplete();
      }
    } else {
      player.atGoal = false;
      const idx = stage.portal.playersInside.indexOf(player.id);
      if (idx !== -1) {
        stage.portal.playersInside.splice(idx, 1);
      }
    }

    // Update animation state
    this.updateAnimation(player, dt);
  }

  public updateMovingPlatforms(stage: Stage, dt: number, players: PlayerState[] = []) {
    for (const p of stage.platforms) {
      if (p.type === 'moving') {
        // If it requires a trigger and trigger is not pressed, don't move
        if (p.requiresTrigger) {
          const linkedPlate = stage.pressurePlates.find(pl => pl.id === p.requiresTrigger);
          if (!linkedPlate || !linkedPlate.isPressed) {
            continue;
          }
        }

        if (p.minX !== undefined && p.maxX !== undefined && p.vx !== undefined) {
          p.x += p.vx * dt;
          if (p.x <= p.minX) {
            p.x = p.minX;
            p.vx = Math.abs(p.vx);
          } else if (p.x >= p.maxX) {
            p.x = p.maxX;
            p.vx = -Math.abs(p.vx);
          }
        }

        if (p.minY !== undefined && p.maxY !== undefined && p.vy !== undefined) {
          p.y += p.vy * dt;
          if (p.y <= p.minY) {
            p.y = p.minY;
            p.vy = Math.abs(p.vy);
          } else if (p.y >= p.maxY) {
            p.y = p.maxY;
            p.vy = -Math.abs(p.vy);
          }
        }
      }
    }

    // Update doors with delay and doorway safety sensor
    for (const door of stage.doors) {
      if (door.isUnlockedPermanently) {
        door.isOpen = true;
      } else {
        // Support multiple linked triggers (e.g. Stage 1: plate_1 or plate_2)
        const triggerIds = door.requiredTriggerIds && door.requiredTriggerIds.length > 0
          ? door.requiredTriggerIds
          : [door.requiredTriggerId];

        let shouldOpen = false;

        for (const trigId of triggerIds) {
          const plate = stage.pressurePlates.find(pl => pl.id === trigId);
          if (plate) {
            if (plate.isDualRequired) {
              const duals = stage.pressurePlates.filter(pl => pl.linkedDoorId === door.id && pl.isDualRequired);
              if (duals.length > 0 && duals.every(pl => pl.isPressed)) {
                shouldOpen = true;
                break;
              }
            } else if (plate.isPressed) {
              shouldOpen = true;
              break;
            }
          }
        }

        // Safety sensor: check if any player is currently in the doorway
        const isPlayerInDoorway = players.some(p =>
          p.isAlive &&
          p.x + p.width > door.x - 8 &&
          p.x < door.x + door.w + 8 &&
          p.y + p.height > door.y &&
          p.y < door.y + door.h + 20
        );
        door.isDoorwayOccupied = isPlayerInDoorway;

        if (shouldOpen) {
          if (!door.isOpen) {
            sound.playDoor();
          }
          door.isOpen = true;
          door.closeDelayTimer = door.maxCloseDelay ?? 3.5;
        } else if (isPlayerInDoorway) {
          // Keep open while someone is crossing through!
          door.isOpen = true;
          door.closeDelayTimer = Math.max(door.closeDelayTimer || 0, 1.5);
        } else {
          // Delay countdown before closing
          if (door.closeDelayTimer !== undefined && door.closeDelayTimer > 0) {
            door.closeDelayTimer -= dt;
            if (door.closeDelayTimer <= 0) {
              door.isOpen = false;
            }
          } else {
            door.isOpen = false;
          }
        }
      }

      // Smooth slide open and close
      const targetOffset = door.isOpen ? door.openHeight : 0;
      const speed = (door.isOpen ? 280 : 180) * dt;
      if (door.currentOffset < targetOffset) {
        door.currentOffset = Math.min(targetOffset, door.currentOffset + speed);
      } else if (door.currentOffset > targetOffset) {
        door.currentOffset = Math.max(targetOffset, door.currentOffset - speed);
      }
    }

    // Update hazards (e.g. toggleable lasers)
    for (const hz of stage.hazards) {
      if (hz.toggleTriggerId) {
        const plate = stage.pressurePlates.find(pl => pl.id === hz.toggleTriggerId);
        hz.isActive = !(plate && plate.isPressed);
      }
    }

    // Spring pad bounce animation decay
    for (const sp of stage.springs) {
      if (sp.bounceAnim > 0) {
        sp.bounceAnim = Math.max(0, sp.bounceAnim - dt * 4);
      }
    }
  }

  private resolveCollisionsX(player: PlayerState, stage: Stage) {
    const playerRect: Rect = { x: player.x, y: player.y, w: player.width, h: player.height };

    // Solid platforms
    for (const p of stage.platforms) {
      if (checkAABB(playerRect, p)) {
        if (player.vx > 0) {
          player.x = p.x - player.width;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = p.x + p.w;
          player.vx = 0;
        }
        playerRect.x = player.x;
      }
    }

    // Solid doors (taking into account slide open height)
    for (const d of stage.doors) {
      const activeDoorH = d.h - d.currentOffset;
      if (activeDoorH > 4) {
        const doorRect: Rect = { x: d.x, y: d.y, w: d.w, h: activeDoorH };
        if (checkAABB(playerRect, doorRect)) {
          if (player.vx > 0) {
            player.x = d.x - player.width;
            player.vx = 0;
          } else if (player.vx < 0) {
            player.x = d.x + d.w;
            player.vx = 0;
          } else {
            const playerCenterX = player.x + player.width / 2;
            const doorCenterX = d.x + d.w / 2;
            if (playerCenterX < doorCenterX) {
              player.x = d.x - player.width - 1;
            } else {
              player.x = d.x + d.w + 1;
            }
          }
          playerRect.x = player.x;
        }
      }
    }

    // World left bound
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }
  }

  private resolveCollisionsY(player: PlayerState, stage: Stage, dt: number): Platform | null {
    const playerRect: Rect = { x: player.x, y: player.y, w: player.width, h: player.height };
    let standingOn: Platform | null = null;

    // Solid platforms
    for (const p of stage.platforms) {
      if (checkAABB(playerRect, p)) {
        if (player.vy > 0) {
          player.y = p.y - player.height;
          player.vy = 0;
          player.isGrounded = true;
          standingOn = p;
        } else if (player.vy < 0) {
          player.y = p.y + p.h;
          player.vy = 0;
        }
        playerRect.y = player.y;
      }
    }

    // Solid doors with anti-crush
    for (const d of stage.doors) {
      const activeDoorH = d.h - d.currentOffset;
      if (activeDoorH > 4) {
        const doorRect: Rect = { x: d.x, y: d.y, w: d.w, h: activeDoorH };
        if (checkAABB(playerRect, doorRect)) {
          const wasAbove = player.y + player.height - player.vy * dt <= d.y + 4;
          if (player.vy > 0 && wasAbove) {
            player.y = d.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          } else {
            // Player is inside doorway: push horizontally to safety, NEVER squish vertically!
            const playerCenterX = player.x + player.width / 2;
            const doorCenterX = d.x + d.w / 2;
            if (playerCenterX < doorCenterX) {
              player.x = d.x - player.width - 2;
            } else {
              player.x = d.x + d.w + 2;
            }
            player.vx = 0;
            playerRect.x = player.x;
          }
          playerRect.y = player.y;
        }
      }
    }

    return standingOn;
  }

  private killPlayer(player: PlayerState) {
    player.isAlive = false;
    player.respawnTimer = 0.8;
    player.anim = 'defeat';
    player.deathX = player.x;
    player.deathY = player.y;
    sound.playDefeat();
  }

  public respawnPlayer(player: PlayerState, stage: Stage) {
    player.isAlive = true;
    player.vx = 0;
    player.vy = 0;
    player.invulnerableTimer = 2.0;

    // Find latest reached checkpoint or start spawn
    const reachedCps = stage.checkpoints.filter(cp => cp.isReached);
    if (reachedCps.length > 0) {
      const latestCp = reachedCps[reachedCps.length - 1];
      player.x = latestCp.spawnX;
      player.y = latestCp.spawnY;
    } else {
      const isSecondPlayer = player.id.includes('p2') || player.id === 'buddy_ai';
      const spawn = isSecondPlayer ? stage.spawnPointP2 : stage.spawnPointP1;
      player.x = spawn.x;
      player.y = spawn.y;
    }

    player.anim = 'idle';
  }

  private updateAnimation(player: PlayerState, dt: number) {
    player.animTimer += dt;

    if (player.activeEmote) {
      player.emoteTimer = (player.emoteTimer || 0) - dt;
      if (player.emoteTimer <= 0) {
        player.activeEmote = undefined;
      }
    }

    if (player.atGoal) {
      player.anim = 'cheer';
      return;
    }

    if (!player.isGrounded) {
      if (player.vy < -80) {
        player.anim = 'jump';
      } else {
        player.anim = 'fall';
      }
    } else {
      if (Math.abs(player.vx) > 20) {
        player.anim = 'run';
      } else {
        player.anim = 'idle';
      }
    }
  }
}
