import type { User, Shop, Kit, Booking, BusinessHours, TimeSlot, BookingSettings } from '../types';

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "BUYER", "ADMIN", "ESSENTIAL"],
  phoneNumber: "3515050672"
};

export const mockBusinessHours: BusinessHours[] = [
  { dayOfWeek: 1, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] }, // Monday
  { dayOfWeek: 2, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] }, // Tuesday
  { dayOfWeek: 3, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] }, // Wednesday
  { dayOfWeek: 4, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] }, // Thursday
  { dayOfWeek: 5, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] }, // Friday
  { dayOfWeek: 6, isActive: true, periods: [{ startTime: "10:00", endTime: "16:00" }] }, // Saturday - horario continuo
  { dayOfWeek: 0, isActive: false, periods: [{ startTime: "10:00", endTime: "14:00" }] }, // Sunday
];

export const mockBookingSettings: BookingSettings = {
  hoursBeforeBooking: 24,
  maxAdvanceBookingDays: 30,
  allowSameDayBooking: false,
  autoConfirmBookings: false
};

// Los 3 negocios del usuario Maxi
export const mockShops: Shop[] = [
  {
    id: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    name: "La vuelta del Maxi",
    address: "Via Catania, 12, Turin, Italy",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: mockBusinessHours,
    bookingSettings: mockBookingSettings
  },
  {
    id: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    name: "Café Delicias",
    address: "Centro de la ciudad",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: [
      { dayOfWeek: 1, isActive: true, periods: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "15:00", endTime: "22:00" }] },
      { dayOfWeek: 2, isActive: true, periods: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "15:00", endTime: "22:00" }] },
      { dayOfWeek: 3, isActive: true, periods: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "15:00", endTime: "22:00" }] },
      { dayOfWeek: 4, isActive: true, periods: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "15:00", endTime: "22:00" }] },
      { dayOfWeek: 5, isActive: true, periods: [{ startTime: "08:00", endTime: "24:00" }] }, // Viernes horario extendido
      { dayOfWeek: 6, isActive: true, periods: [{ startTime: "10:00", endTime: "24:00" }] }, // Sábado horario extendido
      { dayOfWeek: 0, isActive: true, periods: [{ startTime: "10:00", endTime: "20:00" }] }, // Domingo
    ],
    bookingSettings: mockBookingSettings
  },

];

// Para mantener compatibilidad con componentes existentes
export const mockShop: Shop = mockShops[0];

// Time slots específicos por negocio
export const mockTimeSlots: TimeSlot[] = [
  // 🎯 La vuelta del Maxi - Ofertas/Descuentos, Relajación y bienestar
  // Alquiler de Autos París
  { id: "ts_auto_1", kitId: "kit_auto_paris", startTime: "09:00", endTime: "12:00", maxBookings: 2, isActive: true },
  { id: "ts_auto_2", kitId: "kit_auto_paris", startTime: "14:00", endTime: "17:00", maxBookings: 2, isActive: true },
  
  // Spa Day Premium
  { id: "ts_spa_1", kitId: "kit_spa_day", startTime: "09:00", endTime: "15:00", maxBookings: 1, isActive: true },
  { id: "ts_spa_2", kitId: "kit_spa_day", startTime: "10:00", endTime: "16:00", maxBookings: 1, isActive: true },
  
  // Cata de Vinos VIP
  { id: "ts_vino_1", kitId: "kit_cata_vinos", startTime: "15:00", endTime: "16:30", maxBookings: 6, isActive: true },
  { id: "ts_vino_2", kitId: "kit_cata_vinos", startTime: "17:00", endTime: "18:30", maxBookings: 6, isActive: true },

  // 🍽️ Café Delicias - Al mediodía, A la noche
  // Brunch Especial
  { id: "ts_brunch_1", kitId: "kit_brunch_especial", startTime: "10:00", endTime: "12:00", maxBookings: 4, isActive: true },
  { id: "ts_brunch_2", kitId: "kit_brunch_especial", startTime: "12:00", endTime: "14:00", maxBookings: 4, isActive: true },
  
  // Cena Romántica
  { id: "ts_cena_1", kitId: "kit_cena_romantica", startTime: "19:00", endTime: "22:00", maxBookings: 3, isActive: true },
  { id: "ts_cena_2", kitId: "kit_cena_romantica", startTime: "21:00", endTime: "24:00", maxBookings: 2, isActive: true },
  
  // Clase de Café y Barista
  { id: "ts_cafe_1", kitId: "kit_clase_barista", startTime: "14:00", endTime: "16:00", maxBookings: 6, isActive: true },
  { id: "ts_cafe_2", kitId: "kit_clase_barista", startTime: "16:00", endTime: "18:00", maxBookings: 6, isActive: true },


];

// Kits específicos por negocio
export const mockKits: Kit[] = [
  // 🎯 LA VUELTA DEL MAXI - Ofertas/Descuentos, Relajación y bienestar
  {
    id: "kit_auto_paris",
    name: "Alquiler de Autos en París, Francia",
    price: 120,
    maxCapacity: 4,
    duration: 180, // 3 hours
    items: [
      {
        id: "item_auto_1",
        title: "Volkswagen Jetta or similar",
        description: "Vehicle Features AM/FM Stereo Radio Cruise Control 2 Wheel Drive Gasoline Vehicle Air Conditioning Bluetooth",
        price: 100,
        isForAdult: true,
        size: 5
      }
    ],
    extras: [
      {
        id: "extra_auto_1",
        title: "Porta equipaje parisino",
        description: "Muy parisino el porta equipaje",
        price: 5,
        isForAdult: false,
        quantity: 0
      }
    ],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_auto_paris")
  },
  {
    id: "kit_spa_day",
    name: "Spa Day Premium Completo",
    price: 180,
    maxCapacity: 1,
    duration: 360, // 6 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_spa_day")
  },
  {
    id: "kit_cata_vinos",
    name: "Cata de Vinos VIP Exclusiva",
    price: 75,
    maxCapacity: 6,
    duration: 90, // 1.5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_cata_vinos")
  },

  // 🍽️ CAFÉ DELICIAS - Al mediodía, A la noche
  {
    id: "kit_brunch_especial",
    name: "Brunch Especial Gourmet",
    price: 45,
    maxCapacity: 2,
    duration: 120, // 2 hours
    items: [],
    extras: [],
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_brunch_especial")
  },
  {
    id: "kit_cena_romantica",
    name: "Cena Romántica Premium",
    price: 95,
    maxCapacity: 2,
    duration: 180, // 3 hours
    items: [],
    extras: [],
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_cena_romantica")
  },
  {
    id: "kit_clase_barista",
    name: "Clase de Café y Barista Profesional",
    price: 65,
    maxCapacity: 6,
    duration: 120, // 2 hours
    items: [],
    extras: [],
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_clase_barista")
  },


];

// Reservas distribuidas entre los 3 negocios
export const mockBookings: Booking[] = [];



