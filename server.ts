import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google Gemini AI client
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic fallback brain for instant response or offline resilience
function computeHeuristicThought(data: any) {
  const { stageIndex, player, buddy, doors = [], plates = [], portal = { x: 1200, y: 500 } } = data;

  const closedDoors = doors.filter((d: any) => !d.isOpen);
  const playerOnAnyPlate = plates.find((pl: any) => pl.isPressed);

  // Level 1 specific mastery:
  if (stageIndex === 0) {
    const door1 = doors.find((d: any) => d.id === 'door_1');
    const door2 = doors.find((d: any) => d.id === 'door_2');
    const plate2 = plates.find((pl: any) => pl.id === 'plate_2');

    // If player is on plate 1 and door 1 is open, and Beto is still behind door 1
    if (door1 && door1.isOpen && buddy.x < door1.x) {
      return {
        thought: 'O parceiro abriu a Porta 1! Atravessando correndo!',
        tacticalGoal: 'cross_door',
        targetX: 720,
        targetY: 448,
        shouldHold: false,
        advice: 'Segura o botão que eu vou acionar o botão 2!',
        emote: '🏃',
      };
    }

    // If Beto passed door 1, and door 2 is not yet opened
    if (door1 && buddy.x >= door1.x && door2 && !door2.isOpen) {
      const onPlate2 = plate2 && Math.abs(buddy.x - plate2.x) < 30;
      if (onPlate2) {
        return {
          thought: 'Apertei o Botão 2! A Porta 2 abriu, corre!',
          tacticalGoal: 'hold_plate',
          targetX: 720,
          targetY: 448,
          shouldHold: true,
          advice: 'Vem rápido, a Porta 2 está aberta!',
          emote: '🎯',
        };
      }
      return {
        thought: 'Vou saltar na plataforma do Botão 2 para abrir a Porta 2!',
        tacticalGoal: 'press_plate',
        targetX: 720,
        targetY: 448,
        shouldHold: false,
        advice: 'Estou indo pisar no botão 2!',
        emote: '💡',
      };
    }

    // If door 2 is open or both players are past
    if (door2 && (door2.isOpen || (player.x > door1.x && buddy.x > door2.x))) {
      return {
        thought: 'Caminho liberado! Vamos juntos pro portal!',
        tacticalGoal: 'go_to_portal',
        targetX: portal.x + 25,
        targetY: portal.y + 40,
        shouldHold: false,
        advice: 'Vamos vencer essa fase!',
        emote: '⭐',
      };
    }
  }

  // Dual plates check (e.g. Stage 3, 5, 8, 10)
  const dualPlates = plates.filter((pl: any) => pl.isDualRequired);
  if (dualPlates.length >= 2) {
    // Find which plate the player is closest to
    let closestToPlayer = dualPlates[0];
    let minPlayerDist = Math.abs(player.x - dualPlates[0].x);
    for (let i = 1; i < dualPlates.length; i++) {
      const dist = Math.abs(player.x - dualPlates[i].x);
      if (dist < minPlayerDist) {
        minPlayerDist = dist;
        closestToPlayer = dualPlates[i];
      }
    }
    const otherPlate = dualPlates.find((pl: any) => pl.id !== closestToPlayer.id) || dualPlates[1];
    return {
      thought: `Vou pisar na placa ${otherPlate.label || 'B'} enquanto você vai na outra!`,
      tacticalGoal: 'press_plate',
      targetX: otherPlate.x + otherPlate.w / 2,
      targetY: otherPlate.y,
      shouldHold: true,
      advice: 'Pise na placa correspondente para abrirmos juntos!',
      emote: '💡',
    };
  }

  // Next closed door blocking path
  if (closedDoors.length > 0) {
    const firstDoor = closedDoors[0];
    const triggerPlate = plates.find((pl: any) => pl.id === firstDoor.requiredTriggerId);

    // In Stage 1 (Fase 1), follow cooperative rule: player presses blue button, Beto crosses, Beto presses pink button for player
    if (stageIndex === 0) {
      if (buddy.x < 420) {
        if (!firstDoor.isOpen && !(triggerPlate && triggerPlate.isPressed)) {
          return {
            thought: 'Pisa no botão azul pra eu passar! 👉',
            tacticalGoal: 'wait_for_player_plate1',
            targetX: 360,
            targetY: 520,
            shouldHold: false,
            advice: 'Pise no botão azul para eu atravessar!',
            emote: '👉',
          };
        } else {
          return {
            thought: 'Boa! Segura aí que tô passando! 🏃💨',
            tacticalGoal: 'cross_door_1',
            targetX: 720,
            targetY: 448,
            shouldHold: false,
            advice: 'Atravessando a porta!',
            emote: '🏃',
          };
        }
      } else {
        if (player.x < 560) {
          return {
            thought: 'Apertei o botão rosa! Pode passar, caminho livre! 🚪✨',
            tacticalGoal: 'hold_plate_2_for_player',
            targetX: 720,
            targetY: 448,
            shouldHold: true,
            advice: 'Atravesse a porta, estou segurando o botão rosa!',
            emote: '🚪',
          };
        } else {
          return {
            thought: 'Boa, você passou! Vamos juntos pro portal! 🌟',
            tacticalGoal: 'go_to_portal',
            targetX: portal.x + 25,
            targetY: portal.y + 40,
            shouldHold: false,
            advice: 'Rumo à vitória no portal!',
            emote: '⭐',
          };
        }
      }
    }

    if (triggerPlate) {
      // If player is holding it and door is open
      if (triggerPlate.isPressed || firstDoor.isOpen) {
        return {
          thought: 'A porta abriu! Vou avançar para o próximo desafio!',
          tacticalGoal: 'cross_door',
          targetX: firstDoor.x + 120,
          targetY: firstDoor.y + 40,
          shouldHold: false,
          advice: 'Atravessando a porta!',
          emote: '🏃',
        };
      }

      // If Beto is with the player, ask player or cooperate
      if (buddy.x < firstDoor.x) {
        return {
          thought: 'Pisa no botão para abrir a porta para eu passar! 👉',
          tacticalGoal: 'wait_for_player',
          targetX: firstDoor.x - 60,
          targetY: buddy.y,
          shouldHold: false,
          advice: 'Pise no botão para abrirmos o caminho!',
          emote: '👉',
        };
      }
    }
  }

  // Default: Head to portal together
  return {
    thought: 'Tudo limpo! Vamos correr juntos para o portal!',
    tacticalGoal: 'go_to_portal',
    targetX: portal.x + 25,
    targetY: portal.y + 40,
    shouldHold: false,
    advice: 'Rumo à vitória!',
    emote: '⭐',
  };
}

// Gemini AI Buddy Strategic Reasoning Endpoint
app.post('/api/ai-buddy/think', async (req, res) => {
  const {
    stageIndex = 0,
    stageName = 'Fase Atual',
    stageHint = '',
    player = { x: 80, y: 520, isGrounded: true },
    buddy = { x: 140, y: 520, isGrounded: true },
    doors = [],
    plates = [],
    hazards = [],
    portal = { x: 1200, y: 500 },
  } = req.body || {};

  // If Gemini client is available, ask Gemini 3.8 Flash for strategic reasoning
  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Você é Beto, um robô de IA super inteligente e companheiro de jogo em um jogo cooperativo 2D.
O jogador humano está jogando com você. Sua meta é analisar o estado da fase e dizer o que você vai fazer para resolverem o quebra-cabeça juntos.

Estado da Fase:
- Fase: ${stageName} (Índice ${stageIndex})
- Dica: ${stageHint}
- Jogador 1 (Humano): x=${Math.round(player.x)}, y=${Math.round(player.y)}, chão=${player.isGrounded}
- Beto (Você): x=${Math.round(buddy.x)}, y=${Math.round(buddy.y)}, chão=${buddy.isGrounded}
- Portas: ${JSON.stringify(doors.map((d: any) => ({ id: d.id, x: Math.round(d.x), isOpen: d.isOpen })))}
- Placas/Botões: ${JSON.stringify(plates.map((p: any) => ({ id: p.id, x: Math.round(p.x), isPressed: p.isPressed, linkedDoor: p.linkedDoorId })))}
- Portal: x=${Math.round(portal.x)}, y=${Math.round(portal.y)}

Regras de raciocínio cooperativo:
1. Se o jogador pisou no botão e abriu a porta que estava bloqueando o caminho, e você ainda não passou, você DEVE atravessar a porta imediatamente, pular o abismo com espinhos e ir até o botão 2 na outra plataforma!
2. Se você já passou da porta 1 e a porta 2 está fechada, você DEVE subir na plataforma do botão 2 e pisar no botão 2 para que a porta abra para ambos!
3. Se os dois já passaram, ambos devem ir juntos ao portal.

Retorne APENAS um JSON válido no seguinte formato:
{
  "thought": "pensamento curto e amigável em português do Beto (máx 50 caracteres)",
  "tacticalGoal": "cross_door" | "press_plate" | "hold_plate" | "go_to_portal" | "follow_player",
  "targetX": número x onde Beto deve ir,
  "targetY": número y onde Beto deve ir,
  "shouldHold": true se Beto deve ficar parado no botão,
  "advice": "aviso curto pro jogador",
  "emote": "💡" | "🏃" | "👍" | "🎯" | "⭐"
}`;

      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);

      return res.json({
        ok: true,
        source: 'gemini-3.8-flash',
        thought: parsed.thought || 'Pensando na melhor jogada...',
        tacticalGoal: parsed.tacticalGoal || 'cross_door',
        targetX: typeof parsed.targetX === 'number' ? parsed.targetX : 720,
        targetY: typeof parsed.targetY === 'number' ? parsed.targetY : 448,
        shouldHold: Boolean(parsed.shouldHold),
        advice: parsed.advice || '',
        emote: parsed.emote || '💡',
      });
    } catch (err: any) {
      console.warn('Gemini AI Buddy call error, falling back to heuristic brain:', err?.message || err);
    }
  }

  // High-performance heuristic brain fallback
  const fallback = computeHeuristicThought(req.body);
  res.json({
    ok: true,
    source: 'tactical-heuristic',
    ...fallback,
  });
});

// API health and info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Together Adventures 2D',
    roomsActive: rooms.size,
    hasGemini: Boolean(geminiClient),
    timestamp: Date.now()
  });
});


// List public rooms endpoint
app.get('/api/rooms', (req, res) => {
  const publicRooms = Array.from(rooms.values())
    .filter(r => !r.isPrivate && r.players.size < 4)
    .map(r => ({
      code: r.code,
      playerCount: r.players.size,
      maxPlayers: 4,
      stageIndex: r.stageIndex,
      hostName: r.players.get(r.hostId)?.state.name || 'Anfitrião',
    }));
  res.json({ rooms: publicRooms });
});

// Real User Directory for Friends
interface RegisteredUser {
  uid: string;
  friendCode: string;
  displayName: string;
  color: string;
  hat: string;
  lastSeen: number;
}
const registeredUsers = new Map<string, RegisteredUser>();

app.post('/api/users/register', (req, res) => {
  const { uid, friendCode, displayName, color, hat } = req.body || {};
  if (!friendCode || !displayName) {
    return res.status(400).json({ error: 'friendCode and displayName required' });
  }
  const cleanCode = String(friendCode).trim().toUpperCase();
  const user: RegisteredUser = {
    uid: uid || `u_${cleanCode}`,
    friendCode: cleanCode,
    displayName: String(displayName).trim().slice(0, 20),
    color: color || '#3b82f6',
    hat: hat || 'none',
    lastSeen: Date.now(),
  };
  registeredUsers.set(cleanCode, user);
  res.json({ ok: true, user });
});

app.get('/api/users/search', (req, res) => {
  const query = String(req.query.q || '').trim().toUpperCase();
  if (!query) {
    return res.json({ found: false, results: [] });
  }

  const exact = registeredUsers.get(query);
  if (exact) {
    return res.json({
      found: true,
      user: {
        ...exact,
        isOnline: Date.now() - exact.lastSeen < 15 * 60 * 1000,
      },
    });
  }

  const match = Array.from(registeredUsers.values()).find(
    u => u.displayName.toUpperCase() === query || u.friendCode.includes(query)
  );

  if (match) {
    return res.json({
      found: true,
      user: {
        ...match,
        isOnline: Date.now() - match.lastSeen < 15 * 60 * 1000,
      },
    });
  }

  res.json({ found: false });
});

// Real-Time Room Invites for Friends
interface RoomInvite {
  id: string;
  fromName: string;
  fromUid: string;
  toFriendCode: string;
  roomCode: string;
  stageIndex: number;
  timestamp: number;
}
const pendingInvites = new Map<string, RoomInvite[]>();

app.post('/api/invites/send', (req, res) => {
  const { fromName, fromUid, toFriendCode, roomCode, stageIndex } = req.body || {};
  if (!toFriendCode || !roomCode) {
    return res.status(400).json({ error: 'toFriendCode and roomCode required' });
  }
  const cleanCode = String(toFriendCode).trim().toUpperCase();
  const invite: RoomInvite = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fromName: String(fromName || 'Seu Amigo').slice(0, 25),
    fromUid: String(fromUid || ''),
    toFriendCode: cleanCode,
    roomCode: String(roomCode).trim().toUpperCase(),
    stageIndex: Number(stageIndex || 0),
    timestamp: Date.now(),
  };

  const current = pendingInvites.get(cleanCode) || [];
  const filtered = current.filter(i => Date.now() - i.timestamp < 10 * 60 * 1000);
  filtered.push(invite);
  pendingInvites.set(cleanCode, filtered);

  // Broadcast to active WebSocket clients
  const broadcastMsg = JSON.stringify({
    type: 'FRIEND_INVITE_RECEIVED',
    invite,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(broadcastMsg);
    }
  });

  res.json({ ok: true, invite });
});

app.get('/api/invites/:friendCode', (req, res) => {
  const cleanCode = String(req.params.friendCode || '').trim().toUpperCase();
  const list = pendingInvites.get(cleanCode) || [];
  const valid = list.filter(i => Date.now() - i.timestamp < 10 * 60 * 1000);
  pendingInvites.set(cleanCode, valid);
  res.json({ invites: valid });
});

app.delete('/api/invites/:friendCode/:inviteId', (req, res) => {
  const cleanCode = String(req.params.friendCode || '').trim().toUpperCase();
  const inviteId = req.params.inviteId;
  const list = pendingInvites.get(cleanCode) || [];
  const updated = list.filter(i => i.id !== inviteId);
  pendingInvites.set(cleanCode, updated);
  res.json({ ok: true });
});

// Multiplayer WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  anim: string;
  isGrounded: boolean;
  color: string;
  hat: string;
  face: string;
  lastPing: number;
}

interface Room {
  code: string;
  hostId: string;
  stageIndex: number;
  stageState: {
    activatedButtons: string[];
    doorStates: Record<string, boolean>;
    checkpointIndex: number;
  };
  players: Map<string, { ws: WebSocket; state: PlayerState }>;
  createdAt: number;
  isPrivate: boolean;
}

const rooms = new Map<string, Room>();
const usedRoomCodes = new Set<string>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code) || usedRoomCodes.has(code)) {
    return generateRoomCode();
  }
  usedRoomCodes.add(code);
  if (usedRoomCodes.size > 5000) {
    const first = usedRoomCodes.values().next().value;
    if (first) usedRoomCodes.delete(first);
  }
  return code;
}

function broadcastToRoom(room: Room, message: object, excludeId?: string) {
  const data = JSON.stringify(message);
  room.players.forEach((player, id) => {
    if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  let currentRoom: Room | null = null;
  let playerId: string | null = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'CREATE_ROOM': {
          const rawCode = (msg.roomCode && typeof msg.roomCode === 'string')
            ? msg.roomCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim()
            : '';

          // Only reconnect to an existing room if explicitly transitioning into game with matching code
          const existingRoom = (msg.isTransition && rawCode) ? rooms.get(rawCode) : null;
          const code = existingRoom ? rawCode : generateRoomCode();

          const currentPid = (msg.playerId as string) || `p_${Date.now()}`;
          playerId = currentPid;
          const isPrivate = !!msg.isPrivate;

          if (existingRoom) {
            // Room already exists during match transition: reconnect host
            existingRoom.hostId = currentPid;
            if (typeof msg.stageIndex === 'number') {
              existingRoom.stageIndex = msg.stageIndex;
            }

            const pState: PlayerState = {
              id: currentPid,
              name: msg.name || 'Jogador 1',
              x: 80,
              y: 400,
              vx: 0,
              vy: 0,
              facing: 1,
              anim: 'idle',
              isGrounded: true,
              color: msg.color || '#3b82f6',
              hat: msg.hat || 'none',
              face: msg.face || 'happy',
              lastPing: Date.now(),
            };

            existingRoom.players.set(currentPid, { ws, state: pState });
            currentRoom = existingRoom;

            const existingPlayers = Array.from(existingRoom.players.values()).map(p => p.state);

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode: code,
              playerId: currentPid,
              isHost: true,
              players: existingPlayers,
              stageIndex: existingRoom.stageIndex,
              stageState: existingRoom.stageState,
            }));

            broadcastToRoom(existingRoom, {
              type: 'PLAYER_JOINED',
              player: pState,
            }, currentPid);
          } else {
            const newRoom: Room = {
              code,
              hostId: currentPid,
              stageIndex: msg.stageIndex || 0,
              stageState: {
                activatedButtons: [],
                doorStates: {},
                checkpointIndex: 0,
              },
              players: new Map(),
              createdAt: Date.now(),
              isPrivate,
            };

            const pState: PlayerState = {
              id: currentPid,
              name: msg.name || 'Jogador 1',
              x: 80,
              y: 400,
              vx: 0,
              vy: 0,
              facing: 1,
              anim: 'idle',
              isGrounded: true,
              color: msg.color || '#3b82f6',
              hat: msg.hat || 'none',
              face: msg.face || 'happy',
              lastPing: Date.now(),
            };

            newRoom.players.set(currentPid, { ws, state: pState });
            rooms.set(code, newRoom);
            currentRoom = newRoom;

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode: code,
              playerId: currentPid,
              isHost: true,
              players: [pState],
              stageIndex: newRoom.stageIndex,
            }));
          }
          break;
        }

        case 'JOIN_ROOM': {
          const code = (msg.roomCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
          const targetRoom = rooms.get(code);

          if (!targetRoom || targetRoom.players.size === 0) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Sala não encontrada. Verifique se o código foi digitado corretamente!' }));
            return;
          }

          if (targetRoom.players.size >= 4) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Esta sala já está lotada (máx 4 jogadores).' }));
            return;
          }

          const currentPid = (msg.playerId as string) || `p_${Date.now()}`;
          playerId = currentPid;
          const pState: PlayerState = {
            id: currentPid,
            name: msg.name || `Jogador ${targetRoom.players.size + 1}`,
            x: 80 + targetRoom.players.size * 30,
            y: 400,
            vx: 0,
            vy: 0,
            facing: 1,
            anim: 'idle',
            isGrounded: true,
            color: msg.color || '#ec4899',
            hat: msg.hat || 'none',
            face: msg.face || 'happy',
            lastPing: Date.now(),
          };

          targetRoom.players.set(currentPid, { ws, state: pState });
          currentRoom = targetRoom;

          const existingPlayers = Array.from(targetRoom.players.values()).map(p => p.state);

          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            roomCode: code,
            playerId: currentPid,
            isHost: targetRoom.hostId === currentPid,
            players: existingPlayers,
            stageIndex: targetRoom.stageIndex,
            stageState: targetRoom.stageState,
          }));

          // Notify existing players
          broadcastToRoom(targetRoom, {
            type: 'PLAYER_JOINED',
            player: pState,
          }, currentPid);
          break;
        }

        case 'LIST_ROOMS': {
          const publicRooms = Array.from(rooms.values())
            .filter(r => !r.isPrivate && r.players.size < 4)
            .map(r => ({
              code: r.code,
              playerCount: r.players.size,
              maxPlayers: 4,
              stageIndex: r.stageIndex,
              hostName: r.players.get(r.hostId)?.state.name || 'Anfitrião',
            }));
          ws.send(JSON.stringify({ type: 'PUBLIC_ROOMS', rooms: publicRooms }));
          break;
        }

        case 'PLAYER_SYNC': {
          if (!currentRoom || !playerId) return;
          const p = currentRoom.players.get(playerId);
          if (p) {
            p.state.x = msg.x;
            p.state.y = msg.y;
            p.state.vx = msg.vx;
            p.state.vy = msg.vy;
            p.state.facing = msg.facing;
            p.state.anim = msg.anim;
            p.state.isGrounded = msg.isGrounded;
            p.state.lastPing = Date.now();

            // Broadcast movement to all other peers in room
            broadcastToRoom(currentRoom, {
              type: 'PLAYER_SYNC',
              playerId,
              x: msg.x,
              y: msg.y,
              vx: msg.vx,
              vy: msg.vy,
              facing: msg.facing,
              anim: msg.anim,
              isGrounded: msg.isGrounded,
            }, playerId);
          }
          break;
        }

        case 'PUZZLE_TRIGGER': {
          if (!currentRoom) return;
          const { triggerId, active, doorId, doorOpen, checkpointIndex, stageComplete } = msg;

          if (triggerId) {
            const list = currentRoom.stageState.activatedButtons;
            if (active && !list.includes(triggerId)) {
              list.push(triggerId);
            } else if (!active && list.includes(triggerId)) {
              currentRoom.stageState.activatedButtons = list.filter(id => id !== triggerId);
            }
          }

          if (doorId) {
            currentRoom.stageState.doorStates[doorId] = !!doorOpen;
          }

          if (typeof checkpointIndex === 'number') {
            currentRoom.stageState.checkpointIndex = Math.max(currentRoom.stageState.checkpointIndex, checkpointIndex);
          }

          if (stageComplete) {
            currentRoom.stageIndex++;
            currentRoom.stageState = {
              activatedButtons: [],
              doorStates: {},
              checkpointIndex: 0,
            };
          }

          broadcastToRoom(currentRoom, {
            type: 'PUZZLE_SYNC',
            triggerId,
            active,
            doorId,
            doorOpen,
            checkpointIndex,
            stageComplete,
            stageIndex: currentRoom.stageIndex,
            activatedButtons: currentRoom.stageState.activatedButtons,
            doorStates: currentRoom.stageState.doorStates,
          });
          break;
        }

        case 'EMOTE': {
          if (!currentRoom || !playerId) return;
          broadcastToRoom(currentRoom, {
            type: 'PLAYER_EMOTE',
            playerId,
            emote: msg.emote,
          });
          break;
        }

        case 'CHANGE_STAGE': {
          if (!currentRoom || currentRoom.hostId !== playerId) return;
          currentRoom.stageIndex = msg.stageIndex;
          currentRoom.stageState = {
            activatedButtons: [],
            doorStates: {},
            checkpointIndex: 0,
          };
          broadcastToRoom(currentRoom, {
            type: 'STAGE_CHANGED',
            stageIndex: currentRoom.stageIndex,
          });
          break;
        }

        case 'START_GAME': {
          if (!currentRoom || currentRoom.hostId !== playerId) return;
          broadcastToRoom(currentRoom, {
            type: 'GAME_START',
            stageIndex: currentRoom.stageIndex,
          });
          break;
        }

        case 'LEAVE_ROOM': {
          handleDisconnect();
          break;
        }
      }
    } catch (e) {
      console.error('Error parsing WS message:', e);
    }
  });

  const handleDisconnect = () => {
    if (currentRoom && playerId) {
      currentRoom.players.delete(playerId);
      const roomCode = currentRoom.code;

      if (currentRoom.players.size === 0) {
        // Retain empty room for 60 seconds grace period during lobby-to-canvas transitions
        setTimeout(() => {
          const r = rooms.get(roomCode);
          if (r && r.players.size === 0) {
            rooms.delete(roomCode);
          }
        }, 60000);
      } else {
        // Transfer host if host left
        if (currentRoom.hostId === playerId) {
          const nextHost = currentRoom.players.keys().next().value;
          if (nextHost) {
            currentRoom.hostId = nextHost;
            broadcastToRoom(currentRoom, {
              type: 'NEW_HOST',
              hostId: nextHost,
            });
          }
        }
        broadcastToRoom(currentRoom, {
          type: 'PLAYER_LEFT',
          playerId,
        });
      }
      currentRoom = null;
      playerId = null;
    }
  };

  ws.on('close', handleDisconnect);
  ws.on('error', handleDisconnect);
});

// Clean up stale rooms periodically
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, code) => {
    if (room.players.size === 0 || now - room.createdAt > 24 * 3600 * 1000) {
      rooms.delete(code);
    }
  });
}, 60000);

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In AI Studio preview environment, HMR is disabled and server uses custom WS on /ws
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Together Friends Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
