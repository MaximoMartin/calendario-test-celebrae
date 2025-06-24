import type { User, Shop, Kit, Booking, BusinessHours, BusinessHoursPeriod, TimeSlot, BookingSettings, ShopException, AvailabilityBlock } from '../types';

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
  {
    id: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    name: "El mono epico editado",
    address: "Arroyito 8767, Córdoba, Argentina",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: [
      { dayOfWeek: 1, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 2, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 3, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 4, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 5, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 6, isActive: true, periods: [{ startTime: "12:00", endTime: "15:00" }] },
      { dayOfWeek: 0, isActive: false, periods: [{ startTime: "12:00", endTime: "15:00" }] },
    ],
    bookingSettings: mockBookingSettings
  }
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

  // 🐒 El mono epico editado - Al mediodía
  // Almuerzo Épico
  { id: "ts_almuerzo_1", kitId: "kit_almuerzo_epico", startTime: "12:00", endTime: "13:30", maxBookings: 3, isActive: true },
  { id: "ts_almuerzo_2", kitId: "kit_almuerzo_epico", startTime: "13:30", endTime: "15:00", maxBookings: 3, isActive: true },
  
  // Experiencia Mono
  { id: "ts_mono_1", kitId: "kit_experiencia_mono", startTime: "12:00", endTime: "15:00", maxBookings: 1, isActive: true },
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

  // 🐒 EL MONO EPICO EDITADO - Al mediodía
  {
    id: "kit_almuerzo_epico",
    name: "Almuerzo Épico Monardo",
    price: 35,
    maxCapacity: 3,
    duration: 90, // 1.5 hours
    items: [],
    extras: [],
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_almuerzo_epico")
  },
  {
    id: "kit_experiencia_mono",
    name: "Experiencia Mono Completa",
    price: 85,
    maxCapacity: 1,
    duration: 180, // 3 hours
    items: [],
    extras: [],
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit_experiencia_mono")
  }
];

// Reservas distribuidas entre los 3 negocios
export const mockBookings: Booking[] = [
  // 🎯 Reservas para "La vuelta del Maxi"
  {
    id: "booking_maxi_1",
    kitId: "kit_auto_paris",
    kitName: "Alquiler de Autos en París, Francia",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Sofia García",
    customerEmail: "sofia.garcia@email.com",
    customerPhone: "+34 612345678",
    date: "2025-06-25",
    timeSlot: "09:00",
    numberOfPeople: 2,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-20T10:30:00.000Z",
    notes: "Luna de miel en París"
  },
  {
    id: "booking_maxi_2",
    kitId: "kit_spa_day",
    kitName: "Spa Day Premium Completo",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Elena Rossi",
    customerEmail: "elena.rossi@hotmail.it",
    customerPhone: "+39 3201234567",
    date: "2025-06-26",
    timeSlot: "10:00",
    numberOfPeople: 1,
    status: "PENDING",
    isManual: true,
    createdAt: "2025-06-22T14:15:00.000Z",
    notes: "Regalo de cumpleaños"
  },
  {
    id: "booking_maxi_3",
    kitId: "kit_cata_vinos",
    kitName: "Cata de Vinos VIP Exclusiva",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Carlos Mendoza",
    customerEmail: "carlos.mendoza@empresa.com",
    customerPhone: "+54 9 11 2345-6789",
    date: "2025-06-27",
    timeSlot: "17:00",
    numberOfPeople: 4,
    status: "COMPLETED",
    isManual: false,
    createdAt: "2025-06-18T09:45:00.000Z",
    notes: "Evento corporativo"
  },

  // 🍽️ Reservas para "Café Delicias"
  {
    id: "booking_cafe_1",
    kitId: "kit_brunch_especial",
    kitName: "Brunch Especial Gourmet",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    customerName: "Ana López",
    customerEmail: "ana.lopez@gmail.com",
    customerPhone: "+54 351 123-4567",
    date: "2025-06-25",
    timeSlot: "10:00",
    numberOfPeople: 2,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-23T08:20:00.000Z",
    notes: "Reunión de amigas"
  },
  {
    id: "booking_cafe_2",
    kitId: "kit_cena_romantica",
    kitName: "Cena Romántica Premium",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    customerName: "Miguel Santos",
    customerEmail: "miguel.santos@yahoo.com",
    customerPhone: "+54 351 987-6543",
    date: "2025-06-26",
    timeSlot: "19:00",
    numberOfPeople: 2,
    status: "RESCHEDULED",
    isManual: false,
    createdAt: "2025-06-19T16:30:00.000Z",
    notes: "Aniversario - RESCHEDULED from 2025-06-24",
    rescheduledFrom: "2025-06-24"
  },
  {
    id: "booking_cafe_3",
    kitId: "kit_clase_barista",
    kitName: "Clase de Café y Barista Profesional",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    customerName: "Laura Fernández",
    customerEmail: "laura.fernandez@universidad.edu",
    customerPhone: "+54 351 555-0123",
    date: "2025-06-28",
    timeSlot: "14:00",
    numberOfPeople: 1,
    status: "NO_SHOW",
    isManual: true,
    createdAt: "2025-06-21T11:00:00.000Z",
    notes: "Estudiante de gastronomía"
  },
  {
    id: "booking_cafe_4",
    kitId: "kit_brunch_especial",
    kitName: "Brunch Especial Gourmet",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    customerName: "Roberto Silva",
    customerEmail: "roberto.silva@empresa.net",
    customerPhone: "+54 351 444-5566",
    date: "2025-06-29",
    timeSlot: "12:00",
    numberOfPeople: 2,
    status: "CANCELLED",
    isManual: false,
    createdAt: "2025-06-22T13:45:00.000Z",
    notes: "Cancelado por cambio de planes",
    cancellationReason: "Cambio de planes laborales"
  },

  // 🐒 Reservas para "El mono epico editado"
  {
    id: "booking_mono_1",
    kitId: "kit_almuerzo_epico",
    kitName: "Almuerzo Épico Monardo",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    customerName: "Patricia Morales",
    customerEmail: "patricia.morales@correo.com",
    customerPhone: "+54 351 777-8899",
    date: "2025-06-25",
    timeSlot: "12:00",
    numberOfPeople: 3,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-22T15:20:00.000Z",
    notes: "Almuerzo familiar"
  },
  {
    id: "booking_mono_2",
    kitId: "kit_experiencia_mono",
    kitName: "Experiencia Mono Completa",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    customerName: "Javier Ruiz",
    customerEmail: "javier.ruiz@outlook.com",
    customerPhone: "+54 351 111-2233",
    date: "2025-06-27",
    timeSlot: "12:00",
    numberOfPeople: 1,
    status: "PARTIAL_REFUND",
    isManual: true,
    createdAt: "2025-06-20T12:10:00.000Z",
    notes: "Problema con el servicio - reembolso parcial",
    refundAmount: 40
  },
  {
    id: "booking_mono_3",
    kitId: "kit_almuerzo_epico",
    kitName: "Almuerzo Épico Monardo",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    customerName: "Carmen Vega",
    customerEmail: "carmen.vega@gmail.com",
    customerPhone: "+54 351 999-0011",
    date: "2025-06-30",
    timeSlot: "13:30",
    numberOfPeople: 2,
    status: "PENDING",
    isManual: false,
    createdAt: "2025-06-24T09:30:00.000Z",
    notes: "Celebración cumpleaños"
  }
];

// Excepciones distribuidas entre los negocios
export const mockExceptions: ShopException[] = [
  {
    id: "exception_maxi_1",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    date: "2025-06-29",
    type: "PRIVATE_EVENT",
    title: "Evento Privado Boda VIP",
    description: "Celebración privada de boda, servicios exclusivos",
    affectedKits: ["kit_spa_day"],
    isActive: true,
    createdAt: "2025-06-15T10:00:00.000Z"
  },
  {
    id: "exception_cafe_1",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    date: "2025-06-30",
    type: "SPECIAL_HOURS",
    title: "Horario Especial Fin de Mes",
    description: "Horario extendido para evento especial",
    specialHours: {
      startTime: "06:00",
      endTime: "02:00"
    },
    affectedKits: [],
    isActive: true,
    createdAt: "2025-06-20T14:30:00.000Z"
  },
  {
    id: "exception_mono_1",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    date: "2025-06-28",
    type: "MAINTENANCE",
    title: "Mantenimiento Cocina",
    description: "Renovación de equipos de cocina",
    affectedKits: ["kit_almuerzo_epico"],
    isActive: true,
    createdAt: "2025-06-18T11:15:00.000Z"
  }
];

// Bloques de disponibilidad avanzada
export const mockAvailabilityBlocks: AvailabilityBlock[] = [
  {
    id: "avail_maxi_1",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    kitId: "kit_auto_paris",
    startDate: "2025-06-25",
    endDate: "2025-06-27",
    type: "SPECIAL_PRICING",
    reason: "Promoción fin de semana París",
    settings: {
      priceMultiplier: 0.85
    },
    isActive: true
  },
  {
    id: "avail_cafe_1",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    kitId: "kit_cena_romantica",
    startDate: "2025-06-26",
    endDate: "2025-06-28",
    type: "LIMITED_CAPACITY",
    reason: "Chef invitado - capacidad limitada",
    settings: {
      maxBookings: 1
    },
    isActive: true
  },
  {
    id: "avail_mono_1",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    startDate: "2025-06-29",
    endDate: "2025-06-30",
    type: "BLOCKED",
    reason: "Preparación evento especial",
    isActive: true
  }
];