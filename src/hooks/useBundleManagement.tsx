// Hook específico para manejo de bundles
// Extraído de useEntitiesState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { mockBundles } from '../data';
import type { Bundle, Item, Extra } from '../types';
import type { CreateBundleData, CreateItemData, CreateExtraData } from './types';

export const useBundleManagement = () => {
  // Estados para entidades dinámicas
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([]);

  // Combinar bundles estáticos con dinámicos
  const allBundles = useMemo(() => {
    return [...mockBundles, ...dynamicBundles];
  }, [mockBundles, dynamicBundles]);

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Crear nuevo Bundle
  const createBundle = useCallback((data: CreateBundleData, shopId: string) => {
    const newBundle: Bundle = {
      id: generateId('bundle'),
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription || '',
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
      imageUrls: data.imageUrls || [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
      ],
      tags: data.tags,
      isActive: true,
      isFeatured: data.isFeatured || false,
      order: data.order || 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      deletedAt: null
    };
    setDynamicBundles(prev => [...prev, newBundle]);
    console.log('📦 Nuevo bundle creado:', newBundle.name, '(ID:', newBundle.id, ')');
    return newBundle;
  }, [generateId]);

  // Crear nuevo Item embebido en un bundle
  const createItem = useCallback((data: CreateItemData, bundleId: string) => {
    setDynamicBundles(prev => prev.map(bundle => {
      if (bundle.id !== bundleId) return bundle;
      const newItem: Item = {
        id: generateId('item'),
        title: data.title,
        description: data.description,
        price: data.price,
        isForAdult: data.isForAdult || false,
        bundleId,
        shopId: bundle.shopId,
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
      return {
        ...bundle,
        items: [...bundle.items, newItem],
        updatedAt: new Date().toISOString()
      };
    }));
    // Retornar el item creado (opcional, para consistencia)
    const updatedBundle = dynamicBundles.find(b => b.id === bundleId);
    return updatedBundle ? updatedBundle.items[updatedBundle.items.length - 1] : undefined;
  }, [generateId, dynamicBundles]);

  // Crear nuevo Extra embebido en un bundle
  const createExtra = useCallback((data: CreateExtraData, bundleId: string) => {
    setDynamicBundles(prev => prev.map(bundle => {
      if (bundle.id !== bundleId) return bundle;
      const newExtra: Extra = {
        id: generateId('extra'),
        title: data.title,
        description: data.description,
        price: data.price,
        isForAdult: data.isForAdult || false,
        bundleId,
        shopId: bundle.shopId,
        isPerGroup: data.isPerGroup,
        requiredItemId: data.requiredItemId,
        quantity: data.defaultQuantity || 0,
        maxQuantity: data.maxQuantity || 5,
        isRequired: data.isRequired || false,
        isActive: data.isActive !== false,
        order: data.order || 999,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      };
      return {
        ...bundle,
        extras: [...bundle.extras, newExtra],
        updatedAt: new Date().toISOString()
      };
    }));
    // Retornar el extra creado (opcional, para consistencia)
    const updatedBundle = dynamicBundles.find(b => b.id === bundleId);
    return updatedBundle ? updatedBundle.extras[updatedBundle.extras.length - 1] : undefined;
  }, [generateId, dynamicBundles]);

  // Contadores de items y extras dinámicos
  const dynamicItemsCount = useMemo(() => {
    return dynamicBundles.reduce((acc, bundle) => acc + (bundle.items?.length || 0), 0);
  }, [dynamicBundles]);
  const dynamicExtrasCount = useMemo(() => {
    return dynamicBundles.reduce((acc, bundle) => acc + (bundle.extras?.length || 0), 0);
  }, [dynamicBundles]);

  // Actualizar bundle
  const updateBundle = useCallback((bundleId: string, data: Partial<CreateBundleData>) => {
    setDynamicBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { 
            ...bundle, 
            ...data,
            updatedAt: new Date().toISOString() 
          }
        : bundle
    ));
    console.log('📦 Bundle actualizado:', bundleId, data);
  }, []);

  // Eliminar bundle (soft delete)
  const deleteBundle = useCallback((bundleId: string) => {
    setDynamicBundles(prev => prev.map(bundle => 
      bundle.id === bundleId 
        ? { 
            ...bundle, 
            isActive: false,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : bundle
    ));
    console.log('🗑️ Bundle eliminado:', bundleId);
  }, []);

  // Obtener bundle por ID
  const getBundleById = useCallback((bundleId: string) => {
    return allBundles.find(bundle => bundle.id === bundleId);
  }, [allBundles]);

  // Obtener bundles por shop
  const getBundlesByShop = useCallback((shopId: string) => {
    return allBundles.filter(bundle => bundle.shopId === shopId);
  }, [allBundles]);

  // Obtener bundles activos
  const getActiveBundles = useCallback(() => {
    return allBundles.filter(bundle => bundle.isActive);
  }, [allBundles]);

  // Obtener bundles destacados
  const getFeaturedBundles = useCallback(() => {
    return allBundles.filter(bundle => bundle.isFeatured);
  }, [allBundles]);

  // Obtener bundle con contenido completo
  const getBundleWithContent = useCallback((bundleId: string) => {
    const bundle = allBundles.find(b => b.id === bundleId);
    if (!bundle) return null;
    return bundle;
  }, [allBundles]);

  return {
    // Estados
    allBundles,
    dynamicBundles,
    
    // Funciones principales
    createBundle,
    createItem,
    createExtra,
    updateBundle,
    deleteBundle,
    
    // Funciones de consulta
    getBundleById,
    getBundlesByShop,
    getActiveBundles,
    getFeaturedBundles,
    getBundleWithContent,
    
    // Contadores
    totalBundles: allBundles.length,
    dynamicBundlesCount: dynamicBundles.length,
    activeBundlesCount: getActiveBundles().length,
    featuredBundlesCount: getFeaturedBundles().length,
    dynamicItemsCount,
    dynamicExtrasCount
  };
}; 