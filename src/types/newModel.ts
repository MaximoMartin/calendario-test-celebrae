// ========================================
// NUEVO MODELO DE DATOS OPTIMIZADO
// ========================================

// Estados principales del sistema
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED' | 'PARTIAL_REFUND';
export type ResourceType = 'PERSON' | 'EQUIPMENT' | 'ROOM' | 'VEHICLE' | 'VIRTUAL_SPACE';
export type BundleCategory = 'EXPERIENCE' | 'SERVICE' | 'PRODUCT' | 'COURSE' | 'EVENT';

// ========================================
// ENTIDADES PRINCIPALES
// ========================================

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('SELLER' | 'ADMIN' | 'BUYER' | 'ESSENTIAL')[];
  phoneNumber: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  shopStatus: 'ENABLED' | 'DISABLED';
  userId: string;
  businessHours: BusinessHours[];
  bookingSettings: BookingSettings;
  resources: ShopResource[];
  exceptions: ShopException[];
}

// ========================================
// RECURSOS COMPARTIDOS
// ========================================

export interface ShopResource {
  id: string;
  shopId: string;
  name: string;
  type: ResourceType;
  capacity: number; // cuántas personas pueden usar este recurso simultáneamente
  isActive: boolean;
  description?: string;
  // Restricciones específicas
  constraints?: {
    minAdvanceBooking?: number; // minutos de anticipación
    maxUsageTime?: number; // tiempo máximo de uso en minutos
    cleaningTime?: number; // tiempo entre usos para limpieza/preparación
  };
}

// ========================================
// NUEVA JERARQUÍA: BUNDLE → ITEMS → EXTRAS
// ========================================

export interface Bundle {
  id: string;
  name: string;
  description: string;
  category: BundleCategory;
  shopId: string;
  basePrice: number;
  maxCapacity: number; // capacidad máxima del bundle completo
  isActive: boolean;
  items: BundleItem[]; // actividades principales con horarios
  extras: BundleExtra[]; // opcionales sin horarios específicos
  // Configuración global del bundle
  settings: {
    allowPartialBooking: boolean; // ¿se puede reservar solo algunos items?
    requiresSequentialBooking: boolean; // ¿los items deben reservarse en orden?
    advanceBookingDays: number;
    cancellationPolicy: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BundleItem {
  id: string;
  bundleId: string;
  name: string;
  description: string;
  price: number;
  maxCapacity: number;
  duration: number; // en minutos
  position: number; // orden dentro del bundle
  isRequired: boolean; // ¿es obligatorio este item?
  // AQUÍ VAN LOS HORARIOS Y RECURSOS
  timeSlots: ItemTimeSlot[];
  requiredResources: ItemResourceRequirement[];
  // Configuración específica del item
  settings: {
    isBookableIndividually: boolean; // ¿se puede reservar este item por separado?
    minAdvanceBooking: number; // minutos de anticipación
    maxAdvanceBookingDays: number;
    allowSameDayBooking: boolean;
  };
}

export interface BundleExtra {
  id: string;
  bundleId: string;
  name: string;
  description: string;
  price: number;
  maxQuantity: number;
  isActive: boolean;
  category: 'EQUIPMENT' | 'SERVICE' | 'UPGRADE' | 'ADDON';
  // Los extras no tienen horarios específicos, pero pueden tener recursos
  resourceRequirements?: ItemResourceRequirement[];
}

// ========================================
// GESTIÓN DE HORARIOS Y RECURSOS POR ITEM
// ========================================

export interface ItemTimeSlot {
  id: string;
  itemId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  daysOfWeek: number[]; // [1,2,3,4,5] para lunes a viernes
  maxBookings: number; // cuántas reservas simultáneas permite este slot
  isActive: boolean;
  // Información específica del slot
  metadata: {
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    isPopular?: boolean;
    seasonalPricing?: number; // multiplicador de precio
  };
}

export interface ItemResourceRequirement {
  id: string;
  itemId?: string; // para items
  extraId?: string; // para extras
  resourceId: string;
  quantity: number; // cuántas unidades del recurso necesita
  isOptional: boolean;
  // Tiempo específico de uso del recurso (puede ser menor que la duración del item)
  usageTime: {
    offsetStart: number; // minutos desde el inicio del item
    duration: number; // duración en minutos
  };
}

// ========================================
// RESERVAS CON LÓGICA GRANULAR
// ========================================

export interface Booking {
  id: string;
  bundleId: string;
  bundleName: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // ISO date string
  status: BookingStatus;
  isManual: boolean;
  createdAt: string;
  notes?: string;
  
  // DETALLES POR ITEM (AQUÍ ESTÁ EL CAMBIO CLAVE)
  itemBookings: ItemBooking[];
  extraBookings: ExtraBooking[];
  
  // Información de pagos y cancelaciones
  pricing: {
    totalAmount: number;
    paidAmount: number;
    refundAmount?: number;
    cancellationFee?: number;
  };
  
  // Reprogramaciones
  rescheduling?: {
    originalDate: string;
    reason: string;
    rescheduledAt: string;
  };
}

export interface ItemBooking {
  id: string;
  bookingId: string;
  itemId: string;
  itemName: string;
  timeSlotId: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  status: BookingStatus;
  // Recursos asignados específicamente para este item
  resourceAllocations: ResourceAllocation[];
  notes?: string;
}

export interface ExtraBooking {
  id: string;
  bookingId: string;
  extraId: string;
  extraName: string;
  quantity: number;
  unitPrice: number;
  // Recursos asignados para este extra (si aplica)
  resourceAllocations?: ResourceAllocation[];
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  quantity: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isConfirmed: boolean;
  notes?: string;
}

// ========================================
// CONFIGURACIONES Y VALIDACIONES
// ========================================

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  periods: BusinessHoursPeriod[];
}

export interface BusinessHoursPeriod {
  id: string;        // ID único del período
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  name: string;      // Nombre del período (ej: "Mañana", "Tarde")
}

export interface BookingSettings {
  hoursBeforeBooking: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
  autoConfirmBookings: boolean;
  requiresPhoneVerification: boolean;
  maxSimultaneousBookings: number;
}

export interface ShopException {
  id: string;
  shopId: string;
  date: string;
  type: 'CLOSED' | 'SPECIAL_HOURS' | 'PRIVATE_EVENT' | 'MAINTENANCE';
  title: string;
  description?: string;
  specialHours?: BusinessHoursPeriod;
  affectedBundles?: string[];
  affectedItems?: string[];
  affectedResources?: string[];
  isActive: boolean;
  createdAt: string;
}

// ========================================
// DISPONIBILIDAD Y VALIDACIONES
// ========================================

export interface AvailabilityRequest {
  bundleId: string;
  date: string;
  itemSelections: {
    itemId: string;
    timeSlotId: string;
    numberOfPeople: number;
  }[];
  extraSelections: {
    extraId: string;
    quantity: number;
  }[];
}

export interface AvailabilityResult {
  isAvailable: boolean;
  conflicts: AvailabilityConflict[];
  suggestedAlternatives?: AvailabilityAlternative[];
  pricing: {
    totalPrice: number;
    breakdown: PriceBreakdown[];
  };
}

export interface AvailabilityConflict {
  type: 'RESOURCE_CONFLICT' | 'CAPACITY_EXCEEDED' | 'TIME_CONFLICT' | 'BUSINESS_HOURS' | 'ADVANCE_BOOKING' | 'SHOP_EXCEPTION';
  message: string;
  affectedItems: string[];
  affectedResources?: string[];
  severity: 'ERROR' | 'WARNING';
}

export interface AvailabilityAlternative {
  date: string;
  itemSlots: {
    itemId: string;
    timeSlotId: string;
    startTime: string;
    endTime: string;
  }[];
  totalPrice: number;
  confidence: number; // 0-1, qué tan buena es esta alternativa
}

export interface PriceBreakdown {
  type: 'ITEM' | 'EXTRA' | 'TAX' | 'DISCOUNT' | 'FEE';
  itemId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// ========================================
// FORMULARIOS Y UI
// ========================================

export interface BookingFormData {
  bundleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  itemSelections: {
    itemId: string;
    timeSlotId: string;
    numberOfPeople: number;
  }[];
  extraSelections: {
    extraId: string;
    quantity: number;
  }[];
  notes?: string;
}

export type ViewType = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'BOOKING' | 'RESOURCE_BLOCK' | 'EXCEPTION';
    data: any; // Permitir cualquier tipo de data para flexibilidad
  };
  color?: string;
}

// ========================================
// BÚSQUEDA Y FILTROS
// ========================================

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: BookingStatus[];
  bundleIds?: string[];
  itemIds?: string[];
  resourceIds?: string[];
  customerEmail?: string;
  customerPhone?: string;
  isManual?: boolean;
}

export interface GlobalSearchResult {
  type: 'booking' | 'customer' | 'bundle' | 'item' | 'resource';
  id: string;
  title: string;
  subtitle: string;
  data: Booking | Bundle | BundleItem | ShopResource | CustomerData;
  relevance: number;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  totalSpent: number;
  lastBooking: Booking;
}

// ========================================
// INTERFACES PARA FORMULARIOS (ETAPA 4)
// ========================================

export interface CreateBookingData {
  bundleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  numberOfPeople: number;
  itemSelections: {
    itemId: string;
    timeSlotId: string;
    numberOfPeople: number;
  }[];
  extraSelections?: {
    extraId: string;
    quantity: number;
  }[];
  notes?: string;
  isManual?: boolean;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

export interface AvailabilityResponse {
  isAvailable: boolean;
  conflicts: string[];
  alternatives?: {
    itemId: string;
    suggestedTimeSlots: string[];
  }[];
  pricing: {
    subtotal: number;
    taxes: number;
    total: number;
    breakdown: {
      itemId: string;
      itemName: string;
      price: number;
    }[];
  };
} 