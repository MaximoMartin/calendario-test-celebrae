// Datos mock de bundles
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Bundle } from '../types';

// IDs de shops para referencia
const shopMaxi = "shop_maxi";
const shopCafe = "shop_cafe";

export const mockBundles: Bundle[] = [
  // --- Bundles para La vuelta del Maxi ---
  {
    id: 'bundle_auto_premium',
    name: 'Alquiler Auto Premium',
    description: 'Alquiler de autos de alta gama con seguro y asistencia.',
    shortDescription: 'Incluye seguro total y asistencia 24h.',
    shopId: 'shop_maxi',
    items: [
      {
        id: 'item_bmw_x5',
        title: 'BMW X5 2024',
        description: 'SUV de lujo, automático, GPS, aire acondicionado.',
        price: 120,
        isForAdult: true,
        isPerGroup: true,
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
            1: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] },
            2: { isAvailable: true, slots: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 2, isActive: true }] },
            3: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] },
            4: { isAvailable: true, slots: [{ startTime: '14:00', endTime: '17:00', maxBookingsPerSlot: 2, isActive: true }] },
            5: { isAvailable: true, slots: [{ startTime: '09:00', endTime: '12:00', maxBookingsPerSlot: 2, isActive: true }] },
            6: { isAvailable: false, slots: [] },
            0: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 30, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'item_audi_a4',
        title: 'Audi A4 2023',
        description: 'Sedán premium, automático, asientos de cuero.',
        price: 100,
        isForAdult: true,
        isPerGroup: true,
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
            1: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00', maxBookingsPerSlot: 2, isActive: true }] },
            2: { isAvailable: true, slots: [{ startTime: '15:00', endTime: '18:00', maxBookingsPerSlot: 2, isActive: true }] },
            3: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00', maxBookingsPerSlot: 2, isActive: true }] },
            4: { isAvailable: true, slots: [{ startTime: '15:00', endTime: '18:00', maxBookingsPerSlot: 2, isActive: true }] },
            5: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '13:00', maxBookingsPerSlot: 2, isActive: true }] },
            6: { isAvailable: false, slots: [] },
            0: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 30, sameDayBooking: true, lastMinuteBooking: true }
        },
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: 'extra_gps',
        title: 'GPS Integrado',
        description: 'Navegador GPS con mapas actualizados.',
        price: 10,
        isForAdult: false,
        isPerGroup: true,
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'extra_seguro',
        title: 'Seguro Total',
        description: 'Cobertura total contra accidentes y robos.',
        price: 25,
        isForAdult: false,
        isPerGroup: true,
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'extra_silla_bebe',
        title: 'Silla para Bebé',
        description: 'Silla de seguridad homologada para niños.',
        price: 8,
        isForAdult: false,
        isPerGroup: false,
        isActive: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 50,
    maxCapacity: 5,
    duration: 180,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes',
      refundPolicy: 'Reembolso total hasta 24 horas antes'
    },
    imageUrls: [],
    tags: ['autos', 'premium', 'alquiler'],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    deletedAt: null
  },
  {
    id: 'bundle_escaperoom',
    name: 'Escape Room Misión Egipcia',
    description: 'Desafía tu mente y resuelve enigmas en la tumba del faraón.',
    shortDescription: 'Juego de escape para grupos.',
    shopId: 'shop_maxi',
    items: [
      {
        id: 'item_mision_egipcia',
        title: 'Sala Misión Egipcia',
        description: 'Sala temática con enigmas y acertijos de la antigua Egipto.',
        price: 80,
        isForAdult: false,
        isPerGroup: true,
        bookingConfig: {
          maxCapacity: 6,
          duration: 90,
          requiresConfirmation: false,
          advanceBookingDays: 14,
          groupCapacity: 6,
          isExclusive: true
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            5: { isAvailable: true, slots: [{ startTime: '18:00', endTime: '19:30', maxBookingsPerSlot: 1, isActive: true }] },
            6: { isAvailable: true, slots: [{ startTime: '16:00', endTime: '17:30', maxBookingsPerSlot: 1, isActive: true }] },
            0: { isAvailable: false, slots: [] },
            1: { isAvailable: false, slots: [] },
            2: { isAvailable: false, slots: [] },
            3: { isAvailable: false, slots: [] },
            4: { isAvailable: false, slots: [] }
          },
          bookingLimits: { minAdvanceHours: 2, maxAdvanceDays: 14, sameDayBooking: false, lastMinuteBooking: false }
        },
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: 'extra_certificado',
        title: 'Certificado de Escape',
        description: 'Certificado digital para los ganadores.',
        price: 5,
        isForAdult: false,
        isPerGroup: true,
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 40,
    maxCapacity: 6,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: false,
      requiresApproval: true,
      cancellationPolicy: 'Cancelación gratuita hasta 48 horas antes',
      refundPolicy: 'Reembolso total hasta 48 horas antes'
    },
    imageUrls: [],
    tags: ['escape room', 'juego', 'grupo'],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    deletedAt: null
  },
  // --- Bundles para Café Delicias ---
  {
    id: 'bundle_brunch_gourmet',
    name: 'Brunch Gourmet',
    description: 'Desayuno y brunch con productos artesanales y café de especialidad.',
    shortDescription: 'Incluye café, jugo y selección de pastelería.',
    shopId: 'shop_cafe',
    items: [
      {
        id: 'item_brunch_continental',
        title: 'Brunch Continental',
        description: 'Café, jugo de naranja, croissant, frutas frescas.',
        price: 18,
        isForAdult: false,
        isPerGroup: false,
        bookingConfig: {
          maxCapacity: 4,
          duration: 90,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 4,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:30', maxBookingsPerSlot: 4, isActive: true }] },
            0: { isAvailable: true, slots: [{ startTime: '10:00', endTime: '11:30', maxBookingsPerSlot: 4, isActive: true }] },
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'item_brunch_americano',
        title: 'Brunch Americano',
        description: 'Huevos revueltos, bacon, pancakes, café americano.',
        price: 22,
        isForAdult: false,
        isPerGroup: false,
        bookingConfig: {
          maxCapacity: 4,
          duration: 90,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 4,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '13:00', maxBookingsPerSlot: 4, isActive: true }] },
            0: { isAvailable: true, slots: [{ startTime: '11:30', endTime: '13:00', maxBookingsPerSlot: 4, isActive: true }] },
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: 'extra_mimosa',
        title: 'Copa de Mimosa',
        description: 'Bebida de espumante y jugo de naranja.',
        price: 6,
        isForAdult: true,
        isPerGroup: false,
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'extra_combo_postres',
        title: 'Combo de Postres',
        description: 'Selección de mini postres artesanales.',
        price: 15,
        isForAdult: false,
        isPerGroup: false,
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 10,
    maxCapacity: 8,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: 'Cancelación gratuita hasta 2 horas antes',
      refundPolicy: 'Reembolso total hasta 2 horas antes'
    },
    imageUrls: [],
    tags: ['brunch', 'café', 'desayuno'],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    deletedAt: null
  },
  {
    id: 'bundle_tarde_cafe',
    name: 'Tarde de Café y Postres',
    description: 'Experiencia de café de especialidad y selección de postres.',
    shortDescription: 'Incluye café gourmet y postres artesanales.',
    shopId: 'shop_cafe',
    items: [
      {
        id: 'item_cafe_gourmet',
        title: 'Café Gourmet',
        description: 'Café de especialidad preparado por baristas.',
        price: 8,
        isForAdult: false,
        isPerGroup: false,
        bookingConfig: {
          maxCapacity: 2,
          duration: 30,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 2,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '16:00', endTime: '16:30', maxBookingsPerSlot: 2, isActive: true }] },
            0: { isAvailable: true, slots: [{ startTime: '16:00', endTime: '16:30', maxBookingsPerSlot: 2, isActive: true }] },
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      },
      {
        id: 'item_postres',
        title: 'Selección de Postres',
        description: 'Variedad de postres artesanales y pastelería.',
        price: 12,
        isForAdult: false,
        isPerGroup: false,
        bookingConfig: {
          maxCapacity: 4,
          duration: 30,
          requiresConfirmation: false,
          advanceBookingDays: 7,
          groupCapacity: 4,
          isExclusive: false
        },
        timeSlots: {
          scheduleType: 'FIXED',
          weeklySchedule: {
            6: { isAvailable: true, slots: [{ startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 4, isActive: true }] },
            0: { isAvailable: true, slots: [{ startTime: '16:30', endTime: '17:00', maxBookingsPerSlot: 4, isActive: true }] },
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    extras: [
      {
        id: 'extra_combo_postres',
        title: 'Combo de Postres',
        description: 'Selección de mini postres artesanales.',
        price: 15,
        isForAdult: false,
        isPerGroup: false,
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deletedAt: null
      }
    ],
    basePrice: 5,
    maxCapacity: 6,
    duration: 60,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: 'Cancelación gratuita hasta 2 horas antes',
      refundPolicy: 'Reembolso total hasta 2 horas antes'
    },
    imageUrls: [],
    tags: ['café', 'postres', 'tarde'],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    deletedAt: null
  }
]; 