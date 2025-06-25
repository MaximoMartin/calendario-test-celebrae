import { useState, useCallback, useMemo } from 'react';
import { 
  checkItemAvailability, 
  validateCompleteBooking, 
  getAvailableSlotsForItem,
  getResourceUtilization,
  validateItemDependencies
} from '../utils/availabilityEngine';
import { mockBundles, mockBookings, mockResources, mockBusinessHours, mockBookingSettings } from '../mockData';
import type { 
  AvailabilityCheck, 
  AvailabilityResult, 
  BookingValidationResult,
  Bundle,
  ItemTimeSlot,
  AvailabilityConflict
} from '../types';

export interface UseAvailabilityResult {
  // Verificar disponibilidad de un item específico
  checkAvailability: (check: AvailabilityCheck) => AvailabilityResult;
  
  // Validar una reserva completa
  validateBooking: (
    bundleId: string,
    selectedItems: { itemId: string; timeSlotId: string; numberOfPeople: number; date: string }[]
  ) => BookingValidationResult;
  
  // Obtener slots disponibles para un item en una fecha
  getAvailableSlots: (itemId: string, date: string, bundleId: string) => {
    slot: ItemTimeSlot;
    isAvailable: boolean;
    conflicts?: AvailabilityConflict[];
  }[];
  
  // Utilización de recursos por negocio
  getResourceStats: (shopId: string, date: string) => {
    resourceId: string;
    name: string;
    utilization: number;
    conflicts: number;
  }[];
  
  // Validar dependencias entre items seleccionados
  validateDependencies: (
    selectedItems: { itemId: string; timeSlotId: string; date: string }[],
    bundleId: string
  ) => AvailabilityConflict[];
  
  // Estado de carga para operaciones asíncronas
  isLoading: boolean;
  
  // Caché de resultados para optimización
  clearCache: () => void;
}

interface CacheEntry {
  key: string;
  result: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useAvailability = (): UseAvailabilityResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  
  // Limpiar entradas expiradas del caché
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      for (const [key, entry] of newCache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  }, []);

  // Obtener datos desde caché o calcular
  const getCachedResult = useCallback(
    <T>(key: string, calculator: () => T): T => {
      cleanExpiredCache();
      
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result as T;
      }
      
      const result = calculator();
      setCache(prev => new Map(prev).set(key, {
        key,
        result,
        timestamp: Date.now()
      }));
      
      return result;
    },
    [cache, cleanExpiredCache]
  );

  // Datos mock memorizados
  const bundles = useMemo(() => mockBundles, []);
  const bookings = useMemo(() => mockBookings, []);
  const resources = useMemo(() => mockResources, []);
  const businessHours = useMemo(() => mockBusinessHours, []);
  const bookingSettings = useMemo(() => mockBookingSettings, []);

  // Función principal de verificación de disponibilidad
  const checkAvailability = useCallback(
    (check: AvailabilityCheck): AvailabilityResult => {
      const cacheKey = `availability-${JSON.stringify(check)}`;
      
      return getCachedResult(cacheKey, () => {
        // Encontrar el bundle que contiene el item
        const bundle = bundles.find(b => 
          b.items.some(item => item.id === check.itemId)
        );
        
        if (!bundle) {
          return {
            isAvailable: false,
            reason: 'Bundle no encontrado para este item',
            conflicts: [{
              type: 'TIME_CONFLICT',
              message: 'No se pudo encontrar el bundle asociado a este item'
            }]
          };
        }

        // Obtener recursos del shop del bundle
        const shopResources = resources.filter(r => r.shopId === bundle.shopId);
        
        return checkItemAvailability(
          check,
          bundle,
          bookings,
          shopResources,
          businessHours,
          bookingSettings
        );
      });
    },
    [bundles, bookings, resources, businessHours, bookingSettings, getCachedResult]
  );

  // Validación completa de reserva
  const validateBooking = useCallback(
    (
      bundleId: string,
      selectedItems: { itemId: string; timeSlotId: string; numberOfPeople: number; date: string }[]
    ): BookingValidationResult => {
      const cacheKey = `validation-${bundleId}-${JSON.stringify(selectedItems)}`;
      
      return getCachedResult(cacheKey, () => {
        const bundle = bundles.find(b => b.id === bundleId);
        if (!bundle) {
          return {
            isValid: false,
            conflicts: [{ type: 'TIME_CONFLICT', message: 'Bundle no encontrado' }],
            totalPrice: 0,
            timeline: { earliest: '', latest: '' }
          };
        }

        const shopResources = resources.filter(r => r.shopId === bundle.shopId);
        
        return validateCompleteBooking(
          bundleId,
          selectedItems,
          bundles,
          bookings,
          shopResources,
          businessHours,
          bookingSettings
        );
      });
    },
    [bundles, bookings, resources, businessHours, bookingSettings, getCachedResult]
  );

  // Obtener slots disponibles para un item
  const getAvailableSlots = useCallback(
    (itemId: string, date: string, bundleId: string) => {
      const cacheKey = `slots-${itemId}-${date}-${bundleId}`;
      
      return getCachedResult(cacheKey, () => {
        const bundle = bundles.find(b => b.id === bundleId);
        if (!bundle) return [];

        const shopResources = resources.filter(r => r.shopId === bundle.shopId);
        
        return getAvailableSlotsForItem(
          itemId,
          date,
          bundle,
          bookings,
          shopResources,
          businessHours,
          bookingSettings
        );
      });
    },
    [bundles, bookings, resources, businessHours, bookingSettings, getCachedResult]
  );

  // Estadísticas de utilización de recursos
  const getResourceStats = useCallback(
    (shopId: string, date: string) => {
      const cacheKey = `resources-${shopId}-${date}`;
      
      return getCachedResult(cacheKey, () => {
        const shopResources = resources.filter(r => r.shopId === shopId);
        
        return getResourceUtilization(
          shopId,
          date,
          shopResources,
          bookings
        );
      });
    },
    [resources, bookings, getCachedResult]
  );

  // Validar dependencias entre items
  const validateDependencies = useCallback(
    (
      selectedItems: { itemId: string; timeSlotId: string; date: string }[],
      bundleId: string
    ): AvailabilityConflict[] => {
      const cacheKey = `dependencies-${bundleId}-${JSON.stringify(selectedItems)}`;
      
      return getCachedResult(cacheKey, () => {
        const bundle = bundles.find(b => b.id === bundleId);
        if (!bundle) return [];

        return validateItemDependencies(selectedItems, bundle);
      });
    },
    [bundles, getCachedResult]
  );

  // Limpiar caché manualmente
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    checkAvailability,
    validateBooking,
    getAvailableSlots,
    getResourceStats,
    validateDependencies,
    isLoading,
    clearCache
  };
};

// Hook especializado para validación en tiempo real durante el proceso de booking
export const useRealtimeValidation = (
  bundleId: string,
  selectedItems: { itemId: string; timeSlotId: string; numberOfPeople: number; date: string }[]
) => {
  const { validateBooking, validateDependencies, checkAvailability } = useAvailability();
  
  // Validación completa en tiempo real
  const validation = useMemo(() => {
    if (!bundleId || selectedItems.length === 0) {
      return {
        isValid: true,
        conflicts: [],
        totalPrice: 0,
        timeline: { earliest: '', latest: '' }
      };
    }
    
    return validateBooking(bundleId, selectedItems);
  }, [bundleId, selectedItems, validateBooking]);

  // Dependencias específicas
  const dependencyConflicts = useMemo(() => {
    if (!bundleId || selectedItems.length === 0) return [];
    
    return validateDependencies(
      selectedItems.map(item => ({
        itemId: item.itemId,
        timeSlotId: item.timeSlotId,
        date: item.date
      })),
      bundleId
    );
  }, [bundleId, selectedItems, validateDependencies]);

  // Validación item por item
  const itemValidations = useMemo(() => {
    return selectedItems.map(item => {
      const check: AvailabilityCheck = {
        itemId: item.itemId,
        date: item.date,
        timeSlotId: item.timeSlotId,
        numberOfPeople: item.numberOfPeople
      };
      
      return {
        ...item,
        validation: checkAvailability(check)
      };
    });
  }, [selectedItems, checkAvailability]);

  return {
    validation,
    dependencyConflicts,
    itemValidations,
    isValid: validation.isValid && dependencyConflicts.length === 0,
    allConflicts: [...validation.conflicts, ...dependencyConflicts]
  };
};

// Hook para obtener sugerencias cuando hay conflictos
export const useAvailabilitySuggestions = (
  bundleId: string,
  conflictedItem: { itemId: string; date: string; numberOfPeople: number }
) => {
  const { getAvailableSlots } = useAvailability();
  
  const suggestions = useMemo(() => {
    if (!bundleId || !conflictedItem.itemId) return [];
    
    const availableSlots = getAvailableSlots(
      conflictedItem.itemId,
      conflictedItem.date,
      bundleId
    );
    
    return availableSlots
      .filter(slot => slot.isAvailable)
      .slice(0, 3) // Top 3 sugerencias
      .map(slot => ({
        timeSlot: slot.slot,
        reason: slot.conflicts?.length === 0 ? 'Disponible' : 'Disponibilidad limitada'
      }));
  }, [bundleId, conflictedItem, getAvailableSlots]);

  return suggestions;
}; 