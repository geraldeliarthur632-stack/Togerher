import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Music2, Disc, Volume2, Sparkles, Check, Flame } from 'lucide-react';
import { sound, GameTrack, GAME_TRACKS } from '../services/audio';

interface SoundtrackJukeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundtrackJukeboxModal: React.FC<SoundtrackJukeboxModalProps> = ({ isOpen, onClose }) => {
  const [currentTrack, setCurrentTrack] = useState<GameTrack>(sound.getCurrentTrack());
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  useEffect(() => {
    const unsub = sound.subscribeTrackChange((track) => {
      setCurrentTrack(track);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleSelectTrack = (trackId: number) => {
    sound.setTrack(trackId);
    if (sound.getIsMuted()) {
      sound.toggleMute();
      setIsMuted(false);
    }
  };

  const handleNext = () => {
    const next = sound.nextTrack();
    setCurrentTrack(next);
  };

  const handlePrev = () => {
    const prev = sound.prevTrack();
    setCurrentTrack(prev);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-sky-950/45 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Fredoka',sans-serif]">
      <div className="relative w-full max-w-lg bg-white/95 rounded-3xl border-2 border-sky-200 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Header with Visualizer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner animate-bounce" style={{ animationDuration: '3s' }}>
              <Disc className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-wide leading-tight">Músicas do Jogo</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                  Trilha Sonora Oficial
                </span>
              </div>
              <p className="text-xs text-pink-100 font-medium">
                Várias trilhas originais com sintetizador arcade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOW PLAYING HERO CARD */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 border-2 border-sky-300 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                Tocando Agora
              </span>
              <div className="flex items-center gap-1">
                {/* Animated Audio Equalizer Bars */}
                {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-indigo-600 animate-pulse"
                    style={{
                      height: `${14 * h}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 leading-snug">
                {currentTrack.name}
              </h4>
              <p className="text-xs text-indigo-800/80 font-bold">
                {currentTrack.genre} · {currentTrack.bpm} BPM
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                {currentTrack.description}
              </p>
            </div>

            {/* Quick Playback Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 text-slate-700 flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition"
                  title="Música Anterior"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 text-slate-700 flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition"
                  title="Próxima Música"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                  !isMuted
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{!isMuted ? 'Áudio Ativo' : 'Silenciado'}</span>
              </button>
            </div>
          </div>

          {/* PLAYLIST OF ALL 6 GAME TRACKS */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block px-1">
              Escolha sua Trilha Sonora ({GAME_TRACKS.length} Músicas):
            </span>

            <div className="grid grid-cols-1 gap-2">
              {GAME_TRACKS.map((t) => {
                const isSelected = currentTrack.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrack(t.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300/40'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isSelected ? <Music2 className="w-4 h-4 animate-pulse" /> : t.id + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-slate-900 leading-tight">
                            {t.name}
                          </h5>
                          {t.id === 4 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Pesadelo
                            </span>
                          )}
                          {t.id === 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                              Tema Principal
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          {t.genre} · {t.bpm} BPM
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-black bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tocando</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold transition"
                        >
                          Tocar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
          As músicas continuam tocando durante as fases e no menu principal.
        </div>
      </div>
    </div>
  );
};
