import {
  Stage,
  Platform,
  PressurePlate,
  InteractiveDoor,
  SpringPad,
  Hazard,
  Checkpoint,
  StageCoin,
} from '../types/game';

export const TOTAL_STAGES = 2000;
export const WORLD_1_STAGES = 1000; // Fases 1 a 1000 (Mundo 1: Aventura Cooperativa)
export const WORLD_2_STAGES = 1000; // Fases 1001 a 2000 (Mundo 2: Dimensão Extrema / Modo Pesadelo)

// Handcrafted masterpiece stages for the foundational 10 stages
const SIGNATURE_STAGES: Stage[] = [
  // --- FASE 1: Primeiros Passos (Tutorial de Cooperação) ---
  {
    id: 'stage_1',
    name: 'Fase 1: Primeiros Passos',
    subtitle: 'Aprenda a cooperar com seu parceiro',
    hint: 'Suba na placa azul para abrir a porta para seu amigo atravessar!',
    width: 1440,
    height: 700,
    spawnPointP1: { x: 80, y: 520 },
    spawnPointP2: { x: 140, y: 520 },
    theme: {
      bgGradient: ['#0f172a', '#1e293b'],
      cloudColor: 'rgba(255, 255, 255, 0.08)',
      mountainColor: '#334155',
      tileColor: '#10b981',
      tileAccent: '#059669',
      decorTheme: 'grassland',
    },
    platforms: [
      // Starting ground firmly supporting door 1
      { id: 'f1_p1', type: 'solid', x: 0, y: 580, w: 480, h: 120 },
      // Ledge with button 1
      { id: 'f1_l1', type: 'solid', x: 180, y: 460, w: 140, h: 22 },
      // Wall 1
      { id: 'f1_w1', type: 'solid', x: 420, y: 0, w: 40, h: 460 },
      // Pit platform 2
      { id: 'f1_p2', type: 'solid', x: 580, y: 580, w: 380, h: 120 },
      // Ledge with button 2
      { id: 'f1_l2', type: 'solid', x: 680, y: 460, w: 140, h: 22 },
      // Wall 2
      { id: 'f1_w2', type: 'solid', x: 920, y: 0, w: 40, h: 460 },
      // Final platform with portal
      { id: 'f1_p3', type: 'solid', x: 920, y: 580, w: 520, h: 120 },
    ],
    pressurePlates: [
      {
        id: 'plate_1',
        x: 220,
        y: 448,
        w: 60,
        h: 12,
        linkedDoorId: 'door_1',
        isPressed: false,
        color: '#3b82f6',
        label: '1',
      },
      // Botão de retorno do outro lado da Porta 1
      {
        id: 'plate_1_return',
        x: 600,
        y: 568,
        w: 60,
        h: 12,
        linkedDoorId: 'door_1',
        isPressed: false,
        color: '#3b82f6',
        label: '1B',
      },
      {
        id: 'plate_2',
        x: 720,
        y: 448,
        w: 60,
        h: 12,
        linkedDoorId: 'door_2',
        isPressed: false,
        color: '#ec4899',
        label: '2',
      },
      // Botão de retorno do outro lado da Porta 2
      {
        id: 'plate_2_return',
        x: 980,
        y: 568,
        w: 60,
        h: 12,
        linkedDoorId: 'door_2',
        isPressed: false,
        color: '#ec4899',
        label: '2B',
      },
    ],
    doors: [
      {
        id: 'door_1',
        x: 420,
        y: 460,
        w: 40,
        h: 120,
        isOpen: false,
        openHeight: 120,
        currentOffset: 0,
        requiredTriggerId: 'plate_1',
        requiredTriggerIds: ['plate_1', 'plate_1_return', 'plate_2'],
        color: '#3b82f6',
        maxCloseDelay: 3.5,
      },
      {
        id: 'door_2',
        x: 920,
        y: 460,
        w: 40,
        h: 120,
        isOpen: false,
        openHeight: 120,
        currentOffset: 0,
        requiredTriggerId: 'plate_2',
        requiredTriggerIds: ['plate_2', 'plate_2_return'],
        color: '#ec4899',
        maxCloseDelay: 3.5,
      },
    ],
    springs: [
      { id: 'f1_sp1', x: 350, y: 564, w: 40, h: 16, power: -640, bounceAnim: 0 },
    ],
    hazards: [
      // Spikes placed fairly inside the jump pit
      { id: 'f1_h1', type: 'spikes', x: 480, y: 660, w: 100, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f1_cp1', index: 1, x: 600, y: 510, w: 32, h: 70, isReached: false, spawnX: 620, spawnY: 520 },
    ],
    coins: [
      { id: 'c_f1_1', x: 240, y: 390, isCollected: false },
      { id: 'c_f1_2', x: 530, y: 480, isCollected: false },
      { id: 'c_f1_3', x: 1200, y: 520, isCollected: false },
    ],
    portal: {
      id: 'f1_portal',
      x: 1280,
      y: 470,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 2: Sincronia e Plataformas ---
  {
    id: 'stage_2',
    name: 'Fase 2: Sincronia e Plataformas',
    subtitle: 'Coordene o tempo e use plataformas móveis',
    hint: 'Fique na placa amarela para mover a plataforma até seu parceiro!',
    width: 1700,
    height: 750,
    spawnPointP1: { x: 80, y: 540 },
    spawnPointP2: { x: 130, y: 540 },
    theme: {
      bgGradient: ['#1e1b4b', '#312e81'],
      cloudColor: 'rgba(238, 242, 255, 0.1)',
      mountainColor: '#4338ca',
      tileColor: '#8b5cf6',
      tileAccent: '#6d28d9',
      decorTheme: 'sunset_canyon',
    },
    platforms: [
      { id: 'f2_p1', type: 'solid', x: 0, y: 600, w: 340, h: 150 },
      { id: 'f2_p2', type: 'solid', x: 230, y: 460, w: 110, h: 24 },
      {
        id: 'f2_move1',
        type: 'moving',
        x: 360,
        y: 530,
        w: 120,
        h: 22,
        minX: 360,
        maxX: 640,
        speed: 150,
        vx: 150,
        requiresTrigger: 'plate_f2_1',
      },
      { id: 'f2_p3', type: 'solid', x: 660, y: 600, w: 400, h: 150 },
      { id: 'f2_p4', type: 'solid', x: 740, y: 460, w: 110, h: 22 },
      { id: 'f2_p5', type: 'solid', x: 910, y: 390, w: 110, h: 22 },
      {
        id: 'f2_move2',
        type: 'moving',
        x: 1080,
        y: 450,
        w: 120,
        h: 22,
        minX: 1080,
        maxX: 1320,
        speed: 160,
        vx: 160,
      },
      { id: 'f2_p6', type: 'solid', x: 1340, y: 540, w: 360, h: 210 },
      { id: 'f2_wall_mid', type: 'solid', x: 1030, y: 0, w: 30, h: 420 },
    ],
    pressurePlates: [
      {
        id: 'plate_f2_1',
        x: 255,
        y: 448,
        w: 60,
        h: 12,
        linkedDoorId: '',
        isPressed: false,
        color: '#fbbf24',
        label: 'Mover',
      },
      {
        id: 'plate_f2_door',
        x: 935,
        y: 378,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f2_1',
        isPressed: false,
        color: '#10b981',
        label: 'Porta',
      },
    ],
    doors: [
      {
        id: 'door_f2_1',
        x: 1030,
        y: 420,
        w: 30,
        h: 180,
        isOpen: false,
        openHeight: 180,
        currentOffset: 0,
        requiredTriggerId: 'plate_f2_door',
        color: '#10b981',
      },
    ],
    springs: [
      { id: 'f2_sp1', x: 690, y: 584, w: 40, h: 16, power: -660, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f2_h1', type: 'spikes', x: 340, y: 710, w: 320, h: 40, isActive: true },
      { id: 'f2_h2', type: 'spikes', x: 1060, y: 710, w: 280, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f2_cp1', index: 1, x: 700, y: 530, w: 32, h: 70, isReached: false, spawnX: 720, spawnY: 540 },
    ],
    coins: [
      { id: 'c_f2_1', x: 500, y: 470, isCollected: false },
      { id: 'c_f2_2', x: 960, y: 320, isCollected: false },
      { id: 'c_f2_3', x: 1480, y: 480, isCollected: false },
    ],
    portal: {
      id: 'f2_portal',
      x: 1540,
      y: 430,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 3: O Cânion das Molas ---
  {
    id: 'stage_3',
    name: 'Fase 3: O Cânion das Molas',
    subtitle: 'Saltos de alta precisão e placas duplas',
    hint: 'Ambos os jogadores devem subir nas plataformas superiores e pisar juntos!',
    width: 1900,
    height: 800,
    spawnPointP1: { x: 80, y: 580 },
    spawnPointP2: { x: 140, y: 580 },
    theme: {
      bgGradient: ['#042f2e', '#134e4a'],
      cloudColor: 'rgba(204, 251, 241, 0.08)',
      mountainColor: '#115e59',
      tileColor: '#14b8a6',
      tileAccent: '#0f766e',
      decorTheme: 'grassland',
    },
    platforms: [
      { id: 'f3_p1', type: 'solid', x: 0, y: 640, w: 320, h: 160 },
      { id: 'f3_p2', type: 'solid', x: 390, y: 520, w: 110, h: 24 },
      { id: 'f3_p3', type: 'solid', x: 560, y: 400, w: 110, h: 24 },
      { id: 'f3_p4', type: 'solid', x: 730, y: 280, w: 120, h: 24 },
      { id: 'f3_p_bridge', type: 'solid', x: 910, y: 640, w: 340, h: 160 },
      { id: 'f3_p5', type: 'solid', x: 1030, y: 480, w: 110, h: 24 },
      { id: 'f3_p6', type: 'solid', x: 1200, y: 360, w: 110, h: 24 },
      { id: 'f3_p_end', type: 'solid', x: 1480, y: 580, w: 420, h: 220 },
      { id: 'f3_w1', type: 'solid', x: 1480, y: 0, w: 30, h: 420 },
    ],
    pressurePlates: [
      {
        id: 'plate_f3_1',
        x: 760,
        y: 268,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f3_1',
        isPressed: false,
        isDualRequired: true,
        color: '#f43f5e',
        label: 'A',
      },
      {
        id: 'plate_f3_2',
        x: 1225,
        y: 348,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f3_1',
        isPressed: false,
        isDualRequired: true,
        color: '#3b82f6',
        label: 'B',
      },
    ],
    doors: [
      {
        id: 'door_f3_1',
        x: 1480,
        y: 420,
        w: 30,
        h: 160,
        isOpen: false,
        openHeight: 160,
        currentOffset: 0,
        requiredTriggerId: 'plate_f3_1',
        color: '#a855f7',
      },
    ],
    springs: [
      { id: 'f3_sp1', x: 260, y: 624, w: 40, h: 16, power: -700, bounceAnim: 0 },
      { id: 'f3_sp2', x: 950, y: 624, w: 40, h: 16, power: -720, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f3_h1', type: 'lava', x: 320, y: 760, w: 590, h: 40, isActive: true },
      { id: 'f3_h2', type: 'spikes', x: 1250, y: 760, w: 230, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f3_cp1', index: 1, x: 960, y: 570, w: 32, h: 70, isReached: false, spawnX: 980, spawnY: 580 },
    ],
    coins: [
      { id: 'c_f3_1', x: 440, y: 460, isCollected: false },
      { id: 'c_f3_2', x: 790, y: 210, isCollected: false },
      { id: 'c_f3_3', x: 1660, y: 520, isCollected: false },
    ],
    portal: {
      id: 'f3_portal',
      x: 1740,
      y: 470,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 4: Labirinto dos Botões ---
  {
    id: 'stage_4',
    name: 'Fase 4: Labirinto dos Botões',
    subtitle: 'Múltiplas portas que dependem de revezamento',
    hint: 'Um jogador aciona a placa enquanto o outro avança para abrir a próxima!',
    width: 2100,
    height: 800,
    spawnPointP1: { x: 80, y: 580 },
    spawnPointP2: { x: 140, y: 580 },
    theme: {
      bgGradient: ['#3b0764', '#581c87'],
      cloudColor: 'rgba(250, 232, 255, 0.08)',
      mountainColor: '#6b21a8',
      tileColor: '#c084fc',
      tileAccent: '#a855f7',
      decorTheme: 'neon_sky',
    },
    platforms: [
      { id: 'f4_p1', type: 'solid', x: 0, y: 640, w: 420, h: 160 },
      { id: 'f4_p2', type: 'solid', x: 420, y: 640, w: 460, h: 160 },
      { id: 'f4_p3', type: 'solid', x: 880, y: 640, w: 480, h: 160 },
      { id: 'f4_p4', type: 'solid', x: 1360, y: 640, w: 480, h: 160 },
      { id: 'f4_pend', type: 'solid', x: 1840, y: 640, w: 260, h: 160 },
      { id: 'f4_w1', type: 'solid', x: 380, y: 0, w: 40, h: 500 },
      { id: 'f4_w2', type: 'solid', x: 840, y: 0, w: 40, h: 500 },
      { id: 'f4_w3', type: 'solid', x: 1320, y: 0, w: 40, h: 500 },
      { id: 'f4_w4', type: 'solid', x: 1800, y: 0, w: 40, h: 500 },
      { id: 'f4_ledge1', type: 'solid', x: 480, y: 480, w: 100, h: 22 },
      { id: 'f4_ledge2', type: 'solid', x: 960, y: 480, w: 100, h: 22 },
      { id: 'f4_ledge3', type: 'solid', x: 1440, y: 480, w: 100, h: 22 },
    ],
    pressurePlates: [
      { id: 'plate_f4_1', x: 200, y: 628, w: 60, h: 12, linkedDoorId: 'door_f4_1', isPressed: false, color: '#06b6d4', label: '1' },
      { id: 'plate_f4_2', x: 500, y: 468, w: 60, h: 12, linkedDoorId: 'door_f4_2', isPressed: false, color: '#f59e0b', label: '2' },
      { id: 'plate_f4_3', x: 980, y: 468, w: 60, h: 12, linkedDoorId: 'door_f4_3', isPressed: false, color: '#10b981', label: '3' },
      { id: 'plate_f4_4', x: 1460, y: 468, w: 60, h: 12, linkedDoorId: 'door_f4_4', isPressed: false, color: '#ec4899', label: '4' },
    ],
    doors: [
      { id: 'door_f4_1', x: 380, y: 500, w: 40, h: 140, isOpen: false, openHeight: 140, currentOffset: 0, requiredTriggerId: 'plate_f4_1', color: '#06b6d4' },
      { id: 'door_f4_2', x: 840, y: 500, w: 40, h: 140, isOpen: false, openHeight: 140, currentOffset: 0, requiredTriggerId: 'plate_f4_2', color: '#f59e0b' },
      { id: 'door_f4_3', x: 1320, y: 500, w: 40, h: 140, isOpen: false, openHeight: 140, currentOffset: 0, requiredTriggerId: 'plate_f4_3', color: '#10b981' },
      { id: 'door_f4_4', x: 1800, y: 500, w: 40, h: 140, isOpen: false, openHeight: 140, currentOffset: 0, requiredTriggerId: 'plate_f4_4', color: '#ec4899' },
    ],
    springs: [
      { id: 'f4_sp1', x: 680, y: 624, w: 40, h: 16, power: -640, bounceAnim: 0 },
      { id: 'f4_sp2', x: 1160, y: 624, w: 40, h: 16, power: -640, bounceAnim: 0 },
      { id: 'f4_sp3', x: 1640, y: 624, w: 40, h: 16, power: -640, bounceAnim: 0 },
    ],
    hazards: [],
    checkpoints: [
      { id: 'f4_cp1', index: 1, x: 440, y: 570, w: 32, h: 70, isReached: false, spawnX: 460, spawnY: 580 },
      { id: 'f4_cp2', index: 2, x: 900, y: 570, w: 32, h: 70, isReached: false, spawnX: 920, spawnY: 580 },
      { id: 'f4_cp3', index: 3, x: 1380, y: 570, w: 32, h: 70, isReached: false, spawnX: 1400, spawnY: 580 },
    ],
    coins: [
      { id: 'c_f4_1', x: 530, y: 410, isCollected: false },
      { id: 'c_f4_2', x: 1010, y: 410, isCollected: false },
      { id: 'c_f4_3', x: 1490, y: 410, isCollected: false },
      { id: 'c_f4_4', x: 1950, y: 580, isCollected: false },
    ],
    portal: {
      id: 'f4_portal',
      x: 1960,
      y: 530,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 5: O Templo da Lava ---
  {
    id: 'stage_5',
    name: 'Fase 5: O Templo da Lava',
    subtitle: 'Fase climática com lava fervente e plataformas móveis',
    hint: 'Cuidado com a lava! Usem as molas para alcançar os interruptores.',
    width: 2200,
    height: 850,
    spawnPointP1: { x: 80, y: 620 },
    spawnPointP2: { x: 140, y: 620 },
    theme: {
      bgGradient: ['#450a0a', '#7f1d1d'],
      cloudColor: 'rgba(254, 202, 202, 0.08)',
      mountainColor: '#991b1b',
      tileColor: '#ef4444',
      tileAccent: '#b91c1c',
      decorTheme: 'sunset_canyon',
    },
    platforms: [
      { id: 'f5_p1', type: 'solid', x: 0, y: 680, w: 340, h: 170 },
      {
        id: 'f5_move1',
        type: 'moving',
        x: 370,
        y: 620,
        w: 120,
        h: 22,
        minX: 370,
        maxX: 570,
        speed: 130,
        vx: 130,
      },
      { id: 'f5_island1', type: 'solid', x: 600, y: 600, w: 200, h: 250 },
      { id: 'f5_pillar1', type: 'solid', x: 640, y: 440, w: 90, h: 22 },
      {
        id: 'f5_move2',
        type: 'moving',
        x: 830,
        y: 540,
        w: 120,
        h: 22,
        minX: 830,
        maxX: 1050,
        speed: 150,
        vx: 150,
      },
      {
        id: 'f5_move3',
        type: 'moving',
        x: 1090,
        y: 460,
        w: 120,
        h: 22,
        minX: 1090,
        maxX: 1310,
        speed: 160,
        vx: 160,
      },
      { id: 'f5_island2', type: 'solid', x: 1340, y: 520, w: 220, h: 330 },
      { id: 'f5_p_final', type: 'solid', x: 1680, y: 520, w: 520, h: 330 },
      { id: 'f5_w1', type: 'solid', x: 1720, y: 0, w: 40, h: 400 },
    ],
    pressurePlates: [
      {
        id: 'plate_f5_1',
        x: 655,
        y: 428,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f5_golden',
        isPressed: false,
        isDualRequired: true,
        color: '#fbbf24',
        label: 'A',
      },
      {
        id: 'plate_f5_2',
        x: 1410,
        y: 508,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f5_golden',
        isPressed: false,
        isDualRequired: true,
        color: '#fbbf24',
        label: 'B',
      },
    ],
    doors: [
      {
        id: 'door_f5_golden',
        x: 1720,
        y: 400,
        w: 40,
        h: 120,
        isOpen: false,
        openHeight: 120,
        currentOffset: 0,
        requiredTriggerId: 'plate_f5_1',
        color: '#fbbf24',
      },
    ],
    springs: [
      { id: 'f5_sp1', x: 620, y: 584, w: 40, h: 16, power: -720, bounceAnim: 0 },
      { id: 'f5_sp2', x: 1360, y: 504, w: 40, h: 16, power: -720, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f5_lava1', type: 'lava', x: 340, y: 810, w: 260, h: 40, isActive: true },
      { id: 'f5_lava2', type: 'lava', x: 800, y: 810, w: 540, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f5_cp1', index: 1, x: 620, y: 370, w: 32, h: 70, isReached: false, spawnX: 640, spawnY: 380 },
      { id: 'f5_cp2', index: 2, x: 1450, y: 450, w: 32, h: 70, isReached: false, spawnX: 1470, spawnY: 460 },
    ],
    coins: [
      { id: 'c_f5_1', x: 470, y: 550, isCollected: false },
      { id: 'c_f5_2', x: 680, y: 360, isCollected: false },
      { id: 'c_f5_3', x: 1200, y: 390, isCollected: false },
      { id: 'c_f5_4', x: 1950, y: 460, isCollected: false },
    ],
    portal: {
      id: 'f5_portal',
      x: 1880,
      y: 410,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 6: Elevadores Celestiais ---
  {
    id: 'stage_6',
    name: 'Fase 6: Elevadores Celestiais',
    subtitle: 'Plataformas verticais que sobem até o céu estelar',
    hint: 'Suba no elevador móvel e ative o botão no topo para liberar seu amigo!',
    width: 2000,
    height: 800,
    spawnPointP1: { x: 80, y: 560 },
    spawnPointP2: { x: 140, y: 560 },
    theme: {
      bgGradient: ['#082f49', '#0c4a6e'],
      cloudColor: 'rgba(186, 230, 253, 0.08)',
      mountainColor: '#0369a1',
      tileColor: '#0284c7',
      tileAccent: '#0369a1',
      decorTheme: 'crystal_cavern',
    },
    platforms: [
      { id: 'f6_p1', type: 'solid', x: 0, y: 620, w: 340, h: 180 },
      // Vertical elevator 1
      {
        id: 'f6_lift1',
        type: 'moving',
        x: 380,
        y: 560,
        w: 120,
        h: 22,
        minY: 340,
        maxY: 580,
        speed: 120,
        vy: -120,
      },
      { id: 'f6_high1', type: 'solid', x: 540, y: 340, w: 200, h: 24 },
      // Bridge mid
      { id: 'f6_p_mid', type: 'solid', x: 780, y: 620, w: 360, h: 180 },
      // Vertical elevator 2
      {
        id: 'f6_lift2',
        type: 'moving',
        x: 1180,
        y: 420,
        w: 120,
        h: 22,
        minY: 280,
        maxY: 540,
        speed: 140,
        vy: 140,
      },
      { id: 'f6_high2', type: 'solid', x: 1340, y: 320, w: 180, h: 24 },
      // Final platform
      { id: 'f6_p_end', type: 'solid', x: 1560, y: 580, w: 440, h: 220 },
      { id: 'f6_wall', type: 'solid', x: 1560, y: 0, w: 36, h: 440 },
    ],
    pressurePlates: [
      {
        id: 'plate_f6_1',
        x: 600,
        y: 328,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f6_1',
        isPressed: false,
        color: '#38bdf8',
        label: 'A',
      },
      {
        id: 'plate_f6_2',
        x: 1400,
        y: 308,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f6_1',
        isPressed: false,
        isDualRequired: true,
        color: '#38bdf8',
        label: 'B',
      },
    ],
    doors: [
      {
        id: 'door_f6_1',
        x: 1560,
        y: 440,
        w: 36,
        h: 140,
        isOpen: false,
        openHeight: 140,
        currentOffset: 0,
        requiredTriggerId: 'plate_f6_1',
        color: '#38bdf8',
      },
    ],
    springs: [
      { id: 'f6_sp1', x: 840, y: 604, w: 40, h: 16, power: -720, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f6_hz1', type: 'spikes', x: 340, y: 760, w: 440, h: 40, isActive: true },
      { id: 'f6_hz2', type: 'spikes', x: 1140, y: 760, w: 420, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f6_cp1', index: 1, x: 880, y: 550, w: 32, h: 70, isReached: false, spawnX: 900, spawnY: 560 },
    ],
    coins: [
      { id: 'c_f6_1', x: 440, y: 280, isCollected: false },
      { id: 'c_f6_2', x: 1240, y: 220, isCollected: false },
      { id: 'c_f6_3', x: 1800, y: 520, isCollected: false },
    ],
    portal: {
      id: 'f6_portal',
      x: 1820,
      y: 470,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 7: Trampolim da Amizade ---
  {
    id: 'stage_7',
    name: 'Fase 7: Trampolim da Amizade',
    subtitle: 'Combine molas supersônicas e pulos na cabeça',
    hint: 'Pule na cabeça do seu amigo para alcançar atalhos secretos!',
    width: 2100,
    height: 800,
    spawnPointP1: { x: 80, y: 580 },
    spawnPointP2: { x: 140, y: 580 },
    theme: {
      bgGradient: ['#18181b', '#27272a'],
      cloudColor: 'rgba(254, 240, 138, 0.08)',
      mountainColor: '#3f3f46',
      tileColor: '#eab308',
      tileAccent: '#ca8a04',
      decorTheme: 'celestial',
    },
    platforms: [
      { id: 'f7_p1', type: 'solid', x: 0, y: 640, w: 380, h: 160 },
      { id: 'f7_island1', type: 'solid', x: 500, y: 640, w: 260, h: 160 },
      { id: 'f7_secret_high', type: 'solid', x: 620, y: 320, w: 120, h: 22 },
      { id: 'f7_island2', type: 'solid', x: 920, y: 640, w: 320, h: 160 },
      { id: 'f7_high2', type: 'solid', x: 1040, y: 440, w: 120, h: 22 },
      { id: 'f7_p_end', type: 'solid', x: 1420, y: 640, w: 680, h: 160 },
      { id: 'f7_w1', type: 'solid', x: 1460, y: 0, w: 40, h: 480 },
    ],
    pressurePlates: [
      {
        id: 'plate_f7_1',
        x: 650,
        y: 308,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f7_1',
        isPressed: false,
        color: '#eab308',
        label: '★',
      },
    ],
    doors: [
      {
        id: 'door_f7_1',
        x: 1460,
        y: 480,
        w: 40,
        h: 160,
        isOpen: false,
        openHeight: 160,
        currentOffset: 0,
        requiredTriggerId: 'plate_f7_1',
        color: '#eab308',
      },
    ],
    springs: [
      { id: 'f7_sp1', x: 280, y: 624, w: 40, h: 16, power: -720, bounceAnim: 0 },
      { id: 'f7_sp2', x: 700, y: 624, w: 40, h: 16, power: -750, bounceAnim: 0 },
      { id: 'f7_sp3', x: 1140, y: 624, w: 40, h: 16, power: -700, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f7_hz1', type: 'spikes', x: 380, y: 760, w: 120, h: 40, isActive: true },
      { id: 'f7_hz2', type: 'spikes', x: 760, y: 760, w: 160, h: 40, isActive: true },
      { id: 'f7_hz3', type: 'spikes', x: 1240, y: 760, w: 180, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f7_cp1', index: 1, x: 960, y: 570, w: 32, h: 70, isReached: false, spawnX: 980, spawnY: 580 },
    ],
    coins: [
      { id: 'c_f7_1', x: 680, y: 250, isCollected: false }, // secret high coin!
      { id: 'c_f7_2', x: 1100, y: 380, isCollected: false },
      { id: 'c_f7_3', x: 1850, y: 580, isCollected: false },
    ],
    portal: {
      id: 'f7_portal',
      x: 1920,
      y: 530,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 8: A Grande Ponte de Neon ---
  {
    id: 'stage_8',
    name: 'Fase 8: A Grande Ponte de Neon',
    subtitle: 'Cores vibrantes e plataformas que exigem precisão',
    hint: 'Pise nos botões coloridos para erguer a ponte luminosa!',
    width: 2200,
    height: 800,
    spawnPointP1: { x: 80, y: 580 },
    spawnPointP2: { x: 140, y: 580 },
    theme: {
      bgGradient: ['#022c22', '#064e3b'],
      cloudColor: 'rgba(167, 243, 208, 0.08)',
      mountainColor: '#047857',
      tileColor: '#10b981',
      tileAccent: '#059669',
      decorTheme: 'neon_sky',
    },
    platforms: [
      { id: 'f8_p1', type: 'solid', x: 0, y: 640, w: 360, h: 160 },
      { id: 'f8_step1', type: 'solid', x: 420, y: 560, w: 100, h: 22 },
      { id: 'f8_step2', type: 'solid', x: 580, y: 480, w: 100, h: 22 },
      { id: 'f8_mid', type: 'solid', x: 740, y: 640, w: 380, h: 160 },
      {
        id: 'f8_move',
        type: 'moving',
        x: 1180,
        y: 540,
        w: 130,
        h: 22,
        minX: 1180,
        maxX: 1480,
        speed: 160,
        vx: 160,
      },
      { id: 'f8_end', type: 'solid', x: 1540, y: 640, w: 660, h: 160 },
      { id: 'f8_wall', type: 'solid', x: 1600, y: 0, w: 36, h: 500 },
    ],
    pressurePlates: [
      {
        id: 'plate_f8_1',
        x: 820,
        y: 628,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f8_1',
        isPressed: false,
        color: '#10b981',
        label: '1',
      },
      {
        id: 'plate_f8_2',
        x: 1000,
        y: 628,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f8_1',
        isPressed: false,
        isDualRequired: true,
        color: '#06b6d4',
        label: '2',
      },
    ],
    doors: [
      {
        id: 'door_f8_1',
        x: 1600,
        y: 500,
        w: 36,
        h: 140,
        isOpen: false,
        openHeight: 140,
        currentOffset: 0,
        requiredTriggerId: 'plate_f8_1',
        color: '#10b981',
      },
    ],
    springs: [
      { id: 'f8_sp1', x: 260, y: 624, w: 40, h: 16, power: -680, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f8_hz1', type: 'lava', x: 360, y: 760, w: 380, h: 40, isActive: true },
      { id: 'f8_hz2', type: 'lava', x: 1120, y: 760, w: 420, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f8_cp1', index: 1, x: 780, y: 570, w: 32, h: 70, isReached: false, spawnX: 800, spawnY: 580 },
    ],
    coins: [
      { id: 'c_f8_1', x: 630, y: 420, isCollected: false },
      { id: 'c_f8_2', x: 1330, y: 480, isCollected: false },
      { id: 'c_f8_3', x: 1980, y: 580, isCollected: false },
    ],
    portal: {
      id: 'f8_portal',
      x: 2020,
      y: 530,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 9: As Cavernas dos Cristais ---
  {
    id: 'stage_9',
    name: 'Fase 9: As Cavernas dos Cristais',
    subtitle: 'Desative lasers temporizados e alcance os cristais',
    hint: 'Segure a placa para apagar o feixe de laser enquanto seu parceiro passa!',
    width: 2200,
    height: 800,
    spawnPointP1: { x: 80, y: 580 },
    spawnPointP2: { x: 140, y: 580 },
    theme: {
      bgGradient: ['#1e1b4b', '#111827'],
      cloudColor: 'rgba(192, 132, 252, 0.12)',
      mountainColor: '#312e81',
      tileColor: '#ec4899',
      tileAccent: '#db2777',
      decorTheme: 'celestial',
    },
    platforms: [
      { id: 'f9_p1', type: 'solid', x: 0, y: 640, w: 360, h: 160 },
      { id: 'f9_btn_ledge', type: 'solid', x: 220, y: 480, w: 100, h: 22 },
      { id: 'f9_mid1', type: 'solid', x: 440, y: 640, w: 320, h: 160 },
      { id: 'f9_mid2', type: 'solid', x: 860, y: 640, w: 360, h: 160 },
      { id: 'f9_high_crystal', type: 'solid', x: 980, y: 380, w: 140, h: 22 },
      { id: 'f9_end', type: 'solid', x: 1320, y: 640, w: 880, h: 160 },
      { id: 'f9_wall', type: 'solid', x: 1500, y: 0, w: 36, h: 480 },
    ],
    pressurePlates: [
      {
        id: 'plate_f9_laser',
        x: 240,
        y: 468,
        w: 60,
        h: 12,
        linkedDoorId: '',
        isPressed: false,
        color: '#f43f5e',
        label: 'Laser',
      },
      {
        id: 'plate_f9_door',
        x: 1020,
        y: 368,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f9_1',
        isPressed: false,
        color: '#ec4899',
        label: 'Porta',
      },
    ],
    doors: [
      {
        id: 'door_f9_1',
        x: 1500,
        y: 480,
        w: 36,
        h: 160,
        isOpen: false,
        openHeight: 160,
        currentOffset: 0,
        requiredTriggerId: 'plate_f9_door',
        color: '#ec4899',
      },
    ],
    springs: [
      { id: 'f9_sp1', x: 880, y: 624, w: 40, h: 16, power: -720, bounceAnim: 0 },
    ],
    hazards: [
      // Laser beam toggleable by plate_f9_laser
      { id: 'f9_laser1', type: 'laser', x: 400, y: 440, w: 20, h: 200, toggleTriggerId: 'plate_f9_laser', isActive: true },
      { id: 'f9_spikes', type: 'spikes', x: 760, y: 760, w: 100, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f9_cp1', index: 1, x: 500, y: 570, w: 32, h: 70, isReached: false, spawnX: 520, spawnY: 580 },
    ],
    coins: [
      { id: 'c_f9_1', x: 270, y: 410, isCollected: false },
      { id: 'c_f9_2', x: 1050, y: 310, isCollected: false },
      { id: 'c_f9_3', x: 1850, y: 580, isCollected: false },
    ],
    portal: {
      id: 'f9_portal',
      x: 1950,
      y: 530,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },

  // --- FASE 10: O Portal dos Campeões (Grande Final do Mundo 1) ---
  {
    id: 'stage_10',
    name: 'Fase 10: O Portal dos Campeões',
    subtitle: 'O maior desafio cooperativo do Mundo 1!',
    hint: 'Trabalho em equipe lendário! Usem todas as técnicas aprendidas.',
    width: 2500,
    height: 850,
    spawnPointP1: { x: 80, y: 640 },
    spawnPointP2: { x: 140, y: 640 },
    theme: {
      bgGradient: ['#18181b', '#3b0764'],
      cloudColor: 'rgba(250, 204, 21, 0.12)',
      mountainColor: '#581c87',
      tileColor: '#f59e0b',
      tileAccent: '#d97706',
      decorTheme: 'celestial',
    },
    platforms: [
      { id: 'f10_p1', type: 'solid', x: 0, y: 700, w: 380, h: 150 },
      { id: 'f10_pillar1', type: 'solid', x: 260, y: 520, w: 100, h: 22 },
      {
        id: 'f10_move1',
        type: 'moving',
        x: 420,
        y: 620,
        w: 120,
        h: 22,
        minX: 420,
        maxX: 660,
        speed: 150,
        vx: 150,
      },
      { id: 'f10_mid1', type: 'solid', x: 720, y: 660, w: 320, h: 190 },
      { id: 'f10_w1', type: 'solid', x: 1040, y: 0, w: 40, h: 520 },
      {
        id: 'f10_lift',
        type: 'moving',
        x: 1120,
        y: 540,
        w: 120,
        h: 22,
        minY: 360,
        maxY: 600,
        speed: 130,
        vy: -130,
      },
      { id: 'f10_high_altar', type: 'solid', x: 1280, y: 380, w: 240, h: 24 },
      { id: 'f10_mid2', type: 'solid', x: 1560, y: 660, w: 320, h: 190 },
      { id: 'f10_w2', type: 'solid', x: 1880, y: 0, w: 40, h: 520 },
      { id: 'f10_end', type: 'solid', x: 1880, y: 660, w: 620, h: 190 },
    ],
    pressurePlates: [
      {
        id: 'plate_f10_1',
        x: 280,
        y: 508,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f10_1',
        isPressed: false,
        color: '#fbbf24',
        label: '1',
      },
      {
        id: 'plate_f10_2A',
        x: 1320,
        y: 368,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f10_2',
        isPressed: false,
        isDualRequired: true,
        color: '#10b981',
        label: 'A',
      },
      {
        id: 'plate_f10_2B',
        x: 1440,
        y: 368,
        w: 60,
        h: 12,
        linkedDoorId: 'door_f10_2',
        isPressed: false,
        isDualRequired: true,
        color: '#10b981',
        label: 'B',
      },
    ],
    doors: [
      {
        id: 'door_f10_1',
        x: 1040,
        y: 520,
        w: 40,
        h: 140,
        isOpen: false,
        openHeight: 140,
        currentOffset: 0,
        requiredTriggerId: 'plate_f10_1',
        color: '#fbbf24',
      },
      {
        id: 'door_f10_2',
        x: 1880,
        y: 520,
        w: 40,
        h: 140,
        isOpen: false,
        openHeight: 140,
        currentOffset: 0,
        requiredTriggerId: 'plate_f10_2A',
        color: '#10b981',
      },
    ],
    springs: [
      { id: 'f10_sp1', x: 860, y: 644, w: 40, h: 16, power: -720, bounceAnim: 0 },
      { id: 'f10_sp2', x: 1700, y: 644, w: 40, h: 16, power: -720, bounceAnim: 0 },
    ],
    hazards: [
      { id: 'f10_lava1', type: 'lava', x: 380, y: 810, w: 340, h: 40, isActive: true },
      { id: 'f10_lava2', type: 'lava', x: 1040, y: 810, w: 520, h: 40, isActive: true },
    ],
    checkpoints: [
      { id: 'f10_cp1', index: 1, x: 760, y: 590, w: 32, h: 70, isReached: false, spawnX: 780, spawnY: 600 },
      { id: 'f10_cp2', index: 2, x: 1600, y: 590, w: 32, h: 70, isReached: false, spawnX: 1620, spawnY: 600 },
    ],
    coins: [
      { id: 'c_f10_1', x: 310, y: 440, isCollected: false },
      { id: 'c_f10_2', x: 550, y: 550, isCollected: false },
      { id: 'c_f10_3', x: 1380, y: 300, isCollected: false },
      { id: 'c_f10_4', x: 2200, y: 600, isCollected: false },
    ],
    portal: {
      id: 'f10_portal',
      x: 2280,
      y: 550,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  },
];

// Biome palettes for procedurally generated stages (11..2000)
const BIOMES: Array<{
  name: string;
  decor: 'grassland' | 'sunset_canyon' | 'neon_sky' | 'crystal_cavern' | 'celestial';
  bgGradient: [string, string];
  cloudColor: string;
  mountainColor: string;
  tileColor: string;
  tileAccent: string;
}> = [
  {
    name: 'Campos Esmeralda',
    decor: 'grassland',
    bgGradient: ['#0f172a', '#1e293b'],
    cloudColor: 'rgba(255, 255, 255, 0.08)',
    mountainColor: '#334155',
    tileColor: '#10b981',
    tileAccent: '#059669',
  },
  {
    name: 'Cânion Solar',
    decor: 'sunset_canyon',
    bgGradient: ['#1e1b4b', '#312e81'],
    cloudColor: 'rgba(238, 242, 255, 0.1)',
    mountainColor: '#4338ca',
    tileColor: '#8b5cf6',
    tileAccent: '#6d28d9',
  },
  {
    name: 'Metrópole Neon',
    decor: 'neon_sky',
    bgGradient: ['#3b0764', '#581c87'],
    cloudColor: 'rgba(250, 232, 255, 0.08)',
    mountainColor: '#6b21a8',
    tileColor: '#c084fc',
    tileAccent: '#a855f7',
  },
  {
    name: 'Caverna de Cristal',
    decor: 'crystal_cavern',
    bgGradient: ['#082f49', '#0c4a6e'],
    cloudColor: 'rgba(186, 230, 253, 0.08)',
    mountainColor: '#0369a1',
    tileColor: '#0284c7',
    tileAccent: '#0369a1',
  },
  {
    name: 'Templo Celestial',
    decor: 'celestial',
    bgGradient: ['#18181b', '#27272a'],
    cloudColor: 'rgba(254, 240, 138, 0.08)',
    mountainColor: '#3f3f46',
    tileColor: '#eab308',
    tileAccent: '#ca8a04',
  },
  {
    name: 'Vale da Tempestade',
    decor: 'neon_sky',
    bgGradient: ['#022c22', '#064e3b'],
    cloudColor: 'rgba(167, 243, 208, 0.08)',
    mountainColor: '#047857',
    tileColor: '#10b981',
    tileAccent: '#059669',
  },
  {
    name: 'Fortaleza Vulcânica',
    decor: 'sunset_canyon',
    bgGradient: ['#450a0a', '#7f1d1d'],
    cloudColor: 'rgba(254, 202, 202, 0.08)',
    mountainColor: '#991b1b',
    tileColor: '#ef4444',
    tileAccent: '#b91c1c',
  },
  {
    name: 'Abismo Cósmico',
    decor: 'celestial',
    bgGradient: ['#1e1b4b', '#111827'],
    cloudColor: 'rgba(192, 132, 252, 0.12)',
    mountainColor: '#312e81',
    tileColor: '#ec4899',
    tileAccent: '#db2777',
  },
];

// Level titles for varied progression
const LEVEL_TITLES_W1 = [
  'Travessia dos Ventos',
  'Salto em Dupla',
  'Caminho das Nuvens',
  'Engrenagens Velozes',
  'Ponte dos Segredos',
  'Pico Acrobático',
  'Labirinto Flutuante',
  'Sincronia Estelar',
  'Desafio dos Portais',
  'Vale dos Saltos',
  'Templo das Molas',
  'Caminho do Ouro',
  'Rota das Estrelas',
  'Plataformas Dançantes',
  'Passo Coordenado',
  'Cidadela Serena',
  'Salto no Horizonte',
  'Trilha Esmeralda',
  'Canyon dos Campeões',
  'A Grande Vitória',
];

const LEVEL_TITLES_W2 = [
  'Portal do Pesadelo',
  'Lava e Caos Total',
  'Laser Duplo Mortal',
  'Plataformas Instantâneas',
  'Molas Supersônicas',
  'O Abismo Ardente',
  'Revezamento Crítico',
  'Espinhos Velozes',
  'Labirinto Infernal',
  'Sobrevivência Extrema',
  'Corrida Contra o Vazio',
  'Sincronia Milimétrica',
  'Câmara dos Magmas',
  'Salto no Escuro',
  'Pico das Sombras',
  'Reino do Apocalipse',
  'Dimensão Extrema',
  'O Gran Finale Lendário',
];

// Deterministic Pseudo-Random Generator
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Procedural generator that creates robust, playable stages for 11..2000
 * Incorporates 4 distinct cooperative layout archetypes with guaranteed jump reachability.
 */
export function generateStage(stageIndex: number): Stage {
  // If it's one of the handcrafted signature stages (0..9), return clone
  if (stageIndex >= 0 && stageIndex < SIGNATURE_STAGES.length) {
    return JSON.parse(JSON.stringify(SIGNATURE_STAGES[stageIndex]));
  }

  const levelNumber = stageIndex + 1;
  const isWorld2 = stageIndex >= WORLD_1_STAGES;
  const worldLocalNum = isWorld2 ? stageIndex - WORLD_1_STAGES + 1 : levelNumber;

  const seed = (stageIndex * 9301 + 49297) % 233280;
  const biomeIdx = Math.floor(pseudoRandom(seed + 1) * BIOMES.length);
  const biome = BIOMES[biomeIdx];

  const titleList = isWorld2 ? LEVEL_TITLES_W2 : LEVEL_TITLES_W1;
  const title = titleList[Math.floor(pseudoRandom(seed + 2) * titleList.length)];
  const worldPrefix = isWorld2 ? `Mundo 2 (Pesadelo) · Fase ${worldLocalNum}` : `Fase ${levelNumber}`;

  // Stage dimensions
  const stageWidth = 2000 + Math.floor(pseudoRandom(seed + 3) * 500); // 2000 - 2500 width
  const stageHeight = 780;

  const platforms: Platform[] = [];
  const pressurePlates: PressurePlate[] = [];
  const doors: InteractiveDoor[] = [];
  const springs: SpringPad[] = [];
  const hazards: Hazard[] = [];
  const checkpoints: Checkpoint[] = [];
  const coins: StageCoin[] = [];

  // Determine Architectural Archetype (0, 1, 2, 3)
  const archetype = Math.floor(pseudoRandom(seed + 4) * 4);

  // 1. Starting Ground (firm, supporting Door 1 and initial jump)
  const startWidth = 460;
  platforms.push({
    id: `stg_${stageIndex}_p_start`,
    type: 'solid',
    x: 0,
    y: 620,
    w: startWidth,
    h: 160,
  });

  const door1X = 420;
  const wall1Height = 440;
  const buttonColor = isWorld2 ? '#ef4444' : '#3b82f6';
  const doorColor = isWorld2 ? '#f97316' : '#8b5cf6';

  // Wall 1
  platforms.push({
    id: `stg_${stageIndex}_wall1`,
    type: 'solid',
    x: door1X,
    y: 0,
    w: 36,
    h: wall1Height,
  });

  // Ledge with Button 1
  platforms.push({
    id: `stg_${stageIndex}_p_btn1`,
    type: 'solid',
    x: 180,
    y: 480,
    w: 120,
    h: 22,
  });

  pressurePlates.push({
    id: `plate_${stageIndex}_1`,
    x: 210,
    y: 468,
    w: 60,
    h: 12,
    linkedDoorId: `door_${stageIndex}_1`,
    isPressed: false,
    color: buttonColor,
    label: '1',
  });

  // Botão de retorno do outro lado da Porta 1
  pressurePlates.push({
    id: `plate_${stageIndex}_1_return`,
    x: door1X + 50,
    y: 608,
    w: 60,
    h: 12,
    linkedDoorId: `door_${stageIndex}_1`,
    isPressed: false,
    color: buttonColor,
    label: '1B',
  });

  doors.push({
    id: `door_${stageIndex}_1`,
    x: door1X,
    y: wall1Height,
    w: 36,
    h: 620 - wall1Height,
    isOpen: false,
    openHeight: 620 - wall1Height,
    currentOffset: 0,
    requiredTriggerId: `plate_${stageIndex}_1`,
    requiredTriggerIds: [`plate_${stageIndex}_1`, `plate_${stageIndex}_1_return`],
    maxCloseDelay: 3.5,
    color: doorColor,
  });

  // Collectible Coin 1 (above ledge 1)
  coins.push({
    id: `coin_${stageIndex}_1`,
    x: 235,
    y: 410,
    isCollected: false,
  });

  // 2. Middle Section according to Archetype
  const sectionStartX = door1X + 36;

  if (archetype === 0) {
    // --- ARCHETYPE 0: RELAY GAUNTLET (Revezamento de Portas e Molas) ---
    const chasmW = 340;
    platforms.push({
      id: `stg_${stageIndex}_move1`,
      type: 'moving',
      x: sectionStartX + 20,
      y: 540,
      w: 120,
      h: 22,
      minX: sectionStartX + 20,
      maxX: sectionStartX + chasmW - 120,
      speed: isWorld2 ? 180 : 140,
      vx: isWorld2 ? 180 : 140,
    });

    hazards.push({
      id: `stg_${stageIndex}_hz1`,
      type: isWorld2 ? 'lava' : 'spikes',
      x: sectionStartX,
      y: 740,
      w: chasmW,
      h: 40,
      isActive: true,
    });

    // Mid Island with Checkpoint & Spring
    const midX = sectionStartX + chasmW;
    const midW = 380;
    platforms.push({
      id: `stg_${stageIndex}_p_mid`,
      type: 'solid',
      x: midX,
      y: 620,
      w: midW,
      h: 160,
    });

    checkpoints.push({
      id: `cp_${stageIndex}_1`,
      index: 1,
      x: midX + 40,
      y: 550,
      w: 32,
      h: 70,
      isReached: false,
      spawnX: midX + 60,
      spawnY: 560,
    });

    springs.push({
      id: `sp_${stageIndex}_1`,
      x: midX + 240,
      y: 604,
      w: 40,
      h: 16,
      power: isWorld2 ? -740 : -680,
      bounceAnim: 0,
    });

    // High Ledge for Plate 2A
    const highLedgeX = midX + 160;
    platforms.push({
      id: `stg_${stageIndex}_high1`,
      type: 'solid',
      x: highLedgeX,
      y: 380,
      w: 120,
      h: 22,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_2A`,
      x: highLedgeX + 30,
      y: 368,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_2`,
      isPressed: false,
      isDualRequired: true,
      color: '#10b981',
      label: 'A',
    });

    coins.push({
      id: `coin_${stageIndex}_2`,
      x: highLedgeX + 50,
      y: 300,
      isCollected: false,
    });

    // Wall 2 & Door 2
    const wall2X = midX + midW + 280;
    const wall2H = 420;
    platforms.push({
      id: `stg_${stageIndex}_wall2`,
      type: 'solid',
      x: wall2X,
      y: 0,
      w: 36,
      h: wall2H,
    });

    // Plate 2B
    platforms.push({
      id: `stg_${stageIndex}_p_btn2B`,
      type: 'solid',
      x: wall2X - 110,
      y: 480,
      w: 90,
      h: 22,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_2B`,
      x: wall2X - 95,
      y: 468,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_2`,
      isPressed: false,
      isDualRequired: true,
      color: '#10b981',
      label: 'B',
    });

    // Moving Platform 2
    platforms.push({
      id: `stg_${stageIndex}_move2`,
      type: 'moving',
      x: midX + midW,
      y: 500,
      w: 120,
      h: 22,
      minX: midX + midW,
      maxX: wall2X - 120,
      speed: isWorld2 ? 190 : 150,
      vx: isWorld2 ? 190 : 150,
    });

    hazards.push({
      id: `stg_${stageIndex}_hz2`,
      type: isWorld2 ? 'lava' : 'spikes',
      x: midX + midW,
      y: 740,
      w: wall2X - (midX + midW),
      h: 40,
      isActive: true,
    });

    doors.push({
      id: `door_${stageIndex}_2`,
      x: wall2X,
      y: wall2H,
      w: 36,
      h: 620 - wall2H,
      isOpen: false,
      openHeight: 620 - wall2H,
      currentOffset: 0,
      requiredTriggerId: `plate_${stageIndex}_2A`,
      color: '#10b981',
    });

    // Final Island
    const finalIslandX = wall2X - 20;
    platforms.push({
      id: `stg_${stageIndex}_p_final`,
      type: 'solid',
      x: finalIslandX,
      y: 620,
      w: stageWidth - finalIslandX,
      h: 160,
    });
  } else if (archetype === 1) {
    // --- ARCHETYPE 1: FLOATING ELEVATORS & SPRINGS (Elevadores Gêmeos) ---
    // Stepping island
    const island1X = sectionStartX + 80;
    platforms.push({
      id: `stg_${stageIndex}_arch1_p1`,
      type: 'solid',
      x: island1X,
      y: 600,
      w: 220,
      h: 180,
    });

    // Vertical lift 1
    platforms.push({
      id: `stg_${stageIndex}_arch1_lift1`,
      type: 'moving',
      x: island1X + 260,
      y: 480,
      w: 110,
      h: 22,
      minY: 320,
      maxY: 560,
      speed: 130,
      vy: -130,
    });

    // High bridge
    const highBridgeX = island1X + 410;
    platforms.push({
      id: `stg_${stageIndex}_arch1_high`,
      type: 'solid',
      x: highBridgeX,
      y: 340,
      w: 280,
      h: 24,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_arch1_A`,
      x: highBridgeX + 40,
      y: 328,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_arch1`,
      isPressed: false,
      isDualRequired: true,
      color: '#06b6d4',
      label: 'A',
    });

    coins.push({
      id: `coin_${stageIndex}_2`,
      x: highBridgeX + 140,
      y: 270,
      isCollected: false,
    });

    // Checkpoint 1 on lower mid bridge
    const lowerMidX = highBridgeX + 40;
    platforms.push({
      id: `stg_${stageIndex}_arch1_lowmid`,
      type: 'solid',
      x: lowerMidX,
      y: 620,
      w: 280,
      h: 160,
    });

    checkpoints.push({
      id: `cp_${stageIndex}_1`,
      index: 1,
      x: lowerMidX + 30,
      y: 550,
      w: 32,
      h: 70,
      isReached: false,
      spawnX: lowerMidX + 50,
      spawnY: 560,
    });

    springs.push({
      id: `sp_${stageIndex}_arch1`,
      x: lowerMidX + 180,
      y: 604,
      w: 40,
      h: 16,
      power: -720,
      bounceAnim: 0,
    });

    // Wall & Door
    const wallX = lowerMidX + 380;
    const wallH = 440;
    platforms.push({
      id: `stg_${stageIndex}_arch1_wall`,
      type: 'solid',
      x: wallX,
      y: 0,
      w: 36,
      h: wallH,
    });

    // Lower platform holding Plate B
    platforms.push({
      id: `stg_${stageIndex}_arch1_pbtnB`,
      type: 'solid',
      x: wallX - 100,
      y: 480,
      w: 80,
      h: 22,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_arch1_B`,
      x: wallX - 90,
      y: 468,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_arch1`,
      isPressed: false,
      isDualRequired: true,
      color: '#06b6d4',
      label: 'B',
    });

    doors.push({
      id: `door_${stageIndex}_arch1`,
      x: wallX,
      y: wallH,
      w: 36,
      h: 620 - wallH,
      isOpen: false,
      openHeight: 620 - wallH,
      currentOffset: 0,
      requiredTriggerId: `plate_${stageIndex}_arch1_A`,
      color: '#06b6d4',
    });

    hazards.push({
      id: `stg_${stageIndex}_arch1_hz`,
      type: isWorld2 ? 'lava' : 'spikes',
      x: sectionStartX,
      y: 740,
      w: wallX - sectionStartX,
      h: 40,
      isActive: true,
    });

    // Final Island
    const finalIslandX = wallX - 20;
    platforms.push({
      id: `stg_${stageIndex}_arch1_final`,
      type: 'solid',
      x: finalIslandX,
      y: 620,
      w: stageWidth - finalIslandX,
      h: 160,
    });
  } else if (archetype === 2) {
    // --- ARCHETYPE 2: DUAL PEAK PYRAMID (A Pirâmide das Placas Duplas) ---
    const pyrBaseX = sectionStartX + 60;
    // Tier 1
    platforms.push({
      id: `stg_${stageIndex}_pyr_t1`,
      type: 'solid',
      x: pyrBaseX,
      y: 600,
      w: 240,
      h: 180,
    });

    // Tier 2
    platforms.push({
      id: `stg_${stageIndex}_pyr_t2`,
      type: 'solid',
      x: pyrBaseX + 80,
      y: 480,
      w: 160,
      h: 24,
    });

    // Peak Left
    platforms.push({
      id: `stg_${stageIndex}_pyr_peakA`,
      type: 'solid',
      x: pyrBaseX + 110,
      y: 340,
      w: 100,
      h: 24,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_pyr_A`,
      x: pyrBaseX + 130,
      y: 328,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_pyr`,
      isPressed: false,
      isDualRequired: true,
      color: '#f59e0b',
      label: 'A',
    });

    coins.push({
      id: `coin_${stageIndex}_2`,
      x: pyrBaseX + 150,
      y: 260,
      isCollected: false,
    });

    // Checkpoint on mid pyramid
    checkpoints.push({
      id: `cp_${stageIndex}_1`,
      index: 1,
      x: pyrBaseX + 30,
      y: 530,
      w: 32,
      h: 70,
      isReached: false,
      spawnX: pyrBaseX + 50,
      spawnY: 540,
    });

    // Stepping platforms to Peak Right
    const peakBX = pyrBaseX + 380;
    platforms.push({
      id: `stg_${stageIndex}_pyr_step`,
      type: 'solid',
      x: pyrBaseX + 260,
      y: 420,
      w: 90,
      h: 22,
    });

    platforms.push({
      id: `stg_${stageIndex}_pyr_peakB`,
      type: 'solid',
      x: peakBX,
      y: 340,
      w: 110,
      h: 24,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_pyr_B`,
      x: peakBX + 25,
      y: 328,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_pyr`,
      isPressed: false,
      isDualRequired: true,
      color: '#f59e0b',
      label: 'B',
    });

    // Spring below peak B
    platforms.push({
      id: `stg_${stageIndex}_pyr_lowB`,
      type: 'solid',
      x: peakBX - 20,
      y: 620,
      w: 160,
      h: 160,
    });

    springs.push({
      id: `sp_${stageIndex}_pyr`,
      x: peakBX + 30,
      y: 604,
      w: 40,
      h: 16,
      power: -720,
      bounceAnim: 0,
    });

    // Wall & Door
    const wallX = peakBX + 220;
    const wallH = 440;
    platforms.push({
      id: `stg_${stageIndex}_pyr_wall`,
      type: 'solid',
      x: wallX,
      y: 0,
      w: 36,
      h: wallH,
    });

    doors.push({
      id: `door_${stageIndex}_pyr`,
      x: wallX,
      y: wallH,
      w: 36,
      h: 620 - wallH,
      isOpen: false,
      openHeight: 620 - wallH,
      currentOffset: 0,
      requiredTriggerId: `plate_${stageIndex}_pyr_A`,
      color: '#f59e0b',
    });

    hazards.push({
      id: `stg_${stageIndex}_pyr_hz`,
      type: isWorld2 ? 'lava' : 'spikes',
      x: sectionStartX,
      y: 740,
      w: wallX - sectionStartX,
      h: 40,
      isActive: true,
    });

    // Final Island
    const finalIslandX = wallX - 20;
    platforms.push({
      id: `stg_${stageIndex}_pyr_final`,
      type: 'solid',
      x: finalIslandX,
      y: 620,
      w: stageWidth - finalIslandX,
      h: 160,
    });
  } else {
    // --- ARCHETYPE 3: LASER & OBSTACLE RUSH (Travessia dos Desafios) ---
    const rushMidX = sectionStartX + 80;
    platforms.push({
      id: `stg_${stageIndex}_rush_p1`,
      type: 'solid',
      x: rushMidX,
      y: 620,
      w: 240,
      h: 160,
    });

    // Plate that disables laser
    platforms.push({
      id: `stg_${stageIndex}_rush_btnLedge`,
      type: 'solid',
      x: rushMidX + 60,
      y: 480,
      w: 100,
      h: 22,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_laser`,
      x: rushMidX + 80,
      y: 468,
      w: 60,
      h: 12,
      linkedDoorId: '',
      isPressed: false,
      color: '#f43f5e',
      label: 'Laser',
    });

    // Laser Hazard
    hazards.push({
      id: `hz_${stageIndex}_laser`,
      type: 'laser',
      x: rushMidX + 280,
      y: 400,
      w: 20,
      h: 220,
      toggleTriggerId: `plate_${stageIndex}_laser`,
      isActive: true,
    });

    // Checkpoint
    checkpoints.push({
      id: `cp_${stageIndex}_1`,
      index: 1,
      x: rushMidX + 20,
      y: 550,
      w: 32,
      h: 70,
      isReached: false,
      spawnX: rushMidX + 40,
      spawnY: 560,
    });

    // Next platform after laser
    const afterLaserX = rushMidX + 340;
    platforms.push({
      id: `stg_${stageIndex}_rush_p2`,
      type: 'solid',
      x: afterLaserX,
      y: 620,
      w: 260,
      h: 160,
    });

    // High Plate for Door
    platforms.push({
      id: `stg_${stageIndex}_rush_highP`,
      type: 'solid',
      x: afterLaserX + 80,
      y: 440,
      w: 100,
      h: 22,
    });

    pressurePlates.push({
      id: `plate_${stageIndex}_rush_door`,
      x: afterLaserX + 100,
      y: 428,
      w: 60,
      h: 12,
      linkedDoorId: `door_${stageIndex}_rush`,
      isPressed: false,
      color: '#10b981',
      label: 'Porta',
    });

    coins.push({
      id: `coin_${stageIndex}_2`,
      x: afterLaserX + 120,
      y: 360,
      isCollected: false,
    });

    // Wall & Door
    const wallX = afterLaserX + 340;
    const wallH = 460;
    platforms.push({
      id: `stg_${stageIndex}_rush_wall`,
      type: 'solid',
      x: wallX,
      y: 0,
      w: 36,
      h: wallH,
    });

    doors.push({
      id: `door_${stageIndex}_rush`,
      x: wallX,
      y: wallH,
      w: 36,
      h: 620 - wallH,
      isOpen: false,
      openHeight: 620 - wallH,
      currentOffset: 0,
      requiredTriggerId: `plate_${stageIndex}_rush_door`,
      color: '#10b981',
    });

    hazards.push({
      id: `stg_${stageIndex}_rush_spikes`,
      type: isWorld2 ? 'lava' : 'spikes',
      x: afterLaserX + 260,
      y: 740,
      w: wallX - (afterLaserX + 260),
      h: 40,
      isActive: true,
    });

    // Final Island
    const finalIslandX = wallX - 20;
    platforms.push({
      id: `stg_${stageIndex}_rush_final`,
      type: 'solid',
      x: finalIslandX,
      y: 620,
      w: stageWidth - finalIslandX,
      h: 160,
    });
  }

  // Final Stage Coin near Goal Portal
  const portalX = stageWidth - 140;
  coins.push({
    id: `coin_${stageIndex}_final`,
    x: portalX - 50,
    y: 540,
    isCollected: false,
  });

  return {
    id: `stage_${stageIndex + 1}`,
    name: `${worldPrefix}: ${title}`,
    subtitle: isWorld2
      ? 'Desafio Extremo: Velocidade alta, perigos mortais e sincronia perfeita!'
      : 'Quebra-cabeça cooperativo: combinem seus passos para alcançar o portal.',
    hint: isWorld2
      ? 'Atenção redobrada nas plataformas velozes e na lava incandescente!'
      : 'Fique atento às cores das placas e ajude seu parceiro a passar!',
    width: stageWidth,
    height: stageHeight,
    spawnPointP1: { x: 70, y: 540 },
    spawnPointP2: { x: 130, y: 540 },
    theme: {
      bgGradient: biome.bgGradient,
      cloudColor: biome.cloudColor,
      mountainColor: biome.mountainColor,
      tileColor: isWorld2 ? '#dc2626' : biome.tileColor,
      tileAccent: isWorld2 ? '#991b1b' : biome.tileAccent,
      decorTheme: biome.decor,
    },
    platforms,
    pressurePlates,
    doors,
    springs,
    hazards,
    checkpoints,
    coins,
    portal: {
      id: `portal_${stageIndex + 1}`,
      x: portalX,
      y: 510,
      w: 60,
      h: 110,
      isUnlocked: true,
      playersInside: [],
    },
  };
}

// Stage cache map for instant re-access without recomputing
const stageCache = new Map<number, Stage>();

export function getStage(index: number): Stage {
  const safeIdx = Math.max(0, Math.min(TOTAL_STAGES - 1, Math.floor(index)));
  if (stageCache.has(safeIdx)) {
    return stageCache.get(safeIdx)!;
  }
  const stage = generateStage(safeIdx);
  stageCache.set(safeIdx, stage);
  return stage;
}

// Global STAGES Proxy Array of length 2000 so STAGES[index] & STAGES.length work everywhere
export const STAGES: Stage[] = new Proxy([] as Stage[], {
  get(target, prop) {
    if (prop === 'length') {
      return TOTAL_STAGES;
    }
    if (typeof prop === 'string') {
      const idx = Number(prop);
      if (!Number.isNaN(idx) && idx >= 0 && idx < TOTAL_STAGES) {
        return getStage(idx);
      }
    }
    return (target as any)[prop];
  },
});
