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
  businessHours?: BusinessHours[];
  bookingSettings?: BookingSettings;
  resources?: Resource[]; // Recursos físicos del negocio
}

// ==================== NUEVA ARQUITECTURA ====================

// RECURSOS: Entidades físicas que pueden ser compartidas entre items
export interface Resource {
  id: string;
  name: string;
  type: 'ROOM' | 'EQUIPMENT' | 'STAFF' | 'VEHICLE' | 'TABLE' | 'OTHER';
  shopId: string;
  maxConcurrentUse: number; // Cuántas veces puede usarse simultáneamente
  description?: string;
  isActive: boolean;
}

// ITEM: Actividad específica con horario, precio y recursos
export interface BundleItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxCapacity: number; // Cuántas personas máximo
  duration: number; // Duración en minutos
  
  // HORARIOS ESPECÍFICOS DEL ITEM
  availableTimeSlots: ItemTimeSlot[];
  
  // RECURSOS REQUERIDOS
  requiredResources: ItemResourceRequirement[];
  
  // DEPENDENCIAS Y SECUENCIA
  dependencies?: ItemDependency[]; // Items que deben realizarse antes
  canRunConcurrently?: boolean; // Si puede ejecutarse al mismo tiempo que otros items del bundle
  
  // CONFIGURACIÓN
  isRequired: boolean; // Si es obligatorio en el bundle
  isActive: boolean;
  
  // UBICACIÓN (si es relevante)
  location?: string;
  address?: string;
}

// EXTRA: Complementos opcionales sin horario específico
export interface BundleExtra {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxQuantity: number; // Cuántos se pueden agregar
  isPerPerson: boolean; // Si el precio es por persona o fijo
  isActive: boolean;
  
  // DISPONIBILIDAD (sin horarios específicos)
  maxDailyQuantity?: number; // Límite diario de este extra
}

// BUNDLE: Paquete de experiencias que contiene items y extras
export interface Bundle {
  id: string;
  name: string;
  description?: string;
  shopId: string;
  
  // CONTENIDO DEL BUNDLE
  items: BundleItem[];
  extras: BundleExtra[];
  
  // CONFIGURACIÓN DE SELECCIÓN
  minItemsRequired: number; // Mínimo de items que deben seleccionarse
  maxItemsAllowed: number; // Máximo de items que pueden seleccionarse
  
  // PRICING
  bundleDiscount?: number; // Descuento por comprar el bundle completo
  basePrice?: number; // Precio base si no depende solo de items
  
  // CONFIGURACIÓN
  isActive: boolean;
  tags?: string[];
  
  // RESTRICCIONES TEMPORALES
  availableDays?: number[]; // Días de la semana disponibles (0-6)
  seasonalRestrictions?: SeasonalRestriction[];
}

// ==================== HORARIOS Y DISPONIBILIDAD ====================

export interface ItemTimeSlot {
  id: string;
  itemId: string;
  
  // HORARIO
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  
  // DISPONIBILIDAD
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  maxBookings: number; // Cuántas reservas máximo en este slot
  
  // CONFIGURACIÓN
  isActive: boolean;
  
  // RESTRICCIONES ESPECIALES
  minimumAdvanceHours?: number;
  maximumAdvanceDays?: number;
  
  // PRECIOS DINÁMICOS
  priceMultiplier?: number; // Multiplicador de precio para este horario
}

export interface ItemResourceRequirement {
  resourceId: string;
  quantityNeeded: number;
  
  // TIEMPO DE USO (puede ser diferente a la duración del item)
  setupTimeMinutes?: number; // Tiempo de preparación antes
  cleanupTimeMinutes?: number; // Tiempo de limpieza después
  
  // FLEXIBILIDAD
  isOptional: boolean;
  alternativeResourceIds?: string[]; // Recursos alternativos
}

export interface ItemDependency {
  dependsOnItemId: string;
  type: 'MUST_COMPLETE_BEFORE' | 'MUST_START_AFTER' | 'CONCURRENT_ONLY';
  timingOffsetMinutes?: number; // Tiempo entre items (positivo = después, negativo = antes)
}

export interface SeasonalRestriction {
  startDate: string; // ISO date
  endDate: string; // ISO date
  type: 'UNAVAILABLE' | 'PRICE_INCREASE' | 'LIMITED_CAPACITY';
  modifier?: number; // Para price increase o capacity reduction
  reason?: string;
}

// ==================== SISTEMA DE RESERVAS ACTUALIZADO ====================

export interface BookingItemSelection {
  itemId: string;
  selectedTimeSlotId: string;
  numberOfPeople: number;
  
  // HORARIO CALCULADO (basado en el item y slot seleccionado)
  startTime: string;
  endTime: string;
  date: string;
  
  // RECURSOS ASIGNADOS
  assignedResources: BookingResourceAssignment[];
  
  // PRICING
  itemPrice: number;
  totalPrice: number; // item price * people + modifiers
}

export interface BookingExtraSelection {
  extraId: string;
  quantity: number;
  totalPrice: number;
}

export interface BookingResourceAssignment {
  resourceId: string;
  quantityAssigned: number;
  startTime: string;
  endTime: string;
  
  // TIEMPO EXTENDIDO (setup + item + cleanup)
  effectiveStartTime: string;
  effectiveEndTime: string;
}

export interface Booking {
  id: string;
  bundleId: string;
  bundleName: string;
  shopId: string;
  
  // CUSTOMER INFO
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  // SELECTIONS
  selectedItems: BookingItemSelection[];
  selectedExtras: BookingExtraSelection[];
  
  // CALCULATED TIMING (basado en items seleccionados)
  earliestStartTime: string; // Hora más temprana de todos los items
  latestEndTime: string; // Hora más tardía de todos los items
  totalDuration: number; // Duración total en minutos
  
  // DATES
  date: string; // ISO date string
  createdAt: string;
  
  // PRICING
  itemsTotal: number;
  extrasTotal: number;
  bundleDiscount: number;
  finalTotal: number;
  
  // STATUS & MANAGEMENT
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'PARTIAL_REFUND';
  isManual: boolean;
  notes?: string;
  
  // RESCHEDULING & CANCELLATION
  rescheduledFrom?: string;
  refundAmount?: number;
  cancellationReason?: string;
  
  // OPERATIONAL
  checkInTime?: string;
  checkOutTime?: string;
  staffAssigned?: string[];
}

// ==================== CONFIGURACIÓN DE NEGOCIO ====================

export interface BusinessHoursPeriod {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  periods: BusinessHoursPeriod[]; // Multiple periods per day
}

export interface BusinessHoursFormData {
  monday: BusinessHourDay;
  tuesday: BusinessHourDay;
  wednesday: BusinessHourDay;
  thursday: BusinessHourDay;
  friday: BusinessHourDay;
  saturday: BusinessHourDay;
  sunday: BusinessHourDay;
}

export interface BusinessHourDay {
  isActive: boolean;
  periods: BusinessHoursPeriod[];
}

export interface BookingSettings {
  hoursBeforeBooking: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
  autoConfirmBookings: boolean;
  
  // NUEVAS CONFIGURACIONES
  allowPartialBookings: boolean; // Si se permite reservar solo algunos items del bundle
  requireAllItemssametime: boolean; // Si todos los items deben ser el mismo día
  maxConcurrentBookingsPerCustomer: number;
  
  // CANCELACIÓN Y MODIFICACIÓN
  cancellationPolicyHours: number;
  modificationPolicyHours: number;
  refundPolicy: 'FULL' | 'PARTIAL' | 'NONE';
}

// ==================== CALENDARIO Y EVENTOS ====================

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEventResource;
}

export interface CalendarEventResource {
  type: 'BOOKING_ITEM' | 'RESOURCE_BLOCKED' | 'MAINTENANCE' | 'EXCEPTION';
  booking?: Booking;
  bookingItem?: BookingItemSelection;
  resourceId?: string;
  resourceName?: string;
  bundleName?: string;
  customerName?: string;
  status?: Booking['status'];
}

export type ViewType = 'month' | 'week' | 'day' | 'resource'; // Agregamos vista por recurso

// ==================== FORMULARIOS ====================

export interface BookingFormData {
  bundleId: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  
  // SELECTIONS (new simplified format for wizard)
  selectedItems?: {
    itemId: string;
    timeSlotId: string;
    numberOfPeople: number;
    date: string;
  }[];
  totalPrice?: number;
  timeline?: {
    earliest: string;
    latest: string;
  };
  
  // SELECTIONS (legacy format)
  selectedItemIds?: string[];
  itemSelections?: Record<string, {
    timeSlotId: string;
    numberOfPeople: number;
  }>;
  
  selectedExtras?: Record<string, number>; // extraId -> quantity
  notes?: string;
}

// ==================== EXCEPCIONES Y DISPONIBILIDAD ====================

export interface ShopException {
  id: string;
  shopId: string;
  date: string;
  type: 'CLOSED' | 'SPECIAL_HOURS' | 'PRIVATE_EVENT' | 'MAINTENANCE';
  title: string;
  description?: string;
  specialHours?: {
    startTime: string;
    endTime: string;
  };
  
  // AFECTACIÓN ESPECÍFICA
  affectedBundles?: string[];
  affectedItems?: string[];
  affectedResources?: string[];
  
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilityBlock {
  id: string;
  shopId: string;
  
  // AFECTACIÓN ESPECÍFICA
  bundleId?: string;
  itemId?: string;
  resourceId?: string;
  
  startDate: string;
  endDate: string;
  type: 'BLOCKED' | 'SPECIAL_PRICING' | 'LIMITED_CAPACITY' | 'MAINTENANCE';
  reason: string;
  
  settings?: {
    maxBookings?: number;
    priceMultiplier?: number;
    allowedStatuses?: Booking['status'][];
    capacityReduction?: number;
  };
  
  isActive: boolean;
}

// ==================== BÚSQUEDA Y FILTROS ====================

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Booking['status'][];
  bundleIds?: string[];
  itemIds?: string[];
  resourceIds?: string[];
  isManual?: boolean;
  customerEmail?: string;
  customerPhone?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface GlobalSearchResult {
  type: 'booking' | 'customer' | 'bundle' | 'item' | 'resource';
  id: string;
  title: string;
  subtitle: string;
  data: Booking | Bundle | BundleItem | Resource | CustomerInfo;
  relevance: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBookingDate?: string;
  notes?: string;
  totalSpent?: number;
  preferredBundles?: string[];
}

// ==================== MOTOR DE DISPONIBILIDAD ====================

export interface AvailabilityCheck {
  itemId: string;
  date: string;
  timeSlotId: string;
  numberOfPeople: number;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  conflicts?: AvailabilityConflict[];
  remainingCapacity?: number;
  nextAvailableSlot?: string;
  alternativeItems?: string[];
  resourceAvailability?: ResourceAvailabilityInfo[];
}

export interface AvailabilityConflict {
  type: 'TIME_CONFLICT' | 'BUSINESS_HOURS' | 'CAPACITY_EXCEEDED' | 'RESOURCE_UNAVAILABLE' | 'DEPENDENCY_UNMET';
  message: string;
  itemId?: string;
  resourceId?: string;
  timeSlot?: string;
  suggestedAlternative?: string;
}

export interface ResourceAvailabilityInfo {
  resourceId: string;
  resourceName: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  nextAvailableTime?: string;
}

export interface BookingValidationResult {
  isValid: boolean;
  conflicts: AvailabilityConflict[];
  totalPrice: number;
  discountApplied?: number;
  timeline: {
    earliest: string;
    latest: string;
  };
  resourceAssignments?: BookingResourceAssignment[];
} 