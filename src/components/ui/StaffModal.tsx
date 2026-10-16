import React from 'react';
import { GameStats } from '../../types/game';
import { X, UserCheck, Flame, Wine, Sparkles } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onHireWaiter: () => void;
  onUpgradeChef: () => void;
  onUpgradeSommelier: () => void;
  onUpgradeSaltMaster: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  stats,
  onHireWaiter,
  onUpgradeChef,
  onUpgradeSommelier,
  onUpgradeSaltMaster
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">Personel & Akademi</h3>
              <p className="text-xs text-slate-400">Ekibinizi genişletin ve mutfağınızı güçlendirin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Waiter Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Garson İşe Al</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Masaları gezer ve siparişleri otomatik teslim alır.
                </div>
                <div className="text-amber-400 font-bold text-xs mt-1 font-mono-numbers">
                  ₺600 / Eleman (Mevcut: {stats.waiterCount}/5)
                </div>
              </div>
            </div>
            <button
              onClick={onHireWaiter}
              disabled={stats.waiterCount >= 5 || stats.money < 600}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ml-3 ${
                stats.waiterCount >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : stats.money < 600
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
              }`}
            >
              {stats.waiterCount >= 5 ? 'Maksimum' : 'İşe Al'}
            </button>
          </div>

          {/* Master Chef Card */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Usta Izgaracı Yükseltmesi</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Yemekler %40 daha hızlı pişer ve boş ızgaralara otomatik et atılır.
                </div>
                <div className="text-amber-400 font-bold text-xs mt-1 font-mono-numbers">
                  {stats.chefUpgrade ? 'AKTİF' : '₺1,200'}
                </div>
              </div>
            </div>
            <button
              onClick={onUpgradeChef}
              disabled={stats.chefUpgrade || stats.money < 1200}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ml-3 ${
                stats.chefUpgrade
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : stats.money < 1200
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
              }`}
            >
              {stats.chefUpgrade ? 'Aktif' : 'Geliştir'}
            </button>
          </div>

          {/* Sommelier Upgrade */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Wine className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">İçecek & Ayran Sommelieri</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Tüm müşterilerden masa başına +₺45 içecek kazancı sağlar.
                </div>
                <div className="text-amber-400 font-bold text-xs mt-1 font-mono-numbers">
                  {stats.sommelierUpgrade ? 'AKTİF' : '₺900'}
                </div>
              </div>
            </div>
            <button
              onClick={onUpgradeSommelier}
              disabled={stats.sommelierUpgrade || stats.money < 900}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ml-3 ${
                stats.sommelierUpgrade
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : stats.money < 900
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
              }`}
            >
              {stats.sommelierUpgrade ? 'Aktif' : 'Geliştir'}
            </button>
          </div>

          {/* Salt Master Upgrade */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Nusa-Et Şov Tuzlama Eğitimi</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Tuz serpme hareketi (F tuşu) bahşişleri %45&apos;ten %75&apos;e çıkartır!
                </div>
                <div className="text-amber-400 font-bold text-xs mt-1 font-mono-numbers">
                  {stats.saltMasterUpgrade ? 'AKTİF' : '₺1,500'}
                </div>
              </div>
            </div>
            <button
              onClick={onUpgradeSaltMaster}
              disabled={stats.saltMasterUpgrade || stats.money < 1500}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ml-3 ${
                stats.saltMasterUpgrade
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : stats.money < 1500
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
              }`}
            >
              {stats.saltMasterUpgrade ? 'Aktif' : 'Geliştir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
