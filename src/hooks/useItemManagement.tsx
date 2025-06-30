// Hook específico para manejo de items
// Extraído de useEntitiesState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { mockItems } from '../data';
import type { Item, Bundle } from '../types';
import type { CreateItemData } from './types';

export const useItemManagement = () => {
  // Estados para entidades dinámicas
  const [dynamicItems, setDynamicItems] = useState<Item[]>([...mockItems]);
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([]);

  // Combinar items estáticos con dinámicos
  const allItems = useMemo(() => {
    return [...dynamicItems];
  }, [dynamicItems]);

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

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
      isForAdult: data.isForAdult || false,
      bundleId,
      shopId,
      isPerGroup: data.isPerGroup,
      bookingConfig: {
        maxCapacity: data.maxCapacity,
        duration: data.duration,
        requiresConfirmation: data.requiresConfirmation || false,
        advanceBookingDays: data.advanceBookingDays || 30,
        groupCapacity: data.groupCapacity || (data.isPerGroup ? data.maxCapacity : undefined),
        isExclusive: data.isExclusive || data.isPerGroup
      },
      timeSlots: data.timeSlots,
      isActive: true,
      order: data.order || 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    
    setDynamicItems(prev => [...prev, newItem]);
    
    // Actualizar bundle con el nuevo item
    setDynamicBundles(prev => prev.map(bundle =>
      bundle.id === bundleId
        ? { 
            ...bundle, 
            itemIds: [...bundle.itemIds, newItem.id], 
            items: [...(bundle.items || []), newItem] 
          }
        : bundle
    ));
    
    console.log('🎯 Nuevo item creado:', newItem.title, '(ID:', newItem.id, ')');
    return newItem;
  }, [generateId, dynamicBundles]);

  // Actualizar item
  const updateItem = useCallback((itemId: string, data: Partial<CreateItemData>) => {
    setDynamicItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            ...data,
            updatedAt: new Date().toISOString() 
          }
        : item
    ));
    console.log('🎯 Item actualizado:', itemId, data);
  }, []);

  // Eliminar item (soft delete)
  const deleteItem = useCallback((itemId: string) => {
    setDynamicItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isActive: false,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : item
    ));
    console.log('🗑️ Item eliminado:', itemId);
  }, []);

  // Obtener item por ID
  const getItemById = useCallback((itemId: string) => {
    return allItems.find(item => item.id === itemId);
  }, [allItems]);

  // Obtener items por bundle
  const getItemsByBundle = useCallback((bundleId: string) => {
    return allItems.filter(item => item.bundleId === bundleId);
  }, [allItems]);

  // Obtener items por shop
  const getItemsByShop = useCallback((shopId: string) => {
    return allItems.filter(item => item.shopId === shopId);
  }, [allItems]);

  // Obtener items activos
  const getActiveItems = useCallback(() => {
    return allItems.filter(item => item.isActive);
  }, [allItems]);

  // Obtener items por tipo de horario
  const getItemsByScheduleType = useCallback((scheduleType: 'FIXED' | 'FLEXIBLE' | 'CUSTOM' | 'CONTINUOUS') => {
    return allItems.filter(item => item.timeSlots?.scheduleType === scheduleType);
  }, [allItems]);

  // Obtener items por rango de precio
  const getItemsByPriceRange = useCallback((minPrice: number, maxPrice: number) => {
    return allItems.filter(item => item.price >= minPrice && item.price <= maxPrice);
  }, [allItems]);

  // Obtener items para adultos
  const getAdultItems = useCallback(() => {
    return allItems.filter(item => item.isForAdult);
  }, [allItems]);

  // Obtener items por grupo
  const getGroupItems = useCallback(() => {
    return allItems.filter(item => item.isPerGroup);
  }, [allItems]);

  return {
    // Estados
    allItems,
    dynamicItems,
    
    // Funciones principales
    createItem,
    updateItem,
    deleteItem,
    
    // Funciones de consulta
    getItemById,
    getItemsByBundle,
    getItemsByShop,
    getActiveItems,
    getItemsByScheduleType,
    getItemsByPriceRange,
    getAdultItems,
    getGroupItems,
    
    // Contadores
    totalItems: allItems.length,
    dynamicItemsCount: dynamicItems.length,
    activeItemsCount: getActiveItems().length,
    adultItemsCount: getAdultItems().length,
    groupItemsCount: getGroupItems().length
  };
}; 