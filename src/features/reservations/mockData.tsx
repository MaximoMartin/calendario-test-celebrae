import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReservaItem, ReservaBundle } from '../../types';

// Datos de prueba para simular reservas existentes y conflictos

// === RESERVAS MOCK PARA 'La vuelta del Maxi' ===
const mockReservasItems: ReservaItem[] = [
  // Alquiler París
  {
    id: 'resitem_1',
    itemId: 'item_vw_jetta',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: 'user_juan',
    customerInfo: { name: 'Juan Pérez', email: 'juan.perez@mail.com', phone: '+54 351 1234567' },
    date: '2025-07-01',
    timeSlot: { startTime: '09:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-28T10:00:00.000Z',
    updatedAt: '2025-07-01T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cliente frecuente',
    itemPrice: 60,
    totalPrice: 120
  },
  {
    id: 'resitem_2',
    itemId: 'item_bmw_x3',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: 'user_maria',
    customerInfo: { name: 'María López', email: 'maria.lopez@mail.com', phone: '+54 351 7654321' },
    date: '2025-07-02',
    timeSlot: { startTime: '14:00', endTime: '17:00' },
    numberOfPeople: 4,
    isGroupReservation: true,
    groupSize: 4,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-29T12:00:00.000Z',
    updatedAt: '2025-07-02T17:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Pago en efectivo',
    itemPrice: 90,
    totalPrice: 360
  },
  {
    id: 'resitem_3',
    itemId: 'item_vw_jetta',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: 'user_lucas',
    customerInfo: { name: 'Lucas Gómez', email: 'lucas.gomez@mail.com', phone: '+54 351 1112233' },
    date: '2025-06-30',
    timeSlot: { startTime: '09:00', endTime: '12:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CANCELLED',
    isTemporary: false,
    createdAt: '2025-06-27T09:00:00.000Z',
    updatedAt: '2025-06-30T07:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cancelada por el cliente',
    itemPrice: 60,
    totalPrice: 180
  },
  // Escape Room Misión Egipcia
  {
    id: 'resitem_4',
    itemId: 'item_mision_egipcia',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: 'user_ana',
    customerInfo: { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '+54 351 2223344' },
    date: '2025-07-01',
    timeSlot: { startTime: '18:00', endTime: '19:30' },
    numberOfPeople: 6,
    isGroupReservation: true,
    groupSize: 6,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-25T15:00:00.000Z',
    updatedAt: '2025-07-01T18:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Grupo de cumpleaños',
    itemPrice: 80,
    totalPrice: 480
  },
  {
    id: 'resitem_5',
    itemId: 'item_mision_egipcia',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: 'user_ana',
    customerInfo: { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '+54 351 2223344' },
    date: '2025-06-27',
    timeSlot: { startTime: '18:00', endTime: '19:30' },
    numberOfPeople: 8,
    isGroupReservation: true,
    groupSize: 8,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-20T10:00:00.000Z',
    updatedAt: '2025-06-27T19:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Grupo escolar',
    itemPrice: 80,
    totalPrice: 640
  },
  // Spa Day con Aromaterapia
  {
    id: 'resitem_6',
    itemId: 'item_masaje',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: 'user_sofia',
    customerInfo: { name: 'Sofía Ramírez', email: 'sofia.ramirez@mail.com', phone: '+54 351 3334455' },
    date: '2025-07-01',
    timeSlot: { startTime: '10:00', endTime: '11:00' },
    numberOfPeople: 1,
    isGroupReservation: false,
    groupSize: 1,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-06-29T11:00:00.000Z',
    updatedAt: '2025-07-01T09:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Primera vez en el spa',
    itemPrice: 50,
    totalPrice: 50
  },
  {
    id: 'resitem_7',
    itemId: 'item_sauna',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: 'user_sofia',
    customerInfo: { name: 'Sofía Ramírez', email: 'sofia.ramirez@mail.com', phone: '+54 351 3334455' },
    date: '2025-07-01',
    timeSlot: { startTime: '11:30', endTime: '12:00' },
    numberOfPeople: 1,
    isGroupReservation: false,
    groupSize: 1,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-06-29T11:00:00.000Z',
    updatedAt: '2025-07-01T09:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Primera vez en el spa',
    itemPrice: 30,
    totalPrice: 30
  }
];

const mockReservasBundle: ReservaBundle[] = [
  {
    id: 'resbundle_1',
    bundleId: 'bundle_paris',
    shopId: 'shop_maxi',
    userId: 'user_juan',
    customerInfo: { name: 'Juan Pérez', email: 'juan.perez@mail.com', phone: '+54 351 1234567' },
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
    createdAt: '2025-06-28T10:00:00.000Z',
    updatedAt: '2025-07-01T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Cliente frecuente'
  },
  {
    id: 'resbundle_2',
    bundleId: 'bundle_escaperoom',
    shopId: 'shop_maxi',
    userId: 'user_ana',
    customerInfo: { name: 'Ana Torres', email: 'ana.torres@mail.com', phone: '+54 351 2223344' },
    reservasItems: [mockReservasItems[3], mockReservasItems[4]],
    extras: [
      { extraId: 'extra_certificado', quantity: 6, unitPrice: 5, totalPrice: 30, isGroupSelection: true }
    ],
    itemsTotal: 1120,
    extrasTotal: 30,
    totalPrice: 1150,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-20T10:00:00.000Z',
    updatedAt: '2025-07-01T18:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Grupo escolar y cumpleaños'
  },
  {
    id: 'resbundle_3',
    bundleId: 'bundle_spa',
    shopId: 'shop_maxi',
    userId: 'user_sofia',
    customerInfo: { name: 'Sofía Ramírez', email: 'sofia.ramirez@mail.com', phone: '+54 351 3334455' },
    reservasItems: [mockReservasItems[5], mockReservasItems[6]],
    extras: [
      { extraId: 'extra_aromaterapia', quantity: 1, unitPrice: 20, totalPrice: 20, isGroupSelection: false }
    ],
    itemsTotal: 80,
    extrasTotal: 20,
    totalPrice: 100,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-06-29T11:00:00.000Z',
    updatedAt: '2025-07-01T09:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Primera vez en el spa'
  }
];

// === RESERVAS MOCK PARA 'Café Delicias' ===
const mockReservasItemsCafe: ReservaItem[] = [
  // Brunch Especial
  {
    id: 'resitem_cafe_1',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_carla',
    customerInfo: { name: 'Carla Ruiz', email: 'carla.ruiz@mail.com', phone: '+34 600 111222' },
    date: '2025-07-01',
    timeSlot: { startTime: '09:00', endTime: '11:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-28T08:00:00.000Z',
    updatedAt: '2025-07-01T08:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Mesa junto a la ventana',
    itemPrice: 18,
    totalPrice: 54
  },
  {
    id: 'resitem_cafe_2',
    itemId: 'item_americano',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_carla',
    customerInfo: { name: 'Carla Ruiz', email: 'carla.ruiz@mail.com', phone: '+34 600 111222' },
    date: '2025-07-01',
    timeSlot: { startTime: '11:00', endTime: '12:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-28T08:00:00.000Z',
    updatedAt: '2025-07-01T08:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Mesa junto a la ventana',
    itemPrice: 22,
    totalPrice: 66
  },
  {
    id: 'resitem_cafe_3',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_jorge',
    customerInfo: { name: 'Jorge Martín', email: 'jorge.martin@mail.com', phone: '+34 600 333444' },
    date: '2025-06-30',
    timeSlot: { startTime: '09:00', endTime: '11:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-27T09:00:00.000Z',
    updatedAt: '2025-06-30T10:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración aniversario',
    itemPrice: 18,
    totalPrice: 36
  },
  {
    id: 'resitem_cafe_4',
    itemId: 'item_americano',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_jorge',
    customerInfo: { name: 'Jorge Martín', email: 'jorge.martin@mail.com', phone: '+34 600 333444' },
    date: '2025-06-30',
    timeSlot: { startTime: '11:00', endTime: '12:00' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-27T09:00:00.000Z',
    updatedAt: '2025-06-30T10:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración aniversario',
    itemPrice: 22,
    totalPrice: 44
  },
  {
    id: 'resitem_cafe_5',
    itemId: 'item_continental',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_lucia',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    date: '2025-07-02',
    timeSlot: { startTime: '09:00', endTime: '11:00' },
    numberOfPeople: 4,
    isGroupReservation: false,
    groupSize: 4,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-06-29T10:00:00.000Z',
    updatedAt: '2025-07-02T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Solicita silla para bebé',
    itemPrice: 18,
    totalPrice: 72
  },
  // Tarde de Café y Postres
  {
    id: 'resitem_cafe_6',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_manu',
    customerInfo: { name: 'Manuela Díaz', email: 'manu.diaz@mail.com', phone: '+34 600 777888' },
    date: '2025-07-05',
    timeSlot: { startTime: '16:00', endTime: '16:30' },
    numberOfPeople: 5,
    isGroupReservation: false,
    groupSize: 5,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T12:00:00.000Z',
    updatedAt: '2025-07-05T15:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración cumpleaños',
    itemPrice: 8,
    totalPrice: 40
  },
  {
    id: 'resitem_cafe_7',
    itemId: 'item_postres',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_manu',
    customerInfo: { name: 'Manuela Díaz', email: 'manu.diaz@mail.com', phone: '+34 600 777888' },
    date: '2025-07-05',
    timeSlot: { startTime: '16:30', endTime: '17:00' },
    numberOfPeople: 5,
    isGroupReservation: false,
    groupSize: 5,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T12:00:00.000Z',
    updatedAt: '2025-07-05T15:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración cumpleaños',
    itemPrice: 12,
    totalPrice: 60
  },
  {
    id: 'resitem_cafe_8',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_ale',
    customerInfo: { name: 'Alejandro Soto', email: 'ale.soto@mail.com', phone: '+34 600 999000' },
    date: '2025-06-28',
    timeSlot: { startTime: '17:00', endTime: '17:30' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-25T13:00:00.000Z',
    updatedAt: '2025-06-28T17:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Sin azúcar',
    itemPrice: 8,
    totalPrice: 24
  },
  {
    id: 'resitem_cafe_9',
    itemId: 'item_postres',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_ale',
    customerInfo: { name: 'Alejandro Soto', email: 'ale.soto@mail.com', phone: '+34 600 999000' },
    date: '2025-06-28',
    timeSlot: { startTime: '17:30', endTime: '18:00' },
    numberOfPeople: 3,
    isGroupReservation: false,
    groupSize: 3,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-25T13:00:00.000Z',
    updatedAt: '2025-06-28T17:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Sin azúcar',
    itemPrice: 12,
    totalPrice: 36
  },
  {
    id: 'resitem_cafe_10',
    itemId: 'item_cafe_gourmet',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_lucia',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    date: '2025-07-12',
    timeSlot: { startTime: '18:00', endTime: '18:30' },
    numberOfPeople: 2,
    isGroupReservation: false,
    groupSize: 2,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-10T10:00:00.000Z',
    updatedAt: '2025-07-12T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Sin lactosa',
    itemPrice: 8,
    totalPrice: 16
  }
];

const mockReservasBundleCafe: ReservaBundle[] = [
  {
    id: 'resbundle_cafe_1',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_carla',
    customerInfo: { name: 'Carla Ruiz', email: 'carla.ruiz@mail.com', phone: '+34 600 111222' },
    reservasItems: [mockReservasItemsCafe[0], mockReservasItemsCafe[1]],
    extras: [
      { extraId: 'extra_mimosa', quantity: 2, unitPrice: 6, totalPrice: 12, isGroupSelection: false }
    ],
    itemsTotal: 120,
    extrasTotal: 12,
    totalPrice: 132,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-06-28T08:00:00.000Z',
    updatedAt: '2025-07-01T08:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Mesa junto a la ventana'
  },
  {
    id: 'resbundle_cafe_2',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_jorge',
    customerInfo: { name: 'Jorge Martín', email: 'jorge.martin@mail.com', phone: '+34 600 333444' },
    reservasItems: [mockReservasItemsCafe[2], mockReservasItemsCafe[3]],
    extras: [
      { extraId: 'extra_mimosa', quantity: 1, unitPrice: 6, totalPrice: 6, isGroupSelection: false }
    ],
    itemsTotal: 80,
    extrasTotal: 6,
    totalPrice: 86,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-27T09:00:00.000Z',
    updatedAt: '2025-06-30T10:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración aniversario'
  },
  {
    id: 'resbundle_cafe_3',
    bundleId: 'bundle_brunch',
    shopId: 'shop_cafe',
    userId: 'user_lucia',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    reservasItems: [mockReservasItemsCafe[4]],
    extras: [],
    itemsTotal: 72,
    extrasTotal: 0,
    totalPrice: 72,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-06-29T10:00:00.000Z',
    updatedAt: '2025-07-02T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Solicita silla para bebé'
  },
  {
    id: 'resbundle_cafe_4',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_manu',
    customerInfo: { name: 'Manuela Díaz', email: 'manu.diaz@mail.com', phone: '+34 600 777888' },
    reservasItems: [mockReservasItemsCafe[5], mockReservasItemsCafe[6]],
    extras: [
      { extraId: 'extra_combo_postres', quantity: 1, unitPrice: 15, totalPrice: 15, isGroupSelection: false }
    ],
    itemsTotal: 100,
    extrasTotal: 15,
    totalPrice: 115,
    status: 'CONFIRMED',
    isTemporary: false,
    createdAt: '2025-07-01T12:00:00.000Z',
    updatedAt: '2025-07-05T15:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Celebración cumpleaños'
  },
  {
    id: 'resbundle_cafe_5',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_ale',
    customerInfo: { name: 'Alejandro Soto', email: 'ale.soto@mail.com', phone: '+34 600 999000' },
    reservasItems: [mockReservasItemsCafe[7], mockReservasItemsCafe[8]],
    extras: [],
    itemsTotal: 60,
    extrasTotal: 0,
    totalPrice: 60,
    status: 'COMPLETED',
    isTemporary: false,
    createdAt: '2025-06-25T13:00:00.000Z',
    updatedAt: '2025-06-28T17:30:00.000Z',
    createdBy: 'SELLER',
    notes: 'Sin azúcar'
  },
  {
    id: 'resbundle_cafe_6',
    bundleId: 'bundle_tarde_cafe',
    shopId: 'shop_cafe',
    userId: 'user_lucia',
    customerInfo: { name: 'Lucía Fernández', email: 'lucia.fernandez@mail.com', phone: '+34 600 555666' },
    reservasItems: [mockReservasItemsCafe[9]],
    extras: [],
    itemsTotal: 16,
    extrasTotal: 0,
    totalPrice: 16,
    status: 'PENDING',
    isTemporary: false,
    createdAt: '2025-07-10T10:00:00.000Z',
    updatedAt: '2025-07-12T08:00:00.000Z',
    createdBy: 'SELLER',
    notes: 'Sin lactosa'
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
 