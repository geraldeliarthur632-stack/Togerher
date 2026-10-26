import React, { useState, useEffect } from 'react';
import { X, Users, Plus, LogIn, Copy, Check, RefreshCw, Bot, Keyboard } from 'lucide-react';
import { PlayerCustomization } from '../types/game';

interface PublicRoomInfo {
  code: string;
  playerCount: number;
  maxPlayers: number;
  stageIndex: number;
  hostName: string;
}

interface LobbyModalProps {
  customization: PlayerCustomization;
  isOpen: boolean;
  onClose: () => void;
  onStartSoloBot: () => void;
  onStartLocal2P: () => void;
  onJoinOnlineRoom: (roomCode: string) => void;
  onCreateOnlineRoom: (isPrivate: boolean) => void;
  currentRoomCode: string | null;
  isHost: boolean;
  onlinePlayers: { id: string; name: string; color: string }[];
  onStartOnlineGame?: () => void;
  onLeaveRoom?: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  customization,
  isOpen,
  onClose,
  onStartSoloBot,
  onStartLocal2P,
  onJoinOnlineRoom,
  onCreateOnlineRoom,
  currentRoomCode,
  isHost,
  onlinePlayers,
  onStartOnlineGame,
  onLeaveRoom,
}) => {
  const [tab, setTab] = useState<'modes' | 'online' | 'join'>('modes');
  const [roomInput, setRoomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoomInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (tab === 'online') {
      fetchPublicRooms();
    }
  }, [tab]);

  const fetchPublicRooms = () => {
    setIsRefreshing(true);
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.rooms)) {
          setPublicRooms(data.rooms);
        }
      })
      .catch((err) => {
        console.warn('Erro ao buscar salas públicas:', err);
      })
      .finally(() => setIsRefreshing(false));
  };

  const handleCopyCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Central de Partidas</h2>
              <p className="text-xs text-slate-400">Jogue cooperativo online, local ou com IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* If inside an online room */}
        {currentRoomCode ? (
          <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-2xl border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Código da Sala</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-extrabold tracking-widest text-white font-mono bg-blue-950/80 px-4 py-1.5 rounded-xl border border-blue-600/40">
                    {currentRoomCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Jogadores</span>
                <div className="text-xl font-bold text-white">{onlinePlayers.length}/4</div>
              </div>
            </div>

            {/* Players list */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">Aventureiros na Sala:</span>
              <div className="grid grid-cols-2 gap-2">
                {onlinePlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-sm font-bold text-slate-200 truncate">{p.name}</span>
                    {idx === 0 && (
                      <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Host action / waiting message */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 hover:bg-red-900/60 font-semibold text-sm transition"
                >
                  Sair da Sala
                </button>
              )}

              {isHost && onStartOnlineGame && (
                <button
                  onClick={() => {
                    onStartOnlineGame();
                    onClose();
                  }}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold shadow-lg transition text-center"
                >
                  Começar Partida Juntos!
                </button>
              )}

              {!isHost && (
                <div className="text-sm text-slate-400 italic">
                  Aguardando o anfitrião iniciar o jogo...
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setTab('modes')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                  tab === 'modes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Modos de Jogo
              </button>
              <button
                onClick={() => setTab('online')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                  tab === 'online' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Multiplayer Online
              </button>
            </div>

            {/* TAB: MODES */}
            {tab === 'modes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Solo with Buddy AI */}
                <div
                  onClick={() => {
                    onStartSoloBot();
                    onClose();
                  }}
                  className="group bg-gradient-to-br from-purple-900/40 to-slate-900 p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 cursor-pointer transition shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Bot className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                      Solo com Robô Amigo (Buddy)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Jogue sozinho com um companheiro IA autônomo que pisa em botões, aciona elevadores e te ajuda nos puzzles!
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-bold text-purple-400 flex items-center gap-1">
                    Jogar com Buddy →
                  </span>
                </div>

                {/* Local 2-Player */}
                <div
                  onClick={() => {
                    onStartLocal2P();
                    onClose();
                  }}
                  className="group bg-gradient-to-br from-emerald-900/40 to-slate-900 p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Keyboard className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                      2 Jogadores Local (Mesmo PC)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Divida o teclado! Jogador 1 usa WASD + Espaço e Jogador 2 usa Setas + Enter/0.
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
                    Jogar em Dupla →
                  </span>
                </div>
              </div>
            )}

            {/* TAB: ONLINE MULTIPLAYER */}
            {tab === 'online' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onCreateOnlineRoom(false)}
                    className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-lg transition"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Criar Nova Sala</span>
                    <span className="text-[10px] text-blue-200">Gera código de 5 dígitos</span>
                  </button>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">Entrar com Código:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: TOG77"
                        maxLength={5}
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-center text-white font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (roomInput.trim().length >= 3) {
                            onJoinOnlineRoom(roomInput.trim());
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition"
                      >
                        <LogIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Salas Públicas Abertas
                    </span>
                    <button
                      onClick={fetchPublicRooms}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                      title="Atualizar"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {publicRooms.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                      {publicRooms.map((r) => (
                        <div
                          key={r.code}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-600/30">
                              {r.code}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                Anfitrião: {r.hostName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Fase {r.stageIndex + 1} · {r.playerCount}/{r.maxPlayers} Jogadores
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onJoinOnlineRoom(r.code);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
                          >
                            Entrar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Nenhuma sala pública aberta no momento. Crie uma sala acima e envie o código para seu amigo!
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
