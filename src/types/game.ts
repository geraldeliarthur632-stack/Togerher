export type AnimationState = 'idle' | 'run' | 'jump' | 'fall' | 'land' | 'cheer' | 'defeat';

export type HatType =
  | 'none'
  | 'beanie'
  | 'crown'
  | 'cap'
  | 'flower'
  | 'headphones'
  | 'wizard'
  | 'astronaut'
  | 'tophat'
  | 'ninja'
  | 'diamond_crown'
  | 'viking'
  | 'pirate'
  | 'halo'
  | 'dino'
  | 'party_hat'
  | 'cat_ears'
  | 'sunglasses'
  | 'sombrero'
  | 'chef'
  | 'samurai'
  | 'cyber_visor'
  | 'dragon_horns'
  | 'royal_crown'
  | 'valkyrie'
  | 'demon_horns'
  | 'kitsune'
  | 'wizard_gold';

export type FaceType = 'happy' | 'determined' | 'cool' | 'cheerful' | 'winking' | 'sparkle';

export interface PlayerCustomization {
  color: string;
  secondaryColor: string;
  hat: HatType;
  face: FaceType;
  name: string;
}

export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  width: number;
  height: number;
  isGrounded: boolean;
  anim: AnimationState;
  animTimer: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  customization: PlayerCustomization;
  isAlive: boolean;
  respawnTimer: number;
  atGoal: boolean;
  activeEmote?: string;
  emoteTimer?: number;
  thoughtText?: string;
  thoughtTimer?: number;
  thoughtGoal?: string;
  invulnerableTimer?: number;
  deathX?: number;
  deathY?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PlatformType = 'solid' | 'one-way' | 'moving' | 'falling' | 'ice';

export interface Platform extends Rect {
  id: string;
  type: PlatformType;
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  speed?: number;
  requiresTrigger?: string;
  fallDelay?: number;
  fallTimer?: number;
  isFalling?: boolean;
  respawnTimer?: number;
}

export interface PressurePlate extends Rect {
  id: string;
  linkedDoorId: string;
  isPressed: boolean;
  isDualRequired?: boolean;
  color: string;
  label?: string;
  releaseDelayTimer?: number;
}

export interface InteractiveDoor extends Rect {
  id: string;
  isOpen: boolean;
  openHeight: number;
  currentOffset: number;
  requiredTriggerId: string;
  requiredTriggerIds?: string[];
  color: string;
  isUnlockedPermanently?: boolean;
  closeDelayTimer?: number;
  maxCloseDelay?: number;
  isDoorwayOccupied?: boolean;
}

export interface SpringPad extends Rect {
  id: string;
  power: number;
  bounceAnim: number;
}

export interface Hazard extends Rect {
  id: string;
  type: 'lava' | 'spikes' | 'laser';
  toggleTriggerId?: string;
  isActive: boolean;
}

export interface Checkpoint extends Rect {
  id: string;
  index: number;
  isReached: boolean;
  spawnX: number;
  spawnY: number;
}

export interface GoalPortal extends Rect {
  id: string;
  isUnlocked: boolean;
  playersInside: string[];
}

export interface StageCoin {
  id: string;
  x: number;
  y: number;
  isCollected: boolean;
}

export interface Stage {
  id: string;
  name: string;
  subtitle: string;
  hint: string;
  width: number;
  height: number;
  spawnPointP1: { x: number; y: number };
  spawnPointP2: { x: number; y: number };
  platforms: Platform[];
  pressurePlates: PressurePlate[];
  doors: InteractiveDoor[];
  springs: SpringPad[];
  hazards: Hazard[];
  checkpoints: Checkpoint[];
  coins?: StageCoin[];
  portal: GoalPortal;
  theme: {
    bgGradient: [string, string];
    cloudColor: string;
    mountainColor: string;
    tileColor: string;
    tileAccent: string;
    decorTheme: 'grassland' | 'sunset_canyon' | 'neon_sky' | 'crystal_cavern' | 'celestial';
  };
}

export interface TouchElementLayout {
  x: number; // percentage (0 to 100) or pixel coordinate
  y: number; // percentage (0 to 100) or pixel coordinate
  scale: number; // 0.6 to 1.8
}

export interface CustomTouchControlsLayout {
  dpad: TouchElementLayout;
  jump: TouchElementLayout;
  buddy: TouchElementLayout;
  emote: TouchElementLayout;
  opacity: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showTouchControls: boolean;
  touchControlsScale: number;
  touchControlsOpacity: number;
  haptics: boolean;
  graphicsQuality: 'high' | 'medium';
  botCompanion: boolean;
  screenOrientation?: 'auto' | 'landscape' | 'portrait';
  customTouchLayout?: CustomTouchControlsLayout;
}

export interface FriendEntry {
  uid: string;
  name: string;
  friendCode: string;
  color: string;
  hat: HatType;
  isOnline: boolean;
  lastSeen?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  stagesCompleted: number;
  unlockedLevels: number; // 1 to 2000
  coins: number; // Moedas ganhas a cada partida vencida (+1) e moedas coletadas
  level: number; // Nível da conta (começa no Nível 1)
  xp: number; // XP acumulado no nível atual
  totalXp?: number; // XP total acumulado na conta
  isGuest?: boolean; // Usuário jogando como convidado
  unlockedSkins: string[]; // List of bought skin IDs & hat IDs
  friendCode: string; // Unique friend code like TOG-XXXX
  friends: FriendEntry[];
  totalJumps: number;
  highFives: number;
  createdAt: number;
  customization: PlayerCustomization;
  settings: GameSettings;
}

/**
 * Retorna o XP necessário para passar do nível atual para o próximo nível.
 * Nível 1 -> 2: 15 XP
 * Nível 2 -> 3: 30 XP (dobra a cada nível)
 * Nível 3 -> 4: 60 XP
 * Nível 4 -> 5: 120 XP
 * Fórmula: 15 * 2^(level - 1)
 */
export function getXpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return 15 * Math.pow(2, safeLevel - 1);
}

/**
 * Calcula o ganho de XP ao vencer um nível:
 * - Ganha 2 a 5 XP base
 * - Bônus proporcional a quantas pessoas estão jogando juntas (mais pessoas = mais XP!)
 */
export function calculateStageWonXp(playerCount: number = 1): {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
} {
  const baseXp = Math.floor(Math.random() * 4) + 2; // 2, 3, 4 ou 5 XP
  const companions = Math.max(0, playerCount - 1);
  const bonusXp = companions * 3; // +3 XP por cada amigo/companheiro na sala
  return {
    baseXp,
    bonusXp,
    totalXp: baseXp + bonusXp,
  };
}

export type GameMode = 'solo_bot' | 'local_2p' | 'online_multiplayer';
