import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DishId, CatalogItem, GameStats, CameraViewMode, CustomerData, PlacedObject, CookingSlot, WaiterData } from '../../types/game';
import { MENU_ITEMS, RESTAURANT_LEVELS, CATALOG } from '../../data/gameConstants';
import { createFurnitureMesh, createFood3DMesh, createHumanoidMesh, materialsCache } from './meshBuilders';
import { ParticleSystem } from './particleSystem';
import { AudioFX } from '../../services/audio';
import { loadSavedFurniture, saveFurniture } from '../../services/storage';

interface ThreeCanvasProps {
  stats: GameStats;
  buildMode: boolean;
  selectedCatalogItem: CatalogItem | null;
  activeCookingDish: DishId;
  cameraMode: CameraViewMode;
  onStatsChange: (updater: (prev: GameStats) => GameStats) => void;
  onHoldingItemChange: (item: DishId | null) => void;
  holdingItem: DishId | null;
  onActiveOrdersChange: (orders: { customerId: string; dishId: DishId; tableIndex: number; state: string }[]) => void;
  onShowToast: (message: string, type: 'info' | 'success' | 'error') => void;
  onInteractionPromptChange: (text: string | null) => void;
  onSprinkleAvailableChange: (available: boolean) => void;
  onCustomerCountChange: (count: number) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  stats,
  buildMode,
  selectedCatalogItem,
  activeCookingDish,
  cameraMode,
  onStatsChange,
  onHoldingItemChange,
  holdingItem,
  onActiveOrdersChange,
  onShowToast,
  onInteractionPromptChange,
  onSprinkleAvailableChange,
  onCustomerCountChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep mutable 3D loop state without re-creating listeners
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particleSysRef = useRef<ParticleSystem | null>(null);
  const ghostMeshRef = useRef<THREE.Group | null>(null);

  const placedObjectsRef = useRef<PlacedObject[]>([]);
  const customersRef = useRef<CustomerData[]>([]);
  const waitersRef = useRef<WaiterData[]>([]);

  const playerRef = useRef({
    pos: new THREE.Vector3(0, 1.2, 8),
    rot: new THREE.Vector2(0, 0),
    speed: 6.2,
    isPointerLocked: false,
    keys: {} as Record<string, boolean>
  });

  const rotationAngleRef = useRef<number>(0);
  const roomMeshesRef = useRef<{
    floor: THREE.Mesh;
    outdoorFloor: THREE.Mesh;
    buildFloor: THREE.Mesh;
    grid: THREE.Group;
    walls: THREE.Group;
  } | null>(null);

  const [fpsCrosshairActive, setFpsCrosshairActive] = useState<boolean>(false);

  // Rebuild walls & floor when restaurant level changes
  const buildArchitecture = useCallback((scene: THREE.Scene, level: number) => {
    const config = RESTAURANT_LEVELS[level - 1] || RESTAURANT_LEVELS[0];
    const size = config.roomSize;
    const half = size / 2;

    if (roomMeshesRef.current) {
      scene.remove(roomMeshesRef.current.floor);
      scene.remove(roomMeshesRef.current.outdoorFloor);
      scene.remove(roomMeshesRef.current.buildFloor);
      scene.remove(roomMeshesRef.current.grid);
      scene.remove(roomMeshesRef.current.walls);
    }

    // 1. Indoor Floor (Rich Warm Golden Walnut Parquet)
    const floorGeo = new THREE.PlaneGeometry(size, size);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x543520,
      roughness: 0.35,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'RestaurantFloor';
    scene.add(floor);

    // 2. Outdoor Terrace Floor (Limestone Pavement & Sidewalk)
    const outdoorFloorGeo = new THREE.PlaneGeometry(size + 4, 14);
    const outdoorFloorMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.82,
      metalness: 0.15
    });
    const outdoorFloor = new THREE.Mesh(outdoorFloorGeo, outdoorFloorMat);
    outdoorFloor.rotation.x = -Math.PI / 2;
    outdoorFloor.position.set(0, -0.005, half + 7);
    outdoorFloor.receiveShadow = true;
    outdoorFloor.name = 'OutdoorTerraceFloor';
    scene.add(outdoorFloor);

    // Sidewalk curb
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const curb = new THREE.Mesh(new THREE.BoxGeometry(size + 6, 0.22, 0.4), curbMat);
    curb.position.set(0, 0.1, half + 14);
    curb.receiveShadow = true;
    scene.add(curb);

    // Asphalt street
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.95 });
    const street = new THREE.Mesh(new THREE.PlaneGeometry(size + 16, 12), streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, -0.04, half + 20);
    scene.add(street);

    // Pedestrian zebra stripes
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    for (let zi = -3; zi <= 3; zi++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 5.0), zebraMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(zi * 2.2, -0.035, half + 17.5);
      scene.add(stripe);
    }

    // Invisible unified build plane for raycasting both indoor & outdoor
    const buildFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(size + 6, size + 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    buildFloor.rotation.x = -Math.PI / 2;
    buildFloor.position.set(0, 0.01, 7);
    scene.add(buildFloor);

    // Marble border perimeter (indoor edge)
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.6 });
    const borderGeo = new THREE.BoxGeometry(size, 0.04, 0.4);
    [-half, half].forEach(bz => {
      const b = new THREE.Mesh(borderGeo, borderMat);
      b.position.set(0, 0.02, bz);
      scene.add(b);
    });

    // Grid Helpers for build mode (Indoor + Outdoor)
    const gridGroup = new THREE.Group();
    const indoorGrid = new THREE.GridHelper(size, size, 0xef4444, 0x334155);
    indoorGrid.position.y = 0.015;
    gridGroup.add(indoorGrid);

    const outdoorGrid = new THREE.GridHelper(size + 4, size + 4, 0x38bdf8, 0x1e293b);
    outdoorGrid.position.set(0, 0.015, half + 7);
    gridGroup.add(outdoorGrid);

    gridGroup.visible = buildMode;
    scene.add(gridGroup);

    // Walls group
    const wallsGroup = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x273142, roughness: 0.7 });
    const wallWainscotMat = new THREE.MeshStandardMaterial({ color: 0x4e2d19, roughness: 0.5 });
    const wallTrimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });

    // Back wall (with lower wood wainscoting)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(size, 5.2, 0.5), wallMat);
    backWall.position.set(0, 2.6, -half);
    backWall.receiveShadow = true;
    wallsGroup.add(backWall);

    const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(size, 1.4, 0.55), wallWainscotMat);
    backWainscot.position.set(0, 0.7, -half);
    wallsGroup.add(backWainscot);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, size), wallMat);
    leftWall.position.set(-half, 2.6, 0);
    leftWall.receiveShadow = true;
    wallsGroup.add(leftWall);

    const leftWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, size), wallWainscotMat);
    leftWainscot.position.set(-half, 0.7, 0);
    wallsGroup.add(leftWainscot);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, size), wallMat);
    rightWall.position.set(half, 2.6, 0);
    rightWall.receiveShadow = true;
    wallsGroup.add(rightWall);

    const rightWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, size), wallWainscotMat);
    rightWainscot.position.set(half, 0.7, 0);
    wallsGroup.add(rightWainscot);

    // Front Storefront Facade (z = half)
    const frontSideWidth = (size - 5.0) / 2;
    const leftSideX = -half + frontSideWidth / 2;
    const rightSideX = half - frontSideWidth / 2;

    [leftSideX, rightSideX].forEach(fx => {
      // Lower wall
      const fBase = new THREE.Mesh(new THREE.BoxGeometry(frontSideWidth, 0.9, 0.4), wallWainscotMat);
      fBase.position.set(fx, 0.45, half);
      wallsGroup.add(fBase);

      // Glass window
      const fGlass = new THREE.Mesh(new THREE.BoxGeometry(frontSideWidth - 0.2, 2.7, 0.08), materialsCache.glass);
      fGlass.position.set(fx, 2.25, half);
      wallsGroup.add(fGlass);

      // Window brass mullion
      const fMullion = new THREE.Mesh(new THREE.BoxGeometry(frontSideWidth, 0.1, 0.12), wallTrimMat);
      fMullion.position.set(fx, 2.25, half);
      wallsGroup.add(fMullion);

      // Upper wall lintel
      const fTop = new THREE.Mesh(new THREE.BoxGeometry(frontSideWidth, 1.6, 0.45), wallMat);
      fTop.position.set(fx, 4.4, half);
      wallsGroup.add(fTop);
    });

    // Gold trim cornice
    const trimBack = new THREE.Mesh(new THREE.BoxGeometry(size, 0.15, 0.6), wallTrimMat);
    trimBack.position.set(0, 5.1, -half);
    wallsGroup.add(trimBack);

    // Ceiling Downlights & Chandeliers Grid across room
    const gridCols = size >= 40 ? 3 : 2;
    const step = size / (gridCols + 1);
    for (let gx = 1; gx <= gridCols; gx++) {
      for (let gz = 1; gz <= gridCols; gz++) {
        const lx = -half + gx * step;
        const lz = -half + gz * step;

        const ceilingSpot = new THREE.PointLight(0xfff3e5, 1.35, size * 0.65);
        ceilingSpot.position.set(lx, 4.6, lz);
        wallsGroup.add(ceilingSpot);

        // Chandelier / Downlight fixture
        const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.08, 12), wallTrimMat);
        fixture.position.set(lx, 5.0, lz);
        wallsGroup.add(fixture);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
        bulb.position.set(lx, 4.9, lz);
        wallsGroup.add(bulb);
      }
    }

    // Dedicated Kitchen Area Spotlight (ensures grill station is bright)
    const kitchenSpot = new THREE.PointLight(0xffedd5, 1.8, 14);
    kitchenSpot.position.set(-half + 4, 4.2, -half + 4);
    wallsGroup.add(kitchenSpot);

    // Entrance Archway & Red Carpet at entrance
    const entranceFrameMat = new THREE.MeshStandardMaterial({ color: 0xdfa132, metalness: 0.85, roughness: 0.2 });
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 0.5), entranceFrameMat);
    archTop.position.set(0, 3.65, half);
    wallsGroup.add(archTop);

    const archL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 0.5), entranceFrameMat);
    archL.position.set(-2.4, 1.8, half);
    wallsGroup.add(archL);

    const archR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 0.5), entranceFrameMat);
    archR.position.set(2.4, 1.8, half);
    wallsGroup.add(archR);

    // Red Carpet runner extending from inside restaurant out to terrace sidewalk
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.95 });
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 14), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.025, half + 1.0);
    wallsGroup.add(carpet);

    // Grand Luxury Burgundy & Gold Awning (Teras Giriş Tentesi)
    const awningMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.7 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(size + 0.5, 0.12, 2.4), awningMat);
    awning.position.set(0, 3.8, half + 1.2);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    wallsGroup.add(awning);

    // Gold Awning Trim
    const awningTrim = new THREE.Mesh(new THREE.BoxGeometry(size + 0.6, 0.16, 0.08), wallTrimMat);
    awningTrim.position.set(0, 3.56, half + 2.38);
    wallsGroup.add(awningTrim);

    // Giant Glowing Facade Outdoor Signboard above Awning
    const facadeSign = new THREE.Group();
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.4, 0.25), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 }));
    facadeSign.add(signBoard);

    const signBoardTrim = new THREE.Mesh(new THREE.BoxGeometry(10.7, 1.55, 0.18), wallTrimMat);
    facadeSign.add(signBoardTrim);

    const signNeon = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.85, 0.06), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    signNeon.position.z = 0.14;
    facadeSign.add(signNeon);

    const outdoorSpot = new THREE.PointLight(0xffeedb, 2.6, 18);
    outdoorSpot.position.set(0, 0.4, 1.2);
    facadeSign.add(outdoorSpot);

    facadeSign.position.set(0, 4.8, half + 0.4);
    wallsGroup.add(facadeSign);

    // Outdoor Terrace Corner Lanterns
    [-half - 1.2, half + 1.2].forEach(lx => {
      const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8), materialsCache.darkSteel);
      lampPost.position.set(lx, 1.5, half + 13.5);
      wallsGroup.add(lampPost);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), wallTrimMat);
      lampHead.position.set(lx, 3.2, half + 13.5);
      wallsGroup.add(lampHead);

      const streetLight = new THREE.PointLight(0xffedd5, 2.0, 10);
      streetLight.position.set(lx, 3.2, half + 13.5);
      wallsGroup.add(streetLight);
    });

    // Boxwood Hedges along Terrace Sides
    [-half - 1.6, half + 1.6].forEach(hx => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 13.5), materialsCache.leavesGreen);
      hedge.position.set(hx, 0.45, half + 7);
      hedge.castShadow = true;
      wallsGroup.add(hedge);
    });

    // Giant Glowing Neon Sign on Back Wall
    const signGroup = new THREE.Group();
    const signFrame = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 }));
    signGroup.add(signFrame);

    const signText = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.0, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    signText.position.z = 0.12;
    signGroup.add(signText);

    const signGlow = new THREE.PointLight(0xef4444, 2.5, 12);
    signGlow.position.set(0, 0, 0.8);
    signGroup.add(signGlow);

    signGroup.position.set(0, 4.0, -half + 0.3);
    wallsGroup.add(signGroup);

    scene.add(wallsGroup);
    roomMeshesRef.current = {
      floor,
      outdoorFloor,
      buildFloor,
      grid: gridGroup,
      walls: wallsGroup
    };
  }, [buildMode]);

  // Initial Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131926);
    scene.fog = new THREE.FogExp2(0x131926, 0.0035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 120);
    camera.rotation.order = 'YXZ';
    camera.position.copy(playerRef.current.pos);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    // Dynamic exposure for high visual brightness
    const exposure = stats.lightingLevel === 'ultra' ? 1.68 : stats.lightingLevel === 'warm' ? 1.32 : 1.5;
    renderer.toneMappingExposure = exposure;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particleSys = new ParticleSystem(scene);
    particleSysRef.current = particleSys;

    // Atmospheric Warm & Bright Lights
    const ambientIntensity = stats.lightingLevel === 'ultra' ? 1.85 : stats.lightingLevel === 'warm' ? 1.35 : 1.6;
    const ambientLight = new THREE.AmbientLight(0xfff3e5, ambientIntensity);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0xfff8ee, 1.9);
    mainSpot.position.set(12, 28, 16);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 2048;
    mainSpot.shadow.mapSize.height = 2048;
    mainSpot.shadow.camera.near = 0.5;
    mainSpot.shadow.camera.far = 60;
    scene.add(mainSpot);

    const fillLight = new THREE.DirectionalLight(0xffeedb, 1.15);
    fillLight.position.set(-16, 22, -14);
    scene.add(fillLight);

    const warmFill = new THREE.PointLight(0xf97316, 1.8, 30);
    warmFill.position.set(0, 5, 0);
    scene.add(warmFill);

    // Build initial room
    buildArchitecture(scene, stats.restaurantLevel);

    // Build Ghost Mesh for build mode
    const ghost = new THREE.Group();
    ghost.visible = false;
    scene.add(ghost);
    ghostMeshRef.current = ghost;

    // Reset previous scene object arrays
    waitersRef.current = [];
    customersRef.current = [];
    placedObjectsRef.current = [];

    // Furniture Layout (Saved or default starter items)
    const saved = loadSavedFurniture();
    const initialItems = (saved && saved.length > 0) ? saved : [
      { catalogId: 'table_wood', x: -3.5, z: 0, rotationY: 0 },
      { catalogId: 'table_wood', x: 3.5, z: 0, rotationY: 0 },
      { catalogId: 'table_luxury', x: 0, z: 2.5, rotationY: 0 },
      { catalogId: 'grill_basic', x: -6.5, z: -7, rotationY: 0 }
    ];

    initialItems.forEach(item => {
      const mesh = createFurnitureMesh(item.catalogId);
      mesh.position.set(item.x, 0, item.z);
      if (item.rotationY) {
        mesh.rotation.y = item.rotationY;
      }
      scene.add(mesh);

      const placed: PlacedObject = {
        id: `obj_${Math.random().toString(36).substring(2, 9)}`,
        catalogId: item.catalogId,
        mesh,
        x: item.x,
        z: item.z,
        rotationY: item.rotationY || 0
      };

      if (item.catalogId.startsWith('table_')) {
        placed.isOccupied = false;
      } else if (item.catalogId.startsWith('grill_')) {
        placed.cookingSlots = item.catalogId === 'grill_double' ? [null, null] : [null];
      } else if (item.catalogId === 'stone_oven') {
        placed.cookingSlots = [null, null];
      }
      placedObjectsRef.current.push(placed);
    });

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Pointer lock, Drag-to-look & True Sensitivity
    const BASE_SENSITIVITY = 0.0016;
    let isMouseDown = false;
    let lastMousePos = { x: 0, y: 0 };

    const getSensitivity = () => BASE_SENSITIVITY * (stats.sensitivity ?? 1.0);

    const handlePointerLockChange = () => {
      playerRef.current.isPointerLocked = document.pointerLockElement === container;
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const handleMouseMove = (e: MouseEvent) => {
      if (cameraMode !== 'FPS' || buildMode) return;

      const sens = getSensitivity();
      if (playerRef.current.isPointerLocked) {
        playerRef.current.rot.y -= e.movementX * sens;
        playerRef.current.rot.x -= e.movementY * sens;
        playerRef.current.rot.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, playerRef.current.rot.x));
      } else if (isMouseDown) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        lastMousePos = { x: e.clientX, y: e.clientY };

        playerRef.current.rot.y -= deltaX * sens;
        playerRef.current.rot.x -= deltaY * sens;
        playerRef.current.rot.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, playerRef.current.rot.x));
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
        lastMousePos = { x: e.clientX, y: e.clientY };
      }
    };
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch support for smooth look-around
    let touchStartPos = { x: 0, y: 0 };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (cameraMode !== 'FPS' || buildMode || e.touches.length !== 1) return;
      const sens = getSensitivity() * 1.25;
      const deltaX = e.touches[0].clientX - touchStartPos.x;
      const deltaY = e.touches[0].clientY - touchStartPos.y;
      touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      playerRef.current.rot.y -= deltaX * sens;
      playerRef.current.rot.x -= deltaY * sens;
      playerRef.current.rot.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, playerRef.current.rot.x));
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleStraighten = () => {
      playerRef.current.rot.x = 0;
      onShowToast('Kamera Doğrultuldu (Düz Açı)', 'info');
    };
    window.addEventListener('straighten-camera', handleStraighten);

    const handleKeyDown = (e: KeyboardEvent) => {
      playerRef.current.keys[e.code] = true;

      if (e.code === 'KeyC') {
        playerRef.current.rot.x = 0;
        onShowToast('Kamera Doğrultuldu (Düz Açı)', 'info');
      }

      if (e.code === 'KeyR') {
        rotationAngleRef.current = (rotationAngleRef.current + Math.PI / 2) % (Math.PI * 2);
        if (ghostMeshRef.current) {
          ghostMeshRef.current.rotation.y = rotationAngleRef.current;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      playerRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game Loop
    let animationId: number;
    let clock = new THREE.Clock();
    let spawnCustomerTimer = 0;
    let autoChefTimer = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      const currentRoomSize = RESTAURANT_LEVELS[stats.restaurantLevel - 1]?.roomSize || 24;
      const halfBound = currentRoomSize / 2 - 1.2;

      // Update Player Movement (FPS or Isometric Free Orbit)
      if (!buildMode) {
        if (cameraMode === 'FPS') {
          const move = new THREE.Vector3();
          if (playerRef.current.keys['KeyW'] || playerRef.current.keys['ArrowUp']) move.z -= 1;
          if (playerRef.current.keys['KeyS'] || playerRef.current.keys['ArrowDown']) move.z += 1;
          if (playerRef.current.keys['KeyA'] || playerRef.current.keys['ArrowLeft']) move.x -= 1;
          if (playerRef.current.keys['KeyD'] || playerRef.current.keys['ArrowRight']) move.x += 1;

          if (move.lengthSq() > 0) {
            move.normalize();
            move.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRef.current.rot.y);
            playerRef.current.pos.addScaledVector(move, playerRef.current.speed * delta);
          }

          playerRef.current.pos.x = Math.max(-halfBound - 1.8, Math.min(halfBound + 1.8, playerRef.current.pos.x));
          playerRef.current.pos.z = Math.max(-halfBound, Math.min(halfBound + 13.5, playerRef.current.pos.z));

          camera.position.copy(playerRef.current.pos);
          camera.rotation.order = 'YXZ';
          camera.rotation.set(playerRef.current.rot.x, playerRef.current.rot.y, 0, 'YXZ');
        } else if (cameraMode === 'ISOMETRIC') {
          // Smooth angled bird-eye view centered on restaurant and terrace
          const targetCamPos = new THREE.Vector3(0, currentRoomSize * 0.85, currentRoomSize * 0.85);
          camera.position.lerp(targetCamPos, delta * 3.5);
          camera.lookAt(0, 0.5, 4.0);
        }
      }

      // Update Build Ghost Position (Raycasting unified indoor and outdoor build floor)
      if (buildMode && ghostMeshRef.current) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        if (roomMeshesRef.current) {
          const hits = raycaster.intersectObject(roomMeshesRef.current.buildFloor);
          if (hits.length > 0) {
            const pt = hits[0].point;
            ghostMeshRef.current.position.set(Math.round(pt.x), 0, Math.round(pt.z));
          }
        }
      }

      // Update Cooking Grills & Rising Smoke
      placedObjectsRef.current.forEach(obj => {
        if (obj.catalogId.startsWith('grill_') || obj.catalogId === 'stone_oven') {
          obj.cookingSlots?.forEach((slot, sIdx) => {
            if (slot && !slot.isDone) {
              slot.cookTimer += delta;

              // Emit smoke
              const offsetX = (sIdx - 0.5) * 0.8;
              const slotPos = new THREE.Vector3(obj.x + offsetX, 1.0, obj.z);
              particleSysRef.current?.emitGrillSmoke(slotPos);

              if (slot.cookTimer >= slot.maxTime) {
                slot.isDone = true;
                // Transition cooked food color
                const cookedDish = MENU_ITEMS[slot.dishId];
                slot.mesh.traverse(child => {
                  if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.color.setHex(cookedDish.cookedColor);
                  }
                });
              }
            }
          });
        }
      });

      // Master Chef Automation: If Chef Upgrade active, auto-cook dishes
      if (stats.chefUpgrade) {
        autoChefTimer += delta;
        if (autoChefTimer >= 3.0) {
          autoChefTimer = 0;
          // Look for empty grill slot and currently waiting order (food or dessert)
          const neededOrder = customersRef.current.find(
            c => c.state === 'WAITING_FOOD' || c.state === 'WAITING_DESSERT'
          );
          if (neededOrder) {
            for (const grill of placedObjectsRef.current) {
              if (grill.catalogId.startsWith('grill_') && grill.cookingSlots) {
                const emptyIdx = grill.cookingSlots.findIndex(s => s === null);
                if (emptyIdx !== -1) {
                  // Put dish on grill
                  const dishKey =
                    neededOrder.state === 'WAITING_DESSERT' && neededOrder.dessertDish
                      ? neededOrder.dessertDish
                      : neededOrder.orderDish;
                  const dish = MENU_ITEMS[dishKey];
                  const foodMesh = createFood3DMesh(dish.id);
                  const offX = (emptyIdx - 0.5) * 0.8;
                  foodMesh.position.set(grill.x + offX, 1.0, grill.z);
                  scene.add(foodMesh);

                  grill.cookingSlots[emptyIdx] = {
                    dishId: dish.id,
                    mesh: foodMesh,
                    cookTimer: 0,
                    maxTime: dish.cookTime * 0.65, // Faster chef cook
                    isDone: false
                  };
                  AudioFX.playSizzle();
                  break;
                }
              }
            }
          }
        }
      }

      // Customer Spawner
      spawnCustomerTimer += delta;
      if (spawnCustomerTimer >= 5.5) {
        spawnCustomerTimer = 0;
        spawnCustomer();
      }

      // Update Customers AI
      updateCustomers(delta, scene);

      // Update Waiters AI
      updateWaiters(delta, scene);

      // Update Particle System
      particleSysRef.current?.update(delta);

      // Raycast for crosshair interaction prompt
      updateRaycastInteractions(camera, scene);

      renderer.render(scene, camera);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('straighten-camera', handleStraighten);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [buildArchitecture, cameraMode, stats.restaurantLevel, stats.lightingLevel]);

  // Update Grid helper visibility when buildMode changes
  useEffect(() => {
    if (roomMeshesRef.current) {
      roomMeshesRef.current.grid.visible = buildMode;
    }
    if (!buildMode && ghostMeshRef.current) {
      ghostMeshRef.current.visible = false;
    }
  }, [buildMode]);

  // Update Ghost Mesh when selectedCatalogItem changes
  useEffect(() => {
    if (!ghostMeshRef.current) return;
    const ghost = ghostMeshRef.current;

    while (ghost.children.length > 0) {
      ghost.remove(ghost.children[0]);
    }

    if (buildMode && selectedCatalogItem) {
      const preview = createFurnitureMesh(selectedCatalogItem.id);
      preview.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.5
          });
        }
      });
      ghost.add(preview);
      ghost.visible = true;
    } else {
      ghost.visible = false;
    }
  }, [buildMode, selectedCatalogItem]);

  // Spawns human customer AI
  const spawnCustomer = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Find unoccupied tables
    const freeTables = placedObjectsRef.current.filter(o => o.catalogId.startsWith('table_') && !o.isOccupied);
    if (freeTables.length === 0) return;

    const chosenTable = freeTables[Math.floor(Math.random() * freeTables.length)];
    chosenTable.isOccupied = true;

    // 15% chance to spawn a VIP gourmet guest!
    const isVIP = Math.random() < 0.15;

    const custMesh = createHumanoidMesh(false, isVIP);
    const roomSize = RESTAURANT_LEVELS[stats.restaurantLevel - 1]?.roomSize || 24;
    // Spawn outside on the sidewalk terrace, walking down the red carpet
    const doorZ = roomSize / 2 + 13.0;
    custMesh.position.set((Math.random() - 0.5) * 2.2, 0, doorZ);
    scene.add(custMesh);

    // Pick initial menu dish: Main meals only! (Desserts are strictly ordered AFTER the meal)
    const MAIN_DISHES: DishId[] = ['biftek', 'lahmacun', 'kuskas', 'manti', 'cubuk_patates'];
    const chosenDish = MAIN_DISHES[Math.floor(Math.random() * MAIN_DISHES.length)];

    const newCustomer: CustomerData = {
      id: `cust_${Math.random().toString(36).substring(2, 9)}`,
      mesh: custMesh,
      tableId: chosenTable.id,
      tableIndex: placedObjectsRef.current.indexOf(chosenTable),
      state: 'WALKING_TO_TABLE',
      orderDish: chosenDish,
      patienceTimer: isVIP ? 50 : 38,
      maxPatience: isVIP ? 50 : 38,
      eatTimer: 0,
      isVIP,
      hasBeenSalted: false
    };

    chosenTable.customerId = newCustomer.id;
    customersRef.current.push(newCustomer);
    onCustomerCountChange(customersRef.current.length);
    AudioFX.playOrderBell();

    if (isVIP) {
      onShowToast('⭐ VIP Gurme Konuk Restorana Geldi! Özel ilgi ve tuzlama bekliyor.', 'info');
    }
  };

  // Helper to handle customer bill payment
  const payCustomerBill = (
    cust: CustomerData,
    table: PlacedObject,
    scene: THREE.Scene,
    hasDessert: boolean
  ) => {
    const mainDish = MENU_ITEMS[cust.orderDish];
    const dessertDish = (hasDessert && cust.dessertDish) ? MENU_ITEMS[cust.dessertDish] : null;

    const foodTotal = mainDish.price + (dessertDish ? dessertDish.price : 0);
    let tip = Math.floor(foodTotal * (hasDessert ? 0.30 : 0.20));

    // Table bonus
    const tableItem = CATALOG.tables.find(t => t.id === table.catalogId);
    if (tableItem?.tipBonus) {
      tip += Math.floor(foodTotal * (tableItem.tipBonus / 100));
    }

    // Nusret Salt sprinkle bonus!
    if (cust.hasBeenSalted) {
      tip += Math.floor(foodTotal * (stats.saltMasterUpgrade ? 0.75 : 0.45));
    }

    // VIP guest massive tip
    if (cust.isVIP) {
      tip += 160;
    }

    // Sommelier upgrade bonus drink profit
    if (stats.sommelierUpgrade) {
      tip += 50;
    }

    const totalPaid = foodTotal + tip;

    onStatsChange(prev => ({
      ...prev,
      money: prev.money + totalPaid,
      servedCount: prev.servedCount + (hasDessert ? 2 : 1),
      totalEarnings: prev.totalEarnings + totalPaid,
      reputation: Math.min(5.0, +(prev.reputation + (hasDessert ? 0.08 : 0.04)).toFixed(2))
    }));

    AudioFX.playCash();
    const details = dessertDish ? `${mainDish.emoji} + ${dessertDish.emoji}` : mainDish.emoji;
    onShowToast(`Hesap Ödendi [${details}]: +₺${totalPaid} (₺${tip} Bahşiş dahil)`, 'success');

    if (cust.servedFoodMesh) {
      scene.remove(cust.servedFoodMesh);
      cust.servedFoodMesh = undefined;
    }
    scene.remove(cust.mesh);
    table.isOccupied = false;
    table.customerId = undefined;
  };

  // Customer AI Logic
  const updateCustomers = (delta: number, scene: THREE.Scene) => {
    const list = customersRef.current;
    let listChanged = false;

    for (let i = list.length - 1; i >= 0; i--) {
      const cust = list[i];
      const table = placedObjectsRef.current.find(o => o.id === cust.tableId);

      if (!table) {
        // Table was removed in build mode
        scene.remove(cust.mesh);
        list.splice(i, 1);
        listChanged = true;
        continue;
      }

      if (cust.state === 'WALKING_TO_TABLE') {
        const targetPos = new THREE.Vector3(table.x, 0, table.z + 0.85);
        cust.mesh.position.lerp(targetPos, delta * 3.2);

        if (cust.mesh.position.distanceTo(targetPos) < 0.25) {
          cust.state = 'WAITING_ORDER';
          listChanged = true;
        }
      } else if (
        cust.state === 'WAITING_ORDER' ||
        cust.state === 'WAITING_FOOD' ||
        cust.state === 'WAITING_DESSERT_ORDER' ||
        cust.state === 'WAITING_DESSERT'
      ) {
        cust.patienceTimer -= delta;

        // Impatient customer leaves
        if (cust.patienceTimer <= 0) {
          onShowToast('Müşteri siparişi geciktiği için ayrıldı! (-0.2 Restoran Puanı)', 'error');
          onStatsChange(prev => ({
            ...prev,
            reputation: Math.max(1.0, +(prev.reputation - 0.2).toFixed(1))
          }));

          if (cust.servedFoodMesh) {
            scene.remove(cust.servedFoodMesh);
          }
          table.isOccupied = false;
          table.customerId = undefined;
          scene.remove(cust.mesh);
          list.splice(i, 1);
          listChanged = true;
          continue;
        }
      } else if (cust.state === 'EATING') {
        cust.eatTimer -= delta;

        // Animate slight eating bob
        cust.mesh.rotation.y = Math.sin(Date.now() * 0.005) * 0.1;

        if (cust.eatTimer <= 0) {
          // Finished main course! Clear main food platter
          if (cust.servedFoodMesh) {
            scene.remove(cust.servedFoodMesh);
            cust.servedFoodMesh = undefined;
          }

          // In Turkish tradition, dessert is served AFTER the meal!
          const DESSERTS: DishId[] = ['kunefe', 'baklava'];
          const wantsDessert = cust.isVIP || Math.random() < 0.85;

          if (wantsDessert) {
            const chosenDessert = DESSERTS[Math.floor(Math.random() * DESSERTS.length)];
            cust.dessertDish = chosenDessert;
            cust.state = 'WAITING_DESSERT_ORDER';
            cust.patienceTimer = cust.isVIP ? 48 : 36;
            cust.maxPatience = cust.patienceTimer;
            cust.hasBeenSalted = false; // allow sweet sprinkle on dessert

            AudioFX.playOrderBell();
            onShowToast(`Masa #${cust.tableIndex + 1} yemeği bitirdi! Tatlı olarak ${MENU_ITEMS[chosenDessert].emoji} ${MENU_ITEMS[chosenDessert].name} istiyor.`, 'info');
            listChanged = true;
            continue;
          } else {
            // Skips dessert, pays main course
            payCustomerBill(cust, table, scene, false);
            list.splice(i, 1);
            listChanged = true;
            continue;
          }
        }
      } else if (cust.state === 'EATING_DESSERT') {
        cust.eatTimer -= delta;
        cust.mesh.rotation.y = Math.sin(Date.now() * 0.005) * 0.1;

        if (cust.eatTimer <= 0) {
          // Finished dessert! Pays combined grand total bill
          payCustomerBill(cust, table, scene, true);
          list.splice(i, 1);
          listChanged = true;
          continue;
        }
      }
    }

    if (listChanged) {
      onCustomerCountChange(list.length);
      syncActiveOrders();
    }
  };

  // Waiter AI Logic
  const updateWaiters = (delta: number, scene: THREE.Scene) => {
    // Keep waiter count in sync with stats
    while (waitersRef.current.length < stats.waiterCount) {
      const wIdx = waitersRef.current.length;
      const wMesh = createHumanoidMesh(true);
      // Place prominently in the middle dining aisle so the player sees them immediately
      wMesh.position.set(-1.0 + wIdx * 2.2, 0, -1.2);
      scene.add(wMesh);

      waitersRef.current.push({
        id: `waiter_${wIdx}`,
        mesh: wMesh,
        targetCustomerId: null,
        state: 'IDLE',
        holdingDish: null
      });
    }

    while (waitersRef.current.length > stats.waiterCount) {
      const removed = waitersRef.current.pop();
      if (removed) {
        scene.remove(removed.mesh);
      }
    }

    waitersRef.current.forEach(waiter => {
      if (waiter.state === 'IDLE') {
        // Idle gentle breathing sway animation
        waiter.mesh.position.y = 0;
        waiter.mesh.rotation.y = Math.sin(Date.now() * 0.002 + parseInt(waiter.id.split('_')[1] || '0')) * 0.15;

        // Look for waiting customer (main dish or dessert)
        const needOrder = customersRef.current.find(
          c => c.state === 'WAITING_ORDER' || c.state === 'WAITING_DESSERT_ORDER'
        );
        if (needOrder) {
          waiter.targetCustomerId = needOrder.id;
          waiter.state = 'MOVING_TO_ORDER';
        }
      } else if (waiter.state === 'MOVING_TO_ORDER') {
        const targetCust = customersRef.current.find(c => c.id === waiter.targetCustomerId);
        if (
          !targetCust ||
          (targetCust.state !== 'WAITING_ORDER' && targetCust.state !== 'WAITING_DESSERT_ORDER')
        ) {
          waiter.state = 'IDLE';
          waiter.targetCustomerId = null;
          return;
        }

        const table = placedObjectsRef.current.find(o => o.id === targetCust.tableId);
        if (!table) return;

        const tablePos = new THREE.Vector3(table.x, 0, table.z + 0.85);
        waiter.mesh.position.lerp(tablePos, delta * 3.4);

        // Turn towards destination and add walking step bob
        waiter.mesh.rotation.y = Math.atan2(tablePos.x - waiter.mesh.position.x, tablePos.z - waiter.mesh.position.z);
        waiter.mesh.position.y = Math.abs(Math.sin(Date.now() * 0.009)) * 0.06;

        if (waiter.mesh.position.distanceTo(tablePos) < 0.55) {
          // Take order!
          if (targetCust.state === 'WAITING_ORDER') {
            targetCust.state = 'WAITING_FOOD';
          } else if (targetCust.state === 'WAITING_DESSERT_ORDER') {
            targetCust.state = 'WAITING_DESSERT';
          }
          targetCust.patienceTimer = targetCust.maxPatience;
          waiter.state = 'IDLE';
          waiter.targetCustomerId = null;
          waiter.mesh.position.y = 0;
          AudioFX.playPop();
          syncActiveOrders();
        }
      }
    });
  };

  const syncActiveOrders = () => {
    const orders = customersRef.current
      .filter(
        c =>
          c.state === 'WAITING_ORDER' ||
          c.state === 'WAITING_FOOD' ||
          c.state === 'WAITING_DESSERT_ORDER' ||
          c.state === 'WAITING_DESSERT'
      )
      .map(c => ({
        customerId: c.id,
        dishId:
          c.state === 'WAITING_DESSERT_ORDER' || c.state === 'WAITING_DESSERT'
            ? c.dessertDish || 'kunefe'
            : c.orderDish,
        tableIndex: c.tableIndex,
        state: c.state
      }));
    onActiveOrdersChange(orders);
  };

  // Crosshair Raycast Interaction Detection
  const updateRaycastInteractions = (camera: THREE.PerspectiveCamera, scene: THREE.Scene) => {
    if (buildMode) {
      onInteractionPromptChange(null);
      onSprinkleAvailableChange(false);
      setFpsCrosshairActive(false);
      return;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (hits.length === 0) {
      onInteractionPromptChange(null);
      onSprinkleAvailableChange(false);
      setFpsCrosshairActive(false);
      return;
    }

    let topObj: THREE.Object3D | null = hits[0].object;
    while (topObj && topObj.parent && topObj.parent !== scene) {
      topObj = topObj.parent;
    }

    if (!topObj) return;

    // Check hit Grill
    const grill = placedObjectsRef.current.find(o => o.mesh === topObj && (o.catalogId.startsWith('grill_') || o.catalogId === 'stone_oven'));
    if (grill) {
      const readySlot = grill.cookingSlots?.find(s => s && s.isDone);
      if (readySlot) {
        onInteractionPromptChange(`Sıcak ${MENU_ITEMS[readySlot.dishId].name} Al (E)`);
      } else {
        const dish = MENU_ITEMS[activeCookingDish];
        onInteractionPromptChange(`Izgarada Pişir: ${dish.emoji} ${dish.name} (E)`);
      }
      onSprinkleAvailableChange(false);
      setFpsCrosshairActive(true);
      return;
    }

    // Check hit Table
    const table = placedObjectsRef.current.find(o => o.mesh === topObj && o.catalogId.startsWith('table_'));
    if (table && table.customerId) {
      const cust = customersRef.current.find(c => c.id === table.customerId);
      if (cust) {
        if (cust.state === 'WAITING_ORDER') {
          onInteractionPromptChange('Yemek Siparişi Al (E)');
          onSprinkleAvailableChange(false);
          setFpsCrosshairActive(true);
          return;
        } else if (cust.state === 'WAITING_FOOD') {
          const reqDish = MENU_ITEMS[cust.orderDish];
          if (holdingItem === cust.orderDish) {
            onInteractionPromptChange(`Servis Et: ${reqDish.emoji} ${reqDish.name} (E)`);
            onSprinkleAvailableChange(!cust.hasBeenSalted);
          } else {
            onInteractionPromptChange(`Müşteri ${reqDish.emoji} ${reqDish.name} İstiyor`);
            onSprinkleAvailableChange(false);
          }
          setFpsCrosshairActive(true);
          return;
        } else if (cust.state === 'EATING' && !cust.hasBeenSalted) {
          onInteractionPromptChange('Altın Tuz Serp (+%45 Bahşiş!) (F)');
          onSprinkleAvailableChange(true);
          setFpsCrosshairActive(true);
          return;
        } else if (cust.state === 'WAITING_DESSERT_ORDER') {
          const dessert = cust.dessertDish ? MENU_ITEMS[cust.dessertDish] : null;
          onInteractionPromptChange(`Tatlı Siparişi Al: ${dessert ? dessert.name : 'Tatlı'} (E)`);
          onSprinkleAvailableChange(false);
          setFpsCrosshairActive(true);
          return;
        } else if (cust.state === 'WAITING_DESSERT') {
          const dessert = cust.dessertDish ? MENU_ITEMS[cust.dessertDish] : null;
          if (dessert) {
            if (holdingItem === cust.dessertDish) {
              onInteractionPromptChange(`Tatlıyı Servis Et: ${dessert.emoji} ${dessert.name} (E)`);
              onSprinkleAvailableChange(!cust.hasBeenSalted);
            } else {
              onInteractionPromptChange(`Müşteri ${dessert.emoji} ${dessert.name} Bekliyor`);
              onSprinkleAvailableChange(false);
            }
            setFpsCrosshairActive(true);
            return;
          }
        } else if (cust.state === 'EATING_DESSERT' && !cust.hasBeenSalted) {
          onInteractionPromptChange('Fıstık & Şerbet Serp (+%45 Bahşiş!) (F)');
          onSprinkleAvailableChange(true);
          setFpsCrosshairActive(true);
          return;
        }
      }
    }

    onInteractionPromptChange(null);
    onSprinkleAvailableChange(false);
    setFpsCrosshairActive(false);
  };

  // Perform Salt Sprinkle action (Nusret style!)
  const triggerSaltSprinkle = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // Check raycast customer
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    for (const hit of hits) {
      let topObj: THREE.Object3D | null = hit.object;
      while (topObj && topObj.parent && topObj.parent !== scene) {
        topObj = topObj.parent;
      }
      const table = placedObjectsRef.current.find(o => o.mesh === topObj && o.catalogId.startsWith('table_'));
      if (table && table.customerId) {
        const cust = customersRef.current.find(c => c.id === table.customerId);
        if (cust && !cust.hasBeenSalted) {
          cust.hasBeenSalted = true;
          particleSysRef.current?.emitSaltSprinkle(new THREE.Vector3(table.x, 0.9, table.z));
          AudioFX.playSaltSprinkle();
          onShowToast('✨ Nusa-Et Altın Tuzu Serpildi! (+%45 Bahşiş & Memnuniyet)', 'success');
          return;
        }
      }
    }
    // Fallback in front of player
    const frontPos = playerRef.current.pos.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1.5));
    particleSysRef.current?.emitSaltSprinkle(frontPos);
    AudioFX.playSaltSprinkle();
  };

  // Primary Interaction Handler (E key or Click in FPS)
  const handleInteract = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera || buildMode) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (hits.length === 0) return;

    let hitObj: THREE.Object3D | null = hits[0].object;
    while (hitObj && hitObj.parent && hitObj.parent !== scene) {
      hitObj = hitObj.parent;
    }

    // Hit Grill
    const grill = placedObjectsRef.current.find(o => o.mesh === hitObj && (o.catalogId.startsWith('grill_') || o.catalogId === 'stone_oven'));
    if (grill && grill.cookingSlots) {
      // 1. Pick up finished food
      for (let i = 0; i < grill.cookingSlots.length; i++) {
        const slot = grill.cookingSlots[i];
        if (slot && slot.isDone) {
          onHoldingItemChange(slot.dishId);
          scene.remove(slot.mesh);
          grill.cookingSlots[i] = null;
          AudioFX.playPop();
          onShowToast(`Sıcak ${MENU_ITEMS[slot.dishId].name} elinize alındı!`, 'success');
          return;
        }
      }

      // 2. Cook new dish
      for (let i = 0; i < grill.cookingSlots.length; i++) {
        if (grill.cookingSlots[i] === null) {
          const dish = MENU_ITEMS[activeCookingDish];
          const foodMesh = createFood3DMesh(dish.id);
          const offX = (i - 0.5) * 0.8;
          foodMesh.position.set(grill.x + offX, 1.0, grill.z);
          scene.add(foodMesh);

          const speedMult = stats.chefUpgrade ? 1.4 : 1.0;
          grill.cookingSlots[i] = {
            dishId: dish.id,
            mesh: foodMesh,
            cookTimer: 0,
            maxTime: dish.cookTime / speedMult,
            isDone: false
          };

          AudioFX.playSizzle();
          onShowToast(`${dish.emoji} ${dish.name} ızgaraya koyuldu...`, 'info');
          return;
        }
      }
      return;
    }

    // Hit Table
    const table = placedObjectsRef.current.find(o => o.mesh === hitObj && o.catalogId.startsWith('table_'));
    if (table && table.customerId) {
      const cust = customersRef.current.find(c => c.id === table.customerId);
      if (!cust) return;

      if (cust.state === 'WAITING_ORDER') {
        cust.state = 'WAITING_FOOD';
        cust.patienceTimer = cust.maxPatience;
        AudioFX.playPop();
        onShowToast(`Sipariş alındı: ${MENU_ITEMS[cust.orderDish].emoji} ${MENU_ITEMS[cust.orderDish].name}`, 'info');
        syncActiveOrders();
        return;
      }

      if (cust.state === 'WAITING_FOOD') {
        if (holdingItem === cust.orderDish) {
          onHoldingItemChange(null);
          cust.state = 'EATING';
          cust.eatTimer = 4.5;

          // Place food on table
          const foodMesh = createFood3DMesh(cust.orderDish);
          foodMesh.position.set(table.x, 0.88, table.z);
          scene.add(foodMesh);
          cust.servedFoodMesh = foodMesh;

          AudioFX.playPop();
          onShowToast('Afiyet olsun! Ana yemek masaya servis edildi.', 'success');
          syncActiveOrders();
        } else {
          onShowToast(`Müşteri ${MENU_ITEMS[cust.orderDish].emoji} ${MENU_ITEMS[cust.orderDish].name} bekliyor!`, 'error');
        }
        return;
      }

      if (cust.state === 'WAITING_DESSERT_ORDER') {
        cust.state = 'WAITING_DESSERT';
        cust.patienceTimer = cust.maxPatience;
        AudioFX.playPop();
        const dessert = cust.dessertDish ? MENU_ITEMS[cust.dessertDish] : null;
        onShowToast(`Tatlı siparişi alındı: ${dessert?.emoji} ${dessert?.name}`, 'info');
        syncActiveOrders();
        return;
      }

      if (cust.state === 'WAITING_DESSERT') {
        if (cust.dessertDish && holdingItem === cust.dessertDish) {
          onHoldingItemChange(null);
          cust.state = 'EATING_DESSERT';
          cust.eatTimer = 4.0;

          // Place dessert on table
          const foodMesh = createFood3DMesh(cust.dessertDish);
          foodMesh.position.set(table.x, 0.88, table.z);
          scene.add(foodMesh);
          cust.servedFoodMesh = foodMesh;

          AudioFX.playPop();
          onShowToast(`Sıcak ${MENU_ITEMS[cust.dessertDish].name} masaya servis edildi! 🍯`, 'success');
          syncActiveOrders();
        } else {
          const dessert = cust.dessertDish ? MENU_ITEMS[cust.dessertDish] : null;
          onShowToast(`Müşteri tatlı olarak ${dessert?.emoji} ${dessert?.name} bekliyor!`, 'error');
        }
        return;
      }
    }
  };

  // Place Catalog item in Build mode
  const tryPlaceSelectedItem = () => {
    const scene = sceneRef.current;
    const ghost = ghostMeshRef.current;
    if (!scene || !ghost || !selectedCatalogItem) return;

    if (stats.money < selectedCatalogItem.price) {
      onShowToast('Yetersiz Kasa Bakiyesi!', 'error');
      return;
    }

    const gx = ghost.position.x;
    const gz = ghost.position.z;

    const roomSize = RESTAURANT_LEVELS[stats.restaurantLevel - 1]?.roomSize || 24;
    const half = roomSize / 2 - 1.0;

    const minX = -half - 1.5;
    const maxX = half + 1.5;
    const minZ = -half;
    const maxZ = half + 13.0; // Outdoor terrace and sidewalk area

    if (gx < minX || gx > maxX || gz < minZ || gz > maxZ) {
      onShowToast('Restoran veya dış teras sınırları dışına yerleştirilemez!', 'error');
      return;
    }

    // Deduct money
    onStatsChange(prev => ({
      ...prev,
      money: prev.money - selectedCatalogItem.price,
      reputation: Math.min(5.0, +(prev.reputation + (selectedCatalogItem.reputationBonus || 0)).toFixed(1))
    }));

    const mesh = createFurnitureMesh(selectedCatalogItem.id);
    mesh.position.set(gx, 0, gz);
    mesh.rotation.y = rotationAngleRef.current;
    scene.add(mesh);

    const placed: PlacedObject = {
      id: `obj_${Math.random().toString(36).substring(2, 9)}`,
      catalogId: selectedCatalogItem.id,
      mesh,
      x: gx,
      z: gz,
      rotationY: rotationAngleRef.current
    };

    if (selectedCatalogItem.id.startsWith('table_')) {
      placed.isOccupied = false;
    } else if (selectedCatalogItem.id.startsWith('grill_')) {
      placed.cookingSlots = selectedCatalogItem.id === 'grill_double' ? [null, null] : [null];
    } else if (selectedCatalogItem.id === 'stone_oven') {
      placed.cookingSlots = [null, null];
    }

    placedObjectsRef.current.push(placed);
    saveFurniture(placedObjectsRef.current.map(o => ({
      catalogId: o.catalogId,
      x: o.x,
      z: o.z,
      rotationY: o.rotationY
    })));
    AudioFX.playPop();
    onShowToast(`${selectedCatalogItem.name} yerleştirildi!`, 'success');
  };

  // Sell hovered furniture in Build mode
  const tryRemoveHoveredItem = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    for (const hit of hits) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj.parent && obj.parent !== scene) {
        obj = obj.parent;
      }

      const index = placedObjectsRef.current.findIndex(p => p.mesh === obj);
      if (index !== -1) {
        const item = placedObjectsRef.current[index];
        const allItems = [...CATALOG.tables, ...CATALOG.outdoor, ...CATALOG.kitchen, ...CATALOG.decor];
        const catInfo = allItems.find(c => c.id === item.catalogId);
        const refund = catInfo ? Math.floor(catInfo.price * 0.7) : 100;

        scene.remove(item.mesh);
        placedObjectsRef.current.splice(index, 1);
        saveFurniture(placedObjectsRef.current.map(o => ({
          catalogId: o.catalogId,
          x: o.x,
          z: o.z,
          rotationY: o.rotationY
        })));

        onStatsChange(prev => ({
          ...prev,
          money: prev.money + refund
        }));

        AudioFX.playCash();
        onShowToast(`Eşya satıldı. +₺${refund} iade edildi.`, 'success');
        return;
      }
    }
  };

  // Keyboard shortcut for E (Interact) and F (Salt sprinkle)
  useEffect(() => {
    const handleKeyActions = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        handleInteract();
      }
      if (e.code === 'KeyF') {
        triggerSaltSprinkle();
      }
    };
    window.addEventListener('keydown', handleKeyActions);
    return () => window.removeEventListener('keydown', handleKeyActions);
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    AudioFX.playPop();
    if (buildMode) {
      if (e.button === 0 && selectedCatalogItem) {
        tryPlaceSelectedItem();
      }
    } else {
      if (!playerRef.current.isPointerLocked && cameraMode === 'FPS' && containerRef.current) {
        containerRef.current.requestPointerLock();
      } else {
        handleInteract();
      }
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    if (buildMode) {
      e.preventDefault();
      tryRemoveHoveredItem();
    }
  };

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      onClick={handleCanvasClick}
      onContextMenu={handleCanvasContextMenu}
      className="relative w-screen h-screen overflow-hidden select-none cursor-crosshair bg-slate-950"
    >
      {/* 3D Crosshair */}
      {cameraMode === 'FPS' && !buildMode && (
        <div className={`crosshair ${fpsCrosshairActive ? 'active' : ''}`} />
      )}
    </div>
  );
};
