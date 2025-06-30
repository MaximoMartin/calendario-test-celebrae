// Hook específico para selección de shop
// Extraído de useShopState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { useEntitiesState } from './useEntitiesState';

export const useShopSelection = () => {
  const { allShops, allBundles, allItems, getShopWithBundles, getBundleWithContent } = useEntitiesState();
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  // Shop seleccionado (combina shops estáticos y dinámicos)
  const selectedShop = useMemo(() => {
    // Si no hay shop seleccionado, usar el primero disponible
    if (!selectedShopId && allShops.length > 0) {
      setSelectedShopId(allShops[0].id);
      return allShops[0];
    }
    return allShops.find(shop => shop.id === selectedShopId) || allShops[0] || null;
  }, [selectedShopId, allShops]);

  // Bundles del shop seleccionado (incluye dinámicos)
  const shopBundles = useMemo(() => 
    allBundles.filter(bundle => bundle.shopId === selectedShopId),
    [selectedShopId, allBundles]
  );

  // Items del shop seleccionado (a través de los bundles)
  const shopItems = useMemo(() => {
    const bundleIds = shopBundles.map(bundle => bundle.id);
    return allItems.filter(item => bundleIds.includes(item.bundleId));
  }, [shopBundles, allItems]);

  // Funciones helper para obtener entidades por ID
  const getShopById = useCallback((id: string) => {
    return allShops.find(shop => shop.id === id);
  }, [allShops]);

  const getBundleById = useCallback((id: string) => {
    return allBundles.find(bundle => bundle.id === id);
  }, [allBundles]);

  const getItemById = useCallback((id: string) => {
    return allItems.find(item => item.id === id);
  }, [allItems]);

  // Función para cambiar shop seleccionado
  const selectShop = useCallback((shopId: string) => {
    const shop = allShops.find(s => s.id === shopId);
    if (shop) {
      setSelectedShopId(shopId);
    }
  }, [allShops]);

  // Función para obtener el siguiente shop disponible
  const getNextShop = useCallback(() => {
    const currentIndex = allShops.findIndex(shop => shop.id === selectedShopId);
    const nextIndex = (currentIndex + 1) % allShops.length;
    return allShops[nextIndex];
  }, [allShops, selectedShopId]);

  // Función para obtener el shop anterior
  const getPreviousShop = useCallback(() => {
    const currentIndex = allShops.findIndex(shop => shop.id === selectedShopId);
    const previousIndex = currentIndex === 0 ? allShops.length - 1 : currentIndex - 1;
    return allShops[previousIndex];
  }, [allShops, selectedShopId]);

  return {
    // Estados
    selectedShopId,
    selectedShop,
    shopBundles,
    shopItems,
    
    // Funciones de selección
    setSelectedShopId,
    selectShop,
    getNextShop,
    getPreviousShop,
    
    // Funciones helper
    getShopById,
    getBundleById,
    getItemById,
    getShopWithBundles,
    getBundleWithContent,
    
    // Contadores
    totalShops: allShops.length,
    totalBundles: shopBundles.length,
    totalItems: shopItems.length,
    
    // Información adicional
    hasSelectedShop: !!selectedShop,
    isFirstShop: allShops.length > 0 && selectedShopId === allShops[0].id,
    isLastShop: allShops.length > 0 && selectedShopId === allShops[allShops.length - 1].id
  };
}; 