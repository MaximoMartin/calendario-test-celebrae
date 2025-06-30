import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useShopManagement } from './useShopManagement';
import { useBundleManagement } from './useBundleManagement';
import { useItemManagement } from './useItemManagement';
import { useExtraManagement } from './useExtraManagement';
import type { Shop, Bundle, Item, Extra, BusinessHours } from '../types';
import type { CreateShopData, CreateBundleData, CreateItemData, CreateExtraData } from './types';

// --- CONTEXTO GLOBAL DE ENTIDADES ---
interface EntitiesStateContextType {
  // Estados de todas las entidades
  allShops: Shop[];
  allBundles: Bundle[];
  allItems: Item[];
  allExtras: Extra[];
  
  // Funciones de creación
  createShop: (data: CreateShopData, userId?: string) => Shop;
  createBundle: (data: CreateBundleData, shopId: string) => Bundle;
  createItem: (data: CreateItemData, bundleId: string) => Item;
  createExtra: (data: CreateExtraData, bundleId: string) => Extra;
  
  // Funciones de actualización
  updateShop: (shopId: string, data: Partial<CreateShopData>) => void;
  updateShopBusinessHours: (shopId: string, businessHours: BusinessHours) => void;
  
  // Funciones de consulta
  getBundleWithContent: (bundleId: string) => any;
  getShopWithBundles: (shopId: string) => any;
  
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
  const bundleManagement = useBundleManagement();
  const itemManagement = useItemManagement();
  const extraManagement = useExtraManagement();

  // Obtener bundle con items y extras actualizados
  const getBundleWithContent = useCallback((bundleId: string) => {
    const bundle = bundleManagement.allBundles.find(b => b.id === bundleId);
    if (!bundle) return null;

    return {
      ...bundle,
      items: itemManagement.allItems.filter(item => item.bundleId === bundleId),
      extras: extraManagement.allExtras.filter(extra => extra.bundleId === bundleId)
    };
  }, [bundleManagement.allBundles, itemManagement.allItems, extraManagement.allExtras]);

  // Obtener shops con bundles actualizados
  const getShopWithBundles = useCallback((shopId: string) => {
    const shop = shopManagement.allShops.find(s => s.id === shopId);
    if (!shop) return null;

    const shopBundles = bundleManagement.allBundles
      .filter(bundle => bundle.shopId === shopId)
      .map(bundle => getBundleWithContent(bundle.id))
      .filter(Boolean);

    return {
      shop,
      bundles: shopBundles
    };
  }, [shopManagement.allShops, bundleManagement.allBundles, getBundleWithContent]);

  const value: EntitiesStateContextType = {
    // Estados actuales
    allShops: shopManagement.allShops,
    allBundles: bundleManagement.allBundles,
    allItems: itemManagement.allItems,
    allExtras: extraManagement.allExtras,
    
    // Funciones de creación
    createShop: shopManagement.createShop,
    createBundle: bundleManagement.createBundle,
    createItem: itemManagement.createItem,
    createExtra: extraManagement.createExtra,
    
    // Funciones de actualización
    updateShop: shopManagement.updateShop,
    updateShopBusinessHours: shopManagement.updateShopBusinessHours,
    
    // Helpers
    getBundleWithContent,
    getShopWithBundles,
    
    // Contadores
    dynamicEntitiesCount: {
      shops: shopManagement.dynamicShopsCount,
      bundles: bundleManagement.dynamicBundlesCount,
      items: itemManagement.dynamicItemsCount,
      extras: extraManagement.dynamicExtrasCount
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