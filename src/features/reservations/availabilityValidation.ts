import type { 
  ItemAvailability, 
  ItemAvailabilityValidation, 
  CreateReservaItemRequest,
  ReservaItem,
  ExtendedItemAvailability
} from '../../types';
import { RESERVATION_CONFIG } from './types';
import { mockReservasItems, mockItemTimeSlots, getReservasByDateAndItem } from './mockData';
import { items } from '../../mockData/entitiesData';
// 🎯 CHECKPOINT 5: IMPORTAR VALIDACIÓN DE REGLAS


// 🎯 CHECKPOINT 2: LÓGICA CENTRAL DE VALIDACIÓN DE DISPONIBILIDAD
// Sistema completo para validar si un item puede ser reservado

/**
 * Obtiene la disponibilidad de un item en una fecha y horario específicos
 * 🎯 CHECKPOINT 5: INTEGRA VALIDACIÓN DE REGLAS DE DISPONIBILIDAD
 */
export const getItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): ItemAvailability => {
  console.log(`🔍 Verificando disponibilidad para item ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  const item = items.find(i => i.id === itemId);
  if (!item || !item.isActive) {
    console.log(`❌ Item ${itemId} no encontrado o inactivo`);
    return {
      itemId,
      date,
      timeSlot,
      isAvailable: false,
      availableSpots: 0,
      totalSpots: 0,
      conflictingReservations: [],
      blockingReason: 'ITEM_INACTIVE'
    };
  }

  // Obtener configuración del item
  const maxCapacity = item.bookingConfig?.maxCapacity || item.size || 1;
  
  // Obtener reservas existentes para esta fecha y item
  const existingReservations = getReservasByDateAndItem(date, itemId);
  
  // Filtrar reservas que se solapan con el horario solicitado
  const conflictingReservations = existingReservations.filter(reserva => {
    return timeSlotsOverlap(
      { startTime: timeSlot.startTime, endTime: timeSlot.endTime },
      reserva.timeSlot
    );
  });

  console.log(`📋 Reservas conflictivas encontradas: ${conflictingReservations.length}`);
  
  // Calcular espacios ocupados
  const occupiedSpots = conflictingReservations.reduce((total, reserva) => {
    return total + reserva.numberOfPeople;
  }, 0);

  const availableSpots = Math.max(0, maxCapacity - occupiedSpots);
  const isAvailable = availableSpots > 0;

  console.log(`📊 Capacidad: ${maxCapacity}, Ocupados: ${occupiedSpots}, Disponibles: ${availableSpots}`);

  return {
    itemId,
    date,
    timeSlot,
    isAvailable,
    availableSpots,
    totalSpots: maxCapacity,
    conflictingReservations: conflictingReservations.map(r => r.id),
    blockingReason: isAvailable ? undefined : 'FULLY_BOOKED'
  };
};

/**
 * Valida si es posible crear una reserva con los datos proporcionados
 */
export const validateItemReservation = (
  request: CreateReservaItemRequest,
  _currentUserId: string = "87IZYWdezwJQsILiU57z" // hardcodeado por ahora
): ItemAvailabilityValidation => {
  console.log(`🔍 Validando solicitud de reserva:`, request);
  
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validar que el item existe y está activo
  const item = items.find(i => i.id === request.itemId);
  if (!item) {
    errors.push('El item seleccionado no existe');
  } else if (!item.isActive) {
    errors.push('El item seleccionado no está disponible');
  }

  // 2. Validar fecha (no en el pasado, respeta advance booking)
  const requestDate = new Date(request.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (requestDate < today) {
    errors.push('No se pueden hacer reservas para fechas pasadas');
  }

  // 3. Validar advance booking days si está configurado
  if (item?.bookingConfig?.advanceBookingDays) {
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + item.bookingConfig.advanceBookingDays);
    
    if (requestDate > maxAdvanceDate) {
      errors.push(`Solo se pueden hacer reservas con máximo ${item.bookingConfig.advanceBookingDays} días de anticipación`);
    }
  }

  // 4. Validar número de personas
  if (request.numberOfPeople < 1) {
    errors.push('Debe reservar para al menos 1 persona');
  }

  if (item?.bookingConfig?.maxCapacity && request.numberOfPeople > item.bookingConfig.maxCapacity) {
    errors.push(`Máximo ${item.bookingConfig.maxCapacity} personas permitidas para este item`);
  }

  // 5. Validar horario
  if (!isValidTimeSlot(request.timeSlot)) {
    errors.push('Horario inválido');
  }

  // 6. Obtener disponibilidad real
  const availability = getItemAvailability(request.itemId, request.date, request.timeSlot);
  
  // 7. Validar disponibilidad
  if (!availability.isAvailable) {
    switch (availability.blockingReason) {
      case 'FULLY_BOOKED':
        errors.push('No hay espacios disponibles en este horario');
        break;
      case 'ITEM_INACTIVE':
        errors.push('El item no está disponible');
        break;
      case 'BUSINESS_HOURS':
        errors.push('Fuera del horario de atención');
        break;
      case 'ADVANCE_BOOKING':
        errors.push('No se puede reservar con tan poca anticipación');
        break;
      default:
        errors.push('Horario no disponible');
    }
  } else if (availability.availableSpots < request.numberOfPeople) {
    errors.push(`Solo quedan ${availability.availableSpots} espacios disponibles, pero solicitaste ${request.numberOfPeople}`);
  }

  // 8. Warnings
  if (availability.availableSpots > 0 && availability.availableSpots <= 2) {
    warnings.push(`Quedan pocos espacios disponibles (${availability.availableSpots})`);
  }

  if (item?.bookingConfig?.requiresConfirmation) {
    warnings.push('Esta reserva requiere confirmación manual');
  }

  const isValid = errors.length === 0;

  console.log(`✅ Validación completada. Válida: ${isValid}, Errores: ${errors.length}, Warnings: ${warnings.length}`);

  return {
    isValid,
    availability,
    errors,
    warnings
  };
};

/**
 * Obtiene todos los slots disponibles para un item en una fecha específica
 */
export const getAvailableSlotsForItem = (
  itemId: string,
  date: string
): Array<{ 
  timeSlot: { startTime: string; endTime: string }; 
  availability: ItemAvailability;
}> => {
  console.log(`📅 Obteniendo slots disponibles para item ${itemId} en ${date}`);
  
  // Obtener configuración de slots para este item
  const itemSlots = mockItemTimeSlots.filter(slot => slot.itemId === itemId && slot.isActive);
  
  // Obtener día de la semana para la fecha
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  
  // Filtrar slots para el día de la semana
  const daySlots = itemSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  
  console.log(`📋 Slots encontrados para el día ${dayOfWeek}: ${daySlots.length}`);
  
  // Generar disponibilidad para cada slot
  const availableSlots = daySlots.map(slot => {
    const timeSlot = {
      startTime: slot.startTime,
      endTime: slot.endTime
    };
    
    const availability = getItemAvailability(itemId, date, timeSlot);
    
    return {
      timeSlot,
      availability
    };
  });

  return availableSlots.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
};

// 🎯 CHECKPOINT 5: NUEVA FUNCIÓN QUE INTEGRA REGLAS CON DISPONIBILIDAD
/**
 * Obtiene disponibilidad extendida con información de reglas de bloqueo
 */
export const getExtendedItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): ExtendedItemAvailability => {
  console.log(`🔍 Obteniendo disponibilidad extendida para item ${itemId}`);
  
  // 1. Obtener disponibilidad base (lógica existente)
  const baseAvailability = getItemAvailability(itemId, date, timeSlot);
  
  // 2. Convertir a formato extendido (sin reglas por ahora)
  const extendedAvailability: ExtendedItemAvailability = {
    ...baseAvailability,
    applicableRules: [],
    isBlockedByRules: false,
    blockingRules: []
  };
  
  console.log(`✅ Disponibilidad extendida: disponible=${extendedAvailability.isAvailable}, bloqueado_por_reglas=${extendedAvailability.isBlockedByRules}`);
  
  return extendedAvailability;
};

/**
 * Obtiene todos los slots disponibles con información de reglas
 */
export const getExtendedAvailableSlotsForItem = (
  itemId: string,
  date: string
): Array<{ 
  timeSlot: { startTime: string; endTime: string }; 
  availability: ExtendedItemAvailability;
}> => {
  console.log(`📅 Obteniendo slots extendidos para item ${itemId} en ${date}`);
  
  // Obtener configuración de slots para este item
  const itemSlots = mockItemTimeSlots.filter(slot => slot.itemId === itemId && slot.isActive);
  
  // Obtener día de la semana para la fecha
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  
  // Filtrar slots para el día de la semana
  const daySlots = itemSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  
  console.log(`📋 Slots encontrados para el día ${dayOfWeek}: ${daySlots.length}`);
  
  // Generar disponibilidad extendida para cada slot
  const availableSlots = daySlots.map(slot => {
    const timeSlot = {
      startTime: slot.startTime,
      endTime: slot.endTime
    };
    
    const availability = getExtendedItemAvailability(itemId, date, timeSlot);
    
    return {
      timeSlot,
      availability
    };
  });

  return availableSlots.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
};

/**
 * Simula la creación de una reserva (mock implementation)
 */
export const createItemReservation = (
  request: CreateReservaItemRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): { success: boolean; reserva?: ReservaItem; errors: string[] } => {
  console.log(`🚀 Intentando crear reserva:`, request);
  
  // Validar primero
  const validation = validateItemReservation(request, currentUserId);
  
  if (!validation.isValid) {
    console.log(`❌ Validación fallida:`, validation.errors);
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Obtener información del item para el precio
  const item = items.find(i => i.id === request.itemId);
  if (!item) {
    return {
      success: false,
      errors: ['Item no encontrado']
    };
  }

  // Simular creación de reserva
  const nuevaReserva: ReservaItem = {
    id: `reserva_item_${Date.now()}`,
    itemId: request.itemId,
    bundleId: item.bundleId,
    shopId: item.bundleId.includes('bundle_auto_paris') || item.bundleId.includes('bundle_spa_day') 
      ? "ab55132c-dcc8-40d6-9ac4-5f573285f55f" 
      : "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf",
    userId: currentUserId,
    customerInfo: request.customerInfo,
    date: request.date,
    timeSlot: request.timeSlot,
    numberOfPeople: request.numberOfPeople,
    status: request.isTemporary ? 'PENDING' : (item.bookingConfig?.requiresConfirmation ? 'PENDING' : 'CONFIRMED'),
    isTemporary: request.isTemporary || false,
    temporaryExpiresAt: request.isTemporary 
      ? new Date(Date.now() + RESERVATION_CONFIG.TEMPORARY_RESERVATION_MINUTES * 60000).toISOString()
      : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'SELLER', // hardcodeado por ahora
    notes: request.notes,
    itemPrice: item.price,
    totalPrice: item.isPerGroup ? item.price : (item.price * request.numberOfPeople), // 🎯 CHECKPOINT 4
    // 🎯 CHECKPOINT 4: Campos para lógica de grupo
    isGroupReservation: item.isPerGroup || false,
    groupSize: request.numberOfPeople
  };

  // En una implementación real, esto se guardaría en la base de datos
  console.log(`✅ Reserva creada exitosamente:`, nuevaReserva);
  
  // Agregamos a los mocks para simular persistencia
  mockReservasItems.push(nuevaReserva);

  return {
    success: true,
    reserva: nuevaReserva,
    errors: []
  };
};

// ============ FUNCIONES AUXILIARES ============

/**
 * Verifica si dos slots de tiempo se solapan
 */
const timeSlotsOverlap = (
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean => {
  const start1 = slot1.startTime;
  const end1 = slot1.endTime;
  const start2 = slot2.startTime;
  const end2 = slot2.endTime;
  
  // Overlap occurs if start1 < end2 AND start2 < end1
  return start1 < end2 && start2 < end1;
};

/**
 * Valida que un horario sea válido
 */
const isValidTimeSlot = (timeSlot: { startTime: string; endTime: string }): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(timeSlot.startTime) || !timeRegex.test(timeSlot.endTime)) {
    return false;
  }
  
  return timeSlot.startTime < timeSlot.endTime;
};

/**
 * Convierte tiempo HH:mm a minutos para comparaciones
 * (Función preparada para futuras validaciones de solapamiento)
 */
// const timeToMinutes = (time: string): number => {
//   const [hours, minutes] = time.split(':').map(Number);
//   return hours * 60 + minutes;
// }; 