import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Play, Crown, Bot, Sparkles, Wifi, UserPlus } from 'lucide-react';
import { UserProfile } from '../types/game';
import { STAGES } from '../game/levels';
import { sound } from '../services/audio';
import { copyToClipboard } from '../utils/clipboard';

interface StumbleLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStageIndex: number;
  userProfile: UserProfile;
  onStartGame: (mode: 'online_multiplayer' | 'solo_bot', roomCode: string | null, isHost: boolean) => void;
  initialTab?: 'create' | 'join';
  onOpenFriends?: () => void;
}

interface RoomPlayer {
  id: string;
  name: string;
  color: string;
  hat: string;
  isHost: boolean;
}

export const StumbleLobbyModal: React.FC<StumbleLobbyModalProps> = ({
  isOpen,
  onClose,
  selectedStageIndex,
  userProfile,
  onStartGame,
  initialTab = 'create',
  onOpenFriends,
}) => {
  // 'create' (Criar Sala / Jogar) | 'join' (Entrar na Partida com Código)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab);
  const [isHost, setIsHost] = useState(initialTab === 'create');
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Sync activeTab when modal is reopened with a specific initialTab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setIsHost(initialTab === 'create');
      if (initialTab === 'create') {
        handleCreateRoom();
      }
    }
  }, [isOpen, initialTab]);

  // Initialize room code or connect WebSocket when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (ws) {
        ws.close();
        setWs(null);
      }
      return;
    }

    if (activeTab === 'create' && !roomCode) {
      handleCreateRoom();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isOpen, selectedStageIndex]);

  const handleCreateRoom = () => {
    setErrorMsg(null);
    setIsHost(true);

    if (ws) {
      ws.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'CREATE_ROOM',
          name: userProfile.displayName,
          color: userProfile.customization.color,
          hat: userProfile.customization.hat,
          stageIndex: selectedStageIndex,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ROOM_CREATED') {
          setRoomCode(msg.roomCode);
          setPlayers([
            {
              id: msg.playerId,
              name: userProfile.displayName,
              color: userProfile.customization.color,
              hat: userProfile.customization.hat,
              isHost: true,
            },
          ]);
        } else if (msg.type === 'PLAYER_JOINED') {
          sound.playCheckpoint();
          setPlayers((prev) => [
            ...prev.filter((p) => p.id !== msg.player.id),
            {
              id: msg.player.id,
              name: msg.player.name,
              color: msg.player.color || '#ec4899',
              hat: msg.player.hat || 'none',
              isHost: false,
            },
          ]);
        } else if (msg.type === 'PLAYER_LEFT') {
          setPlayers((prev) => prev.filter((p) => p.id !== msg.playerId));
        } else if (msg.type === 'GAME_START') {
          sound.playVictory();
          onStartGame('online_multiplayer', roomCode, false);
        } else if (msg.type === 'ERROR') {
          setErrorMsg(msg.message);
        }
      } catch (e) {
        console.error(e);
      }
    };
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim();
    if (!code) {
      setErrorMsg('Por favor, digite o código da sala!');
      return;
    }

    setErrorMsg(null);
    setIsJoining(true);
    setIsHost(false);

    if (ws) {
      ws.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'JOIN_ROOM',
          roomCode: code,
          name: userProfile.displayName,
          color: userProfile.customization.color,
          hat: userProfile.customization.hat,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setIsJoining(false);

        if (msg.type === 'ROOM_JOINED') {
          setRoomCode(msg.roomCode);
          const pList: RoomPlayer[] = (msg.players || []).map((p: any, idx: number) => ({
            id: p.id,
            name: p.name,
            color: p.color || '#ec4899',
            hat: p.hat || 'none',
            isHost: idx === 0,
          }));
          setPlayers(pList);
        } else if (msg.type === 'PLAYER_JOINED') {
          sound.playCheckpoint();
          setPlayers((prev) => [
            ...prev.filter((p) => p.id !== msg.player.id),
            {
              id: msg.player.id,
              name: msg.player.name,
              color: msg.player.color || '#ec4899',
              hat: msg.player.hat || 'none',
              isHost: false,
            },
          ]);
        } else if (msg.type === 'PLAYER_LEFT') {
          setPlayers((prev) => prev.filter((p) => p.id !== msg.playerId));
        } else if (msg.type === 'GAME_START') {
          sound.playVictory();
          onStartGame('online_multiplayer', code, false);
        } else if (msg.type === 'ERROR') {
          setErrorMsg(msg.message);
        }
      } catch (e) {
        setIsJoining(false);
        console.error(e);
      }
    };
  };

  const handleHostLaunchGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'START_GAME' }));
    }
    sound.playJump();
    onStartGame('online_multiplayer', roomCode, true);
  };

  const handlePlayWithBot = () => {
    if (ws) ws.close();
    sound.playJump();
    onStartGame('solo_bot', null, true);
  };

  const handleCopyCode = async () => {
    if (roomCode) {
      const ok = await copyToClipboard(roomCode);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSwitchToCreate = () => {
    setActiveTab('create');
    setErrorMsg(null);
    handleCreateRoom();
  };

  const handleSwitchToJoin = () => {
    setActiveTab('join');
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  const stage = STAGES[selectedStageIndex] || STAGES[0];

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-y-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950">Sala Estilo Stumble Guys</h2>
              <p className="text-xs text-sky-800/80 font-medium">Funciona por Wi-Fi normal, LAN e Servidores à distância</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Stage Banner */}
        <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">
              Nível Escolhido
            </span>
            <h3 className="text-base font-black text-sky-950">{stage.name}</h3>
            <span className="text-xs text-slate-600 font-medium">{stage.subtitle}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Servidor Wi-Fi / LAN Ativo</span>
          </div>
        </div>

        {/* INITIAL SELECTION BUTTONS: JOGAR (Criar Sala) vs ENTRAR NA PARTIDA */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-sky-100/70 rounded-2xl border border-sky-200">
          <button
            type="button"
            id="tab-criar-jogar"
            onClick={handleSwitchToCreate}
            className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md ring-2 ring-emerald-300/40'
                : 'text-sky-800 hover:text-sky-950 hover:bg-white/60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="uppercase">CRIAR SALA / JOGAR</span>
          </button>

          <button
            type="button"
            id="tab-entrar-partida"
            onClick={handleSwitchToJoin}
            className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-sky-300/40'
                : 'text-sky-800 hover:text-sky-950 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="uppercase">ENTRAR NA PARTIDA</span>
          </button>
        </div>

        {/* VIEW 1: CRIAR SALA / JOGAR (Host Mode with Room Code & Live Podiums) */}
        {activeTab === 'create' && (
          <div className="flex flex-col gap-4">
            {/* ROOM CODE BANNER (Stumble Guys Style) */}
            <div className="bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 p-4 rounded-3xl border-2 border-sky-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 block">
                  Código da Sala (Compartilhe com amigos):
                </span>
                <span className="text-3xl font-black tracking-widest text-sky-950 font-mono">
                  {roomCode || 'GERANDO...'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md flex items-center gap-2 transition cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>CÓDIGO COPIADO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPIAR CÓDIGO</span>
                  </>
                )}
              </button>

              {onOpenFriends && (
                <button
                  type="button"
                  onClick={onOpenFriends}
                  className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-2 transition cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title="Convidar amigos da sua lista para entrar na sala"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>CONVIDAR AMIGOS</span>
                </button>
              )}
            </div>

            {/* STUMBLE GUYS STYLE PODIUMS: QUAIS PESSOAS ENTRARAM */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pessoas que Entraram na Sala ({players.length}/4)
                </span>
                <span className="text-[11px] text-emerald-600 font-mono font-bold">
                  Wi-Fi / LAN / Internet
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Slot 1: Host */}
                {players[0] ? (
                  <div className="bg-white border-2 border-amber-400 p-4 rounded-2xl flex flex-col items-center text-center shadow-md relative">
                    <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>Líder</span>
                    </div>

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white mt-2"
                      style={{ backgroundColor: players[0].color }}
                    >
                      {players[0].name.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-sm font-black text-slate-800 mt-2 truncate w-full">
                      {players[0].name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Você (Líder)</span>
                  </div>
                ) : null}

                {/* Slot 2: Guest 1 */}
                {players[1] ? (
                  <div className="bg-white border-2 border-sky-400 p-4 rounded-2xl flex flex-col items-center text-center shadow-md relative animate-in fade-in zoom-in-95">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white mt-2"
                      style={{ backgroundColor: players[1].color }}
                    >
                      {players[1].name.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-sm font-black text-slate-800 mt-2 truncate w-full">
                      {players[1].name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Conectado</span>
                  </div>
                ) : (
                  <div className="bg-sky-50/60 border-2 border-dashed border-sky-200 p-4 rounded-2xl flex flex-col items-center text-center justify-center min-h-[140px]">
                    <Users className="w-6 h-6 text-sky-400 animate-pulse mb-1" />
                    <span className="text-xs font-bold text-slate-600">Aguardando amigo...</span>
                    <span className="text-[10px] text-slate-400 mt-1">Passe o código</span>
                  </div>
                )}

                {/* Slot 3 */}
                {players[2] ? (
                  <div className="bg-white border-2 border-purple-400 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white mt-2"
                      style={{ backgroundColor: players[2].color }}
                    >
                      {players[2].name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-black text-slate-800 mt-2 truncate w-full">{players[2].name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Conectado</span>
                  </div>
                ) : (
                  <div className="bg-sky-50/40 border border-dashed border-sky-200 p-4 rounded-2xl flex flex-col items-center text-center justify-center min-h-[140px] opacity-75">
                    <span className="text-xs font-bold text-slate-400">Vaga 3</span>
                    <span className="text-[10px] text-slate-400">Livre</span>
                  </div>
                )}

                {/* Slot 4 */}
                {players[3] ? (
                  <div className="bg-white border-2 border-pink-400 p-4 rounded-2xl flex flex-col items-center text-center shadow-md">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white mt-2"
                      style={{ backgroundColor: players[3].color }}
                    >
                      {players[3].name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-black text-slate-800 mt-2 truncate w-full">{players[3].name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Conectado</span>
                  </div>
                ) : (
                  <div className="bg-sky-50/40 border border-dashed border-sky-200 p-4 rounded-2xl flex flex-col items-center text-center justify-center min-h-[140px] opacity-75">
                    <span className="text-xs font-bold text-slate-400">Vaga 4</span>
                    <span className="text-[10px] text-slate-400">Livre</span>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Game Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-sky-100">
              <button
                type="button"
                id="btn-iniciar-partida"
                onClick={handleHostLaunchGame}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer ring-2 ring-emerald-300/40"
              >
                <Play className="w-6 h-6 fill-current" />
                <span className="uppercase">INICIAR PARTIDA / JOGAR</span>
              </button>

              {players.length <= 1 && (
                <button
                  type="button"
                  onClick={handlePlayWithBot}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Jogar com Robô Buddy</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ENTRAR NA PARTIDA (Join using friend's Room Code) */}
        {activeTab === 'join' && (
          <div className="flex flex-col gap-4">
            <div className="bg-sky-50 p-5 rounded-3xl border border-sky-200 flex flex-col gap-3 shadow-inner">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Digite o Código da Sala (de 5 caracteres criado pelo seu amigo):
              </label>

              <form onSubmit={handleJoinRoom} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                  placeholder="EX: TOG88"
                  maxLength={6}
                  className="flex-1 bg-white border-2 border-sky-300 rounded-2xl px-5 py-3.5 text-sky-950 font-mono font-black text-2xl text-center uppercase tracking-widest focus:outline-none focus:border-sky-500 shadow-inner"
                />

                <button
                  type="submit"
                  disabled={isJoining}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <span>{isJoining ? 'Conectando...' : 'ENTRAR NA SALA'}</span>
                </button>
              </form>

              <p className="text-xs text-slate-500 font-medium">
                💡 O código funciona tanto pelo mesmo Wi-Fi / rede local (LAN) quanto à distância pela internet!
              </p>
            </div>

            {/* If connected into a room as guest */}
            {roomCode && !isHost && (
              <div className="flex flex-col gap-3">
                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between text-emerald-900">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Você está na Sala:
                    </span>
                    <span className="text-2xl font-black font-mono tracking-wider">{roomCode}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    <span>Aguardando o Líder clicar em JOGAR...</span>
                  </div>
                </div>

                {/* Show connected players in this joined room */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                    Jogadores Conectados na Sala ({players.length}/4)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {players.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className={`bg-white border-2 p-4 rounded-2xl flex flex-col items-center text-center shadow-md relative ${
                          p.isHost ? 'border-amber-400' : 'border-sky-400'
                        }`}
                      >
                        {p.isHost && (
                          <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3 fill-current" />
                            <span>Líder</span>
                          </div>
                        )}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md border-2 border-white mt-1"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-black text-slate-800 mt-2 truncate w-full">{p.name}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {p.isHost ? 'Líder da Sala' : 'Pronto'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        <div className="text-center text-xs text-slate-500 font-semibold">
          Suporta conexões simultâneas via Wi-Fi doméstico, rede LAN ou servidores à distância.
        </div>
      </div>
    </div>
  );
};
