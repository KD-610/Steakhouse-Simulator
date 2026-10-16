import React, { useState, useEffect } from 'react';
import { GameStats } from '../../types/game';
import {
  encodeScratchSave,
  decodeScratchSave,
  formatScratchCode,
  SavedFurnitureItem
} from '../../services/scratchSave';
import { loadSavedFurniture } from '../../services/storage';
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  Hash,
  Sparkles,
  AlertCircle,
  HelpCircle,
  KeyRound
} from 'lucide-react';

interface SaveCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onLoadSave: (newStats: GameStats, newFurniture?: SavedFurnitureItem[]) => void;
}

export const SaveCodeModal: React.FC<SaveCodeModalProps> = ({
  isOpen,
  onClose,
  stats,
  onLoadSave
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'presets'>('export');
  const [copied, setCopied] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const furniture = loadSavedFurniture() || undefined;
      const raw = encodeScratchSave(stats, furniture);
      setCurrentCode(formatScratchCode(raw));
      setCopied(false);
    }
  }, [isOpen, stats]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Live decoding preview of the input
  const preview = inputCode.trim() ? decodeScratchSave(inputCode) : null;

  const handleApplyImport = () => {
    if (!preview || !preview.success || !preview.stats) return;
    onLoadSave(preview.stats, preview.furniture);
    onClose();
  };

  // Preset codes for instant testing
  const presets = [
    {
      title: 'Zengin Başlangıç',
      desc: 'Seviye 2 Restoran, ₺25,000 Kasa, 3 Garson, Şef Yükseltmesi',
      code: encodeScratchSave({
        ...stats,
        restaurantLevel: 2,
        money: 25000,
        waiterCount: 3,
        chefUpgrade: true,
        reputation: 4.8,
        servedCount: 42,
        totalEarnings: 38000
      })
    },
    {
      title: 'Mega Nusa-Et Sarayı',
      desc: 'Seviye 4 Saray, ₺120,000 Kasa, 6 Garson, Tüm VIP Yükseltmeler',
      code: encodeScratchSave({
        ...stats,
        restaurantLevel: 4,
        money: 120000,
        waiterCount: 6,
        chefUpgrade: true,
        sommelierUpgrade: true,
        saltMasterUpgrade: true,
        reputation: 5.0,
        servedCount: 180,
        totalEarnings: 210000
      })
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-amber-500/30 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-display">
                  Scratch Sayı Kayıt Kodu
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Cloud Save
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scratch projelerindeki gibi yalnızca rakamlarla kayıt ve yükleme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-slate-900/90 rounded-2xl border border-white/5 mb-5">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'export'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Kayıt Kodunu Al
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'import'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Kodu Yükle
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hazır Kodlar
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Mevcut Oyun Kodunuz:
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono-numbers">
                    {currentCode.replace(/-/g, '').length} Rakam
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/5 font-mono-numbers text-xs text-amber-300 break-all select-all leading-relaxed tracking-wider shadow-inner">
                  {currentCode}
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Kayıt Kodu Panoya Kopyalandı!' : 'Kayıt Kodunu Kopyala'}
                </button>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Kasa & Seviye</span>
                  <span className="font-bold text-white font-mono-numbers">
                    ₺{stats.money.toLocaleString()} • Seviye {stats.restaurantLevel}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Personel & Puan</span>
                  <span className="font-bold text-amber-400 font-mono-numbers">
                    {stats.waiterCount} Garson • {stats.reputation}⭐
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Scratch bulut değişkenlerinde metin saklanamadığı gibi, bu sistemde de tüm ilerlemeniz, mobilyalarınız ve paranız <strong>yalnızca sayılardan oluşan bir koda</strong> sıkıştırılmıştır.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Scratch Sayı Kodunu Yapıştırın:</span>
                  {inputCode && (
                    <button
                      onClick={() => setInputCode('')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Temizle
                    </button>
                  )}
                </label>
                <textarea
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="Örn: 7701-0211-1048-0001-5400-0045-..."
                  rows={4}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>

              {/* Live Preview / Validation Status */}
              {preview && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    preview.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {preview.success ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Geçerli Scratch Kayıt Kodu!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>Kayıt Kodu Geçersiz!</span>
                      </>
                    )}
                  </div>
                  {preview.success ? (
                    <div className="text-[11px] text-emerald-200">
                      <div>{preview.summary}</div>
                      {preview.furniture && (
                        <div className="text-[10px] text-emerald-400 mt-1">
                          + {preview.furniture.length} Adet Kayıtlı Masa / Tabela / Dekorasyon Eşyası
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-200">{preview.error}</div>
                  )}
                </div>
              )}

              <button
                onClick={handleApplyImport}
                disabled={!preview?.success}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                  preview?.success
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Upload className="w-4 h-4" />
                Kodu Yükle ve Restorana Uygula
              </button>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Test etmek veya farklı aşamalarda oynamak için hazırlanmış hazır Scratch kayıt kodları:
              </p>
              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 transition flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {preset.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      setInputCode(formatScratchCode(preset.code));
                      setActiveTab('import');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-xs transition cursor-pointer shrink-0 border border-amber-500/30"
                  >
                    Kodu Seç
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
