import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useShopSelection } from './useShopSelection';
import { useCalendarManagement } from './useCalendarManagement';
import { useShopStats } from './useShopStats';
import type { Shop, Bundle, Item } from '../types';

// Contexto para el estado de shops en el calendario
interface ShopStateContextType {
  // Propiedades para compatibilidad con App.tsx
  selectedShopId: string;
  setSelectedShopId: React.Dispatch<React.SetStateAction<string>>;
  selectedShop: Shop;
  shopBundles: Bundle[];
  shopItems: Item[];
  shopStats: any;
  calendarEvents: any[];
  
  // Propiedades para recursos del calendario
  resources: any[];
  getShopById: (id: string) => Shop | undefined;
  getBundleById: (id: string) => Bundle | undefined;
  getItemById: (id: string) => Item | undefined;
  getShopWithBundles: (shopId: string) => any;
  getBundleWithContent: (bundleId: string) => any;
}

const ShopStateContext = createContext<ShopStateContextType | undefined>(undefined);

export const ShopStateProvider = ({ children }: { children: ReactNode }) => {
  // Usar hooks específicos
  const shopSelection = useShopSelection();
  const calendarManagement = useCalendarManagement(shopSelection.selectedShopId);
  const shopStats = useShopStats(calendarManagement.shopReservations);

  const value: ShopStateContextType = {
    // Propiedades para compatibilidad con App.tsx
    selectedShopId: shopSelection.selectedShopId,
    setSelectedShopId: shopSelection.setSelectedShopId,
    selectedShop: shopSelection.selectedShop,
    shopBundles: shopSelection.shopBundles,
    shopItems: shopSelection.shopItems,
    shopStats,
    calendarEvents: calendarManagement.calendarEvents,
    
    // Propiedades para recursos del calendario
    resources: calendarManagement.resources,
    getShopById: shopSelection.getShopById,
    getBundleById: shopSelection.getBundleById,
    getItemById: shopSelection.getItemById,
    getShopWithBundles: shopSelection.getShopWithBundles,
    getBundleWithContent: shopSelection.getBundleWithContent
  };

  return (
    <ShopStateContext.Provider value={value}>
      {children}
    </ShopStateContext.Provider>
  );
};

export const useShopState = () => {
  const context = useContext(ShopStateContext);
  if (!context) {
    throw new Error('useShopState debe usarse dentro de ShopStateProvider');
  }
  return context;
}; 