import {
  PlayerState,
  Stage,
  Rect,
  Platform,
  PressurePlate,
  InteractiveDoor,
  SpringPad,
  Hazard,
  Checkpoint,
  StageCoin,
} from '../types/game';
import { renderHatOnContext } from './hatRenderer';

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zoom: number;
  viewportW: number;
  viewportH: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'star';
}

export class GameRenderer {
  private particles: Particle[] = [];
  public camera: Camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    zoom: 1,
    viewportW: 800,
    viewportH: 600,
  };

  public resize(width: number, height: number) {
    this.camera.viewportW = width;
    this.camera.viewportH = height;
  }

  public updateCamera(players: PlayerState[], stage: Stage, dt: number) {
    const active = players.filter(p => p.isAlive);
    if (active.length === 0) return;

    let minX = active[0].x;
    let maxX = active[0].x;
    let minY = active[0].y;
    let maxY = active[0].y;

    for (const p of active) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const centerX = (minX + maxX) / 2 + 20;
    const centerY = (minY + maxY) / 2 + 20;

    // Smooth camera damping
    const k = 7.0;
    const factor = 1 - Math.exp(-k * dt);

    this.camera.targetX = centerX;
    this.camera.targetY = centerY;

    this.camera.x += (this.camera.targetX - this.camera.x) * factor;
    this.camera.y += (this.camera.targetY - this.camera.y) * factor;

    // Adaptive camera zoom based on device screen size and orientation (Portrait "em pé" / Landscape "deitado" / PC)
    const isPortrait = this.camera.viewportW < this.camera.viewportH;
    if (isPortrait) {
      // In portrait orientation ("em pé"), ensure sufficient horizontal puzzle view (~640px)
      const targetWidth = 640;
      const portraitZoom = this.camera.viewportW / targetWidth;
      this.camera.zoom = Math.max(0.55, Math.min(1.0, portraitZoom));
    } else {
      // Landscape orientation ("deitado") & Desktop / Tablet monitors
      const currentMin = Math.min(this.camera.viewportW, this.camera.viewportH);
      this.camera.zoom = Math.max(0.72, Math.min(1.2, currentMin / 540));
    }

    // Clamp camera within stage bounds accounting for zoom
    const effectiveW = this.camera.viewportW / this.camera.zoom;
    const effectiveH = this.camera.viewportH / this.camera.zoom;
    const halfW = effectiveW / 2;
    const halfH = effectiveH / 2;

    if (stage.width > effectiveW) {
      this.camera.x = Math.max(halfW, Math.min(stage.width - halfW, this.camera.x));
    } else {
      this.camera.x = stage.width / 2;
    }

    if (stage.height > effectiveH) {
      this.camera.y = Math.max(halfH, Math.min(stage.height - halfH, this.camera.y));
    } else {
      this.camera.y = stage.height / 2;
    }
  }

  public addDust(x: number, y: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 40 - 10,
        size: Math.random() * 4 + 2,
        color: 'rgba(255, 255, 255, 0.4)',
        alpha: 0.6,
        life: 0.35,
        maxLife: 0.35,
        shape: 'circle',
      });
    }
  }

  public addConfetti(x: number, y: number, count: number = 25) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 360,
        vy: -Math.random() * 400 - 150,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1.4,
        maxLife: 1.4,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    stage: Stage,
    players: PlayerState[],
    dt: number
  ) {
    const { viewportW, viewportH, x: camX, y: camY } = this.camera;

    // 1. Clear & Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, viewportH);
    bgGrad.addColorStop(0, stage.theme.bgGradient[0]);
    bgGrad.addColorStop(1, stage.theme.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, viewportW, viewportH);

    // 2. Parallax Distant Mountains & Clouds
    this.renderParallax(ctx, stage, camX, camY);

    // Save context for World Transformation with adaptive zoom for PC, tablet and mobile
    ctx.save();
    ctx.translate(viewportW / 2, viewportH / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-camX, -camY);

    // 3. Render connection conduits between pressure plates and doors
    this.renderWiring(ctx, stage);

    // 4. Render Platforms
    for (const p of stage.platforms) {
      this.renderPlatform(ctx, p, stage);
    }

    // 5. Render Pressure Plates
    for (const plate of stage.pressurePlates) {
      this.renderPressurePlate(ctx, plate);
    }

    // 6. Render Doors
    for (const door of stage.doors) {
      this.renderDoor(ctx, door);
    }

    // 7. Render Springs
    for (const sp of stage.springs) {
      this.renderSpring(ctx, sp);
    }

    // 8. Render Hazards
    for (const hz of stage.hazards) {
      this.renderHazard(ctx, hz);
    }

    // 9. Render Checkpoints
    for (const cp of stage.checkpoints) {
      this.renderCheckpoint(ctx, cp);
    }

    // 9.5 Render Collectible Coins
    if (stage.coins) {
      for (const coin of stage.coins) {
        if (!coin.isCollected) {
          this.renderCoin(ctx, coin);
        }
      }
    }

    // 10. Render Goal Portal
    this.renderPortal(ctx, stage.portal, players);

    // 11. Render Players
    for (const p of players) {
      if (p.isAlive) {
        this.renderCharacter(ctx, p);
      } else {
        this.renderDefeatGhost(ctx, p);
      }
    }

    // 12. Update and render particles
    this.renderParticles(ctx, dt);

    ctx.restore();
  }

  private renderParallax(ctx: CanvasRenderingContext2D, stage: Stage, camX: number, camY: number) {
    const { viewportW, viewportH } = this.camera;

    // Distant soft clouds layer (0.2 parallax factor)
    ctx.fillStyle = stage.theme.cloudColor;
    const cloudOffsetX = -(camX * 0.15) % 400;
    for (let i = -1; i < viewportW / 200 + 2; i++) {
      const cx = i * 260 + cloudOffsetX;
      const cy = 60 + Math.sin(i * 1.5) * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.arc(cx + 40, cy - 10, 55, 0, Math.PI * 2);
      ctx.arc(cx + 80, cy, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountain silhouettes (0.35 parallax factor)
    ctx.fillStyle = stage.theme.mountainColor;
    const mtnOffsetX = -(camX * 0.25) % 600;
    ctx.beginPath();
    ctx.moveTo(0, viewportH);
    for (let i = -1; i < viewportW / 250 + 3; i++) {
      const mx = i * 280 + mtnOffsetX;
      const my = viewportH - 120 - Math.sin(i * 2.2) * 60;
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + 140, viewportH - 80);
    }
    ctx.lineTo(viewportW, viewportH);
    ctx.closePath();
    ctx.fill();
  }

  private renderWiring(ctx: CanvasRenderingContext2D, stage: Stage) {
    const now = Date.now() / 400;
    for (const plate of stage.pressurePlates) {
      let targetRect: Rect | null = null;
      if (plate.linkedDoorId) {
        const door = stage.doors.find(d => d.id === plate.linkedDoorId);
        if (door) targetRect = door;
      }

      if (targetRect) {
        const startX = plate.x + plate.w / 2;
        const startY = plate.y + plate.h;
        const endX = targetRect.x + targetRect.w / 2;
        const endY = targetRect.y + targetRect.h;

        ctx.save();
        ctx.strokeStyle = plate.isPressed ? plate.color : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = plate.isPressed ? 3 : 2;
        ctx.setLineDash(plate.isPressed ? [8, 4] : [4, 4]);
        ctx.lineDashOffset = plate.isPressed ? -now * 15 : 0;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Orthogonal conduit line
        const midY = Math.max(startY, endY) + 20;
        ctx.lineTo(startX, midY);
        ctx.lineTo(endX, midY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (plate.isPressed) {
          ctx.shadowColor = plate.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  private renderPlatform(ctx: CanvasRenderingContext2D, p: Platform, stage: Stage) {
    ctx.save();

    // Base body
    ctx.fillStyle = stage.theme.tileColor;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 6);
    ctx.fill();

    // Top surface trim
    ctx.fillStyle = stage.theme.tileAccent;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, Math.min(12, p.h), [6, 6, 0, 0]);
    ctx.fill();

    // Inner mechanical details for moving platforms
    if (p.type === 'moving') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;

      // Track line indicator
      if (p.minX !== undefined && p.maxX !== undefined) {
        ctx.beginPath();
        ctx.moveTo(p.minX, p.y + p.h / 2);
        ctx.lineTo(p.maxX + p.w, p.y + p.h / 2);
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Arrow indicator on platform
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.lineTo(cx + 5, cy - 4);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 5, cy + 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderPressurePlate(ctx: CanvasRenderingContext2D, plate: PressurePlate) {
    ctx.save();
    const sinkOffset = plate.isPressed ? 6 : 0;
    const h = Math.max(4, plate.h - sinkOffset);
    const y = plate.y + sinkOffset;

    // Base bracket
    ctx.fillStyle = '#334155';
    ctx.fillRect(plate.x - 4, plate.y + plate.h - 4, plate.w + 8, 6);

    // Active button cap
    ctx.fillStyle = plate.color;
    ctx.beginPath();
    ctx.roundRect(plate.x, y, plate.w, h, [4, 4, 1, 1]);
    ctx.fill();

    if (plate.isPressed) {
      ctx.shadowColor = plate.color;
      ctx.shadowBlur = 12;
      ctx.fill();
    }

    // Label / Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(plate.label || '▼', plate.x + plate.w / 2, plate.y - 8);

    ctx.restore();
  }

  private renderDoor(ctx: CanvasRenderingContext2D, door: InteractiveDoor) {
    ctx.save();
    const visibleH = door.h - door.currentOffset;

    if (visibleH > 2) {
      // Door frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(door.x - 4, door.y, door.w + 8, door.h);

      // Sliding door slab
      ctx.fillStyle = door.color;
      ctx.beginPath();
      ctx.roundRect(door.x, door.y, door.w, visibleH, 4);
      ctx.fill();

      // Industrial hazard stripes on door
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 4;
      for (let y = door.y + 10; y < door.y + visibleH - 10; y += 18) {
        ctx.beginPath();
        ctx.moveTo(door.x + 4, y);
        ctx.lineTo(door.x + door.w - 4, y + 8);
        ctx.stroke();
      }

      // Lock indicator glow
      ctx.fillStyle = door.isOpen ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(door.x + door.w / 2, door.y + visibleH / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Doorway Safety or Countdown Timer Badge
    if (door.isOpen) {
      if (door.isDoorwayOccupied) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(door.x - 12, door.y - 24, door.w + 24, 18, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PASSO LIVRE', door.x + door.w / 2, door.y - 11);
      } else if (door.closeDelayTimer !== undefined && door.closeDelayTimer > 0 && door.closeDelayTimer < (door.maxCloseDelay || 3.5)) {
        const remainingSec = Math.max(0.1, door.closeDelayTimer).toFixed(1);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(door.x - 10, door.y - 24, door.w + 20, 18, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⏱️ ${remainingSec}s`, door.x + door.w / 2, door.y - 11);
      }
    }

    ctx.restore();
  }

  private renderSpring(ctx: CanvasRenderingContext2D, sp: SpringPad) {
    ctx.save();
    const compress = sp.bounceAnim * 8;

    // Base
    ctx.fillStyle = '#475569';
    ctx.fillRect(sp.x, sp.y + sp.h - 4, sp.w, 4);

    // Spring coils
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const startY = sp.y + sp.h - 4;
    const endY = sp.y + compress;
    const midY = (startY + endY) / 2;
    ctx.moveTo(sp.x + 8, startY);
    ctx.lineTo(sp.x + sp.w - 8, midY);
    ctx.lineTo(sp.x + 8, endY + 4);
    ctx.stroke();

    // Top launch pad
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(sp.x + 2, sp.y + compress, sp.w - 4, 6, 3);
    ctx.fill();

    ctx.restore();
  }

  private renderHazard(ctx: CanvasRenderingContext2D, hz: Hazard) {
    ctx.save();

    if (hz.type === 'spikes') {
      ctx.fillStyle = '#ef4444';
      const spikeW = 12;
      const count = Math.floor(hz.w / spikeW);
      for (let i = 0; i < count; i++) {
        const sx = hz.x + i * spikeW;
        ctx.beginPath();
        ctx.moveTo(sx, hz.y + hz.h);
        ctx.lineTo(sx + spikeW / 2, hz.y);
        ctx.lineTo(sx + spikeW, hz.y + hz.h);
        ctx.closePath();
        ctx.fill();
      }
    } else if (hz.type === 'lava') {
      const time = Date.now() / 300;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);

      // Animated magma surface wave
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(hz.x, hz.y);
      for (let x = hz.x; x <= hz.x + hz.w; x += 10) {
        const y = hz.y + Math.sin(x * 0.05 + time) * 4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(hz.x + hz.w, hz.y + 12);
      ctx.lineTo(hz.x, hz.y + 12);
      ctx.closePath();
      ctx.fill();
    } else if (hz.type === 'laser') {
      if (hz.isActive) {
        const time = Date.now() / 150;
        const beamPulse = Math.sin(time) * 3 + hz.w;

        // Laser glow
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fillRect(hz.x - (beamPulse - hz.w) / 2, hz.y, beamPulse, hz.h);

        // Core laser beam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hz.x + hz.w / 2 - 2, hz.y, 4, hz.h);
      } else {
        // Inactive laser emitter hints
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(hz.x + hz.w / 2 - 1, hz.y, 2, hz.h);
      }
    }

    ctx.restore();
  }

  private renderCheckpoint(ctx: CanvasRenderingContext2D, cp: Checkpoint) {
    ctx.save();

    // Flag pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cp.x + 4, cp.y, 4, cp.h);

    // Flag banner
    const time = Date.now() / 250;
    const wave = Math.sin(time) * 4;
    ctx.fillStyle = cp.isReached ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cp.x + 8, cp.y + 4);
    ctx.lineTo(cp.x + 36 + wave, cp.y + 16);
    ctx.lineTo(cp.x + 8, cp.y + 28);
    ctx.closePath();
    ctx.fill();

    if (cp.isReached) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCoin(ctx: CanvasRenderingContext2D, coin: StageCoin) {
    ctx.save();
    const time = Date.now() / 240 + coin.x * 0.02;
    const cx = coin.x + 12;
    const cy = coin.y + 12 + Math.sin(time * 2) * 3;
    const spinWidth = Math.max(2, Math.abs(Math.cos(time) * 11));

    // Outer golden glow
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;

    // Coin outer rim
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(cx, cy, spinWidth + 1.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coin face
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(cx, cy, spinWidth, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center star / diamond sparkle reflection
    if (spinWidth > 5) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, spinWidth * 0.45, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Coin symbol
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 9px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', cx, cy);
    }

    ctx.restore();
  }

  private renderPortal(ctx: CanvasRenderingContext2D, portal: Rect, players: PlayerState[]) {
    ctx.save();
    const time = Date.now() / 400;
    const cx = portal.x + portal.w / 2;
    const cy = portal.y + portal.h / 2;

    // Glowing outer aura
    const auraGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 60);
    auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    // Spinning dimensional rings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 48, time, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#c084fc';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 44, -time * 1.2, 0, Math.PI * 2);
    ctx.stroke();

    // Active status sign
    const activeCount = players.filter(p => p.isAlive).length;
    const insideCount = players.filter(p => p.isAlive && p.atGoal).length;
    const isReady = insideCount >= activeCount && activeCount > 0;

    ctx.fillStyle = isReady ? '#10b981' : '#ffffff';
    ctx.font = 'bold 12px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isReady ? '★ JUNTOS! ★' : `SAÍDA (${insideCount}/${activeCount})`,
      cx,
      portal.y - 14
    );

    ctx.restore();
  }

  private renderCharacter(ctx: CanvasRenderingContext2D, p: PlayerState) {
    ctx.save();

    // Gentle blinking effect when player has temporary invulnerability upon respawn
    if (p.invulnerableTimer && p.invulnerableTimer > 0) {
      ctx.globalAlpha = Math.sin(Date.now() / 60) > 0 ? 0.35 : 0.95;
    }

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    ctx.translate(cx, cy);
    ctx.scale(p.facing, 1);

    // Animation deformations
    let bobY = 0;
    let tiltAngle = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (p.anim === 'idle') {
      bobY = Math.sin(p.animTimer * 4) * 2;
    } else if (p.anim === 'run') {
      bobY = Math.abs(Math.sin(p.animTimer * 12)) * 3;
      tiltAngle = 0.12;
    } else if (p.anim === 'jump') {
      scaleX = 0.88;
      scaleY = 1.15;
    } else if (p.anim === 'fall') {
      scaleX = 1.05;
      scaleY = 0.95;
    } else if (p.anim === 'cheer') {
      bobY = -Math.abs(Math.sin(p.animTimer * 10)) * 12;
    }

    ctx.rotate(tiltAngle);
    ctx.scale(scaleX, scaleY);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, p.height / 2 + 2, p.width / 2 - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    if (p.anim === 'run') {
      const legSwing = Math.sin(p.animTimer * 14) * 8;
      ctx.fillStyle = '#1e293b';
      // Left leg
      ctx.fillRect(-8 + legSwing, p.height / 2 - 10, 6, 12);
      // Right leg
      ctx.fillRect(2 - legSwing, p.height / 2 - 10, 6, 12);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-8, p.height / 2 - 8, 6, 8);
      ctx.fillRect(2, p.height / 2 - 8, 6, 8);
    }

    // Body
    ctx.fillStyle = p.customization.color;
    ctx.beginPath();
    ctx.roundRect(-p.width / 2, -p.height / 2 + bobY, p.width, p.height - 8, 12);
    ctx.fill();

    // Cute belly accent patch
    ctx.fillStyle = p.customization.secondaryColor || 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-p.width / 2 + 5, -p.height / 2 + 12 + bobY, p.width - 10, p.height - 24, 8);
    ctx.fill();

    // Face / Eyes
    const eyeX = 4;
    const eyeY = -p.height / 2 + 14 + bobY;
    const blink = Math.sin(Date.now() / 1500) > 0.96;

    ctx.fillStyle = '#0f172a';
    if (blink) {
      // Blink line
      ctx.fillRect(eyeX - 4, eyeY + 2, 5, 2);
      ctx.fillRect(eyeX + 4, eyeY + 2, 5, 2);
    } else {
      // Round expressive eyes
      ctx.beginPath();
      ctx.arc(eyeX - 3, eyeY, 3, 0, Math.PI * 2);
      ctx.arc(eyeX + 5, eyeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eye white catchlight sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX - 2, eyeY - 1, 1.2, 0, Math.PI * 2);
      ctx.arc(eyeX + 6, eyeY - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheerful smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY + 5, 3.5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(eyeX - 7, eyeY + 4, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX + 9, eyeY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Hat / Accessory
    this.renderHat(ctx, p.customization.hat, -p.height / 2 + bobY, p.width);

    // Emote or name banner
    ctx.restore();

    // Name tag above player
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(p.name, cx, p.y - 12);

    // Thought bubble (Beto IA thinking) or Emote
    if (p.thoughtText) {
      ctx.font = 'bold 11px "Fredoka", sans-serif';
      const textMetrics = ctx.measureText(p.thoughtText);
      const textW = Math.min(260, Math.max(80, textMetrics.width + 22));
      const bubbleH = 26;
      const bubbleX = cx - textW / 2;
      const bubbleY = p.y - 48;

      // Shadow & bubble background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, textW, bubbleH, 10);
      ctx.fill();

      // Border
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8b5cf6';
      ctx.stroke();

      // Thought cloud bubbles tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 2, p.y - 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, p.y - 13, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Thought text
      ctx.fillStyle = '#4c1d95';
      ctx.font = 'bold 10px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.thoughtText, cx, bubbleY + 17);
    } else if (p.activeEmote) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - 18, p.y - 48, 36, 26, 8);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(cx - 4, p.y - 22);
      ctx.lineTo(cx, p.y - 16);
      ctx.lineTo(cx + 4, p.y - 22);
      ctx.fill();

      ctx.font = '16px sans-serif';
      ctx.fillText(p.activeEmote, cx, p.y - 30);
    }

    ctx.restore();
  }

  private renderDefeatGhost(ctx: CanvasRenderingContext2D, p: PlayerState) {
    ctx.save();
    const cx = (p.deathX ?? p.x) + p.width / 2;
    const rise = Math.max(0, 0.8 - p.respawnTimer) * 55;
    const cy = (p.deathY ?? p.y) + p.height / 2 - rise;

    // Translucent floating ghost
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 14, Math.PI, 0, false);
    ctx.lineTo(cx + 14, cy + 12);
    ctx.lineTo(cx + 7, cy + 8);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 7, cy + 8);
    ctx.lineTo(cx - 14, cy + 12);
    ctx.closePath();
    ctx.fill();

    // Cute small angel halo
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 26, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Ghost eyes (dizzy cross)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    // Left eye
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 11);
    ctx.lineTo(cx - 3, cy - 7);
    ctx.moveTo(cx - 3, cy - 11);
    ctx.lineTo(cx - 7, cy - 7);
    // Right eye
    ctx.moveTo(cx + 3, cy - 11);
    ctx.lineTo(cx + 7, cy - 7);
    ctx.moveTo(cx + 7, cy - 11);
    ctx.lineTo(cx + 3, cy - 7);
    ctx.stroke();

    // Floating text tag
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻 Renascendo...', cx, cy - 34);

    ctx.restore();
  }

  private renderHat(ctx: CanvasRenderingContext2D, hat: string, topY: number, bodyW: number) {
    renderHatOnContext(ctx, hat, topY, 1.0);
  }

  private renderParticles(ctx: CanvasRenderingContext2D, dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt; // gravity

      const progress = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = p.alpha * progress;
      ctx.fillStyle = p.color;

      if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
