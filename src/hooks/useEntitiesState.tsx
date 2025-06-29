import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { mockShops } from '../mockData';
import type { Shop, Bundle, Item, Extra } from '../types';

// 🎯 CHECKPOINT 10: HOOK PARA GESTIÓN DINÁMICA DE ENTIDADES
// Permite crear nuevos Shops, Bundles, Items y Extras desde la interfaz

export interface CreateShopData {
  name: string;
  address: string;
  description?: string;
  phone: string;
  email: string;
  category?: string;
  subCategory?: string;
}

export interface CreateBundleData {
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  maxCapacity: number;
  duration: number;
  allowInstantBooking: boolean;
  requiresApproval: boolean;
  cancellationPolicy: string;
  tags: string[];
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  isPerGroup: boolean;
  maxCapacity: number;
  duration: number;
  isRequired?: boolean;
}

export interface CreateExtraData {
  title: string;
  description: string;
  price: number;
  isPerGroup: boolean;
  maxQuantity?: number;
  isRequired?: boolean;
  requiredItemId?: string;
}

// --- CONTEXTO GLOBAL DE ENTIDADES ---
interface EntitiesStateContextType {
  allShops: Shop[];
  allBundles: Bundle[];
  allItems: Item[];
  allExtras: Extra[];
  createShop: (data: CreateShopData, userId?: string) => Shop;
  createBundle: (data: CreateBundleData, shopId: string) => Bundle;
  createItem: (data: CreateItemData, bundleId: string) => Item;
  createExtra: (data: CreateExtraData, bundleId: string) => Extra;
  getBundleWithContent: (bundleId: string) => any;
  getShopWithBundles: (shopId: string) => any;
  dynamicEntitiesCount: {
    shops: number;
    bundles: number;
    items: number;
    extras: number;
  };
}

const EntitiesStateContext = createContext<EntitiesStateContextType | undefined>(undefined);

export const EntitiesStateProvider = ({ children }: { children: ReactNode }) => {
  // Estados para entidades dinámicas
  // --- DATOS DE EJEMPLO INICIALES ---
  const now = new Date().toISOString();
  // IDs de shops
  const shopMaxi = "shop_maxi";
  const shopCafe = "shop_cafe";

  // Bundles de ejemplo
  const initialBundles = [
    // --- La vuelta del Maxi ---
    {
      id: "bundle_paris",
      name: "Alquiler París",
      description: "Alquiler de autos premium para recorrer París a tu ritmo.",
      shortDescription: "Incluye seguro y asistencia.",
      shopId: shopMaxi,
      items: [], // Se llenan luego
      extras: [],
      basePrice: 120,
      maxCapacity: 5,
      duration: 1440,
      bookingSettings: {
        allowInstantBooking: true,
        requiresApproval: false,
        cancellationPolicy: "Cancelación gratuita hasta 24h antes",
        refundPolicy: "Reembolso total hasta 24h antes"
      },
      imageUrls: ["https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800"],
      tags: ["auto", "viaje", "premium"],
      isActive: true,
      isFeatured: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "bundle_escaperoom",
      name: "Escape Room Misión Egipcia",
      description: "Vive la experiencia de un escape room temático con enigmas y desafíos.",
      shortDescription: "Ideal para grupos y familias.",
      shopId: shopMaxi,
      items: [],
      extras: [],
      basePrice: 80,
      maxCapacity: 8,
      duration: 90,
      bookingSettings: {
        allowInstantBooking: false,
        requiresApproval: true,
        cancellationPolicy: "No reembolsable 12h antes",
        refundPolicy: "Reembolso parcial según política"
      },
      imageUrls: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800"],
      tags: ["escape", "juego", "familia"],
      isActive: true,
      isFeatured: false,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "bundle_spa",
      name: "Spa Day con Aromaterapia",
      description: "Jornada de spa con masajes, sauna y aromaterapia.",
      shortDescription: "Relajación total para cuerpo y mente.",
      shopId: shopMaxi,
      items: [],
      extras: [],
      basePrice: 150,
      maxCapacity: 4,
      duration: 180,
      bookingSettings: {
        allowInstantBooking: true,
        requiresApproval: false,
        cancellationPolicy: "Cancelación gratuita hasta 48h antes",
        refundPolicy: "Reembolso total hasta 48h antes"
      },
      imageUrls: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"],
      tags: ["spa", "relax", "salud"],
      isActive: true,
      isFeatured: false,
      order: 3,
      createdAt: now,
      updatedAt: now
    },
    // --- Café Delicias ---
    {
      id: "bundle_brunch",
      name: "Brunch Especial",
      description: "Disfruta de un brunch gourmet con opciones continentales y americanas.",
      shortDescription: "Incluye bebida y postre.",
      shopId: shopCafe,
      items: [],
      extras: [],
      basePrice: 35,
      maxCapacity: 20,
      duration: 120,
      bookingSettings: {
        allowInstantBooking: true,
        requiresApproval: false,
        cancellationPolicy: "Cancelación gratuita hasta 2h antes",
        refundPolicy: "Reembolso total hasta 2h antes"
      },
      imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
      tags: ["brunch", "café", "gourmet"],
      isActive: true,
      isFeatured: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "bundle_tarde_cafe",
      name: "Tarde de Café y Postres",
      description: "Merienda con selección de cafés y postres artesanales.",
      shortDescription: "Ideal para compartir.",
      shopId: shopCafe,
      items: [],
      extras: [],
      basePrice: 20,
      maxCapacity: 15,
      duration: 90,
      bookingSettings: {
        allowInstantBooking: true,
        requiresApproval: false,
        cancellationPolicy: "Cancelación gratuita hasta 1h antes",
        refundPolicy: "Reembolso total hasta 1h antes"
      },
      imageUrls: ["https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=800"],
      tags: ["café", "postre", "merienda"],
      isActive: true,
      isFeatured: false,
      order: 2,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Items de ejemplo
  const initialItems = [
    // --- Alquiler París ---
    {
      id: "item_vw_jetta",
      title: "VW Jetta",
      description: "Sedán cómodo, ideal para recorrer la ciudad.",
      price: 60,
      isForAdult: true,
      bundleId: "bundle_paris",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 5,
        duration: 1440,
        requiresConfirmation: false,
        advanceBookingDays: 30
      },
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "item_bmw_x3",
      title: "BMW X3 Premium",
      description: "SUV de lujo para una experiencia superior.",
      price: 90,
      isForAdult: true,
      bundleId: "bundle_paris",
      isPerGroup: true,
      bookingConfig: {
        maxCapacity: 5,
        duration: 1440,
        requiresConfirmation: false,
        advanceBookingDays: 30,
        groupCapacity: 5,
        isExclusive: true
      },
      isActive: true,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    // --- Escape Room ---
    {
      id: "item_mision_egipcia",
      title: "Juego Misión Egipcia",
      description: "Resuelve enigmas y escapa de la pirámide.",
      price: 80,
      isForAdult: true,
      bundleId: "bundle_escaperoom",
      isPerGroup: true,
      bookingConfig: {
        maxCapacity: 8,
        duration: 90,
        requiresConfirmation: true,
        advanceBookingDays: 15,
        groupCapacity: 8,
        isExclusive: true
      },
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    // --- Spa Day ---
    {
      id: "item_masaje",
      title: "Masaje Relajante",
      description: "Masaje de 60 minutos con aceites esenciales.",
      price: 50,
      isForAdult: true,
      bundleId: "bundle_spa",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 2,
        duration: 60,
        requiresConfirmation: false,
        advanceBookingDays: 10
      },
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "item_sauna",
      title: "Sauna Finlandesa",
      description: "Sesión de sauna para eliminar toxinas.",
      price: 30,
      isForAdult: true,
      bundleId: "bundle_spa",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 4,
        duration: 30,
        requiresConfirmation: false,
        advanceBookingDays: 10
      },
      isActive: true,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    // --- Brunch Especial ---
    {
      id: "item_continental",
      title: "Desayuno Continental",
      description: "Café, jugo, medialunas y frutas frescas.",
      price: 18,
      isForAdult: true,
      bundleId: "bundle_brunch",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 10,
        duration: 60,
        requiresConfirmation: false,
        advanceBookingDays: 7
      },
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "item_americano",
      title: "Desayuno Americano",
      description: "Huevos, bacon, pancakes y café.",
      price: 22,
      isForAdult: true,
      bundleId: "bundle_brunch",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 10,
        duration: 60,
        requiresConfirmation: false,
        advanceBookingDays: 7
      },
      isActive: true,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    // --- Tarde de Café ---
    {
      id: "item_cafe_gourmet",
      title: "Café Gourmet",
      description: "Selección de cafés especiales.",
      price: 8,
      isForAdult: true,
      bundleId: "bundle_tarde_cafe",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 15,
        duration: 30,
        requiresConfirmation: false,
        advanceBookingDays: 5
      },
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "item_postres",
      title: "Postres Artesanales",
      description: "Variedad de postres caseros.",
      price: 12,
      isForAdult: true,
      bundleId: "bundle_tarde_cafe",
      isPerGroup: false,
      bookingConfig: {
        maxCapacity: 15,
        duration: 30,
        requiresConfirmation: false,
        advanceBookingDays: 5
      },
      isActive: true,
      order: 2,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Extras de ejemplo
  const initialExtras = [
    // --- Alquiler París ---
    {
      id: "extra_gps",
      title: "GPS",
      description: "Navegador GPS con mapas de Europa actualizados.",
      price: 10,
      isForAdult: true,
      bundleId: "bundle_paris",
      isPerGroup: true,
      maxQuantity: 1,
      isRequired: false,
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "extra_seguro",
      title: "Seguro Completo",
      description: "Cobertura total ante accidentes y robos.",
      price: 25,
      isForAdult: true,
      bundleId: "bundle_paris",
      isPerGroup: true,
      maxQuantity: 1,
      isRequired: true,
      isActive: true,
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "extra_portaequipaje",
      title: "Porta equipaje",
      description: "Baúl adicional para equipaje voluminoso.",
      price: 15,
      isForAdult: true,
      bundleId: "bundle_paris",
      isPerGroup: false,
      maxQuantity: 2,
      isRequired: false,
      isActive: true,
      order: 3,
      createdAt: now,
      updatedAt: now
    },
    // --- Escape Room ---
    {
      id: "extra_certificado",
      title: "Certificado de Escape",
      description: "Diploma para los que logran escapar.",
      price: 5,
      isForAdult: true,
      bundleId: "bundle_escaperoom",
      isPerGroup: true,
      maxQuantity: 1,
      isRequired: false,
      requiredItemId: "item_mision_egipcia",
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    // --- Spa Day ---
    {
      id: "extra_aromaterapia",
      title: "Aromaterapia Premium",
      description: "Aceites esenciales de alta gama para tu sesión.",
      price: 20,
      isForAdult: true,
      bundleId: "bundle_spa",
      isPerGroup: false,
      maxQuantity: 2,
      isRequired: false,
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    // --- Brunch Especial ---
    {
      id: "extra_mimosa",
      title: "Mimosa",
      description: "Copa de mimosa (jugo de naranja y espumante).",
      price: 6,
      isForAdult: true,
      bundleId: "bundle_brunch",
      isPerGroup: false,
      maxQuantity: 2,
      isRequired: false,
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    // --- Tarde de Café ---
    {
      id: "extra_combo_postres",
      title: "Combo de Postres",
      description: "Incluye 3 postres a elección.",
      price: 15,
      isForAdult: true,
      bundleId: "bundle_tarde_cafe",
      isPerGroup: false,
      maxQuantity: 1,
      isRequired: false,
      isActive: true,
      order: 1,
      createdAt: now,
      updatedAt: now
    }
  ];

  // En mockData/index.ts, mockShops debe tener status y deletedAt
  // Si no, aquí forzamos el tipado correcto
  const safeMockShops = mockShops.map(shop => ({
    ...shop,
    status: 'active' as const,
    deletedAt: null
  }));

  // --- MIGRACIÓN A NUEVO MODELO ---
  // Mapear itemIds y extraIds a cada bundle
  function getItemIdsForBundle(bundleId: string) {
    return initialItems.filter(item => item.bundleId === bundleId).map(item => item.id);
  }
  function getExtraIdsForBundle(bundleId: string) {
    return initialExtras.filter(extra => extra.bundleId === bundleId).map(extra => extra.id);
  }
  function getShopIdForBundle(bundleId: string) {
    const bundle = initialBundles.find(b => b.id === bundleId);
    return bundle ? bundle.shopId : '';
  }

  // Migrar bundles a nueva estructura
  const migratedBundles = initialBundles.map(bundle => {
    // Migrar items y extras embebidos con los campos nuevos
    const items = initialItems.filter(item => item.bundleId === bundle.id).map(item => ({
      ...item,
      shopId: bundle.shopId,
      status: 'active' as const,
      deletedAt: null
    }));
    const extras = initialExtras.filter(extra => extra.bundleId === bundle.id).map(extra => ({
      ...extra,
      shopId: bundle.shopId,
      status: 'active' as const,
      deletedAt: null
    }));
    return {
      ...bundle,
      itemIds: items.map(i => i.id),
      extraIds: extras.map(e => e.id),
      status: 'active' as const,
      deletedAt: null,
      items: items || [],
      extras: extras || []
    };
  });

  // Migrar items a nueva estructura
  const migratedItems = initialItems.map(item => ({
    ...item,
    shopId: getShopIdForBundle(item.bundleId),
    status: 'active' as const,
    deletedAt: null
  }));

  // Migrar extras a nueva estructura
  const migratedExtras = initialExtras.map(extra => ({
    ...extra,
    shopId: getShopIdForBundle(extra.bundleId),
    status: 'active' as const,
    deletedAt: null
  }));

  // Migrar shops a nueva estructura
  const migratedShops = safeMockShops;

  // Estados para entidades dinámicas
  const [dynamicShops, setDynamicShops] = useState<Shop[]>([]);
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([...migratedBundles]);
  const [dynamicItems, setDynamicItems] = useState<Item[]>([...migratedItems]);
  const [dynamicExtras, setDynamicExtras] = useState<Extra[]>([...migratedExtras]);

  // Combinar entidades estáticas con dinámicas
  const allShops = useMemo(() => [...migratedShops, ...dynamicShops], [dynamicShops]);
  const allBundles = useMemo(() => [...dynamicBundles], [dynamicBundles]); // Solo dinámicos por ahora
  const allItems = useMemo(() => [...dynamicItems], [dynamicItems]); // Solo dinámicos por ahora  
  const allExtras = useMemo(() => [...dynamicExtras], [dynamicExtras]); // Solo dinámicos por ahora

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Crear nuevo Shop
  const createShop = useCallback((data: CreateShopData, userId: string = "87IZYWdezwJQsILiU57z") => {
    const newShop: Shop = {
      id: generateId('shop'),
      name: data.name,
      address: data.address,
      shopStatus: 'ENABLED',
      userId,
      status: 'active',
      deletedAt: null
    };
    setDynamicShops(prev => [...prev, newShop]);
    console.log('🏪 Nuevo shop creado:', newShop.name, '(ID:', newShop.id, ')');
    return newShop;
  }, [generateId]);

  // Crear nuevo Bundle
  const createBundle = useCallback((data: CreateBundleData, shopId: string) => {
    const newBundle: Bundle = {
      id: generateId('bundle'),
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription || '',
      shopId,
      itemIds: [],
      extraIds: [],
      items: [],
      extras: [],
      basePrice: data.basePrice,
      maxCapacity: data.maxCapacity,
      duration: data.duration,
      bookingSettings: {
        allowInstantBooking: data.allowInstantBooking,
        requiresApproval: data.requiresApproval,
        cancellationPolicy: data.cancellationPolicy,
        refundPolicy: 'Reembolso según política de cancelación'
      },
      imageUrls: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
      ],
      tags: data.tags,
      isActive: true,
      isFeatured: false,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    setDynamicBundles(prev => [...prev, newBundle]);
    console.log('📦 Nuevo bundle creado:', newBundle.name, '(ID:', newBundle.id, ')');
    return newBundle;
  }, [generateId]);

  // Crear nuevo Item
  const createItem = useCallback((data: CreateItemData, bundleId: string) => {
    // Buscar shopId del bundle
    const bundle = dynamicBundles.find(b => b.id === bundleId);
    const shopId = bundle ? bundle.shopId : '';
    const newItem: Item = {
      id: generateId('item'),
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: true,
      bundleId,
      shopId,
      isPerGroup: data.isPerGroup,
      bookingConfig: {
        maxCapacity: data.maxCapacity,
        duration: data.duration,
        requiresConfirmation: true,
        advanceBookingDays: 30,
        groupCapacity: data.isPerGroup ? data.maxCapacity : undefined,
        isExclusive: data.isPerGroup
      },
      isActive: true,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    setDynamicItems(prev => [...prev, newItem]);
    setDynamicBundles(prev => prev.map(bundle =>
      bundle.id === bundleId
        ? { ...bundle, itemIds: [...bundle.itemIds, newItem.id], items: [...(bundle.items || []), newItem] }
        : bundle
    ));
    console.log('🎯 Nuevo item creado:', newItem.title, '(ID:', newItem.id, ')');
    return newItem;
  }, [generateId, dynamicBundles]);

  // Crear nuevo Extra
  const createExtra = useCallback((data: CreateExtraData, bundleId: string) => {
    // Buscar shopId del bundle
    const bundle = dynamicBundles.find(b => b.id === bundleId);
    const shopId = bundle ? bundle.shopId : '';
    const newExtra: Extra = {
      id: generateId('extra'),
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: true,
      bundleId,
      shopId,
      isPerGroup: data.isPerGroup,
      requiredItemId: data.requiredItemId,
      quantity: 0,
      maxQuantity: data.maxQuantity || 5,
      isRequired: data.isRequired || false,
      isActive: true,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    setDynamicExtras(prev => [...prev, newExtra]);
    setDynamicBundles(prev => prev.map(bundle =>
      bundle.id === bundleId
        ? { ...bundle, extraIds: [...bundle.extraIds, newExtra.id], extras: [...(bundle.extras || []), newExtra] }
        : bundle
    ));
    console.log('➕ Nuevo extra creado:', newExtra.title, '(ID:', newExtra.id, ')');
    return newExtra;
  }, [generateId, dynamicBundles]);

  // Obtener bundle con items y extras actualizados
  const getBundleWithContent = useCallback((bundleId: string) => {
    const bundle = allBundles.find(b => b.id === bundleId);
    if (!bundle) return null;

    return {
      ...bundle,
      items: allItems.filter(item => item.bundleId === bundleId),
      extras: allExtras.filter(extra => extra.bundleId === bundleId)
    };
  }, [allBundles, allItems, allExtras]);

  // Obtener shops con bundles actualizados
  const getShopWithBundles = useCallback((shopId: string) => {
    const shop = allShops.find(s => s.id === shopId);
    if (!shop) return null;

    const shopBundles = allBundles
      .filter(bundle => bundle.shopId === shopId)
      .map(bundle => getBundleWithContent(bundle.id))
      .filter(Boolean);

    return {
      shop,
      bundles: shopBundles
    };
  }, [allShops, allBundles, getBundleWithContent]);

  const value: EntitiesStateContextType = {
    // Estados actuales
    allShops,
    allBundles,
    allItems,
    allExtras,
    
    // Funciones de creación
    createShop,
    createBundle,
    createItem,
    createExtra,
    
    // Helpers
    getBundleWithContent,
    getShopWithBundles,
    
    // Contadores
    dynamicEntitiesCount: {
      shops: dynamicShops.length,
      bundles: dynamicBundles.length,
      items: dynamicItems.length,
      extras: dynamicExtras.length
    }
  };

  return (
    <EntitiesStateContext.Provider value={value}>
      {children}
    </EntitiesStateContext.Provider>
  );
};

export const useEntitiesState = () => {
  const context = useContext(EntitiesStateContext);
  if (!context) {
    throw new Error('useEntitiesState debe usarse dentro de EntitiesStateProvider');
  }
  return context;
}; 