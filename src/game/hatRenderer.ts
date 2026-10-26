import { HatType } from '../types/game';

/**
 * Universal high-fidelity 2D Hat & Accessory Renderer
 * Used consistently across GameCanvas, HomeLobby, CustomizerModal, and ShopModal
 */
export function renderHatOnContext(
  ctx: CanvasRenderingContext2D,
  hat: HatType | string,
  topY: number,
  scale: number = 1.0
) {
  if (!hat || hat === 'none') return;

  ctx.save();
  ctx.scale(scale, scale);

  switch (hat) {
    case 'crown': {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-12, topY + 2);
      ctx.lineTo(-12, topY - 12);
      ctx.lineTo(-6, topY - 6);
      ctx.lineTo(0, topY - 15);
      ctx.lineTo(6, topY - 6);
      ctx.lineTo(12, topY - 12);
      ctx.lineTo(12, topY + 2);
      ctx.closePath();
      ctx.fill();

      // Ruby jewel in center
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, topY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'diamond_crown': {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-12, topY + 2);
      ctx.lineTo(-12, topY - 13);
      ctx.lineTo(-6, topY - 6);
      ctx.lineTo(0, topY - 16);
      ctx.lineTo(6, topY - 6);
      ctx.lineTo(12, topY - 13);
      ctx.lineTo(12, topY + 2);
      ctx.closePath();
      ctx.fill();

      // Diamond sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, topY - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cap': {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, topY + 3, 15, Math.PI, 0);
      ctx.fill();
      // Visor
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(2, topY + 1, 16, 4);
      break;
    }

    case 'beanie': {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, topY + 4, 15, Math.PI, 0);
      ctx.fill();
      // Fluffy pompom
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, topY - 12, 5, 0, Math.PI * 2);
      ctx.fill();
      // Fold
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-15, topY + 1, 30, 4);
      break;
    }

    case 'flower': {
      ctx.fillStyle = '#ec4899';
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 6 + 8, topY - 4 + Math.sin(ang) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(8, topY - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'headphones': {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, topY + 8, 18, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(-20, topY + 3, 6, 13);
      ctx.fillRect(14, topY + 3, 6, 13);
      break;
    }

    case 'wizard': {
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(-16, topY + 3);
      ctx.lineTo(0, topY - 24);
      ctx.lineTo(16, topY + 3);
      ctx.closePath();
      ctx.fill();
      // Gold star on hat
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, topY - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'astronaut': {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, topY - 3, 18, 0, Math.PI * 2);
      ctx.fill();
      // Visor with cyan reflection
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, topY - 3, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(-6, topY - 7, 5, 2);
      break;
    }

    case 'tophat': {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-17, topY + 2, 34, 4);
      ctx.fillRect(-11, topY - 17, 22, 19);
      // Red silk ribbon
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-11, topY - 2, 22, 4);
      break;
    }

    case 'ninja': {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-15, topY - 2, 30, 8);
      // Flowing red headband tails
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(11, topY + 1);
      ctx.lineTo(24, topY - 4);
      ctx.lineTo(20, topY + 7);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // --- NEW EXCLUSIVE SHOP ACCESSORIES ---

    case 'viking': {
      // Iron helmet base
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, topY + 4, 15, Math.PI, 0);
      ctx.fill();
      // Gold brow rim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-16, topY + 1, 32, 4);
      // Left horn
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-12, topY + 2);
      ctx.quadraticCurveTo(-22, topY - 10, -18, topY - 18);
      ctx.quadraticCurveTo(-14, topY - 8, -8, topY - 2);
      ctx.closePath();
      ctx.fill();
      // Right horn
      ctx.beginPath();
      ctx.moveTo(12, topY + 2);
      ctx.quadraticCurveTo(22, topY - 10, 18, topY - 18);
      ctx.quadraticCurveTo(14, topY - 8, 8, topY - 2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'pirate': {
      // Tricorn black hat
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-18, topY + 2);
      ctx.lineTo(-12, topY - 14);
      ctx.lineTo(0, topY - 18);
      ctx.lineTo(12, topY - 14);
      ctx.lineTo(18, topY + 2);
      ctx.closePath();
      ctx.fill();
      // Red bandana edge
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-14, topY + 1, 28, 3);
      // Gold skull dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, topY - 7, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'halo': {
      // Floating glowing golden ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, topY - 12, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }

    case 'dino': {
      // Green dino hood
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, topY + 3, 16, Math.PI, 0);
      ctx.fill();
      // Yellow spikes on top
      ctx.fillStyle = '#facc15';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 7 - 3, topY - 11);
        ctx.lineTo(i * 7, topY - 19);
        ctx.lineTo(i * 7 + 3, topY - 11);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'party_hat': {
      // Colorful party cone
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-10, topY + 3);
      ctx.lineTo(0, topY - 24);
      ctx.lineTo(10, topY + 3);
      ctx.closePath();
      ctx.fill();
      // Yellow stripes
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, topY - 6);
      ctx.lineTo(6, topY - 6);
      ctx.moveTo(-3, topY - 15);
      ctx.lineTo(3, topY - 15);
      ctx.stroke();
      // Pompom
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, topY - 25, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'cat_ears': {
      // Cute cat ears
      ctx.fillStyle = '#f472b6';
      // Left ear
      ctx.beginPath();
      ctx.moveTo(-14, topY + 4);
      ctx.lineTo(-12, topY - 12);
      ctx.lineTo(-4, topY - 2);
      ctx.closePath();
      ctx.fill();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(14, topY + 4);
      ctx.lineTo(12, topY - 12);
      ctx.lineTo(4, topY - 2);
      ctx.closePath();
      ctx.fill();
      // Inner ears
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.moveTo(-12, topY + 1);
      ctx.lineTo(-11, topY - 9);
      ctx.lineTo(-6, topY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(12, topY + 1);
      ctx.lineTo(11, topY - 9);
      ctx.lineTo(6, topY - 2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'sunglasses': {
      // Cool black shades
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-15, topY + 14, 13, 8);
      ctx.fillRect(2, topY + 14, 13, 8);
      ctx.fillRect(-2, topY + 15, 4, 3);
      // Glare reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(-13, topY + 16, 4, 2);
      ctx.fillRect(4, topY + 16, 4, 2);
      break;
    }

    case 'sombrero': {
      // Wide festive sombrero
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, topY + 3, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Cone crown
      ctx.beginPath();
      ctx.moveTo(-9, topY + 2);
      ctx.lineTo(-6, topY - 14);
      ctx.lineTo(6, topY - 14);
      ctx.lineTo(9, topY + 2);
      ctx.closePath();
      ctx.fill();
      // Mexican green & red trim
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-20, topY + 1, 40, 2);
      break;
    }

    case 'chef': {
      // Tall puffy white chef toque
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-11, topY - 2, 22, 6);
      ctx.beginPath();
      ctx.arc(-6, topY - 10, 8, 0, Math.PI * 2);
      ctx.arc(0, topY - 14, 9, 0, Math.PI * 2);
      ctx.arc(6, topY - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'samurai': {
      // Samurai Kabuto helmet
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, topY + 3, 15, Math.PI, 0);
      ctx.fill();
      // Golden crescent moon crest
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, topY - 8, 10, 0.2 * Math.PI, 0.8 * Math.PI, true);
      ctx.arc(0, topY - 5, 8, 0.8 * Math.PI, 0.2 * Math.PI, false);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'cyber_visor': {
      // Futuristic neon cyberpunk visor
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-17, topY + 12, 34, 7);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-17, topY + 12, 34, 7);
      // Neon holographic scan line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, topY + 14, 10, 2);
      ctx.fillRect(4, topY + 14, 6, 2);
      break;
    }

    case 'dragon_horns': {
      // Fiery Dragon Horns
      ctx.fillStyle = '#dc2626';
      // Left horn
      ctx.beginPath();
      ctx.moveTo(-12, topY + 3);
      ctx.quadraticCurveTo(-22, topY - 12, -26, topY - 20);
      ctx.quadraticCurveTo(-14, topY - 14, -6, topY + 1);
      ctx.closePath();
      ctx.fill();
      // Right horn
      ctx.beginPath();
      ctx.moveTo(12, topY + 3);
      ctx.quadraticCurveTo(22, topY - 12, 26, topY - 20);
      ctx.quadraticCurveTo(14, topY - 14, 6, topY + 1);
      ctx.closePath();
      ctx.fill();
      // Fiery glowing tips
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-24, topY - 18, 3, 0, Math.PI * 2);
      ctx.arc(24, topY - 18, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'royal_crown': {
      // Supreme Gold & Gem Royal Crown
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-16, topY + 3);
      ctx.lineTo(-16, topY - 14);
      ctx.lineTo(-9, topY - 7);
      ctx.lineTo(0, topY - 20);
      ctx.lineTo(9, topY - 7);
      ctx.lineTo(16, topY - 14);
      ctx.lineTo(16, topY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Emerald & Rubies
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, topY - 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-10, topY - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(10, topY - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'valkyrie': {
      // Golden Valkyrie Winged Diadem
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-14, topY + 1, 28, 4);
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(-14, topY + 3);
      ctx.lineTo(-24, topY - 10);
      ctx.lineTo(-20, topY - 18);
      ctx.lineTo(-10, topY - 4);
      ctx.closePath();
      ctx.fill();
      // Right Wing
      ctx.beginPath();
      ctx.moveTo(14, topY + 3);
      ctx.lineTo(24, topY - 10);
      ctx.lineTo(20, topY - 18);
      ctx.lineTo(10, topY - 4);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'demon_horns': {
      // Crimson Obsidian Demon Horns
      ctx.fillStyle = '#450a0a';
      // Left Horn
      ctx.beginPath();
      ctx.moveTo(-10, topY + 2);
      ctx.quadraticCurveTo(-18, topY - 6, -20, topY - 18);
      ctx.quadraticCurveTo(-10, topY - 12, -4, topY);
      ctx.closePath();
      ctx.fill();
      // Right Horn
      ctx.beginPath();
      ctx.moveTo(10, topY + 2);
      ctx.quadraticCurveTo(18, topY - 6, 20, topY - 18);
      ctx.quadraticCurveTo(10, topY - 12, 4, topY);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'kitsune': {
      // Mystic Kitsune Fox Mask on forehead
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, topY - 5, 13, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fox Ears
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-11, topY - 7);
      ctx.lineTo(-15, topY - 18);
      ctx.lineTo(-6, topY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(11, topY - 7);
      ctx.lineTo(15, topY - 18);
      ctx.lineTo(6, topY - 12);
      ctx.closePath();
      ctx.fill();
      // Red markings
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-7, topY - 6, 4, 2);
      ctx.fillRect(3, topY - 6, 4, 2);
      break;
    }

    case 'wizard_gold': {
      // Grand Golden Celestial Archmage Hat
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(-17, topY + 3);
      ctx.lineTo(0, topY - 26);
      ctx.lineTo(17, topY + 3);
      ctx.closePath();
      ctx.fill();
      // Glowing star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, topY - 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
