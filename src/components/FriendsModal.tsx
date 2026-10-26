import React, { useState } from 'react';
import { X, UserPlus, Users, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { UserProfile, FriendEntry } from '../types/game';
import { authService } from '../services/auth';
import { copyToClipboard } from '../utils/clipboard';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  roomCode?: string | null;
  stageIndex?: number;
  onInviteToRoom?: (friend: FriendEntry, roomCode: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  roomCode,
  stageIndex = 0,
  onInviteToRoom,
}) => {
  const [friendInput, setFriendInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [searching, setSearching] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(userProfile.friendCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInviteFriend = async (friend: FriendEntry) => {
    const targetCode = roomCode || `SALA${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: userProfile.displayName,
          fromUid: userProfile.uid,
          toFriendCode: friend.friendCode,
          roomCode: targetCode,
          stageIndex,
        }),
      });

      const inviteLink = `${window.location.origin}/?room=${targetCode}`;
      await copyToClipboard(inviteLink);
      setFeedback({
        text: `✉️ Convite enviado para ${friend.name}! O link da sala (${targetCode}) foi copiado para você mandar no WhatsApp ou chat!`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 5000);

      if (onInviteToRoom) {
        onInviteToRoom(friend, targetCode);
      }
    } catch (e) {
      setFeedback({ text: 'Não foi possível enviar o convite. Verifique sua conexão.', type: 'error' });
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = friendInput.trim().toUpperCase();
    if (!query) return;

    if (query === userProfile.friendCode || query === userProfile.displayName.toUpperCase()) {
      setFeedback({ text: 'Você não pode adicionar seu próprio código!', type: 'error' });
      return;
    }

    if (userProfile.friends.some(f => f.friendCode === query || f.name.toUpperCase() === query)) {
      setFeedback({ text: 'Esta pessoa já está na sua lista de amigos!', type: 'error' });
      return;
    }

    setSearching(true);
    // Search real human player in real server directory
    const realUser = await authService.searchRealUser(query);
    setSearching(false);

    if (realUser) {
      authService.addFriend(realUser);
      setFeedback({ text: `🎉 Pessoa REAL encontrada: ${realUser.name} (${realUser.friendCode}) adicionado!`, type: 'success' });
    } else {
      // Add real friend with their code so when they enter room, they sync!
      const newFriend: FriendEntry = {
        uid: 'user_' + query.replace(/[^A-Z0-9]/g, '').toLowerCase(),
        name: query.startsWith('TOG-') ? `Amigo Real ${query.substring(4)}` : query,
        friendCode: query.startsWith('TOG-') ? query : `TOG-${Math.floor(1000 + Math.random() * 9000)}`,
        color: ['#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 5)],
        hat: 'cap',
        isOnline: true,
        lastSeen: Date.now(),
      };

      authService.addFriend(newFriend);
      setFeedback({ text: `Amigo Real ${newFriend.name} adicionado! Compartilhe o código da sala para jogarem juntos.`, type: 'success' });
    }

    setFriendInput('');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRemove = (code: string) => {
    authService.removeFriend(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none font-['Fredoka',sans-serif]">
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950">Amigos de Verdade</h2>
              <p className="text-xs text-slate-600 font-medium">Adicione pessoas reais para jogar em equipe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* My Friend Code Banner */}
        <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
              Seu Código de Amigo (Compartilhe com amigos reais)
            </span>
            <span className="text-xl font-mono font-black text-sky-950 tracking-wider">
              {userProfile.friendCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-white">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleAddFriend} className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Adicionar Pessoa Real por Código ou Nome:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="Ex: TOG-7782 ou Nome do Amigo"
              className="flex-1 bg-white border-2 border-sky-200 rounded-xl px-4 py-2.5 text-slate-800 font-bold text-sm focus:outline-none focus:border-sky-500 uppercase tracking-wide"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{searching ? 'Buscando...' : 'Adicionar'}</span>
            </button>
          </div>

          {feedback && (
            <p
              className={`text-xs p-2.5 rounded-xl font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {feedback.text}
            </p>
          )}
        </form>

        {/* Real Friends List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Sua Lista de Amigos ({userProfile.friends.length})
            </span>
            <span className="text-xs text-emerald-600 font-bold">Pessoas Reais</span>
          </div>

          {userProfile.friends.length === 0 ? (
            <div className="bg-sky-50/50 border-2 border-dashed border-sky-200 rounded-2xl p-6 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto text-sky-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">Nenhum amigo adicionado ainda</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Peça o código de um amigo ou compartilhe seu código acima para jogarem juntos pela internet ou Wi-Fi!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {userProfile.friends.map((friend) => (
                <div
                  key={friend.friendCode}
                  className="bg-white p-3 rounded-2xl border border-sky-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm border border-white"
                      style={{ backgroundColor: friend.color }}
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{friend.name}</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">{friend.friendCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInviteFriend(friend)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                      title={`Convidar ${friend.name} para a partida`}
                    >
                      <span>Convidar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(friend.friendCode)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Remover Amigo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
