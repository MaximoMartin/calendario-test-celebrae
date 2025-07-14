import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReservaItem, ReservaBundle } from '../../types';

// --- RESERVAS MOCK ELIMINADAS ---

// Reservas de prueba para La vuelta del Maxi (shop_maxi) y bundles reales
const allMockReservasItems: ReservaItem[] = [
  {
    id: 'res-maxi-1',
    itemId: 'item_bmw_x5',
    bundleId: 'bundle_auto_premium',
    shopId: 'shop_maxi',
    userId: 'user_maxi',
    customerInfo: {
      name: 'Maximiliano Demo',
      email: 'maxi@demo.com',
      phone: '+54 351 111-2222'
    },
    date: '2025-07-03',
    timeSlot: { startTime: '09:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: true,
    groupSize: 2,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-30T09:00:00Z',
    updatedAt: '2025-06-30T09:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 120,
    totalPrice: 240
  },
  {
    id: 'res-maxi-2',
    itemId: 'item_audi_a4',
    bundleId: 'bundle_auto_premium',
    shopId: 'shop_maxi',
    userId: 'user_maxi',
    customerInfo: {
      name: 'Ana Test',
      email: 'ana@test.com',
      phone: '+54 351 333-4444'
    },
    date: '2025-07-04',
    timeSlot: { startTime: '10:00', endTime: '13:00' },
    numberOfPeople: 3,
    isGroupReservation: true,
    groupSize: 3,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-07-01T10:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 100,
    totalPrice: 300
  },
  {
    id: 'res-maxi-3',
    itemId: 'item_mision_egipcia',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: 'user_maxi',
    customerInfo: {
      name: 'Carlos Escape',
      email: 'carlos@escape.com',
      phone: '+54 351 555-6666'
    },
    date: '2025-07-05',
    timeSlot: { startTime: '18:00', endTime: '19:30' },
    numberOfPeople: 5,
    isGroupReservation: true,
    groupSize: 5,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-02T11:00:00Z',
    updatedAt: '2025-07-02T11:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 80,
    totalPrice: 400
  }
];

// Bundles de prueba para reservas
const allMockReservasBundle: ReservaBundle[] = [
  {
    id: 'bundle-res-maxi-1',
    bundleId: 'bundle_auto_premium',
    shopId: 'shop_maxi',
    userId: 'user_maxi',
    customerInfo: {
      name: 'Maximiliano Demo',
      email: 'maxi@demo.com',
      phone: '+54 351 111-2222'
    },
    reservasItems: [allMockReservasItems[0]],
    extras: [],
    status: 'CONFIRMED',
    isTemporary: false,
    itemsTotal: 240,
    extrasTotal: 0,
    totalPrice: 240,
    createdAt: '2025-06-30T09:00:00Z',
    updatedAt: '2025-06-30T09:00:00Z',
    createdBy: 'BUYER'
  },
  {
    id: 'bundle-res-maxi-2',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: 'user_maxi',
    customerInfo: {
      name: 'Carlos Escape',
      email: 'carlos@escape.com',
      phone: '+54 351 555-6666'
    },
    reservasItems: [allMockReservasItems[2]],
    extras: [],
    status: 'CONFIRMED',
    isTemporary: false,
    itemsTotal: 400,
    extrasTotal: 0,
    totalPrice: 400,
    createdAt: '2025-07-02T11:00:00Z',
    updatedAt: '2025-07-02T11:00:00Z',
    createdBy: 'BUYER'
  }
];

// Reservas de prueba para Café Delicias (shop_cafe)
allMockReservasItems.push(
  {
    id: 'res-cafe-1',
    itemId: 'item_brunch_continental',
    bundleId: 'bundle_brunch_gourmet',
    shopId: 'shop_cafe',
    userId: 'user_cafe',
    customerInfo: {
      name: 'Lucía Café',
      email: 'lucia@cafe.com',
      phone: '+54 351 777-8888'
    },
    date: '2025-07-04',
    timeSlot: { startTime: '10:00', endTime: '11:30' },
    numberOfPeople: 2,
    isGroupReservation: false,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2025-07-02T09:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 18,
    totalPrice: 36
  },
  {
    id: 'res-cafe-2',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_cafe',
    customerInfo: {
      name: 'Martín Postres',
      email: 'martin@postres.com',
      phone: '+54 351 999-0000'
    },
    date: '2025-07-05',
    timeSlot: { startTime: '16:00', endTime: '16:30' },
    numberOfPeople: 1,
    isGroupReservation: false,
    status: 'NO_SHOW',
    isTemporary: false,
    createdAt: '2025-07-03T10:00:00Z',
    updatedAt: '2025-07-05T17:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 8,
    totalPrice: 8
  }
);

// Reserva de prueba para el spa (shop_spa)
allMockReservasItems.push(
  {
    id: 'res-spa-1',
    itemId: 'item_bmw_x5', // Usando un item de auto como ejemplo, puedes cambiarlo si tienes items de spa
    bundleId: 'bundle_auto_premium',
    shopId: 'shop_spa',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: {
      name: 'Sofía Relax',
      email: 'sofia@spa.com',
      phone: '+34 600 345 678'
    },
    date: '2025-07-06',
    timeSlot: { startTime: '10:00', endTime: '12:00' },
    numberOfPeople: 1,
    isGroupReservation: false,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-04T09:00:00Z',
    updatedAt: '2025-07-04T09:00:00Z',
    createdBy: 'BUYER',
    itemPrice: 120,
    totalPrice: 120
  }
);

// Bundles de prueba para reservas del café y spa
allMockReservasBundle.push(
  {
    id: 'bundle-res-cafe-1',
    bundleId: 'bundle_brunch_gourmet',
    shopId: 'shop_cafe',
    userId: 'user_cafe',
    customerInfo: {
      name: 'Lucía Café',
      email: 'lucia@cafe.com',
      phone: '+54 351 777-8888'
    },
    reservasItems: [allMockReservasItems.find(r => r.id === 'res-cafe-1')!],
    extras: [],
    status: 'CANCELLED',
    isTemporary: false,
    itemsTotal: 36,
    extrasTotal: 0,
    totalPrice: 36,
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2025-07-02T09:00:00Z',
    createdBy: 'BUYER'
  },
  {
    id: 'bundle-res-cafe-2',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_cafe',
    customerInfo: {
      name: 'Martín Postres',
      email: 'martin@postres.com',
      phone: '+54 351 999-0000'
    },
    reservasItems: [allMockReservasItems.find(r => r.id === 'res-cafe-2')!],
    extras: [],
    status: 'CANCELLED',
    isTemporary: false,
    itemsTotal: 8,
    extrasTotal: 0,
    totalPrice: 8,
    createdAt: '2025-07-03T10:00:00Z',
    updatedAt: '2025-07-05T17:00:00Z',
    createdBy: 'BUYER'
  },
  {
    id: 'bundle-res-spa-1',
    bundleId: 'bundle_auto_premium',
    shopId: 'shop_spa',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: {
      name: 'Sofía Relax',
      email: 'sofia@spa.com',
      phone: '+34 600 345 678'
    },
    reservasItems: [allMockReservasItems.find(r => r.id === 'res-spa-1')!],
    extras: [],
    status: 'CONFIRMED',
    isTemporary: false,
    itemsTotal: 120,
    extrasTotal: 0,
    totalPrice: 120,
    createdAt: '2025-07-04T09:00:00Z',
    updatedAt: '2025-07-04T09:00:00Z',
    createdBy: 'BUYER'
  }
);

// --- CONTEXTO GLOBAL DE RESERVAS ---
interface ReservationsContextType {
  reservasItems: ReservaItem[];
  setReservasItems: React.Dispatch<React.SetStateAction<ReservaItem[]>>;
  reservasBundle: ReservaBundle[];
  setReservasBundle: React.Dispatch<React.SetStateAction<ReservaBundle[]>>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [reservasItems, setReservasItems] = useState<ReservaItem[]>(allMockReservasItems);
  const [reservasBundle, setReservasBundle] = useState<ReservaBundle[]>(allMockReservasBundle);

  const value = useMemo(() => ({
    reservasItems,
    setReservasItems,
    reservasBundle,
    setReservasBundle
  }), [reservasItems, reservasBundle]);

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) throw new Error('useReservations debe usarse dentro de ReservationsProvider');
  return context;
};

// Time slots disponibles por item (usando el tipo correcto)
export const mockItemTimeSlots: Array<{
  id: string;
  itemId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookingsPerSlot: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}> = [];
 