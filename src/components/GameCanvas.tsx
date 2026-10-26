import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlayerState, Stage, GameMode, UserProfile } from '../types/game';
import { STAGES } from '../game/levels';
import { PhysicsEngine, InputState } from '../game/physics';
import { GameRenderer } from '../game/renderer';
import { AiBuddyController } from '../game/aiBuddy';
import { sound } from '../services/audio';
import { authService } from '../services/auth';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';

interface GameCanvasProps {
  mode: GameMode;
  userProfile: UserProfile;
  roomCode: string | null;
  isHost: boolean;
  initialStageIndex?: number;
  onExit: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  userProfile,
  roomCode,
  isHost,
  initialStageIndex = 0,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stage state
  const [stageIndex, setStageIndex] = useState(initialStageIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [coinsCollectedCount, setCoinsCollectedCount] = useState(0);
  const [buddyThought, setBuddyThought] = useState<string>('Pronto para cooperar!');
  const lastThoughtRef = useRef<string>('');
  const thoughtSyncTimerRef = useRef(0);

  // Engine references
  const physicsRef = useRef(new PhysicsEngine());
  const rendererRef = useRef(new GameRenderer());
  const buddyAiRef = useRef(new AiBuddyController());

  // Input states
  const p1InputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    justJumped: false,
    jumpReleased: false,
  });

  const p2InputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    justJumped: false,
    jumpReleased: false,
  });

  // Players
  const playersRef = useRef<PlayerState[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize Stage Players
  const initStage = useCallback((sIndex: number) => {
    const stage = STAGES[sIndex] || STAGES[0];
    const isLocal2P = mode === 'local_2p';
    const isSoloBot = mode === 'solo_bot';

    // Player 1
    const p1: PlayerState = {
      id: 'p1_local',
      name: userProfile.displayName || 'Jogador 1',
      x: stage.spawnPointP1.x,
      y: stage.spawnPointP1.y,
      vx: 0,
      vy: 0,
      facing: 1,
      width: 32,
      height: 44,
      isGrounded: true,
      anim: 'idle',
      animTimer: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      customization: { ...userProfile.customization },
      isAlive: true,
      respawnTimer: 0,
      atGoal: false,
    };

    const newPlayers: PlayerState[] = [p1];

    if (isLocal2P) {
      // Local 2nd player
      const p2: PlayerState = {
        id: 'p2_local',
        name: 'Jogador 2',
        x: stage.spawnPointP2.x,
        y: stage.spawnPointP2.y,
        vx: 0,
        vy: 0,
        facing: 1,
        width: 32,
        height: 44,
        isGrounded: true,
        anim: 'idle',
        animTimer: 0,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        customization: {
          name: 'Jogador 2',
          color: '#ec4899',
          secondaryColor: '#fbcfe8',
          hat: 'beanie',
          face: 'cheerful',
        },
        isAlive: true,
        respawnTimer: 0,
        atGoal: false,
      };
      newPlayers.push(p2);
    } else if (isSoloBot) {
      // Beto AI Companion (Gemini Powered)
      const buddy: PlayerState = {
        id: 'buddy_ai',
        name: 'Beto (IA)',
        x: stage.spawnPointP2.x,
        y: stage.spawnPointP2.y,
        vx: 0,
        vy: 0,
        facing: 1,
        width: 32,
        height: 44,
        isGrounded: true,
        anim: 'idle',
        animTimer: 0,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        customization: {
          name: 'Beto',
          color: '#8b5cf6',
          secondaryColor: '#c4b5fd',
          hat: 'headphones',
          face: 'cool',
        },
        isAlive: true,
        respawnTimer: 0,
        atGoal: false,
        thoughtText: 'Pronto para cooperar!',
      };
      newPlayers.push(buddy);
      buddyAiRef.current.reset(stage);
    }

    // Reset stage interactables
    stage.portal.playersInside = [];
    (stage.portal as any).hasTriggeredVictory = false;
    stage.checkpoints.forEach(cp => { cp.isReached = false; });
    stage.pressurePlates.forEach(pl => { pl.isPressed = false; });
    stage.doors.forEach(d => {
      d.isOpen = false;
      d.currentOffset = 0;
      d.isUnlockedPermanently = false;
    });
    if (stage.coins) {
      stage.coins.forEach(c => { c.isCollected = false; });
    }

    playersRef.current = newPlayers;
    setShowVictory(false);
    setCoinsCollectedCount(0);
  }, [mode, userProfile]);

  // Handle stage change
  useEffect(() => {
    initStage(stageIndex);
  }, [stageIndex, initStage]);

  // Audio start on mount
  useEffect(() => {
    sound.startMusic();
    return () => {
      sound.stopMusic();
    };
  }, []);

  const stageIndexRef = useRef(stageIndex);
  stageIndexRef.current = stageIndex;

  // Online WebSocket Connection Setup
  useEffect(() => {
    if (mode !== 'online_multiplayer' || !roomCode) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isHost) {
        ws.send(JSON.stringify({
          type: 'CREATE_ROOM',
          roomCode,
          name: userProfile.displayName,
          color: userProfile.customization.color,
          hat: userProfile.customization.hat,
          stageIndex: stageIndexRef.current,
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomCode,
          name: userProfile.displayName,
          color: userProfile.customization.color,
          hat: userProfile.customization.hat,
        }));
      }
    };

    ws.onerror = () => {
      // Gracefully handle any transient socket disconnection
    };

    ws.onclose = () => {
      // Graceful close
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const stage = STAGES[stageIndexRef.current];

        switch (msg.type) {
          case 'ROOM_CREATED':
          case 'ROOM_JOINED': {
            if (msg.playerId && playersRef.current[0]) {
              playersRef.current[0].id = msg.playerId;
            }
            if (Array.isArray(msg.players)) {
              msg.players.forEach((pData: any) => {
                if (pData.id !== msg.playerId && pData.id !== 'p1_local' && !playersRef.current.some(p => p.id === pData.id)) {
                  playersRef.current.push({
                    id: pData.id,
                    name: pData.name,
                    x: pData.x,
                    y: pData.y,
                    vx: pData.vx || 0,
                    vy: pData.vy || 0,
                    facing: pData.facing || 1,
                    width: 32,
                    height: 44,
                    isGrounded: pData.isGrounded ?? true,
                    anim: pData.anim || 'idle',
                    animTimer: 0,
                    coyoteTimer: 0,
                    jumpBufferTimer: 0,
                    customization: {
                      name: pData.name,
                      color: pData.color || '#ec4899',
                      secondaryColor: '#fbcfe8',
                      hat: pData.hat || 'none',
                      face: pData.face || 'happy',
                    },
                    isAlive: true,
                    respawnTimer: 0,
                    atGoal: false,
                  });
                }
              });
            }
            if (msg.stageIndex !== undefined && msg.stageIndex !== stageIndexRef.current) {
              setStageIndex(msg.stageIndex);
            }
            break;
          }

          case 'STAGE_CHANGED': {
            if (msg.stageIndex !== undefined && msg.stageIndex !== stageIndexRef.current) {
              setStageIndex(msg.stageIndex);
            }
            break;
          }

          case 'PLAYER_JOINED': {
            const remoteP: PlayerState = {
              id: msg.player.id,
              name: msg.player.name,
              x: msg.player.x,
              y: msg.player.y,
              vx: 0,
              vy: 0,
              facing: msg.player.facing || 1,
              width: 32,
              height: 44,
              isGrounded: true,
              anim: 'idle',
              animTimer: 0,
              coyoteTimer: 0,
              jumpBufferTimer: 0,
              customization: {
                name: msg.player.name,
                color: msg.player.color || '#ec4899',
                secondaryColor: '#fbcfe8',
                hat: msg.player.hat || 'none',
                face: msg.player.face || 'happy',
              },
              isAlive: true,
              respawnTimer: 0,
              atGoal: false,
            };
            if (!playersRef.current.some(p => p.id === remoteP.id)) {
              playersRef.current.push(remoteP);
            }
            break;
          }

          case 'PLAYER_SYNC': {
            const p = playersRef.current.find(item => item.id === msg.playerId);
            if (p) {
              p.x = msg.x;
              p.y = msg.y;
              p.vx = msg.vx;
              p.vy = msg.vy;
              p.facing = msg.facing;
              p.anim = msg.anim;
              p.isGrounded = msg.isGrounded;
            }
            break;
          }

          case 'PUZZLE_SYNC': {
            if (stage) {
              if (msg.triggerId) {
                const plate = stage.pressurePlates.find(pl => pl.id === msg.triggerId);
                if (plate) {
                  plate.isPressed = msg.active;
                }
              }
              if (msg.doorId) {
                const door = stage.doors.find(d => d.id === msg.doorId);
                if (door) {
                  door.isOpen = !!msg.doorOpen;
                }
              }
              if (typeof msg.checkpointIndex === 'number') {
                const cp = stage.checkpoints.find(c => c.index === msg.checkpointIndex);
                if (cp) {
                  cp.isReached = true;
                }
              }
              if (msg.coinCollectedId && stage.coins) {
                const coin = stage.coins.find(c => c.id === msg.coinCollectedId);
                if (coin && !coin.isCollected) {
                  coin.isCollected = true;
                  sound.playCoin();
                  authService.addCoins(1);
                  setCoinsCollectedCount(c => c + 1);
                  rendererRef.current.addConfetti(coin.x + 12, coin.y + 12, 10);
                }
              }
            }
            if (msg.stageComplete) {
              setShowVictory(true);
              rendererRef.current.addConfetti(stage.portal.x + stage.portal.w / 2, stage.portal.y);
              authService.recordStageCompleted(stageIndexRef.current);
            }
            break;
          }

          case 'PLAYER_EMOTE': {
            const p = playersRef.current.find(item => item.id === msg.playerId);
            if (p) {
              p.activeEmote = msg.emote;
              p.emoteTimer = 2.5;
            }
            break;
          }

          case 'PLAYER_LEFT': {
            playersRef.current = playersRef.current.filter(p => p.id !== msg.playerId);
            break;
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [mode, roomCode, isHost, userProfile.displayName, userProfile.customization.color, userProfile.customization.hat]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }

      // Player 1: WASD / Space
      if (e.code === 'KeyA') p1InputRef.current.left = true;
      if (e.code === 'KeyD') p1InputRef.current.right = true;
      if (e.code === 'Space' || e.code === 'KeyW') {
        if (!p1InputRef.current.jump) {
          p1InputRef.current.justJumped = true;
          authService.incrementJumps();
        }
        p1InputRef.current.jump = true;
      }

      // Player 2: Arrows / Enter / Numpad 0
      if (mode === 'local_2p') {
        if (e.code === 'ArrowLeft') p2InputRef.current.left = true;
        if (e.code === 'ArrowRight') p2InputRef.current.right = true;
        if (e.code === 'ArrowUp' || e.code === 'Enter' || e.code === 'Numpad0') {
          if (!p2InputRef.current.jump) {
            p2InputRef.current.justJumped = true;
          }
          p2InputRef.current.jump = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA') p1InputRef.current.left = false;
      if (e.code === 'KeyD') p1InputRef.current.right = false;
      if (e.code === 'Space' || e.code === 'KeyW') {
        p1InputRef.current.jump = false;
        p1InputRef.current.jumpReleased = true;
      }

      if (mode === 'local_2p') {
        if (e.code === 'ArrowLeft') p2InputRef.current.left = false;
        if (e.code === 'ArrowRight') p2InputRef.current.right = false;
        if (e.code === 'ArrowUp' || e.code === 'Enter' || e.code === 'Numpad0') {
          p2InputRef.current.jump = false;
          p2InputRef.current.jumpReleased = true;
        }
      }
    };

    const handleBlur = () => {
      p1InputRef.current = { left: false, right: false, jump: false, justJumped: false, jumpReleased: false };
      p2InputRef.current = { left: false, right: false, jump: false, justJumped: false, jumpReleased: false };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [mode]);

  // Touch Controls Callback
  const handleTouchInput = (action: 'left' | 'right' | 'jump' | 'jumpRelease', active: boolean) => {
    if (action === 'left') p1InputRef.current.left = active;
    if (action === 'right') p1InputRef.current.right = active;
    if (action === 'jump') {
      p1InputRef.current.jump = true;
      p1InputRef.current.justJumped = true;
      authService.incrementJumps();
    }
    if (action === 'jumpRelease') {
      p1InputRef.current.jump = false;
      p1InputRef.current.jumpReleased = true;
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let networkSyncTimer = 0;

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta to 50ms

      const stage = STAGES[stageIndex] || STAGES[0];
      const players = playersRef.current;

      // Ensure canvas matches viewport
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        rendererRef.current.resize(window.innerWidth, window.innerHeight);
      }

      if (!isPaused && players.length > 0) {
        // 1. Update Moving Platforms, Doors & Hazards
        physicsRef.current.updateMovingPlatforms(stage, dt, players);

        // 2. Update Player 1 (Local)
        const p1 = players[0];
        if (p1) {
          physicsRef.current.updatePlayer(
            p1,
            p1InputRef.current,
            dt,
            stage,
            players.filter(p => p.id !== p1.id),
            (triggerId, active) => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'PUZZLE_TRIGGER', triggerId, active }));
              }
            },
            (cpIndex) => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'PUZZLE_TRIGGER', checkpointIndex: cpIndex }));
              }
            },
            () => {
              setShowVictory(true);
              rendererRef.current.addConfetti(stage.portal.x + stage.portal.w / 2, stage.portal.y);
              authService.recordStageCompleted(stageIndex);
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'PUZZLE_TRIGGER', stageComplete: true }));
              }
            },
            (coinId) => {
              authService.addCoins(1);
              setCoinsCollectedCount(c => c + 1);
              const foundCoin = stage.coins?.find(c => c.id === coinId);
              if (foundCoin) {
                rendererRef.current.addConfetti(foundCoin.x + 12, foundCoin.y + 12, 10);
              }
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'PUZZLE_TRIGGER', coinCollectedId: coinId }));
              }
            }
          );
        }

        // 3. Update Player 2 (Local 2P or AI Buddy)
        if (mode === 'local_2p' && players[1]) {
          const p2 = players[1];
          physicsRef.current.updatePlayer(
            p2,
            p2InputRef.current,
            dt,
            stage,
            [p1],
            () => {},
            () => {},
            () => {
              setShowVictory(true);
              rendererRef.current.addConfetti(stage.portal.x + stage.portal.w / 2, stage.portal.y);
              authService.recordStageCompleted(stageIndex);
            },
            (coinId) => {
              authService.addCoins(1);
              setCoinsCollectedCount(c => c + 1);
              const foundCoin = stage.coins?.find(c => c.id === coinId);
              if (foundCoin) {
                rendererRef.current.addConfetti(foundCoin.x + 12, foundCoin.y + 12, 10);
              }
            }
          );
        } else if (mode === 'solo_bot' && players[1]) {
          const buddy = players[1];
          const buddyInput = buddyAiRef.current.computeInput(buddy, p1, stage, dt);
          physicsRef.current.updatePlayer(
            buddy,
            buddyInput,
            dt,
            stage,
            [p1],
            () => {},
            () => {},
            () => {
              setShowVictory(true);
              rendererRef.current.addConfetti(stage.portal.x + stage.portal.w / 2, stage.portal.y);
              authService.recordStageCompleted(stageIndex);
            },
            (coinId) => {
              authService.addCoins(1);
              setCoinsCollectedCount(c => c + 1);
              const foundCoin = stage.coins?.find(c => c.id === coinId);
              if (foundCoin) {
                rendererRef.current.addConfetti(foundCoin.x + 12, foundCoin.y + 12, 10);
              }
            }
          );

          // Sync Beto's thoughts to React state for GameHUD
          thoughtSyncTimerRef.current += dt;
          if (thoughtSyncTimerRef.current > 0.25) {
            thoughtSyncTimerRef.current = 0;
            const text = buddy.thoughtText || '';
            if (text !== lastThoughtRef.current) {
              lastThoughtRef.current = text;
              setBuddyThought(text);
            }
          }
        }

        // Reset edge-triggered jump flags
        p1InputRef.current.justJumped = false;
        p1InputRef.current.jumpReleased = false;
        p2InputRef.current.justJumped = false;
        p2InputRef.current.jumpReleased = false;

        // 4. Send Online WebSocket Sync
        if (mode === 'online_multiplayer' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          networkSyncTimer += dt;
          if (networkSyncTimer >= 0.033) { // ~30Hz sync
            networkSyncTimer = 0;
            wsRef.current.send(JSON.stringify({
              type: 'PLAYER_SYNC',
              x: p1.x,
              y: p1.y,
              vx: p1.vx,
              vy: p1.vy,
              facing: p1.facing,
              anim: p1.anim,
              isGrounded: p1.isGrounded,
            }));
          }
        }

        // 5. Update Camera
        rendererRef.current.updateCamera(players, stage, dt);
      }

      // 6. Render World & Players
      rendererRef.current.render(ctx, stage, players, dt);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [stageIndex, isPaused, mode]);

  const handleRestartStage = () => {
    initStage(stageIndex);
    setIsPaused(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CHANGE_STAGE', stageIndex }));
    }
  };

  const handleNextStage = () => {
    if (stageIndex + 1 < STAGES.length) {
      const nextIdx = stageIndex + 1;
      setStageIndex(nextIdx);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'CHANGE_STAGE', stageIndex: nextIdx }));
      }
    }
  };

  const handleSendEmote = (emote: string) => {
    if (playersRef.current[0]) {
      playersRef.current[0].activeEmote = emote;
      playersRef.current[0].emoteTimer = 2.5;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'EMOTE', emote }));
    }
  };

  const handleCallBuddy = () => {
    sound.playEmote();
    handleSendEmote('👋');
    // If buddy exists, teleport or run over
    const buddy = playersRef.current.find(p => p.id === 'buddy_ai');
    const p1 = playersRef.current[0];
    if (buddy && p1) {
      buddy.activeEmote = '⚡';
      buddy.emoteTimer = 2.0;
    }
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 2D Viewport Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-default"
      />

      {/* Game HUD */}
      <GameHUD
        stage={STAGES[stageIndex] || STAGES[0]}
        stageIndex={stageIndex}
        totalStages={STAGES.length}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(prev => !prev)}
        onRestartStage={handleRestartStage}
        onExitToMenu={onExit}
        onNextStage={handleNextStage}
        showVictoryModal={showVictory}
        roomCode={roomCode}
        onSendEmote={handleSendEmote}
        coinsCollected={coinsCollectedCount}
        buddyThought={buddyThought}
        isSoloBot={mode === 'solo_bot'}
      />

      {/* Touch Controls for Mobile */}
      <TouchControls
        settings={userProfile.settings}
        onInput={handleTouchInput}
        onEmotePress={() => handleSendEmote('❤️')}
        onCallBuddy={handleCallBuddy}
        hasBuddy={mode === 'solo_bot'}
      />
    </div>
  );
};
