import type { 
  CreateReservaBundleRequest,
  BundleAvailabilityValidation,
  ExtraValidation,
  ReservaBundle,
  Bundle,
  CreateReservaItemRequest,
  GroupValidation
} from '../../types';
import { validateItemReservation, createItemReservation } from './availabilityValidation';
import { mockReservasBundle, mockReservasItems } from './mockData';

// 🎯 CHECKPOINT 3: LÓGICA DE VALIDACIÓN PARA RESERVAS DE BUNDLE COMPLETO (SIMPLIFICADO)
// Versión simplificada sin dependencias de datos estáticos complejos

/**
 * 🎯 CHECKPOINT 4: Valida si un item grupal está disponible (SIMPLIFICADO)
 */
const validateGroupItem = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): GroupValidation => {
  console.log(`🏢 Validando item grupal ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  // Simplificado - sin acceso a datos estáticos complejos
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validación básica - asumir que el item existe y es válido
  const conflictingGroupReservations: string[] = [];
  
  // Verificar reservas existentes de forma simplificada
  const existingGroupReservations = mockReservasItems.filter(reserva => 
    reserva.itemId === itemId &&
    reserva.date === date &&
    reserva.isGroupReservation &&
    reserva.status !== 'CANCELLED' &&
    reserva.status !== 'EXPIRED' &&
    // Verificar solapamiento de horarios
    !(reserva.timeSlot.endTime <= timeSlot.startTime || reserva.timeSlot.startTime >= timeSlot.endTime)
  );

  conflictingGroupReservations.push(...existingGroupReservations.map(r => r.id));
  
  if (conflictingGroupReservations.length > 0) {
    errors.push(`Este item ya está reservado en este horario`);
  }

  const isValid = errors.length === 0;

  return {
    itemId,
    isValid,
    isGroupExclusive: false, // Simplificado
    conflictingGroupReservations,
    errors,
    warnings
  };
};

/**
 * Valida la disponibilidad completa de un bundle con múltiples items y extras (SIMPLIFICADO)
 */
export const validateBundleReservation = (
  request: CreateReservaBundleRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): BundleAvailabilityValidation => {
  console.log(`🎯 Validando reserva de bundle completo:`, request);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Validar que el bundle existe (SIMPLIFICADO)
  if (!request.bundleId) {
    return {
      isValid: false,
      itemValidations: [],
      extraValidations: [],
      groupValidations: [],
      errors: ['El bundle seleccionado no existe'],
      warnings: [],
      totalPrice: 0
    };
  }

  // 2. Validar que al menos se haya seleccionado un item
  if (request.itemReservations.length === 0) {
    errors.push('Debe seleccionar al menos un item para reservar');
  }

  // 3. Validar items grupales (simplificado)
  const groupValidations = request.itemReservations.map(itemReq => 
    validateGroupItem(itemReq.itemId, itemReq.date, itemReq.timeSlot)
  );

  // 4. Validar cada item individualmente (reutiliza lógica existente)
  const itemValidations = request.itemReservations.map(itemReq => {
    const itemRequest: CreateReservaItemRequest = {
      itemId: itemReq.itemId,
      date: itemReq.date,
      timeSlot: itemReq.timeSlot,
      numberOfPeople: itemReq.numberOfPeople,
      customerInfo: request.customerInfo,
      notes: request.notes,
      isTemporary: request.isTemporary
    };
    
    console.log(`🔍 Validando item ${itemReq.itemId} dentro del bundle`);
    return validateItemReservation(itemRequest, currentUserId);
  });

  // 5. Validar extras (simplificado)
  const extraValidations = request.selectedExtras.map(extraReq => 
    validateExtraSimplified(extraReq.extraId, extraReq.quantity)
  );

  // 6. Consolidar errores y warnings
  itemValidations.forEach((validation, index) => {
    if (!validation.isValid) {
      const itemId = request.itemReservations[index].itemId;
      errors.push(`Item ${itemId}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings);
  });

  groupValidations.forEach(validation => {
    if (!validation.isValid) {
      errors.push(`Item ${validation.itemId} (Grupo): ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings);
  });

  extraValidations.forEach(validation => {
    if (!validation.isValid) {
      errors.push(`Extra ${validation.extraId}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings);
  });

  // 7. Calcular precio total (simplificado)
  const totalPrice = extraValidations.reduce((total, validation) => total + validation.totalPrice, 0);

  const isValid = errors.length === 0 && 
                  itemValidations.every(v => v.isValid) && 
                  extraValidations.every(v => v.isValid) &&
                  groupValidations.every(v => v.isValid);

  console.log(`✅ Validación de bundle completada. Válida: ${isValid}`);

  return {
    isValid,
    itemValidations,
    extraValidations,
    groupValidations,
    errors,
    warnings,
    totalPrice
  };
};

/**
 * Valida un extra de forma simplificada
 */
const validateExtraSimplified = (
  extraId: string,
  requestedQuantity: number
): ExtraValidation => {
  console.log(`🔍 Validando extra simplificado ${extraId}, cantidad: ${requestedQuantity}`);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validación básica
  if (requestedQuantity < 0) {
    errors.push('La cantidad debe ser mayor o igual a 0');
  }

  if (requestedQuantity > 10) {
    errors.push('Cantidad máxima permitida: 10');
  }

  const isValid = errors.length === 0;
  const unitPrice = 20; // Precio por defecto
  const totalPrice = isValid ? unitPrice * requestedQuantity : 0;

  return {
    extraId,
    isValid,
    requestedQuantity,
    maxQuantity: 10,
    isAvailable: true,
    errors,
    warnings,
    unitPrice,
    totalPrice
  };
};

/**
 * Crea una reserva de bundle completa (SIMPLIFICADO)
 */
export const createBundleReservation = async (
  request: CreateReservaBundleRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): Promise<{ success: boolean; reservationId?: string; errors: string[] }> => {
  console.log(`🎯 Creando reserva de bundle completo (simplificado):`, request);

  // Validar la reserva primero
  const validation = validateBundleReservation(request, currentUserId);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    // Crear las reservas individuales de items
    const itemReservationIds: string[] = [];
    
    for (const itemReq of request.itemReservations) {
      const itemRequest: CreateReservaItemRequest = {
        itemId: itemReq.itemId,
        date: itemReq.date,
        timeSlot: itemReq.timeSlot,
        numberOfPeople: itemReq.numberOfPeople,
        customerInfo: request.customerInfo,
        notes: request.notes,
        isTemporary: request.isTemporary
      };
      
      console.log(`🔧 Creando reserva de item individual ${itemReq.itemId}`);
      const itemResult = createItemReservation(itemRequest, currentUserId);
      
      if (!itemResult.success || !itemResult.reserva) {
        return {
          success: false,
          errors: [`Error al crear reserva para item ${itemReq.itemId}: ${itemResult.errors.join(', ')}`]
        };
      }
      
      itemReservationIds.push(itemResult.reserva.id);
    }

    // Crear el objeto ReservaBundle simplificado
    const bundleReservationId = `reserva_bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const processedExtras = request.selectedExtras.map(extraReq => ({
      extraId: extraReq.extraId,
      quantity: extraReq.quantity,
      unitPrice: 20, // Precio por defecto
      totalPrice: 20 * extraReq.quantity,
      isGroupSelection: false
    }));

    const bundleReservation: ReservaBundle = {
      id: bundleReservationId,
      bundleId: request.bundleId,
      shopId: "default_shop_id", // Simplificado
      userId: currentUserId,
      customerInfo: request.customerInfo,
      
      // Referencias simplificadas
      reservasItems: [], // Simplificado
      extras: processedExtras,
      
      // Totales
      itemsTotal: 0, // Simplificado
      extrasTotal: processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
      totalPrice: processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
      
      status: 'CONFIRMED',
      isTemporary: request.isTemporary || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'SELLER',
      notes: request.notes
    };

    // Guardar en mock data
    mockReservasBundle.push(bundleReservation);
    
    console.log(`✅ Reserva de bundle creada exitosamente: ${bundleReservationId}`);
    
    return {
      success: true,
      reservationId: bundleReservationId,
      errors: []
    };

  } catch (error) {
    console.error('❌ Error al crear reserva de bundle:', error);
    return {
      success: false,
      errors: ['Error interno al procesar la reserva. Intente nuevamente.']
    };
  }
};

// Función auxiliar simplificada para verificar disponibilidad de extra
export const checkExtraAvailability = (
  extraId: string,
  selectedItemIds: string[]
): { available: boolean; reason?: string } => {
  // Simplificado - siempre disponible
  return { available: true };
}; 