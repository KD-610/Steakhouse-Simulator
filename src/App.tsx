import { useState, useEffect, useCallback, useTransition } from 'react';
import confetti from 'canvas-confetti';
import { GameStats, DishId, CatalogItem, CameraViewMode } from './types/game';
import { RESTAURANT_LEVELS } from './data/gameConstants';
import { loadGameStats, saveGameStats, DEFAULT_STATS } from './services/storage';
import { AudioFX } from './services/audio';

import { ThreeCanvas } from './components/game3d/ThreeCanvas';
import { TopBar } from './components/ui/TopBar';
import { OrderListPanel } from './components/ui/OrderListPanel';
import { FoodSelectorBar } from './components/ui/FoodSelectorBar';
import { HoldingIndicator } from './components/ui/HoldingIndicator';
import { BuildCatalogDrawer } from './components/ui/BuildCatalogDrawer';
import { StaffModal } from './components/ui/StaffModal';
import { HelpModal } from './components/ui/HelpModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { SaveCodeModal } from './components/ui/SaveCodeModal';
import { ToastContainer, ToastMessage } from './components/ui/ToastContainer';
import { InteractionPrompt } from './components/ui/InteractionPrompt';
import { clearAllGameData, saveFurniture } from './services/storage';
import { SavedFurnitureItem } from './services/scratchSave';

export default function App() {
  const [stats, setStats] = useState<GameStats>(() => loadGameStats());
  const [buildMode, setBuildMode] = useState<boolean>(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [activeCookingDish, setActiveCookingDish] = useState<DishId>('biftek');
  const [holdingItem, setHoldingItem] = useState<DishId | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('FPS');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [activeOrders, setActiveOrders] = useState<{ customerId: string; dishId: DishId; tableIndex: number; state: string }[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [promptText, setPromptText] = useState<string | null>(null);
  const [sprinkleAvailable, setSprinkleAvailable] = useState<boolean>(false);
  const [, setCustomerCount] = useState<number>(0);

  const [isStaffOpen, setIsStaffOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSaveCodeOpen, setIsSaveCodeOpen] = useState<boolean>(false);
  const [canvasKey, setCanvasKey] = useState<number>(0);
  const [, startTransition] = useTransition();

  // Save to localStorage when stats update
  useEffect(() => {
    saveGameStats(stats);
  }, [stats]);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type
    };
    setToasts(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3200);
  }, []);

  const handleToggleBuildMode = useCallback(() => {
    setBuildMode(prev => {
      const next = !prev;
      if (next) {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        showToast('Dekorasyon Modu Açıldı. Eşya seçip zemine tıklayın.', 'info');
      } else {
        setSelectedCatalogItem(null);
      }
      return next;
    });
  }, [showToast]);

  const handleToggleCameraMode = useCallback(() => {
    setCameraMode(prev => {
      const next = prev === 'FPS' ? 'ISOMETRIC' : 'FPS';
      if (next === 'ISOMETRIC' && document.pointerLockElement) {
        document.exitPointerLock();
      }
      showToast(`Kamera Modu: ${next === 'FPS' ? '1. Şahıs (FPS)' : 'Kuşbakışı (İzometrik)'}`, 'info');
      return next;
    });
  }, [showToast]);

  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    AudioFX.setMuted(nextMute);
    showToast(nextMute ? 'Ses Kapatıldı' : 'Ses Açıldı', 'info');
  }, [isMuted, showToast]);

  // Restaurant Expansion
  const handleExpandRestaurant = useCallback(() => {
    const nextConfig = RESTAURANT_LEVELS[stats.restaurantLevel];
    if (!nextConfig) {
      showToast('Restoranınız zaten en yüksek seviyede!', 'info');
      return;
    }

    if (stats.money < nextConfig.cost) {
      showToast(`Yetersiz Bakiye! (₺${nextConfig.cost.toLocaleString()} Gerekli)`, 'error');
      return;
    }

    setStats(prev => ({
      ...prev,
      money: prev.money - nextConfig.cost,
      restaurantLevel: prev.restaurantLevel + 1
    }));

    AudioFX.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Tebrikler! ${nextConfig.name} Seviyesine Ulaştınız! 🎉`, 'success');
  }, [stats.money, stats.restaurantLevel, showToast]);

  // Hire Waiter
  const handleHireWaiter = useCallback(() => {
    if (stats.waiterCount >= 5) {
      showToast('Maksimum 5 garson çalıştırabilirsiniz!', 'error');
      return;
    }
    if (stats.money < 600) {
      showToast('Yetersiz Bakiye! (₺600 Gerekli)', 'error');
      return;
    }

    setStats(prev => ({
      ...prev,
      money: prev.money - 600,
      waiterCount: prev.waiterCount + 1
    }));

    AudioFX.playCash();
    showToast('Yeni Garson İşe Alındı! Masalara otomatik bakacak.', 'success');
  }, [stats.money, stats.waiterCount, showToast]);

  // Upgrade Master Chef
  const handleUpgradeChef = useCallback(() => {
    if (stats.chefUpgrade) return;
    if (stats.money < 1200) {
      showToast('Yetersiz Bakiye! (₺1,200 Gerekli)', 'error');
      return;
    }

    setStats(prev => ({
      ...prev,
      money: prev.money - 1200,
      chefUpgrade: true
    }));

    AudioFX.playCash();
    showToast('Usta Izgaracı Aktif! Pişirme hızı +%40 ve otomatik et atma.', 'success');
  }, [stats.chefUpgrade, stats.money, showToast]);

  // Upgrade Sommelier
  const handleUpgradeSommelier = useCallback(() => {
    if (stats.sommelierUpgrade) return;
    if (stats.money < 900) {
      showToast('Yetersiz Bakiye! (₺900 Gerekli)', 'error');
      return;
    }

    setStats(prev => ({
      ...prev,
      money: prev.money - 900,
      sommelierUpgrade: true
    }));

    AudioFX.playCash();
    showToast('İçecek Sommelieri Aktif! Her masadan +₺45 ekstra kazanç.', 'success');
  }, [stats.sommelierUpgrade, stats.money, showToast]);

  // Upgrade Salt Master
  const handleUpgradeSaltMaster = useCallback(() => {
    if (stats.saltMasterUpgrade) return;
    if (stats.money < 1500) {
      showToast('Yetersiz Bakiye! (₺1,500 Gerekli)', 'error');
      return;
    }

    setStats(prev => ({
      ...prev,
      money: prev.money - 1500,
      saltMasterUpgrade: true
    }));

    AudioFX.playCash();
    showToast('Nusa-Et Şov Tuzlama Eğitimi Tamamlandı! Bahşişler katlandı.', 'success');
  }, [stats.saltMasterUpgrade, stats.money, showToast]);

  const handleUpdateSensitivity = useCallback((sens: number) => {
    setStats(prev => ({ ...prev, sensitivity: sens }));
  }, []);

  const handleUpdateLighting = useCallback((level: 'bright' | 'ultra' | 'warm') => {
    setStats(prev => ({ ...prev, lightingLevel: level }));
    showToast(
      level === 'ultra' ? 'Ekstra Işık (Ultra) Aktif Edildi 🌟' :
      level === 'warm' ? 'Loş Steakhouse Işığı Aktif Edildi 🍷' :
      'Sıcak & Parlak Işık Aktif Edildi ☀️',
      'info'
    );
  }, [showToast]);

  // Load Scratch numeric save code
  const handleLoadSaveCode = useCallback((newStats: GameStats, newFurniture?: SavedFurnitureItem[]) => {
    setStats(newStats);
    saveGameStats(newStats);
    if (newFurniture && newFurniture.length > 0) {
      saveFurniture(newFurniture);
    }
    setCanvasKey(prev => prev + 1);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    AudioFX.playCash();
    showToast('Scratch Sayı Kodu Başarıyla Yüklendi! 🎮', 'success');
  }, [showToast]);

  // Reset Game
  const handleResetGame = useCallback(() => {
    if (window.confirm('Tüm restoran ilerlemenizi sıfırlayıp baştan başlamak istediğinize emin misiniz?')) {
      clearAllGameData();
      setStats(DEFAULT_STATS);
      setCanvasKey(prev => prev + 1);
      showToast('Oyun sıfırlandı. Başarılar şef!', 'info');
    }
  }, [showToast]);

  // Keyboard shortcut for TAB
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        handleToggleBuildMode();
      }
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'].includes(e.code)) {
        const dishKeys: DishId[] = ['biftek', 'lahmacun', 'kuskas', 'manti', 'cubuk_patates', 'kunefe', 'baklava'];
        const idx = parseInt(e.code.replace('Digit', '')) - 1;
        if (dishKeys[idx]) {
          setActiveCookingDish(dishKeys[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleBuildMode]);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* 3D Three.js Engine Canvas */}
      <ThreeCanvas
        key={canvasKey}
        stats={stats}
        buildMode={buildMode}
        selectedCatalogItem={selectedCatalogItem}
        activeCookingDish={activeCookingDish}
        cameraMode={cameraMode}
        onStatsChange={updater => startTransition(() => setStats(updater))}
        onHoldingItemChange={setHoldingItem}
        holdingItem={holdingItem}
        onActiveOrdersChange={setActiveOrders}
        onShowToast={showToast}
        onInteractionPromptChange={setPromptText}
        onSprinkleAvailableChange={setSprinkleAvailable}
        onCustomerCountChange={setCustomerCount}
      />

      {/* Top Header Bar */}
      <TopBar
        stats={stats}
        buildMode={buildMode}
        cameraMode={cameraMode}
        isMuted={isMuted}
        onToggleBuildMode={handleToggleBuildMode}
        onToggleCameraMode={handleToggleCameraMode}
        onToggleMute={handleToggleMute}
        onOpenStaffModal={() => setIsStaffOpen(true)}
        onOpenHelpModal={() => setIsHelpOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenSaveCodeModal={() => setIsSaveCodeOpen(true)}
        onExpandRestaurant={handleExpandRestaurant}
        onResetGame={handleResetGame}
      />

      {/* Waiting Orders List */}
      <OrderListPanel orders={activeOrders} />

      {/* Center Screen Interaction Prompt */}
      <InteractionPrompt promptText={promptText} />

      {/* Current Carried Item & Nusret Salt Sprinkle Trigger */}
      <HoldingIndicator
        holdingItem={holdingItem}
        sprinkleAvailable={sprinkleAvailable}
        onSprinkle={() => {
          // Trigger keydown F event
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }));
        }}
      />

      {/* Bottom Food Preparation Bar */}
      <FoodSelectorBar
        activeDish={activeCookingDish}
        onSelectDish={setActiveCookingDish}
      />

      {/* Build Mode Right Drawer */}
      <BuildCatalogDrawer
        isOpen={buildMode}
        onClose={handleToggleBuildMode}
        selectedItem={selectedCatalogItem}
        onSelectItem={setSelectedCatalogItem}
        money={stats.money}
      />

      {/* Staff Management Modal */}
      <StaffModal
        isOpen={isStaffOpen}
        onClose={() => setIsStaffOpen(false)}
        stats={stats}
        onHireWaiter={handleHireWaiter}
        onUpgradeChef={handleUpgradeChef}
        onUpgradeSommelier={handleUpgradeSommelier}
        onUpgradeSaltMaster={handleUpgradeSaltMaster}
      />

      {/* Guide & Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Settings Modal (Light & True Sensitivity) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stats={stats}
        onUpdateSensitivity={handleUpdateSensitivity}
        onUpdateLighting={handleUpdateLighting}
      />

      {/* Scratch-style Number Save / Load Code Modal */}
      <SaveCodeModal
        isOpen={isSaveCodeOpen}
        onClose={() => setIsSaveCodeOpen(false)}
        stats={stats}
        onLoadSave={handleLoadSaveCode}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </main>
  );
}
