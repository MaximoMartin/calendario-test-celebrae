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
    date: "2025-06-27", // mañana del día actual
    timeSlot: {
      startTime: "09:00",
      endTime: "12:00"
    },
    numberOfPeople: 3,
    status: "CONFIRMED",
    isTemporary: false,
    
    // 🎯 CHECKPOINT 6: HISTORIAL Y CONTROL DE MODIFICACIONES
    history: [
      {
        id: "history_001_01",
        action: "CREATED",
        timestamp: "2025-06-25T10:30:00.000Z",
        userId: "87IZYWdezwJQsILiU57z",
        userType: "SELLER",
        details: {
          reason: "Reserva creada por el vendedor para cliente frecuente"
        }
      },
      {
        id: "history_001_02", 
        action: "CONFIRMED",
        timestamp: "2025-06-25T10:45:00.000Z",
        userId: "87IZYWdezwJQsILiU57z",
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada - documentos verificados"
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "PEOPLE_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true },
      { type: "NOTES_CHANGE", allowed: true }
    ],
    
    createdAt: "2025-06-25T10:30:00.000Z",
    updatedAt: "2025-06-25T10:45:00.000Z",
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
    date: "2025-06-28", // modificado para estar en junio
    timeSlot: {
      startTime: "16:00", // modificado (antes era 14:00)
      endTime: "19:00"   // modificado (antes era 17:00)
    },
    numberOfPeople: 3, // modificado (antes era 2)
    status: "MODIFIED",
    isTemporary: false,
    
    // 🎯 CHECKPOINT 6: HISTORIAL COMPLETO CON MÚLTIPLES MODIFICACIONES
    history: [
      {
        id: "history_002_01",
        action: "CREATED",
        timestamp: "2025-06-25T14:15:00.000Z",
        userId: "ana.garcia@outlook.com",
        userType: "BUYER",
        details: {
          reason: "Reserva inicial creada por el cliente"
        }
      },
      {
        id: "history_002_02",
        action: "MODIFIED",
        timestamp: "2025-06-25T18:30:00.000Z",
        userId: "87IZYWdezwJQsILiU57z",
        userType: "SELLER",
        details: {
          reason: "Cliente solicitó cambio de fecha por conflicto de agenda",
          changes: [
            {
              field: "date",
              previousValue: "2025-01-29",
              newValue: "2025-01-30",
              description: "Fecha movida un día más adelante"
            },
            {
              field: "timeSlot",
              previousValue: { startTime: "14:00", endTime: "17:00" },
              newValue: { startTime: "16:00", endTime: "19:00" },
              description: "Horario movido 2 horas más tarde"
            },
            {
              field: "numberOfPeople",
              previousValue: 2,
              newValue: 3,
              description: "Se agregó una persona adicional"
            }
          ],
          previousValues: {
            date: "2025-01-29",
            timeSlot: { startTime: "14:00", endTime: "17:00" },
            numberOfPeople: 2
          }
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "PEOPLE_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true },
      { type: "NOTES_CHANGE", allowed: true }
    ],
    
    createdAt: "2025-01-26T14:15:00.000Z",
    updatedAt: "2025-01-26T18:30:00.000Z",
    createdBy: "BUYER",
    notes: "Primera vez alquilando - enviar instrucciones detalladas. ACTUALIZADO: Persona adicional confirmada.",
    itemPrice: 85,
    totalPrice: 85,
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isGroupReservation: true, // reserva de grupo para el auto completo
    groupSize: 3 // tamaño del grupo actualizado
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
    
    // 🎯 CHECKPOINT 6: HISTORIAL DE CANCELACIÓN CON PENALIDAD
    history: [
      {
        id: "history_006_01",
        action: "CREATED",
        timestamp: "2025-01-20T12:30:00.000Z",
        userId: "laura.fernandez@correo.es",
        userType: "BUYER",
        details: {
          reason: "Reserva creada online por el cliente"
        }
      },
      {
        id: "history_006_02",
        action: "CONFIRMED",
        timestamp: "2025-01-20T13:15:00.000Z",
        userId: "87IZYWdezwJQsILiU57z",
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada automáticamente tras validación"
        }
      },
      {
        id: "history_006_03",
        action: "CANCELLED",
        timestamp: "2025-01-25T14:20:00.000Z",
        userId: "laura.fernandez@correo.es",
        userType: "BUYER",
        details: {
          reason: "Cliente canceló por enfermedad - cancelación dentro del período permitido",
          previousValues: {
            status: "CONFIRMED"
          },
          newValues: {
            status: "CANCELLED"
          }
        }
      }
    ],
    canBeModified: false,
    canBeCancelled: false,
    modificationsAllowed: [],
    cancellationPenalty: {
      willBeCharged: false,
      reason: "Cancelación realizada con más de 24h de anticipación - sin penalidad"
    },
    
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

// 🎯 CHECKPOINT 7: DATOS MOCK ADICIONALES PARA USUARIO SELLER
// Agregamos más reservas para simular un dashboard realista con múltiples shops del seller

// Usuario SELLER simulado para Checkpoint 7
export const SELLER_USER_ID = "t1UmxVxdBGUaG7iu9VDJlYrhOFA3";

// Reservas adicionales para el dashboard del SELLER
export const mockSellerReservasItems: ReservaItem[] = [
  // 🏪 Reservas para "La vuelta del Maxi" (shop principal)
  {
    id: "seller_reserva_001",
    itemId: "item_auto_vw_jetta",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Marco Antonelli",
      email: "marco.antonelli@gmail.com",
      phone: "+39 335-987-6543"
    },
    date: "2025-01-30",
    timeSlot: {
      startTime: "09:00",
      endTime: "12:00"
    },
    numberOfPeople: 4,
    status: "CONFIRMED",
    isTemporary: false,
    history: [
      {
        id: "seller_history_001_01",
        action: "CREATED",
        timestamp: "2025-01-25T14:20:00.000Z",
        userId: "marco.antonelli@gmail.com",
        userType: "BUYER",
        details: {
          reason: "Reserva online para vacaciones familiares"
        }
      },
      {
        id: "seller_history_001_02",
        action: "CONFIRMED",
        timestamp: "2025-01-25T15:30:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada tras verificación de documentos"
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "PEOPLE_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true }
    ],
    createdAt: "2025-01-25T14:20:00.000Z",
    updatedAt: "2025-01-25T15:30:00.000Z",
    createdBy: "BUYER",
    notes: "Familia italiana - primera vez en París",
    itemPrice: 85,
    totalPrice: 85,
    isGroupReservation: true,
    groupSize: 4
  },

  {
    id: "seller_reserva_002",
    itemId: "item_spa_masaje_completo",
    bundleId: "bundle_spa_day",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Isabella Chen",
      email: "isabella.chen@business.com",
      phone: "+39 320-555-1234"
    },
    date: "2025-01-31",
    timeSlot: {
      startTime: "14:00",
      endTime: "15:30"
    },
    numberOfPeople: 1,
    status: "PENDING",
    isTemporary: false,
    history: [
      {
        id: "seller_history_002_01",
        action: "CREATED",
        timestamp: "2025-01-26T09:15:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva creada para clienta VIP corporate"
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true },
      { type: "NOTES_CHANGE", allowed: true }
    ],
    createdAt: "2025-01-26T09:15:00.000Z",
    updatedAt: "2025-01-26T09:15:00.000Z",
    createdBy: "SELLER",
    notes: "Cliente VIP - tratamiento premium con productos orgánicos",
    itemPrice: 85,
    totalPrice: 85,
    isGroupReservation: false,
    groupSize: 1
  },

  {
    id: "seller_reserva_003",
    itemId: "item_auto_bmw_x3",
    bundleId: "bundle_auto_paris",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Jean-Pierre Dubois",
      email: "jp.dubois@france.fr",
      phone: "+33 6 12 34 56 78"
    },
    date: "2025-02-01",
    timeSlot: {
      startTime: "10:00",
      endTime: "13:00"
    },
    numberOfPeople: 2,
    status: "COMPLETED",
    isTemporary: false,
    history: [
      {
        id: "seller_history_003_01",
        action: "CREATED",
        timestamp: "2025-01-20T11:00:00.000Z",
        userId: "jp.dubois@france.fr",
        userType: "BUYER",
        details: {
          reason: "Reserva para evento de negocios"
        }
      },
      {
        id: "seller_history_003_02",
        action: "CONFIRMED",
        timestamp: "2025-01-20T12:30:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada - cliente frecuente"
        }
      },
      {
        id: "seller_history_003_03",
        action: "COMPLETED",
        timestamp: "2025-02-01T13:15:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Servicio completado exitosamente - vehículo devuelto en perfectas condiciones"
        }
      }
    ],
    canBeModified: false,
    canBeCancelled: false,
    modificationsAllowed: [],
    createdAt: "2025-01-20T11:00:00.000Z",
    updatedAt: "2025-02-01T13:15:00.000Z",
    createdBy: "BUYER",
    notes: "Cliente corporate frecuente - servicio impecable",
    itemPrice: 140,
    totalPrice: 140,
    isGroupReservation: true,
    groupSize: 2
  },

  // 🍽️ Reservas para "Café Delicias"
  {
    id: "seller_reserva_004",
    itemId: "item_brunch_continental",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "María José Rodríguez",
      email: "mj.rodriguez@universidad.edu.ar",
      phone: "+54 351-888-7777"
    },
    date: "2025-01-29",
    timeSlot: {
      startTime: "10:30",
      endTime: "12:30"
    },
    numberOfPeople: 3,
    status: "CONFIRMED",
    isTemporary: false,
    history: [
      {
        id: "seller_history_004_01",
        action: "CREATED",
        timestamp: "2025-01-27T16:45:00.000Z",
        userId: "mj.rodriguez@universidad.edu.ar",
        userType: "BUYER",
        details: {
          reason: "Reserva para celebración graduación"
        }
      },
      {
        id: "seller_history_004_02",
        action: "CONFIRMED",
        timestamp: "2025-01-27T17:00:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada automáticamente"
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "PEOPLE_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true }
    ],
    createdAt: "2025-01-27T16:45:00.000Z",
    updatedAt: "2025-01-27T17:00:00.000Z",
    createdBy: "BUYER",
    notes: "Celebración graduación - mesa cerca de la ventana",
    itemPrice: 32,
    totalPrice: 96, // 32 * 3 personas
    isGroupReservation: false,
    groupSize: 3
  },

  {
    id: "seller_reserva_005",
    itemId: "item_escape_room_mystery",
    bundleId: "bundle_brunch_especial",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Grupo Team Building TechStart",
      email: "eventos@techstart.com.ar",
      phone: "+54 351-555-9999"
    },
    date: "2025-02-02",
    timeSlot: {
      startTime: "16:00",
      endTime: "17:00"
    },
    numberOfPeople: 6,
    status: "PENDING",
    isTemporary: false,
    history: [
      {
        id: "seller_history_005_01",
        action: "CREATED",
        timestamp: "2025-01-26T13:20:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva creada para evento corporativo team building"
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true },
      { type: "NOTES_CHANGE", allowed: true }
    ],
    createdAt: "2025-01-26T13:20:00.000Z",
    updatedAt: "2025-01-26T13:20:00.000Z",
    createdBy: "SELLER",
    notes: "Evento corporativo - preparar setup especial para team building",
    itemPrice: 120,
    totalPrice: 120,
    isGroupReservation: true,
    groupSize: 6
  },

  // 🐵 Reservas para "El mono épico editado"
  {
    id: "seller_reserva_006",
    itemId: "item_almuerzo_epico", // asumiendo que existe este item
    bundleId: "bundle_almuerzo_mono", // asumiendo que existe este bundle
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Familia Gómez",
      email: "familia.gomez@gmail.com",
      phone: "+54 351-777-4444"
    },
    date: "2025-01-30",
    timeSlot: {
      startTime: "12:30",
      endTime: "14:30"
    },
    numberOfPeople: 4,
    status: "CANCELLED",
    isTemporary: false,
    history: [
      {
        id: "seller_history_006_01",
        action: "CREATED",
        timestamp: "2025-01-24T10:00:00.000Z",
        userId: "familia.gomez@gmail.com",
        userType: "BUYER",
        details: {
          reason: "Reserva familiar para cumpleaños"
        }
      },
      {
        id: "seller_history_006_02",
        action: "CONFIRMED",
        timestamp: "2025-01-24T10:30:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada"
        }
      },
      {
        id: "seller_history_006_03",
        action: "CANCELLED",
        timestamp: "2025-01-26T08:00:00.000Z",
        userId: "familia.gomez@gmail.com",
        userType: "BUYER",
        details: {
          reason: "Cliente canceló por emergencia familiar - sin penalidad"
        }
      }
    ],
    canBeModified: false,
    canBeCancelled: false,
    modificationsAllowed: [],
    cancellationPenalty: {
      willBeCharged: false,
      reason: "Cancelación dentro del período permitido - sin penalidad"
    },
    createdAt: "2025-01-24T10:00:00.000Z",
    updatedAt: "2025-01-26T08:00:00.000Z",
    createdBy: "BUYER",
    notes: "Cancelado por emergencia familiar - reembolso completo procesado",
    itemPrice: 45,
    totalPrice: 180, // 45 * 4 personas
    isGroupReservation: false,
    groupSize: 4
  },

  // Reserva modificada con historial complejo
  {
    id: "seller_reserva_007",
    itemId: "item_spa_facial_premium",
    bundleId: "bundle_spa_day",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    userId: SELLER_USER_ID,
    customerInfo: {
      name: "Valentina Rossi",
      email: "valentina.rossi@fashion.it",
      phone: "+39 333-444-5555"
    },
    date: "2025-02-03", // modificado
    timeSlot: {
      startTime: "11:00", // modificado
      endTime: "12:00"   // modificado
    },
    numberOfPeople: 1,
    status: "MODIFIED",
    isTemporary: false,
    history: [
      {
        id: "seller_history_007_01",
        action: "CREATED",
        timestamp: "2025-01-22T14:30:00.000Z",
        userId: "valentina.rossi@fashion.it",
        userType: "BUYER",
        details: {
          reason: "Reserva para tratamiento facial antes de evento"
        }
      },
      {
        id: "seller_history_007_02",
        action: "CONFIRMED",
        timestamp: "2025-01-22T15:00:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Reserva confirmada automáticamente"
        }
      },
      {
        id: "seller_history_007_03",
        action: "MODIFIED",
        timestamp: "2025-01-25T10:30:00.000Z",
        userId: SELLER_USER_ID,
        userType: "SELLER",
        details: {
          reason: "Cliente solicitó cambio de fecha y horario por cambio en evento",
          changes: [
            {
              field: "date",
              previousValue: "2025-02-01",
              newValue: "2025-02-03",
              description: "Fecha cambiada de 2025-02-01 a 2025-02-03"
            },
            {
              field: "timeSlot",
              previousValue: { startTime: "09:00", endTime: "10:00" },
              newValue: { startTime: "11:00", endTime: "12:00" },
              description: "Horario cambiado de 09:00-10:00 a 11:00-12:00"
            }
          ]
        }
      }
    ],
    canBeModified: true,
    canBeCancelled: true,
    modificationsAllowed: [
      { type: "TIME_CHANGE", allowed: true },
      { type: "CUSTOMER_INFO_CHANGE", allowed: true },
      { type: "NOTES_CHANGE", allowed: true }
    ],
    createdAt: "2025-01-22T14:30:00.000Z",
    updatedAt: "2025-01-25T10:30:00.000Z",
    createdBy: "BUYER",
    notes: "Tratamiento especial para evento de moda - modificado según nuevos horarios del evento",
    itemPrice: 65,
    totalPrice: 65,
    isGroupReservation: false,
    groupSize: 1
  }
];

// Combinar todas las reservas para el sistema completo
export const allMockReservasItems = [...mockReservasItems, ...mockSellerReservasItems];

// 🎯 CHECKPOINT 7: FUNCIONES PARA DASHBOARD SELLER

// Función para obtener todas las reservas de un usuario SELLER (basado en shopId)
export const getReservasBySellerUserId = (sellerUserId: string): ReservaItem[] => {
  // Para el dashboard del SELLER, necesitamos filtrar por las reservas en sus shops
  // No por el userId (que es del comprador), sino por el shopId que le pertenece
  return allMockReservasItems.filter(reserva => {
    // Aquí simulamos que el SELLER es dueño de ciertos shops
    // En producción esto vendría de una query a la base de datos
    if (sellerUserId === SELLER_USER_ID) {
      return ['ab55132c-dcc8-40d6-9ac4-5f573285f55f', '75cdf85a-67f9-40c4-9fc1-ee1019138bec'].includes(reserva.shopId);
    }
    return reserva.userId === sellerUserId;
  });
};

// Helper para obtener reservas por shop y seller
export const getReservasByShopAndSeller = (shopId: string, sellerUserId: string): ReservaItem[] => {
  return allMockReservasItems.filter(reserva => 
    reserva.shopId === shopId && reserva.userId === sellerUserId
  );
};

// Función para obtener estadísticas del SELLER
export const getSellerStats = (sellerUserId: string) => {
  const reservations = getReservasBySellerUserId(sellerUserId);
  
  return {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter(r => r.status === 'CONFIRMED').length,
    pendingReservations: reservations.filter(r => r.status === 'PENDING').length,
    cancelledReservations: reservations.filter(r => r.status === 'CANCELLED').length,
    totalRevenue: reservations
      .filter(r => ['CONFIRMED', 'COMPLETED'].includes(r.status))
      .reduce((sum, r) => sum + r.totalPrice, 0),
    averageReservationValue: reservations.length > 0 
      ? reservations.reduce((sum, r) => sum + r.totalPrice, 0) / reservations.length 
      : 0
  };
};

// Función para obtener reservas del SELLER filtradas por fecha
export const getSellerReservationsByDateRange = (
  sellerUserId: string,
  fromDate: string,
  toDate: string
): ReservaItem[] => {
  const allReservations = getReservasBySellerUserId(sellerUserId);
  
  return allReservations.filter(reservation => {
    const reservationDate = reservation.date;
    return reservationDate >= fromDate && reservationDate <= toDate;
  });
}; 
 