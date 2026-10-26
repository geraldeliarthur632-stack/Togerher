import React, { useState, useEffect } from 'react';
import { UserProfile, GameMode, PlayerCustomization } from './types/game';
import { authService } from './services/auth';
import { sound } from './services/audio';
import { InitialSplash } from './components/InitialSplash';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeLobby } from './components/HomeLobby';
import { FriendsModal } from './components/FriendsModal';
import { ShopModal } from './components/ShopModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { StumbleLobbyModal } from './components/StumbleLobbyModal';
import { CustomizerModal } from './components/CustomizerModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { SoundtrackJukeboxModal } from './components/SoundtrackJukeboxModal';
import { GameCanvas } from './components/GameCanvas';

export type AppPhase = 'splash' | 'loading_2s' | 'home' | 'playing';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(authService.getProfile());

  // Check if player has already logged in or completed setup:
  // "coloque que o jogo salva o login e já vai direto pro menu inicial quem já logou"
  const isAlreadyLoggedIn = () => {
    try {
      const logged = localStorage.getItem('together_logged_in') === 'true';
      const hasAvatar = localStorage.getItem('together_has_selected_avatar') === 'true';
      const hasEmail = Boolean(authService.getProfile().email);
      return logged || hasAvatar || hasEmail;
    } catch {
      return false;
    }
  };

  // App Phase: Directly 'home' if already logged in, otherwise 'splash'
  const [appPhase, setAppPhase] = useState<AppPhase>(() => {
    return isAlreadyLoggedIn() ? 'home' : 'splash';
  });

  // Modals state
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showStumbleLobby, setShowStumbleLobby] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  // Selected level and game settings
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('solo_bot');
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(true);
  const [lobbyInitialTab, setLobbyInitialTab] = useState<'create' | 'join'>('create');

  // Subscribe to profile changes (coins, unlocked skins, friends, etc.)
  useEffect(() => {
    const unsub = authService.subscribe((profile) => {
      setUserProfile(profile);
    });
    return unsub;
  }, []);

  // 1. Splash Screen Play Click:
  // "no início só tem o botão de jogar que vai para editar o avatar depois pede pra logar"
  const handleSplashPlay = () => {
    try {
      sound.playJump();
    } catch (e) {
      console.warn(e);
    }
    // Clicking JOGAR on splash always goes to Edit Avatar -> then asks to Login -> then 2s loading
    setShowCustomizer(true);
  };

  // 2. Finished Customizer & Google Login & Player Name:
  // "depois vai aparecer carregando por 2 segs e vai pra tela inicial"
  const handleOnboardingComplete = (customization: PlayerCustomization) => {
    try {
      localStorage.setItem('together_has_selected_avatar', 'true');
      localStorage.setItem('together_logged_in', 'true');
    } catch (e) {
      console.warn(e);
    }
    authService.updateProfile({
      customization,
      displayName: customization.name,
    });
    setShowCustomizer(false);
    // Transition to 2-second animated loading screen
    setAppPhase('loading_2s');
  };

  // 3. 2-Second Loading Screen finished:
  // "vai pra tela inicial que tem o botão amigos... e moedas..."
  const handleLoadingFinished = () => {
    setAppPhase('home');
    sound.playLobbyMusic();
  };

  // 4. Clicking "JOGAR" on Home Screen:
  // "quando clicar no botão de jogar pede pra selecionar o nível mas se o usuário nunca ganhou o outro nível ele aparece bloqueado"
  const handleHomePlayClick = () => {
    try {
      sound.playJump();
    } catch (e) {
      console.warn(e);
    }
    setShowLevelSelect(true);
  };

  // 4.1 Clicking "ENTRAR NA SALA" on Home Screen:
  const handleHomeJoinRoomClick = () => {
    try {
      sound.playJump();
    } catch (e) {
      console.warn(e);
    }
    setLobbyInitialTab('join');
    setShowStumbleLobby(true);
  };

  // 5. Selecting an unlocked level:
  // "depois que selecionar o nível aparece a sala igual stumble guys que tem o código e quais pessoas que entraram..."
  const handleSelectLevel = (stageIndex: number) => {
    setSelectedStageIndex(stageIndex);
    setShowLevelSelect(false);
    setLobbyInitialTab('create');
    setShowStumbleLobby(true);
  };

  // 6. Launching game from Stumble Guys Room:
  // "...e tem o botão de jogar e entrar na partida no início pra selecionar e funciona por Lan e servidores que funciona a distância por wi-fi normal"
  const handleStartMatch = (
    mode: 'online_multiplayer' | 'solo_bot',
    roomCode: string | null,
    isRoomHost: boolean
  ) => {
    setShowStumbleLobby(false);
    setGameMode(mode);
    setCurrentRoomCode(roomCode);
    setIsHost(isRoomHost);
    setAppPhase('playing');
  };

  // Exit match back to Home Lobby
  const handleExitMatch = () => {
    setCurrentRoomCode(null);
    setAppPhase('home');
    sound.playLobbyMusic();
  };

  return (
    <div className="w-screen h-screen bg-sky-100 text-slate-800 overflow-hidden select-none font-['Fredoka',sans-serif]">
      {/* PHASE 1: INITIAL SPLASH (ONLY THE "JOGAR" BUTTON) */}
      {appPhase === 'splash' && <InitialSplash onPlay={handleSplashPlay} />}

      {/* PHASE 2: 2-SECOND LOADING SCREEN */}
      {appPhase === 'loading_2s' && (
        <LoadingScreen
          customization={userProfile.customization}
          onFinish={handleLoadingFinished}
        />
      )}

      {/* PHASE 3: MAIN HOME LOBBY */}
      {appPhase === 'home' && (
        <HomeLobby
          userProfile={userProfile}
          onPlayClick={handleHomePlayClick}
          onJoinRoomClick={handleHomeJoinRoomClick}
          onOpenFriends={() => setShowFriends(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenCustomizer={() => setShowCustomizer(true)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenMusicPlayer={() => setShowMusicPlayer(true)}
        />
      )}

      {/* PHASE 4: PLAYING THE 2D GAME CANVAS */}
      {appPhase === 'playing' && (
        <GameCanvas
          mode={gameMode}
          userProfile={userProfile}
          roomCode={currentRoomCode}
          isHost={isHost}
          initialStageIndex={selectedStageIndex}
          onExit={handleExitMatch}
        />
      )}

      {/* MODALS */}

      {/* 1. Customizer Modal (Step 1: Avatar, Step 2: Google Login) */}
      <CustomizerModal
        isOpen={showCustomizer}
        isInitialSetup={appPhase === 'splash'}
        customization={userProfile.customization}
        onSave={(customization) => {
          authService.updateProfile({
            customization,
            displayName: customization.name,
          });
        }}
        onPlayNow={handleOnboardingComplete}
        onClose={() => setShowCustomizer(false)}
      />

      {/* 2. Friends Modal (Real People by Code/Name, Invite to Room) */}
      <FriendsModal
        isOpen={showFriends}
        userProfile={userProfile}
        onClose={() => setShowFriends(false)}
        onInviteToRoom={(friend) => {
          setShowFriends(false);
          // Open Stumble Guys room with selected level
          setShowStumbleLobby(true);
        }}
      />

      {/* 3. Shop Modal (Buy Skins with Coins won in matches) */}
      <ShopModal
        isOpen={showShop}
        userProfile={userProfile}
        onClose={() => setShowShop(false)}
      />

      {/* 4. Level Select Modal (Enforces locked levels until won) */}
      <LevelSelectModal
        isOpen={showLevelSelect}
        userProfile={userProfile}
        onClose={() => setShowLevelSelect(false)}
        onSelectLevel={handleSelectLevel}
      />

      {/* 5. Stumble Guys Style Lobby (Code, joined players, LAN/WiFi/Server) */}
      <StumbleLobbyModal
        isOpen={showStumbleLobby}
        selectedStageIndex={selectedStageIndex}
        userProfile={userProfile}
        initialTab={lobbyInitialTab}
        onClose={() => setShowStumbleLobby(false)}
        onStartGame={handleStartMatch}
      />

      {/* 6. Profile Modal */}
      <ProfileModal
        profile={userProfile}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        settings={userProfile.settings}
        onUpdateSettings={(newSettings) =>
          authService.updateProfile({ settings: { ...userProfile.settings, ...newSettings } })
        }
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* 8. In-Game Multi-Track Soundtrack Jukebox (6 Procedural Tracks) */}
      <SoundtrackJukeboxModal
        isOpen={showMusicPlayer}
        onClose={() => setShowMusicPlayer(false)}
      />
    </div>
  );
}
