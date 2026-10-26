import React, { useRef, useEffect, useState } from 'react';
import { X, Check, ArrowRight, ArrowLeft, Play, CheckCircle2, Sparkles, UserCheck, Smile } from 'lucide-react';
import { PlayerCustomization, HatType } from '../types/game';
import { authService, auth } from '../services/auth';
import { renderHatOnContext } from '../game/hatRenderer';

interface CustomizerModalProps {
  isOpen: boolean;
  customization: PlayerCustomization;
  onSave: (customization: PlayerCustomization) => void;
  onClose: () => void;
  onPlayNow?: (customization: PlayerCustomization) => void;
  isInitialSetup?: boolean;
}

const COLOR_PALETTE = [
  { name: 'Azul Celeste', main: '#3b82f6', secondary: '#93c5fd' },
  { name: 'Esmeralda', main: '#10b981', secondary: '#6ee7b7' },
  { name: 'Rosa Chiclete', main: '#ec4899', secondary: '#fbcfe8' },
  { name: 'Roxo Estelar', main: '#8b5cf6', secondary: '#c4b5fd' },
  { name: 'Âmbar Solar', main: '#f59e0b', secondary: '#fde68a' },
  { name: 'Coral Quente', main: '#f97316', secondary: '#fed7aa' },
  { name: 'Rubi Fogo', main: '#ef4444', secondary: '#fca5a5' },
  { name: 'Ciano Neon', main: '#06b6d4', secondary: '#a5f3fc' },
  { name: 'Sombra Noturna', main: '#475569', secondary: '#94a3b8' },
];

const HATS: { id: HatType; label: string }[] = [
  { id: 'none', label: 'Sem Chapéu' },
  { id: 'cap', label: 'Boné Azul' },
  { id: 'beanie', label: 'Gorro Vermelho' },
  { id: 'crown', label: 'Coroa Dourada' },
  { id: 'flower', label: 'Flor Rosa' },
  { id: 'headphones', label: 'Fones Gamer' },
  { id: 'wizard', label: 'Mago Roxo' },
  { id: 'tophat', label: 'Cartola de Gala' },
  { id: 'ninja', label: 'Faixa Ninja' },
  { id: 'astronaut', label: 'Astronauta' },
  { id: 'diamond_crown', label: 'Coroa Diamante' },
  { id: 'viking', label: 'Elmo Viking' },
  { id: 'pirate', label: 'Pirata' },
  { id: 'halo', label: 'Auréola' },
  { id: 'dino', label: 'Dinossauro' },
  { id: 'party_hat', label: 'Festa' },
  { id: 'cat_ears', label: 'Gatinho' },
  { id: 'sunglasses', label: 'Óculos Escuros' },
  { id: 'sombrero', label: 'Sombrero' },
  { id: 'chef', label: 'Chef' },
  { id: 'samurai', label: 'Samurai' },
];

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  customization,
  onSave,
  onClose,
  onPlayNow,
  isInitialSetup = false,
}) => {
  // Step 1: 'avatar', Step 2: 'google_login', Step 3: 'choose_name'
  const [step, setStep] = useState<'avatar' | 'google_login' | 'choose_name'>('avatar');
  const [current, setCurrent] = useState<PlayerCustomization>({ ...customization });
  const [playerNameInput, setPlayerNameInput] = useState<string>(customization.name || 'Aventureiro');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentUser = auth.currentUser;
  const isGoogleConnected = !!currentUser || !!authService.getProfile().email;

  // Reset whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('avatar');
      setCurrent({ ...customization });
      setPlayerNameInput(customization.name || authService.getProfile().displayName || 'Aventureiro');
      setGoogleError(null);
    }
  }, [isOpen]);

  // Animated preview in canvas
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    let time = 0;

    const renderPreview = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background podium
      const cx = w / 2;
      const cy = h / 2 + 10;
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 38, 52, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bobbing animation
      const bobY = Math.sin(time * 3) * 4;

      ctx.save();
      ctx.translate(cx, cy + bobY);

      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, 22, 7, 10);
      ctx.fillRect(3, 22, 7, 10);

      // Body
      ctx.fillStyle = current.color;
      ctx.beginPath();
      ctx.roundRect(-22, -26, 44, 52, 14);
      ctx.fill();

      // Belly
      ctx.fillStyle = current.secondaryColor || 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.roundRect(-15, -12, 30, 32, 10);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4, -10, 3.5, 0, Math.PI * 2);
      ctx.arc(8, -10, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -11, 1.2, 0, Math.PI * 2);
      ctx.arc(9, -11, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, -4, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(-10, -5, 3, 0, Math.PI * 2);
      ctx.arc(14, -5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Hat
      const topY = -26;
      renderHatOnContext(ctx, current.hat, topY);

      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();
    return () => cancelAnimationFrame(animId);
  }, [current, step]);

  // Click "Próximo" on Step 1: Saves avatar and advances to Step 2 (Google Login)
  const handleGoToGoogleStep = () => {
    try {
      localStorage.setItem('together_has_selected_avatar', 'true');
    } catch (e) {
      console.warn(e);
    }
    onSave(current);
    setStep('google_login');
  };

  // Click "Entrar com Google" in Step 2 -> On success, always ask for player's name in Step 3!
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await authService.signInWithGoogle();
      setGoogleLoading(false);

      if (res.success) {
        const prof = authService.getProfile();
        const suggestedName = prof.displayName || auth.currentUser?.displayName || current.name || 'Aventureiro';
        setPlayerNameInput(suggestedName);
        setCurrent(prev => ({ ...prev, name: suggestedName }));
        // "coloque ué depois de logar com Google pedir o nome pra depôs ir pro menu inicial"
        setStep('choose_name');
      } else {
        setGoogleError(res.error || 'Falha ao conectar com o Google. Você pode continuar para escolher seu nome!');
      }
    } catch (err) {
      setGoogleLoading(false);
      setGoogleError('Não foi possível abrir o login do Google. Clique em Próximo para continuar!');
    }
  };

  // Advance from Step 2 to Step 3 without Google login (Guest)
  const handleGoToNameStep = () => {
    authService.signInAsGuest(current.name);
    setStep('choose_name');
  };

  const handlePlayAsGuest = () => {
    authService.signInAsGuest(current.name);
    setStep('choose_name');
  };

  // Complete onboarding from Step 3 (Save Name & enter Main Menu)
  const handleConfirmNameAndFinish = () => {
    const finalName = playerNameInput.trim() || current.name.trim() || 'Aventureiro';
    const updatedCustomization: PlayerCustomization = {
      ...current,
      name: finalName,
    };

    try {
      localStorage.setItem('together_has_selected_avatar', 'true');
      localStorage.setItem('together_logged_in', 'true');
    } catch (e) {
      console.warn(e);
    }

    authService.updateProfile({
      displayName: finalName,
      customization: updatedCustomization,
    });

    onSave(updatedCustomization);

    if (onPlayNow) {
      onPlayNow(updatedCustomization);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-y-auto text-slate-800">
        
        {/* Header with Step Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                step === 'avatar' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1. Avatar
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                step === 'google_login' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2. Conta Google
              </span>
              <span className="text-slate-400 text-xs">→</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                step === 'choose_name' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3. Seu Nome
              </span>
            </div>
            <h2 className="text-2xl font-black text-sky-950">
              {step === 'avatar' && 'Escolha seu Avatar'}
              {step === 'google_login' && 'Conectar Conta Google'}
              {step === 'choose_name' && 'Qual é o seu Nome no Jogo?'}
            </h2>
          </div>
          {!isInitialSetup && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* STEP 1: AVATAR CUSTOMIZATION */}
        {step === 'avatar' && (
          <div className="flex flex-col gap-4">
            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center bg-sky-50/70 rounded-2xl py-3 border-2 border-sky-200">
              <canvas ref={canvasRef} width={200} height={120} className="w-[200px] h-[120px] drop-shadow-sm" />
              <div className="mt-1 flex flex-col items-center gap-1 w-full max-w-xs px-4">
                <span className="text-xs font-semibold text-slate-600">Prévia do seu Personagem</span>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Cor do Personagem
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {COLOR_PALETTE.map((c) => {
                  const isSelected = current.color === c.main;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCurrent({ ...current, color: c.main, secondaryColor: c.secondary })}
                      className={`h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected ? 'ring-4 ring-sky-400 scale-105 shadow-md' : 'hover:scale-95 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.main }}
                      title={c.name}
                    >
                      {isSelected && <Check className="w-5 h-5 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hat Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                Acessório de Cabeça
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {HATS.map((h) => {
                  const isSelected = current.hat === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setCurrent({ ...current, hat: h.id })}
                      className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition text-center cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 border-sky-400 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {h.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-sky-100">
              {!isInitialSetup && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              <button
                type="button"
                onClick={handleGoToGoogleStep}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-2 hover:scale-101 active:scale-98 transition cursor-pointer"
              >
                <span>Próximo: Conectar Conta</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GOOGLE SIGN-IN */}
        {step === 'google_login' && (
          <div className="flex flex-col gap-4 py-1">
            {/* Selected Avatar Summary Card */}
            <div className="flex items-center gap-4 bg-sky-50 p-4 rounded-2xl border border-sky-200">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm border-2 border-white shrink-0"
                style={{ backgroundColor: current.color }}
              >
                {current.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                  Avatar Escolhido
                </span>
                <h3 className="text-lg font-black text-slate-800 truncate">{current.name}</h3>
                <span className="text-xs text-slate-500">
                  {current.hat !== 'none' ? `Acessório: ${current.hat}` : 'Sem acessório'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('avatar')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 transition cursor-pointer"
              >
                Editar
              </button>
            </div>

            {/* Google Authentication Box */}
            <div className="bg-white p-5 rounded-3xl border-2 border-sky-200 flex flex-col items-center text-center gap-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center p-2.5 shadow-inner border border-sky-100">
                <svg className="w-full h-full" viewBox="0 0 24 24">
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
              </div>

              <div>
                <h4 className="text-xl font-black text-sky-950">Conecte com sua Conta Google</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Salve automaticamente suas fases completadas, moedas da loja e jogue com amigos de verdade.
                </p>
              </div>

              {isGoogleConnected ? (
                <div className="w-full bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-col items-center gap-1.5 text-emerald-800">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Conectado com Sucesso!</span>
                  </div>
                  <span className="text-xs text-emerald-700">
                    {authService.getProfile().email || 'Conta Google Ativa'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Sua conta continuará a mesma para sempre neste login!
                  </span>
                </div>
              ) : (
                <div className="w-full max-w-sm flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm shadow-md flex items-center justify-center gap-3 transition hover:scale-102 active:scale-98 cursor-pointer border-2 border-slate-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    <span>{googleLoading ? 'Conectando ao Google...' : 'Entrar com Conta Google'}</span>
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ou</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Botão de Jogar como Convidado */}
                  <button
                    type="button"
                    onClick={handlePlayAsGuest}
                    className="w-full py-3 px-5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-900 border-2 border-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition hover:scale-101 active:scale-98 cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Entrar como Convidado (Jogar Agora)</span>
                  </button>
                </div>
              )}

              {googleError && (
                <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-300 max-w-sm">
                  {googleError}
                </p>
              )}
            </div>

            {/* Step 2 Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setStep('avatar')}
                className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                id="btn-proximo-nome"
                onClick={handleGoToNameStep}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ring-2 ring-emerald-300/40"
              >
                <span>Próximo: Escolher Meu Nome</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE PLAYER NAME BEFORE GOING TO MAIN MENU */}
        {step === 'choose_name' && (
          <div className="flex flex-col gap-4 py-1">
            <div className="bg-gradient-to-b from-sky-50 to-white p-5 rounded-3xl border-2 border-sky-200 flex flex-col items-center text-center gap-4 shadow-md">
              <div className="relative">
                <canvas ref={canvasRef} width={180} height={100} className="w-[180px] h-[100px] drop-shadow-sm" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
                  {isGoogleConnected ? '✓ Conta Google Conectada!' : 'Perfil do Jogador'}
                </span>
                <h3 className="text-xl font-black text-sky-950 mt-0.5">
                  Qual é o seu Apelido nas Partidas?
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Esse nome aparecerá acima da sua cabeça no jogo, nas salas multiplayer e na lista de amigos.
                </p>
              </div>

              {/* Name Input Field */}
              <div className="w-full max-w-xs flex flex-col gap-1 text-left">
                <label className="text-xs font-bold text-slate-700">Seu Nome / Apelido:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={playerNameInput}
                    maxLength={16}
                    onChange={(e) => {
                      setPlayerNameInput(e.target.value);
                      setCurrent(prev => ({ ...prev, name: e.target.value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmNameAndFinish();
                      }
                    }}
                    autoFocus
                    placeholder="Ex: PedroGamer, SuperStumble..."
                    className="w-full text-center bg-white border-2 border-sky-300 focus:border-sky-500 rounded-2xl px-4 py-3 text-sky-950 font-black text-lg tracking-wide focus:outline-none shadow-inner"
                  />
                  <Smile className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-400 text-right">
                  {playerNameInput.length}/16 caracteres
                </span>
              </div>
            </div>

            {/* Step 3 Actions: Save Name & Go to Main Menu */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setStep('google_login')}
                className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                id="btn-confirmar-nome-menu"
                onClick={handleConfirmNameAndFinish}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ring-2 ring-emerald-300/40"
              >
                <span>Salvar Nome e Ir para o Menu Principal</span>
                <Sparkles className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
