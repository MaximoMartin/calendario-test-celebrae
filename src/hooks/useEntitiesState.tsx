import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useShopManagement } from './useShopManagement';
import { useBundleManagement } from './useBundleManagement';
import type { Shop, Bundle, Item, Extra, BusinessHours } from '../types';
import type { CreateShopData, CreateBundleData, CreateItemData, CreateExtraData } from './types';

// --- CONTEXTO GLOBAL DE ENTIDADES ---
interface EntitiesStateContextType {
  // Estados de todas las entidades
  allShops: Shop[];
  allBundles: Bundle[];
  // allItems: Item[]; // Eliminado
  // allExtras: Extra[]; // Eliminado
  
  // Funciones de creación
  createShop: (data: CreateShopData, userId?: string) => Shop;
  createBundle: (data: CreateBundleData, shopId: string) => Bundle;
  createItem: (data: CreateItemData, bundleId: string) => Item;
  createExtra: (data: CreateExtraData, bundleId: string) => Extra;
  
  // Funciones de actualización
  updateShop: (shopId: string, data: Partial<CreateShopData>) => void;
  updateShopBusinessHours: (shopId: string, businessHours: BusinessHours) => void;
  
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
  const bundleManagement = useBundleManagement();
  // const itemManagement = useItemManagement(); // Eliminado
  // const extraManagement = useExtraManagement(); // Eliminado

  // Obtener bundle con items y extras embebidos
  const getBundleWithContent = useCallback((bundleId: string) => {
    const bundle = bundleManagement.allBundles.find(b => b.id === bundleId);
    if (!bundle) return null;
    return bundle;
  }, [bundleManagement.allBundles]);

  // Obtener shops con bundles actualizados
  const getShopWithBundles = useCallback((shopId: string) => {
    const shop = shopManagement.allShops.find(s => s.id === shopId);
    if (!shop) return null;
    const shopBundles = bundleManagement.allBundles.filter(bundle => bundle.shopId === shopId);
    return {
      shop,
      bundles: shopBundles
    };
  }, [shopManagement.allShops, bundleManagement.allBundles]);

  const value: EntitiesStateContextType = {
    // Estados actuales
    allShops: shopManagement.allShops,
    allBundles: bundleManagement.allBundles,
    // allItems: itemManagement.allItems, // Eliminado
    // allExtras: extraManagement.allExtras, // Eliminado
    
    // Funciones de creación
    createShop: shopManagement.createShop,
    createBundle: bundleManagement.createBundle,
    createItem: (data, bundleId) => {
      const item = bundleManagement.createItem(data, bundleId);
      if (!item) throw new Error('No se pudo crear el item.');
      return item;
    },
    createExtra: (data, bundleId) => {
      const extra = bundleManagement.createExtra(data, bundleId);
      if (!extra) throw new Error('No se pudo crear el extra.');
      return extra;
    },
    
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
      items: bundleManagement.dynamicItemsCount,
      extras: bundleManagement.dynamicExtrasCount
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