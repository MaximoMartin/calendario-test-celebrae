// Hook específico para manejo de extras
// Extraído de useEntitiesState.tsx para mejor organización

import { useState, useMemo, useCallback } from 'react';
import { mockExtras } from '../data';
import type { Extra, Bundle } from '../types';
import type { CreateExtraData } from './types';

export const useExtraManagement = () => {
  // Estados para entidades dinámicas
  const [dynamicExtras, setDynamicExtras] = useState<Extra[]>([...mockExtras]);
  const [dynamicBundles, setDynamicBundles] = useState<Bundle[]>([]);

  // Combinar extras estáticos con dinámicos
  const allExtras = useMemo(() => {
    return [...dynamicExtras];
  }, [dynamicExtras]);

  // Función para generar IDs únicos
  const generateId = useCallback((prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Crear nuevo Extra
  const createExtra = useCallback((data: CreateExtraData, bundleId: string) => {
    // Buscar shopId del bundle
    const bundle = dynamicBundles.find(b => b.id === bundleId);
    const shopId = bundle ? bundle.shopId : '';
    
    const newExtra: Extra = {
      id: generateId('extra'),
      title: data.title,
      description: data.description,
      price: data.price,
      isForAdult: data.isForAdult || false,
      bundleId,
      shopId,
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
    
    setDynamicExtras(prev => [...prev, newExtra]);
    
    // Actualizar bundle con el nuevo extra
    setDynamicBundles(prev => prev.map(bundle =>
      bundle.id === bundleId
        ? { 
            ...bundle, 
            extraIds: [...bundle.extraIds, newExtra.id], 
            extras: [...(bundle.extras || []), newExtra] 
          }
        : bundle
    ));
    
    console.log('➕ Nuevo extra creado:', newExtra.title, '(ID:', newExtra.id, ')');
    return newExtra;
  }, [generateId, dynamicBundles]);

  // Actualizar extra
  const updateExtra = useCallback((extraId: string, data: Partial<CreateExtraData>) => {
    setDynamicExtras(prev => prev.map(extra => 
      extra.id === extraId 
        ? { 
            ...extra, 
            ...data,
            updatedAt: new Date().toISOString() 
          }
        : extra
    ));
    console.log('➕ Extra actualizado:', extraId, data);
  }, []);

  // Eliminar extra (soft delete)
  const deleteExtra = useCallback((extraId: string) => {
    setDynamicExtras(prev => prev.map(extra => 
      extra.id === extraId 
        ? { 
            ...extra, 
            isActive: false,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : extra
    ));
    console.log('🗑️ Extra eliminado:', extraId);
  }, []);

  // Obtener extra por ID
  const getExtraById = useCallback((extraId: string) => {
    return allExtras.find(extra => extra.id === extraId);
  }, [allExtras]);

  // Obtener extras por bundle
  const getExtrasByBundle = useCallback((bundleId: string) => {
    return allExtras.filter(extra => extra.bundleId === bundleId);
  }, [allExtras]);

  // Obtener extras por shop
  const getExtrasByShop = useCallback((shopId: string) => {
    return allExtras.filter(extra => extra.shopId === shopId);
  }, [allExtras]);

  // Obtener extras activos
  const getActiveExtras = useCallback(() => {
    return allExtras.filter(extra => extra.isActive);
  }, [allExtras]);

  // Obtener extras requeridos
  const getRequiredExtras = useCallback(() => {
    return allExtras.filter(extra => extra.isRequired);
  }, [allExtras]);

  // Obtener extras opcionales
  const getOptionalExtras = useCallback(() => {
    return allExtras.filter(extra => !extra.isRequired);
  }, [allExtras]);

  // Obtener extras para adultos
  const getAdultExtras = useCallback(() => {
    return allExtras.filter(extra => extra.isForAdult);
  }, [allExtras]);

  // Obtener extras por grupo
  const getGroupExtras = useCallback(() => {
    return allExtras.filter(extra => extra.isPerGroup);
  }, [allExtras]);

  // Obtener extras por rango de precio
  const getExtrasByPriceRange = useCallback((minPrice: number, maxPrice: number) => {
    return allExtras.filter(extra => extra.price >= minPrice && extra.price <= maxPrice);
  }, [allExtras]);

  // Obtener extras que requieren un item específico
  const getExtrasByRequiredItem = useCallback((itemId: string) => {
    return allExtras.filter(extra => extra.requiredItemId === itemId);
  }, [allExtras]);

  return {
    // Estados
    allExtras,
    dynamicExtras,
    
    // Funciones principales
    createExtra,
    updateExtra,
    deleteExtra,
    
    // Funciones de consulta
    getExtraById,
    getExtrasByBundle,
    getExtrasByShop,
    getActiveExtras,
    getRequiredExtras,
    getOptionalExtras,
    getAdultExtras,
    getGroupExtras,
    getExtrasByPriceRange,
    getExtrasByRequiredItem,
    
    // Contadores
    totalExtras: allExtras.length,
    dynamicExtrasCount: dynamicExtras.length,
    activeExtrasCount: getActiveExtras().length,
    requiredExtrasCount: getRequiredExtras().length,
    optionalExtrasCount: getOptionalExtras().length,
    adultExtrasCount: getAdultExtras().length,
    groupExtrasCount: getGroupExtras().length
  };
}; 