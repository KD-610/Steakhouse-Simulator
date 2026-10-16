import React from 'react';
import { DishId } from '../../types/game';
import { MENU_ITEMS } from '../../data/gameConstants';
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  customerId: string;
  dishId: DishId;
  tableIndex: number;
  state: string;
}

interface OrderListPanelProps {
  orders: OrderItem[];
}

export const OrderListPanel: React.FC<OrderListPanelProps> = ({ orders }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="absolute top-24 left-4 z-30 pointer-events-auto w-72 glass-panel rounded-2xl p-4 shadow-2xl border border-amber-500/30 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-xs tracking-wide">Bekleyen Siparişler</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md font-mono-numbers">
            {orders.length}
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {orders.length === 0 ? (
            <div className="text-slate-400 text-xs italic text-center py-3">
              Bekleyen aktif sipariş yok
            </div>
          ) : (
            orders.map(order => {
              const dish = MENU_ITEMS[order.dishId] || MENU_ITEMS.biftek;
              const isWaitingOrder = order.state === 'WAITING_ORDER';
              const isWaitingDessertOrder = order.state === 'WAITING_DESSERT_ORDER';
              const isWaitingDessert = order.state === 'WAITING_DESSERT';

              let badgeText = 'Sipariş Al';
              let badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

              if (order.state === 'WAITING_FOOD') {
                badgeText = 'Yemek Servis';
                badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
              } else if (isWaitingDessertOrder) {
                badgeText = 'Tatlı İsteği 🍯';
                badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              } else if (isWaitingDessert) {
                badgeText = 'Tatlı Servis 🥮';
                badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              }

              return (
                <div
                  key={order.customerId}
                  className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{dish.emoji}</span>
                    <div>
                      <div className="font-bold text-white leading-tight">{dish.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Masa #{order.tableIndex + 1}
                        {isWaitingDessertOrder || isWaitingDessert ? ' • Yemek Sonrası Tatlı' : ' • Ana Yemek'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${badgeStyle}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
