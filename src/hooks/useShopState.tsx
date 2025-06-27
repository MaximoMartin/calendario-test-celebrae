import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { mockShops } from '../mockData';
import { useReservations } from '../features/reservations/mockData';
import { useEntitiesState } from './useEntitiesState';
import type { ReservaItem, Shop, Bundle, Item } from '../types';

// Tipo simplificado para el resource del evento de calendario
interface ExtendedBookingResource {
  id: string;
  kitId: string; // Bundle como "kit" legacy
  kitName: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  numberOfPeople: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED' | 'PARTIAL_REFUND';
  isManual: boolean;
  createdAt: string;
  notes?: string;
  // Datos adicionales del sistema moderno
  modernReservation: ReservaItem;
  bundleId: string;
  itemId: string;
  itemName: string;
}

interface ExtendedCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ExtendedBookingResource;
}

// Tipo para el contexto
interface ShopStateContextType {
  selectedShopId: string;
  setSelectedShopId: React.Dispatch<React.SetStateAction<string>>;
  selectedShop: Shop;
  shopReservations: ReservaItem[];
  shopBundles: Bundle[];
  shopItems: Item[];
  calendarEvents: any[];
  shopStats: any;
}

const ShopStateContext = createContext<ShopStateContextType | undefined>(undefined);

export const ShopStateProvider = ({ children }: { children: ReactNode }) => {
  const { allShops, allBundles, allItems } = useEntitiesState();
  const { reservasItems } = useReservations();
  const [selectedShopId, setSelectedShopId] = useState<string>(mockShops[0].id);
  
  // Shop seleccionado (combina shops estáticos y dinámicos)
  const selectedShop = useMemo(() => 
    allShops.find(shop => shop.id === selectedShopId) || mockShops[0],
    [selectedShopId, allShops]
  );

  // Reservas del shop seleccionado (sistema moderno)
  const shopReservations = useMemo(() => 
    reservasItems.filter((reserva: ReservaItem) => reserva.shopId === selectedShopId),
    [selectedShopId, reservasItems]
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

  // Función para mapear estados de ReservaItem a estados compatibles
  const mapReservaStatusToBookingStatus = (status: ReservaItem['status']): ExtendedBookingResource['status'] => {
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
          } as ExtendedBookingResource,
        };
      });
    };
  }, [allBundles, allItems]);

  // Eventos de calendario del shop seleccionado
  const calendarEvents = useMemo(() => 
    convertReservationsToCalendarEvents(shopReservations),
    [convertReservationsToCalendarEvents, shopReservations]
  );

  // Estadísticas del shop seleccionado
  const shopStats = useMemo(() => {
    const reservations = shopReservations;
    
    return {
      totalReservations: reservations.length,
      confirmedReservations: reservations.filter(r => r.status === 'CONFIRMED').length,
      pendingReservations: reservations.filter(r => r.status === 'PENDING').length,
      cancelledReservations: reservations.filter(r => r.status === 'CANCELLED').length,
      completedReservations: reservations.filter(r => r.status === 'COMPLETED').length,
      totalRevenue: reservations
        .filter(r => ['CONFIRMED', 'COMPLETED'].includes(r.status))
        .reduce((sum, r) => sum + r.totalPrice, 0),
      averageReservationValue: reservations.length > 0 
        ? reservations.reduce((sum, r) => sum + r.totalPrice, 0) / reservations.length 
        : 0
    };
  }, [shopReservations]);

  const value: ShopStateContextType = {
    selectedShopId,
    setSelectedShopId,
    selectedShop,
    shopReservations,
    shopBundles,
    shopItems,
    calendarEvents,
    shopStats
  };

  return (
    <ShopStateContext.Provider value={value}>
      {children}
    </ShopStateContext.Provider>
  );
};

export const useShopState = () => {
  const context = useContext(ShopStateContext);
  if (!context) {
    throw new Error('useShopState debe usarse dentro de ShopStateProvider');
  }
  return context;
}; 