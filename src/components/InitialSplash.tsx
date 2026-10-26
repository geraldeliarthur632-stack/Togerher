import React from 'react';
import { Play, Sparkles } from 'lucide-react';

interface InitialSplashProps {
  onPlay: () => void;
}

export const InitialSplash: React.FC<InitialSplashProps> = ({ onPlay }) => {
  return (
    <div className="relative w-full min-h-screen overflow-y-auto flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-300 via-sky-100 to-blue-200 select-none text-slate-800 font-['Fredoka',sans-serif]">
      {/* Background Animated Atmosphere / Light Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 -left-10 w-96 h-96 rounded-full bg-white blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 rounded-full bg-sky-200 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Center Hero Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg w-full my-auto py-4">
        {/* Game Title & Official Cover Artwork */}
        <div className="mb-5 flex flex-col items-center w-full">
          {/* Official Game Logo Artwork */}
          <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 ring-4 ring-sky-300/50 mb-4 group">
            <img
              src="/assets/aistudio/IMG-20261025-WA0178_c2527890.jpg"
              alt="Together Friends - Logo Oficial"
              className="w-full h-auto aspect-[3/2] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white drop-shadow">
              <span className="text-[11px] font-black uppercase tracking-wider bg-sky-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                Cooperativo 2D
              </span>
              <span className="text-[11px] font-black bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-sm">
                2000 Fases
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-sky-950 tracking-tight drop-shadow-sm leading-none">
            TOGETHER
          </h1>
          <span className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-amber-500 mt-1">
            FRIENDS 2D
          </span>

          <p className="text-xs sm:text-sm text-sky-900/80 mt-2 max-w-xs leading-relaxed font-medium">
            O jogo cooperativo onde cada obstáculo só pode ser superado em dupla!
          </p>
        </div>

        {/* ONLY THE "JOGAR" BUTTON — Exactly as requested */}
        <div className="w-full max-w-xs flex flex-col items-center">
          <button
            type="button"
            id="btn-inicio-jogar"
            onClick={onPlay}
            className="group relative w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-4 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-emerald-300/40 animate-bounce"
            style={{ animationDuration: '2.5s' }}
          >
            <Play className="w-8 h-8 fill-current drop-shadow" />
            <span className="tracking-wide uppercase">JOGAR</span>
          </button>
          
          <span className="text-xs text-sky-800/80 mt-4 font-bold">
            Pressione para personalizar e entrar
          </span>
        </div>
      </div>
    </div>
  );
};
