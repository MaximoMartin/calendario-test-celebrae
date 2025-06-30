// Datos mock de items
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Item } from '../types';

// IDs de bundles para referencia
const bundleParis = "bundle_paris";
const bundleEscapeRoom = "bundle_escaperoom";
const bundleSpa = "bundle_spa";
const bundleBrunch = "bundle_brunch";
const bundleTardeCafe = "bundle_tarde_cafe";

// IDs de shops para referencia
const shopMaxi = "shop_maxi";
const shopCafe = "shop_cafe";

// Función helper para crear horarios completos
const createWeeklySchedule = (availableDays: Record<number, Array<{ startTime: string; endTime: string; maxBookingsPerSlot: number }>>) => {
  const schedule: Record<number, { isAvailable: boolean; slots: Array<{ startTime: string; endTime: string; maxBookingsPerSlot: number; isActive: boolean }> }> = {};
  
  for (let day = 0; day <= 6; day++) {
    if (availableDays[day]) {
      schedule[day] = {
        isAvailable: true,
        slots: availableDays[day].map(slot => ({
          ...slot,
          isActive: true
        }))
      };
    } else {
      schedule[day] = {
        isAvailable: false,
        slots: []
      };
    }
  }
  
  return schedule;
};

export const mockItems: Item[] = [
  // --- Alquiler París ---
  {
    id: "item_vw_jetta",
    title: "VW Jetta",
    description: "Sedán cómodo, ideal para recorrer la ciudad.",
    price: 60,
    isForAdult: true,
    bundleId: bundleParis,
    shopId: shopMaxi,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 5,
      duration: 1440,
      requiresConfirmation: false,
      advanceBookingDays: 30
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: createWeeklySchedule({
        1: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 5 }], // Lunes
        2: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 5 }], // Martes
        3: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 5 }], // Miércoles
        4: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 5 }], // Jueves
        5: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 5 }], // Viernes
        6: [{ startTime: '10:00', endTime: '14:00', maxBookingsPerSlot: 5 }]  // Sábado
      }),
      bookingLimits: {
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "item_bmw_x3",
    title: "BMW X3 Premium",
    description: "SUV de lujo para una experiencia superior.",
    price: 90,
    isForAdult: true,
    bundleId: bundleParis,
    shopId: shopMaxi,
    isPerGroup: true,
    bookingConfig: {
      maxCapacity: 5,
      duration: 1440,
      requiresConfirmation: false,
      advanceBookingDays: 30,
      groupCapacity: 5,
      isExclusive: true
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: createWeeklySchedule({
        3: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 3 }], // Miércoles
        5: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 3 }]  // Viernes
      }),
      bookingLimits: {
        minAdvanceHours: 24,
        maxAdvanceDays: 30,
        sameDayBooking: false,
        lastMinuteBooking: false
      }
    },
    isActive: true,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Escape Room ---
  {
    id: "item_mision_egipcia",
    title: "Juego Misión Egipcia",
    description: "Resuelve enigmas y escapa de la pirámide.",
    price: 80,
    isForAdult: true,
    bundleId: bundleEscapeRoom,
    shopId: shopMaxi,
    isPerGroup: true,
    bookingConfig: {
      maxCapacity: 8,
      duration: 90,
      requiresConfirmation: true,
      advanceBookingDays: 15,
      groupCapacity: 8,
      isExclusive: true
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: createWeeklySchedule({
        5: [ // Viernes
          { startTime: '18:00', endTime: '19:30', maxBookingsPerSlot: 2 }
        ],
        6: [ // Sábado
          { startTime: '15:00', endTime: '16:30', maxBookingsPerSlot: 2 },
          { startTime: '18:00', endTime: '19:30', maxBookingsPerSlot: 2 }
        ]
      }),
      bookingLimits: {
        minAdvanceHours: 12,
        maxAdvanceDays: 15,
        sameDayBooking: false,
        lastMinuteBooking: false
      }
    },
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Spa Day ---
  {
    id: "item_masaje",
    title: "Masaje Relajante",
    description: "Masaje de 60 minutos con aceites esenciales.",
    price: 50,
    isForAdult: true,
    bundleId: bundleSpa,
    shopId: shopMaxi,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 2,
      duration: 60,
      requiresConfirmation: false,
      advanceBookingDays: 10
    },
    timeSlots: {
      scheduleType: 'FLEXIBLE' as const,
      flexibleConfig: {
        startHour: 10,
        endHour: 18,
        slotDuration: 60,
        intervalMinutes: 30,
        maxBookingsPerSlot: 2,
        bufferMinutes: 15
      },
      weeklySchedule: createWeeklySchedule({
        2: [ // Martes
          { startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2 },
          { startTime: '14:00', endTime: '15:00', maxBookingsPerSlot: 2 },
          { startTime: '16:00', endTime: '17:00', maxBookingsPerSlot: 2 }
        ],
        4: [ // Jueves
          { startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2 },
          { startTime: '14:00', endTime: '15:00', maxBookingsPerSlot: 2 },
          { startTime: '16:00', endTime: '17:00', maxBookingsPerSlot: 2 }
        ]
      }),
      bookingLimits: {
        minAdvanceHours: 2,
        maxAdvanceDays: 10,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "item_sauna",
    title: "Sauna Finlandesa",
    description: "Sesión de sauna para eliminar toxinas.",
    price: 30,
    isForAdult: true,
    bundleId: bundleSpa,
    shopId: shopMaxi,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 4,
      duration: 30,
      requiresConfirmation: false,
      advanceBookingDays: 10
    },
    timeSlots: {
      scheduleType: 'FLEXIBLE' as const,
      flexibleConfig: {
        startHour: 11,
        endHour: 17,
        slotDuration: 30,
        intervalMinutes: 15,
        maxBookingsPerSlot: 4,
        bufferMinutes: 10
      },
      weeklySchedule: createWeeklySchedule({
        2: [ // Martes
          { startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4 },
          { startTime: '14:30', endTime: '15:00', maxBookingsPerSlot: 4 },
          { startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 4 }
        ]
      }),
      bookingLimits: {
        minAdvanceHours: 1,
        maxAdvanceDays: 10,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Brunch Especial ---
  {
    id: "item_continental",
    title: "Desayuno Continental",
    description: "Café, jugo, medialunas y frutas frescas.",
    price: 18,
    isForAdult: true,
    bundleId: bundleBrunch,
    shopId: shopCafe,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 10,
      duration: 60,
      requiresConfirmation: false,
      advanceBookingDays: 7
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: {
        0: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Domingo
        1: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Lunes
        2: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Martes
        3: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Miércoles
        4: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Jueves
        5: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Viernes
        6: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Sábado
      },
      bookingLimits: {
        minAdvanceHours: 2,
        maxAdvanceDays: 7,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "item_americano",
    title: "Desayuno Americano",
    description: "Huevos, bacon, pancakes y café.",
    price: 22,
    isForAdult: true,
    bundleId: bundleBrunch,
    shopId: shopCafe,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 10,
      duration: 60,
      requiresConfirmation: false,
      advanceBookingDays: 7
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: {
        0: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Domingo
        1: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Lunes
        2: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Martes
        3: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Miércoles
        4: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Jueves
        5: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Viernes
        6: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Sábado
      },
      bookingLimits: {
        minAdvanceHours: 2,
        maxAdvanceDays: 7,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Tarde de Café ---
  {
    id: "item_cafe_gourmet",
    title: "Café Gourmet",
    description: "Selección de cafés especiales.",
    price: 8,
    isForAdult: true,
    bundleId: bundleTardeCafe,
    shopId: shopCafe,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 15,
      duration: 30,
      requiresConfirmation: false,
      advanceBookingDays: 5
    },
    timeSlots: {
      scheduleType: 'CONTINUOUS' as const,
      continuousConfig: {
        slotDuration: 30,
        intervalMinutes: 30,
        maxBookingsPerSlot: 15,
        bufferMinutes: 5
      },
      weeklySchedule: createWeeklySchedule({
        6: [ // Sábado
          { startTime: '16:00', endTime: '16:30', maxBookingsPerSlot: 15 },
          { startTime: '17:00', endTime: '17:30', maxBookingsPerSlot: 15 },
          { startTime: '18:00', endTime: '18:30', maxBookingsPerSlot: 15 }
        ]
      }),
      bookingLimits: {
        minAdvanceHours: 1,
        maxAdvanceDays: 5,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "item_postres",
    title: "Postres Artesanales",
    description: "Variedad de postres caseros.",
    price: 12,
    isForAdult: true,
    bundleId: bundleTardeCafe,
    shopId: shopCafe,
    isPerGroup: false,
    bookingConfig: {
      maxCapacity: 15,
      duration: 30,
      requiresConfirmation: false,
      advanceBookingDays: 5
    },
    timeSlots: {
      scheduleType: 'FIXED' as const,
      weeklySchedule: createWeeklySchedule({
        6: [ // Sábado
          { startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 15 },
          { startTime: '17:30', endTime: '18:00', maxBookingsPerSlot: 15 },
          { startTime: '18:30', endTime: '19:00', maxBookingsPerSlot: 15 }
        ]
      }),
      bookingLimits: {
        minAdvanceHours: 1,
        maxAdvanceDays: 5,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    },
    isActive: true,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  }
]; 