import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Check, Move, Maximize2, Eye, Sparkles } from 'lucide-react';
import { CustomTouchControlsLayout } from '../types/game';
import { sound } from '../services/audio';

interface TouchControlsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (layout: CustomTouchControlsLayout) => void;
  initialLayout?: CustomTouchControlsLayout;
  hasBuddy?: boolean;
}

export const DEFAULT_TOUCH_LAYOUT: CustomTouchControlsLayout = {
  dpad: { x: 18, y: 84, scale: 1.0 },
  jump: { x: 86, y: 82, scale: 1.1 },
  buddy: { x: 74, y: 84, scale: 1.0 },
  emote: { x: 74, y: 70, scale: 1.0 },
  opacity: 0.85,
};

type SelectedElement = 'dpad' | 'jump' | 'buddy' | 'emote';

export const TouchControlsCustomizerModal: React.FC<TouchControlsCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLayout,
  hasBuddy = true,
}) => {
  const [layout, setLayout] = useState<CustomTouchControlsLayout>(() => {
    return initialLayout ? { ...DEFAULT_TOUCH_LAYOUT, ...initialLayout } : DEFAULT_TOUCH_LAYOUT;
  });

  const [selected, setSelected] = useState<SelectedElement>('dpad');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync when initialLayout changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setLayout(initialLayout ? { ...DEFAULT_TOUCH_LAYOUT, ...initialLayout } : DEFAULT_TOUCH_LAYOUT);
    }
  }, [isOpen, initialLayout]);

  if (!isOpen) return null;

  const handlePointerDown = (element: SelectedElement, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelected(element);
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const px = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const py = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      // Clamping within visible boundaries
      const clampedX = Math.max(8, Math.min(92, Math.round(px * 10) / 10));
      const clampedY = Math.max(15, Math.min(92, Math.round(py * 10) / 10));

      setLayout(prev => ({
        ...prev,
        [element]: {
          ...prev[element],
          x: clampedX,
          y: clampedY,
        },
      }));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleScaleChange = (scale: number) => {
    setLayout(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        scale: Math.round(scale * 100) / 100,
      },
    }));
  };

  const handleOpacityChange = (opacity: number) => {
    setLayout(prev => ({
      ...prev,
      opacity: Math.round(opacity * 100) / 100,
    }));
  };

  const handleReset = () => {
    sound.playJump();
    setLayout({ ...DEFAULT_TOUCH_LAYOUT });
  };

  const handleSaveAndClose = () => {
    sound.playVictory();
    onSave(layout);
    onClose();
  };

  const selectedName = {
    dpad: 'Direcionais (⬅️ ➡️)',
    jump: 'Botão de Pulo (⬆️ PULAR)',
    buddy: 'Chamar Beto IA (🤖)',
    emote: 'Botão de Emote (❤️)',
  }[selected];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 select-none overflow-hidden font-['Fredoka',sans-serif]">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 px-4 py-3 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
            🎮
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white leading-tight">
              Ajustador de Botões na Tela
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Arraste os botões para onde preferir e use os controles abaixo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-bold transition active:scale-95"
            title="Restaurar posições originais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Padrão</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Layout</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Canvas Simulator Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-gradient-to-b from-sky-900/40 via-slate-900/80 to-slate-950 overflow-hidden touch-none"
      >
        {/* Background visual reference for simulated game view */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <div className="w-36 h-10 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center text-[11px] font-bold text-white/50">
              HUD Superior
            </div>
            <div className="w-20 h-10 rounded-2xl border-2 border-dashed border-white/40 flex items-center justify-center text-[11px] font-bold text-white/50">
              Pausar ⏸️
            </div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-white/40 text-xs font-bold tracking-wider uppercase bg-black/30 px-3 py-1 rounded-full border border-white/10">
              Toque ou arraste os botões para reposicionar
            </span>
          </div>
          <div className="h-16 w-full border-t-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs font-bold">
            Chão da Fase
          </div>
        </div>

        {/* 1. D-PAD BUTTONS (LEFT / RIGHT) */}
        <div
          onPointerDown={(e) => handlePointerDown('dpad', e)}
          className={`absolute cursor-move select-none transition-shadow ${
            selected === 'dpad'
              ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-950 z-20'
              : 'hover:ring-2 hover:ring-white/40 z-10'
          }`}
          style={{
            left: `${layout.dpad.x}%`,
            top: `${layout.dpad.y}%`,
            transform: `translate(-50%, -50%) scale(${layout.dpad.scale})`,
            opacity: layout.opacity,
          }}
        >
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md p-2 rounded-3xl border border-white/20 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-xl border border-white/10 shadow-md">
              ⬅️
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-xl border border-white/10 shadow-md">
              ➡️
            </div>
          </div>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-sky-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-sky-400/40 whitespace-nowrap shadow">
            Direcionais
          </span>
        </div>

        {/* 2. JUMP BUTTON */}
        <div
          onPointerDown={(e) => handlePointerDown('jump', e)}
          className={`absolute cursor-move select-none transition-shadow ${
            selected === 'jump'
              ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-950 z-20'
              : 'hover:ring-2 hover:ring-white/40 z-10'
          }`}
          style={{
            left: `${layout.jump.x}%`,
            top: `${layout.jump.y}%`,
            transform: `translate(-50%, -50%) scale(${layout.jump.scale})`,
            opacity: layout.opacity,
          }}
        >
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex flex-col items-center justify-center border-2 border-white/30 shadow-2xl">
            <span className="text-2xl leading-none">⬆️</span>
            <span className="text-[10px] font-black tracking-wider uppercase mt-1">PULAR</span>
          </div>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-sky-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-sky-400/40 whitespace-nowrap shadow">
            Pulo
          </span>
        </div>

        {/* 3. CALL BUDDY BUTTON */}
        {hasBuddy && (
          <div
            onPointerDown={(e) => handlePointerDown('buddy', e)}
            className={`absolute cursor-move select-none transition-shadow ${
              selected === 'buddy'
                ? 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-950 z-20'
                : 'hover:ring-2 hover:ring-white/40 z-10'
            }`}
            style={{
              left: `${layout.buddy.x}%`,
              top: `${layout.buddy.y}%`,
              transform: `translate(-50%, -50%) scale(${layout.buddy.scale})`,
              opacity: layout.opacity,
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-700/90 text-white flex items-center justify-center border border-purple-400/40 shadow-xl text-xl">
              🤖
            </div>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-purple-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-purple-400/40 whitespace-nowrap shadow">
              Beto
            </span>
          </div>
        )}

        {/* 4. EMOTE BUTTON */}
        <div
          onPointerDown={(e) => handlePointerDown('emote', e)}
          className={`absolute cursor-move select-none transition-shadow ${
            selected === 'emote'
              ? 'ring-4 ring-pink-400 ring-offset-2 ring-offset-slate-950 z-20'
              : 'hover:ring-2 hover:ring-white/40 z-10'
          }`}
          style={{
            left: `${layout.emote.x}%`,
            top: `${layout.emote.y}%`,
            transform: `translate(-50%, -50%) scale(${layout.emote.scale})`,
            opacity: layout.opacity,
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-600/90 text-white flex items-center justify-center border border-pink-300/40 shadow-xl text-xl">
            ❤️
          </div>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-pink-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-pink-400/40 whitespace-nowrap shadow">
            Emote
          </span>
        </div>
      </div>

      {/* Bottom Controls / Inspector Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 shrink-0 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Selected Button Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Elemento selecionado:</span>
            <div className="flex gap-1.5 flex-wrap">
              {(['dpad', 'jump', 'buddy', 'emote'] as SelectedElement[]).map((elem) => (
                <button
                  key={elem}
                  type="button"
                  onClick={() => setSelected(elem)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    selected === elem
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {elem === 'dpad' && '⬅️ ➡️'}
                  {elem === 'jump' && '⬆️ Pulo'}
                  {elem === 'buddy' && '🤖 Beto'}
                  {elem === 'emote' && '❤️ Emote'}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders for Size & Opacity */}
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Scale Slider */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Maximize2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs text-slate-300 font-bold whitespace-nowrap">
                Tamanho: {Math.round(layout[selected].scale * 100)}%
              </span>
              <input
                type="range"
                min="0.65"
                max="1.6"
                step="0.05"
                value={layout[selected].scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-bold whitespace-nowrap">
                Visibilidade: {Math.round(layout.opacity * 100)}%
              </span>
              <input
                type="range"
                min="0.35"
                max="1.0"
                step="0.05"
                value={layout.opacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
