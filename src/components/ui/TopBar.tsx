import React from 'react';
import { GameStats, CameraViewMode } from '../../types/game';
import { RESTAURANT_LEVELS } from '../../data/gameConstants';
import {
  Compass,
  Users,
  Maximize2,
  HelpCircle,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  Sun,
  Hash
} from 'lucide-react';

interface TopBarProps {
  stats: GameStats;
  buildMode: boolean;
  cameraMode: CameraViewMode;
  isMuted: boolean;
  onToggleBuildMode: () => void;
  onToggleCameraMode: () => void;
  onToggleMute: () => void;
  onOpenStaffModal: () => void;
  onOpenHelpModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenSaveCodeModal: () => void;
  onExpandRestaurant: () => void;
  onResetGame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  stats,
  buildMode,
  cameraMode,
  isMuted,
  onToggleBuildMode,
  onToggleCameraMode,
  onToggleMute,
  onOpenStaffModal,
  onOpenHelpModal,
  onOpenSettingsModal,
  onOpenSaveCodeModal,
  onExpandRestaurant,
  onResetGame
}) => {
  const currentConfig = RESTAURANT_LEVELS[stats.restaurantLevel - 1] || RESTAURANT_LEVELS[0];
  const nextConfig = RESTAURANT_LEVELS[stats.restaurantLevel];
  const canExpand = !!nextConfig;

  return (
    <header className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Financial Stats Zone */}
      <div className="glass-panel rounded-2xl px-5 py-3 pointer-events-auto flex items-center gap-6 shadow-2xl border-l-4 border-amber-500">
        <div>
          <div className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
            {currentConfig.name}
          </div>
          <h1 className="text-lg font-black tracking-tight text-white font-display">
            NUSA-ET STEAKHOUSE
          </h1>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Kasa (Money) */}
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Kasa
          </span>
          <span className="text-xl font-bold text-amber-400 font-mono-numbers">
            ₺{stats.money.toLocaleString()}
          </span>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Reputation */}
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Puan
          </span>
          <span className="text-xl font-bold text-red-400 font-mono-numbers flex items-center gap-1">
            {stats.reputation.toFixed(1)} <span className="text-sm">⭐</span>
          </span>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Served Count */}
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Servis
          </span>
          <span className="text-xl font-bold text-orange-400 font-mono-numbers">
            {stats.servedCount}
          </span>
        </div>
      </div>

      {/* Action Controls Zone */}
      <div className="flex items-center gap-2.5 pointer-events-auto flex-wrap">
        {/* Build Mode Toggle */}
        <button
          onClick={onToggleBuildMode}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition duration-200 shadow-lg cursor-pointer ${
            buildMode
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
              : 'glass-panel text-white hover:bg-slate-800/80 border-slate-700/60'
          }`}
          title="Dekorasyon Mağazası (TAB)"
        >
          <Compass className={`w-4 h-4 ${buildMode ? 'text-slate-950 animate-spin' : 'text-amber-400'}`} />
          <span>{buildMode ? 'Oyuna Dön (TAB)' : 'Dekorasyon (TAB)'}</span>
        </button>

        {/* Staff Management */}
        <button
          onClick={onOpenStaffModal}
          className="glass-panel hover:bg-slate-800/80 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition duration-200 shadow-lg cursor-pointer"
          title="Personel Yönetimi"
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>Personel ({stats.waiterCount})</span>
        </button>

        {/* Restaurant Expansion */}
        <button
          onClick={onExpandRestaurant}
          disabled={!canExpand}
          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition duration-200 shadow-lg cursor-pointer ${
            canExpand
              ? 'glass-panel hover:bg-emerald-950/60 text-white border-emerald-500/40 hover:border-emerald-400'
              : 'glass-panel opacity-50 cursor-not-allowed text-slate-400'
          }`}
          title="Restoran Alanını Büyüt"
        >
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span>{canExpand ? `Büyüt (₺${nextConfig.cost.toLocaleString()})` : 'Maks Seviye'}</span>
        </button>

        {/* Settings: Light & Sensitivity */}
        <button
          onClick={onOpenSettingsModal}
          className="glass-panel hover:bg-slate-800/80 text-white font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition duration-200 shadow-lg cursor-pointer border border-amber-500/40"
          title="Işık & Hassasiyet Ayarları"
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Işık & Hassasiyet</span>
        </button>

        {/* Scratch Number Save / Load Code */}
        <button
          onClick={onOpenSaveCodeModal}
          className="glass-panel hover:bg-amber-950/60 text-white font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition duration-200 shadow-lg cursor-pointer border border-amber-500/50 hover:border-amber-400"
          title="Scratch Sayı Kayıt Kodu (Kayıt / Yükle)"
        >
          <Hash className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Sayı Kodu</span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCameraMode}
          className="glass-panel hover:bg-slate-800/80 text-white p-2.5 rounded-xl transition duration-200 shadow-lg cursor-pointer"
          title={`Kamera Modu: ${cameraMode === 'FPS' ? '1. Şahıs (FPS)' : 'Kuşbakışı (İzometrik)'}`}
        >
          <Camera className="w-4 h-4 text-sky-400" />
        </button>

        {/* Straighten Camera */}
        {cameraMode === 'FPS' && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('straighten-camera'))}
            className="glass-panel hover:bg-slate-800/80 text-white p-2.5 rounded-xl transition duration-200 shadow-lg cursor-pointer"
            title="Kamerayı Düzelt / Doğrult (C tuşu)"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="glass-panel hover:bg-slate-800/80 text-white p-2.5 rounded-xl transition duration-200 shadow-lg cursor-pointer"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Help & Guide */}
        <button
          onClick={onOpenHelpModal}
          className="glass-panel hover:bg-slate-800/80 text-white p-2.5 rounded-xl transition duration-200 shadow-lg cursor-pointer"
          title="Rehber & Bilgi"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </button>

        {/* Reset progress */}
        <button
          onClick={onResetGame}
          className="glass-panel hover:bg-red-950/50 text-slate-400 hover:text-red-400 p-2.5 rounded-xl transition duration-200 shadow-lg cursor-pointer"
          title="Oyunu Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
