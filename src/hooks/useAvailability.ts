// ========================================
// HOOK PERSONALIZADO PARA DISPONIBILIDAD
// ========================================

import { useState, useCallback, useMemo } from 'react';
import { AvailabilityEngine } from '../utils/availabilityEngine';
import type {
  Shop, Bundle, Booking, AvailabilityRequest, AvailabilityResult,
  BundleItem, ItemTimeSlot
} from '../types/newModel';

interface UseAvailabilityProps {
  shop: Shop;
  bundles: Bundle[];
  bookings: Booking[];
}

interface AvailableSlot {
  item: BundleItem;
  timeSlot: ItemTimeSlot;
  availableCapacity: number;
  isRecommended: boolean;
  conflicts: string[];
}

export const useAvailability = ({ shop, bundles, bookings }: UseAvailabilityProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<AvailabilityResult | null>(null);

  // Crear instancia del motor de disponibilidad
  const engine = useMemo(() => {
    return new AvailabilityEngine(shop, bundles, bookings);
  }, [shop, bundles, bookings]);

  /**
   * Verificar disponibilidad completa de una solicitud
   */
  const checkAvailability = useCallback(async (request: AvailabilityRequest): Promise<AvailabilityResult> => {
    setIsChecking(true);
    try {
      const result = await engine.checkAvailability(request);
      setLastResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, [engine]);

  /**
   * Obtener slots disponibles para un bundle en una fecha específica
   */
  const getAvailableSlots = useCallback(async (
    bundleId: string, 
    date: string,
    numberOfPeople: number = 1
  ): Promise<AvailableSlot[]> => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return [];

    const availableSlots: AvailableSlot[] = [];

    for (const item of bundle.items) {
      for (const timeSlot of item.timeSlots) {
        if (!timeSlot.isActive) continue;

        // Verificar disponibilidad de este item específico
        const request: AvailabilityRequest = {
          bundleId,
          date,
          itemSelections: [{
            itemId: item.id,
            timeSlotId: timeSlot.id,
            numberOfPeople
          }],
          extraSelections: []
        };

        const result = await engine.checkAvailability(request);
        
        // Calcular capacidad disponible
        const existingBookings = bookings
          .filter(b => b.date === date && b.status !== 'CANCELLED')
          .flatMap(b => b.itemBookings)
          .filter(ib => ib.itemId === item.id && ib.timeSlotId === timeSlot.id);
        
        const usedCapacity = existingBookings.reduce((sum, ib) => sum + ib.numberOfPeople, 0);
        const availableCapacity = Math.min(
          item.maxCapacity - usedCapacity,
          timeSlot.maxBookings - existingBookings.length
        );

        if (availableCapacity >= numberOfPeople && result.isAvailable) {
          availableSlots.push({
            item,
            timeSlot,
            availableCapacity,
            isRecommended: timeSlot.metadata?.isPopular || false,
            conflicts: result.conflicts.map(c => c.message)
          });
        }
      }
    }

    // Ordenar por recomendación y horario
    return availableSlots.sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) {
        return a.isRecommended ? -1 : 1;
      }
      return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
    });
  }, [bundles, bookings, engine]);

  /**
   * Verificar si un recurso específico está disponible
   */
  const checkResourceAvailability = useCallback((
    resourceId: string,
    date: string,
    startTime: string,
    endTime: string,
    requiredQuantity: number = 1
  ): boolean => {
    const resource = shop.resources.find(r => r.id === resourceId);
    if (!resource || !resource.isActive) return false;

    // Buscar conflictos con reservas existentes
    const existingAllocations = bookings
      .filter(b => b.date === date && b.status !== 'CANCELLED')
      .flatMap(b => b.itemBookings)
      .filter(ib => ib.status !== 'CANCELLED')
      .flatMap(ib => ib.resourceAllocations)
      .filter(ra => ra.resourceId === resourceId);

    for (const allocation of existingAllocations) {
      // Verificar solapamiento temporal
      const allocStart = allocation.startTime;
      const allocEnd = allocation.endTime;
      
      const hasOverlap = startTime < allocEnd && endTime > allocStart;
      
      if (hasOverlap) {
        // Verificar si hay suficiente capacidad
        const usedQuantity = existingAllocations
          .filter(a => a.startTime < allocEnd && a.endTime > allocStart)
          .reduce((sum, a) => sum + a.quantity, 0);
        
        if (usedQuantity + requiredQuantity > resource.capacity) {
          return false;
        }
      }
    }

    return true;
  }, [shop.resources, bookings]);

  /**
   * Obtener estadísticas de ocupación para una fecha
   */
  const getOccupancyStats = useCallback((date: string) => {
    const dayBookings = bookings.filter(b => 
      b.date === date && 
      b.status !== 'CANCELLED'
    );

    const itemStats = new Map<string, {
      itemName: string;
      totalSlots: number;
      occupiedSlots: number;
      occupancyRate: number;
    }>();

    // Recorrer todos los bundles para obtener estadísticas
    for (const bundle of bundles) {
      for (const item of bundle.items) {
        const totalSlots = item.timeSlots.filter(ts => ts.isActive).length;
        const occupiedSlots = dayBookings
          .flatMap(b => b.itemBookings)
          .filter(ib => ib.itemId === item.id).length;

        itemStats.set(item.id, {
          itemName: item.name,
          totalSlots,
          occupiedSlots,
          occupancyRate: totalSlots > 0 ? occupiedSlots / totalSlots : 0
        });
      }
    }

    const resourceStats = new Map<string, {
      resourceName: string;
      totalCapacity: number;
      usedCapacity: number;
      occupancyRate: number;
    }>();

    // Estadísticas de recursos
    for (const resource of shop.resources) {
      if (!resource.isActive) continue;

      const allocations = dayBookings
        .flatMap(b => b.itemBookings)
        .flatMap(ib => ib.resourceAllocations)
        .filter(ra => ra.resourceId === resource.id);

      const maxUsedCapacity = Math.max(
        0,
        ...allocations.map(a => a.quantity)
      );

      resourceStats.set(resource.id, {
        resourceName: resource.name,
        totalCapacity: resource.capacity,
        usedCapacity: maxUsedCapacity,
        occupancyRate: resource.capacity > 0 ? maxUsedCapacity / resource.capacity : 0
      });
    }

    return {
      totalBookings: dayBookings.length,
      items: Object.fromEntries(itemStats),
      resources: Object.fromEntries(resourceStats),
      overallOccupancy: dayBookings.length > 0 ? 
        Array.from(itemStats.values()).reduce((sum, stat) => sum + stat.occupancyRate, 0) / itemStats.size : 0
    };
  }, [bundles, shop.resources, bookings]);

  /**
   * Validar si se puede crear una reserva rápida
   */
  const canQuickBook = useCallback(async (
    bundleId: string,
    date: string,
    numberOfPeople: number
  ): Promise<{
    canBook: boolean;
    suggestedItems: Array<{
      itemId: string;
      timeSlotId: string;
      startTime: string;
      endTime: string;
    }>;
    totalPrice: number;
    conflicts: string[];
  }> => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) {
      return {
        canBook: false,
        suggestedItems: [],
        totalPrice: 0,
        conflicts: ['Bundle no encontrado']
      };
    }

    // Buscar la primera combinación disponible
    const suggestions: Array<{
      itemId: string;
      timeSlotId: string;
      startTime: string;
      endTime: string;
    }> = [];

    for (const item of bundle.items.filter(i => i.isRequired)) {
      let foundSlot = false;
      
      for (const timeSlot of item.timeSlots.filter(ts => ts.isActive)) {
        const request: AvailabilityRequest = {
          bundleId,
          date,
          itemSelections: [{
            itemId: item.id,
            timeSlotId: timeSlot.id,
            numberOfPeople
          }],
          extraSelections: []
        };

        const result = await engine.checkAvailability(request);
        
        if (result.isAvailable) {
          suggestions.push({
            itemId: item.id,
            timeSlotId: timeSlot.id,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
          });
          foundSlot = true;
          break;
        }
      }

      if (!foundSlot) {
        return {
          canBook: false,
          suggestedItems: [],
          totalPrice: 0,
          conflicts: [`No hay horarios disponibles para ${item.name}`]
        };
      }
    }

    // Verificar la combinación completa
    const finalRequest: AvailabilityRequest = {
      bundleId,
      date,
      itemSelections: suggestions.map(s => ({
        itemId: s.itemId,
        timeSlotId: s.timeSlotId,
        numberOfPeople
      })),
      extraSelections: []
    };

    const finalResult = await engine.checkAvailability(finalRequest);

    return {
      canBook: finalResult.isAvailable,
      suggestedItems: suggestions,
      totalPrice: finalResult.pricing.totalPrice,
      conflicts: finalResult.conflicts.map(c => c.message)
    };
  }, [bundles, engine]);

  return {
    // Estados
    isChecking,
    lastResult,
    
    // Métodos principales
    checkAvailability,
    getAvailableSlots,
    checkResourceAvailability,
    getOccupancyStats,
    canQuickBook,
    
    // Utilidades
    engine
  };
}; 