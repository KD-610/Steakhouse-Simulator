import React from 'react';
import { DishId } from '../../types/game';
import { MENU_ITEMS } from '../../data/gameConstants';

interface FoodSelectorBarProps {
  activeDish: DishId;
  onSelectDish: (dishId: DishId) => void;
}

export const FoodSelectorBar: React.FC<FoodSelectorBarProps> = ({
  activeDish,
  onSelectDish
}) => {
  const dishes = Object.values(MENU_ITEMS);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto glass-panel rounded-2xl p-2 flex items-center gap-2 border border-amber-500/30 shadow-2xl overflow-x-auto max-w-[95vw]">
      <span className="text-[10px] text-amber-400 font-bold px-2 uppercase whitespace-nowrap tracking-wider">
        Izgara & Ocak:
      </span>
      <div className="flex items-center gap-1.5">
        {dishes.map((dish, idx) => {
          const isActive = activeDish === dish.id;
          const isDessert = dish.category === 'dessert';
          const isFirstDessert = idx === 5;

          return (
            <React.Fragment key={dish.id}>
              {isFirstDessert && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider whitespace-nowrap bg-amber-500/10 px-2 py-1 rounded-lg">
                    Tatlılar (Yemek Sonrası):
                  </span>
                </div>
              )}
              <button
                onClick={() => onSelectDish(dish.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : isDessert
                    ? 'bg-amber-950/40 text-amber-200 hover:text-white hover:bg-amber-900/60 border border-amber-500/30'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{dish.emoji}</span>
                <span>{dish.name}</span>
                <span
                  className={`text-[9px] px-1 rounded font-mono-numbers ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  [{idx + 1}]
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
