import { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useShopManagement } from './useShopManagement';
import type { Shop, Bundle, Item, Extra, BusinessHours } from '../types';
import type { CreateShopData, CreateBundleData, CreateItemData, CreateExtraData } from './types';
import { mockBundles } from '../data/mockBundles';

// --- CONTEXTO GLOBAL DE ENTIDADES ---
interface EntitiesStateContextType {
  // Estados de todas las entidades
  allShops: Shop[];
  allBundles: Bundle[];
  // Funciones de creación
  createShop: (data: CreateShopData, userId?: string) => Shop;
  createBundle: (data: CreateBundleData, shopId: string) => Bundle;
  createItem: (data: CreateItemData, bundleId: string) => Item;
  createExtra: (data: CreateExtraData, bundleId: string) => Extra;
  // Funciones de actualización
  updateShop: (shopId: string, data: Partial<CreateShopData>) => void;
  updateShopBusinessHours: (shopId: string, businessHours: BusinessHours) => void;
  updateBundle: (bundleId: string, data: Partial<Bundle>) => void;
  updateItem: (bundleId: string, itemId: string, data: Partial<Item>) => void;
  updateExtra: (bundleId: string, extraId: string, data: Partial<Extra>) => void;
  deleteItem: (bundleId: string, itemId: string) => void;
  deleteExtra: (bundleId: string, extraId: string) => void;
  // Funciones de consulta
  getBundleWithContent: (bundleId: string) => Bundle | null;
  getShopWithBundles: (shopId: string) => { shop: Shop; bundles: Bundle[] } | null;
  // Contadores
  dynamicEntitiesCount: {
    shops: number;
    bundles: number;
    items: number;
    extras: number;
  };
}

const EntitiesStateContext = createContext<EntitiesStateContextType | undefined>(undefined);

export const EntitiesStateProvider = ({ children }: { children: ReactNode }) => {
  // Usar hooks específicos para cada tipo de entidad
  const shopManagement = useShopManagement();
  // Usar los bundles mock como fuente de verdad inicial, pero permitir mutación
  const [allBundles, setAllBundles] = useState<Bundle[]>(mockBundles);

  // Obtener bundle con items y extras embebidos
  const getBundleWithContent = useCallback((bundleId: string) => {
    const bundle = allBundles.find((b: Bundle) => b.id === bundleId);
    if (!bundle) return null;
    return bundle;
  }, [allBundles]);

  // Obtener shops con bundles actualizados
  const getShopWithBundles = useCallback((shopId: string) => {
    const shop = shopManagement.allShops.find((s: Shop) => s.id === shopId);
    if (!shop) return null;
    const shopBundles = allBundles.filter((bundle: Bundle) => bundle.shopId === shopId);
    return {
      shop,
      bundles: shopBundles
    };
  }, [shopManagement.allShops, allBundles]);

  // Funciones de creación
  const createBundle = (data: CreateBundleData, shopId: string): Bundle => {
    const newBundle: Bundle = {
      id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      shopId,
      items: [],
      extras: [],
      basePrice: data.basePrice,
      maxCapacity: data.maxCapacity,
      duration: data.duration,
      bookingSettings: {
        allowInstantBooking: data.allowInstantBooking,
        requiresApproval: data.requiresApproval,
        cancellationPolicy: data.cancellationPolicy,
        refundPolicy: data.refundPolicy
      },
      imageUrls: data.imageUrls || [],
      tags: data.tags,
      isActive: true,
      isFeatured: data.isFeatured || false,
      order: data.order || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    
    setAllBundles(prev => [...prev, newBundle]);
    return newBundle;
  };

  const createItem = (data: CreateItemData, bundleId: string): Item => {
    const newItem: Item = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: data.isForAdult || false,
      shopId: allBundles.find(b => b.id === bundleId)?.shopId,
      isPerGroup: data.isPerGroup,
      bookingConfig: {
        maxCapacity: data.maxCapacity,
        duration: data.duration,
        requiresConfirmation: data.requiresConfirmation || false,
        advanceBookingDays: data.advanceBookingDays || 7,
        groupCapacity: data.groupCapacity,
        isExclusive: data.isExclusive || false
      },
      timeSlots: data.timeSlots,
      isActive: true,
      order: data.order || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    
    setAllBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, items: [...bundle.items, newItem] }
        : bundle
    ));
    return newItem;
  };

  const createExtra = (data: CreateExtraData, bundleId: string): Extra => {
    const newExtra: Extra = {
      id: `extra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: data.isForAdult || false,
      shopId: allBundles.find(b => b.id === bundleId)?.shopId,
      isPerGroup: data.isPerGroup,
      requiredItemId: data.requiredItemId,
      quantity: data.defaultQuantity,
      maxQuantity: data.maxQuantity,
      isRequired: data.isRequired || false,
      isActive: data.isActive !== false,
      order: data.order || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    
    setAllBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, extras: [...bundle.extras, newExtra] }
        : bundle
    ));
    return newExtra;
  };

  // Funciones de actualización
  const updateBundle = (bundleId: string, data: Partial<Bundle>) => {
    setAllBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { ...bundle, ...data, updatedAt: new Date().toISOString() }
        : bundle
    ));
  };

  const updateItem = (bundleId: string, itemId: string, data: Partial<Item>) => {
    setAllBundles(prev => prev.map(bundle => {
      if (bundle.id === bundleId) {
        return {
          ...bundle,
          items: bundle.items.map(item => 
            item.id === itemId 
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return bundle;
    }));
  };

  const updateExtra = (bundleId: string, extraId: string, data: Partial<Extra>) => {
    setAllBundles(prev => prev.map(bundle => {
      if (bundle.id === bundleId) {
        return {
          ...bundle,
          extras: bundle.extras.map(extra => 
            extra.id === extraId 
              ? { ...extra, ...data, updatedAt: new Date().toISOString() }
              : extra
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return bundle;
    }));
  };

  const deleteItem = (bundleId: string, itemId: string) => {
    setAllBundles(prev => prev.map(bundle => {
      if (bundle.id === bundleId) {
        return {
          ...bundle,
          items: bundle.items.filter(item => item.id !== itemId),
          updatedAt: new Date().toISOString()
        };
      }
      return bundle;
    }));
  };

  const deleteExtra = (bundleId: string, extraId: string) => {
    setAllBundles(prev => prev.map(bundle => {
      if (bundle.id === bundleId) {
        return {
          ...bundle,
          extras: bundle.extras.filter(extra => extra.id !== extraId),
          updatedAt: new Date().toISOString()
        };
      }
      return bundle;
    }));
  };

  const value: EntitiesStateContextType = {
    // Estados actuales
    allShops: shopManagement.allShops,
    allBundles,
    // Funciones de creación
    createShop: shopManagement.createShop,
    createBundle,
    createItem,
    createExtra,
    // Funciones de actualización
    updateShop: shopManagement.updateShop,
    updateShopBusinessHours: shopManagement.updateShopBusinessHours,
    updateBundle,
    updateItem,
    updateExtra,
    deleteItem,
    deleteExtra,
    // Helpers
    getBundleWithContent,
    getShopWithBundles,
    // Contadores
    dynamicEntitiesCount: {
      shops: shopManagement.dynamicShopsCount,
      bundles: allBundles.length,
      items: allBundles.reduce((acc, bundle) => acc + (bundle.items?.length || 0), 0),
      extras: allBundles.reduce((acc, bundle) => acc + (bundle.extras?.length || 0), 0)
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