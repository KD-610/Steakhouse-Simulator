import * as THREE from 'three';

export type DishId = 
  | 'biftek' 
  | 'lahmacun' 
  | 'kuskas' 
  | 'manti' 
  | 'cubuk_patates' 
  | 'kunefe' 
  | 'baklava';

export interface MenuItem {
  id: DishId;
  name: string;
  category: 'meat' | 'pastry' | 'snack' | 'dessert';
  price: number;
  cookTime: number; // in seconds
  color: number;
  cookedColor: number;
  emoji: string;
  description: string;
  keyNumber: string;
}

export type CatalogCategory = 'tables' | 'outdoor' | 'kitchen' | 'decor';

export interface CatalogItem {
  id: string;
  name: string;
  category: CatalogCategory;
  price: number;
  icon: string;
  desc: string;
  tipBonus?: number; // % bonus tips for luxury tables
  reputationBonus?: number;
}

export type CustomerAIState = 
  | 'WALKING_TO_TABLE' 
  | 'WAITING_ORDER' 
  | 'WAITING_FOOD' 
  | 'EATING' 
  | 'WAITING_DESSERT_ORDER'
  | 'WAITING_DESSERT'
  | 'EATING_DESSERT'
  | 'LEAVING';

export interface CustomerData {
  id: string;
  mesh: THREE.Group;
  tableId: string;
  tableIndex: number;
  state: CustomerAIState;
  orderDish: DishId;
  dessertDish?: DishId;
  patienceTimer: number;
  maxPatience: number;
  eatTimer: number;
  isVIP: boolean;
  hasBeenSalted: boolean;
  servedFoodMesh?: THREE.Group;
}

export interface PlacedObject {
  id: string;
  catalogId: string;
  mesh: THREE.Group;
  x: number;
  z: number;
  rotationY: number;
  // Specific to tables
  isOccupied?: boolean;
  customerId?: string;
  // Specific to grills
  cookingSlots?: (CookingSlot | null)[];
}

export interface CookingSlot {
  dishId: DishId;
  mesh: THREE.Group;
  cookTimer: number;
  maxTime: number;
  isDone: boolean;
}

export interface WaiterData {
  id: string;
  mesh: THREE.Group;
  targetCustomerId: string | null;
  state: 'IDLE' | 'MOVING_TO_ORDER' | 'DELIVERING_FOOD';
  holdingDish: DishId | null;
}

export interface GameStats {
  money: number;
  reputation: number;
  servedCount: number;
  totalEarnings: number;
  restaurantLevel: number;
  waiterCount: number;
  chefUpgrade: boolean;
  sommelierUpgrade: boolean;
  saltMasterUpgrade: boolean;
  sensitivity?: number;
  lightingLevel?: 'bright' | 'ultra' | 'warm';
}

export type CameraViewMode = 'FPS' | 'ISOMETRIC';
