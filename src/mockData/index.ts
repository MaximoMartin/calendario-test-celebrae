import type { User, Shop, Kit, Booking, BusinessHours, TimeSlot, BookingSettings, ShopException, AvailabilityBlock } from '../types';

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "ADMIN"],
  phoneNumber: "3515050672"
};

export const mockBusinessHours: BusinessHours[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isActive: true }, // Monday
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isActive: true }, // Tuesday
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isActive: true }, // Wednesday
  { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isActive: true }, // Thursday
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true }, // Friday
  { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true }, // Saturday
  { dayOfWeek: 0, startTime: "10:00", endTime: "14:00", isActive: false }, // Sunday
];

export const mockBookingSettings: BookingSettings = {
  hoursBeforeBooking: 24,
  maxAdvanceBookingDays: 30,
  allowSameDayBooking: false,
  autoConfirmBookings: false
};

export const mockShop: Shop = {
  id: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
  name: "La vuelta del Maxi",
  address: "Via Catania, 12, Turin, Italy",
  shopStatus: "ENABLED",
  userId: "87IZYWdezwJQsILiU57z",
  businessHours: mockBusinessHours,
  bookingSettings: mockBookingSettings
};

export const mockTimeSlots: TimeSlot[] = [
  // Car Rental Catania Italy
  { id: "ts1", kitId: "5b9e0bd3-a992-440e-8610-51ed43467fe9", startTime: "09:00", endTime: "12:00", maxBookings: 2, isActive: true },
  { id: "ts2", kitId: "5b9e0bd3-a992-440e-8610-51ed43467fe9", startTime: "14:00", endTime: "17:00", maxBookings: 2, isActive: true },
  
  // Cena Romántica Premium
  { id: "ts3", kitId: "kit2", startTime: "19:00", endTime: "22:00", maxBookings: 4, isActive: true },
  { id: "ts3b", kitId: "kit2", startTime: "21:00", endTime: "24:00", maxBookings: 3, isActive: true },
  
  // Cata de Vinos Exclusiva
  { id: "ts4", kitId: "kit3", startTime: "10:00", endTime: "11:30", maxBookings: 8, isActive: true },
  { id: "ts5", kitId: "kit3", startTime: "15:00", endTime: "16:30", maxBookings: 8, isActive: true },
  { id: "ts5b", kitId: "kit3", startTime: "17:00", endTime: "18:30", maxBookings: 6, isActive: true },
  
  // Tour Fotográfico Barcelona
  { id: "ts6", kitId: "kit4", startTime: "08:00", endTime: "12:00", maxBookings: 3, isActive: true },
  { id: "ts7", kitId: "kit4", startTime: "14:00", endTime: "18:00", maxBookings: 3, isActive: true },
  
  // Clase de Cocina Italiana
  { id: "ts8", kitId: "kit5", startTime: "10:00", endTime: "12:30", maxBookings: 2, isActive: true },
  { id: "ts9", kitId: "kit5", startTime: "16:00", endTime: "18:30", maxBookings: 2, isActive: true },
  
  // Spa Day Completo
  { id: "ts10", kitId: "kit6", startTime: "09:00", endTime: "15:00", maxBookings: 4, isActive: true },
  { id: "ts11", kitId: "kit6", startTime: "10:00", endTime: "16:00", maxBookings: 4, isActive: true },
  
  // Kayak + Snorkel Mallorca
  { id: "ts12", kitId: "kit7", startTime: "09:00", endTime: "12:30", maxBookings: 2, isActive: true },
  { id: "ts13", kitId: "kit7", startTime: "14:00", endTime: "17:30", maxBookings: 2, isActive: true },
  
  // Sesión Yoga al Amanecer
  { id: "ts14", kitId: "kit8", startTime: "06:00", endTime: "07:30", maxBookings: 1, isActive: true },
  { id: "ts15", kitId: "kit8", startTime: "07:00", endTime: "08:30", maxBookings: 1, isActive: true },
  
  // Escape Room VIP
  { id: "ts16", kitId: "kit9", startTime: "10:00", endTime: "12:00", maxBookings: 3, isActive: true },
  { id: "ts17", kitId: "kit9", startTime: "15:00", endTime: "17:00", maxBookings: 3, isActive: true },
  { id: "ts18", kitId: "kit9", startTime: "18:00", endTime: "20:00", maxBookings: 3, isActive: true },
  
  // Paseo en Globo Aerostático
  { id: "ts19", kitId: "kit10", startTime: "06:00", endTime: "11:00", maxBookings: 1, isActive: true },
  { id: "ts20", kitId: "kit10", startTime: "15:00", endTime: "20:00", maxBookings: 1, isActive: true },
];

export const mockKits: Kit[] = [
  {
    id: "5b9e0bd3-a992-440e-8610-51ed43467fe9",
    name: "Car Rental Catania Italy",
    price: 120,
    maxCapacity: 4,
    duration: 180, // 3 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "5b9e0bd3-a992-440e-8610-51ed43467fe9")
  },
  {
    id: "kit2",
    name: "Cena Romántica Premium",
    price: 85,
    maxCapacity: 2,
    duration: 180, // 3 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit2")
  },
  {
    id: "kit3",
    name: "Cata de Vinos Exclusiva",
    price: 45,
    maxCapacity: 8,
    duration: 90, // 1.5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit3")
  },
  // Más kits para simular diferentes negocios y experiencias
  {
    id: "kit4",
    name: "Tour Fotográfico Barcelona",
    price: 75,
    maxCapacity: 6,
    duration: 240, // 4 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit4")
  },
  {
    id: "kit5",
    name: "Clase de Cocina Italiana",
    price: 95,
    maxCapacity: 10,
    duration: 150, // 2.5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit5")
  },
  {
    id: "kit6",
    name: "Spa Day Completo",
    price: 180,
    maxCapacity: 1,
    duration: 360, // 6 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit6")
  },
  {
    id: "kit7",
    name: "Kayak + Snorkel Mallorca",
    price: 65,
    maxCapacity: 8,
    duration: 210, // 3.5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit7")
  },
  {
    id: "kit8",
    name: "Sesión Yoga al Amanecer",
    price: 35,
    maxCapacity: 15,
    duration: 90, // 1.5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit8")
  },
  {
    id: "kit9",
    name: "Escape Room VIP",
    price: 150,
    maxCapacity: 6,
    duration: 120, // 2 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit9")
  },
  {
    id: "kit10",
    name: "Paseo en Globo Aerostático",
    price: 220,
    maxCapacity: 4,
    duration: 300, // 5 hours
    items: [],
    extras: [],
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    slots: mockTimeSlots.filter(slot => slot.kitId === "kit10")
  }
];

export const mockBookings: Booking[] = [
  // Reservas para junio 2025
  {
    id: "booking1",
    kitId: "5b9e0bd3-a992-440e-8610-51ed43467fe9",
    kitName: "Car Rental Catania Italy",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Juan Pérez",
    customerEmail: "juan.perez@email.com",
    customerPhone: "+34 600 123 456",
    date: "2025-06-25",
    timeSlot: "09:00",
    numberOfPeople: 2,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-20T10:30:00Z",
    notes: "Reserva online confirmada"
  },
  {
    id: "booking2",
    kitId: "kit2",
    kitName: "Cena Romántica Premium",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Ana García",
    customerEmail: "ana.garcia@email.com",
    customerPhone: "+34 600 789 012",
    date: "2025-06-26",
    timeSlot: "19:00",
    numberOfPeople: 2,
    status: "PENDING",
    isManual: true,
    createdAt: "2025-06-22T15:45:00Z",
    notes: "Reserva telefónica - Aniversario"
  },
  {
    id: "booking3",
    kitId: "kit3",
    kitName: "Cata de Vinos Exclusiva",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Carlos Martín",
    customerEmail: "carlos.martin@email.com",
    customerPhone: "+34 600 345 678",
    date: "2025-06-27",
    timeSlot: "15:00",
    numberOfPeople: 4,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-21T09:15:00Z"
  },
  {
    id: "booking4",
    kitId: "kit4",
    kitName: "Tour Fotográfico Barcelona",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "María López",
    customerEmail: "maria.lopez@email.com",
    customerPhone: "+34 600 901 234",
    date: "2025-06-28",
    timeSlot: "08:00",
    numberOfPeople: 3,
    status: "CONFIRMED",
    isManual: true,
    createdAt: "2025-06-23T11:20:00Z",
    notes: "Cliente VIP - Descuento aplicado"
  },
  {
    id: "booking5",
    kitId: "kit5",
    kitName: "Clase de Cocina Italiana",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Roberto Silva",
    customerEmail: "roberto.silva@email.com",
    customerPhone: "+34 600 555 123",
    date: "2025-06-29",
    timeSlot: "10:00",
    numberOfPeople: 6,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-24T08:30:00Z",
    notes: "Grupo empresarial"
  },
  {
    id: "booking6",
    kitId: "kit6",
    kitName: "Spa Day Completo",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Laura Fernández",
    customerEmail: "laura.fernandez@email.com",
    customerPhone: "+34 600 777 890",
    date: "2025-06-30",
    timeSlot: "09:00",
    numberOfPeople: 1,
    status: "CONFIRMED",
    isManual: true,
    createdAt: "2025-06-23T14:15:00Z",
    notes: "Regalo de cumpleaños"
  },
  {
    id: "booking7",
    kitId: "kit7",
    kitName: "Kayak + Snorkel Mallorca",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Pedro Martínez",
    customerEmail: "pedro.martinez@email.com",
    customerPhone: "+34 600 333 456",
    date: "2025-06-25",
    timeSlot: "09:00",
    numberOfPeople: 4,
    status: "PENDING",
    isManual: false,
    createdAt: "2025-06-22T16:45:00Z",
    notes: "Vacaciones familiares"
  },
  {
    id: "booking8",
    kitId: "kit8",
    kitName: "Sesión Yoga al Amanecer",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Sofia Ruiz",
    customerEmail: "sofia.ruiz@email.com",
    customerPhone: "+34 600 222 789",
    date: "2025-06-26",
    timeSlot: "06:00",
    numberOfPeople: 1,
    status: "CONFIRMED",
    isManual: true,
    createdAt: "2025-06-21T19:30:00Z",
    notes: "Experiencia de bienestar"
  },
  {
    id: "booking9",
    kitId: "kit9",
    kitName: "Escape Room VIP",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Daniel Torres",
    customerEmail: "daniel.torres@email.com",
    customerPhone: "+34 600 111 234",
    date: "2025-06-27",
    timeSlot: "18:00",
    numberOfPeople: 5,
    status: "CONFIRMED",
    isManual: false,
    createdAt: "2025-06-20T12:00:00Z",
    notes: "Despedida de soltero"
  },
  {
    id: "booking10",
    kitId: "kit10",
    kitName: "Paseo en Globo Aerostático",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Carmen Herrera",
    customerEmail: "carmen.herrera@email.com",
    customerPhone: "+34 600 999 567",
    date: "2025-06-28",
    timeSlot: "06:00",
    numberOfPeople: 2,
    status: "CANCELLED",
    isManual: true,
    createdAt: "2025-06-19T10:45:00Z",
    notes: "Cancelado por mal tiempo"
  },
  // Más reservas para mostrar variedad
  {
    id: "booking11",
    kitId: "kit3",
    kitName: "Cata de Vinos Exclusiva",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Alberto Vega",
    customerEmail: "alberto.vega@email.com",
    customerPhone: "+34 600 444 123",
    date: "2025-06-29",
    timeSlot: "17:00",
    numberOfPeople: 3,
    status: "PENDING",
    isManual: false,
    createdAt: "2025-06-24T13:20:00Z",
    notes: "Evento corporativo"
  },
  {
    id: "booking12",
    kitId: "kit2",
    kitName: "Cena Romántica Premium",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    customerName: "Elena Castillo",
    customerEmail: "elena.castillo@email.com",
    customerPhone: "+34 600 666 789",
    date: "2025-06-30",
    timeSlot: "21:00",
    numberOfPeople: 2,
    status: "CONFIRMED",
    isManual: true,
    createdAt: "2025-06-24T18:00:00Z",
    notes: "Cena de aniversario - mesa privada"
  }
]; 

// Excepciones del negocio
export const mockExceptions: ShopException[] = [
  {
    id: "exc1",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    date: "2025-06-29",
    type: "PRIVATE_EVENT",
    title: "Evento Privado - Boda VIP",
    description: "Toda la instalación reservada para boda privada",
    affectedKits: [], // afecta a todos los kits
    isActive: true,
    createdAt: "2025-06-15T10:00:00Z"
  },
  {
    id: "exc2",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    date: "2025-06-30",
    type: "SPECIAL_HOURS",
    title: "Horario Especial - Fin de Mes",
    description: "Horario extendido por alta demanda",
    specialHours: {
      startTime: "06:00",
      endTime: "24:00"
    },
    affectedKits: ["kit6", "kit8"], // Solo Spa y Yoga
    isActive: true,
    createdAt: "2025-06-20T14:30:00Z"
  },
  {
    id: "exc3",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    date: "2025-06-25",
    type: "MAINTENANCE",
    title: "Mantenimiento Equipos Acuáticos",
    description: "Revisión y mantenimiento de equipos de kayak",
    affectedKits: ["kit7"], // Solo Kayak
    isActive: true,
    createdAt: "2025-06-18T09:15:00Z"
  }
];

// Bloques de disponibilidad avanzada
export const mockAvailabilityBlocks: AvailabilityBlock[] = [
  {
    id: "block1",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    kitId: "kit10", // Globo aerostático
    startDate: "2025-06-25",
    endDate: "2025-06-27",
    type: "BLOCKED",
    reason: "Condiciones meteorológicas adversas",
    isActive: true
  },
  {
    id: "block2",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    startDate: "2025-06-28",
    endDate: "2025-06-30",
    type: "SPECIAL_PRICING",
    reason: "Promoción fin de semana premium",
    settings: {
      priceMultiplier: 1.5
    },
    isActive: true
  },
  {
    id: "block3",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    kitId: "kit5", // Cocina italiana
    startDate: "2025-06-26",
    endDate: "2025-06-28",
    type: "LIMITED_CAPACITY",
    reason: "Chef invitado - plazas limitadas",
    settings: {
      maxBookings: 1
    },
    isActive: true
  }
];