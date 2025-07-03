// Datos mock de bundles
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Bundle } from '../types';

// IDs de shops para referencia
const shopMaxi = "shop_maxi";
const shopCafe = "shop_cafe";

export const mockBundles: Bundle[] = [
  // --- La vuelta del Maxi ---
  {
    id: "bundle_paris",
    name: "Alquiler París",
    description: "Alquiler de autos premium para recorrer París a tu ritmo.",
    shortDescription: "Incluye seguro y asistencia.",
    shopId: shopMaxi,
    items: [
      {
        id: "item_vw_jetta",
        title: "VW Jetta 2023",
        description: "Auto sedán premium, automático, aire acondicionado, GPS incluido.",
        price: 60,
        isForAdult: true,
        isPerGroup: true,
        bundleId: "bundle_paris",
        shopId: shopMaxi,
        bookingConfig: {
          maxCapacity: 5,
          duration: 180,
          requiresConfirmation: false,
          advanceBookingDays: 30,
          groupCapacity: 5,
          isExclusive: true
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            1: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] }, // Lunes
            2: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] }, // Martes
            3: { isAvailable: true, slots: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 2, isActive: true }] }, // Miércoles
            4: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] }, // Jueves
            5: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00', maxBookingsPerSlot: 2, isActive: true }] }, // Sábado
            0: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 30, sameDayBooking: true, lastMinuteBooking: true }
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
        title: "BMW X3 SUV",
        description: "SUV de lujo, tracción integral, asientos de cuero, ideal para familias.",
        price: 90,
        isForAdult: true,
        isPerGroup: true,
        bundleId: "bundle_paris",
        shopId: shopMaxi,
        bookingConfig: {
          maxCapacity: 5,
          duration: 180,
          requiresConfirmation: false,
          advanceBookingDays: 30,
          groupCapacity: 5,
          isExclusive: true
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            3: { isAvailable: true, slots: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 1, isActive: true }] }, // Miércoles
            5: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 1, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00', maxBookingsPerSlot: 1, isActive: true }] }, // Sábado
            0: { isAvailable: false, slots: [] },
            1: { isAvailable: false, slots: [] },
            2: { isAvailable: false, slots: [] },
            4: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 30, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 2,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: "extra_gps",
        title: "GPS Europa",
        description: "Navegador GPS con mapas de toda Europa actualizados.",
        price: 10,
        isForAdult: false,
        bundleId: "bundle_paris",
        shopId: shopMaxi,
        isPerGroup: true,
        maxQuantity: 1,
        isRequired: false,
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      },
      {
        id: "extra_seguro",
        title: "Seguro Premium",
        description: "Cobertura total contra daños y robo.",
        price: 25,
        isForAdult: false,
        bundleId: "bundle_paris",
        shopId: shopMaxi,
        isPerGroup: true,
        maxQuantity: 1,
        isRequired: false,
        isActive: true,
        order: 2,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 120,
    maxCapacity: 5,
    duration: 1440,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 24h antes",
      refundPolicy: "Reembolso total hasta 24h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800"],
    tags: ["auto", "viaje", "premium"],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_escaperoom",
    name: "Escape Room Misión Egipcia",
    description: "Vive la experiencia de un escape room temático con enigmas y desafíos.",
    shortDescription: "Ideal para grupos y familias.",
    shopId: shopMaxi,
    items: [
      {
        id: "item_mision_egipcia",
        title: "Sala Misión Egipcia",
        description: "Resuelve los misterios del antiguo Egipto en 90 minutos.",
        price: 80,
        isForAdult: false,
        isPerGroup: true,
        bundleId: "bundle_escaperoom",
        shopId: shopMaxi,
        bookingConfig: {
          maxCapacity: 8,
          duration: 90,
          requiresConfirmation: true,
          advanceBookingDays: 15,
          groupCapacity: 8,
          isExclusive: true
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            5: { isAvailable: true, slots: [{ startTime: '18:00', endTime: '19:30', maxBookingsPerSlot: 1, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '18:00', endTime: '19:30', maxBookingsPerSlot: 1, isActive: true }] }, // Sábado
            0: { isAvailable: false, slots: [] },
            1: { isAvailable: false, slots: [] },
            2: { isAvailable: false, slots: [] },
            3: { isAvailable: false, slots: [] },
            4: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 15, sameDayBooking: false, lastMinuteBooking: false }
        },
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: "extra_certificado",
        title: "Certificado de Escape",
        description: "Certificado impreso para cada participante.",
        price: 5,
        isForAdult: false,
        bundleId: "bundle_escaperoom",
        shopId: shopMaxi,
        isPerGroup: false,
        maxQuantity: 8,
        isRequired: false,
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 80,
    maxCapacity: 8,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: false,
      requiresApproval: true,
      cancellationPolicy: "No reembolsable 12h antes",
      refundPolicy: "Reembolso parcial según política"
    },
    imageUrls: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800"],
    tags: ["escape", "juego", "familia"],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_spa",
    name: "Spa Day con Aromaterapia",
    description: "Jornada de spa con masajes, sauna y aromaterapia.",
    shortDescription: "Relajación total para cuerpo y mente.",
    shopId: shopMaxi,
    items: [
      {
        id: "item_masaje",
        title: "Masaje Relajante",
        description: "Sesión de masaje de 60 minutos con aceites esenciales.",
        price: 50,
        isForAdult: true,
        isPerGroup: false,
        bundleId: "bundle_spa",
        shopId: shopMaxi,
        bookingConfig: {
          maxCapacity: 2,
          duration: 60,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            2: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2, isActive: true }] }, // Martes
            3: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2, isActive: true }] }, // Miércoles
            4: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2, isActive: true }] }, // Jueves
            5: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 2, isActive: true }] }, // Sábado
            0: { isAvailable: false, slots: [] },
            1: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
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
        description: "Sesión de sauna de 30 minutos, incluye toalla y agua mineral.",
        price: 30,
        isForAdult: true,
        isPerGroup: false,
        bundleId: "bundle_spa",
        shopId: shopMaxi,
        bookingConfig: {
          maxCapacity: 4,
          duration: 30,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            2: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4, isActive: true }] }, // Martes
            3: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4, isActive: true }] }, // Miércoles
            4: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4, isActive: true }] }, // Jueves
            5: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '12:00', maxBookingsPerSlot: 4, isActive: true }] }, // Sábado
            0: { isAvailable: false, slots: [] },
            1: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 2,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: "extra_aromaterapia",
        title: "Aromaterapia Premium",
        description: "Aceites esenciales y fragancias para una experiencia única.",
        price: 20,
        isForAdult: false,
        bundleId: "bundle_spa",
        shopId: shopMaxi,
        isPerGroup: false,
        maxQuantity: 2,
        isRequired: false,
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 150,
    maxCapacity: 4,
    duration: 180,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 48h antes",
      refundPolicy: "Reembolso total hasta 48h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"],
    tags: ["spa", "relax", "salud"],
    isActive: true,
    isFeatured: false,
    order: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Café Delicias ---
  {
    id: "bundle_brunch",
    name: "Brunch Especial",
    description: "Disfruta de un brunch gourmet con opciones continentales y americanas.",
    shortDescription: "Incluye bebida y postre.",
    shopId: shopCafe,
    items: [
      {
        id: "item_continental",
        title: "Desayuno Continental",
        description: "Café, jugo, tostadas, mermelada y frutas frescas.",
        price: 18,
        isForAdult: false,
        isPerGroup: false,
        bundleId: "bundle_brunch",
        shopId: shopCafe,
        bookingConfig: {
          maxCapacity: 10,
          duration: 60,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            0: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Domingo
            1: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Lunes
            2: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Martes
            3: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Miércoles
            4: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Jueves
            5: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00', maxBookingsPerSlot: 10, isActive: true }] }
          },
          bookingLimits: { minAdvanceHours: 1, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
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
        description: "Huevos revueltos, bacon, pancakes y café americano.",
        price: 22,
        isForAdult: false,
        isPerGroup: false,
        bundleId: "bundle_brunch",
        shopId: shopCafe,
        bookingConfig: {
          maxCapacity: 10,
          duration: 60,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            0: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Domingo
            1: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Lunes
            2: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Martes
            3: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Miércoles
            4: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Jueves
            5: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }, // Viernes
            6: { isAvailable: true, slots: [{ startTime: '11:00', endTime: '12:00', maxBookingsPerSlot: 10, isActive: true }] }
          },
          bookingLimits: { minAdvanceHours: 1, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 2,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: "extra_mimosa",
        title: "Copa de Mimosa",
        description: "Bebida de jugo de naranja y espumante.",
        price: 6,
        isForAdult: true,
        bundleId: "bundle_brunch",
        shopId: shopCafe,
        isPerGroup: false,
        maxQuantity: 5,
        isRequired: false,
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 35,
    maxCapacity: 20,
    duration: 120,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 2h antes",
      refundPolicy: "Reembolso total hasta 2h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
    tags: ["brunch", "café", "gourmet"],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_tarde_cafe",
    name: "Tarde de Café y Postres",
    description: "Merienda con selección de cafés y postres artesanales.",
    shortDescription: "Ideal para compartir.",
    shopId: shopCafe,
    items: [
      {
        id: "item_cafe_gourmet",
        title: "Café Gourmet",
        description: "Selección de cafés especiales de origen.",
        price: 8,
        isForAdult: false,
        isPerGroup: false,
        bundleId: "bundle_tarde_cafe",
        shopId: shopCafe,
        bookingConfig: {
          maxCapacity: 15,
          duration: 30,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '16:00', endTime: '16:30', maxBookingsPerSlot: 15, isActive: true }] }, // Sábado
            0: { isAvailable: true, slots: [{ startTime: '16:00', endTime: '16:30', maxBookingsPerSlot: 15, isActive: true }] }, // Domingo
            1: { isAvailable: false, slots: [] },
            2: { isAvailable: false, slots: [] },
            3: { isAvailable: false, slots: [] },
            4: { isAvailable: false, slots: [] },
            5: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 1, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
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
        title: "Combo de Postres",
        description: "Variedad de postres artesanales para compartir.",
        price: 12,
        isForAdult: false,
        isPerGroup: false,
        bundleId: "bundle_tarde_cafe",
        shopId: shopCafe,
        bookingConfig: {
          maxCapacity: 15,
          duration: 30,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 1,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 15, isActive: true }] }, // Sábado
            0: { isAvailable: true, slots: [{ startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 15, isActive: true }] }, // Domingo
            1: { isAvailable: false, slots: [] },
            2: { isAvailable: false, slots: [] },
            3: { isAvailable: false, slots: [] },
            4: { isAvailable: false, slots: [] },
            5: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 1, maxAdvanceDays: 7, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 2,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: "extra_combo_postres",
        title: "Combo de Postres",
        description: "Incluye 3 postres a elección.",
        price: 15,
        isForAdult: false,
        bundleId: "bundle_tarde_cafe",
        shopId: shopCafe,
        isPerGroup: false,
        maxQuantity: 3,
        isRequired: false,
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 20,
    maxCapacity: 15,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 1h antes",
      refundPolicy: "Reembolso total hasta 1h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=800"],
    tags: ["café", "postre", "merienda"],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  }
]; 