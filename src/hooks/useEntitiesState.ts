import { useState, useMemo, useCallback } from 'react';
import { extendedShops, bundles as initialBundles, items as initialItems, extras as initialExtras } from '../mockData/entitiesData';
import type { ExtendedShop, Bundle, Item, Extra } from '../types';

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

export const useEntitiesState = () => {
  // Estados para entidades dinámicas
  const [dynamicShops, setDynamicShops] = useState<ExtendedShop[]>([]);
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([]);
  const [dynamicItems, setDynamicItems] = useState<Item[]>([]);
  const [dynamicExtras, setDynamicExtras] = useState<Extra[]>([]);

  // Combinar entidades estáticas con dinámicas
  const allShops = useMemo(() => [...extendedShops, ...dynamicShops], [dynamicShops]);
  const allBundles = useMemo(() => [...initialBundles, ...dynamicBundles], [dynamicBundles]);
  const allItems = useMemo(() => [...initialItems, ...dynamicItems], [dynamicItems]);
  const allExtras = useMemo(() => [...initialExtras, ...dynamicExtras], [dynamicExtras]);

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Crear nuevo Shop
  const createShop = useCallback((data: CreateShopData, userId: string = "87IZYWdezwJQsILiU57z") => {
    const newShop: ExtendedShop = {
      // Datos base
      id: generateId('shop'),
      name: data.name,
      address: data.address,
      shopStatus: 'ENABLED',
      userId,
      
      // Datos extendidos
      description: data.description || '',
      imageUrls: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
      ],
      category: data.category || 'General',
      subCategory: data.subCategory || '',
      
      // Configuración por defecto
      serviceSettings: {
        allowOnlineBooking: true,
        requiresPhoneConfirmation: false,
        autoAcceptBookings: true,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2
      },
      
      // Ubicación básica
      location: {
        latitude: -31.4201,
        longitude: -64.1888,
        city: 'Córdoba',
        state: 'Córdoba',
        country: 'Argentina',
        postalCode: '5000'
      },
      
      // Información de contacto
      contactInfo: {
        phone: data.phone,
        email: data.email,
        website: '',
        socialMedia: {}
      },
      
      // Metadatos
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      
      // Contenido inicial vacío
      items: [],
      extras: [],
      
      // Configuración
      basePrice: data.basePrice,
      maxCapacity: data.maxCapacity,
      duration: data.duration,
      
      // Configuración de reservas
      bookingSettings: {
        allowInstantBooking: data.allowInstantBooking,
        requiresApproval: data.requiresApproval,
        cancellationPolicy: data.cancellationPolicy,
        refundPolicy: 'Reembolso según política de cancelación'
      },
      
      // Presentación
      imageUrls: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
      ],
      tags: data.tags,
      
      // Metadatos
      isActive: true,
      isFeatured: false,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDynamicBundles(prev => [...prev, newBundle]);
    
    console.log('📦 Nuevo bundle creado:', newBundle.name, '(ID:', newBundle.id, ')');
    
    return newBundle;
  }, [generateId]);

  // Crear nuevo Item
  const createItem = useCallback((data: CreateItemData, bundleId: string) => {
    const newItem: Item = {
      id: generateId('item'),
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: true,
      bundleId,
      
      // Configuración de grupos
      isPerGroup: data.isPerGroup,
      
      // Configuración de reserva
      bookingConfig: {
        maxCapacity: data.maxCapacity,
        duration: data.duration,
        requiresConfirmation: true,
        advanceBookingDays: 30,
        groupCapacity: data.isPerGroup ? data.maxCapacity : undefined,
        isExclusive: data.isPerGroup
      },
      
      // Metadatos
      isActive: true,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDynamicItems(prev => [...prev, newItem]);
    
    // Actualizar el bundle para incluir el nuevo item
    setDynamicBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, items: [...bundle.items, newItem] }
        : bundle
    ));
    
    console.log('🎯 Nuevo item creado:', newItem.title, '(ID:', newItem.id, ')');
    
    return newItem;
  }, [generateId]);

  // Crear nuevo Extra
  const createExtra = useCallback((data: CreateExtraData, bundleId: string) => {
    const newExtra: Extra = {
      id: generateId('extra'),
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: true,
      bundleId,
      
      // Configuración de grupos
      isPerGroup: data.isPerGroup,
      
      // Relaciones condicionales
      requiredItemId: data.requiredItemId,
      
      // Configuración
      quantity: 0,
      maxQuantity: data.maxQuantity || 5,
      isRequired: data.isRequired || false,
      
      // Metadatos
      isActive: true,
      order: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDynamicExtras(prev => [...prev, newExtra]);
    
    // Actualizar el bundle para incluir el nuevo extra
    setDynamicBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, extras: [...bundle.extras, newExtra] }
        : bundle
    ));
    
    console.log('➕ Nuevo extra creado:', newExtra.title, '(ID:', newExtra.id, ')');
    
    return newExtra;
  }, [generateId]);

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

  return {
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
}; 