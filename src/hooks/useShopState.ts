import { useState, useMemo, useEffect } from 'react';
import { mockShops } from '../mockData';
import { allMockReservasItems } from '../features/reservations/mockData';
import { useEntitiesState } from './useEntitiesState';
import type { CalendarEvent, ReservaItem, Booking } from '../types';

// 🎯 CHECKPOINT 8: HOOK PARA ESTADO CENTRALIZADO DEL SHOP ACTIVO

// Tipo extendido para el resource del evento de calendario
interface ExtendedBookingResource extends Booking {
  modernReservation: ReservaItem;
  bundleId: string;
  itemId: string;
  itemName: string;
}

// Tipo extendido para eventos de calendario con resource completo
interface ExtendedCalendarEvent extends Omit<CalendarEvent, 'resource'> {
  resource: ExtendedBookingResource;
}

export const useShopState = () => {
  const { allShops, allBundles, allItems } = useEntitiesState();
  const [selectedShopId, setSelectedShopId] = useState<string>(mockShops[0].id);
  
  // Shop seleccionado (combina shops estáticos y dinámicos)
  const selectedShop = useMemo(() => 
    allShops.find(shop => shop.id === selectedShopId) || mockShops[0],
    [selectedShopId, allShops]
  );

  // Reservas del shop seleccionado (sistema moderno)
  const shopReservations = useMemo(() => 
    allMockReservasItems.filter(reserva => reserva.shopId === selectedShopId),
    [selectedShopId]
  );

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

  // Función para mapear estados de ReservaItem a estados de Booking
  const mapReservaStatusToBookingStatus = (status: ReservaItem['status']): Booking['status'] => {
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
  };

  // Convertir reservas modernas a eventos de calendario
  const convertReservationsToCalendarEvents = useMemo(() => {
    return (reservations: ReservaItem[]): ExtendedCalendarEvent[] => {
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
            // Adaptar ReservaItem al formato legacy Booking para compatibilidad
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
          } as ExtendedBookingResource,
        };
      });
    };
  }, [allBundles, allItems]);

  // Eventos de calendario para el shop actual
  const calendarEvents = useMemo(() => 
    convertReservationsToCalendarEvents(shopReservations),
    [shopReservations, convertReservationsToCalendarEvents]
  );

  // 🎯 CHECKPOINT 9.7: REACTIVIDAD TOTAL AL CAMBIO DE SHOP
  useEffect(() => {
    console.log('🏪 Shop activo cambiado:', selectedShop.name, '(ID:', selectedShopId, ')');
    console.log('📊 Datos del shop:', {
      reservas: shopReservations.length,
      bundles: shopBundles.length,
      items: shopItems.length
    });
  }, [selectedShopId, selectedShop.name, shopReservations.length, shopBundles.length, shopItems.length]);

  // 🎯 CHECKPOINT 9.8: ESTADÍSTICAS SINCRONIZADAS DINÁMICAMENTE
  const shopStats = useMemo(() => {
    return {
      totalReservations: shopReservations.length,
      confirmed: shopReservations.filter(r => r.status === 'CONFIRMED').length,
      pending: shopReservations.filter(r => r.status === 'PENDING').length,
      cancelled: shopReservations.filter(r => r.status === 'CANCELLED').length,
      completed: shopReservations.filter(r => r.status === 'COMPLETED').length,
    };
  }, [shopReservations]);

  // 🎯 CHECKPOINT 9.8: LOG DE ESTADÍSTICAS CALCULADAS
  useEffect(() => {
    console.log('📈 Estadísticas sincronizadas:', shopStats);
  }, [shopStats]);

  return {
    // Estado del shop
    selectedShopId,
    setSelectedShopId,
    selectedShop,
    
    // Datos del shop moderno
    shopReservations,
    shopBundles,
    shopItems,
    calendarEvents,
    
    // Funciones
    convertReservationsToCalendarEvents,
    
    // Estadísticas dinámicas
    shopStats
  };
}; 