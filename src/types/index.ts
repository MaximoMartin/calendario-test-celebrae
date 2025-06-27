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
  // businessHours y bookingSettings eliminados por simplicidad
}

// Tipos legacy eliminados - ya no se usan



// Gestión de Excepciones y Disponibilidad Avanzada




 

// 📌 ENTIDADES BASE DEL SISTEMA DE RESERVAS
// Checkpoint 1: Definición de entidades principales con relaciones jerárquicas
// User → Shop → Bundle → { Items[], Extras[] }

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
  bundleId: string;
  
  // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
  isPerGroup: boolean; // true = se cobra por grupo completo, false = se cobra por persona
  
  // Configuración específica para reservas (opcional por ahora)
  bookingConfig?: {
    maxCapacity: number;
    duration: number; // en minutos
    requiresConfirmation: boolean;
    advanceBookingDays: number;
    // 🎯 CHECKPOINT 4: Configuración específica para grupos
    groupCapacity?: number; // capacidad específica cuando isPerGroup: true
    isExclusive?: boolean; // true = solo 1 grupo puede reservar este horario
  };
  
  // timeSlots eliminado por simplicidad del sistema
  
  // Metadatos
  isActive: boolean;
  order: number; // para ordenar en la UI
  createdAt: string;
  updatedAt: string;
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
  bundleId: string;
  
  // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
  isPerGroup: boolean; // true = se cobra por grupo completo, false = se cobra por persona
  
  // 🎯 CHECKPOINT 4: RELACIONES CONDICIONALES
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
}

/**
 * Bundle - Conjunto de items y extras que se ofrece en un shop
 * Reemplaza conceptualmente a "Kit" pero mantiene compatibilidad
 */
export interface Bundle {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  shopId: string;
  
  // Contenido del bundle
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
}



// 📋 RELACIONES DEL SISTEMA
// Las relaciones se mantienen mediante IDs:
// 
// User.id ←→ Shop.userId (1:N - Un usuario puede tener múltiples shops)
// Shop.id ←→ Bundle.shopId (1:N - Un shop puede tener múltiples bundles)  
// Bundle.id ←→ Item.bundleId (1:N - Un bundle puede tener múltiples items)
// Bundle.id ←→ Extra.bundleId (1:N - Un bundle puede tener múltiples extras)
//
// COMPATIBILIDAD:
// - Kit se mantiene para retrocompatibilidad con el calendario existente
// - Bundle es la nueva entidad principal para el sistema de reservas
// - Se puede mapear Kit ↔ Bundle según se necesite en los componentes

// 🔄 PRÓXIMO PASO LÓGICO:
// Checkpoint 2: Crear mocks realistas de estas entidades con datos de ejemplo
// y establecer la migración/compatibilidad con el sistema Kit existente 

// 🎯 CHECKPOINT 2: SISTEMA DE RESERVAS PARA ITEMS INDIVIDUALES
// Nuevas interfaces para el manejo de reservas específicas de items

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
  
  // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
  isGroupReservation: boolean; // true si esta reserva es para un grupo completo
  groupSize?: number; // tamaño del grupo (solo relevante si isGroupReservation: true)
  
  // 🎯 CHECKPOINT 6: ESTADOS EXTENDIDOS Y MODIFICACIONES
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'EXPIRED' | 'MODIFIED';
  isTemporary: boolean; // true si es una reserva temporal (ej: 15 min para completar pago)
  temporaryExpiresAt?: string; // fecha/hora de expiración para reservas temporales
  
  // 🎯 CHECKPOINT 6: HISTORIAL Y AUDITORÍA
  history?: ReservationHistoryEntry[];
  
  // 🎯 CHECKPOINT 6: CONTROL DE MODIFICACIONES
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
 * Solicitud de creación de reserva
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
 * Resultado de validación de disponibilidad
 */
export interface ItemAvailabilityValidation {
  isValid: boolean;
  availability: ItemAvailability;
  errors: string[];
  warnings: string[];
}

/**
 * Configuración de slots de tiempo para items
 * Extiende la funcionalidad de TimeSlot para items específicos
 */
export interface ItemTimeSlot {
  id: string;
  itemId: string;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxBookingsPerSlot: number; // cuántas reservas simultáneas se permiten
  isActive: boolean;
  
  // Configuración específica del slot
  minPeoplePerBooking?: number;
  maxPeoplePerBooking?: number;
  bufferMinutes?: number; // tiempo de buffer entre reservas
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// 🎯 CHECKPOINT 3: SISTEMA DE RESERVAS DE BUNDLE COMPLETO
// Nuevas interfaces para reservas múltiples con Items + Extras

/**
 * ExtraSelected - Representa un extra seleccionado en una reserva
 */
export interface ExtraSelected {
  extraId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // 🎯 CHECKPOINT 4: LÓGICA DE RESERVAS GRUPALES
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
  // 🎯 CHECKPOINT 4: VALIDACIONES DE GRUPO
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
  
  // 🎯 CHECKPOINT 4: VALIDACIÓN DE RELACIONES CONDICIONALES
  requiredItemMissing?: boolean; // true si falta un item requerido
  requiredItemId?: string; // ID del item requerido
}

// 🎯 CHECKPOINT 4: NUEVA INTERFAZ PARA VALIDACIÓN DE GRUPOS
export interface GroupValidation {
  itemId: string;
  isValid: boolean;
  isGroupExclusive: boolean; // true si este item es exclusivo por grupo
  conflictingGroupReservations: string[]; // IDs de reservas de grupo que causan conflicto
  errors: string[];
  warnings: string[];
}

// 🎯 CHECKPOINT 5: SISTEMA DE BLOQUEO INTELIGENTE DE HORARIOS
// Reglas de disponibilidad flexibles por Shop, Bundle o Item

export interface ExtendedItemAvailability extends ItemAvailability {
  // 🎯 CHECKPOINT 5: Información adicional sobre reglas de bloqueo (simplificado)
  applicableRules: any[];
  isBlockedByRules: boolean;
  blockingRules: any[]; // reglas que bloquean esta reserva
}

// 🎯 CHECKPOINT 6: HISTORIAL Y MODIFICACIONES

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