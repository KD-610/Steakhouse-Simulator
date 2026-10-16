import { MenuItem, CatalogItem, DishId } from '../types/game';

export const MENU_ITEMS: Record<DishId, MenuItem> = {
  biftek: {
    id: 'biftek',
    name: 'Dry-Aged Dana Biftek',
    category: 'meat',
    price: 180,
    cookTime: 3.5,
    color: 0x991b1b,
    cookedColor: 0x451a03,
    emoji: '🥩',
    description: 'Özel baharatlarla dinlendirilmiş Sulu Tomahawk Biftek.',
    keyNumber: '1'
  },
  lahmacun: {
    id: 'lahmacun',
    name: 'Çıtır Fırın Lahmacun',
    category: 'pastry',
    price: 95,
    cookTime: 2.2,
    color: 0xd97706,
    cookedColor: 0x78350f,
    emoji: '🫓',
    description: 'İncecik hamurlu, zırh kıymalı geleneksel lezzet.',
    keyNumber: '2'
  },
  kuskas: {
    id: 'kuskas',
    name: 'Kuşbaşılı Kaşarlı Pide',
    category: 'pastry',
    price: 145,
    cookTime: 2.8,
    color: 0xf59e0b,
    cookedColor: 0xb45309,
    emoji: '🍕',
    description: 'Bol erimiş kaşarlı ve marine kuşbaşı etli pide.',
    keyNumber: '3'
  },
  manti: {
    id: 'manti',
    name: 'Kayseri Mantısı',
    category: 'meat',
    price: 160,
    cookTime: 3.8,
    color: 0xf3f4f6,
    cookedColor: 0xd1d5db,
    emoji: '🥟',
    description: 'Sarımsaklı süzme yoğurt ve kızgın tereyağlı mantı.',
    keyNumber: '4'
  },
  cubuk_patates: {
    id: 'cubuk_patates',
    name: 'Çubukta Baharatlı Patates',
    category: 'snack',
    price: 85,
    cookTime: 1.8,
    color: 0xfacc15,
    cookedColor: 0xd97706,
    emoji: '🥔',
    description: 'Tütsülenmiş paprika ve dağ kekiğiyle çıtır patates.',
    keyNumber: '5'
  },
  kunefe: {
    id: 'kunefe',
    name: 'Hatay Usulü Künefe',
    category: 'dessert',
    price: 175,
    cookTime: 3.2,
    color: 0xf59e0b,
    cookedColor: 0xb45309,
    emoji: '🍯',
    description: 'Eriyen sünme peynirli, bol Antep fıstıklı sıcak tatlı.',
    keyNumber: '6'
  },
  baklava: {
    id: 'baklava',
    name: 'Havuç Dilim Baklava',
    category: 'dessert',
    price: 195,
    cookTime: 2.0,
    color: 0x84cc16,
    cookedColor: 0x65a30d,
    emoji: '🥮',
    description: 'Kaymaklı ve hakiki Gaziantep boz fıstıklı baklava.',
    keyNumber: '7'
  }
};

export const CATALOG: Record<'tables' | 'outdoor' | 'kitchen' | 'decor', CatalogItem[]> = {
  tables: [
    {
      id: 'table_wood',
      name: 'Rustik Ahşap Masa',
      category: 'tables',
      price: 250,
      icon: 'Utensils',
      desc: 'Doğal ceviz ağacından 2 kişilik samimi masa takımı.',
      tipBonus: 0
    },
    {
      id: 'table_outdoor_patio',
      name: 'Teras & Bahçe Masası (Şemsiyeli)',
      category: 'tables',
      price: 450,
      icon: 'Sun',
      desc: 'Dış mekan ve teras için ferforje masa takımı ve geniş güneş şemsiyesi (+%20 Bahşiş).',
      tipBonus: 20
    },
    {
      id: 'table_luxury',
      name: 'Lüks Deri Loca Masası',
      category: 'tables',
      price: 600,
      icon: 'Armchair',
      desc: 'Bordo hakiki deri koltuklu lüks masa (+%25 Bahşiş).',
      tipBonus: 25
    },
    {
      id: 'table_vip',
      name: 'VIP Altın Kaplama Masa',
      category: 'tables',
      price: 1250,
      icon: 'Crown',
      desc: 'Mermer tabla ve altın çerçeveli VIP masası (+%60 Bahşiş & +0.1 Puan).',
      tipBonus: 60,
      reputationBonus: 0.1
    }
  ],
  outdoor: [
    {
      id: 'sign_neon_standing',
      name: 'Ayaklı Lüks Neon Tabela',
      category: 'outdoor',
      price: 320,
      icon: 'Sparkles',
      desc: 'Kaldırıma veya kapı önüne konulan kızıl neon ışıklı NUSA-ET tabelası (+%15 Müşteri).'
    },
    {
      id: 'sign_chalkboard',
      name: 'Kaldırım Menü Yazı Tahtası',
      category: 'outdoor',
      price: 160,
      icon: 'Image',
      desc: 'Ön kaldırıma yerleştirilen ahşap A-Tabela günün menüsü panosu.'
    },
    {
      id: 'sign_totem_luxury',
      name: 'Işıklı Dış Mekan Totem Sütunu',
      category: 'outdoor',
      price: 950,
      icon: 'Crown',
      desc: '3.2 metre boyunda dev ışıklı steakhouse marka totemi (+%30 Prestij).'
    },
    {
      id: 'table_outdoor_patio',
      name: 'Teras & Bahçe Masası (Şemsiyeli)',
      category: 'outdoor',
      price: 450,
      icon: 'Sun',
      desc: 'Dış teras için güneş şemsiyeli 4 kişilik ferforje masa (+%20 Bahşiş).',
      tipBonus: 20
    },
    {
      id: 'outdoor_heater',
      name: 'Teras Mantar Gaz Sobası',
      category: 'outdoor',
      price: 280,
      icon: 'Flame',
      desc: 'Dış mekanda müşterileri ısıtan alevli paslanmaz çelik veranda ısıtıcısı.'
    },
    {
      id: 'street_lantern',
      name: 'Nostaljik Sokak Feneri',
      category: 'outdoor',
      price: 220,
      icon: 'Sun',
      desc: 'Kaldırım ve teras kenarını aydınlatan klasik döküm sokak lambası.'
    },
    {
      id: 'outdoor_flower_hedge',
      name: 'Işıklı Şimşir Çit Bariyeri',
      category: 'outdoor',
      price: 180,
      icon: 'Palmtree',
      desc: 'Teras sınırını belirleyen peri masalı ışıklı yeşil şimşir çiti.'
    }
  ],
  kitchen: [
    {
      id: 'grill_basic',
      name: 'Klasik Kömürlü Izgara',
      category: 'kitchen',
      price: 400,
      icon: 'Flame',
      desc: 'Meşe kömürü ateşinde 1 bölmeli et ızgarası.'
    },
    {
      id: 'grill_double',
      name: 'Çift Bölmeli Sanayi Izgarası',
      category: 'kitchen',
      price: 950,
      icon: 'Zap',
      desc: 'Aynı anda 2 farklı siparişi hızlıca pişiren çift gözlü ızgara.'
    },
    {
      id: 'stone_oven',
      name: 'Kubbeli Taş Fırın',
      category: 'kitchen',
      price: 1400,
      icon: 'CircleDot',
      desc: 'Lahmacun ve pideler için %40 daha hızlı pişiren taş fırın.'
    },
    {
      id: 'meat_fridge',
      name: 'Dry-Aged Et Vitrini',
      category: 'kitchen',
      price: 750,
      icon: 'Snowflake',
      desc: 'Himalaya tuzu tuğlalı 28 günlük dinlendirme dolabı (+Puan).'
    }
  ],
  decor: [
    {
      id: 'plant_palm',
      name: 'Tropik Palmiye Saksısı',
      category: 'decor',
      price: 120,
      icon: 'Palmtree',
      desc: 'Restorana ferahlık ve zarafet katan doğal iç mekan bitkisi.'
    },
    {
      id: 'golden_bull',
      name: 'Altın Boğa Heykeli (Nusa-Et)',
      category: 'decor',
      price: 1500,
      icon: 'ShieldCheck',
      desc: 'Steakhouse prestijinizi zirveye taşıyan som altın boğa heykeli.'
    },
    {
      id: 'neon_sign',
      name: 'Neon "STEAK & FIRE" Tabelası',
      category: 'decor',
      price: 350,
      icon: 'Sparkles',
      desc: 'Duvara asılan kızıl neon ışıklandırma.'
    },
    {
      id: 'chandelier_crystal',
      name: 'Kristal Tavana Avize',
      category: 'decor',
      price: 850,
      icon: 'Sun',
      desc: 'Sıcak altın sarısı ışık yayan lüks kristal avize.'
    },
    {
      id: 'picture_steak',
      name: 'Altın Çerçeveli Biftek Tablosu',
      category: 'decor',
      price: 220,
      icon: 'Image',
      desc: 'Klasik sanat galerisi havası katan yağlıboya tablo.'
    },
    {
      id: 'turkish_carpet',
      name: 'Hereke Dokuma Halısı',
      category: 'decor',
      price: 380,
      icon: 'Layers',
      desc: 'Zemine asalet katan geleneksel motifli el dokuma halı.'
    }
  ]
};

export const RESTAURANT_LEVELS = [
  { level: 1, name: 'Butik Izgara Salonu', cost: 0, roomSize: 24, maxTables: 4 },
  { level: 2, name: 'Popüler Et Lokantası', cost: 2500, roomSize: 32, maxTables: 8 },
  { level: 3, name: 'Lüks Nusa-Et Steakhouse', cost: 6500, roomSize: 42, maxTables: 14 },
  { level: 4, name: 'Dünya Markası Nusa-Et Sarayı', cost: 15000, roomSize: 52, maxTables: 24 }
];
