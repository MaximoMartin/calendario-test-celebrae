import type { 
  User, Shop, Bundle, BundleItem, BundleExtra, Resource, ItemTimeSlot, ItemResourceRequirement,
  Booking, BookingItemSelection, BookingExtraSelection, BookingResourceAssignment,
  BusinessHours, BookingSettings, ShopException, AvailabilityBlock,
  // Legacy para compatibilidad temporal
  Kit, TimeSlot
} from '../types';

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "BUYER", "ADMIN", "ESSENTIAL"],
  phoneNumber: "3515050672"
};

export const mockBusinessHours: BusinessHours[] = [
  { dayOfWeek: 1, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] },
  { dayOfWeek: 2, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] },
  { dayOfWeek: 3, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] },
  { dayOfWeek: 4, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] },
  { dayOfWeek: 5, isActive: true, periods: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:00", endTime: "18:00" }] },
  { dayOfWeek: 6, isActive: true, periods: [{ startTime: "10:00", endTime: "16:00" }] },
  { dayOfWeek: 0, isActive: false, periods: [{ startTime: "10:00", endTime: "14:00" }] },
];

export const mockBookingSettings: BookingSettings = {
  hoursBeforeBooking: 24,
  maxAdvanceBookingDays: 30,
  allowSameDayBooking: false,
  autoConfirmBookings: false,
  
  // NUEVAS CONFIGURACIONES
  allowPartialBookings: true,
  requireAllItemssametime: false,
  maxConcurrentBookingsPerCustomer: 3,
  
  cancellationPolicyHours: 48,
  modificationPolicyHours: 24,
  refundPolicy: 'PARTIAL'
};

// ==================== RECURSOS FÍSICOS ====================

export const mockResources: Resource[] = [
  // ESCAPE ROOM CENTER - La vuelta del Maxi
  {
    id: "resource_sala_egipcia",
    name: "Sala Egipcia",
    type: "ROOM",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    maxConcurrentUse: 1,
    description: "Sala temática egipcia con decoración inmersiva",
    isActive: true
  },
  {
    id: "resource_gamemaster_1",
    name: "Game Master Principal",
    type: "STAFF",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    maxConcurrentUse: 1,
    description: "Game Master experimentado para escape rooms",
    isActive: true
  },
  {
    id: "resource_equipo_sonido",
    name: "Sistema de Sonido Inmersivo",
    type: "EQUIPMENT",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    maxConcurrentUse: 2,
    description: "Sistema de audio y efectos especiales",
    isActive: true
  },

  // CAFÉ DELICIAS
  {
    id: "resource_mesa_vip_1",
    name: "Mesa VIP Romántica #1",
    type: "TABLE",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    maxConcurrentUse: 1,
    description: "Mesa para 2 personas con vista al jardín",
    isActive: true
  },
  {
    id: "resource_mesa_vip_2",
    name: "Mesa VIP Romántica #2",
    type: "TABLE",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    maxConcurrentUse: 1,
    description: "Mesa para 2 personas junto a la chimenea",
    isActive: true
  },
  {
    id: "resource_chef_especialista",
    name: "Chef Especialista en Barista",
    type: "STAFF",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    maxConcurrentUse: 1,
    description: "Chef certificado para clases de barista",
    isActive: true
  },
  {
    id: "resource_maquina_espresso",
    name: "Máquina Espresso Profesional",
    type: "EQUIPMENT",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    maxConcurrentUse: 6,
    description: "Máquina profesional para clases de barista",
    isActive: true
  },

  // EL MONO ÉPICO EDITADO
  {
    id: "resource_salon_principal",
    name: "Salón Principal",
    type: "ROOM",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    maxConcurrentUse: 1,
    description: "Salón principal para experiencias gastronómicas",
    isActive: true
  },
  {
    id: "resource_guia_gastronomico",
    name: "Guía Gastronómico",
    type: "STAFF",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    maxConcurrentUse: 1,
    description: "Guía especializado en experiencias gastronómicas",
    isActive: true
  }
];

// ==================== BUNDLES CON ITEMS Y EXTRAS ====================

export const mockBundles: Bundle[] = [
  // 🎯 LA VUELTA DEL MAXI - Escape Room Experience
  {
    id: "bundle_escape_egipto",
    name: "Aventura Egipcia Completa",
    description: "Escape room temático egipcio con experiencia inmersiva completa",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    
    items: [
      {
        id: "item_escape_egipcio",
        name: "Misión Egipcia - Escape Room",
        description: "Resuelve el misterio de la tumba del faraón en 60 minutos",
        price: 25,
        maxCapacity: 6,
        duration: 60,
        
        availableTimeSlots: [
          {
            id: "slot_egipcio_tarde_1",
            itemId: "item_escape_egipcio",
            startTime: "14:00",
            endTime: "15:00",
            daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
            maxBookings: 1,
            isActive: true,
            minimumAdvanceHours: 24
          },
          {
            id: "slot_egipcio_tarde_2",
            itemId: "item_escape_egipcio",
            startTime: "16:00",
            endTime: "17:00",
            daysOfWeek: [1, 2, 3, 4, 5],
            maxBookings: 1,
            isActive: true,
            minimumAdvanceHours: 24
          },
          {
            id: "slot_egipcio_noche",
            itemId: "item_escape_egipcio",
            startTime: "19:00",
            endTime: "20:00",
            daysOfWeek: [5, 6], // Viernes y Sábado
            maxBookings: 1,
            isActive: true,
            minimumAdvanceHours: 24,
            priceMultiplier: 1.2 // 20% más caro en horario nocturno
          }
        ],
        
        requiredResources: [
          {
            resourceId: "resource_sala_egipcia",
            quantityNeeded: 1,
            setupTimeMinutes: 15,
            cleanupTimeMinutes: 15,
            isOptional: false,
            alternativeResourceIds: []
          },
          {
            resourceId: "resource_gamemaster_1",
            quantityNeeded: 1,
            setupTimeMinutes: 5,
            cleanupTimeMinutes: 10,
            isOptional: false,
            alternativeResourceIds: []
          },
          {
            resourceId: "resource_equipo_sonido",
            quantityNeeded: 1,
            setupTimeMinutes: 5,
            cleanupTimeMinutes: 5,
            isOptional: false,
            alternativeResourceIds: []
          }
        ],
        
        isRequired: true,
        isActive: true,
        location: "Sala Egipcia - Planta Baja"
      }
    ],
    
    extras: [
      {
        id: "extra_foto_grupal",
        name: "Foto Grupal Temática",
        description: "Sesión de fotos con vestuario egipcio al finalizar",
        price: 15,
        maxQuantity: 1,
        isPerPerson: false,
        isActive: true
      },
      {
        id: "extra_bebida_tematica",
        name: "Bebida Temática por Persona",
        description: "Bebida especial inspirada en el antiguo Egipto",
        price: 8,
        maxQuantity: 6,
        isPerPerson: true,
        isActive: true
      }
    ],
    
    minItemsRequired: 1,
    maxItemsAllowed: 1,
    bundleDiscount: 0,
    isActive: true,
    tags: ["escape room", "aventura", "egipto", "inmersivo"],
    availableDays: [1, 2, 3, 4, 5, 6] // Lunes a Sábado
  },

  // 🍽️ CAFÉ DELICIAS - Experiencia Gastronómica Completa
  {
    id: "bundle_experiencia_completa",
    name: "Experiencia Gastronómica Completa",
    description: "De brunch a cena romántica con clase de barista incluida",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    
    items: [
      {
        id: "item_brunch_gourmet",
        name: "Brunch Gourmet Especial",
        description: "Brunch completo con productos artesanales y vista al jardín",
        price: 22,
        maxCapacity: 4,
        duration: 120,
        
        availableTimeSlots: [
          {
            id: "slot_brunch_temprano",
            itemId: "item_brunch_gourmet",
            startTime: "09:00",
            endTime: "11:00",
            daysOfWeek: [6, 0], // Sábado y Domingo
            maxBookings: 3,
            isActive: true
          },
          {
            id: "slot_brunch_tardio",
            itemId: "item_brunch_gourmet",
            startTime: "11:30",
            endTime: "13:30",
            daysOfWeek: [6, 0],
            maxBookings: 3,
            isActive: true
          }
        ],
        
        requiredResources: [
          {
            resourceId: "resource_mesa_vip_1",
            quantityNeeded: 1,
            setupTimeMinutes: 10,
            cleanupTimeMinutes: 15,
            isOptional: true,
            alternativeResourceIds: ["resource_mesa_vip_2"]
          }
        ],
        
        isRequired: false,
        isActive: true,
        canRunConcurrently: true
      },
      
      {
        id: "item_clase_barista",
        name: "Clase de Barista Profesional",
        description: "Aprende técnicas profesionales de preparación de café",
        price: 35,
        maxCapacity: 6,
        duration: 90,
        
        availableTimeSlots: [
          {
            id: "slot_barista_tarde",
            itemId: "item_clase_barista",
            startTime: "15:00",
            endTime: "16:30",
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            maxBookings: 1,
            isActive: true
          },
          {
            id: "slot_barista_noche",
            itemId: "item_clase_barista",
            startTime: "17:00",
            endTime: "18:30",
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            maxBookings: 1,
            isActive: true
          }
        ],
        
        requiredResources: [
          {
            resourceId: "resource_chef_especialista",
            quantityNeeded: 1,
            setupTimeMinutes: 15,
            cleanupTimeMinutes: 20,
            isOptional: false,
            alternativeResourceIds: []
          },
          {
            resourceId: "resource_maquina_espresso",
            quantityNeeded: 1,
            setupTimeMinutes: 10,
            cleanupTimeMinutes: 15,
            isOptional: false,
            alternativeResourceIds: []
          }
        ],
        
        isRequired: false,
        isActive: true,
        canRunConcurrently: false // Requiere atención exclusiva del chef
      },
      
      {
        id: "item_cena_romantica",
        name: "Cena Romántica Premium",
        description: "Menú degustación de 5 pasos con maridaje de vinos",
        price: 75,
        maxCapacity: 2,
        duration: 150,
        
        availableTimeSlots: [
          {
            id: "slot_cena_temprana",
            itemId: "item_cena_romantica",
            startTime: "19:00",
            endTime: "21:30",
            daysOfWeek: [5, 6], // Solo Viernes y Sábado
            maxBookings: 2,
            isActive: true
          },
          {
            id: "slot_cena_tardia",
            itemId: "item_cena_romantica",
            startTime: "21:45",
            endTime: "00:15",
            daysOfWeek: [5, 6],
            maxBookings: 2,
            isActive: true,
            priceMultiplier: 1.1 // 10% más caro en horario tardío
          }
        ],
        
        requiredResources: [
          {
            resourceId: "resource_mesa_vip_1",
            quantityNeeded: 1,
            setupTimeMinutes: 20,
            cleanupTimeMinutes: 25,
            isOptional: true,
            alternativeResourceIds: ["resource_mesa_vip_2"]
          }
        ],
        
        dependencies: [
          {
            dependsOnItemId: "item_clase_barista",
            type: "MUST_COMPLETE_BEFORE",
            timingOffsetMinutes: 60 // 1 hora después de la clase
          }
        ],
        
        isRequired: false,
        isActive: true,
        canRunConcurrently: true
      }
    ],
    
    extras: [
      {
        id: "extra_vino_premium",
        name: "Botella de Vino Premium",
        description: "Selección especial del sommelier",
        price: 45,
        maxQuantity: 2,
        isPerPerson: false,
        isActive: true
      },
      {
        id: "extra_postre_especial",
        name: "Postre Especial por Persona",
        description: "Creación exclusiva del chef pastelero",
        price: 12,
        maxQuantity: 10,
        isPerPerson: true,
        isActive: true
      }
    ],
    
    minItemsRequired: 1,
    maxItemsAllowed: 3,
    bundleDiscount: 0.1, // 10% de descuento si tomas el paquete completo
    isActive: true,
    tags: ["gastronómico", "romántico", "experiencia", "premium"]
  },

  // 🐒 EL MONO ÉPICO EDITADO - Experiencia Gastronómica Única
  {
    id: "bundle_mono_epico",
    name: "La Experiencia Mono Épica",
    description: "Almuerzo temático con presentación de chef y degustación única",
    shopId: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    
    items: [
      {
        id: "item_almuerzo_tematico",
        name: "Almuerzo Temático Mono Épico",
        description: "Menú temático con presentación del chef y historia del restaurante",
        price: 28,
        maxCapacity: 8,
        duration: 90,
        
        availableTimeSlots: [
          {
            id: "slot_almuerzo_primera",
            itemId: "item_almuerzo_tematico",
            startTime: "12:00",
            endTime: "13:30",
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            maxBookings: 1,
            isActive: true
          },
          {
            id: "slot_almuerzo_segunda",
            itemId: "item_almuerzo_tematico",
            startTime: "13:45",
            endTime: "15:15",
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            maxBookings: 1,
            isActive: true
          }
        ],
        
        requiredResources: [
          {
            resourceId: "resource_salon_principal",
            quantityNeeded: 1,
            setupTimeMinutes: 20,
            cleanupTimeMinutes: 25,
            isOptional: false,
            alternativeResourceIds: []
          },
          {
            resourceId: "resource_guia_gastronomico",
            quantityNeeded: 1,
            setupTimeMinutes: 10,
            cleanupTimeMinutes: 10,
            isOptional: false,
            alternativeResourceIds: []
          }
        ],
        
        isRequired: true,
        isActive: true,
        location: "Salón Principal"
      }
    ],
    
    extras: [
      {
        id: "extra_copa_bienvenida",
        name: "Copa de Bienvenida",
        description: "Cocktail especial de la casa",
        price: 8,
        maxQuantity: 8,
        isPerPerson: true,
        isActive: true
      },
      {
        id: "extra_recetario",
        name: "Recetario Mono Épico",
        description: "Libro con las recetas secretas del chef",
        price: 20,
        maxQuantity: 1,
        isPerPerson: false,
        isActive: true
      }
    ],
    
    minItemsRequired: 1,
    maxItemsAllowed: 1,
    isActive: true,
    tags: ["gastronómico", "temático", "único", "almuerzo"],
    availableDays: [1, 2, 3, 4, 5, 6]
  }
];

// ==================== SHOPS CON NUEVA ESTRUCTURA ====================

export const mockShops: Shop[] = [
  {
    id: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    name: "La vuelta del Maxi",
    address: "Via Catania, 12, Turin, Italy",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: mockBusinessHours,
    bookingSettings: mockBookingSettings,
    resources: mockResources.filter(r => r.shopId === "ab55132c-dcc8-40d6-9ac4-5f573285f55f")
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
      { dayOfWeek: 5, isActive: true, periods: [{ startTime: "08:00", endTime: "24:00" }] },
      { dayOfWeek: 6, isActive: true, periods: [{ startTime: "10:00", endTime: "24:00" }] },
      { dayOfWeek: 0, isActive: true, periods: [{ startTime: "10:00", endTime: "20:00" }] },
    ],
    bookingSettings: mockBookingSettings,
    resources: mockResources.filter(r => r.shopId === "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf")
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
    bookingSettings: mockBookingSettings,
    resources: mockResources.filter(r => r.shopId === "75cdf85a-67f9-40c4-9fc1-ee1019138bec")
  }
];

export const mockShop: Shop = mockShops[0];

// ==================== RESERVAS CON NUEVA ESTRUCTURA ====================

export const mockBookings: Booking[] = [
  // Reserva para Escape Room
  {
    id: "booking_1",
    bundleId: "bundle_escape_egipto",
    bundleName: "Aventura Egipcia Completa",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    
    customerName: "Ana García",
    customerEmail: "ana.garcia@example.com",
    customerPhone: "+34666123456",
    
    selectedItems: [
      {
        itemId: "item_escape_egipcio",
        selectedTimeSlotId: "slot_egipcio_tarde_1",
        numberOfPeople: 4,
        startTime: "14:00",
        endTime: "15:00",
        date: "2025-06-15",
        assignedResources: [
          {
            resourceId: "resource_sala_egipcia",
            quantityAssigned: 1,
            startTime: "14:00",
            endTime: "15:00",
            effectiveStartTime: "13:45", // 15 min setup
            effectiveEndTime: "15:15"   // 15 min cleanup
          },
          {
            resourceId: "resource_gamemaster_1",
            quantityAssigned: 1,
            startTime: "14:00",
            endTime: "15:00",
            effectiveStartTime: "13:55", // 5 min setup
            effectiveEndTime: "15:10"   // 10 min cleanup
          }
        ],
        itemPrice: 25,
        totalPrice: 100 // 25 * 4 personas
      }
    ],
    
    selectedExtras: [
      {
        extraId: "extra_foto_grupal",
        quantity: 1,
        totalPrice: 15
      },
      {
        extraId: "extra_bebida_tematica",
        quantity: 4,
        totalPrice: 32
      }
    ],
    
    earliestStartTime: "14:00",
    latestEndTime: "15:00",
    totalDuration: 60,
    
    date: "2025-06-15",
    createdAt: "2025-01-15T10:30:00Z",
    
    itemsTotal: 100,
    extrasTotal: 47,
    bundleDiscount: 0,
    finalTotal: 147,
    
    status: "CONFIRMED",
    isManual: false,
    notes: "Grupo de amigos celebrando cumpleaños"
  },

  // Reserva compleja para Café Delicias
  {
    id: "booking_2",
    bundleId: "bundle_experiencia_completa",
    bundleName: "Experiencia Gastronómica Completa",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    
    customerName: "Carlos y María Rodríguez",
    customerEmail: "carlos.maria@example.com",
    customerPhone: "+34666789012",
    
    selectedItems: [
      {
        itemId: "item_clase_barista",
        selectedTimeSlotId: "slot_barista_tarde",
        numberOfPeople: 2,
        startTime: "15:00",
        endTime: "16:30",
        date: "2025-06-20",
        assignedResources: [
          {
            resourceId: "resource_chef_especialista",
            quantityAssigned: 1,
            startTime: "15:00",
            endTime: "16:30",
            effectiveStartTime: "14:45", // 15 min setup
            effectiveEndTime: "16:50"   // 20 min cleanup
          }
        ],
        itemPrice: 35,
        totalPrice: 70 // 35 * 2 personas
      },
      {
        itemId: "item_cena_romantica",
        selectedTimeSlotId: "slot_cena_temprana",
        numberOfPeople: 2,
        startTime: "19:00",
        endTime: "21:30",
        date: "2025-06-20",
        assignedResources: [
          {
            resourceId: "resource_mesa_vip_1",
            quantityAssigned: 1,
            startTime: "19:00",
            endTime: "21:30",
            effectiveStartTime: "18:40", // 20 min setup
            effectiveEndTime: "21:55"   // 25 min cleanup
          }
        ],
        itemPrice: 75,
        totalPrice: 150 // 75 * 2 personas
      }
    ],
    
    selectedExtras: [
      {
        extraId: "extra_vino_premium",
        quantity: 1,
        totalPrice: 45
      },
      {
        extraId: "extra_postre_especial",
        quantity: 2,
        totalPrice: 24
      }
    ],
    
    earliestStartTime: "15:00",
    latestEndTime: "21:30",
    totalDuration: 390, // 6.5 horas total
    
    date: "2025-06-20",
    createdAt: "2025-01-18T14:22:00Z",
    
    itemsTotal: 220,
    extrasTotal: 69,
    bundleDiscount: 28.9, // 10% del total
    finalTotal: 260.1,
    
    status: "CONFIRMED",
    isManual: false,
    notes: "Aniversario de bodas - experiencia completa"
  }
];

// ==================== LEGACY COMPATIBILITY ====================
// Mantenemos los datos legacy para compatibilidad temporal

export const mockKits: Kit[] = mockBundles.map(bundle => ({
  id: bundle.id,
  name: bundle.name,
  price: bundle.items[0]?.price || 0,
  maxCapacity: bundle.items[0]?.maxCapacity || 1,
  duration: bundle.items[0]?.duration || 60,
  items: bundle.items,
  extras: bundle.extras,
  shopId: bundle.shopId,
  slots: bundle.items.flatMap(item => 
    item.availableTimeSlots.map(slot => ({
      id: slot.id,
      kitId: bundle.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxBookings: slot.maxBookings,
      isActive: slot.isActive
    }))
  )
}));

export const mockTimeSlots: TimeSlot[] = mockKits.flatMap(kit => kit.slots || []);

// Para mantener compatibilidad con componentes existentes
export const mockShopExceptions: ShopException[] = [];
export const mockAvailabilityBlocks: AvailabilityBlock[] = [];