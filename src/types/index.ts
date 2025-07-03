export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('SELLER' | 'ADMIN' | 'BUYER' | 'ESSENTIAL')[];
  phoneNumber: string;
}

export type BusinessHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
    openRanges: { from: string; to: string }[]; // formato 24h → "08:00", "13:30"
  };
};

export interface Shop {
  id: string;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  category?: string;
  subCategory?: string;
  shopStatus: 'ENABLED' | 'DISABLED';
  userId: string;
  
  businessHours: BusinessHours;
  
  // Configuración de reservas
  maxCapacity?: number;
  advanceBookingDays?: number;
  cancellationPolicy?: string;
  refundPolicy?: string;
  allowInstantBooking?: boolean;
  requiresApproval?: boolean;
  
  status: 'active' | 'inactive' | 'archived';
  deletedAt?: string | null;
}

// Tipos legacy eliminados - ya no se usan



// Gestión de Excepciones y Disponibilidad Avanzada




 

/**
 * Item - Elementos principales de un bundle que pueden ser reservados
 * Los items tienen horarios de disponibilidad independientes entre sí
 */
export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  isForAdult: boolean;
  size?: number; // capacidad o cantidad de personas
  bundleId?: string;
  shopId?: string;
  
  isPerGroup: boolean; // true = se cobra por grupo completo, false = se cobra por persona
  
  bookingConfig?: {
    maxCapacity: number;
    duration: number; // en minutos
    requiresConfirmation: boolean;
    advanceBookingDays: number;
    groupCapacity?: number; // capacidad específica cuando isPerGroup: true
    isExclusive?: boolean; // true = solo 1 grupo puede reservar este horario
  };

  // Horarios específicos del item - Sistema flexible inspirado en booking.com
  timeSlots?: {
    // Configuración general de horarios
    scheduleType: 'FIXED' | 'FLEXIBLE' | 'CUSTOM' | 'CONTINUOUS';
    
    // Horarios fijos por día de la semana (0-6, domingo-sábado)
    weeklySchedule?: {
      [dayOfWeek: number]: {
        isAvailable: boolean;
        slots: Array<{
          startTime: string; // HH:mm
          endTime: string; // HH:mm
          maxBookingsPerSlot: number;
          minPeoplePerBooking?: number;
          maxPeoplePerBooking?: number;
          bufferMinutes?: number; // tiempo de buffer entre reservas
          isActive: boolean;
        }>;
      };
    };
    
    // Horarios especiales para fechas específicas
    specialDates?: {
      [date: string]: { // YYYY-MM-DD
        isAvailable: boolean;
        slots: Array<{
          startTime: string;
          endTime: string;
          maxBookingsPerSlot: number;
          minPeoplePerBooking?: number;
          maxPeoplePerBooking?: number;
          bufferMinutes?: number;
          isActive: boolean;
        }>;
        reason?: string; // motivo del horario especial
      };
    };
    
    // Configuración para horarios flexibles
    flexibleConfig?: {
      startHour: number; // hora de inicio (0-23)
      endHour: number; // hora de fin (0-23)
      slotDuration: number; // duración de cada slot en minutos
      intervalMinutes: number; // intervalo entre slots
      maxBookingsPerSlot: number;
      minPeoplePerBooking?: number;
      maxPeoplePerBooking?: number;
      bufferMinutes?: number;
    };
    
    // Configuración para horarios continuos (24/7)
    continuousConfig?: {
      slotDuration: number; // duración de cada slot en minutos
      intervalMinutes: number; // intervalo entre slots
      maxBookingsPerSlot: number;
      minPeoplePerBooking?: number;
      maxPeoplePerBooking?: number;
      bufferMinutes?: number;
    };
    
    // Excepciones (días cerrados, horarios especiales)
    exceptions?: Array<{
      id: string;
      type: 'CLOSED' | 'MODIFIED_HOURS' | 'SPECIAL_EVENT';
      date: string; // YYYY-MM-DD
      endDate?: string; // YYYY-MM-DD (para rangos)
      reason: string;
      slots?: Array<{
        startTime: string;
        endTime: string;
        maxBookingsPerSlot: number;
        minPeoplePerBooking?: number;
        maxPeoplePerBooking?: number;
        bufferMinutes?: number;
        isActive: boolean;
      }>;
    }>;
    
    // Configuración de anticipación y límites
    bookingLimits?: {
      minAdvanceHours: number; // horas mínimas de anticipación
      maxAdvanceDays: number; // días máximos de anticipación
      sameDayBooking: boolean; // permite reservas del mismo día
      lastMinuteBooking: boolean; // permite reservas de última hora
    };
  };
  
  // Metadatos
  isActive: boolean;
  order: number; // para ordenar en la UI
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived';
  deletedAt?: string | null;
}

/**
 * Extra - Complementos opcionales de un bundle
 * Los extras NO tienen horarios, se seleccionan junto con items
 */
export interface Extra {
  id: string;
  title: string;
  description: string;
  price: number;
  isForAdult: boolean;
  bundleId?: string;
  shopId?: string;
  
  isPerGroup: boolean; // true = se cobra por grupo completo, false = se cobra por persona
  
  requiredItemId?: string; // ID del item que debe estar reservado para poder agregar este extra
  
  // Configuración del extra
  quantity?: number; // cantidad por defecto seleccionada
  maxQuantity?: number; // cantidad máxima permitida
  isRequired?: boolean; // si es obligatorio seleccionarlo
  
  // Metadatos
  isActive: boolean;
  order: number; // para ordenar en la UI
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived';
  deletedAt?: string | null;
}

/**
 * Bundle - Conjunto de items y extras que se ofrece en un shop
 * Ahora los items y extras están embebidos en el documento del bundle
 */
export interface Bundle {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  shopId: string;
  
  // Contenido del bundle (embebido)
  items: Item[];
  extras: Extra[];
  
  // Configuración general del bundle
  basePrice: number; // precio base sin items/extras
  maxCapacity: number; // capacidad máxima total
  duration: number; // duración estimada en minutos
  
  // Configuración de reservas
  bookingSettings: {
    allowInstantBooking: boolean;
    requiresApproval: boolean;
    cancellationPolicy: string;
    refundPolicy: string;
  };
  
  // Presentación
  imageUrls: string[];
  tags: string[]; // categorías, filtros
  
  // Metadatos
  isActive: boolean;
  isFeatured: boolean;
  order: number; // para ordenar en el shop
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived';
  deletedAt?: string | null;
}

/**
 * ReservaItem - Reserva específica para un item individual dentro de un bundle
 * Esta es la entidad central del nuevo sistema de reservas
 */
export interface ReservaItem {
  id: string;
  itemId: string;
  bundleId: string;
  shopId: string;
  userId: string; // quien realiza la acción (seller o buyer)
  
  // Información del cliente (si la reserva es para un cliente)
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Detalles de la reserva
  date: string; // YYYY-MM-DD
  timeSlot: {
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  numberOfPeople: number;
  
  isGroupReservation: boolean; // true si esta reserva es para un grupo completo
  groupSize?: number; // tamaño del grupo (solo relevante si isGroupReservation: true)
  
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'EXPIRED' | 'MODIFIED' | 'RESCHEDULED';
  isTemporary: boolean; // true si es una reserva temporal (ej: 15 min para completar pago)
  temporaryExpiresAt?: string; // fecha/hora de expiración para reservas temporales
  
  history?: ReservationHistoryEntry[];
  
  canBeModified?: boolean; // calculado basado en reglas
  canBeCancelled?: boolean; // calculado basado en reglas
  modificationsAllowed?: ReservationModificationRule[];
  cancellationPenalty?: {
    willBeCharged: boolean;
    reason: string;
    amount?: number;
  };
  
  // Información de reserva original (si fue modificada)
  originalReservationId?: string; // ID de la reserva original antes de modificar
  rescheduledToReservationId?: string; // ID de la nueva reserva si fue reprogramada
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: 'SELLER' | 'BUYER' | 'SYSTEM';
  notes?: string;
  
  // Precios en el momento de la reserva
  itemPrice: number;
  totalPrice: number; // puede incluir extras en el futuro
}

/**
 * Disponibilidad de un item en un horario específico
 */
export interface ItemAvailability {
  itemId: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  isAvailable: boolean;
  availableSpots: number; // espacios disponibles
  totalSpots: number; // capacidad total
  conflictingReservations: string[]; // IDs de reservas que causan conflicto
  blockingReason?: 'FULLY_BOOKED' | 'BUSINESS_HOURS' | 'ADVANCE_BOOKING' | 'EXCEPTION' | 'ITEM_INACTIVE';
}

/**
 * CreateReservaItemRequest - SOLO se usa para validar items dentro de una reserva de bundle. No se expone para reservas individuales.
 */
export interface CreateReservaItemRequest {
  itemId: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  numberOfPeople: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  isTemporary?: boolean; // para crear reservas temporales
}

/**
 * ItemAvailabilityValidation - SOLO se usa para validar items dentro de bundles. No se expone para reservas individuales.
 */
export interface ItemAvailabilityValidation {
  isValid: boolean;
  availability: ItemAvailability;
  errors: string[];
  warnings: string[];
}

/**
 * ExtraSelected - Representa un extra seleccionado en una reserva
 */
export interface ExtraSelected {
  extraId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  isGroupSelection: boolean; // true si este extra se seleccionó para el grupo completo
}

/**
 * ReservaBundle - Reserva agrupada que contiene múltiples items y extras
 * Esta es la entidad principal para reservas completas de bundle
 */
export interface ReservaBundle {
  id: string;
  bundleId: string;
  shopId: string;
  userId: string;
  
  // Información del cliente
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Items reservados (reutiliza ReservaItem existente)
  reservasItems: ReservaItem[];
  
  // Extras seleccionados
  extras: ExtraSelected[];
  
  // Información de la reserva agrupada
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PARTIAL_CANCELLED';
  isTemporary: boolean;
  temporaryExpiresAt?: string;
  
  // Precios y totales
  itemsTotal: number;
  extrasTotal: number;
  totalPrice: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: 'SELLER' | 'BUYER' | 'SYSTEM';
  notes?: string;
}

/**
 * CreateReservaBundleRequest - Solicitud para crear una reserva de bundle completo
 */
export interface CreateReservaBundleRequest {
  bundleId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Items a reservar (cada uno con su horario específico)
  itemReservations: {
    itemId: string;
    date: string;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    numberOfPeople: number;
  }[];
  
  // Extras seleccionados
  selectedExtras: {
    extraId: string;
    quantity: number;
  }[];
  
  notes?: string;
  isTemporary?: boolean;
}

/**
 * BundleAvailabilityValidation - Validación completa de disponibilidad para bundle
 */
export interface BundleAvailabilityValidation {
  isValid: boolean;
  itemValidations: ItemAvailabilityValidation[];
  extraValidations: ExtraValidation[];
  groupValidations: GroupValidation[];
  errors: string[];
  warnings: string[];
  totalPrice: number;
}

/**
 * ExtraValidation - Validación específica para extras
 */
export interface ExtraValidation {
  extraId: string;
  isValid: boolean;
  requestedQuantity: number;
  maxQuantity: number;
  isAvailable: boolean;
  errors: string[];
  warnings: string[];
  unitPrice: number;
  totalPrice: number;
  
  requiredItemMissing?: boolean; // true si falta un item requerido
  requiredItemId?: string; // ID del item requerido
}

export interface GroupValidation {
  itemId: string;
  isValid: boolean;
  isGroupExclusive: boolean; // true si este item es exclusivo por grupo
  conflictingGroupReservations: string[]; // IDs de reservas de grupo que causan conflicto
  errors: string[];
  warnings: string[];
}


export interface ReservationHistoryEntry {
  id: string;
  action: 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED' | 'NO_SHOW' | 'EXPIRED' | 'DELETED';
  timestamp: string; // ISO timestamp
  userId: string; // quien realizó la acción
  userType: 'SELLER' | 'BUYER' | 'SYSTEM';
  details: {
    reason?: string; // razón del cambio
    changes?: ReservationChange[]; // cambios específicos realizados
    previousValues?: Record<string, any>; // valores anteriores
    newValues?: Record<string, any>; // valores nuevos
  };
  notes?: string; // notas adicionales
}

export interface ReservationChange {
  field: 'date' | 'timeSlot' | 'numberOfPeople' | 'customerInfo' | 'extras' | 'status' | 'notes';
  previousValue: any;
  newValue: any;
  description: string; // descripción legible del cambio
}

export interface ReservationModificationRule {
  type: 'TIME_CHANGE' | 'PEOPLE_CHANGE' | 'EXTRAS_CHANGE' | 'CUSTOMER_INFO_CHANGE' | 'NOTES_CHANGE';
  allowed: boolean;
  reason?: string; // razón si no está permitido
  restrictions?: {
    minHoursBeforeEvent?: number; // mínimo de horas antes del evento para permitir cambio
    maxDaysInAdvance?: number; // máximo de días de anticipación
    requiresApproval?: boolean; // si requiere aprobación manual
  };
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  rules: {
    hoursBeforeEvent: number; // horas antes del evento
    penaltyPercentage: number; // porcentaje de penalidad (0-100)
    allowCancellation: boolean; // si se permite cancelar
    reason: string; // razón de la regla
  }[];
  defaultRule: {
    penaltyPercentage: number;
    allowCancellation: boolean;
    reason: string;
  };
}

export interface ModifyReservationRequest {
  reservationId: string;
  changes: {
    date?: string;
    timeSlot?: {
      startTime: string;
      endTime: string;
    };
    numberOfPeople?: number;
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    notes?: string;
  };
  reason: string; // razón del cambio
  userId: string; // quien solicita el cambio
}

export interface CancelReservationRequest {
  reservationId: string;
  reason: string;
  userId: string; // quien solicita la cancelación
  acceptPenalty: boolean; // si acepta la penalidad (si aplica)
}

export interface ReservationModificationValidation {
  isValid: boolean;
  canModify: boolean;
  canCancel: boolean;
  errors: string[];
  warnings: string[];
  penalties: {
    cancellation?: {
      willBeCharged: boolean;
      amount?: number;
      percentage?: number;
      reason: string;
    };
    modification?: {
      willBeCharged: boolean;
      amount?: number;
      reason: string;
    };
  };
  newAvailability?: ItemAvailability; // si se cambia horario/fecha
}

export interface ReservationAction {
  type: 'MODIFY' | 'CANCEL' | 'CONFIRM' | 'COMPLETE' | 'DUPLICATE';
  label: string;
  icon: string;
  enabled: boolean;
  reason?: string; // razón si no está habilitado
  requiresConfirmation: boolean;
  warningMessage?: string; // mensaje de advertencia antes de ejecutar
}