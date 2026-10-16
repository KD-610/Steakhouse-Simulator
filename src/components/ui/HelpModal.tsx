import React from 'react';
import { X, Utensils, Compass, Sparkles, Award } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center text-xl">
              🥩
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">
                3D Nusa-Et Steakhouse Tycoon
              </h2>
              <p className="text-xs text-slate-400">
                Lüks Et Krallığınızı Kurma & Yönetme Rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
          {/* Controls */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-2 text-sm mb-3">
              <Compass className="w-4 h-4" /> Temel Kontroller
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">W, A, S, D / Ok Tuşları:</span>
              <span className="font-bold text-white">Yürüme</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">Fare Hareketi:</span>
              <span className="font-bold text-white">Etrafına Bakma</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">E Tuşu / Sol Tık:</span>
              <span className="font-bold text-amber-400">Etkileşim (Pişir, Al, Ver)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">F Tuşu:</span>
              <span className="font-bold text-amber-400">Altın Tuzu Serp (Nusret)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">1 - 7 Rakamları:</span>
              <span className="font-bold text-white">Menüden Yemek Seçimi</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-300">TAB Tuşu:</span>
              <span className="font-bold text-white">Dekorasyon & Mobilya Mağazası</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-300">Scratch Sayı Kodu:</span>
              <span className="font-bold text-amber-400">Üst Bardaki "# Sayı Kodu" Butonu</span>
            </div>
          </div>

          {/* Restaurant Gameplay Loop */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-2.5">
            <div className="font-bold text-amber-400 flex items-center gap-2 text-sm mb-3">
              <Utensils className="w-4 h-4" /> Servis & Kazanç Döngüsü
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <p className="text-slate-300">
                Müşteriler kapıdan girip boş masalara oturur. Masaya yaklaşıp <strong className="text-white">E</strong> ile siparişlerini alın.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <p className="text-slate-300">
                Alttaki menüden yemeği seçip ızgaraya gidin. <strong className="text-white">E</strong> ile pişirin, duman tüterken pişmesini bekleyin ve alın.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <p className="text-slate-300">
                Ana yemeği masaya servis edin! Müşteri yerken <strong className="text-amber-400">F</strong> ile altın tuz serperek bahşişinizi katlayın.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <p className="text-slate-300">
                <strong className="text-amber-300">Yemek Sonrası Tatlı:</strong> Müşteri yemeği bitirince Hatay Künefesi veya Havuç Baklava ister! Tatlıyı fırında/ızgarada hazırlayıp servis edin.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                5
              </span>
              <p className="text-slate-300">
                Müşteri hem yemek hem tatlı ücretini yüksek bahşişle öder. Kazandığınız paralarla salonunuzu büyütün ve garson kiralayın!
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/20 mb-6 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">Şefin Altın İpucu:</strong>
            VIP masalar (+%60 bahşiş) ve Lüks Localar satın aldığınızda müşteriler kat kat daha fazla bahşiş bırakır. Garson kiralayarak sipariş alma yükünü personelinize devredebilirsiniz!
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4" />
          <span>ANLADIM, RESTORANA DÖN</span>
        </button>
      </div>
    </div>
  );
};
