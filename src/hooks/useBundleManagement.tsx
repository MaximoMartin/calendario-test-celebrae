// Hook específico para manejo de bundles
// Extraído de useEntitiesState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { mockBundles, mockItems, mockExtras } from '../data';
import type { Bundle, Item, Extra } from '../types';
import type { CreateBundleData } from './types';

export const useBundleManagement = () => {
  // Estados para entidades dinámicas
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([]);
  const [dynamicItems] = useState<Item[]>([...mockItems]);
  const [dynamicExtras] = useState<Extra[]>([...mockExtras]);

  // Migrar datos mock a la estructura esperada
  const migratedBundles = useMemo(() => {
    return mockBundles.map(bundle => {
      const items = dynamicItems.filter(item => item.bundleId === bundle.id);
      const extras = dynamicExtras.filter(extra => extra.bundleId === bundle.id);
      return {
        ...bundle,
        items: items || [],
        extras: extras || []
      };
    });
  }, [dynamicItems, dynamicExtras]);

  // Combinar bundles estáticos con dinámicos
  const allBundles = useMemo(() => {
    return [...migratedBundles, ...dynamicBundles];
  }, [migratedBundles, dynamicBundles]);

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
      itemIds: [],
      extraIds: [],
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

    return {
      ...bundle,
      items: dynamicItems.filter(item => item.bundleId === bundleId),
      extras: dynamicExtras.filter(extra => extra.bundleId === bundleId)
    };
  }, [allBundles, dynamicItems, dynamicExtras]);

  return {
    // Estados
    allBundles,
    dynamicBundles,
    
    // Funciones principales
    createBundle,
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
    featuredBundlesCount: getFeaturedBundles().length
  };
}; 