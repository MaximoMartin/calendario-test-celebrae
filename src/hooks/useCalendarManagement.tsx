// Hook específico para manejo del calendario
// Extraído de useShopState.tsx para mejor organización

import { useMemo, useCallback } from 'react';
import { useReservations } from '../features/reservations/mockData';
import { useEntitiesState } from './useEntitiesState';
import type { ReservaItem } from '../types';

// Tipo simplificado para el resource del evento de calendario
interface CalendarResource {
  id: string;
  title: string;
  color?: string;
  extendedProps?: {
    shopId?: string;
    bundleId?: string;
    itemId?: string;
    type?: 'shop' | 'bundle' | 'item';
  };
}

export const useCalendarManagement = (selectedShopId: string) => {
  const { allShops, allBundles, allItems } = useEntitiesState();
  const { reservasItems } = useReservations();

  // Reservas del shop seleccionado (sistema moderno)
  const shopReservations = useMemo(() => 
    reservasItems.filter((reserva: ReservaItem) => reserva.shopId === selectedShopId),
    [selectedShopId, reservasItems]
  );

  // Función para mapear estados de ReservaItem a estados compatibles
  const mapReservaStatusToBookingStatus = useCallback((status: ReservaItem['status']): any => {
    switch (status) {
      case 'PENDING': return 'PENDING';
      case 'CONFIRMED': return 'CONFIRMED';
      case 'CANCELLED': return 'CANCELLED';
      case 'COMPLETED': return 'COMPLETED';
      case 'NO_SHOW': return 'NO_SHOW';
      case 'EXPIRED': return 'CANCELLED'; // Los expirados se consideran cancelados
      case 'MODIFIED': return 'CONFIRMED'; // Los modificados mantienen estado confirmado
      default: return 'PENDING';
    }
  }, []);

  // Convertir reservas modernas a eventos de calendario
  const convertReservationsToCalendarEvents = useMemo(() => {
    return (reservations: ReservaItem[]): any[] => {
      return reservations.map(reserva => {
        const bundle = allBundles.find(b => b.id === reserva.bundleId);
        const item = allItems.find(i => i.id === reserva.itemId);
        
        const startDateTime = new Date(`${reserva.date}T${reserva.timeSlot.startTime}:00`);
        const endDateTime = new Date(`${reserva.date}T${reserva.timeSlot.endTime}:00`);

        // Crear título del evento
        const bundleName = bundle?.name || 'Bundle desconocido';
        const itemName = item?.title || 'Item desconocido';
        const customerName = reserva.customerInfo?.name || 'Cliente';
        
        return {
          id: reserva.id,
          title: `${bundleName} - ${itemName} (${customerName})`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            // Adaptar ReservaItem al formato legacy para compatibilidad
            id: reserva.id,
            kitId: reserva.bundleId, // Bundle como "kit" legacy
            kitName: bundleName,
            shopId: reserva.shopId,
            customerName: customerName,
            customerEmail: reserva.customerInfo?.email || '',
            customerPhone: reserva.customerInfo?.phone || '',
            date: reserva.date,
            timeSlot: reserva.timeSlot.startTime,
            numberOfPeople: reserva.numberOfPeople,
            status: mapReservaStatusToBookingStatus(reserva.status),
            isManual: reserva.createdBy === 'SELLER',
            createdAt: reserva.createdAt,
            notes: reserva.notes,
            // Datos adicionales del sistema moderno para compatibilidad
            modernReservation: reserva,
            bundleId: reserva.bundleId,
            itemId: reserva.itemId,
            itemName: itemName,
          },
        };
      });
    };
  }, [allBundles, allItems, mapReservaStatusToBookingStatus]);

  // Eventos de calendario del shop seleccionado
  const calendarEvents = useMemo(() => 
    convertReservationsToCalendarEvents(shopReservations),
    [convertReservationsToCalendarEvents, shopReservations]
  );

  // Crear recursos para el calendario basados en shops, bundles e items
  const resources = useMemo(() => {
    const shopResources: CalendarResource[] = allShops.map(shop => ({
      id: shop.id,
      title: shop.name,
      color: '#3B82F6', // Azul para shops
      extendedProps: {
        shopId: shop.id,
        type: 'shop'
      }
    }));

    const bundleResources: CalendarResource[] = allBundles.map(bundle => ({
      id: bundle.id,
      title: bundle.name,
      color: '#10B981', // Verde para bundles
      extendedProps: {
        shopId: bundle.shopId,
        bundleId: bundle.id,
        type: 'bundle'
      }
    }));

    const itemResources: CalendarResource[] = allItems.map(item => ({
      id: item.id,
      title: item.title,
      color: '#F59E0B', // Amarillo para items
      extendedProps: {
        shopId: item.shopId,
        bundleId: item.bundleId,
        itemId: item.id,
        type: 'item'
      }
    }));

    return [...shopResources, ...bundleResources, ...itemResources];
  }, [allShops, allBundles, allItems]);

  return {
    // Estados
    shopReservations,
    calendarEvents,
    resources,
    
    // Funciones
    convertReservationsToCalendarEvents,
    mapReservaStatusToBookingStatus,
    
    // Contadores
    totalReservations: shopReservations.length,
    totalEvents: calendarEvents.length,
    totalResources: resources.length
  };
}; 