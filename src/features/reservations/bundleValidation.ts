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
import { bundles, items, extras } from '../../mockData/entitiesData';
import { mockReservasBundle, mockReservasItems } from './mockData';

// 🎯 CHECKPOINT 3: LÓGICA DE VALIDACIÓN PARA RESERVAS DE BUNDLE COMPLETO
// 🎯 CHECKPOINT 4: EXTENDIDA CON LÓGICA DE GRUPOS Y RELACIONES CONDICIONALES
// Reutiliza y extiende la lógica existente de items individuales

/**
 * 🎯 CHECKPOINT 4: Valida si un item grupal está disponible
 */
const validateGroupItem = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): GroupValidation => {
  console.log(`🏢 Validando item grupal ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  const item = items.find(i => i.id === itemId);
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!item) {
    return {
      itemId,
      isValid: false,
      isGroupExclusive: false,
      conflictingGroupReservations: [],
      errors: ['Item no encontrado'],
      warnings: []
    };
  }

  const isGroupExclusive = item.isPerGroup && (item.bookingConfig?.isExclusive || false);
  
  // Si es un item exclusivo por grupo, verificar que no haya otras reservas de grupo
  const conflictingGroupReservations: string[] = [];
  
  if (isGroupExclusive) {
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
      errors.push(`Este item es exclusivo por grupo y ya está reservado en este horario`);
    }
  }

  // Warnings para items grupales
  if (item.isPerGroup && !errors.length) {
    warnings.push(`Este item se cobra por grupo completo (máx. ${item.bookingConfig?.groupCapacity || item.size} personas)`);
  }

  const isValid = errors.length === 0;

  return {
    itemId,
    isValid,
    isGroupExclusive,
    conflictingGroupReservations,
    errors,
    warnings
  };
};

/**
 * Valida la disponibilidad completa de un bundle con múltiples items y extras
 */
export const validateBundleReservation = (
  request: CreateReservaBundleRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): BundleAvailabilityValidation => {
  console.log(`🎯 Validando reserva de bundle completo:`, request);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Validar que el bundle existe
  const bundle = bundles.find(b => b.id === request.bundleId);
  if (!bundle) {
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
  
  if (!bundle.isActive) {
    return {
      isValid: false,
      itemValidations: [],
      extraValidations: [],
      groupValidations: [],
      errors: ['El bundle seleccionado no está disponible'],
      warnings: [],
      totalPrice: 0
    };
  }

  // 2. Validar que al menos se haya seleccionado un item
  if (request.itemReservations.length === 0) {
    errors.push('Debe seleccionar al menos un item para reservar');
  }

  // 3. 🎯 CHECKPOINT 4: Validar items grupales antes de validación individual
  const groupValidations = request.itemReservations.map(itemReq => {
    const item = items.find(i => i.id === itemReq.itemId);
    if (item?.isPerGroup) {
      return validateGroupItem(itemReq.itemId, itemReq.date, itemReq.timeSlot);
    }
    // Para items no grupales, retornar validación vacía pero válida
    return {
      itemId: itemReq.itemId,
      isValid: true,
      isGroupExclusive: false,
      conflictingGroupReservations: [],
      errors: [],
      warnings: []
    };
  });

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

  // 5. Validar que todos los items pertenezcan al bundle
  const bundleItemIds = bundle.items.map(item => item.id);
  request.itemReservations.forEach(itemReq => {
    if (!bundleItemIds.includes(itemReq.itemId)) {
      errors.push(`El item ${itemReq.itemId} no pertenece al bundle seleccionado`);
    }
  });

  // 6. 🎯 CHECKPOINT 4: Validar extras con relaciones condicionales
  const extraValidations = request.selectedExtras.map(extraReq => 
    validateExtraWithConditionalRelations(extraReq.extraId, extraReq.quantity, bundle, request.itemReservations)
  );

  // 7. Consolidar errores y warnings de items
  itemValidations.forEach((validation, index) => {
    if (!validation.isValid) {
      const itemId = request.itemReservations[index].itemId;
      const item = items.find(i => i.id === itemId);
      errors.push(`${item?.title || itemId}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `${items.find(i => i.id === request.itemReservations[index].itemId)?.title}: ${w}`));
  });

  // 8. 🎯 CHECKPOINT 4: Consolidar errores y warnings de grupos
  groupValidations.forEach(validation => {
    if (!validation.isValid) {
      const item = items.find(i => i.id === validation.itemId);
      errors.push(`${item?.title || validation.itemId} (Grupo): ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `${items.find(i => i.id === validation.itemId)?.title} (Grupo): ${w}`));
  });

  // 9. Consolidar errores y warnings de extras
  extraValidations.forEach(validation => {
    if (!validation.isValid) {
      const extra = extras.find(e => e.id === validation.extraId);
      errors.push(`${extra?.title || validation.extraId}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `${extras.find(e => e.id === validation.extraId)?.title}: ${w}`));
  });

  // 10. 🎯 CHECKPOINT 4: Calcular precio total considerando lógica de grupo
  const itemsTotal = itemValidations.reduce((total, validation, index) => {
    if (validation.isValid) {
      const item = items.find(i => i.id === request.itemReservations[index].itemId);
      const itemRequest = request.itemReservations[index];
      
      if (item?.isPerGroup) {
        // Para items grupales, el precio es fijo independiente del número de personas
        return total + (item.price || 0);
      } else {
        // Para items por persona, multiplicar por número de personas
        return total + (item?.price || 0) * itemRequest.numberOfPeople;
      }
    }
    return total;
  }, 0);

  const extrasTotal = extraValidations.reduce((total, validation) => {
    return total + validation.totalPrice;
  }, 0);

  const totalPrice = itemsTotal + extrasTotal;

  // 11. Warnings adicionales a nivel bundle
  if (totalPrice > 500) {
    warnings.push('Reserva de alto valor - considerar confirmación adicional');
  }

  if (request.itemReservations.length > 3) {
    warnings.push('Reserva compleja con múltiples items - verificar coordinación de horarios');
  }

  // 🎯 CHECKPOINT 4: Warning para reservas que mezclan items grupales e individuales
  const hasGroupItems = request.itemReservations.some(itemReq => {
    const item = items.find(i => i.id === itemReq.itemId);
    return item?.isPerGroup;
  });
  const hasIndividualItems = request.itemReservations.some(itemReq => {
    const item = items.find(i => i.id === itemReq.itemId);
    return !item?.isPerGroup;
  });
  
  if (hasGroupItems && hasIndividualItems) {
    warnings.push('Esta reserva mezcla items grupales e individuales - verificar precios y capacidades');
  }

  const isValid = errors.length === 0 && 
                  itemValidations.every(v => v.isValid) && 
                  extraValidations.every(v => v.isValid) &&
                  groupValidations.every(v => v.isValid);

  console.log(`✅ Validación de bundle completada. Válida: ${isValid}, Items: ${itemValidations.length}, Extras: ${extraValidations.length}, Grupos: ${groupValidations.length}`);

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
 * 🎯 CHECKPOINT 4: Valida un extra con relaciones condicionales
 */
const validateExtraWithConditionalRelations = (
  extraId: string,
  requestedQuantity: number,
  bundle: Bundle,
  selectedItemReservations: Array<{ itemId: string; date: string; timeSlot: { startTime: string; endTime: string }; numberOfPeople: number; }>
): ExtraValidation => {
  console.log(`🔍 Validando extra con relaciones ${extraId}, cantidad: ${requestedQuantity}`);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Buscar el extra
  const extra = extras.find(e => e.id === extraId);
  if (!extra) {
    return {
      extraId,
      isValid: false,
      requestedQuantity,
      maxQuantity: 0,
      isAvailable: false,
      errors: ['Extra no encontrado'],
      warnings: [],
      unitPrice: 0,
      totalPrice: 0,
      requiredItemMissing: false,
      requiredItemId: undefined
    };
  }

  // 🎯 CHECKPOINT 4: Verificar relaciones condicionales
  if (extra.requiredItemId) {
    const hasRequiredItem = selectedItemReservations.some(itemReq => itemReq.itemId === extra.requiredItemId);
    
    if (!hasRequiredItem) {
      const requiredItem = items.find(i => i.id === extra.requiredItemId);
      errors.push(`Este extra requiere que se reserve el item: ${requiredItem?.title || extra.requiredItemId}`);
      
      return {
        extraId,
        isValid: false,
        requestedQuantity,
        maxQuantity: extra.maxQuantity || 10,
        isAvailable: extra.isActive,
        errors,
        warnings,
        unitPrice: extra.price,
        totalPrice: 0,
        requiredItemMissing: true,
        requiredItemId: extra.requiredItemId
      };
    }
  }

  // Continuar con validación estándar de extra
  const baseValidation = validateExtra(extraId, requestedQuantity, bundle);
  
  // 🎯 CHECKPOINT 4: Agregar campos específicos para relaciones condicionales
  return {
    ...baseValidation,
    requiredItemMissing: false,
    requiredItemId: extra.requiredItemId
  };
};

/**
 * Valida un extra específico (función original del Checkpoint 3)
 */
const validateExtra = (
  extraId: string,
  requestedQuantity: number,
  bundle: Bundle
): ExtraValidation => {
  console.log(`🔍 Validando extra ${extraId}, cantidad: ${requestedQuantity}`);
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Buscar el extra
  const extra = extras.find(e => e.id === extraId);
  if (!extra) {
    return {
      extraId,
      isValid: false,
      requestedQuantity,
      maxQuantity: 0,
      isAvailable: false,
      errors: ['Extra no encontrado'],
      warnings: [],
      unitPrice: 0,
      totalPrice: 0
    };
  }

  // Verificar que pertenezca al bundle
  const bundleExtraIds = bundle.extras.map(e => e.id);
  if (!bundleExtraIds.includes(extraId)) {
    return {
      extraId,
      isValid: false,
      requestedQuantity,
      maxQuantity: 0,
      isAvailable: false,
      errors: ['Este extra no pertenece al bundle seleccionado'],
      warnings: [],
      unitPrice: extra.price,
      totalPrice: 0
    };
  }

  // Verificar que esté activo
  if (!extra.isActive) {
    return {
      extraId,
      isValid: false,
      requestedQuantity,
      maxQuantity: 0,
      isAvailable: false,
      errors: ['Extra no disponible'],
      warnings: [],
      unitPrice: extra.price,
      totalPrice: 0
    };
  }

  // Validar cantidad
  if (requestedQuantity < 1) {
    errors.push('La cantidad debe ser mayor a 0');
  }

  const maxQuantity = extra.maxQuantity || 10; // Default si no está especificado
  if (requestedQuantity > maxQuantity) {
    errors.push(`Cantidad máxima permitida: ${maxQuantity}`);
  }

  // 🎯 CHECKPOINT 4: Warnings específicos para extras grupales
  if (extra.isPerGroup && requestedQuantity > 1) {
    warnings.push('Este extra se cobra por grupo completo - solo necesitas 1 unidad');
  }

  // Warnings
  if (extra.isRequired && requestedQuantity === 0) {
    warnings.push('Este extra es recomendado para la experiencia completa');
  }

  if (requestedQuantity > 5) {
    warnings.push('Cantidad elevada - verificar disponibilidad de stock');
  }

  const isValid = errors.length === 0;
  
  // 🎯 CHECKPOINT 4: Calcular precio considerando lógica de grupo
  let totalPrice = 0;
  if (isValid) {
    if (extra.isPerGroup) {
      // Para extras grupales, el precio es fijo independiente de la cantidad
      totalPrice = extra.price;
    } else {
      // Para extras por unidad, multiplicar por cantidad
      totalPrice = extra.price * requestedQuantity;
    }
  }

  return {
    extraId,
    isValid,
    requestedQuantity,
    maxQuantity,
    isAvailable: extra.isActive,
    errors,
    warnings,
    unitPrice: extra.price,
    totalPrice
  };
};

/**
 * 🎯 CHECKPOINT 4: Crea una reserva de bundle completa
 * Extiende la funcionalidad del Checkpoint 3 con lógica de grupos
 */
export const createBundleReservation = async (
  request: CreateReservaBundleRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): Promise<{ success: boolean; reservationId?: string; errors: string[] }> => {
  console.log(`🎯 Creando reserva de bundle completo:`, request);

  // 1. Validar la reserva primero
  const validation = validateBundleReservation(request, currentUserId);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    // 2. Crear las reservas individuales de items (reutiliza lógica existente)
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
        // Si falla algún item, retornar error
        return {
          success: false,
          errors: [`Error al crear reserva para item ${itemReq.itemId}: ${itemResult.errors.join(', ')}`]
        };
      }
      
      itemReservationIds.push(itemResult.reserva.id);
    }

    // 3. 🎯 CHECKPOINT 4: Crear el objeto ReservaBundle con lógica de grupos
    const bundleReservationId = `reserva_bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Obtener bundle para referencia
    const bundle = bundles.find(b => b.id === request.bundleId);
    if (!bundle) {
      return {
        success: false,
        errors: ['Bundle no encontrado']
      };
    }
    
    // Procesar extras con lógica de grupo
    const processedExtras = request.selectedExtras.map(extraReq => {
      const extra = extras.find(e => e.id === extraReq.extraId);
      return {
        extraId: extraReq.extraId,
        quantity: extraReq.quantity,
        unitPrice: extra?.price || 0,
        totalPrice: extra?.isPerGroup ? (extra.price || 0) : ((extra?.price || 0) * extraReq.quantity),
        isGroupSelection: extra?.isPerGroup || false // 🎯 CHECKPOINT 4
      };
    });

    // Obtener referencias a las reservas de items creadas
    const reservasItems = itemReservationIds.map(id => {
      // En un sistema real, esto sería una consulta a la base de datos
      // Por ahora, creamos objetos de referencia
      const itemReq = request.itemReservations[itemReservationIds.indexOf(id)];
      const item = items.find(i => i.id === itemReq.itemId);
      
      return {
        id,
        itemId: itemReq.itemId,
        bundleId: request.bundleId,
        shopId: bundle.shopId,
        userId: currentUserId,
        customerInfo: request.customerInfo,
        date: itemReq.date,
        timeSlot: itemReq.timeSlot,
        numberOfPeople: itemReq.numberOfPeople,
        status: 'CONFIRMED' as const,
        isTemporary: request.isTemporary || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SELLER' as const,
        notes: request.notes,
        itemPrice: item?.price || 0,
        totalPrice: item?.isPerGroup ? (item.price || 0) : ((item?.price || 0) * itemReq.numberOfPeople),
        isGroupReservation: item?.isPerGroup || false, // 🎯 CHECKPOINT 4
        groupSize: itemReq.numberOfPeople // 🎯 CHECKPOINT 4
      };
    });

    const bundleReservation: ReservaBundle = {
      id: bundleReservationId,
      bundleId: request.bundleId,
      shopId: bundle.shopId,
      userId: currentUserId,
      customerInfo: request.customerInfo,
      
      // Referencias a las reservas individuales
      reservasItems,
      extras: processedExtras,
      
      // Totales y estado
      itemsTotal: validation.totalPrice - processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
      extrasTotal: processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
      totalPrice: validation.totalPrice,
      
      status: 'CONFIRMED',
      isTemporary: request.isTemporary || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'SELLER',
      notes: request.notes
    };

    // 4. En un sistema real, aquí se guardaría en la base de datos
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

// 🎯 CHECKPOINT 4: Función auxiliar para validar si un extra está disponible según relaciones condicionales
export const checkExtraAvailability = (
  extraId: string,
  selectedItemIds: string[]
): { available: boolean; reason?: string } => {
  const extra = extras.find(e => e.id === extraId);
  
  if (!extra) {
    return { available: false, reason: 'Extra no encontrado' };
  }
  
  if (!extra.isActive) {
    return { available: false, reason: 'Extra no disponible' };
  }
  
  // 🎯 CHECKPOINT 4: Verificar relación condicional
  if (extra.requiredItemId && !selectedItemIds.includes(extra.requiredItemId)) {
    const requiredItem = items.find(i => i.id === extra.requiredItemId);
    return { 
      available: false, 
      reason: `Requiere que se seleccione: ${requiredItem?.title || extra.requiredItemId}` 
    };
  }
  
  return { available: true };
}; 