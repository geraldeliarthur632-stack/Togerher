import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Home, Sparkles, Copy, Check, Smile, Music2, Smartphone } from 'lucide-react';
import { Stage, CustomTouchControlsLayout } from '../types/game';
import { sound } from '../services/audio';
import { authService } from '../services/auth';
import { copyToClipboard } from '../utils/clipboard';
import { TouchControlsCustomizerModal } from './TouchControlsCustomizerModal';

interface GameHUDProps {
  stage: Stage;
  stageIndex: number;
  totalStages: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestartStage: () => void;
  onExitToMenu: () => void;
  onNextStage?: () => void;
  showVictoryModal: boolean;
  roomCode?: string | null;
  onSendEmote: (emote: string) => void;
  coinsCollected?: number;
  buddyThought?: string;
  isSoloBot?: boolean;
  lastVictoryXp?: {
    xpEarned: number;
    baseXp: number;
    bonusXp: number;
    leveledUp: boolean;
    newLevel: number;
    currentXp: number;
    nextLevelXp: number;
  } | null;
}

const EMOTE_OPTIONS = ['👋', '👍', '❤️', '⚡', '🏃', '❓'];

export const GameHUD: React.FC<GameHUDProps> = ({
  stage,
  stageIndex,
  totalStages,
  isPaused,
  onTogglePause,
  onRestartStage,
  onExitToMenu,
  onNextStage,
  showVictoryModal,
  roomCode,
  onSendEmote,
  coinsCollected = 0,
  buddyThought,
  isSoloBot,
  lastVictoryXp,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [showControlsCustomizer, setShowControlsCustomizer] = useState(false);
  const [copied, setCopied] = useState(false);
  const totalCoinsInStage = stage.coins?.length || 0;

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCode = async () => {
    if (roomCode) {
      const ok = await copyToClipboard(roomCode);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const [orientationMode, setOrientationMode] = useState<'landscape' | 'portrait'>(() => {
    return typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  });
  const [orientationMsg, setOrientationMsg] = useState<string | null>(null);

  const handleToggleOrientation = async () => {
    sound.playJump();
    const nextMode = orientationMode === 'landscape' ? 'portrait' : 'landscape';
    setOrientationMode(nextMode);

    try {
      if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock(nextMode);
      }
    } catch {
      // Screen orientation lock may require fullscreen or user gesture
    }

    const msg = nextMode === 'landscape' ? '🎮 Modo Deitado (Paisagem) ativado' : '📱 Modo Em Pé (Retrato) ativado';
    setOrientationMsg(msg);
    setTimeout(() => setOrientationMsg(null), 2500);
  };

  return (
    <>
      {/* Top HUD Cluster */}
      <div className="fixed top-0 inset-x-0 pointer-events-none z-30 p-3 sm:p-4 flex justify-between items-start font-['Fredoka',sans-serif]">
        {/* Stage Title, Objective Hint & Beto AI Thinking Card */}
        <div className="pointer-events-auto flex flex-col gap-1.5 max-w-sm sm:max-w-md">
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-sky-200 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-sky-500 px-2 py-0.5 rounded-full shadow-sm">
                Fase {stageIndex + 1}/{totalStages}
              </span>
              <h1 className="text-xs sm:text-sm font-black text-sky-950 truncate">{stage.name}</h1>
              {totalCoinsInStage > 0 && (
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0">
                  <span>🪙</span>
                  <span>{coinsCollected}/{totalCoinsInStage}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {stage.hint}
            </p>
          </div>

          {/* Beto AI Live Strategic Thinking Card */}
          {isSoloBot && buddyThought && (
            <div className="bg-gradient-to-r from-purple-600/95 to-indigo-600/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-purple-300 text-white shadow-lg flex items-center gap-2.5 transition-all">
              <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-xs shrink-0 shadow-inner font-black">
                🤖
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-200">
                    Beto (IA Gemini)
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                  "{buddyThought}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Room Code */}
        <div className="pointer-events-auto flex items-center gap-2">
          {roomCode && (
            <button
              onClick={handleCopyCode}
              className="bg-white/90 border-2 border-sky-300 text-sky-900 px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 shadow-sm hover:bg-sky-50 transition cursor-pointer"
              title="Copiar Código da Sala"
            >
              <span>SALA: {roomCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Emote wheel toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmotePicker(!showEmotePicker)}
              className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-sky-200 shadow-sm flex items-center justify-center transition cursor-pointer"
              title="Enviar Reação"
            >
              <Smile className="w-5 h-5 text-pink-500" />
            </button>

            {showEmotePicker && (
              <div className="absolute right-0 top-12 bg-white border-2 border-sky-200 p-2 rounded-2xl shadow-xl flex gap-1 z-40">
                {EMOTE_OPTIONS.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      onSendEmote(em);
                      setShowEmotePicker(false);
                      sound.playEmote();
                    }}
                    className="w-8 h-8 rounded-xl hover:bg-sky-100 flex items-center justify-center text-lg hover:scale-110 transition cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Orientation Toggle: Deitado (Paisagem) / Em pé (Retrato) */}
          <button
            onClick={handleToggleOrientation}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-sky-700 border-2 border-sky-200 shadow-sm flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95"
            title={orientationMode === 'landscape' ? 'Girar para Em Pé (Retrato)' : 'Girar para Deitado (Paisagem)'}
          >
            <Smartphone className={`w-5 h-5 transition-transform duration-300 ${orientationMode === 'landscape' ? 'rotate-90 text-blue-600' : 'text-emerald-600'}`} />
          </button>

          {/* In-Game Soundtrack Skip */}
          <button
            onClick={() => {
              const next = sound.nextTrack();
              sound.playJump();
            }}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-purple-600 border-2 border-purple-200 shadow-sm flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95"
            title={`Música Atual: ${sound.getCurrentTrack().name} (Clique para próxima trilha)`}
          >
            <Music2 className="w-5 h-5 animate-pulse" />
          </button>

          {/* Mute button */}
          <button
            onClick={toggleSound}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-sky-200 shadow-sm flex items-center justify-center transition cursor-pointer"
            title={isMuted ? 'Ativar Som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>

          {/* Pause button */}
          <button
            onClick={onTogglePause}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-sky-200 shadow-sm flex items-center justify-center transition cursor-pointer"
            title="Pausar"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orientation Feedback Toast */}
      {orientationMsg && (
        <div className="fixed top-16 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-bounce">
          <div className="bg-sky-900/90 backdrop-blur-md text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl border border-sky-400 flex items-center gap-2">
            <Smartphone className={`w-4 h-4 ${orientationMode === 'landscape' ? 'rotate-90 text-amber-300' : 'text-emerald-300'}`} />
            <span>{orientationMsg}</span>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
          <div className="bg-white border-2 border-sky-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-center text-slate-800">
            <h2 className="text-2xl font-black text-sky-950">Jogo Pausado</h2>
            <p className="text-xs text-slate-500 font-medium">Respire um pouco ou recomece a fase</p>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={onTogglePause}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Play className="w-5 h-5" />
                Continuar
              </button>

              <button
                onClick={onRestartStage}
                className="w-full py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar Fase
              </button>

              <button
                onClick={() => setShowControlsCustomizer(true)}
                className="w-full py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>🎮</span>
                Ajustar Botões na Tela
              </button>

              <button
                onClick={onExitToMenu}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Sair para o Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch Controls Customizer Modal */}
      <TouchControlsCustomizerModal
        isOpen={showControlsCustomizer}
        onClose={() => setShowControlsCustomizer(false)}
        initialLayout={authService.getProfile().settings.customTouchLayout}
        hasBuddy={isSoloBot}
        onSave={(layout: CustomTouchControlsLayout) => {
          try {
            localStorage.setItem('together_touch_controls_layout', JSON.stringify(layout));
          } catch (e) {
            console.warn(e);
          }
          authService.updateProfile({
            settings: {
              ...authService.getProfile().settings,
              customTouchLayout: layout,
              touchControlsOpacity: layout.opacity,
            },
          });
        }}
      />

      {/* Victory / Stage Clear Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-4 font-['Fredoka',sans-serif]">
          <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-4 text-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-8 h-8 text-amber-950 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 block mb-1">
                ★ VITÓRIA COOPERATIVA! ★
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-sky-950">Trabalho em Equipe Perfeito!</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Vocês atravessaram os obstáculos e alcançaram o portal juntos!
              </p>

              {/* REWARDS: COIN AND XP BADGES */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 shadow-sm text-xs font-black">
                  <span>🪙</span>
                  <span>+1 MOEDA DA LOJA</span>
                </div>

                {lastVictoryXp && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 shadow-sm text-xs font-black">
                    <span>⚡</span>
                    <span>+{lastVictoryXp.xpEarned} XP</span>
                    {lastVictoryXp.bonusXp > 0 && (
                      <span className="text-[10px] text-purple-700 bg-white/70 px-1.5 py-0.5 rounded-md font-bold">
                        (+{lastVictoryXp.bonusXp} bônus grupo)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* LEVEL UP CELEBRATION BANNER */}
              {lastVictoryXp?.leveledUp && (
                <div className="mt-2.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-2.5 rounded-2xl shadow-md border-2 border-white animate-pulse">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                    🎉 PARABÉNS! VOCÊ SUBIU DE NÍVEL!
                  </div>
                  <div className="text-base font-black">
                    Agora você é NÍVEL {lastVictoryXp.newLevel}!
                  </div>
                  <div className="text-[11px] text-white/90">
                    Próximo nível requer {lastVictoryXp.nextLevelXp} XP (dobra a cada nível!)
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-2">
              {onNextStage && stageIndex + 1 < totalStages ? (
                <button
                  onClick={onNextStage}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base shadow-lg transition cursor-pointer"
                >
                  Próxima Fase ({stageIndex + 2}/{totalStages}) →
                </button>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-xs font-bold">
                  Parabéns! Todas as fases foram concluídas com sucesso!
                </div>
              )}

              <button
                onClick={onExitToMenu}
                className="w-full py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs transition cursor-pointer"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
