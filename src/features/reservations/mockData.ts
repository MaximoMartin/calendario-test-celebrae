import type { ReservaItem, ItemTimeSlot, ReservaBundle } from '../../types';

// 🎯 CHECKPOINT 2: MOCK DATA PARA SISTEMA DE RESERVAS
// Datos de prueba para simular reservas existentes y conflictos

// Reservas existentes para simular conflictos
export const mockReservasItems: ReservaItem[] = [
  // Reservas para VW Jetta (item_auto_vw_jetta)
  {
    id: "reserva_item_001",
    itemId: "item_auto_vw_jetta",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@email.com",
      phone: "+34 612-345-678"
    },
    date: "2025-01-28", // mañana
    timeSlot: {
      startTime: "09:00",
      endTime: "12:00"
    },
    numberOfPeople: 3,
    status: "CONFIRMED",
    isTemporary: false,
    createdAt: "2025-01-26T10:30:00.000Z",
    updatedAt: "2025-01-26T10:45:00.000Z",
    createdBy: "SELLER",
    notes: "Cliente frecuente - confirmar vehículo en perfectas condiciones",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo para el auto completo
    groupSize: 3 // tamaño del grupo
  },
  
  {
    id: "reserva_item_002",
    itemId: "item_auto_vw_jetta",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Ana García",
      email: "ana.garcia@outlook.com",
      phone: "+34 687-123-456"
    },
    date: "2025-01-29", // pasado mañana
    timeSlot: {
      startTime: "14:00",
      endTime: "17:00"
    },
    numberOfPeople: 2,
    status: "PENDING",
    isTemporary: false,
    createdAt: "2025-01-26T14:15:00.000Z",
    updatedAt: "2025-01-26T14:15:00.000Z",
    createdBy: "BUYER",
    notes: "Primera vez alquilando - enviar instrucciones detalladas",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo para el auto completo
    groupSize: 2 // tamaño del grupo
  },

  // Reserva temporal que está por expirar
  {
    id: "reserva_item_003",
    itemId: "item_auto_vw_jetta",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Miguel Santos",
      email: "miguel.santos@gmail.com",
      phone: "+34 600-987-654"
    },
    date: "2025-01-30",
    timeSlot: {
      startTime: "09:00",
      endTime: "12:00"
    },
    numberOfPeople: 4,
    status: "PENDING",
    isTemporary: true,
    temporaryExpiresAt: "2025-01-26T15:30:00.000Z", // expira en 15 minutos
    createdAt: "2025-01-26T15:15:00.000Z",
    updatedAt: "2025-01-26T15:15:00.000Z",
    createdBy: "BUYER",
    notes: "Reserva temporal - esperando confirmación de pago",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo para el auto completo
    groupSize: 4 // tamaño del grupo
  },

  // Reservas para BMW X3 (item_auto_bmw_x3)  
  {
    id: "reserva_item_004",
    itemId: "item_auto_bmw_x3",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Elena Rossi",
      email: "elena.rossi@hotmail.it",
      phone: "+39 320-123-4567"
    },
    date: "2025-01-28",
    timeSlot: {
      startTime: "14:00",
      endTime: "17:00"
    },
    numberOfPeople: 2,
    status: "CONFIRMED",
    isTemporary: false,
    createdAt: "2025-01-25T16:20:00.000Z",
    updatedAt: "2025-01-25T16:35:00.000Z",
    createdBy: "SELLER",
    notes: "VIP - servicio premium completo",
    itemPrice: 140,
    totalPrice: 140,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo para el auto completo
    groupSize: 2 // tamaño del grupo
  },

  // Reservas para Masaje Completo (item_spa_masaje_completo)
  {
    id: "reserva_item_005",
    itemId: "item_spa_masaje_completo",
    bundleId: "bundle_spa_day",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Sofia Martín",
      email: "sofia.martin@empresa.com",
      phone: "+34 655-789-123"
    },
    date: "2025-01-28",
    timeSlot: {
      startTime: "10:00",
      endTime: "11:30"
    },
    numberOfPeople: 1,
    status: "CONFIRMED",
    isTemporary: false,
    createdAt: "2025-01-24T09:45:00.000Z",
    updatedAt: "2025-01-24T09:45:00.000Z",
    createdBy: "BUYER",
    notes: "Regalo de cumpleaños - usar aceites relajantes",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: false, // reserva individual para masaje
    groupSize: 1 // una persona
  },

  // Reserva cancelada (para mostrar diferentes estados)
  {
    id: "reserva_item_006",
    itemId: "item_spa_masaje_completo",
    bundleId: "bundle_spa_day",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Laura Fernández",
      email: "laura.fernandez@correo.es",
      phone: "+34 678-456-789"
    },
    date: "2025-01-29",
    timeSlot: {
      startTime: "15:00",
      endTime: "16:30"
    },
    numberOfPeople: 1,
    status: "CANCELLED",
    isTemporary: false,
    createdAt: "2025-01-20T12:30:00.000Z",
    updatedAt: "2025-01-25T14:20:00.000Z",
    createdBy: "BUYER",
    notes: "Cancelada por cambio de planes - reembolso procesado",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: false, // reserva individual para masaje
    groupSize: 1 // una persona
  },

  // Reservas para Brunch Continental (item_brunch_continental)
  {
    id: "reserva_item_007", 
    itemId: "item_brunch_continental",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Patricia Morales",
      email: "patricia.morales@universidad.edu",
      phone: "+54 351-777-8899"
    },
    date: "2025-01-28",
    timeSlot: {
      startTime: "10:00",
      endTime: "12:00"
    },
    numberOfPeople: 2,
    status: "CONFIRMED",
    isTemporary: false,
    createdAt: "2025-01-26T08:15:00.000Z",
    updatedAt: "2025-01-26T08:15:00.000Z",
    createdBy: "BUYER",
    notes: "Mesa junto a la ventana preferible",
    itemPrice: 32,
    totalPrice: 64, // 32 * 2 personas
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: false, // se cobra por persona, no por grupo
    groupSize: 2 // dos personas
  },

  // 🎯 CHECKPOINT 4: NUEVAS RESERVAS GRUPALES COMO EJEMPLOS
  // Reserva de Escape Room (grupo completo)
  {
    id: "reserva_item_008",
    itemId: "item_escape_room_mystery",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Grupo Empresarial TechCorp",
      email: "eventos@techcorp.com",
      phone: "+54 351-555-7890"
    },
    date: "2025-01-29",
    timeSlot: {
      startTime: "16:00",
      endTime: "17:00"
    },
    numberOfPeople: 6, // grupo completo
    status: "CONFIRMED",
    isTemporary: false,
    createdAt: "2025-01-25T11:30:00.000Z",
    updatedAt: "2025-01-25T11:30:00.000Z",
    createdBy: "SELLER",
    notes: "Team building corporativo - confirmar setup especial",
    itemPrice: 120, // precio fijo por grupo
    totalPrice: 120, // no se multiplica por personas
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo completo
    groupSize: 6 // tamaño del grupo
  },

  // Reserva de City Tour (grupo)
  {
    id: "reserva_item_009",
    itemId: "item_city_tour_guiado",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Familia González",
      email: "familia.gonzalez@email.com",
      phone: "+54 351-444-5566"
    },
    date: "2025-01-30",
    timeSlot: {
      startTime: "09:00",
      endTime: "13:00"
    },
    numberOfPeople: 5, // familia
    status: "PENDING",
    isTemporary: false,
    createdAt: "2025-01-26T13:45:00.000Z",
    updatedAt: "2025-01-26T13:45:00.000Z",
    createdBy: "BUYER",
    notes: "Tour familiar - incluir paradas kid-friendly",
    itemPrice: 200, // precio fijo por grupo
    totalPrice: 200, // no se multiplica por personas
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo completo
    groupSize: 5 // tamaño del grupo (familia)
  }
];

// Configuración de slots de tiempo específicos por item
export const mockItemTimeSlots: ItemTimeSlot[] = [
  // Slots para VW Jetta - Alquiler de autos (3 horas cada slot)
  {
    id: "its_vw_jetta_001",
    itemId: "item_auto_vw_jetta",
    dayOfWeek: 1, // Lunes
    startTime: "09:00",
    endTime: "12:00", 
    maxBookingsPerSlot: 1, // solo 1 auto por slot
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 30, // tiempo para limpieza/entrega
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  {
    id: "its_vw_jetta_002",
    itemId: "item_auto_vw_jetta",
    dayOfWeek: 1, // Lunes
    startTime: "14:00",
    endTime: "17:00",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 30,
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  // Repetir para martes (día 2)
  {
    id: "its_vw_jetta_003",
    itemId: "item_auto_vw_jetta",
    dayOfWeek: 2, // Martes
    startTime: "09:00",
    endTime: "12:00",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 30,
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  {
    id: "its_vw_jetta_004",
    itemId: "item_auto_vw_jetta",
    dayOfWeek: 2, // Martes
    startTime: "14:00",
    endTime: "17:00",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 30,
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Slots para BMW X3 - Premium (3 horas cada slot)
  {
    id: "its_bmw_x3_001",
    itemId: "item_auto_bmw_x3",
    dayOfWeek: 1, // Lunes
    startTime: "09:00",
    endTime: "12:00",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 45, // más tiempo para vehículo premium
    createdAt: "2023-08-20T10:15:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  {
    id: "its_bmw_x3_002",
    itemId: "item_auto_bmw_x3",
    dayOfWeek: 1, // Lunes
    startTime: "14:00",
    endTime: "17:00",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 5,
    bufferMinutes: 45,
    createdAt: "2023-08-20T10:15:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Slots para Masaje Completo - Spa (90 minutos)
  {
    id: "its_spa_masaje_001",
    itemId: "item_spa_masaje_completo",
    dayOfWeek: 1, // Lunes
    startTime: "10:00",
    endTime: "11:30",
    maxBookingsPerSlot: 1, // solo 1 persona por masajista
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 1,
    bufferMinutes: 15, // tiempo para preparar sala
    createdAt: "2023-08-20T11:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  {
    id: "its_spa_masaje_002",
    itemId: "item_spa_masaje_completo",
    dayOfWeek: 1, // Lunes
    startTime: "15:00",
    endTime: "16:30",
    maxBookingsPerSlot: 1,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 1,
    bufferMinutes: 15,
    createdAt: "2023-08-20T11:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Slots para Brunch Continental (2 horas)
  {
    id: "its_brunch_cont_001",
    itemId: "item_brunch_continental",
    dayOfWeek: 1, // Lunes
    startTime: "10:00", 
    endTime: "12:00",
    maxBookingsPerSlot: 3, // máximo 3 mesas/reservas por slot
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 2,
    bufferMinutes: 10, // tiempo para limpiar mesa
    createdAt: "2023-09-10T12:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  {
    id: "its_brunch_cont_002",
    itemId: "item_brunch_continental",
    dayOfWeek: 1, // Lunes
    startTime: "12:00",
    endTime: "14:00",
    maxBookingsPerSlot: 3,
    isActive: true,
    minPeoplePerBooking: 1,
    maxPeoplePerBooking: 2,
    bufferMinutes: 10,
    createdAt: "2023-09-10T12:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  }
];

// Helper para obtener reservas por item ID
export const getReservasByItemId = (itemId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => reserva.itemId === itemId);
};

// Helper para obtener slots por item ID
export const getSlotsByItemId = (itemId: string): ItemTimeSlot[] => {
  return mockItemTimeSlots.filter(slot => slot.itemId === itemId);
};

// Helper para obtener reservas por fecha y item
export const getReservasByDateAndItem = (date: string, itemId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => 
    reserva.date === date && 
    reserva.itemId === itemId &&
    reserva.status !== 'CANCELLED' && 
    reserva.status !== 'EXPIRED'
  );
};

// 🎯 CHECKPOINT 3: MOCK DATA PARA RESERVAS DE BUNDLE COMPLETO
// Reservas agrupadas con múltiples items y extras

export const mockReservasBundle: ReservaBundle[] = [
  // Reserva Bundle Completo: Alquiler París (2 items + 2 extras)
  {
    id: "reserva_bundle_001",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Roberto Silva",
      email: "roberto.silva@empresa.com",
      phone: "+34 678-901-234"
    },
    reservasItems: [
      {
        id: "reserva_item_bundle_001_item1",
        itemId: "item_auto_vw_jetta",
        bundleId: "bundle_auto_paris",
        shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
        userId: "87IZYWdezwJQsILiU57z",
        customerInfo: {
          name: "Roberto Silva",
          email: "roberto.silva@empresa.com",
          phone: "+34 678-901-234"
        },
        date: "2025-01-30",
        timeSlot: {
          startTime: "14:00",
          endTime: "17:00"
        },
        numberOfPeople: 2,
        status: "CONFIRMED",
        isTemporary: false,
        createdAt: "2025-01-26T16:20:00.000Z",
        updatedAt: "2025-01-26T16:20:00.000Z",
        createdBy: "BUYER",
        itemPrice: 85,
        totalPrice: 85,
        isGroupReservation: true
      },
      {
        id: "reserva_item_bundle_001_item2",
        itemId: "item_auto_bmw_x3",
        bundleId: "bundle_auto_paris",
        shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
        userId: "87IZYWdezwJQsILiU57z",
        customerInfo: {
          name: "Roberto Silva",
          email: "roberto.silva@empresa.com",
          phone: "+34 678-901-234"
        },
        date: "2025-01-31",
        timeSlot: {
          startTime: "09:00",
          endTime: "12:00"
        },
        numberOfPeople: 2,
        status: "CONFIRMED",
        isTemporary: false,
        createdAt: "2025-01-26T16:20:00.000Z",
        updatedAt: "2025-01-26T16:20:00.000Z",
        createdBy: "BUYER",
        itemPrice: 140,
        totalPrice: 140,
        isGroupReservation: true
      }
    ],
    extras: [
      {
        extraId: "extra_equipaje_adicional",
        quantity: 2,
        unitPrice: 15,
        totalPrice: 30,
        isGroupSelection: true
      },
      {
        extraId: "extra_gps_navegacion",
        quantity: 1,
        unitPrice: 12,
        totalPrice: 12,
        isGroupSelection: true
      }
    ],
    status: "CONFIRMED",
    isTemporary: false,
    itemsTotal: 225, // 85 + 140
    extrasTotal: 42, // 30 + 12
    totalPrice: 267,
    createdAt: "2025-01-26T16:20:00.000Z",
    updatedAt: "2025-01-26T16:20:00.000Z",
    createdBy: "BUYER",
    notes: "Reserva completa para viaje de negocios - facturar a empresa"
  },

  // Reserva Bundle Spa Day (1 item + 3 extras)
  {
    id: "reserva_bundle_002",
    bundleId: "bundle_spa_day",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Carmen López",
      email: "carmen.lopez@gmail.com",
      phone: "+34 655-444-333"
    },
    reservasItems: [
      {
        id: "reserva_item_bundle_002_item1",
        itemId: "item_spa_masaje_completo",
        bundleId: "bundle_spa_day",
        shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
        userId: "87IZYWdezwJQsILiU57z",
        customerInfo: {
          name: "Carmen López",
          email: "carmen.lopez@gmail.com",
          phone: "+34 655-444-333"
        },
        date: "2025-01-29",
        timeSlot: {
          startTime: "11:00",
          endTime: "12:30"
        },
        numberOfPeople: 1,
        status: "PENDING",
        isTemporary: false,
        createdAt: "2025-01-26T18:30:00.000Z",
        updatedAt: "2025-01-26T18:30:00.000Z",
        createdBy: "BUYER",
        itemPrice: 85,
        totalPrice: 85,
        isGroupReservation: true
      }
    ],
    extras: [
      {
        extraId: "extra_aromaterapia",
        quantity: 1,
        unitPrice: 25,
        totalPrice: 25,
        isGroupSelection: true
      },
      {
        extraId: "extra_almuerzo_spa",
        quantity: 1,
        unitPrice: 35,
        totalPrice: 35,
        isGroupSelection: true
      }
    ],
    status: "PENDING",
    isTemporary: false,
    itemsTotal: 85,
    extrasTotal: 60,
    totalPrice: 145,
    createdAt: "2025-01-26T18:30:00.000Z",
    updatedAt: "2025-01-26T18:30:00.000Z",
    createdBy: "BUYER",
    notes: "Regalo de aniversario - confirmar disponibilidad de sala premium"
  },

  // Reserva Bundle Brunch (2 items, sin extras)
  {
    id: "reserva_bundle_003",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: "87IZYWdezwJQsILiU57z",
    customerInfo: {
      name: "Diego Martínez",
      email: "diego.martinez@outlook.com",
      phone: "+54 351-888-9999"
    },
    reservasItems: [
      {
        id: "reserva_item_bundle_003_item1",
        itemId: "item_brunch_continental",
        bundleId: "bundle_brunch_especial",
        shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
        userId: "87IZYWdezwJQsILiU57z",
        customerInfo: {
          name: "Diego Martínez",
          email: "diego.martinez@outlook.com",
          phone: "+54 351-888-9999"
        },
        date: "2025-01-29",
        timeSlot: {
          startTime: "10:00",
          endTime: "12:00"
        },
        numberOfPeople: 2,
        status: "CONFIRMED",
        isTemporary: false,
        createdAt: "2025-01-26T12:45:00.000Z",
        updatedAt: "2025-01-26T12:45:00.000Z",
        createdBy: "SELLER",
        itemPrice: 32,
        totalPrice: 64,
        isGroupReservation: true
      },
      {
        id: "reserva_item_bundle_003_item2",
        itemId: "item_brunch_americano",
        bundleId: "bundle_brunch_especial",
        shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
        userId: "87IZYWdezwJQsILiU57z",
        customerInfo: {
          name: "Diego Martínez",
          email: "diego.martinez@outlook.com",
          phone: "+54 351-888-9999"
        },
        date: "2025-01-29",
        timeSlot: {
          startTime: "12:00",
          endTime: "14:00"
        },
        numberOfPeople: 2,
        status: "CONFIRMED",
        isTemporary: false,
        createdAt: "2025-01-26T12:45:00.000Z",
        updatedAt: "2025-01-26T12:45:00.000Z",
        createdBy: "SELLER",
        itemPrice: 38,
        totalPrice: 76,
        isGroupReservation: true
      }
    ],
    extras: [], // Sin extras seleccionados
    status: "CONFIRMED",
    isTemporary: false,
    itemsTotal: 140, // 64 + 76
    extrasTotal: 0,
    totalPrice: 140,
    createdAt: "2025-01-26T12:45:00.000Z",
    updatedAt: "2025-01-26T12:45:00.000Z",
    createdBy: "SELLER",
    notes: "Mesa para 4 personas - celebración familiar"
  }
];

// Helper para obtener reservas bundle por bundle ID
export const getReservasBundleByBundleId = (bundleId: string): ReservaBundle[] => {
  return mockReservasBundle.filter(reserva => reserva.bundleId === bundleId);
};

// Helper para obtener reservas bundle por shop ID
export const getReservasBundleByShopId = (shopId: string): ReservaBundle[] => {
  return mockReservasBundle.filter(reserva => reserva.shopId === shopId);
}; 
