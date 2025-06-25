// ========================================
// DATOS MOCK REALISTAS - FECHA: 25/06/2025
// ========================================

import type { 
  User, Shop, Bundle, BundleItem, BundleExtra, ShopResource, 
  Booking, ItemBooking, ExtraBooking, ResourceAllocation,
  BusinessHours, BookingSettings, ShopException,
  ItemTimeSlot, ItemResourceRequirement
} from '../types/newModel';

// ========================================
// USUARIO BASE
// ========================================

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "BUYER", "ADMIN", "ESSENTIAL"],
  phoneNumber: "3515050672"
};

// ========================================
// CONFIGURACIONES COMUNES
// ========================================

export const mockBusinessHours: BusinessHours[] = [
  { dayOfWeek: 1, isActive: true, periods: [{ startTime: "09:00", endTime: "18:00" }] }, // Lunes
  { dayOfWeek: 2, isActive: true, periods: [{ startTime: "09:00", endTime: "18:00" }] }, // Martes
  { dayOfWeek: 3, isActive: true, periods: [{ startTime: "09:00", endTime: "18:00" }] }, // Miércoles
  { dayOfWeek: 4, isActive: true, periods: [{ startTime: "09:00", endTime: "18:00" }] }, // Jueves
  { dayOfWeek: 5, isActive: true, periods: [{ startTime: "09:00", endTime: "18:00" }] }, // Viernes
  { dayOfWeek: 6, isActive: true, periods: [{ startTime: "10:00", endTime: "20:00" }] }, // Sábado
  { dayOfWeek: 0, isActive: true, periods: [{ startTime: "10:00", endTime: "18:00" }] }, // Domingo
];

export const mockBookingSettings: BookingSettings = {
  hoursBeforeBooking: 24,
  maxAdvanceBookingDays: 60,
  allowSameDayBooking: false,
  autoConfirmBookings: false,
  requiresPhoneVerification: true,
  maxSimultaneousBookings: 3
};

// ========================================
// NEGOCIO 1: BISTRÓ GOURMET "SABORES DE CÓRDOBA"
// ========================================

export const bistroResources: ShopResource[] = [
  {
    id: "res_chef_martin",
    shopId: "shop_bistro",
    name: "Chef Martín Rodriguez",
    type: "PERSON",
    capacity: 16,
    isActive: true,
    description: "Chef ejecutivo especializado en cocina regional argentina",
    constraints: {
      minAdvanceBooking: 120,
      maxUsageTime: 180,
      cleaningTime: 30
    }
  },
  {
    id: "res_sommelier_ana",
    shopId: "shop_bistro", 
    name: "Ana Gutierrez - Sommelier",
    type: "PERSON",
    capacity: 20,
    isActive: true,
    description: "Sommelier certificada especialista en vinos argentinos"
  },
  {
    id: "res_private_room",
    shopId: "shop_bistro",
    name: "Salón Privado",
    type: "ROOM",
    capacity: 12,
    isActive: true,
    description: "Salón privado con vista al patio, ideal para eventos especiales",
    constraints: {
      cleaningTime: 60
    }
  },
  {
    id: "res_main_kitchen",
    shopId: "shop_bistro",
    name: "Cocina Principal",
    type: "ROOM", 
    capacity: 1,
    isActive: true,
    description: "Cocina profesional completamente equipada"
  }
];

export const shopBistro: Shop = {
  id: "shop_bistro",
  name: "Sabores de Córdoba",
  address: "Av. Rafael Núñez 4850, Córdoba Capital",
  shopStatus: "ENABLED",
  userId: "87IZYWdezwJQsILiU57z",
  businessHours: mockBusinessHours,
  bookingSettings: mockBookingSettings,
  resources: bistroResources,
  exceptions: []
};

// Bundle: Experiencia Gastronómica Regional
export const bistroBundle: Bundle = {
  id: "bundle_gastronomic_experience",
  name: "Experiencia Gastronómica Regional",
  description: "Un viaje culinario por los sabores auténticos de Córdoba con maridaje incluido",
  category: "EXPERIENCE",
  shopId: "shop_bistro",
  basePrice: 89,
  maxCapacity: 12,
  isActive: true,
  items: [
    {
      id: "item_welcome_cocktail",
      bundleId: "bundle_gastronomic_experience",
      name: "Cóctel de Bienvenida",
      description: "Fernet con coca artesanal y picadas regionales",
      price: 18,
      maxCapacity: 12,
      duration: 45,
      position: 1,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_cocktail_evening",
          itemId: "item_welcome_cocktail",
          startTime: "19:30",
          endTime: "20:15",
          daysOfWeek: [5, 6], // Viernes y Sábado
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "EASY", isPopular: true }
        }
      ],
      requiredResources: [
        {
          id: "req_cocktail_sommelier",
          itemId: "item_welcome_cocktail", 
          resourceId: "res_sommelier_ana",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -15, duration: 60 }
        }
      ],
      settings: {
        isBookableIndividually: false,
        minAdvanceBooking: 1440, // 24 horas
        maxAdvanceBookingDays: 30,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_main_course",
      bundleId: "bundle_gastronomic_experience", 
      name: "Plato Principal Regional",
      description: "Locro, empanadas o cabrito con guarniciones tradicionales",
      price: 45,
      maxCapacity: 12,
      duration: 75,
      position: 2,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_main_evening",
          itemId: "item_main_course",
          startTime: "20:30",
          endTime: "21:45",
          daysOfWeek: [5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "MEDIUM" }
        }
      ],
      requiredResources: [
        {
          id: "req_main_chef",
          itemId: "item_main_course",
          resourceId: "res_chef_martin",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 105 }
        },
        {
          id: "req_main_kitchen",
          itemId: "item_main_course",
          resourceId: "res_main_kitchen", 
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 105 }
        }
      ],
      settings: {
        isBookableIndividually: false,
        minAdvanceBooking: 1440,
        maxAdvanceBookingDays: 30,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_dessert_wine",
      bundleId: "bundle_gastronomic_experience",
      name: "Postre y Vino de Cierre",
      description: "Postre casero con vino dulce regional y charla sobre maridajes",
      price: 26,
      maxCapacity: 12,
      duration: 45,
      position: 3,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_dessert_evening", 
          itemId: "item_dessert_wine",
          startTime: "22:00",
          endTime: "22:45",
          daysOfWeek: [5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "EASY" }
        }
      ],
      requiredResources: [
        {
          id: "req_dessert_sommelier",
          itemId: "item_dessert_wine",
          resourceId: "res_sommelier_ana",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 45 }
        }
      ],
      settings: {
        isBookableIndividually: false,
        minAdvanceBooking: 1440,
        maxAdvanceBookingDays: 30,
        allowSameDayBooking: false
      }
    }
  ],
  extras: [
    {
      id: "extra_private_room",
      bundleId: "bundle_gastronomic_experience",
      name: "Salón Privado",
      description: "Uso exclusivo del salón privado para tu grupo",
      price: 50,
      maxQuantity: 1,
      isActive: true,
      category: "UPGRADE",
      resourceRequirements: [
        {
          id: "req_extra_private",
          extraId: "extra_private_room",
          resourceId: "res_private_room",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 210 }
        }
      ]
    },
    {
      id: "extra_wine_pairing",
      bundleId: "bundle_gastronomic_experience",
      name: "Maridaje Premium",
      description: "Selección premium de 3 vinos para cada plato",
      price: 35,
      maxQuantity: 12,
      isActive: true,
      category: "UPGRADE"
    }
  ],
  settings: {
    allowPartialBooking: false,
    requiresSequentialBooking: true,
    advanceBookingDays: 30,
    cancellationPolicy: "Cancelación gratuita hasta 24hs antes"
  },
  createdAt: "2025-05-01T10:00:00Z",
  updatedAt: "2025-06-01T15:30:00Z"
};

// ========================================
// NEGOCIO 2: SPA WELLNESS "ARMONÍA TOTAL"
// ========================================

export const spaResources: ShopResource[] = [
  {
    id: "res_masseuse_sofia",
    shopId: "shop_spa",
    name: "Sofía Martinez - Masajista", 
    type: "PERSON",
    capacity: 1,
    isActive: true,
    description: "Masajista terapéutica especializada en técnicas orientales",
    constraints: {
      minAdvanceBooking: 60,
      maxUsageTime: 90,
      cleaningTime: 15
    }
  },
  {
    id: "res_masseuse_carlos",
    shopId: "shop_spa",
    name: "Carlos Ruiz - Terapeuta",
    type: "PERSON",
    capacity: 1,
    isActive: true,
    description: "Terapeuta holístico especializado en reflexología",
    constraints: {
      minAdvanceBooking: 60, 
      maxUsageTime: 90,
      cleaningTime: 15
    }
  },
  {
    id: "res_massage_room_1",
    shopId: "shop_spa",
    name: "Sala de Masajes Zen",
    type: "ROOM",
    capacity: 1,
    isActive: true,
    description: "Sala ambientada con música relajante y aromaterapia"
  },
  {
    id: "res_massage_room_2", 
    shopId: "shop_spa",
    name: "Sala de Masajes Lotus",
    type: "ROOM",
    capacity: 1,
    isActive: true,
    description: "Sala con vista al jardín y camilla de hidromasaje"
  },
  {
    id: "res_jacuzzi",
    shopId: "shop_spa",
    name: "Jacuzzi VIP",
    type: "EQUIPMENT",
    capacity: 4,
    isActive: true,
    description: "Jacuzzi privado con cromoterapia",
    constraints: {
      cleaningTime: 30
    }
  }
];

export const shopSpa: Shop = {
  id: "shop_spa",
  name: "Armonía Total Spa & Wellness",
  address: "Bv. Chacabuco 145, Nueva Córdoba",
  shopStatus: "ENABLED", 
  userId: "87IZYWdezwJQsILiU57z",
  businessHours: mockBusinessHours,
  bookingSettings: mockBookingSettings,
  resources: spaResources,
  exceptions: []
};

// Bundle: Día de Relajación Completa
export const spaBundle: Bundle = {
  id: "bundle_wellness_day",
  name: "Día de Relajación Completa",
  description: "Experiencia completa de bienestar: masajes, jacuzzi y relajación profunda",
  category: "SERVICE",
  shopId: "shop_spa",
  basePrice: 125,
  maxCapacity: 2,
  isActive: true,
  items: [
    {
      id: "item_welcome_therapy",
      bundleId: "bundle_wellness_day",
      name: "Terapia de Bienvenida",
      description: "Reflexología y aromaterapia para preparar el cuerpo",
      price: 35,
      maxCapacity: 2,
      duration: 45,
      position: 1,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_therapy_morning",
          itemId: "item_welcome_therapy",
          startTime: "10:00",
          endTime: "10:45", 
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "EASY" }
        },
        {
          id: "slot_therapy_afternoon",
          itemId: "item_welcome_therapy",
          startTime: "15:00",
          endTime: "15:45",
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "EASY" }
        }
      ],
      requiredResources: [
        {
          id: "req_therapy_carlos",
          itemId: "item_welcome_therapy",
          resourceId: "res_masseuse_carlos",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 45 }
        },
        {
          id: "req_therapy_room_1",
          itemId: "item_welcome_therapy",
          resourceId: "res_massage_room_1",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 45 }
        }
      ],
      settings: {
        isBookableIndividually: true,
        minAdvanceBooking: 720,
        maxAdvanceBookingDays: 21,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_deep_massage",
      bundleId: "bundle_wellness_day",
      name: "Masaje Relajante Profundo",
      description: "Masaje de 60 minutos con técnicas orientales y piedras calientes",
      price: 65,
      maxCapacity: 1,
      duration: 60,
      position: 2,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_massage_morning",
          itemId: "item_deep_massage", 
          startTime: "11:00",
          endTime: "12:00",
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "MEDIUM", isPopular: true }
        },
        {
          id: "slot_massage_afternoon",
          itemId: "item_deep_massage",
          startTime: "16:00", 
          endTime: "17:00",
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          maxBookings: 2,
          isActive: true,
          metadata: { difficulty: "MEDIUM" }
        }
      ],
      requiredResources: [
        {
          id: "req_massage_sofia",
          itemId: "item_deep_massage",
          resourceId: "res_masseuse_sofia",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -15, duration: 75 }
        },
        {
          id: "req_massage_room_2",
          itemId: "item_deep_massage",
          resourceId: "res_massage_room_2",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -15, duration: 75 }
        }
      ],
      settings: {
        isBookableIndividually: true,
        minAdvanceBooking: 720,
        maxAdvanceBookingDays: 21,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_jacuzzi_session",
      bundleId: "bundle_wellness_day",
      name: "Sesión de Jacuzzi VIP",
      description: "30 minutos de relajación en jacuzzi privado con cromoterapia",
      price: 25,
      maxCapacity: 2,
      duration: 30,
      position: 3,
      isRequired: false,
      timeSlots: [
        {
          id: "slot_jacuzzi_morning",
          itemId: "item_jacuzzi_session",
          startTime: "12:30",
          endTime: "13:00",
          daysOfWeek: [1, 2, 3, 4, 5, 6], 
          maxBookings: 1,
          isActive: true,
          metadata: { difficulty: "EASY" }
        },
        {
          id: "slot_jacuzzi_afternoon",
          itemId: "item_jacuzzi_session", 
          startTime: "17:30",
          endTime: "18:00",
          daysOfWeek: [1, 2, 3, 4, 5, 6],
          maxBookings: 1,
          isActive: true,
          metadata: { difficulty: "EASY" }
        }
      ],
      requiredResources: [
        {
          id: "req_jacuzzi_vip",
          itemId: "item_jacuzzi_session",
          resourceId: "res_jacuzzi",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 30 }
        }
      ],
      settings: {
        isBookableIndividually: true,
        minAdvanceBooking: 480,
        maxAdvanceBookingDays: 14,
        allowSameDayBooking: false
      }
    }
  ],
  extras: [
    {
      id: "extra_aromatherapy",
      bundleId: "bundle_wellness_day",
      name: "Aromaterapia Premium",
      description: "Aceites esenciales importados para una experiencia única",
      price: 20,
      maxQuantity: 2,
      isActive: true,
      category: "UPGRADE"
    },
    {
      id: "extra_healthy_snack",
      bundleId: "bundle_wellness_day", 
      name: "Snack Saludable",
      description: "Jugos naturales, frutas y frutos secos",
      price: 15,
      maxQuantity: 4,
      isActive: true,
      category: "ADDON"
    }
  ],
  settings: {
    allowPartialBooking: true,
    requiresSequentialBooking: false,
    advanceBookingDays: 21,
    cancellationPolicy: "Cancelación gratuita hasta 12hs antes"
  },
  createdAt: "2025-05-15T08:00:00Z",
  updatedAt: "2025-06-10T12:00:00Z"
};

// ========================================
// NEGOCIO 3: AVENTURA "CÓRDOBA EXTREMA"
// ========================================

export const adventureResources: ShopResource[] = [
  {
    id: "res_guide_pablo",
    shopId: "shop_adventure",
    name: "Pablo Mendez - Guía de Montaña", 
    type: "PERSON",
    capacity: 8,
    isActive: true,
    description: "Guía certificado en actividades de montaña y rappel",
    constraints: {
      minAdvanceBooking: 120,
      maxUsageTime: 300,
      cleaningTime: 60
    }
  },
  {
    id: "res_safety_equipment",
    shopId: "shop_adventure",
    name: "Equipamiento de Seguridad",
    type: "EQUIPMENT",
    capacity: 10,
    isActive: true,
    description: "Cascos, arneses, cuerdas y equipos de seguridad certificados"
  },
  {
    id: "res_transport_4x4",
    shopId: "shop_adventure",
    name: "Vehículo 4x4",
    type: "VEHICLE", 
    capacity: 8,
    isActive: true,
    description: "Toyota Land Cruiser equipado para acceso a montaña",
    constraints: {
      cleaningTime: 45
    }
  }
];

export const shopAdventure: Shop = {
  id: "shop_adventure",
  name: "Córdoba Extrema",
  address: "Base Cerro Uritorco, Capilla del Monte",
  shopStatus: "ENABLED",
  userId: "87IZYWdezwJQsILiU57z",
  businessHours: [
    { dayOfWeek: 1, isActive: true, periods: [{ startTime: "08:00", endTime: "17:00" }] },
    { dayOfWeek: 2, isActive: true, periods: [{ startTime: "08:00", endTime: "17:00" }] },
    { dayOfWeek: 3, isActive: true, periods: [{ startTime: "08:00", endTime: "17:00" }] },
    { dayOfWeek: 4, isActive: true, periods: [{ startTime: "08:00", endTime: "17:00" }] },
    { dayOfWeek: 5, isActive: true, periods: [{ startTime: "08:00", endTime: "17:00" }] },
    { dayOfWeek: 6, isActive: true, periods: [{ startTime: "07:00", endTime: "18:00" }] },
    { dayOfWeek: 0, isActive: true, periods: [{ startTime: "07:00", endTime: "18:00" }] },
  ],
  bookingSettings: {
    hoursBeforeBooking: 48,
    maxAdvanceBookingDays: 45,
    allowSameDayBooking: false,
    autoConfirmBookings: false,
    requiresPhoneVerification: true,
    maxSimultaneousBookings: 2
  },
  resources: adventureResources,
  exceptions: []
};

// Bundle: Aventura Extrema de Montaña
export const adventureBundle: Bundle = {
  id: "bundle_mountain_adventure",
  name: "Aventura Extrema de Montaña",
  description: "Día completo de adrenalina: trekking, rappel y tirolesa en las sierras de Córdoba",
  category: "EXPERIENCE",
  shopId: "shop_adventure",
  basePrice: 155,
  maxCapacity: 8,
  isActive: true,
  items: [
    {
      id: "item_mountain_trek",
      bundleId: "bundle_mountain_adventure",
      name: "Trekking Cerro Uritorco",
      description: "Ascenso guiado al cerro más místico de Argentina",
      price: 55,
      maxCapacity: 8,
      duration: 180, // 3 horas
      position: 1,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_trek_morning",
          itemId: "item_mountain_trek",
          startTime: "08:00",
          endTime: "11:00",
          daysOfWeek: [6, 0], // Sábado y Domingo
          maxBookings: 1,
          isActive: true,
          metadata: { difficulty: "HARD", isPopular: true }
        }
      ],
      requiredResources: [
        {
          id: "req_trek_guide",
          itemId: "item_mountain_trek",
          resourceId: "res_guide_pablo",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 210 }
        },
        {
          id: "req_trek_transport",
          itemId: "item_mountain_trek", 
          resourceId: "res_transport_4x4",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 240 }
        }
      ],
      settings: {
        isBookableIndividually: true,
        minAdvanceBooking: 2880, // 48 horas
        maxAdvanceBookingDays: 30,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_rappel_experience",
      bundleId: "bundle_mountain_adventure",
      name: "Rappel en Cascada",
      description: "Descenso en rappel por cascada natural de 25 metros",
      price: 65,
      maxCapacity: 8,
      duration: 120, // 2 horas
      position: 2,
      isRequired: true,
      timeSlots: [
        {
          id: "slot_rappel_afternoon",
          itemId: "item_rappel_experience",
          startTime: "13:00",
          endTime: "15:00",
          daysOfWeek: [6, 0],
          maxBookings: 1,
          isActive: true,
          metadata: { difficulty: "HARD" }
        }
      ],
      requiredResources: [
        {
          id: "req_rappel_guide",
          itemId: "item_rappel_experience",
          resourceId: "res_guide_pablo",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 150 }
        },
        {
          id: "req_rappel_equipment",
          itemId: "item_rappel_experience",
          resourceId: "res_safety_equipment",
          quantity: 8,
          isOptional: false,
          usageTime: { offsetStart: -30, duration: 150 }
        }
      ],
      settings: {
        isBookableIndividually: false,
        minAdvanceBooking: 2880,
        maxAdvanceBookingDays: 30,
        allowSameDayBooking: false
      }
    },
    {
      id: "item_zipline_final",
      bundleId: "bundle_mountain_adventure",
      name: "Tirolesa Extrema",
      description: "500 metros de tirolesa con vista panorámica de las sierras",
      price: 35,
      maxCapacity: 8,
      duration: 60,
      position: 3,
      isRequired: false,
      timeSlots: [
        {
          id: "slot_zipline_afternoon",
          itemId: "item_zipline_final",
          startTime: "15:30",
          endTime: "16:30",
          daysOfWeek: [6, 0],
          maxBookings: 1,
          isActive: true,
          metadata: { difficulty: "MEDIUM" }
        }
      ],
      requiredResources: [
        {
          id: "req_zipline_guide",
          itemId: "item_zipline_final",
          resourceId: "res_guide_pablo",
          quantity: 1,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 60 }
        },
        {
          id: "req_zipline_equipment",
          itemId: "item_zipline_final",
          resourceId: "res_safety_equipment",
          quantity: 8,
          isOptional: false,
          usageTime: { offsetStart: 0, duration: 60 }
        }
      ],
      settings: {
        isBookableIndividually: true,
        minAdvanceBooking: 1440,
        maxAdvanceBookingDays: 15,
        allowSameDayBooking: false
      }
    }
  ],
  extras: [
    {
      id: "extra_gopro_rental",
      bundleId: "bundle_mountain_adventure",
      name: "GoPro + Edición de Video",
      description: "Alquiler de GoPro con edición profesional del video de tu aventura",
      price: 45,
      maxQuantity: 4,
      isActive: true,
      category: "EQUIPMENT"
    },
    {
      id: "extra_lunch_mountain",
      bundleId: "bundle_mountain_adventure",
      name: "Almuerzo de Montaña",
      description: "Viandas nutritivas y energéticas para la aventura",
      price: 25,
      maxQuantity: 8,
      isActive: true,
      category: "SERVICE"
    }
  ],
  settings: {
    allowPartialBooking: true,
    requiresSequentialBooking: true,
    advanceBookingDays: 30,
    cancellationPolicy: "Cancelación gratuita hasta 48hs antes por clima"
  },
  createdAt: "2025-04-20T09:00:00Z",
  updatedAt: "2025-06-05T16:00:00Z"
};

// ========================================
// RESERVAS PARA FECHA ACTUAL: 25/06/2025
// ========================================

// Reserva 1: Experiencia Gastronómica (27/06/2025 - Viernes)
export const mockBooking1: Booking = {
  id: "booking_rodriguez_gastronomic",
  bundleId: "bundle_gastronomic_experience",
  bundleName: "Experiencia Gastronómica Regional",
  shopId: "shop_bistro",
  customerName: "Laura Rodriguez",
  customerEmail: "laura.rodriguez@gmail.com",
  customerPhone: "+54 9 351 234-5678",
  date: "2025-06-27", // Viernes cerca de la fecha actual
  status: "CONFIRMED",
  isManual: false,
  createdAt: "2025-06-20T10:30:00Z",
  notes: "Celebración de aniversario. Solicita mesa con vista al patio.",
  itemBookings: [
    {
      id: "ib_cocktail_rodriguez",
      bookingId: "booking_rodriguez_gastronomic",
      itemId: "item_welcome_cocktail",
      itemName: "Cóctel de Bienvenida",
      timeSlotId: "slot_cocktail_evening",
      startTime: "19:30",
      endTime: "20:15",
      numberOfPeople: 4,
      status: "CONFIRMED",
      resourceAllocations: [
        {
          id: "alloc_cocktail_sommelier",
          resourceId: "res_sommelier_ana",
          resourceName: "Ana Gutierrez - Sommelier",
          quantity: 1,
          startTime: "19:15",
          endTime: "20:15",
          isConfirmed: true,
          notes: "Preparar fernet premium para aniversario"
        }
      ],
      notes: "Pareja celebra 15 años de matrimonio"
    },
    {
      id: "ib_main_rodriguez",
      bookingId: "booking_rodriguez_gastronomic",
      itemId: "item_main_course",
      itemName: "Plato Principal Regional",
      timeSlotId: "slot_main_evening",
      startTime: "20:30",
      endTime: "21:45",
      numberOfPeople: 4,
      status: "CONFIRMED",
      resourceAllocations: [
        {
          id: "alloc_main_chef",
          resourceId: "res_chef_martin",
          resourceName: "Chef Martín Rodriguez",
          quantity: 1,
          startTime: "20:00",
          endTime: "22:15",
          isConfirmed: true
        },
        {
          id: "alloc_main_kitchen",
          resourceId: "res_main_kitchen",
          resourceName: "Cocina Principal",
          quantity: 1,
          startTime: "20:00",
          endTime: "22:15",
          isConfirmed: true
        }
      ]
    },
    {
      id: "ib_dessert_rodriguez",
      bookingId: "booking_rodriguez_gastronomic",
      itemId: "item_dessert_wine",
      itemName: "Postre y Vino de Cierre",
      timeSlotId: "slot_dessert_evening",
      startTime: "22:00",
      endTime: "22:45",
      numberOfPeople: 4,
      status: "CONFIRMED",
      resourceAllocations: [
        {
          id: "alloc_dessert_sommelier",
          resourceId: "res_sommelier_ana",
          resourceName: "Ana Gutierrez - Sommelier",
          quantity: 1,
          startTime: "22:00",
          endTime: "22:45",
          isConfirmed: true
        }
      ]
    }
  ],
  extraBookings: [
    {
      id: "eb_private_room",
      bookingId: "booking_rodriguez_gastronomic",
      extraId: "extra_private_room",
      extraName: "Salón Privado",
      quantity: 1,
      unitPrice: 50,
      resourceAllocations: [
        {
          id: "alloc_private_room",
          resourceId: "res_private_room",
          resourceName: "Salón Privado",
          quantity: 1,
          startTime: "19:00",
          endTime: "23:15",
          isConfirmed: true,
          notes: "Decorado especial para aniversario"
        }
      ]
    }
  ],
  pricing: {
    totalAmount: 189, // 89 base + 50 salón privado + extras
    paidAmount: 94.50, // 50% de seña
    refundAmount: 0,
    cancellationFee: 0
  }
};

// Reserva 2: Spa Wellness (26/06/2025 - Jueves)
export const mockBooking2: Booking = {
  id: "booking_gonzalez_wellness",
  bundleId: "bundle_wellness_day",
  bundleName: "Día de Relajación Completa",
  shopId: "shop_spa",
  customerName: "María González",
  customerEmail: "maria.gonzalez@outlook.com",
  customerPhone: "+54 9 351 345-6789",
  date: "2025-06-26", // Jueves
  status: "PENDING",
  isManual: true,
  createdAt: "2025-06-24T14:20:00Z",
  notes: "Cliente con estrés laboral. Primera vez en spa.",
  itemBookings: [
    {
      id: "ib_therapy_gonzalez",
      bookingId: "booking_gonzalez_wellness",
      itemId: "item_welcome_therapy",
      itemName: "Terapia de Bienvenida",
      timeSlotId: "slot_therapy_afternoon",
      startTime: "15:00",
      endTime: "15:45",
      numberOfPeople: 1,
      status: "PENDING",
      resourceAllocations: [
        {
          id: "alloc_therapy_carlos",
          resourceId: "res_masseuse_carlos",
          resourceName: "Carlos Ruiz - Terapeuta",
          quantity: 1,
          startTime: "15:00",
          endTime: "15:45",
          isConfirmed: false
        },
        {
          id: "alloc_therapy_room_1",
          resourceId: "res_massage_room_1",
          resourceName: "Sala de Masajes Zen",
          quantity: 1,
          startTime: "15:00",
          endTime: "15:45",
          isConfirmed: false
        }
      ]
    },
    {
      id: "ib_massage_gonzalez",
      bookingId: "booking_gonzalez_wellness",
      itemId: "item_deep_massage",
      itemName: "Masaje Relajante Profundo",
      timeSlotId: "slot_massage_afternoon",
      startTime: "16:00",
      endTime: "17:00",
      numberOfPeople: 1,
      status: "PENDING",
      resourceAllocations: [
        {
          id: "alloc_massage_sofia",
          resourceId: "res_masseuse_sofia",
          resourceName: "Sofía Martinez - Masajista",
          quantity: 1,
          startTime: "15:45",
          endTime: "17:15",
          isConfirmed: false
        },
        {
          id: "alloc_massage_room_2",
          resourceId: "res_massage_room_2",
          resourceName: "Sala de Masajes Lotus",
          quantity: 1,
          startTime: "15:45",
          endTime: "17:15",
          isConfirmed: false
        }
      ]
    }
  ],
  extraBookings: [
    {
      id: "eb_aromatherapy_gonzalez",
      bookingId: "booking_gonzalez_wellness",
      extraId: "extra_aromatherapy",
      extraName: "Aromaterapia Premium",
      quantity: 1,
      unitPrice: 20
    }
  ],
  pricing: {
    totalAmount: 120, // 35 + 65 + 20 aromatherapia
    paidAmount: 0, // Pendiente de confirmación
    refundAmount: 0,
    cancellationFee: 0
  }
};

// Reserva 3: Aventura Extrema (28/06/2025 - Sábado)
export const mockBooking3: Booking = {
  id: "booking_aventura_group",
  bundleId: "bundle_mountain_adventure",
  bundleName: "Aventura Extrema de Montaña",
  shopId: "shop_adventure",
  customerName: "Grupo Aventureros Unidos",
  customerEmail: "contacto@aventurerosunidos.com",
  customerPhone: "+54 9 351 456-7890",
  date: "2025-06-28", // Sábado
  status: "CONFIRMED",
  isManual: false,
  createdAt: "2025-06-15T09:45:00Z",
  notes: "Grupo corporativo - team building. 6 personas confirmadas.",
  itemBookings: [
    {
      id: "ib_trek_group",
      bookingId: "booking_aventura_group",
      itemId: "item_mountain_trek",
      itemName: "Trekking Cerro Uritorco",
      timeSlotId: "slot_trek_morning",
      startTime: "08:00",
      endTime: "11:00",
      numberOfPeople: 6,
      status: "CONFIRMED",
      resourceAllocations: [
        {
          id: "alloc_trek_guide_pablo",
          resourceId: "res_guide_pablo",
          resourceName: "Pablo Mendez - Guía de Montaña",
          quantity: 1,
          startTime: "07:30",
          endTime: "11:30",
          isConfirmed: true,
          notes: "Grupo con experiencia moderada en trekking"
        },
        {
          id: "alloc_trek_transport",
          resourceId: "res_transport_4x4",
          resourceName: "Vehículo 4x4",
          quantity: 1,
          startTime: "07:30",
          endTime: "12:00",
          isConfirmed: true
        }
      ]
    },
    {
      id: "ib_rappel_group",
      bookingId: "booking_aventura_group",
      itemId: "item_rappel_experience",
      itemName: "Rappel en Cascada",
      timeSlotId: "slot_rappel_afternoon",
      startTime: "13:00",
      endTime: "15:00",
      numberOfPeople: 6,
      status: "CONFIRMED",
      resourceAllocations: [
        {
          id: "alloc_rappel_guide_pablo",
          resourceId: "res_guide_pablo",
          resourceName: "Pablo Mendez - Guía de Montaña",
          quantity: 1,
          startTime: "12:30",
          endTime: "15:30",
          isConfirmed: true
        },
        {
          id: "alloc_rappel_equipment",
          resourceId: "res_safety_equipment",
          resourceName: "Equipamiento de Seguridad",
          quantity: 6,
          startTime: "12:30",
          endTime: "15:30",
          isConfirmed: true
        }
      ]
    }
  ],
  extraBookings: [
    {
      id: "eb_lunch_group",
      bookingId: "booking_aventura_group",
      extraId: "extra_lunch_mountain",
      extraName: "Almuerzo de Montaña",
      quantity: 6,
      unitPrice: 25
    },
    {
      id: "eb_gopro_group",
      bookingId: "booking_aventura_group",
      extraId: "extra_gopro_rental",
      extraName: "GoPro + Edición de Video",
      quantity: 2,
      unitPrice: 45
    }
  ],
  pricing: {
    totalAmount: 960, // (55+65)*6 + 150 almuerzo + 90 gopro
    paidAmount: 480, // 50% de seña
    refundAmount: 0,
    cancellationFee: 0
  }
};

// ========================================
// EXPORTACIONES FINALES
// ========================================

export const mockShops = [shopBistro, shopSpa, shopAdventure];
export const mockBundles = [bistroBundle, spaBundle, adventureBundle];
export const mockBookings = [mockBooking1, mockBooking2, mockBooking3];

// Para compatibilidad con demos existentes
export const mockShop = shopBistro;
export const mockBundle = bistroBundle;
export const mockBooking = mockBooking1;
export const sampleShop = shopBistro;
export const sampleBundles = mockBundles;
export const sampleBookings = mockBookings;