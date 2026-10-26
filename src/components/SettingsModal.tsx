import React, { useState } from 'react';
import { X, Volume2, Smartphone, Sliders, Bot } from 'lucide-react';
import { GameSettings, CustomTouchControlsLayout } from '../types/game';
import { sound } from '../services/audio';
import { TouchControlsCustomizerModal } from './TouchControlsCustomizerModal';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  const [showControlsCustomizer, setShowControlsCustomizer] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <h2 className="text-xl sm:text-2xl font-black text-sky-950 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-sky-600" />
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="flex flex-col gap-3.5 bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-sky-600" /> Áudio & Efeitos Sonoros
          </span>

          {/* SFX Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Efeitos Sonoros (SFX)</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ sfxVolume: val });
                sound.setVolumes(val, settings.musicVolume);
                sound.playJump();
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Volume da Música</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ musicVolume: val });
                sound.setVolumes(settings.sfxVolume, val);
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Soundtrack Selector */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-sky-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Trilha Sonora Atual</span>
              <span className="text-sky-700 font-bold">{sound.getCurrentTrack().name}</span>
            </div>
            <select
              value={sound.getCurrentTrack().id}
              onChange={(e) => {
                sound.setTrack(parseInt(e.target.value, 10));
              }}
              className="w-full bg-white border border-sky-300 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {sound.getTrackList().map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.id + 1}. {tr.name} ({tr.genre} - {tr.bpm} BPM)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <div className="flex flex-col gap-3 bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" /> Controles de Toque (Celular)
          </span>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-xs font-bold text-slate-700">Exibir Botões Virtuais na Tela</span>
            <input
              type="checkbox"
              checked={settings.showTouchControls}
              onChange={(e) => onUpdateSettings({ showTouchControls: e.target.checked })}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
          </label>

          {settings.showTouchControls && (
            <>
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Tamanho dos Botões</span>
                  <span>{Math.round(settings.touchControlsScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={settings.touchControlsScale}
                  onChange={(e) => onUpdateSettings({ touchControlsScale: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Transparência</span>
                  <span>{Math.round(settings.touchControlsOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={settings.touchControlsOpacity}
                  onChange={(e) => onUpdateSettings({ touchControlsOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowControlsCustomizer(true)}
                className="w-full mt-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span>🎮</span>
                <span>Ajustar Posição e Tamanho dos Botões</span>
              </button>
            </>
          )}

          {/* Screen Orientation: Deitado ou Em Pé */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-sky-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Orientação de Tela Preferida</span>
              <span className="text-emerald-700 font-bold">
                {settings.screenOrientation === 'landscape'
                  ? '🎮 Deitado (Paisagem)'
                  : settings.screenOrientation === 'portrait'
                  ? '📱 Em Pé (Retrato)'
                  : '🔄 Automático'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ screenOrientation: 'auto' });
                  try {
                    if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).unlock) {
                      (screen.orientation as any).unlock();
                    }
                  } catch {}
                }}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                  !settings.screenOrientation || settings.screenOrientation === 'auto'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                }`}
              >
                🔄 Auto
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ screenOrientation: 'landscape' });
                  try {
                    if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).lock) {
                      (screen.orientation as any).lock('landscape');
                    }
                  } catch {}
                }}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                  settings.screenOrientation === 'landscape'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                }`}
              >
                🎮 Deitado
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ screenOrientation: 'portrait' });
                  try {
                    if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).lock) {
                      (screen.orientation as any).lock('portrait');
                    }
                  } catch {}
                }}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                  settings.screenOrientation === 'portrait'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                    : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                }`}
              >
                📱 Em Pé
              </button>
            </div>
          </div>
        </div>

        {/* AI Companion Toggle */}
        <div className="flex flex-col gap-2 bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-600" /> Assistência Solo
          </span>
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-xs font-bold text-slate-700">Ativar Robô Buddy no Modo Solo</span>
            <input
              type="checkbox"
              checked={settings.botCompanion}
              onChange={(e) => onUpdateSettings({ botCompanion: e.target.checked })}
              className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Keyboard Map */}
        <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 text-xs text-slate-700 space-y-2">
          <span className="font-bold text-sky-900 uppercase tracking-wider block">
            Teclas de Atalho (PC)
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-sm">
              <span className="font-bold text-sky-700 block mb-0.5">Jogador 1:</span>
              <div>A / D : Mover</div>
              <div>Espaço / W : Pular</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-sm">
              <span className="font-bold text-emerald-700 block mb-0.5">Jogador 2 (Local):</span>
              <div>← / → : Mover</div>
              <div>↑ / Enter : Pular</div>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Controls Customizer */}
      <TouchControlsCustomizerModal
        isOpen={showControlsCustomizer}
        onClose={() => setShowControlsCustomizer(false)}
        initialLayout={settings.customTouchLayout}
        hasBuddy={settings.botCompanion}
        onSave={(layout: CustomTouchControlsLayout) => {
          try {
            localStorage.setItem('together_touch_controls_layout', JSON.stringify(layout));
          } catch (e) {
            console.warn(e);
          }
          onUpdateSettings({
            customTouchLayout: layout,
            touchControlsOpacity: layout.opacity,
          });
        }}
      />
    </div>
  );
};
