import type { 
  CreateReservaBundleRequest,
  BundleAvailabilityValidation,
  ExtraValidation,
  ReservaBundle,
  Bundle,
  GroupValidation,
  ReservaItem
} from '../../types';
import { isShopOpenOnDate, getItemAvailability } from './availabilityValidation';
import { useReservations } from './mockData';
import { useEntitiesState } from '../../hooks/useEntitiesState';

// Función pura para validar items grupales
const validateGroupItem = (
  reservasItems: ReservaItem[],
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): GroupValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conflictingGroupReservations: string[] = [];
  const existingGroupReservations = reservasItems.filter((reserva) => 
    reserva.itemId === itemId &&
    reserva.date === date &&
    reserva.isGroupReservation &&
    reserva.status !== 'CANCELLED' &&
    reserva.status !== 'EXPIRED' &&
    !(reserva.timeSlot.endTime <= timeSlot.startTime || reserva.timeSlot.startTime >= timeSlot.endTime)
  );
  conflictingGroupReservations.push(...existingGroupReservations.map((r) => r.id));
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
  reservasItems: ReservaItem[] = [],
  allBundles?: Bundle[],
  allItems?: any[],
  allShops?: any[]
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

  const bundle = allBundles?.find(b => b.id === request.bundleId);
  const shopId = bundle?.shopId;

  if (shopId && allShops) {
    request.itemReservations.forEach((itemReq, index) => {
      const isShopOpenForDate = isShopOpenOnDate(shopId, itemReq.date, allShops);
      if (!isShopOpenForDate) {
        const dateStr = new Date(itemReq.date).toLocaleDateString('es-ES');
        errors.push(`El negocio está cerrado el ${dateStr} (item ${index + 1})`);
      }
    });
  }

  // 3. Validar items grupales (simplificado)
  const groupValidations = request.itemReservations.map(itemReq => 
    validateGroupItem(reservasItems, itemReq.itemId, itemReq.date, itemReq.timeSlot)
  );

  // 4. Validar cada item individualmente (reutiliza lógica existente)
  const itemValidations = request.itemReservations.map(itemReq => {
    const availability = getItemAvailability(
      itemReq.itemId,
      itemReq.date,
      itemReq.timeSlot,
      reservasItems,
      allItems,
      allShops
    );
    const isValid = availability.isAvailable;
    return {
      isValid,
      availability,
      errors: isValid ? [] : [availability.blockingReason || 'No disponible'],
      warnings: []
    };
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
export const useCreateBundleReservation = () => {
  const { setReservasBundle, reservasItems, setReservasItems } = useReservations();
  const { allBundles, allItems, allShops } = useEntitiesState();
  return async (request: CreateReservaBundleRequest, currentUserId: string = "87IZYWdezwJQsILiU57z") => {
    console.log(`🎯 Creando reserva de bundle completo (simplificado):`, request);
    // Validar la reserva primero
    const validation = validateBundleReservation(request, reservasItems, allBundles, allItems, allShops);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    try {
      // Obtener el bundle real para shopId
      const bundle = allBundles.find((b: Bundle) => b.id === request.bundleId);
      // Crear las reservas individuales de items
      const createdReservaItems = request.itemReservations.map((itemReq, idx) => {
        const reservaId = `reserva_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${idx}`;
        const item = allItems.find((i: any) => i.id === itemReq.itemId);
        return {
          id: reservaId,
          itemId: itemReq.itemId,
          bundleId: request.bundleId,
          shopId: bundle ? bundle.shopId : '',
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
          itemPrice: item ? item.price : 0,
          totalPrice: item ? item.price * itemReq.numberOfPeople : 0,
          isGroupReservation: false,
          groupSize: itemReq.numberOfPeople
        };
      });
      setReservasItems(prev => [...prev, ...createdReservaItems]);
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
        shopId: bundle ? bundle.shopId : '',
        userId: currentUserId,
        customerInfo: request.customerInfo,
        reservasItems: createdReservaItems,
        extras: processedExtras,
        itemsTotal: createdReservaItems.reduce((sum, r) => sum + r.totalPrice, 0),
        extrasTotal: processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
        totalPrice: createdReservaItems.reduce((sum, r) => sum + r.totalPrice, 0) + processedExtras.reduce((sum, e) => sum + e.totalPrice, 0),
        status: 'CONFIRMED',
        isTemporary: request.isTemporary || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'SELLER' as const,
        notes: request.notes
      };
      setReservasBundle(prev => [...prev, bundleReservation]);
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
}; 