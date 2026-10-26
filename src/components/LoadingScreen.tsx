import React, { useEffect, useState } from 'react';
import { PlayerCustomization } from '../types/game';

interface LoadingScreenProps {
  customization: PlayerCustomization;
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ customization, onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2000; // Exactly 2 seconds

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(onFinish, 100);
      }
    };

    const animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-sky-200 via-sky-100 to-blue-200 flex flex-col items-center justify-center p-6 select-none font-['Fredoka',sans-serif]">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        {/* Animated Avatar Bobbing */}
        <div className="relative mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white animate-bounce"
            style={{ backgroundColor: customization.color, animationDuration: '0.8s' }}
          >
            {customization.name.charAt(0).toUpperCase()}
          </div>
          {/* Shadow beneath avatar */}
          <div className="w-20 h-4 bg-sky-900/20 rounded-full blur-sm mx-auto mt-2" />
        </div>

        <h3 className="text-2xl font-black text-sky-950 tracking-wide">
          Carregando (2 segundos)...
        </h3>
        <p className="text-xs text-sky-800/80 mt-1 font-medium">
          Sincronizando perfil, amigos e salas online
        </p>

        {/* 2-Second Progress Bar */}
        <div className="w-full bg-white border-2 border-sky-300 rounded-full h-4 mt-6 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full mt-2 text-xs font-mono text-sky-900/80">
          <span>Entrando na tela inicial...</span>
          <span className="font-bold text-emerald-600 font-mono">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
