// Hook específico para manejo de shops
// Extraído de useEntitiesState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { mockShops } from '../data';
import type { Shop, BusinessHours } from '../types';
import type { CreateShopData } from './types';

export const useShopManagement = () => {
  // Estados para shops dinámicos
  const [dynamicShops, setDynamicShops] = useState<Shop[]>([]);
  const [updatedBusinessHours, setUpdatedBusinessHours] = useState<Record<string, BusinessHours>>({});

  // Combinar shops estáticos con dinámicos
  const allShops = useMemo(() => {
    // Obtener IDs de shops dinámicos (que pueden ser versiones editadas de shops mock)
    const dynamicShopIds = new Set(dynamicShops.map(shop => shop.id));
    
    // Filtrar shops estáticos: solo incluir los que NO tienen versión dinámica
    const staticShopsWithoutDuplicates = mockShops
      .filter(shop => !dynamicShopIds.has(shop.id))
      .map(shop => ({
        ...shop,
        businessHours: updatedBusinessHours[shop.id] || shop.businessHours
      }));
    
    // Combinar shops estáticos filtrados + todos los dinámicos
    return [...staticShopsWithoutDuplicates, ...dynamicShops];
  }, [mockShops, dynamicShops, updatedBusinessHours]);

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Crear nuevo Shop
  const createShop = useCallback((data: CreateShopData, userId: string = "87IZYWdezwJQsILiU57z") => {
    const defaultBusinessHours: BusinessHours = {
      monday: { openRanges: [{ from: '09:00', to: '17:00' }] },
      tuesday: { openRanges: [{ from: '09:00', to: '17:00' }] },
      wednesday: { openRanges: [{ from: '09:00', to: '17:00' }] },
      thursday: { openRanges: [{ from: '09:00', to: '17:00' }] },
      friday: { openRanges: [{ from: '09:00', to: '17:00' }] },
      saturday: { openRanges: [{ from: '10:00', to: '14:00' }] },
      sunday: { openRanges: [] }
    };

    const newShop: Shop = {
      id: generateId('shop'),
      name: data.name,
      address: data.address,
      description: data.description,
      phone: data.phone,
      email: data.email,
      category: data.category,
      subCategory: data.subCategory,
      shopStatus: 'ENABLED',
      userId,
      businessHours: data.businessHours || defaultBusinessHours,
      maxCapacity: data.maxCapacity || 20,
      advanceBookingDays: data.advanceBookingDays || 30,
      cancellationPolicy: data.cancellationPolicy || 'Cancelación gratuita hasta 24 horas antes',
      refundPolicy: data.refundPolicy || 'Reembolso total hasta 24 horas antes',
      allowInstantBooking: data.allowInstantBooking !== false,
      requiresApproval: data.requiresApproval || false,
      status: 'active',
      deletedAt: null
    };
    
    setDynamicShops(prev => [...prev, newShop]);
    console.log('🏪 Nuevo shop creado:', newShop.name, '(ID:', newShop.id, ')');
    return newShop;
  }, [generateId]);

  // Actualizar shop completo
  const updateShop = useCallback((shopId: string, data: Partial<CreateShopData>) => {
    setDynamicShops(prev => {
      const exists = prev.some(shop => shop.id === shopId);
      if (exists) {
        // Actualizar shop dinámico existente
        return prev.map(shop => 
          shop.id === shopId 
            ? { 
                ...shop, 
                ...data,
                updatedAt: new Date().toISOString() 
              }
            : shop
        );
      } else {
        // Buscar el shop original (mock)
        const original = mockShops.find(shop => shop.id === shopId);
        if (!original) return prev;
        // Crear una copia dinámica con los cambios
        const updatedShop = {
          ...original,
          ...data,
          updatedAt: new Date().toISOString()
        };
        return [...prev, updatedShop];
      }
    });
    console.log('🏪 Shop actualizado:', shopId, data);
  }, []);

  // Actualizar horarios de negocio
  const updateShopBusinessHours = useCallback((shopId: string, businessHours: BusinessHours) => {
    // Actualizar en shops dinámicos
    setDynamicShops(prev => prev.map(shop => 
      shop.id === shopId 
        ? { ...shop, businessHours, updatedAt: new Date().toISOString() }
        : shop
    ));
    
    // Actualizar en shops estáticos (mockShops)
    setUpdatedBusinessHours(prev => ({
      ...prev,
      [shopId]: businessHours
    }));
    
    console.log('🕒 Horarios actualizados para shop:', shopId, businessHours);
  }, []);

  // Obtener shop por ID
  const getShopById = useCallback((shopId: string) => {
    return allShops.find(shop => shop.id === shopId);
  }, [allShops]);

  // Obtener shops por categoría
  const getShopsByCategory = useCallback((category: string) => {
    return allShops.filter(shop => shop.category === category);
  }, [allShops]);

  // Obtener shops activos
  const getActiveShops = useCallback(() => {
    return allShops.filter(shop => shop.shopStatus === 'ENABLED');
  }, [allShops]);

  // Eliminar shop (soft delete)
  const deleteShop = useCallback((shopId: string) => {
    setDynamicShops(prev => prev.map(shop => 
      shop.id === shopId 
        ? { 
            ...shop, 
            shopStatus: 'DISABLED' as const,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : shop
    ));
    console.log('🗑️ Shop eliminado:', shopId);
  }, []);

  return {
    // Estados
    allShops,
    dynamicShops,
    
    // Funciones principales
    createShop,
    updateShop,
    updateShopBusinessHours,
    deleteShop,
    
    // Funciones de consulta
    getShopById,
    getShopsByCategory,
    getActiveShops,
    
    // Contadores
    totalShops: allShops.length,
    dynamicShopsCount: dynamicShops.length,
    activeShopsCount: getActiveShops().length
  };
}; 