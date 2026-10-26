import { PlayerState, Stage, Rect } from '../types/game';
import { InputState, checkAABB } from './physics';

export interface StrategicThought {
  thought: string;
  tacticalGoal: string;
  targetX: number;
  targetY: number;
  shouldHold: boolean;
  advice: string;
  emote?: string;
}

export class AiBuddyController {
  private targetX: number = 0;
  private targetY: number = 0;
  private actionTimer: number = 0;
  private jumpCooldown: number = 0;
  private stuckTimer: number = 0;
  private lastX: number = 0;
  private lastY: number = 0;

  // Real-time Thinking state
  public currentThought: string = 'Pronto para cooperar!';
  public currentGoal: string = 'follow_player';
  public shouldHoldPlate: boolean = false;
  private lastThinkFetchTime: number = 0;
  private isThinkingNetwork: boolean = false;
  private currentStageId: string = '';
  private lastPlateStates: string = '';

  public reset(stage: Stage) {
    this.targetX = stage.spawnPointP2.x;
    this.targetY = stage.spawnPointP2.y;
    this.actionTimer = 0;
    this.jumpCooldown = 0;
    this.stuckTimer = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.currentThought = 'Pronto para a fase!';
    this.currentGoal = 'follow_player';
    this.shouldHoldPlate = false;
    this.currentStageId = stage.id;
    this.lastPlateStates = '';
  }

  public computeInput(
    buddy: PlayerState,
    player: PlayerState,
    stage: Stage,
    dt: number
  ): InputState {
    const input: InputState = {
      left: false,
      right: false,
      jump: false,
      justJumped: false,
      jumpReleased: false,
    };

    if (!buddy.isAlive) {
      this.currentThought = 'Opa! Renascendo...';
      return input;
    }

    if (this.currentStageId !== stage.id) {
      this.reset(stage);
    }

    this.jumpCooldown = Math.max(0, this.jumpCooldown - dt);
    this.actionTimer += dt;

    // Check if Beto is stuck against an obstacle
    if (Math.abs(buddy.x - this.lastX) < 1.5 && Math.abs(buddy.vx) < 20) {
      this.stuckTimer += dt;
    } else {
      this.stuckTimer = 0;
    }
    this.lastX = buddy.x;
    this.lastY = buddy.y;

    // 1. HIGH-LEVEL COOPERATIVE REASONING (State Machine & Stage Puzzle Solver)
    this.solveCooperativePuzzle(buddy, player, stage);

    // 2. TRIGGER GEMINI AI STRATEGIC REASONING (Asynchronous background fetch)
    this.checkTriggerGeminiThinking(buddy, player, stage);

    // Sync thought & emote to buddy player state
    buddy.thoughtText = this.currentThought;
    buddy.thoughtGoal = this.currentGoal;

    // 3. LOW-LEVEL PLATFORMING NAVIGATION & SMART PHYSICS CONTROLS
    this.applyPlatformingPhysics(buddy, stage, dt, input);

    return input;
  }

  /**
   * Evaluates the stage puzzle with human-level cooperative intelligence
   */
  private solveCooperativePuzzle(buddy: PlayerState, player: PlayerState, stage: Stage) {
    const closedDoors = stage.doors.filter(d => !d.isOpen);
    const allDoorsOpen = closedDoors.length === 0;

    // LEVEL 1 SPECIFIC PRECISION COOPERATIVE LOGIC:
    if (stage.id === 'stage_1') {
      const door1 = stage.doors.find(d => d.id === 'door_1');
      const door2 = stage.doors.find(d => d.id === 'door_2');
      const plate1 = stage.pressurePlates.find(pl => pl.id === 'plate_1');
      const plate2 = stage.pressurePlates.find(pl => pl.id === 'plate_2');

      const isDoor1Passable = Boolean(door1 && (door1.isOpen || (plate1 && plate1.isPressed) || (plate2 && plate2.isPressed)));
      const isDoor2Open = Boolean(door2 && (door2.isOpen || (plate2 && plate2.isPressed)));

      // Step 1: Beto is in Room 1 (x < 420).
      // He does NOT do everything alone! He politely waits by door 1 and asks the player to press button 1!
      if (buddy.x < 420) {
        if (!isDoor1Passable) {
          this.targetX = 360;
          this.targetY = 520;
          this.shouldHoldPlate = false;
          this.currentGoal = 'wait_for_player_plate1';
          this.currentThought = 'Pisa no botão azul pra eu passar! 👉';
          buddy.activeEmote = '👉';
          return;
        } else {
          // Player is pressing button 1 or door 1 is open: Beto rushes through towards Plate 2!
          this.targetX = 720;
          this.targetY = 448;
          this.shouldHoldPlate = false;
          this.currentGoal = 'cross_door_1';
          this.currentThought = 'Boa! Segura aí que tô passando! 🏃💨';
          buddy.activeEmote = '🏃';
          return;
        }
      }

      // Step 2: Beto has crossed Door 1 (buddy.x >= 420) into Room 2:
      // Beto immediately steps on Button 1B (plate_1_return at x: 600) to keep Door 1 OPEN for the player!
      const plate1Return = stage.pressurePlates.find(pl => pl.id === 'plate_1_return');
      const isPlayerPastDoor1 = player.x >= 560; // Player 1 safely across Door 1 into Room 2

      if (!isPlayerPastDoor1) {
        // Player is still crossing or on button 1! Beto steps on plate_1_return to hold Door 1 open!
        const returnPlateX = plate1Return ? (plate1Return.x + plate1Return.w / 2) : 600;
        this.targetX = returnPlateX;
        this.targetY = 568;

        const isBetoOnReturn = Math.abs((buddy.x + buddy.width / 2) - returnPlateX) < 26 && buddy.isGrounded;

        if (isBetoOnReturn) {
          this.shouldHoldPlate = true;
          this.currentGoal = 'hold_return_plate_for_player';
          this.currentThought = 'Passei! Tô no botão 1B pra você atravessar a porta! 🚪✨';
          buddy.activeEmote = '🚪';
        } else {
          this.shouldHoldPlate = false;
          this.currentGoal = 'reach_return_plate';
          this.currentThought = 'Indo no botão 1B para segurar a porta pra você! 👍';
          buddy.activeEmote = '🏃';
        }
        return;
      }

      // Step 3: Player 1 has safely crossed Door 1 into Room 2!
      // Now Beto climbs to ledge 2 and presses Button 2 (pink plate_2 at x: 720) to open Door 2!
      const isBetoOnPlate2 = Boolean(plate2 && Math.abs((buddy.x + buddy.width / 2) - (plate2.x + plate2.w / 2)) < 28 && buddy.isGrounded);
      const isPlayerPastDoor2 = player.x >= 920;

      if (!isPlayerPastDoor2) {
        this.targetX = 720;
        this.targetY = 448;

        if (isBetoOnPlate2) {
          this.shouldHoldPlate = true;
          this.currentGoal = 'hold_plate_2_for_player';
          this.currentThought = 'Apertei o botão rosa (2)! Passa pela porta 2! 🚪✨';
          buddy.activeEmote = '🚪';
        } else {
          this.shouldHoldPlate = false;
          this.currentGoal = 'reach_plate_2';
          this.currentThought = 'Subindo no botão rosa pra abrir a saída! 💡';
          buddy.activeEmote = '💡';
        }
        return;
      }

      // Step 4: Player 1 has crossed Door 2!
      // Beto releases and runs through Door 2 to the portal!
      this.targetX = stage.portal.x + 25;
      this.targetY = stage.portal.y + 40;
      this.shouldHoldPlate = false;
      this.currentGoal = 'go_to_portal';
      this.currentThought = 'Boa, você passou! Vamos juntos pro portal! 🌟';
      buddy.activeEmote = '⭐';
      return;
    }

    // GENERAL LEVEL COOPERATIVE STRATEGY (Stages 2..2000):

    // A. Dual Pressure Plates (e.g. Stage 3, 5, 8, 10):
    const dualPlates = stage.pressurePlates.filter(pl => pl.isDualRequired);
    if (dualPlates.length >= 2) {
      // Find which plate the player is closest to or already pressing
      let playerTargetPlate = dualPlates[0];
      let minPlayerDist = 999999;
      for (const dp of dualPlates) {
        const d = Math.abs(player.x - (dp.x + dp.w / 2));
        if (d < minPlayerDist) {
          minPlayerDist = d;
          playerTargetPlate = dp;
        }
      }

      // Buddy takes the OTHER plate
      const buddyTargetPlate = dualPlates.find(dp => dp.id !== playerTargetPlate.id) || dualPlates[1];
      this.targetX = buddyTargetPlate.x + buddyTargetPlate.w / 2;
      this.targetY = buddyTargetPlate.y;

      const isBetoOnDual = Math.abs((buddy.x + buddy.width / 2) - this.targetX) < 20 && Math.abs(buddy.y - this.targetY) < 30;
      if (isBetoOnDual) {
        this.shouldHoldPlate = true;
        this.currentGoal = 'hold_dual_plate';
        this.currentThought = `Segurando a placa ${buddyTargetPlate.label || 'B'}! Pisa na outra!`;
        buddy.activeEmote = '🎯';
      } else {
        this.shouldHoldPlate = false;
        this.currentGoal = 'reach_dual_plate';
        this.currentThought = `Indo para a placa ${buddyTargetPlate.label || 'B'}!`;
        buddy.activeEmote = '💡';
      }
      return;
    }

    // B. Closed Doors Blocking Path:
    if (closedDoors.length > 0) {
      // Find the first closed door that blocks players from reaching portal
      const firstDoor = closedDoors.sort((a, b) => a.x - b.x)[0];
      const triggerPlate = stage.pressurePlates.find(pl => pl.id === firstDoor.requiredTriggerId);

      // Case B1: Player is holding the trigger plate, so Door is OPEN!
      if (firstDoor.isOpen || (triggerPlate && triggerPlate.isPressed)) {
        if (buddy.x < firstDoor.x) {
          // Rush through the door!
          this.targetX = firstDoor.x + 120;
          this.targetY = firstDoor.y + 40;
          this.shouldHoldPlate = false;
          this.currentGoal = 'cross_open_door';
          this.currentThought = 'Porta aberta! Atravessando correndo!';
          buddy.activeEmote = '🏃';
          return;
        }
      }

      // Case B2: Door is CLOSED, and trigger plate is on Beto's side:
      if (triggerPlate && triggerPlate.x < firstDoor.x && buddy.x < firstDoor.x) {
        // If player is waiting near the door or needs Beto to open it:
        const playerNearDoor = Math.abs(player.x - firstDoor.x) < 180;
        if (playerNearDoor || player.x > triggerPlate.x + 40) {
          this.targetX = triggerPlate.x + triggerPlate.w / 2;
          this.targetY = triggerPlate.y;

          const onPlate = Math.abs((buddy.x + buddy.width / 2) - this.targetX) < 20;
          if (onPlate) {
            this.shouldHoldPlate = true;
            this.currentGoal = 'hold_door_plate';
            this.currentThought = 'Segurando o botão pra você passar pela porta!';
            buddy.activeEmote = '👍';
          } else {
            this.shouldHoldPlate = false;
            this.currentGoal = 'reach_door_plate';
            this.currentThought = 'Vou pisar no botão para abrir a porta!';
            buddy.activeEmote = '💡';
          }
          return;
        }
      }

      // Case B3: Door is CLOSED, Beto already passed door, and there is a switch to open it for player:
      if (buddy.x > firstDoor.x && triggerPlate) {
        this.targetX = triggerPlate.x + triggerPlate.w / 2;
        this.targetY = triggerPlate.y;
        this.shouldHoldPlate = true;
        this.currentGoal = 'hold_door_for_player';
        this.currentThought = 'Acionando o botão do outro lado pra você passar!';
        buddy.activeEmote = '👍';
        return;
      }
    }

    // C. All Blocking Doors are Open -> RUN TO PORTAL!
    if (allDoorsOpen || Math.abs(player.x - stage.portal.x) < 300) {
      this.targetX = stage.portal.x + 25;
      this.targetY = stage.portal.y + 40;
      this.shouldHoldPlate = false;
      this.currentGoal = 'go_to_portal';
      this.currentThought = 'Caminho livre! Rumo à vitória no portal!';
      buddy.activeEmote = '⭐';
      return;
    }

    // D. Follow Player with gentle offset
    this.shouldHoldPlate = false;
    this.currentGoal = 'follow_player';
    this.targetX = player.x > buddy.x ? player.x - 45 : player.x + 45;
    this.targetY = player.y;
    this.currentThought = 'Seguindo você, parceiro!';
  }

  /**
   * Calls server-side Gemini 3.8 Flash API endpoint asynchronously
   */
  private checkTriggerGeminiThinking(buddy: PlayerState, player: PlayerState, stage: Stage) {
    const currentPlateStateStr = stage.pressurePlates.map(p => `${p.id}:${p.isPressed}`).join(',');
    const plateChanged = currentPlateStateStr !== this.lastPlateStates;
    const now = Date.now();

    // Trigger thinking when state changes or every 5 seconds
    if ((plateChanged || now - this.lastThinkFetchTime > 5000) && !this.isThinkingNetwork) {
      this.lastPlateStates = currentPlateStateStr;
      this.lastThinkFetchTime = now;
      this.isThinkingNetwork = true;

      const payload = {
        stageIndex: Number(stage.id.replace(/\D/g, '')) - 1 || 0,
        stageName: stage.name,
        stageHint: stage.hint,
        player: { x: player.x, y: player.y, isGrounded: player.isGrounded },
        buddy: { x: buddy.x, y: buddy.y, isGrounded: buddy.isGrounded },
        doors: stage.doors.map(d => ({ id: d.id, x: d.x, y: d.y, isOpen: d.isOpen, requiredTriggerId: d.requiredTriggerId })),
        plates: stage.pressurePlates.map(p => ({ id: p.id, x: p.x, y: p.y, isPressed: p.isPressed, linkedDoorId: p.linkedDoorId, isDualRequired: p.isDualRequired, label: p.label })),
        hazards: stage.hazards.map(h => ({ type: h.type, x: h.x, w: h.w, isActive: h.isActive })),
        portal: { x: stage.portal.x, y: stage.portal.y },
      };

      fetch('/api/ai-buddy/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then((data: StrategicThought) => {
          if (data && data.thought) {
            this.currentThought = data.thought;
            if (data.emote) {
              buddy.activeEmote = data.emote;
              buddy.emoteTimer = 2.0;
            }
            if (typeof data.targetX === 'number' && data.tacticalGoal !== 'follow_player') {
              this.targetX = data.targetX;
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.isThinkingNetwork = false;
        });
    }
  }

  /**
   * Low-level 2D platforming physics navigation:
   * Handles precise horizontal movement, ledge jumps, chasm leaps, spring pads, and obstacle clearing.
   */
  private applyPlatformingPhysics(buddy: PlayerState, stage: Stage, dt: number, input: InputState) {
    const buddyCenterX = buddy.x + buddy.width / 2;
    const buddyFeetY = buddy.y + buddy.height;
    const dx = this.targetX - buddyCenterX;
    const dist = Math.abs(dx);

    // 1. Horizontal Movement
    if (this.shouldHoldPlate && dist < 14) {
      // Hold still on plate
      input.left = false;
      input.right = false;
    } else if (dist > 10) {
      if (dx > 0) {
        input.right = true;
        input.left = false;
      } else {
        input.left = true;
        input.right = false;
      }
    }

    // 2. Intelligent Jump Physics:
    if (!buddy.isGrounded) return;

    let wantsJump = false;

    // Check A: LEDGE CLIMBING
    // Is there a platform above Beto that he needs to climb onto?
    for (const p of stage.platforms) {
      // Platform top is higher than Beto's feet, but within jump height (up to 120px above feet)
      const heightDiff = buddyFeetY - p.y;
      if (heightDiff > 14 && heightDiff < 125) {
        // Platform is horizontally in front of Beto or Beto is right at its edge
        const inDirection = dx > 0 ? (p.x + p.w > buddyCenterX && p.x < buddyCenterX + 85) : (p.x < buddyCenterX && p.x + p.w > buddyCenterX - 85);
        // Is target on or past this platform?
        const targetRequiresPlatform = (dx > 0 && this.targetX >= p.x - 20) || (dx < 0 && this.targetX <= p.x + p.w + 20);

        if (inDirection && targetRequiresPlatform) {
          wantsJump = true;
          break;
        }
      }
    }

    // Check B: GAP / CHASM / HAZARD CLEARING
    // Probe ahead 35-50px in the movement direction
    const lookAheadX = dx > 0 ? buddyCenterX + 38 : buddyCenterX - 38;
    const groundProbeRect: Rect = {
      x: lookAheadX - 10,
      y: buddyFeetY + 8,
      w: 20,
      h: 24,
    };

    let hasGroundAhead = false;
    for (const p of stage.platforms) {
      if (checkAABB(groundProbeRect, p)) {
        hasGroundAhead = true;
        break;
      }
    }

    // If there is no ground directly ahead, check if there is a pit/hazard to jump over
    if (!hasGroundAhead && dist > 35) {
      // Look if there's a solid platform across the gap within 230px
      const landingProbeX = dx > 0 ? buddyCenterX + 120 : buddyCenterX - 120;
      let hasLandingAhead = false;
      for (const p of stage.platforms) {
        if (landingProbeX >= p.x && landingProbeX <= p.x + p.w && Math.abs(p.y - buddyFeetY) < 60) {
          hasLandingAhead = true;
          break;
        }
      }
      if (hasLandingAhead || dist > 80) {
        wantsJump = true;
      }
    }

    // Check C: SPRING PADS
    // If a spring pad is on the floor right ahead and target is high up
    for (const sp of stage.springs) {
      if (Math.abs(buddyCenterX - (sp.x + sp.w / 2)) < 30 && (this.targetY < buddy.y - 60 || wantsJump)) {
        // Walking onto the spring will launch Beto automatically!
      }
    }

    // Check D: HAZARDS DIRECTLY IN FRONT (Spikes, Lava)
    for (const hz of stage.hazards) {
      if (hz.isActive) {
        const hazardDistance = dx > 0 ? (hz.x - (buddy.x + buddy.width)) : (buddy.x - (hz.x + hz.w));
        if (hazardDistance > -10 && hazardDistance < 45 && Math.abs(buddyFeetY - (hz.y + 10)) < 40) {
          wantsJump = true;
          break;
        }
      }
    }

    // Check E: ANTI-STUCK JUMP
    // If Beto has been trying to move horizontally for > 0.6s but is not moving
    if (this.stuckTimer > 0.6) {
      wantsJump = true;
      this.stuckTimer = 0;
    }

    // Execute jump with proper cooldown
    if (wantsJump && this.jumpCooldown <= 0) {
      input.jump = true;
      input.justJumped = true;
      this.jumpCooldown = 0.38; // 380ms cooldown for smooth fluid platforming
    }
  }
}
