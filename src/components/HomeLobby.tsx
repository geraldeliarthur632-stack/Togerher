import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Users,
  ShoppingBag,
  Palette,
  Sliders,
  Sparkles,
  Coins,
  Volume2,
  VolumeX,
  Download,
  Music2,
  Check,
  Info,
  LogIn,
  Disc,
  Zap,
  ExternalLink,
  HelpCircle,
  Share,
} from 'lucide-react';
import { UserProfile, getXpRequiredForLevel } from '../types/game';
import { renderHatOnContext } from '../game/hatRenderer';
import { sound, GameTrack } from '../services/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { copyToClipboard } from '../utils/clipboard';

interface HomeLobbyProps {
  userProfile: UserProfile;
  onPlayClick: () => void;
  onJoinRoomClick: () => void;
  onOpenFriends: () => void;
  onOpenShop: () => void;
  onOpenCustomizer: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenMusicPlayer: () => void;
}

export const HomeLobby: React.FC<HomeLobbyProps> = ({
  userProfile,
  onPlayClick,
  onJoinRoomClick,
  onOpenFriends,
  onOpenShop,
  onOpenCustomizer,
  onOpenProfile,
  onOpenSettings,
  onOpenMusicPlayer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [currentTrack, setCurrentTrack] = useState<GameTrack>(sound.getCurrentTrack());
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const unsubTrack = sound.subscribeTrackChange((t) => {
      setCurrentTrack(t);
    });
    return unsubTrack;
  }, []);

  // Automatically start in-game soundtrack theme when entering Home!
  useEffect(() => {
    sound.playLobbyMusic();

    const handleFirstGesture = () => {
      sound.playLobbyMusic();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playLobbyMusic();
    }
  };

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = () => {
    setShowInstallModal(true);
    setShowTutorial(false);
  };

  const handleConfirmInstall = async () => {
    sound.playJump();
    if (isInstallable) {
      try {
        const accepted = await install();
        if (accepted) {
          setShowInstallModal(false);
          setInstallSuccess(true);
          setTimeout(() => setInstallSuccess(false), 4000);
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    // If native prompt wasn't triggered or was dismissed, show the 3 dots tutorial
    setShowTutorial(true);
  };

  // Animated 2D Avatar on Golden Podium
  useEffect(() => {
    let animId: number;
    let time = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 10;

      // Golden Podium in Light Mode
      ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 38, 56, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bobbing
      const bobY = Math.sin(time * 3) * 5;

      ctx.save();
      ctx.translate(cx, cy + bobY);

      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-10, 22, 7, 10);
      ctx.fillRect(3, 22, 7, 10);

      // Body
      ctx.fillStyle = userProfile.customization.color;
      ctx.beginPath();
      ctx.roundRect(-22, -26, 44, 52, 14);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Belly
      ctx.fillStyle = userProfile.customization.secondaryColor || 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-15, -12, 30, 32, 10);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4, -10, 3.5, 0, Math.PI * 2);
      ctx.arc(8, -10, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -11, 1.2, 0, Math.PI * 2);
      ctx.arc(9, -11, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(2, -4, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
      ctx.beginPath();
      ctx.arc(-10, -5, 3, 0, Math.PI * 2);
      ctx.arc(14, -5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Hat / Accessory
      const topY = -26;
      renderHatOnContext(ctx, userProfile.customization.hat, topY);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [userProfile.customization]);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between p-3 sm:p-6 bg-gradient-to-b from-sky-300 via-sky-100 to-blue-200 overflow-y-auto overflow-x-hidden select-none font-['Fredoka',sans-serif] text-slate-800">
      
      {/* Playful Floating Sky Clouds (Light Mode Ambience) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-12 -left-10 w-64 h-24 rounded-full bg-white blur-xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-28 right-8 w-80 h-28 rounded-full bg-white blur-xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-16 left-1/3 w-96 h-32 rounded-full bg-white/70 blur-2xl" />
      </div>

      {/* TOP STATUS BAR */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between z-10">
        
        {/* Left: Official Game Icon, Profile Badge, Compact Coins & Now Playing Soundtrack */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Official Game Icon Thumbnail */}
          <div
            className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 cursor-pointer hover:scale-105 transition"
            title="Together Friends Oficial"
          >
            <img src="/app-icon.jpg" alt="Together Friends Ícone" className="w-full h-full object-cover" />
          </div>

          {/* Profile Card */}
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white/90 hover:bg-white border-2 border-sky-200 px-3 py-1.5 rounded-2xl cursor-pointer transition shadow-md hover:shadow-lg"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-inner"
              style={{ backgroundColor: userProfile.customization.color }}
            >
              {userProfile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black text-slate-800 block leading-tight truncate max-w-[105px]">
                {userProfile.displayName}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block leading-none">
                {userProfile.stagesCompleted} Fases
              </span>
            </div>
          </div>

          {/* LEVEL & XP PILL */}
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 px-2.5 py-1 rounded-full cursor-pointer transition shadow-sm active:scale-95 text-indigo-900"
            title={`Nível ${userProfile.level || 1} • ${userProfile.xp || 0}/${getXpRequiredForLevel(userProfile.level || 1)} XP (Clique para abrir perfil)`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="text-xs font-black text-indigo-900 leading-none">
              Nív. {userProfile.level || 1}
            </span>
            <span className="text-[9px] font-bold text-indigo-600 hidden sm:inline">
              {userProfile.xp || 0}/{getXpRequiredForLevel(userProfile.level || 1)} XP
            </span>
          </div>

          {/* COMPACT COINS COUNTER */}
          <div
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300/80 px-2.5 py-1 rounded-full cursor-pointer transition shadow-sm active:scale-95"
            title="Loja de Skins (Ganhe 1 moeda ao vencer!)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 animate-bounce" style={{ animationDuration: '2.5s' }} />
            <span className="text-xs font-black text-amber-700 leading-none">
              {userProfile.coins || 0}
            </span>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">
              moedas
            </span>
          </div>

          {/* NOW PLAYING TRACK PILL */}
          <div
            onClick={onOpenMusicPlayer}
            className="hidden md:flex items-center gap-2 bg-purple-50/90 hover:bg-purple-100/90 border border-purple-300 px-2.5 py-1 rounded-full cursor-pointer transition shadow-sm active:scale-95 text-purple-900"
            title="Clique para abrir as Músicas do Jogo"
          >
            <Disc className="w-3 h-3 text-purple-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[11px] font-black truncate max-w-[130px]">
              {currentTrack.name}
            </span>
            <span className="text-[9px] font-bold text-purple-600">
              {currentTrack.bpm} BPM
            </span>
          </div>
        </div>

        {/* Right: Sound Toggle and Vertical Quick Action Rail */}
        <div className="flex items-start gap-2">
          {/* Sound / Stumble Music Toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition cursor-pointer shadow-sm ${
              !isMuted
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                : 'bg-white/80 hover:bg-white border-slate-200 text-slate-400'
            }`}
            title={!isMuted ? 'Música Ativa (Tema Stumble)' : 'Música Silenciada'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* VERTICAL QUICK ACTION RAIL:
              1. Engrenagem (Configurações)
              2. Embaixo da engrenagem: Botão de Instalar PWA
              3. Embaixo do botão de instalar: Botão de Música (Spotify, Deezer, Apple, YT Music estilo Waze) */}
          <div className="flex flex-col items-center gap-1.5">
            {/* 1. ENGRENAGEM (CONFIGURAÇÕES) */}
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-sky-50 border-2 border-sky-200 text-sky-800 flex items-center justify-center transition shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              title="Configurações do Jogo"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* 2. BOTÃO DE INSTALAR PWA (EMBAIXO DA ENGRENAGEM) */}
            <button
              onClick={handleInstallClick}
              className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition shadow-md cursor-pointer hover:scale-105 active:scale-95 relative ${
                isInstalled
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-gradient-to-tr from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border-sky-400 text-white'
              }`}
              title={isInstalled ? 'App Instalado (PWA)' : 'Instalar App (PWA)'}
            >
              {isInstalled ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Download className="w-4 h-4 animate-bounce" style={{ animationDuration: '2s' }} />
              )}
            </button>

            {/* 3. BOTÃO DE MÚSICAS ORIGINAIS DO JOGO (EMBAIXO DO INSTALAR PWA) */}
            <button
              onClick={onOpenMusicPlayer}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 border-2 border-pink-300 text-white flex items-center justify-center transition shadow-md shadow-pink-500/25 cursor-pointer hover:scale-105 active:scale-95 relative"
              title="Músicas do Jogo (6 Trilhas Sonoras Oficiais)"
            >
              <Music2 className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
            </button>

            {/* 4. BOTÃO DA LOJA DE SKINS (EMBAIXO DO BOTÃO DE MÚSICA) */}
            <button
              onClick={onOpenShop}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 border-2 border-amber-300 text-white flex items-center justify-center transition shadow-md shadow-amber-500/25 cursor-pointer hover:scale-105 active:scale-95 relative"
              title={`Loja de Skins (${userProfile.coins || 0} Moedas)`}
            >
              <ShoppingBag className="w-4 h-4" />
              {userProfile.coins > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-300 border border-amber-700 text-amber-950 text-[9px] font-black flex items-center justify-center shadow-sm">
                  {userProfile.coins}
                </span>
              )}
            </button>

            {/* 5. BOTÃO DE MUDAR SKIN / PERSONALIZAR (EMBAIXO DA LOJA) */}
            <button
              onClick={onOpenCustomizer}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 border-2 border-pink-300 text-white flex items-center justify-center transition shadow-md shadow-purple-500/25 cursor-pointer hover:scale-105 active:scale-95 relative"
              title="Mudar Skin e Personalizar Personagem"
            >
              <Palette className="w-4 h-4" />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white"
                style={{ backgroundColor: userProfile.customization.color }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CENTER STAGE: CHARACTER ON PODIUM, OFFICIAL LOGO & MENU BUTTONS (Responsive for Portrait, Landscape & PC) */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 z-10 max-w-4xl mx-auto my-auto w-full px-4 py-2">
        {/* Left Side: Official Logo Card & Character on Podium */}
        <div className="flex flex-col items-center text-center">
          {/* Official Game Logo Artwork */}
          <div className="relative mb-2 cursor-pointer group" onClick={onOpenCustomizer}>
            <img
              src="/assets/aistudio/IMG-20261025-WA0178_c2527890.jpg"
              alt="Together Friends Logo Oficial"
              className="w-48 sm:w-60 h-auto aspect-[3/2] object-cover rounded-3xl shadow-xl border-3 border-white ring-4 ring-sky-300/40 group-hover:scale-102 transition-transform"
            />
          </div>

          {/* Animated Avatar Preview on Golden Podium */}
          <div className="relative -mt-3 cursor-pointer group" onClick={onOpenCustomizer}>
            <canvas ref={canvasRef} width={200} height={120} className="w-[200px] h-[120px] drop-shadow-md" />
            <span className="text-[10px] font-bold text-sky-800 bg-white/95 px-3 py-1 rounded-full border border-sky-200 shadow-sm group-hover:bg-sky-50 group-hover:border-sky-300 transition">
              Mudar Skin & Visual 🎨
            </span>
          </div>
        </div>

        {/* Right Side: Title & Main Menu CTAs */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full max-w-xs sm:max-w-sm">
          {/* Title Lockup (Light Mode Sky Palette) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-sky-950 tracking-tight leading-none drop-shadow-sm">
            TOGETHER
          </h1>
          <span className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-amber-500 mb-3 sm:mb-4">
            FRIENDS 2D
          </span>

          {/* MAIN MENU ACTION BUTTONS (Adaptive for Mobile Portrait, Landscape & PC) */}
          <div className="flex flex-col w-full gap-2.5 sm:gap-3">
            {/* PRIMARY PLAY CTA (Abre seleção de níveis e sala) */}
            <button
              type="button"
              id="btn-home-jogar"
              onClick={onPlayClick}
              className="group relative w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-base sm:text-xl shadow-xl shadow-emerald-500/25 hover:scale-102 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-300/40"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span className="tracking-wide uppercase">JOGAR / CRIAR SALA</span>
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
            </button>

            {/* BOTÃO ENTRAR NA SALA COM CÓDIGO */}
            <button
              type="button"
              id="btn-home-entrar-sala"
              onClick={onJoinRoomClick}
              className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black text-xs sm:text-base shadow-lg shadow-indigo-500/25 hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-indigo-300/40"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="uppercase tracking-wide">ENTRAR NA SALA</span>
            </button>

            {/* REAL FRIENDS BUTTON */}
            <button
              type="button"
              onClick={onOpenFriends}
              className="w-full py-2.5 sm:py-3 px-5 rounded-2xl bg-white hover:bg-sky-50 border-2 border-sky-300 text-sky-950 font-black text-xs sm:text-sm shadow-md hover:scale-101 active:scale-98 transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
              <span>Amigos de Verdade</span>
              {userProfile.friends && userProfile.friends.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-[10px] text-white font-bold">
                  {userProfile.friends.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="z-10 text-center text-xs text-sky-800/80 font-semibold py-1">
        Funciona via Wi-Fi, LAN e Servidores à distância · Ganhe +1 Moeda a cada vitória!
      </div>

      {/* SUCCESS TOAST */}
      {installSuccess && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none px-4 animate-bounce">
          <div className="bg-emerald-600 text-white font-black text-sm px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-2">
            <Check className="w-5 h-5 stroke-[3]" />
            <span>🎉 Aplicativo instalado com sucesso na sua tela inicial!</span>
          </div>
        </div>
      )}

      {/* PWA INSTALL CONFIRMATION MODAL: 'Deseja instalar esse app?' com Detecção Inteligente de Plataforma */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/60 backdrop-blur-md p-3 sm:p-4 font-['Fredoka',sans-serif]">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-sky-200 text-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Header with official App Icon & Platform Badge */}
            <div className="flex items-center gap-3.5 pb-3 border-b border-sky-100">
              <img
                src="/app-icon.jpg"
                alt="Ícone Oficial do App"
                className="w-14 h-14 rounded-2xl border-2 border-sky-200 shadow-md object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                {/* Platform Badge */}
                {platform.isInAppBrowser ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block">
                    ⚠️ {platform.inAppName || 'Rede Social'} (Navegador Interno)
                  </span>
                ) : platform.isAndroid ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-block">
                    🤖 Android ({platform.browserName}) Detectado
                  </span>
                ) : platform.isIOS ? (
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full inline-block">
                    🍎 Apple iOS ({platform.browserName}) Detectado
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full inline-block">
                    💻 Computador / Notebook ({platform.browserName})
                  </span>
                )}
                <h3 className="text-lg sm:text-xl font-black text-sky-950 truncate leading-tight mt-1">
                  Together Friends
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  togetherfriends.game · Aplicativo Oficial
                </p>
              </div>
            </div>

            {/* Prompt Question */}
            <div className="my-4 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-sky-950">
                Deseja instalar esse app?
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Adicione o <strong>Together Friends</strong> à tela inicial do seu dispositivo para jogar em <strong>tela cheia</strong>, sem a barra de endereços do navegador e com carregamento instantâneo offline!
              </p>
            </div>

            {/* IN-APP BROWSER (WHATSAPP, INSTAGRAM, FACEBOOK, TIKTOK) HANDLING */}
            {platform.isInAppBrowser ? (
              <div className="space-y-3 mb-4">
                <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl text-amber-950 text-xs">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                    <span>⚠️ Atenção: Você está navegando pelo {platform.inAppName || 'WhatsApp / Instagram'}</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Navegadores internos de redes sociais NÃO suportam a instalação direta de aplicativos por restrições de segurança. Para instalar o app completo e jogar em tela cheia, <strong>abra no Google Chrome nativo</strong>.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.open(window.location.href, '_system');
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/30 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    <span>Abrir no Google Chrome Nativo</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(window.location.href);
                      if (ok) {
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2500);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share className="w-4 h-4" />}
                    <span>{linkCopied ? 'Link Copiado! Cole no Chrome' : 'Copiar Link do Jogo'}</span>
                  </button>
                </div>
              </div>
            ) : isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Este aplicativo já está instalado no seu dispositivo! Você pode abri-lo direto da sua tela inicial ou gaveta de apps.</span>
              </div>
            ) : (
              /* Action Buttons */
              <div className="flex gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-black transition cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInstall}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Instalar Agora</span>
                </button>
              </div>
            )}

            {/* TUTORIAL & PERMISSION GUIDE: Tailored for the specific platform */}
            <div className="mt-3 pt-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => setShowTutorial((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50/80 p-2.5 rounded-xl border border-sky-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    {platform.isIOS
                      ? 'Como instalar no iPhone ou iPad (Safari)? Clique aqui'
                      : 'Nos 3 pontinhos (⋮) não tem o botão de instalar? Clique aqui'}
                  </span>
                </div>
                <span className="text-[10px] font-black">{showTutorial ? '▲ Menos' : '▼ Ver'}</span>
              </button>

              {showTutorial && (
                <div className="mt-2.5 flex flex-col gap-2.5 text-xs text-slate-700 animate-fadeIn">
                  {/* Platform Specific Tutorial Steps */}
                  {platform.isIOS ? (
                    /* iOS SAFARI TUTORIAL */
                    <div className="bg-purple-50/90 border border-purple-200 p-3 rounded-2xl space-y-2">
                      <p className="font-bold text-purple-950 flex items-center gap-1.5">
                        <span>🍎 No iPhone ou iPad (Safari):</span>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-900 leading-relaxed font-medium">
                        <li>
                          Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima <Share className="w-3.5 h-3.5 inline text-purple-700" /> na barra inferior do Safari).
                        </li>
                        <li>
                          Role a lista para baixo e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                        </li>
                        <li>
                          Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito. Pronto! O ícone oficial aparecerá na tela do seu iPhone.
                        </li>
                      </ol>
                    </div>
                  ) : (
                    /* ANDROID & CHROME TUTORIAL */
                    <>
                      <div className="bg-emerald-50/90 border border-emerald-300 p-3 rounded-2xl">
                        <p className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                          <span>1. Permissão do Chrome:</span>
                        </p>
                        <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                          Ao clicar em <strong>&quot;Instalar Agora&quot;</strong>, o Google Chrome abre a caixa oficial do Android perguntando: <em>&quot;Deseja instalar esse app?&quot;</em> Basta tocar em <strong>&quot;Instalar&quot;</strong> para aceitar a permissão!
                        </p>
                      </div>

                      <div className="bg-amber-50/90 border border-amber-300 p-3 rounded-2xl">
                        <p className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                          <span>2. Nos 3 pontinhos (⋮) do Chrome / Samsung:</span>
                        </p>
                        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                          No menu dos <strong>3 pontinhos (⋮)</strong>, o botão pode se chamar <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>. Ambas as opções instalam o aplicativo completo com ícone próprio e suporte offline!
                        </p>
                      </div>
                    </>
                  )}

                  {/* General In-App social browser reminder */}
                  {platform.isInAppBrowser && (
                    <div className="bg-blue-50/90 border border-blue-200 p-3 rounded-2xl">
                      <p className="font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                        <span>3. Como sair do WhatsApp ou Instagram:</span>
                      </p>
                      <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                        Toque nos <strong>3 pontinhos (⋮)</strong> no topo superior direito da tela do WhatsApp/Instagram e escolha <strong>&quot;Abrir no Chrome&quot;</strong> ou <strong>&quot;Abrir no Navegador&quot;</strong>.
                      </p>
                    </div>
                  )}

                  {/* Direct external open button */}
                  <button
                    type="button"
                    onClick={() => {
                      window.open(window.location.href, '_blank');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir no Navegador Externo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
