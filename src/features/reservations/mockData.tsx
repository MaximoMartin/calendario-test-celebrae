import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReservaItem, ReservaBundle } from '../../types';

// Datos de prueba para simular reservas existentes y conflictos

// === RESERVAS MOCK PARA 'La vuelta del Maxi' ===
const mockReservasItems: ReservaItem[] = [
  // CONFIRMED - VW Jetta
  {
    id: 'resitem_maxi_1',
    itemId: 'item_vw_jetta',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Juan Pérez', email: 'juan.perez@mail.com', phone: '+34 600 123456' },
    date: '2025-07-03',
    timeSlot: { startTime: '09:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: true,
    groupSize: 2,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T10:00:00.000Z',
    updatedAt: '2025-07-03T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cliente frecuente',
    itemPrice: 60,
    totalPrice: 120
  },
  // PENDING - BMW X3
  {
    id: 'resitem_maxi_2',
    itemId: 'item_bmw_x3',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'María López', email: 'maria.lopez@mail.com', phone: '+34 600 654321' },
    date: '2025-07-04',
    timeSlot: { startTime: '14:00', endTime: '17:00' },
    numberOfPeople: 4,
    isGroupReservation: true,
    groupSize: 4,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-02T12:00:00.000Z',
    updatedAt: '2025-07-04T13:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Pago pendiente',
    itemPrice: 90,
    totalPrice: 360
  },
  // CANCELLED - Escape Room
  {
    id: 'resitem_maxi_3',
    itemId: 'item_mision_egipcia',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '+34 600 222333' },
    date: '2025-07-05',
    timeSlot: { startTime: '18:00', endTime: '19:30' },
    numberOfPeople: 6,
    isGroupReservation: true,
    groupSize: 6,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T15:00:00.000Z',
    updatedAt: '2025-07-05T17:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cancelada por el cliente',
    itemPrice: 80,
    totalPrice: 480
  },
  // COMPLETED - Masaje Spa
  {
    id: 'resitem_maxi_4',
    itemId: 'item_masaje',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Sofía Ramírez', email: 'sofia.ramirez@mail.com', phone: '+34 600 333444' },
    date: '2025-07-02',
    timeSlot: { startTime: '10:00', endTime: '11:00' },
    numberOfPeople: 1,
    isGroupReservation: false,
    groupSize: 1,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-07-01T11:00:00.000Z',
    updatedAt: '2025-07-02T11:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Masaje relajante',
    itemPrice: 50,
    totalPrice: 50
  },
  // NO_SHOW - Sauna
  {
    id: 'resitem_maxi_5',
    itemId: 'item_sauna',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Pedro Alvarez', email: 'pedro.alvarez@mail.com', phone: '+34 600 555666' },
    date: '2025-07-06',
    timeSlot: { startTime: '11:30', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'NO_SHOW',
    isTemporary: false,
    createdAt: '2025-07-05T12:00:00.000Z',
    updatedAt: '2025-07-06T11:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'No se presentó',
    itemPrice: 30,
    totalPrice: 60
  },
  // RESCHEDULED (original)
  {
    id: 'resitem_maxi_6',
    itemId: 'item_vw_jetta',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Lucas Gómez', email: 'lucas.gomez@mail.com', phone: '+34 600 777888' },
    date: '2025-07-03',
    timeSlot: { startTime: '14:00', endTime: '17:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T09:00:00.000Z',
    updatedAt: '2025-07-03T13:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Reprogramada por lluvia',
    itemPrice: 60,
    totalPrice: 180,
    originalReservationId: undefined,
    rescheduledToReservationId: 'resitem_maxi_7'
  },
  // RESCHEDULED (nueva)
  {
    id: 'resitem_maxi_7',
    itemId: 'item_vw_jetta',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Lucas Gómez', email: 'lucas.gomez@mail.com', phone: '+34 600 777888' },
    date: '2025-07-05',
    timeSlot: { startTime: '09:00', endTime: '12:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-03T13:10:00.000Z',
    updatedAt: '2025-07-05T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Nueva fecha por reprogramación',
    itemPrice: 60,
    totalPrice: 180,
    originalReservationId: 'resitem_maxi_6',
    rescheduledToReservationId: undefined
  }
];

const mockReservasBundle: ReservaBundle[] = [
  // Bundle CONFIRMED - París
  {
    id: 'resbundle_maxi_1',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Juan Pérez', email: 'juan.perez@mail.com', phone: '+34 600 123456' },
    reservasItems: [mockReservasItems[0]],
    extras: [
      { extraId: 'extra_gps', quantity: 1, unitPrice: 10, totalPrice: 10, isGroupSelection: true },
      { extraId: 'extra_seguro', quantity: 1, unitPrice: 25, totalPrice: 25, isGroupSelection: true }
    ],
    itemsTotal: 120,
    extrasTotal: 35,
    totalPrice: 155,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T10:00:00.000Z',
    updatedAt: '2025-07-03T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cliente frecuente'
  },
  // Bundle PENDING - Spa
  {
    id: 'resbundle_maxi_2',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Sofía Ramírez', email: 'sofia.ramirez@mail.com', phone: '+34 600 333444' },
    reservasItems: [mockReservasItems[3]],
    extras: [
      { extraId: 'extra_aromaterapia', quantity: 1, unitPrice: 20, totalPrice: 20, isGroupSelection: false }
    ],
    itemsTotal: 50,
    extrasTotal: 20,
    totalPrice: 70,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-01T11:00:00.000Z',
    updatedAt: '2025-07-02T11:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Masaje relajante'
  },
  // Bundle CANCELLED - Escape Room
  {
    id: 'resbundle_maxi_3',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '+34 600 222333' },
    reservasItems: [mockReservasItems[2]],
    extras: [
      { extraId: 'extra_certificado', quantity: 6, unitPrice: 5, totalPrice: 30, isGroupSelection: true }
    ],
    itemsTotal: 480,
    extrasTotal: 30,
    totalPrice: 510,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T15:00:00.000Z',
    updatedAt: '2025-07-05T17:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cancelada por el cliente'
  },
  // Bundle RESCHEDULED - París
  {
    id: 'resbundle_maxi_4',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Lucas Gómez', email: 'lucas.gomez@mail.com', phone: '+34 600 777888' },
    reservasItems: [mockReservasItems[5], mockReservasItems[6]],
    extras: [
      { extraId: 'extra_gps', quantity: 1, unitPrice: 10, totalPrice: 10, isGroupSelection: true }
    ],
    itemsTotal: 360,
    extrasTotal: 10,
    totalPrice: 370,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T09:00:00.000Z',
    updatedAt: '2025-07-05T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Reprogramada por lluvia'
  }
];

// === RESERVAS MOCK PARA 'Café Delicias' ===
const mockReservasItemsCafe: ReservaItem[] = [
  // CONFIRMED - Continental
  {
    id: 'resitem_cafe_1',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Carla Ruiz', email: 'carla.ruiz@mail.com', phone: '+34 600 111222' },
    date: '2025-07-03',
    timeSlot: { startTime: '09:00', endTime: '11:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T08:00:00.000Z',
    updatedAt: '2025-07-03T08:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Mesa junto a la ventana',
    itemPrice: 18,
    totalPrice: 54
  },
  // PENDING - Americano
  {
    id: 'resitem_cafe_2',
    itemId: 'item_americano',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Jorge Martín', email: 'jorge.martin@mail.com', phone: '+34 600 333444' },
    date: '2025-07-04',
    timeSlot: { startTime: '11:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-02T09:00:00.000Z',
    updatedAt: '2025-07-04T11:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración aniversario',
    itemPrice: 22,
    totalPrice: 44
  },
  // CANCELLED - Café Gourmet
  {
    id: 'resitem_cafe_3',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    date: '2025-07-05',
    timeSlot: { startTime: '16:00', endTime: '16:30' },
    numberOfPeople: 4,
    isGroupReservation: false,
    groupSize: 4,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T12:00:00.000Z',
    updatedAt: '2025-07-05T15:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cancelada por el cliente',
    itemPrice: 8,
    totalPrice: 32
  },
  // COMPLETED - Postres
  {
    id: 'resitem_cafe_4',
    itemId: 'item_postres',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Manuela Díaz', email: 'manu.diaz@mail.com', phone: '+34 600 777888' },
    date: '2025-07-02',
    timeSlot: { startTime: '16:30', endTime: '17:00' },
    numberOfPeople: 5,
    isGroupReservation: false,
    groupSize: 5,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-07-01T13:00:00.000Z',
    updatedAt: '2025-07-02T17:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración cumpleaños',
    itemPrice: 12,
    totalPrice: 60
  },
  // NO_SHOW - Café Gourmet
  {
    id: 'resitem_cafe_5',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Alejandro Soto', email: 'ale.soto@mail.com', phone: '+34 600 999000' },
    date: '2025-07-06',
    timeSlot: { startTime: '18:00', endTime: '18:30' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'NO_SHOW',
    isTemporary: false,
    createdAt: '2025-07-05T18:00:00.000Z',
    updatedAt: '2025-07-06T18:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'No se presentó',
    itemPrice: 8,
    totalPrice: 16
  },
  // RESCHEDULED (original)
  {
    id: 'resitem_cafe_6',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Marta Sanz', email: 'marta.sanz@mail.com', phone: '+34 600 123999' },
    date: '2025-07-03',
    timeSlot: { startTime: '11:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T09:00:00.000Z',
    updatedAt: '2025-07-03T11:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Reprogramada por fuerza mayor',
    itemPrice: 18,
    totalPrice: 36,
    originalReservationId: undefined,
    rescheduledToReservationId: 'resitem_cafe_7'
  },
  // RESCHEDULED (nueva)
  {
    id: 'resitem_cafe_7',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Marta Sanz', email: 'marta.sanz@mail.com', phone: '+34 600 123999' },
    date: '2025-07-07',
    timeSlot: { startTime: '09:00', endTime: '11:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-03T11:10:00.000Z',
    updatedAt: '2025-07-07T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Nueva fecha por reprogramación',
    itemPrice: 18,
    totalPrice: 36,
    originalReservationId: 'resitem_cafe_6',
    rescheduledToReservationId: undefined
  }
];

const mockReservasBundleCafe: ReservaBundle[] = [
  // Bundle CONFIRMED - Brunch
  {
    id: 'resbundle_cafe_1',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Carla Ruiz', email: 'carla.ruiz@mail.com', phone: '+34 600 111222' },
    reservasItems: [mockReservasItemsCafe[0]],
    extras: [
      { extraId: 'extra_mimosa', quantity: 2, unitPrice: 6, totalPrice: 12, isGroupSelection: false }
    ],
    itemsTotal: 54,
    extrasTotal: 12,
    totalPrice: 66,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T08:00:00.000Z',
    updatedAt: '2025-07-03T08:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Mesa junto a la ventana'
  },
  // Bundle PENDING - Tarde de Café
  {
    id: 'resbundle_cafe_2',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Manuela Díaz', email: 'manu.diaz@mail.com', phone: '+34 600 777888' },
    reservasItems: [mockReservasItemsCafe[3]],
    extras: [
      { extraId: 'extra_combo_postres', quantity: 1, unitPrice: 15, totalPrice: 15, isGroupSelection: false }
    ],
    itemsTotal: 60,
    extrasTotal: 15,
    totalPrice: 75,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-01T13:00:00.000Z',
    updatedAt: '2025-07-02T17:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración cumpleaños'
  },
  // Bundle CANCELLED - Tarde de Café
  {
    id: 'resbundle_cafe_3',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    reservasItems: [mockReservasItemsCafe[2]],
    extras: [],
    itemsTotal: 32,
    extrasTotal: 0,
    totalPrice: 32,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T12:00:00.000Z',
    updatedAt: '2025-07-05T15:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cancelada por el cliente'
  },
  // Bundle RESCHEDULED - Brunch
  {
    id: 'resbundle_cafe_4',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: '87IZYWdezwJQsILiU57z',
    customerInfo: { name: 'Marta Sanz', email: 'marta.sanz@mail.com', phone: '+34 600 123999' },
    reservasItems: [mockReservasItemsCafe[5], mockReservasItemsCafe[6]],
    extras: [
      { extraId: 'extra_mimosa', quantity: 1, unitPrice: 6, totalPrice: 6, isGroupSelection: false }
    ],
    itemsTotal: 72,
    extrasTotal: 6,
    totalPrice: 78,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-07-01T09:00:00.000Z',
    updatedAt: '2025-07-07T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Reprogramada por fuerza mayor'
  }
];

// Unir las reservas mock de ambos shops
const allMockReservasItems = [...mockReservasItems, ...mockReservasItemsCafe];
const allMockReservasBundle = [...mockReservasBundle, ...mockReservasBundleCafe];

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
}> = [
  // --- La vuelta del Maxi ---
  // Alquiler París
  {
    id: 'slot_vw_jetta_1',
    itemId: 'item_vw_jetta',
    dayOfWeek: 1, // Lunes
    startTime: '09:00',
    endTime: '12:00',
    maxBookingsPerSlot: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_bmw_x3_1',
    itemId: 'item_bmw_x3',
    dayOfWeek: 3, // Miércoles
    startTime: '14:00',
    endTime: '17:00',
    maxBookingsPerSlot: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Escape Room
  {
    id: 'slot_mision_egipcia_1',
    itemId: 'item_mision_egipcia',
    dayOfWeek: 5, // Viernes
    startTime: '18:00',
    endTime: '19:30',
    maxBookingsPerSlot: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Spa Day
  {
    id: 'slot_masaje_1',
    itemId: 'item_masaje',
    dayOfWeek: 2, // Martes
    startTime: '10:00',
    endTime: '11:00',
    maxBookingsPerSlot: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_sauna_1',
    itemId: 'item_sauna',
    dayOfWeek: 2, // Martes
    startTime: '11:30',
    endTime: '12:00',
    maxBookingsPerSlot: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- Café Delicias ---
  // Brunch Especial
  {
    id: 'slot_continental_1',
    itemId: 'item_continental',
    dayOfWeek: 0, // Domingo
    startTime: '10:00',
    endTime: '11:00',
    maxBookingsPerSlot: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_americano_1',
    itemId: 'item_americano',
    dayOfWeek: 0, // Domingo
    startTime: '11:00',
    endTime: '12:00',
    maxBookingsPerSlot: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Tarde de Café
  {
    id: 'slot_cafe_gourmet_1',
    itemId: 'item_cafe_gourmet',
    dayOfWeek: 6, // Sábado
    startTime: '16:00',
    endTime: '16:30',
    maxBookingsPerSlot: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_postres_1',
    itemId: 'item_postres',
    dayOfWeek: 6, // Sábado
    startTime: '16:30',
    endTime: '17:00',
    maxBookingsPerSlot: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
 