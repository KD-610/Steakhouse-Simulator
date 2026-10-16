import React from 'react';
import { GameStats } from '../../types/game';
import { X, Sun, Sliders, MousePointer, Sparkles, Compass } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onUpdateSensitivity: (sens: number) => void;
  onUpdateLighting: (level: 'bright' | 'ultra' | 'warm') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateSensitivity,
  onUpdateLighting
}) => {
  if (!isOpen) return null;

  const currentSens = stats.sensitivity ?? 1.0;
  const currentLighting = stats.lightingLevel ?? 'bright';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">Işık & Hassasiyet Ayarları</h3>
              <p className="text-xs text-slate-400">Restoran aydınlatması ve kamera hassasiyeti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Lighting Controls */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sun className="w-4 h-4" />
              <span>Restoran Işık Seviyesi (Lighting)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateLighting('bright')}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer border ${
                  currentLighting === 'bright'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800/80 text-slate-300 border-transparent hover:text-white'
                }`}
              >
                <span>☀️</span>
                <span className="text-[11px]">Sıcak & Parlak</span>
              </button>

              <button
                onClick={() => onUpdateLighting('ultra')}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer border ${
                  currentLighting === 'ultra'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800/80 text-slate-300 border-transparent hover:text-white'
                }`}
              >
                <span>🌟</span>
                <span className="text-[11px]">Ekstra Işık (Ultra)</span>
              </button>

              <button
                onClick={() => onUpdateLighting('warm')}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer border ${
                  currentLighting === 'warm'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-800/80 text-slate-300 border-transparent hover:text-white'
                }`}
              >
                <span>🍷</span>
                <span className="text-[11px]">Loş Steakhouse</span>
              </button>
            </div>
          </div>

          {/* Mouse Sensitivity Controls */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                <span>Gerçek Fare Hassasiyeti (True Sensitivity)</span>
              </div>
              <span className="font-mono-numbers bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs">
                {currentSens.toFixed(2)}x
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={currentSens}
              onChange={e => onUpdateSensitivity(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers">
              <span>Hassas (0.4x)</span>
              <span>Standart (1.0x)</span>
              <span>Hızlı (2.5x)</span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: 'Yavaş', val: 0.7 },
                { label: 'Standart', val: 1.0 },
                { label: 'Hızlı', val: 1.4 },
                { label: 'Çok Hızlı', val: 1.8 }
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => onUpdateSensitivity(p.val)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                    Math.abs(currentSens - p.val) < 0.05
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                      : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Straighten Camera Action Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('straighten-camera'));
                onClose();
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Kamerayı Doğrult / Düzelt (C Tuşu)</span>
            </button>
          </div>

          {/* Hint */}
          <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Fareyi döndürürken tıklayıp sürükleyebilir veya ekrana tıklayarak fare imlecini 1. şahıs moduna kilitleyebilirsiniz.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
