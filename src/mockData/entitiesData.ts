import type { 
  ExtendedUser, 
  ExtendedShop, 
  Bundle, 
  Item, 
  Extra
} from '../types';

// 📌 MOCKS REALISTAS - CHECKPOINT 1
// Datos de ejemplo basados en el sistema de producción con Firebase

// ===== USUARIO EXTENDIDO =====
export const mockExtendedUser: ExtendedUser = {
  // Datos base existentes (compatibilidad)
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi", 
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "ADMIN", "BUYER", "ESSENTIAL"],
  phoneNumber: "3515050672",
  
  // Información de negocio
  businessInfo: {
    businessName: "Grupo Lanfranchi Experiences",
    businessType: "Turismo y Experiencias",
    taxId: "20-35050672-8",
    website: "https://lanfranchi-experiences.com",
    description: "Especialistas en experiencias únicas y servicios premium en múltiples ubicaciones"
  },
  
  // Configuración de cuenta
  accountSettings: {
    timezone: "America/Argentina/Buenos_Aires",
    language: "es-AR",
    currency: "EUR", // Opera en Europa principalmente
    emailNotifications: true,
    smsNotifications: false
  },
  
  // Metadatos
  createdAt: "2023-06-15T10:30:00Z",
  updatedAt: "2025-01-26T14:22:00Z",
  lastLoginAt: "2025-01-26T14:22:00Z"
};

// ===== SHOPS EXTENDIDOS =====
export const mockExtendedShops: ExtendedShop[] = [
  {
    // Datos base existentes (compatibilidad)
    id: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    name: "La vuelta del Maxi",
    address: "Via Catania, 12, Turin, Italy",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    
    // Información extendida
    description: "Experiencias premium en el corazón de Turín. Ofrecemos desde alquiler de vehículos hasta experiencias de spa y catas exclusivas.",
    imageUrls: [
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ],
    category: "Experiencias y Servicios",
    subCategory: "Turismo Premium",
    
    // Configuración de servicios
    serviceSettings: {
      allowOnlineBooking: true,
      requiresPhoneConfirmation: false,
      autoAcceptBookings: false,
      maxAdvanceBookingDays: 60,
      minAdvanceBookingHours: 24
    },
    
    // Ubicación detallada
    location: {
      latitude: 45.0703,
      longitude: 7.6869,
      city: "Turin",
      state: "Piemonte",
      country: "Italy",
      postalCode: "10129"
    },
    
    // Información de contacto
    contactInfo: {
      phone: "+39 011 1234567",
      email: "turin@lanfranchi-experiences.com",
      website: "https://turin.lanfranchi-experiences.com",
      socialMedia: {
        instagram: "@lavueltadelmaxi",
        facebook: "lavueltadelmaxi"
      }
    },
    
    // Metadatos
    createdAt: "2023-08-20T09:15:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },
  
  {
    // Café Delicias
    id: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    name: "Café Delicias",
    address: "Centro de la ciudad",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    
    description: "Café boutique especializado en experiencias gastronómicas y educativas. Desde brunchs gourmet hasta clases magistrales de barista.",
    imageUrls: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"
    ],
    category: "Gastronomía",
    subCategory: "Café Experiencial",
    
    serviceSettings: {
      allowOnlineBooking: true,
      requiresPhoneConfirmation: true,
      autoAcceptBookings: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 4
    },
    
    location: {
      latitude: -31.4201,
      longitude: -64.1888,
      city: "Córdoba",
      state: "Córdoba",
      country: "Argentina",
      postalCode: "5000"
    },
    
    contactInfo: {
      phone: "+54 351 123-4567",
      email: "reservas@cafedelicias.com.ar",
      website: "https://cafedelicias.com.ar",
      socialMedia: {
        instagram: "@cafedelicias",
        facebook: "cafedeliciascba"
      }
    },
    
    createdAt: "2023-09-10T11:30:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },
  
  {
    // El mono épico editado  
    id: "75cdf85a-67f9-40c4-9fc1-ee1019138bec",
    name: "El mono epico editado",
    address: "Arroyito 8767, Córdoba, Argentina",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    
    description: "Experiencias gastronómicas únicas y temáticas. Un concepto innovador que combina gastronomía, entretenimiento y aventura.",
    imageUrls: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
    ],
    category: "Entretenimiento",
    subCategory: "Experiencias Temáticas",
    
    serviceSettings: {
      allowOnlineBooking: true,
      requiresPhoneConfirmation: false,
      autoAcceptBookings: false,
      maxAdvanceBookingDays: 21,
      minAdvanceBookingHours: 12
    },
    
    location: {
      latitude: -31.3836,
      longitude: -64.2376,
      city: "Córdoba",
      state: "Córdoba",
      country: "Argentina",
      postalCode: "5147"
    },
    
    contactInfo: {
      phone: "+54 351 987-6543",
      email: "info@elmonoepico.com",
      socialMedia: {
        instagram: "@elmonoepico",
        facebook: "elmonoepicoeditado"
      }
    },
    
    createdAt: "2023-10-05T16:45:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  }
];

// ===== ITEMS =====
export const mockItems: Item[] = [
  // Items para "La vuelta del Maxi" - Bundle de Alquiler de Autos
  {
    id: "item_auto_vw_jetta",
    title: "Volkswagen Jetta o similar",
    description: "Vehículo económico ideal para la ciudad. Incluye: Radio AM/FM, Control de crucero, Aire acondicionado, Bluetooth, Tracción delantera, Motor a gasolina.",
    price: 85,
    isForAdult: true,
    size: 5, // capacidad de pasajeros
    bundleId: "bundle_auto_paris",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: true, // se cobra por grupo/auto completo, no por persona
    bookingConfig: {
      maxCapacity: 5,
      duration: 180, // 3 horas
      requiresConfirmation: true,
      advanceBookingDays: 7,
      // 🎯 CHECKPOINT 4: Configuración específica para grupos
      groupCapacity: 5, // capacidad del grupo
      isExclusive: true // solo 1 grupo puede reservar este auto por horario
    },
    isActive: true,
    order: 1,
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },
  
  {
    id: "item_auto_bmw_x3",
    title: "BMW X3 o similar (Premium)",
    description: "SUV premium con todas las comodidades. GPS integrado, asientos de cuero, sistema de sonido premium, cámaras de seguridad.",
    price: 140,
    isForAdult: true,
    size: 5,
    bundleId: "bundle_auto_paris",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES 
    isPerGroup: true, // se cobra por grupo/auto completo, no por persona
    bookingConfig: {
      maxCapacity: 5,
      duration: 180,
      requiresConfirmation: true,
      advanceBookingDays: 14,
      // 🎯 CHECKPOINT 4: Configuración específica para grupos
      groupCapacity: 5, // capacidad del grupo
      isExclusive: true // solo 1 grupo puede reservar este auto por horario
    },
    isActive: true,
    order: 2,
    createdAt: "2023-08-20T10:15:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Items para Bundle de Spa
  {
    id: "item_spa_masaje_completo",
    title: "Masaje Relajante de Cuerpo Completo",
    description: "Masaje profesional de 90 minutos con aceites esenciales y técnicas de relajación profunda.",
    price: 85,
    isForAdult: true,
    size: 1,
    bundleId: "bundle_spa_day",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona individual
    bookingConfig: {
      maxCapacity: 1,
      duration: 90,
      requiresConfirmation: false,
      advanceBookingDays: 3
    },
    isActive: true,
    order: 1,
    createdAt: "2023-08-20T11:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "item_spa_facial_premium",
    title: "Tratamiento Facial Premium",
    description: "Limpieza profunda, exfoliación, mascarilla hidratante y masaje facial con productos orgánicos de lujo.",
    price: 65,
    isForAdult: true,
    size: 1,
    bundleId: "bundle_spa_day",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona individual
    bookingConfig: {
      maxCapacity: 1,
      duration: 60,
      requiresConfirmation: false,
      advanceBookingDays: 3
    },
    isActive: true,
    order: 2,
    createdAt: "2023-08-20T11:15:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Items para Café Delicias - Bundle Brunch
  {
    id: "item_brunch_continental",
    title: "Brunch Continental Gourmet",
    description: "Selección de panes artesanales, quesos importados, frutas frescas, jamón ibérico y café de especialidad.",
    price: 32,
    isForAdult: false, // apto para familias
    size: 2,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona
    bookingConfig: {
      maxCapacity: 2,
      duration: 120,
      requiresConfirmation: false,
      advanceBookingDays: 1
    },
    isActive: true,
    order: 1,
    createdAt: "2023-09-10T12:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "item_brunch_americano",
    title: "Brunch Americano Completo",
    description: "Pancakes, huevos Benedict, tocino crujiente, hash browns, jugo natural y café americano.",
    price: 28,
    isForAdult: false,
    size: 2,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona
    bookingConfig: {
      maxCapacity: 2,
      duration: 120,
      requiresConfirmation: false,
      advanceBookingDays: 1
    },
    isActive: true,
    order: 2,
    createdAt: "2023-09-10T12:15:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // 🎯 CHECKPOINT 4: NUEVOS ITEMS GRUPALES COMO EJEMPLOS
  {
    id: "item_escape_room_mystery",
    title: "Escape Room: Misterio del Palacio",
    description: "Experiencia inmersiva de escape room para grupos de 2-6 personas. Resuelve el misterio del palacio encantado trabajando en equipo.",
    price: 120, // precio fijo por grupo completo
    isForAdult: false,
    size: 6,
    bundleId: "bundle_brunch_especial", // lo agregamos a un bundle existente por ahora
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: true, // se cobra por grupo completo, no por persona
    bookingConfig: {
      maxCapacity: 6,
      duration: 60,
      requiresConfirmation: false,
      advanceBookingDays: 2,
      // 🎯 CHECKPOINT 4: Configuración específica para grupos
      groupCapacity: 6, // capacidad del grupo
      isExclusive: true // solo 1 grupo puede usar el escape room por horario
    },
    isActive: true,
    order: 3,
    createdAt: "2025-01-26T14:22:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  {
    id: "item_city_tour_guiado",
    title: "City Tour con Guía Profesional",
    description: "Tour privado por los sitios más emblemáticos de la ciudad con guía profesional bilingüe. Incluye transporte y entrada a 2 atracciones.",
    price: 200, // precio fijo por grupo hasta 8 personas
    isForAdult: false,
    size: 8,
    bundleId: "bundle_brunch_especial", // lo agregamos a un bundle existente por ahora
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: true, // se cobra por grupo completo, no por persona
    bookingConfig: {
      maxCapacity: 8,
      duration: 240, // 4 horas
      requiresConfirmation: true,
      advanceBookingDays: 5,
      // 🎯 CHECKPOINT 4: Configuración específica para grupos
      groupCapacity: 8, // capacidad del grupo
      isExclusive: true // solo 1 grupo por tour
    },
    isActive: true,
    order: 4,
    createdAt: "2025-01-26T14:22:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  }
];

// ===== EXTRAS =====
export const mockExtras: Extra[] = [
  // Extras para Bundle de Autos
  {
    id: "extra_auto_porta_equipaje",
    title: "Porta equipaje parisino",
    description: "Elegante porta equipaje adicional estilo parisino para mayor capacidad de almacenamiento.",
    price: 15,
    isForAdult: false,
    bundleId: "bundle_auto_paris",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se puede agregar por unidades, no por grupo
    quantity: 0,
    maxQuantity: 2,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2023-08-20T10:30:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "extra_auto_gps_premium",
    title: "GPS Premium con guía turística",
    description: "GPS profesional con información turística integrada y mapas offline de toda Francia.",
    price: 25,
    isForAdult: false,
    bundleId: "bundle_auto_paris",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: true, // solo 1 GPS por auto/grupo
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 2,
    createdAt: "2023-08-20T10:45:00Z", 
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "extra_auto_seguro_premium",
    title: "Seguro Premium sin franquicia",
    description: "Cobertura completa sin deducible, incluye robo, daños y asistencia 24h.",
    price: 45,
    isForAdult: false,
    bundleId: "bundle_auto_paris",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES Y RELACIONES CONDICIONALES
    isPerGroup: true, // seguro por auto/grupo completo
    // 🎯 CHECKPOINT 4: RELACIONES CONDICIONALES
    requiredItemId: "item_auto_bmw_x3", // solo disponible si se reserva el BMW X3
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 3,
    createdAt: "2023-08-20T11:00:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Extras para Spa
  {
    id: "extra_spa_aromaterapia",
    title: "Sesión de Aromaterapia",
    description: "30 minutos adicionales de relajación con aceites esenciales y música terapéutica.",
    price: 35,
    isForAdult: true,
    bundleId: "bundle_spa_day",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2023-08-20T11:30:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "extra_spa_almuerzo_detox",
    title: "Almuerzo Detox Saludable",
    description: "Menú especialmente diseñado con ingredientes orgánicos para complementar tu experiencia de spa.",
    price: 22,
    isForAdult: false,
    bundleId: "bundle_spa_day",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por persona
    quantity: 0,
    maxQuantity: 2,
    isRequired: false,
    isActive: true,
    order: 2,
    createdAt: "2023-08-20T11:45:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // Extras para Brunch
  {
    id: "extra_brunch_mimosa",
    title: "Cóctel Mimosa Premium",
    description: "Refrescante cóctel con champagne francés y jugo de naranja natural recién exprimido.",
    price: 12,
    isForAdult: true,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por unidad/persona
    quantity: 0,
    maxQuantity: 4,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2023-09-10T12:30:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  {
    id: "extra_brunch_postre",
    title: "Selección de Postres Artesanales",
    description: "Variedad de postres caseros: tiramisu, cheesecake de frutos rojos y brownie de chocolate belga.",
    price: 8,
    isForAdult: false,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
    isPerGroup: false, // se cobra por unidad
    quantity: 0,
    maxQuantity: 6,
    isRequired: false,
    isActive: true,
    order: 2,
    createdAt: "2023-09-10T12:45:00Z",
    updatedAt: "2024-12-15T09:30:00Z"
  },

  // 🎯 CHECKPOINT 4: NUEVOS EXTRAS GRUPALES CON RELACIONES CONDICIONALES
  {
    id: "extra_escape_room_fotografo",
    title: "Fotógrafo Profesional para el Grupo",
    description: "Sesión fotográfica profesional durante la experiencia del escape room. Incluye 20 fotos editadas digitales.",
    price: 80, // precio fijo por grupo
    isForAdult: false,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES Y RELACIONES CONDICIONALES
    isPerGroup: true, // se cobra por grupo completo, no por persona
    // 🎯 CHECKPOINT 4: RELACIONES CONDICIONALES
    requiredItemId: "item_escape_room_mystery", // solo disponible si se reserva el escape room
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 3,
    createdAt: "2025-01-26T14:22:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  {
    id: "extra_city_tour_almuerzo_tradicional",
    title: "Almuerzo Tradicional Incluido",
    description: "Almuerzo en restaurante local tradicional con menú típico de 3 tiempos y bebidas incluidas.",
    price: 150, // precio fijo por grupo hasta 8 personas
    isForAdult: false,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES Y RELACIONES CONDICIONALES
    isPerGroup: true, // se cobra por grupo completo
    // 🎯 CHECKPOINT 4: RELACIONES CONDICIONALES
    requiredItemId: "item_city_tour_guiado", // solo disponible si se reserva el city tour
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 4,
    createdAt: "2025-01-26T14:22:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  {
    id: "extra_transporte_privado_grupo",
    title: "Transporte Privado para el Grupo",
    description: "Servicio de transporte privado desde y hacia el hotel. Vehículo premium con chofer profesional.",
    price: 60, // precio fijo por grupo
    isForAdult: false,
    bundleId: "bundle_brunch_especial",
    // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES (SIN RELACIÓN CONDICIONAL)
    isPerGroup: true, // se cobra por grupo completo
    quantity: 0,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 5,
    createdAt: "2025-01-26T14:22:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  }
];

// ===== BUNDLES =====
export const mockBundles: Bundle[] = [
  {
    id: "bundle_auto_paris",
    name: "Alquiler de Autos en París, Francia",
    description: "Descubre París con total libertad. Nuestro servicio de alquiler incluye vehículos modernos, seguros y perfectamente mantenidos para que explores la Ciudad Luz a tu ritmo.",
    shortDescription: "Alquiler de vehículos premium para explorar París",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    
    // Contenido del bundle
    items: mockItems.filter(item => item.bundleId === "bundle_auto_paris"),
    extras: mockExtras.filter(extra => extra.bundleId === "bundle_auto_paris"),
    
    // Configuración general
    basePrice: 65, // precio base sin items/extras
    maxCapacity: 5,
    duration: 180, // 3 horas estándar
    
    // Configuración de reservas
    bookingSettings: {
      allowInstantBooking: false,
      requiresApproval: true,
      cancellationPolicy: "Cancelación gratuita hasta 24h antes. Después se aplica 50% del costo.",
      refundPolicy: "Reembolso completo por cancelaciones anticipadas. Reembolso parcial por modificaciones."
    },
    
    // Presentación
    imageUrls: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd"
    ],
    tags: ["alquiler", "autos", "paris", "turismo", "premium"],
    
    // Metadatos
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: "2023-08-20T09:00:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  {
    id: "bundle_spa_day",
    name: "Spa Day Premium Completo",
    description: "Una experiencia de relajación total que incluye tratamientos corporales y faciales de lujo. Perfecto para desconectar del estrés y renovar energías en un ambiente exclusivo.",
    shortDescription: "Día completo de spa con tratamientos premium",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    
    items: mockItems.filter(item => item.bundleId === "bundle_spa_day"),
    extras: mockExtras.filter(extra => extra.bundleId === "bundle_spa_day"),
    
    basePrice: 120,
    maxCapacity: 1,
    duration: 360, // 6 horas
    
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 48h antes. Después se aplica cargo del 30%.",
      refundPolicy: "Reembolso completo por cancelaciones con 48h de anticipación."
    },
    
    imageUrls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f"
    ],
    tags: ["spa", "relajacion", "masajes", "tratamientos", "premium", "bienestar"],
    
    isActive: true,
    isFeatured: true,
    order: 2,
    createdAt: "2023-08-20T09:30:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  {
    id: "bundle_brunch_especial",
    name: "Brunch Especial Gourmet",
    description: "Una experiencia gastronómica matutina única. Disfruta de una selección cuidadosamente curada de platos internacionales en un ambiente acogedor y sofisticado.",
    shortDescription: "Brunch gourmet con opciones internacionales",
    shopId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    
    items: mockItems.filter(item => item.bundleId === "bundle_brunch_especial"),
    extras: mockExtras.filter(extra => extra.bundleId === "bundle_brunch_especial"),
    
    basePrice: 18,
    maxCapacity: 4,
    duration: 120, // 2 horas
    
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 2h antes del servicio.",
      refundPolicy: "Reembolso completo por cancelaciones anticipadas."
    },
    
    imageUrls: [
      "https://images.unsplash.com/photo-1551218808-94e220e084d2",
      "https://images.unsplash.com/photo-1464454709131-ffd692591ee5"
    ],
    tags: ["brunch", "gourmet", "gastronomia", "desayuno", "internacional"],
    
    isActive: true,
    isFeatured: false,
    order: 1,
    createdAt: "2023-09-10T11:00:00Z",
    updatedAt: "2025-01-26T14:22:00Z"
  },

  // 🎯 CHECKPOINT 5: Bundle adicional para testing de reglas de disponibilidad
  {
    id: "bundle_escape_aventura",
    name: "Escape Room: Aventura Misteriosa",
    description: "Vive una experiencia única en nuestro Escape Room temático. Resuelve enigmas, encuentra pistas y escapa antes de que se acabe el tiempo. Perfecto para grupos de amigos, parejas o actividades corporativas.",
    shortDescription: "Escape Room con enigmas y aventuras para grupos de 2-6 personas",
    shopId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f", // "La vuelta del Maxi"
    
    // Para este ejemplo, crearemos items específicos en tiempo de ejecución
    items: [],
    extras: [],
    
    basePrice: 0, // Sin precio base, se cobra por items
    maxCapacity: 8, // Capacidad máxima del bundle
    duration: 180, // Duración estimada máxima
    
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 24 horas antes. Después del límite: 50% del valor.",
      refundPolicy: "Reembolso completo por cancelación anticipada. Reembolso parcial por cancelación tardía."
    },
    
    imageUrls: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1560438718-eb61ede255eb?w=800"
    ],
    
    tags: ["Aventura", "Grupos", "Escape Room", "Misterio", "Entretenimiento", "Teambuilding"],
    
    isActive: true,
    isFeatured: true,
    order: 4,
    createdAt: "2025-01-20T09:30:00.000Z",
    updatedAt: "2025-01-20T09:30:00.000Z"
  }
];

// 📋 EXPORTACIONES PARA COMPATIBILIDAD
export {
  mockExtendedUser as extendedUser,
  mockExtendedShops as extendedShops,
  mockBundles as bundles,
  mockItems as items,
  mockExtras as extras
}; 