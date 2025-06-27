import type { 
  ReservaItem, 
  ModifyReservationRequest, 
  CancelReservationRequest, 
  ReservationModificationValidation, 
  ReservationHistoryEntry,
  ReservationChange,
  CancellationPolicy,
  ReservationModificationRule,
  ItemAvailability
} from '../../types';
import { getItemAvailability } from './availabilityValidation';
import { mockReservasItems } from './mockData';

export const CANCELLATION_POLICIES: CancellationPolicy[] = [
  {
    id: 'standard_policy',
    name: 'Política Estándar',
    description: 'Política de cancelación estándar para la mayoría de servicios',
    rules: [
      {
        hoursBeforeEvent: 48,
        penaltyPercentage: 0,
        allowCancellation: true,
        reason: 'Cancelación gratuita con más de 48 horas de anticipación'
      },
      {
        hoursBeforeEvent: 24,
        penaltyPercentage: 25,
        allowCancellation: true,
        reason: 'Penalidad del 25% entre 24-48 horas antes'
      },
      {
        hoursBeforeEvent: 12,
        penaltyPercentage: 50,
        allowCancellation: true,
        reason: 'Penalidad del 50% entre 12-24 horas antes'
      }
    ],
    defaultRule: {
      penaltyPercentage: 100,
      allowCancellation: false,
      reason: 'No se permite cancelar con menos de 12 horas de anticipación'
    }
  },
  {
    id: 'flexible_policy',
    name: 'Política Flexible',
    description: 'Política más flexible para servicios premium',
    rules: [
      {
        hoursBeforeEvent: 24,
        penaltyPercentage: 0,
        allowCancellation: true,
        reason: 'Cancelación gratuita con más de 24 horas'
      },
      {
        hoursBeforeEvent: 6,
        penaltyPercentage: 20,
        allowCancellation: true,
        reason: 'Penalidad del 20% entre 6-24 horas antes'
      }
    ],
    defaultRule: {
      penaltyPercentage: 50,
      allowCancellation: true,
      reason: 'Penalidad del 50% con menos de 6 horas'
    }
  },
  {
    id: 'strict_policy',
    name: 'Política Estricta',
    description: 'Política estricta para servicios con alta demanda',
    rules: [
      {
        hoursBeforeEvent: 72,
        penaltyPercentage: 0,
        allowCancellation: true,
        reason: 'Cancelación gratuita solo con más de 72 horas'
      }
    ],
    defaultRule: {
      penaltyPercentage: 100,
      allowCancellation: false,
      reason: 'No reembolsable después de 72 horas'
    }
  }
];

export const MODIFICATION_RULES: ReservationModificationRule[] = [
  {
    type: 'TIME_CHANGE',
    allowed: true,
    restrictions: {
      minHoursBeforeEvent: 24,
      maxDaysInAdvance: 30,
      requiresApproval: false
    }
  },
  {
    type: 'PEOPLE_CHANGE',
    allowed: true,
    restrictions: {
      minHoursBeforeEvent: 12,
      requiresApproval: false
    }
  },
  {
    type: 'EXTRAS_CHANGE',
    allowed: true,
    restrictions: {
      minHoursBeforeEvent: 6,
      requiresApproval: false
    }
  },
  {
    type: 'CUSTOMER_INFO_CHANGE',
    allowed: true,
    restrictions: {
      minHoursBeforeEvent: 1,
      requiresApproval: false
    }
  },
  {
    type: 'NOTES_CHANGE',
    allowed: true,
    restrictions: {
      minHoursBeforeEvent: 1,
      requiresApproval: false
    }
  }
];

export const validateReservationModification = (
  reservation: ReservaItem,
  request: ModifyReservationRequest,
  _currentUserId: string = "87IZYWdezwJQsILiU57z"
): ReservationModificationValidation => {
  console.log('🔄 Validando modificación de reserva:', reservation.id);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const penalties = {
    cancellation: undefined as any,
    modification: undefined as any
  };

  // Verificar si la reserva puede ser modificada
  if (!canModifyReservation(reservation)) {
    errors.push('Esta reserva no puede ser modificada');
    return {
      isValid: false,
      canModify: false,
      canCancel: false,
      errors,
      warnings,
      penalties
    };
  }

  // Validar cambios específicos
  let newAvailability: ItemAvailability | undefined;

  // Validar cambio de horario/fecha
  if (request.changes.date || request.changes.timeSlot) {
    const newDate = request.changes.date || reservation.date;
    const newTimeSlot = request.changes.timeSlot || reservation.timeSlot;

    // Verificar que no sea el mismo horario
    if (newDate === reservation.date && 
        newTimeSlot.startTime === reservation.timeSlot.startTime &&
        newTimeSlot.endTime === reservation.timeSlot.endTime) {
      warnings.push('No se detectaron cambios en horario o fecha');
    } else {
      // Verificar disponibilidad del nuevo horario
      newAvailability = getItemAvailability(reservation.itemId, newDate, newTimeSlot);
      
      if (!newAvailability.isAvailable) {
        errors.push('El nuevo horario seleccionado no está disponible');
      }

      // Verificar restricciones de tiempo para cambio de horario
      const hoursUntilEvent = getHoursUntilReservation(reservation);
      const timeChangeRule = MODIFICATION_RULES.find(r => r.type === 'TIME_CHANGE');
      
      if (timeChangeRule?.restrictions?.minHoursBeforeEvent && 
          hoursUntilEvent < timeChangeRule.restrictions.minHoursBeforeEvent) {
        errors.push(`No se puede cambiar el horario con menos de ${timeChangeRule.restrictions.minHoursBeforeEvent} horas de anticipación`);
      }
    }
  }

  // Validar cambio de número de personas
  if (request.changes.numberOfPeople && request.changes.numberOfPeople !== reservation.numberOfPeople) {
    // Usar capacidad máxima por defecto razonable
    const maxCapacity = 10; // Valor por defecto

    if (request.changes.numberOfPeople > maxCapacity) {
      errors.push(`El número de personas excede la capacidad máxima (${maxCapacity})`);
    }

    if (request.changes.numberOfPeople < 1) {
      errors.push('El número de personas debe ser al menos 1');
    }

    // Verificar restricciones de tiempo para cambio de personas
    const hoursUntilEvent = getHoursUntilReservation(reservation);
    const peopleChangeRule = MODIFICATION_RULES.find(r => r.type === 'PEOPLE_CHANGE');
    
    if (peopleChangeRule?.restrictions?.minHoursBeforeEvent && 
        hoursUntilEvent < peopleChangeRule.restrictions.minHoursBeforeEvent) {
      warnings.push(`Se recomienda cambiar el número de personas con al menos ${peopleChangeRule.restrictions.minHoursBeforeEvent} horas de anticipación`);
    }
  }

  // Verificar si hay penalidad por modificación (simulada)
  if (Object.keys(request.changes).length > 0) {
    const hoursUntilEvent = getHoursUntilReservation(reservation);
    
    if (hoursUntilEvent < 6) {
      penalties.modification = {
        willBeCharged: true,
        amount: Math.round(reservation.totalPrice * 0.1), // 10% de penalidad
        reason: 'Modificación con menos de 6 horas de anticipación'
      };
      warnings.push('Se aplicará una penalidad del 10% por modificación tardía');
    }
  }

  const canCancel = canCancelReservation(reservation).canCancel;

  return {
    isValid: errors.length === 0,
    canModify: errors.length === 0,
    canCancel,
    errors,
    warnings,
    penalties,
    newAvailability
  };
};

// 🎯 VALIDACIÓN DE CANCELACIONES

export const validateReservationCancellation = (
  reservation: ReservaItem,
  request: CancelReservationRequest
): ReservationModificationValidation => {
  console.log('❌ Validando cancelación de reserva:', reservation.id);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const penalties = {
    cancellation: undefined as any,
    modification: undefined as any
  };

  const cancellationCheck = canCancelReservation(reservation);
  
  if (!cancellationCheck.canCancel) {
    errors.push(cancellationCheck.reason || 'Esta reserva no puede ser cancelada');
  }

  // Calcular penalidad
  if (cancellationCheck.canCancel && cancellationCheck.penalty) {
    penalties.cancellation = cancellationCheck.penalty;
    
    if (cancellationCheck.penalty.willBeCharged && !request.acceptPenalty) {
      errors.push('Debe aceptar la penalidad de cancelación para proceder');
    }
  }

  return {
    isValid: errors.length === 0,
    canModify: false,
    canCancel: cancellationCheck.canCancel,
    errors,
    warnings,
    penalties
  };
};


export const canModifyReservation = (reservation: ReservaItem): boolean => {
  // No se puede modificar si está cancelada, completada o expirada
  if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(reservation.status)) {
    return false;
  }

  // No se puede modificar si es temporal y ya expiró
  if (reservation.isTemporary && reservation.temporaryExpiresAt) {
    const expirationTime = new Date(reservation.temporaryExpiresAt);
    if (new Date() > expirationTime) {
      return false;
    }
  }

  // Verificar si hay suficiente tiempo antes del evento
  const hoursUntilEvent = getHoursUntilReservation(reservation);
  
  // No se puede modificar si el evento ya pasó
  if (hoursUntilEvent < 0) {
    return false;
  }

  return true;
};

export const canCancelReservation = (reservation: ReservaItem): {
  canCancel: boolean;
  reason?: string;
  penalty?: {
    willBeCharged: boolean;
    amount?: number;
    percentage?: number;
    reason: string;
  };
} => {
  // No se puede cancelar si ya está cancelada, completada o expirada
  if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(reservation.status)) {
    return {
      canCancel: false,
      reason: `No se puede cancelar una reserva en estado ${reservation.status.toLowerCase()}`
    };
  }

  const hoursUntilEvent = getHoursUntilReservation(reservation);
  
  // No se puede cancelar si el evento ya pasó
  if (hoursUntilEvent < 0) {
    return {
      canCancel: false,
      reason: 'No se puede cancelar un evento que ya pasó'
    };
  }

  // Obtener política de cancelación (usar estándar por ahora)
  const policy = CANCELLATION_POLICIES[0]; // Política estándar

  // Verificar reglas de cancelación
  for (const rule of policy.rules) {
    if (hoursUntilEvent >= rule.hoursBeforeEvent) {
      return {
        canCancel: rule.allowCancellation,
        penalty: rule.penaltyPercentage > 0 ? {
          willBeCharged: true,
          percentage: rule.penaltyPercentage,
          amount: Math.round(reservation.totalPrice * (rule.penaltyPercentage / 100)),
          reason: rule.reason
        } : {
          willBeCharged: false,
          percentage: 0,
          reason: rule.reason
        }
      };
    }
  }

  // Aplicar regla por defecto
  return {
    canCancel: policy.defaultRule.allowCancellation,
    reason: policy.defaultRule.allowCancellation ? undefined : policy.defaultRule.reason,
    penalty: {
      willBeCharged: policy.defaultRule.penaltyPercentage > 0,
      percentage: policy.defaultRule.penaltyPercentage,
      amount: Math.round(reservation.totalPrice * (policy.defaultRule.penaltyPercentage / 100)),
      reason: policy.defaultRule.reason
    }
  };
};

// 🎯 OPERACIONES DE MODIFICACIÓN Y CANCELACIÓN

export const modifyReservation = (
  request: ModifyReservationRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): { success: boolean; updatedReservation?: ReservaItem; errors: string[] } => {
  console.log('🔄 Modificando reserva:', request.reservationId);

  const reservation = mockReservasItems.find((r: ReservaItem) => r.id === request.reservationId);
  if (!reservation) {
    return {
      success: false,
      errors: ['Reserva no encontrada']
    };
  }

  const validation = validateReservationModification(reservation, request, currentUserId);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Crear historial de cambios
  const changes: ReservationChange[] = [];
  const previousValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  // Procesar cambios
  if (request.changes.date && request.changes.date !== reservation.date) {
    changes.push({
      field: 'date',
      previousValue: reservation.date,
      newValue: request.changes.date,
      description: `Fecha cambiada de ${reservation.date} a ${request.changes.date}`
    });
    previousValues.date = reservation.date;
    newValues.date = request.changes.date;
  }

  if (request.changes.timeSlot) {
    const oldTimeSlot = `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`;
    const newTimeSlot = `${request.changes.timeSlot.startTime} - ${request.changes.timeSlot.endTime}`;
    
    if (oldTimeSlot !== newTimeSlot) {
      changes.push({
        field: 'timeSlot',
        previousValue: reservation.timeSlot,
        newValue: request.changes.timeSlot,
        description: `Horario cambiado de ${oldTimeSlot} a ${newTimeSlot}`
      });
      previousValues.timeSlot = reservation.timeSlot;
      newValues.timeSlot = request.changes.timeSlot;
    }
  }

  if (request.changes.numberOfPeople && request.changes.numberOfPeople !== reservation.numberOfPeople) {
    changes.push({
      field: 'numberOfPeople',
      previousValue: reservation.numberOfPeople,
      newValue: request.changes.numberOfPeople,
      description: `Número de personas cambiado de ${reservation.numberOfPeople} a ${request.changes.numberOfPeople}`
    });
    previousValues.numberOfPeople = reservation.numberOfPeople;
    newValues.numberOfPeople = request.changes.numberOfPeople;
  }

  if (request.changes.customerInfo) {
    // Procesar cambios en información del cliente
    Object.keys(request.changes.customerInfo).forEach(key => {
      const oldValue = reservation.customerInfo?.[key as keyof typeof reservation.customerInfo];
      const newValue = request.changes.customerInfo?.[key as keyof typeof request.changes.customerInfo];
      
      if (oldValue !== newValue) {
        changes.push({
          field: 'customerInfo',
          previousValue: { [key]: oldValue },
          newValue: { [key]: newValue },
          description: `${key} cambiado de "${oldValue}" a "${newValue}"`
        });
      }
    });
  }

  if (request.changes.notes && request.changes.notes !== reservation.notes) {
    changes.push({
      field: 'notes',
      previousValue: reservation.notes,
      newValue: request.changes.notes,
      description: 'Notas actualizadas'
    });
    previousValues.notes = reservation.notes;
    newValues.notes = request.changes.notes;
  }

  // Crear entrada en el historial
  const historyEntry: ReservationHistoryEntry = {
    id: `history_${Date.now()}`,
    action: 'MODIFIED',
    timestamp: new Date().toISOString(),
    userId: currentUserId,
    userType: 'SELLER', // Por ahora hardcodeado
    details: {
      reason: request.reason,
      changes,
      previousValues,
      newValues
    }
  };

  // Crear reserva actualizada
  const updatedReservation: ReservaItem = {
    ...reservation,
    date: request.changes.date || reservation.date,
    timeSlot: request.changes.timeSlot || reservation.timeSlot,
    numberOfPeople: request.changes.numberOfPeople || reservation.numberOfPeople,
    customerInfo: request.changes.customerInfo && reservation.customerInfo ? 
      { 
        name: request.changes.customerInfo.name || reservation.customerInfo.name,
        email: request.changes.customerInfo.email || reservation.customerInfo.email,
        phone: request.changes.customerInfo.phone || reservation.customerInfo.phone
      } : 
      reservation.customerInfo,
    notes: request.changes.notes !== undefined ? request.changes.notes : reservation.notes,
    status: 'MODIFIED',
    updatedAt: new Date().toISOString(),
    history: [...(reservation.history || []), historyEntry]
  };

  // Actualizar en el array (simulación)
  const index = mockReservasItems.findIndex((r: ReservaItem) => r.id === request.reservationId);
  if (index !== -1) {
    mockReservasItems[index] = updatedReservation;
  }

  console.log('✅ Reserva modificada exitosamente');
  console.log('📝 Cambios realizados:', changes.map(c => c.description));

  return {
    success: true,
    updatedReservation,
    errors: []
  };
};

export const cancelReservation = (
  request: CancelReservationRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): { success: boolean; cancelledReservation?: ReservaItem; errors: string[] } => {
  console.log('❌ Cancelando reserva:', request.reservationId);

  const reservation = mockReservasItems.find((r: ReservaItem) => r.id === request.reservationId);
  if (!reservation) {
    return {
      success: false,
      errors: ['Reserva no encontrada']
    };
  }

  const validation = validateReservationCancellation(reservation, request);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Crear entrada en el historial
  const historyEntry: ReservationHistoryEntry = {
    id: `history_${Date.now()}`,
    action: 'CANCELLED',
    timestamp: new Date().toISOString(),
    userId: currentUserId,
    userType: 'SELLER',
    details: {
      reason: request.reason,
      changes: [{
        field: 'status',
        previousValue: reservation.status,
        newValue: 'CANCELLED',
        description: `Reserva cancelada: ${request.reason}`
      }]
    }
  };

  // Crear reserva cancelada
  const cancelledReservation: ReservaItem = {
    ...reservation,
    status: 'CANCELLED',
    updatedAt: new Date().toISOString(),
    history: [...(reservation.history || []), historyEntry]
  };

  // Actualizar en el array (simulación)
  const index = mockReservasItems.findIndex((r: ReservaItem) => r.id === request.reservationId);
  if (index !== -1) {
    mockReservasItems[index] = cancelledReservation;
  }

  console.log('✅ Reserva cancelada exitosamente');
  console.log('💰 Penalidad aplicada:', validation.penalties.cancellation);

  return {
    success: true,
    cancelledReservation,
    errors: []
  };
};

// 🎯 FUNCIONES AUXILIARES

export const getHoursUntilReservation = (reservation: ReservaItem): number => {
  const now = new Date();
  const reservationDateTime = new Date(`${reservation.date}T${reservation.timeSlot.startTime}:00`);
  
  const diffMs = reservationDateTime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60); // Convertir a horas
};

export const getReservationActions = (reservation: ReservaItem): {
  modify: { enabled: boolean; reason?: string };
  cancel: { enabled: boolean; reason?: string };
  complete: { enabled: boolean; reason?: string };
  duplicate: { enabled: boolean; reason?: string };
} => {
  const canModify = canModifyReservation(reservation);
  const cancellationCheck = canCancelReservation(reservation);
  const hoursUntilEvent = getHoursUntilReservation(reservation);

  return {
    modify: {
      enabled: canModify && hoursUntilEvent > 1,
      reason: !canModify ? 'Reserva no modificable' : hoursUntilEvent <= 1 ? 'Muy poco tiempo antes del evento' : undefined
    },
    cancel: {
      enabled: cancellationCheck.canCancel,
      reason: cancellationCheck.reason
    },
    complete: {
      enabled: reservation.status === 'CONFIRMED' && hoursUntilEvent <= 2 && hoursUntilEvent >= -24,
      reason: reservation.status !== 'CONFIRMED' ? 'Solo reservas confirmadas pueden completarse' : 
              hoursUntilEvent > 2 ? 'Solo se puede completar cerca del horario del evento' :
              hoursUntilEvent < -24 ? 'Evento muy antiguo' : undefined
    },
    duplicate: {
      enabled: true, // Siempre se puede duplicar
      reason: undefined
    }
  };
};

export const formatReservationHistory = (history: ReservationHistoryEntry[]): string[] => {
  return history.map(entry => {
    const date = new Date(entry.timestamp).toLocaleString('es-ES');
    const action = {
      'CREATED': 'Creada',
      'CONFIRMED': 'Confirmada', 
      'CANCELLED': 'Cancelada',
      'MODIFIED': 'Modificada',
      'COMPLETED': 'Completada',
      'NO_SHOW': 'No se presentó',
      'EXPIRED': 'Expirada',
      'DELETED': 'Eliminada'
    }[entry.action] || entry.action;

    let description = `${action} el ${date}`;
    
    if (entry.details.reason) {
      description += ` - ${entry.details.reason}`;
    }

    if (entry.details.changes && entry.details.changes.length > 0) {
      const changes = entry.details.changes.map(c => c.description).join(', ');
      description += ` (${changes})`;
    }

    return description;
  });
}; 