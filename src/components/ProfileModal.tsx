import React, { useState } from 'react';
import { X, Award, Footprints, Heart, LogOut, CheckCircle2, User, ShieldCheck, Zap, UserCheck, Sparkles } from 'lucide-react';
import { UserProfile, getXpRequiredForLevel } from '../types/game';
import { authService } from '../services/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGoogleUser = !!profile.email;
  const currentLevel = profile.level || 1;
  const currentXp = profile.xp || 0;
  const xpNeeded = getXpRequiredForLevel(currentLevel);
  const xpProgressPercent = Math.min(100, Math.max(0, Math.round((currentXp / xpNeeded) * 100)));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await authService.signInWithGoogle();
    setLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
  };

  const handleSetGuest = () => {
    authService.signInAsGuest();
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950">Perfil do Aventureiro</h2>
              <p className="text-xs text-slate-500 font-medium">Nível, XP e sincronização de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 bg-sky-50/80 p-4 rounded-2xl border border-sky-200">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm border-2 border-white shrink-0"
              style={{ backgroundColor: profile.customization.color }}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-800 truncate">{profile.displayName}</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                Nível {currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isGoogleUser ? profile.email : `Conta Convidado (${profile.uid.substring(0, 10)})`}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isGoogleUser ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-600">
                {isGoogleUser ? 'Mesma Conta Google Ativa e Salva' : 'Perfil Convidado Salvo Localmente'}
              </span>
            </div>
          </div>
        </div>

        {/* XP & Account Level Progression Card */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl text-white shadow-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-pink-200 block leading-none">
                  Progressão de XP
                </span>
                <h4 className="text-base font-black">Nível {currentLevel}</h4>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-xl">
              {currentXp} / {xpNeeded} XP ({xpProgressPercent}%)
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full bg-black/25 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>Para o Nível {currentLevel + 1}: faltam {Math.max(0, xpNeeded - currentXp)} XP</span>
            <span className="text-amber-200 font-bold">2-5 XP por fase (+ bônus por amigo!)</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 flex flex-col items-center text-center">
            <Award className="w-6 h-6 text-amber-500 mb-1" />
            <span className="text-2xl font-black text-slate-800">{profile.stagesCompleted}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Fases Zeradas</span>
          </div>

          <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 flex flex-col items-center text-center">
            <Footprints className="w-6 h-6 text-sky-600 mb-1" />
            <span className="text-2xl font-black text-slate-800">{profile.totalJumps}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Total Saltos</span>
          </div>

          <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 flex flex-col items-center text-center">
            <Heart className="w-6 h-6 text-pink-500 mb-1" />
            <span className="text-2xl font-black text-slate-800">{profile.highFives}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">High-Fives</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-white p-4 rounded-2xl border-2 border-sky-200 flex flex-col gap-3 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Sincronização com Google
          </span>

          {isGoogleUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>Progresso sincronizado com sucesso no Firestore!</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer border-2 border-slate-200"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Conectando...' : 'Entrar com Conta Google'}</span>
              </button>

              {errorMsg && (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-300 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetGuest}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modo Convidado Ativo (Clique para renovar ID)</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-normal font-medium">
                Ao fazer login com o Google, o jogo conecta sempre à sua mesma conta, sincronizando seu nível, XP e moedas entre qualquer dispositivo.
              </p>
            </>
          )}

          {/* Firebase Active Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Firebase Conectado
            </span>
            <span className="font-mono text-[10px] text-slate-400">{firebaseConfig.projectId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
