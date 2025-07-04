import { createContext, useContext, useCallback } from 'react';
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
  // Usar los bundles mock como fuente de verdad
  const allBundles: Bundle[] = mockBundles;

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

  // Funciones de creación (deben ser implementadas correctamente según la fuente de bundles)
  const createBundle = (data: CreateBundleData, shopId: string): Bundle => {
    throw new Error('Función createBundle no implementada');
  };
  const createItem = (data: CreateItemData, bundleId: string): Item => {
    throw new Error('Función createItem no implementada');
  };
  const createExtra = (data: CreateExtraData, bundleId: string): Extra => {
    throw new Error('Función createExtra no implementada');
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