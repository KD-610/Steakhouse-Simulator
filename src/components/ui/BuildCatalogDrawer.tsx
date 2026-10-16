import React, { useState } from 'react';
import { CatalogCategory, CatalogItem } from '../../types/game';
import { CATALOG } from '../../data/gameConstants';
import {
  X,
  RotateCw,
  MousePointer,
  Trash2,
  Utensils,
  Flame,
  Sparkles,
  Armchair,
  Crown,
  Zap,
  CircleDot,
  Snowflake,
  Palmtree,
  ShieldCheck,
  Sun,
  Image as ImageIcon,
  Layers
} from 'lucide-react';

interface BuildCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: CatalogItem | null;
  onSelectItem: (item: CatalogItem) => void;
  money: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-5 h-5 text-amber-400" />,
  Armchair: <Armchair className="w-5 h-5 text-red-400" />,
  Crown: <Crown className="w-5 h-5 text-amber-400" />,
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Zap: <Zap className="w-5 h-5 text-yellow-400" />,
  CircleDot: <CircleDot className="w-5 h-5 text-amber-500" />,
  Snowflake: <Snowflake className="w-5 h-5 text-sky-400" />,
  Palmtree: <Palmtree className="w-5 h-5 text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-amber-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-red-400" />,
  Sun: <Sun className="w-5 h-5 text-yellow-300" />,
  Image: <ImageIcon className="w-5 h-5 text-amber-300" />,
  Layers: <Layers className="w-5 h-5 text-rose-400" />
};

export const BuildCatalogDrawer: React.FC<BuildCatalogDrawerProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onSelectItem,
  money
}) => {
  const [currentCategory, setCurrentCategory] = useState<CatalogCategory>('tables');

  if (!isOpen) return null;

  const items = CATALOG[currentCategory];

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-96 z-40 glass-panel border-l border-white/10 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-black text-white font-display">Dekorasyon Mağazası</h2>
          <p className="text-xs text-slate-400">Restoranınızı dilediğiniz gibi tasarlayın</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-4 bg-slate-900/90 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setCurrentCategory('tables')}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer text-center truncate ${
            currentCategory === 'tables' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Masalar
        </button>
        <button
          onClick={() => setCurrentCategory('outdoor')}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer text-center truncate ${
            currentCategory === 'outdoor' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Teras & Tabela
        </button>
        <button
          onClick={() => setCurrentCategory('kitchen')}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer text-center truncate ${
            currentCategory === 'kitchen' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mutfak
        </button>
        <button
          onClick={() => setCurrentCategory('decor')}
          className={`py-2 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer text-center truncate ${
            currentCategory === 'decor' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Lüks Dekor
        </button>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {items.map(item => {
          const isSelected = selectedItem?.id === item.id;
          const canAfford = money >= item.price;
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                  : 'bg-slate-900/70 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center">
                  {ICON_MAP[item.icon] || <Utensils className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <div className="font-bold text-white text-xs leading-tight">{item.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.desc}</div>
                  {item.tipBonus ? (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      +%{item.tipBonus} Ekstra Bahşiş
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div
                  className={`font-bold text-xs font-mono-numbers ${
                    canAfford ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  ₺{item.price}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isSelected ? 'Seçildi' : 'Seç'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper Shortcut Box */}
      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 space-y-1.5 bg-slate-900/60 p-3 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-amber-400" /> Döndürme:
          </span>
          <span className="font-bold text-white">R Tuşu</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MousePointer className="w-3.5 h-3.5 text-amber-400" /> Yerleştirme:
          </span>
          <span className="font-bold text-white">Sol Tık</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-amber-400" /> Eşya Sat / Kaldır:
          </span>
          <span className="font-bold text-white">Sağ Tık (%70 İade)</span>
        </div>
      </div>
    </aside>
  );
};
