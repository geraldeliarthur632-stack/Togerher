import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Smile, Users } from 'lucide-react';
import { GameSettings, CustomTouchControlsLayout } from '../types/game';
import { DEFAULT_TOUCH_LAYOUT } from './TouchControlsCustomizerModal';

interface TouchControlsProps {
  settings: GameSettings;
  onInput: (action: 'left' | 'right' | 'jump' | 'jumpRelease', active: boolean) => void;
  onEmotePress: () => void;
  onCallBuddy?: () => void;
  hasBuddy?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  settings,
  onInput,
  onEmotePress,
  onCallBuddy,
  hasBuddy,
}) => {
  const leftActive = useRef(false);
  const rightActive = useRef(false);

  // Load custom layout from settings or localStorage
  const customLayout: CustomTouchControlsLayout = (() => {
    if (settings.customTouchLayout) return settings.customTouchLayout;
    try {
      const saved = localStorage.getItem('together_touch_controls_layout');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_TOUCH_LAYOUT;
  })();

  if (!settings.showTouchControls) return null;

  const opacity = customLayout.opacity ?? settings.touchControlsOpacity ?? 0.85;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden touch-none"
      style={{ opacity }}
    >
      {/* 1. D-PAD BUTTONS (LEFT / RIGHT) */}
      <div
        className="pointer-events-auto absolute flex items-center bg-slate-900/75 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-2 gap-2.5"
        style={{
          left: `${customLayout.dpad.x}%`,
          top: `${customLayout.dpad.y}%`,
          transform: `translate(-50%, -50%) scale(${customLayout.dpad.scale})`,
        }}
      >
        <button
          type="button"
          className="w-15 h-15 rounded-2xl bg-slate-800/90 active:bg-blue-600 active:scale-95 text-white flex items-center justify-center border border-white/10 shadow-lg touch-none transition-all active:ring-2 active:ring-blue-400"
          onPointerDown={(e) => {
            e.preventDefault();
            leftActive.current = true;
            onInput('left', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            leftActive.current = false;
            onInput('left', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            leftActive.current = false;
            onInput('left', false);
          }}
          aria-label="Mover para Esquerda"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>

        <button
          type="button"
          className="w-15 h-15 rounded-2xl bg-slate-800/90 active:bg-blue-600 active:scale-95 text-white flex items-center justify-center border border-white/10 shadow-lg touch-none transition-all active:ring-2 active:ring-blue-400"
          onPointerDown={(e) => {
            e.preventDefault();
            rightActive.current = true;
            onInput('right', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            rightActive.current = false;
            onInput('right', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            rightActive.current = false;
            onInput('right', false);
          }}
          aria-label="Mover para Direita"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      {/* 2. CALL BUDDY BUTTON */}
      {hasBuddy && onCallBuddy && (
        <div
          className="pointer-events-auto absolute"
          style={{
            left: `${customLayout.buddy.x}%`,
            top: `${customLayout.buddy.y}%`,
            transform: `translate(-50%, -50%) scale(${customLayout.buddy.scale})`,
          }}
        >
          <button
            type="button"
            className="w-13 h-13 rounded-2xl bg-purple-700/85 active:bg-purple-600 active:scale-90 text-white flex items-center justify-center border border-purple-400/40 shadow-lg touch-none transition-all"
            onPointerDown={(e) => {
              e.preventDefault();
              onCallBuddy();
            }}
            aria-label="Chamar Beto IA"
            title="Chamar Beto IA"
          >
            <Users className="w-6 h-6 text-purple-200" />
          </button>
        </div>
      )}

      {/* 3. EMOTE BUTTON */}
      <div
        className="pointer-events-auto absolute"
        style={{
          left: `${customLayout.emote.x}%`,
          top: `${customLayout.emote.y}%`,
          transform: `translate(-50%, -50%) scale(${customLayout.emote.scale})`,
        }}
      >
        <button
          type="button"
          className="w-13 h-13 rounded-2xl bg-slate-900/80 active:bg-pink-600 active:scale-90 text-white flex items-center justify-center border border-white/20 shadow-lg touch-none transition-all"
          onPointerDown={(e) => {
            e.preventDefault();
            onEmotePress();
          }}
          aria-label="Enviar Reação"
        >
          <Smile className="w-6 h-6 text-pink-300" />
        </button>
      </div>

      {/* 4. BIG JUMP BUTTON */}
      <div
        className="pointer-events-auto absolute"
        style={{
          left: `${customLayout.jump.x}%`,
          top: `${customLayout.jump.y}%`,
          transform: `translate(-50%, -50%) scale(${customLayout.jump.scale})`,
        }}
      >
        <button
          type="button"
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 active:from-emerald-700 active:to-teal-500 active:scale-95 text-white flex flex-col items-center justify-center border-2 border-emerald-300/50 shadow-2xl touch-none transition-transform active:ring-4 active:ring-teal-300/40"
          onPointerDown={(e) => {
            e.preventDefault();
            onInput('jump', true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onInput('jumpRelease', false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            onInput('jumpRelease', false);
          }}
          aria-label="Pular"
        >
          <ArrowUp className="w-10 h-10 stroke-[2.5]" />
          <span className="text-[10px] font-black tracking-wider uppercase -mt-1 text-emerald-100">
            Pular
          </span>
        </button>
      </div>
    </div>
  );
};
