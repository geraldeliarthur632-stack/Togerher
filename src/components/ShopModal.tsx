import React, { useState } from 'react';
import { X, Check, ShoppingBag, Sparkles, Coins, Crown, Shield, Zap, Search, Flame } from 'lucide-react';
import { UserProfile, HatType, PlayerCustomization } from '../types/game';
import { authService } from '../services/auth';
import { sound } from '../services/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'hat' | 'skin';
  cost: number;
  description: string;
  hat?: HatType;
  color?: string;
  secondaryColor?: string;
  badge: 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico';
}

// Full Luxury Shop Collection: Cheapest items are 15-20 coins, up to 300 coins for legendary items!
const SHOP_ITEMS: ShopItem[] = [
  // --- ACESSÓRIOS & CHAPÉUS (Mais baratos 15-20 moedas até 300 moedas) ---
  {
    id: 'chef',
    name: 'Toque de Chef Mestre',
    category: 'hat',
    cost: 15,
    hat: 'chef',
    description: 'Chapéu culinário clássico de gala para cozinhar vitórias!',
    badge: 'Comum',
  },
  {
    id: 'party_hat',
    name: 'Chapéu de Festa Festivo',
    category: 'hat',
    cost: 15,
    hat: 'party_hat',
    description: 'Cone de festa com pompom animado para comemorar cada fase.',
    badge: 'Comum',
  },
  {
    id: 'sunglasses',
    name: 'Óculos Escuros Pixelados',
    category: 'hat',
    cost: 18,
    hat: 'sunglasses',
    description: 'Estilo pixel retro clássico para passar obstáculos com moral.',
    badge: 'Comum',
  },
  {
    id: 'tophat',
    name: 'Cartola de Gala Aristocrata',
    category: 'hat',
    cost: 20,
    hat: 'tophat',
    description: 'Elegância máxima com fita de cetim vermelha reluzente.',
    badge: 'Comum',
  },
  {
    id: 'sombrero',
    name: 'Sombrero Festivo Mexicano',
    category: 'hat',
    cost: 22,
    hat: 'sombrero',
    description: 'Aba larga bordada tradicional para celebrar em grande estilo.',
    badge: 'Raro',
  },
  {
    id: 'beanie',
    name: 'Gorro Vermelho de Lã',
    category: 'hat',
    cost: 24,
    hat: 'beanie',
    description: 'Gorro de inverno quentinho com pompom branco macio.',
    badge: 'Raro',
  },
  {
    id: 'cap',
    name: 'Boné Azul Esportivo',
    category: 'hat',
    cost: 25,
    hat: 'cap',
    description: 'Boné de aba curvada clássico para corredores velozes.',
    badge: 'Raro',
  },
  {
    id: 'cat_ears',
    name: 'Orelhinhas de Gato Kawaii',
    category: 'hat',
    cost: 28,
    hat: 'cat_ears',
    description: 'Orelhinhas felinas adoráveis com interior rosado saltitante.',
    badge: 'Raro',
  },
  {
    id: 'flower',
    name: 'Flor Tropical Rosa',
    category: 'hat',
    cost: 30,
    hat: 'flower',
    description: 'Pétalas cor-de-rosa perfumadas com miolo dourado.',
    badge: 'Raro',
  },
  {
    id: 'dino',
    name: 'Capuz Jurássico T-Rex',
    category: 'hat',
    cost: 35,
    hat: 'dino',
    description: 'Capuz de dinossauro reptiliano com espinhos dorsais.',
    badge: 'Raro',
  },
  {
    id: 'headphones',
    name: 'Fones Gamer RGB Neon',
    category: 'hat',
    cost: 40,
    hat: 'headphones',
    description: 'Fones ciano brilhantes com cancelamento de ruído estéreo.',
    badge: 'Épico',
  },
  {
    id: 'ninja',
    name: 'Faixa Ninja das Sombras',
    category: 'hat',
    cost: 48,
    hat: 'ninja',
    description: 'Faixa com laço escarlate que flutua durante saltos acrobáticos.',
    badge: 'Épico',
  },
  {
    id: 'wizard',
    name: 'Chapéu do Feiticeiro Astral',
    category: 'hat',
    cost: 55,
    hat: 'wizard',
    description: 'Canalize energias místicas e ilumine quebra-cabeças difíceis.',
    badge: 'Épico',
  },
  {
    id: 'viking',
    name: 'Elmo Nórdico com Chifres',
    category: 'hat',
    cost: 65,
    hat: 'viking',
    description: 'Forjado em ferro das terras geladas para guerreiros indomáveis.',
    badge: 'Épico',
  },
  {
    id: 'pirate',
    name: 'Tricórnio dos Sete Mares',
    category: 'hat',
    cost: 75,
    hat: 'pirate',
    description: 'Chapéu de capitão pirata com caveira dourada e bandana.',
    badge: 'Épico',
  },
  {
    id: 'astronaut',
    name: 'Capacete Espacial Lunar',
    category: 'hat',
    cost: 90,
    hat: 'astronaut',
    description: 'Visor polarizado para resistir ao vácuo e saltos com gravidade zero.',
    badge: 'Lendário',
  },
  {
    id: 'cyber_visor',
    name: 'Visor Cyberpunk Neon 2077',
    category: 'hat',
    cost: 110,
    hat: 'cyber_visor',
    description: 'Óculos holográficos com feixe de varredura digital em tempo real.',
    badge: 'Lendário',
  },
  {
    id: 'kitsune',
    name: 'Máscara Sagrada de Kitsune',
    category: 'hat',
    cost: 130,
    hat: 'kitsune',
    description: 'Máscara xintoísta da raposa mística com traços carmesins.',
    badge: 'Lendário',
  },
  {
    id: 'halo',
    name: 'Auréola Celestial Divina',
    category: 'hat',
    cost: 150,
    hat: 'halo',
    description: 'Brilho sagrado angelical flutuante de pura energia dourada.',
    badge: 'Mítico',
  },
  {
    id: 'samurai',
    name: 'Elmo Samurai Kabuto Dourado',
    category: 'hat',
    cost: 175,
    hat: 'samurai',
    description: 'Armadura feudal com o emblema da lua crescente dourada.',
    badge: 'Mítico',
  },
  {
    id: 'valkyrie',
    name: 'Diadema Alado da Valquíria',
    category: 'hat',
    cost: 200,
    hat: 'valkyrie',
    description: 'Asas douradas forjadas em Valhalla para os campeões dos portais.',
    badge: 'Mítico',
  },
  {
    id: 'demon_horns',
    name: 'Chifres de Demônio Abissal',
    category: 'hat',
    cost: 220,
    hat: 'demon_horns',
    description: 'Chifres de obsidiana ardente que irradiam poder sombrio.',
    badge: 'Mítico',
  },
  {
    id: 'dragon_horns',
    name: 'Chifres Ancestrais do Dragão',
    category: 'hat',
    cost: 250,
    hat: 'dragon_horns',
    description: 'Chifres draconianos ancestrais com pontas incandescentes de fogo.',
    badge: 'Mítico',
  },
  {
    id: 'diamond_crown',
    name: 'Coroa de Diamantes Puros',
    category: 'hat',
    cost: 275,
    hat: 'diamond_crown',
    description: 'A joia suprema lapidada com os diamantes mais raros do universo.',
    badge: 'Mítico',
  },
  {
    id: 'wizard_gold',
    name: 'Chapéu do Arquimago de Ouro',
    category: 'hat',
    cost: 290,
    hat: 'wizard_gold',
    description: 'Tecido com fios de ouro celestial e constelações estelares.',
    badge: 'Mítico',
  },
  {
    id: 'royal_crown',
    name: 'Coroa Imperial dos Campeões',
    category: 'hat',
    cost: 300,
    hat: 'royal_crown',
    description: 'A coroa mais nobre e lendária de todo o Together Friends!',
    badge: 'Mítico',
  },

  // --- SKINS & CORES ESPECIAIS (Mais baratas 15-20 moedas até 300 moedas) ---
  {
    id: 'skin_obsidian',
    name: 'Obsidiana Negra Fosca',
    category: 'skin',
    cost: 15,
    color: '#0f172a',
    secondaryColor: '#475569',
    description: 'Negro elegante com acabamento ardósia fosco de alta classe.',
    badge: 'Comum',
  },
  {
    id: 'skin_bubblegum',
    name: 'Rosa Chiclete Doce',
    category: 'skin',
    cost: 18,
    color: '#f472b6',
    secondaryColor: '#fdf2f8',
    description: 'Tons pasteis alegres e divertidos para saltar de bom humor.',
    badge: 'Comum',
  },
  {
    id: 'skin_ruby',
    name: 'Rubi Carmesim Intenso',
    category: 'skin',
    cost: 20,
    color: '#e11d48',
    secondaryColor: '#fecdd3',
    description: 'Vermelho vibrante que se destaca em qualquer cenário do jogo.',
    badge: 'Comum',
  },
  {
    id: 'skin_toxic',
    name: 'Verde Radioativo Atômico',
    category: 'skin',
    cost: 25,
    color: '#84cc16',
    secondaryColor: '#d9f99d',
    description: 'Pigmento elétrico altamente energizado com brilho neon.',
    badge: 'Raro',
  },
  {
    id: 'skin_emerald',
    name: 'Esmeralda Mágica Cintilante',
    category: 'skin',
    cost: 30,
    color: '#10b981',
    secondaryColor: '#a7f3d0',
    description: 'Verde precioso das florestas encantadas e templos sagrados.',
    badge: 'Raro',
  },
  {
    id: 'skin_ice_crystal',
    name: 'Gelo Glacial Ártico',
    category: 'skin',
    cost: 38,
    color: '#38bdf8',
    secondaryColor: '#e0f2fe',
    description: 'Reflexos cristalinos congelados de uma caverna de gelo eterno.',
    badge: 'Raro',
  },
  {
    id: 'skin_fire',
    name: 'Fogo Vulcânico Fervente',
    category: 'skin',
    cost: 50,
    color: '#ea580c',
    secondaryColor: '#fed7aa',
    description: 'Energia incandescente direta dos vulcões do Mundo Pesadelo.',
    badge: 'Épico',
  },
  {
    id: 'skin_amethyst',
    name: 'Ametista Cósmica Reluzente',
    category: 'skin',
    cost: 65,
    color: '#a855f7',
    secondaryColor: '#f3e8ff',
    description: 'Púrpura profundo cristalino que reluz sob a luz dos portais.',
    badge: 'Épico',
  },
  {
    id: 'skin_neon_cyber',
    name: 'Ciber Ciano Cibernético',
    category: 'skin',
    cost: 85,
    color: '#06b6d4',
    secondaryColor: '#a5f3fc',
    description: 'Luzes de neon futuristas inspiradas nas cidades cibernéticas.',
    badge: 'Épico',
  },
  {
    id: 'skin_solar',
    name: 'Solar Chama Dourada',
    category: 'skin',
    cost: 105,
    color: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Radiação solar radiante que aquece e inspira seus parceiros.',
    badge: 'Lendário',
  },
  {
    id: 'skin_shadow_ninja',
    name: 'Sombra Abissal Fantasma',
    category: 'skin',
    cost: 130,
    color: '#1e1b4b',
    secondaryColor: '#4338ca',
    description: 'Camuflagem das trevas para avançar com discrição e elegância.',
    badge: 'Lendário',
  },
  {
    id: 'skin_galaxy',
    name: 'Galáxia Espacial Nebulosa',
    category: 'skin',
    cost: 160,
    color: '#7c3aed',
    secondaryColor: '#c4b5fd',
    description: 'Poeira estelar violeta e constelações distantes do infinito.',
    badge: 'Lendário',
  },
  {
    id: 'skin_rainbow',
    name: 'Arco-Íris Prisma Radiante',
    category: 'skin',
    cost: 200,
    color: '#ec4899',
    secondaryColor: '#38bdf8',
    description: 'Vibração multicolorida dinâmica que brilha em todas as cores!',
    badge: 'Mítico',
  },
  {
    id: 'skin_gold',
    name: 'Ouro 24K Imperial Reluzente',
    category: 'skin',
    cost: 240,
    color: '#eab308',
    secondaryColor: '#fef08a',
    description: 'Banhado em ouro puro maciço. O visual definitivo dos vencedores!',
    badge: 'Mítico',
  },
  {
    id: 'skin_diamond_god',
    name: 'Diamante Astral Supremo',
    category: 'skin',
    cost: 280,
    color: '#0284c7',
    secondaryColor: '#e0f2fe',
    description: 'Lapidação divina de diamante cósmico de valor incalculável.',
    badge: 'Mítico',
  },
  {
    id: 'skin_cosmic_titan',
    name: 'Titã do Cosmos Infinito',
    category: 'skin',
    cost: 300,
    color: '#4c1d95',
    secondaryColor: '#f43f5e',
    description: 'A fusão suprema entre a energia do buraco negro e do fogo cósmico.',
    badge: 'Mítico',
  },
];

const getHatEmoji = (hat?: HatType) => {
  switch (hat) {
    case 'royal_crown': return '👑';
    case 'diamond_crown': return '💎';
    case 'dragon_horns': return '🐉';
    case 'demon_horns': return '😈';
    case 'valkyrie': return '🪽';
    case 'samurai': return '⚔️';
    case 'halo': return '😇';
    case 'kitsune': return '🦊';
    case 'cyber_visor': return '🕶️';
    case 'wizard_gold': return '✨';
    case 'viking': return '🛡️';
    case 'pirate': return '🏴‍☠️';
    case 'astronaut': return '🚀';
    case 'wizard': return '🧙‍♂️';
    case 'ninja': return '🥷';
    case 'dino': return '🦖';
    case 'cat_ears': return '🐱';
    case 'sombrero': return '🇲🇽';
    case 'party_hat': return '🎉';
    case 'sunglasses': return '😎';
    case 'chef': return '👨‍🍳';
    case 'tophat': return '🎩';
    case 'beanie': return '🧶';
    case 'flower': return '🌸';
    case 'headphones': return '🎧';
    case 'cap': return '🧢';
    default: return '🎩';
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case 'Mítico': return 'bg-amber-100 text-amber-900 border-amber-300 font-black';
    case 'Lendário': return 'bg-purple-100 text-purple-900 border-purple-300 font-black';
    case 'Épico': return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
    case 'Raro': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    default: return 'bg-slate-100 text-slate-800 border-slate-200 font-medium';
  }
};

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [tab, setTab] = useState<'all' | 'hat' | 'skin'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentCoins = userProfile.coins || 0;
  const unlocked = userProfile.unlockedSkins || [];

  const handleBuy = (item: ShopItem) => {
    if (unlocked.includes(item.id)) {
      equipItem(item);
      return;
    }

    if (currentCoins < item.cost) {
      sound.playDefeat();
      const falta = item.cost - currentCoins;
      setFeedback(`Moedas insuficientes! Você tem ${currentCoins} e precisa de ${item.cost} moedas (faltam ${falta}). Vença fases para ganhar moedas!`);
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    const customizationUpdates: Partial<PlayerCustomization> = {};
    if (item.category === 'hat' && item.hat) {
      customizationUpdates.hat = item.hat;
    }
    if (item.category === 'skin' && item.color) {
      customizationUpdates.color = item.color;
      if (item.secondaryColor) customizationUpdates.secondaryColor = item.secondaryColor;
    }

    const success = authService.buySkin(item.id, item.cost, customizationUpdates);
    if (success) {
      sound.playVictory();
      setFeedback(`🎉 Parabéns! Você comprou e equipou: ${item.name}!`);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const equipItem = (item: ShopItem) => {
    sound.playCheckpoint();
    if (item.category === 'hat' && item.hat) {
      authService.updateProfile({
        customization: { ...userProfile.customization, hat: item.hat },
      });
      setFeedback(`Equipado: ${item.name}!`);
    } else if (item.category === 'skin' && item.color) {
      authService.updateProfile({
        customization: {
          ...userProfile.customization,
          color: item.color,
          secondaryColor: item.secondaryColor || userProfile.customization.secondaryColor,
        },
      });
      setFeedback(`Equipado: ${item.name}!`);
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const isEquipped = (item: ShopItem) => {
    if (item.category === 'hat') {
      return userProfile.customization.hat === item.hat;
    }
    return userProfile.customization.color === item.color;
  };

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (tab !== 'all' && item.category !== tab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q);
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/45 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-['Fredoka',sans-serif]">
      {/* Responsive Modal Container (Adapts to PC, Tablet, Mobile) */}
      <div className="bg-white/95 border-2 border-sky-200 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-sky-950">Loja de Skins & Acessórios</h2>
              <p className="text-xs text-slate-600 font-medium">Itens nobres e raros para personalizar seu aventureiro</p>
            </div>
          </div>

          {/* User Coins Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 px-3.5 py-1.5 rounded-full shadow-sm">
              <Coins className="w-4 h-4 text-amber-600 animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-base font-black text-amber-900">{currentCoins}</span>
              <span className="text-[10px] font-bold uppercase text-amber-700">Moedas</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1 bg-sky-100/70 rounded-2xl border border-sky-200 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                tab === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tudo ({SHOP_ITEMS.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('hat')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                tab === 'hat' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Acessórios (26)
            </button>
            <button
              type="button"
              onClick={() => setTab('skin')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                tab === 'skin' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skins & Cores (16)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar item, categoria ou raridade..."
              className="w-full bg-white border border-sky-200 focus:border-sky-400 rounded-xl px-3.5 py-1.5 pl-9 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
          </div>
        </div>

        {feedback && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold p-3 rounded-2xl text-center animate-shake">
            {feedback}
          </div>
        )}

        {/* Scrollable Items Grid (Responsive 1 col mobile, 2 col tablet, 3 col PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isOwned = unlocked.includes(item.id);
            const equipped = isEquipped(item);
            const canAfford = currentCoins >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                  equipped
                    ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-300/40'
                    : isOwned
                    ? 'bg-white border-sky-200 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 hover:border-sky-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase border ${getBadgeColor(item.badge)}`}>
                      {item.badge}
                    </span>
                    <div className="flex items-center gap-1 text-amber-700 font-black text-xs">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.cost} moedas</span>
                    </div>
                  </div>

                  {/* Visual preview dot / badge */}
                  <div className="flex items-center gap-2.5 my-1.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white text-lg shrink-0"
                      style={{
                        backgroundColor: item.color || userProfile.customization.color,
                      }}
                    >
                      {item.category === 'hat' ? (
                        <span>{getHatEmoji(item.hat)}</span>
                      ) : (
                        <span className="text-sm">✨</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  {equipped ? (
                    <span className="w-full text-center text-xs font-black text-emerald-600 flex items-center justify-center gap-1 py-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Equipado
                    </span>
                  ) : isOwned ? (
                    <button
                      type="button"
                      onClick={() => equipItem(item)}
                      className="w-full py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-xs transition cursor-pointer"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      className={`w-full py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 shadow-sm'
                          : 'bg-slate-200 text-slate-400 opacity-80'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Comprar ({item.cost})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 font-semibold border-t border-sky-100 flex items-center justify-between flex-wrap gap-1">
          <span>O mais barato custa de 15 a 20 moedas · Itens míticos até 300 moedas</span>
          <span className="text-amber-700 font-bold">Ganhe +1 Moeda a cada vitória em equipe!</span>
        </div>
      </div>
    </div>
  );
};
