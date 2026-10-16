import React from 'react';
import { DishId } from '../../types/game';
import { MENU_ITEMS } from '../../data/gameConstants';
import { Sparkles } from 'lucide-react';

interface HoldingIndicatorProps {
  holdingItem: DishId | null;
  sprinkleAvailable: boolean;
  onSprinkle: () => void;
}

export const HoldingIndicator: React.FC<HoldingIndicatorProps> = ({
  holdingItem,
  sprinkleAvailable,
  onSprinkle
}) => {
  if (!holdingItem && !sprinkleAvailable) return null;

  const dish = holdingItem ? MENU_ITEMS[holdingItem] : null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-3">
      {dish && (
        <div className="glass-panel rounded-2xl px-5 py-2.5 flex items-center gap-3 border border-red-500/40 shadow-2xl animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-lg">
            {dish.emoji}
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              Elinizdeki Servis
            </div>
            <div className="text-sm font-bold text-white">
              {dish.name}
            </div>
          </div>
        </div>
      )}

      {sprinkleAvailable && (
        <button
          onClick={onSprinkle}
          className="glass-panel hover:bg-amber-500/20 text-amber-300 border border-amber-400/50 px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-2xl cursor-pointer transform active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Altın Tuzu Serp (F)</span>
        </button>
      )}
    </div>
  );
};
