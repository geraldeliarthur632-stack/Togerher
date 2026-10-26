import React, { useState, useMemo } from 'react';
import { X, Lock, CheckCircle2, Play, Sparkles, AlertCircle, Compass, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Flame, Globe } from 'lucide-react';
import { STAGES, TOTAL_STAGES, WORLD_1_STAGES, WORLD_2_STAGES, getStage } from '../game/levels';
import { UserProfile } from '../types/game';
import { sound } from '../services/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSelectLevel: (stageIndex: number) => void;
}

const PAGE_SIZE = 24;

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSelectLevel,
}) => {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [world, setWorld] = useState<'world1' | 'world2'>('world1');
  const [page, setPage] = useState(0);
  const [jumpInput, setJumpInput] = useState('');

  // Unlocked levels progression
  const maxUnlocked = Math.max(1, userProfile.unlockedLevels || 1);

  // Range for current world
  const worldStartIdx = world === 'world1' ? 0 : WORLD_1_STAGES;
  const worldStageCount = world === 'world1' ? WORLD_1_STAGES : WORLD_2_STAGES;
  const totalPages = Math.ceil(worldStageCount / PAGE_SIZE);

  // Jump to user's highest unlocked level
  const handleJumpToCurrent = () => {
    const currentIdx = Math.min(TOTAL_STAGES - 1, maxUnlocked - 1);
    if (currentIdx >= WORLD_1_STAGES) {
      setWorld('world2');
      const offset = currentIdx - WORLD_1_STAGES;
      setPage(Math.floor(offset / PAGE_SIZE));
    } else {
      setWorld('world1');
      setPage(Math.floor(currentIdx / PAGE_SIZE));
    }
  };

  // Jump by level number (1..2000)
  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (Number.isNaN(num) || num < 1 || num > TOTAL_STAGES) {
      setLockedNotice(`Por favor, digite um número de nível entre 1 e ${TOTAL_STAGES}.`);
      setTimeout(() => setLockedNotice(null), 3000);
      return;
    }

    const idx = num - 1;
    if (idx >= WORLD_1_STAGES) {
      setWorld('world2');
      const offset = idx - WORLD_1_STAGES;
      setPage(Math.floor(offset / PAGE_SIZE));
    } else {
      setWorld('world1');
      setPage(Math.floor(idx / PAGE_SIZE));
    }
    setJumpInput('');
  };

  const handleLevelClick = (stageIndex: number) => {
    const isUnlocked = stageIndex + 1 <= maxUnlocked;

    if (!isUnlocked) {
      sound.playDefeat();
      const levelNum = stageIndex + 1;
      setLockedNotice(`🔒 Nível ${levelNum} Bloqueado! Você precisa vencer o Nível ${levelNum - 1} primeiro para liberar.`);
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }

    sound.playCheckpoint();
    onSelectLevel(stageIndex);
  };

  // Compute levels for current page
  const pageStages = useMemo(() => {
    const start = worldStartIdx + page * PAGE_SIZE;
    const end = Math.min(worldStartIdx + worldStageCount, start + PAGE_SIZE);
    const list = [];
    for (let i = start; i < end; i++) {
      list.push({ idx: i, stage: getStage(i) });
    }
    return list;
  }, [world, page, worldStartIdx, worldStageCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-3.5 max-h-[94vh] overflow-y-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">
              {TOTAL_STAGES} Níveis Cooperativos Disponíveis
            </span>
            <h2 className="text-2xl font-black text-sky-950">Selecionar Nível</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* WORLD SWITCHER TABS (Mundo 1 vs Mundo 2 / Nível 2) */}
        <div className="grid grid-cols-2 gap-2 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-200">
          <button
            type="button"
            onClick={() => {
              setWorld('world1');
              setPage(0);
            }}
            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              world === 'world1'
                ? 'bg-white text-sky-900 shadow-md border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Mundo 1 (Fases 1 - 1000)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWorld('world2');
              setPage(0);
            }}
            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              world === 'world2'
                ? 'bg-white text-rose-900 shadow-md border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Mundo 2: Pesadelo (1001 - 2000)</span>
          </button>
        </div>

        {/* Quick Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 p-2.5 rounded-2xl border border-sky-200 text-xs">
          {/* Jump to current unlocked level */}
          <button
            type="button"
            onClick={handleJumpToCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Minha Fase Atual: Fase {maxUnlocked}</span>
          </button>

          {/* Jump directly to level number */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Pular:</span>
            <input
              type="number"
              min={1}
              max={TOTAL_STAGES}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="Ex: 50"
              className="w-20 px-2 py-1 bg-white border border-sky-300 rounded-lg text-center font-black text-slate-800 text-xs focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-black transition cursor-pointer"
            >
              Ir
            </button>
          </form>

          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(0)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              title="Primeira página"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-slate-700">
              Pág {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              title="Próxima página"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
              title="Última página"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lock Warning Notice */}
        {lockedNotice && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
        )}

        {/* Level Cards Grid (24 levels per page) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
          {pageStages.map(({ idx, stage }) => {
            const levelNum = idx + 1;
            const isUnlocked = levelNum <= maxUnlocked;
            const isCompleted = levelNum <= (userProfile.stagesCompleted || 0);

            return (
              <div
                key={stage.id}
                onClick={() => handleLevelClick(idx)}
                className={`relative rounded-2xl p-3 border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isUnlocked
                    ? world === 'world2'
                      ? 'bg-gradient-to-br from-white to-rose-50/80 border-rose-200 hover:border-rose-400 hover:scale-[1.02] shadow-sm'
                      : 'bg-gradient-to-br from-white to-sky-50/80 border-sky-200 hover:border-sky-400 hover:scale-[1.02] shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 opacity-60 hover:opacity-75'
                }`}
              >
                {/* Level Number & Status Indicator */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isUnlocked
                        ? world === 'world2'
                          ? 'bg-rose-500 text-white'
                          : 'bg-sky-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Fase {levelNum}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isUnlocked ? (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>

                {/* Level Title */}
                <h4 className="text-xs font-black text-slate-800 line-clamp-2 leading-tight my-1">
                  {stage.name}
                </h4>

                {/* Action Footer */}
                <div className="mt-1 flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 capitalize">
                    <span>{stage.theme.decorTheme.replace('_', ' ')}</span>
                    {stage.coins && stage.coins.length > 0 && (
                      <span className="text-amber-500 font-black flex items-center gap-0.5">
                        🪙 {stage.coins.length}
                      </span>
                    )}
                  </div>
                  {isUnlocked ? (
                    <span className="text-[11px] font-black text-sky-600 flex items-center gap-0.5">
                      <span>Jogar</span>
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-500 font-semibold border-t border-sky-100 flex items-center justify-between">
          <span>{world === 'world1' ? 'Mundo 1: Aventura Cooperativa (1 a 1000)' : 'Mundo 2: Modo Pesadelo (1001 a 2000)'}</span>
          <span className="text-amber-600 font-bold">+1 Moeda para a loja a cada nível vencido!</span>
        </div>
      </div>
    </div>
  );
};
