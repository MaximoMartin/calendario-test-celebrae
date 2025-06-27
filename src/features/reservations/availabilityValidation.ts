import type { 
  ItemAvailability, 
  ItemAvailabilityValidation, 
  CreateReservaItemRequest,
  ReservaItem,
  ExtendedItemAvailability
} from '../../types';
import { RESERVATION_CONFIG } from './types';
import { mockReservasItems, mockItemTimeSlots, getReservasByDateAndItem } from './mockData';

export const getItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): ItemAvailability => {
  console.log(`🔍 Verificando disponibilidad para item ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  const maxCapacity = 10;
  
  const existingReservations = getReservasByDateAndItem(date, itemId);
  
  const conflictingReservations = existingReservations.filter(reserva => {
    return timeSlotsOverlap(
      { startTime: timeSlot.startTime, endTime: timeSlot.endTime },
      reserva.timeSlot
    );
  });

  const occupiedSpots = conflictingReservations.reduce((total, reserva) => {
    return total + reserva.numberOfPeople;
  }, 0);

  const availableSpots = Math.max(0, maxCapacity - occupiedSpots);
  const isAvailable = availableSpots > 0;

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

export const validateItemReservation = (
  request: CreateReservaItemRequest,
  _currentUserId: string = "87IZYWdezwJQsILiU57z"
): ItemAvailabilityValidation => {
  console.log(`🔍 Validando solicitud de reserva:`, request);
  
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request.itemId) {
    errors.push('El item seleccionado no existe');
  }

  const requestDate = new Date(request.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (requestDate < today) {
    errors.push('No se pueden hacer reservas para fechas pasadas');
  }

  if (request.numberOfPeople < 1) {
    errors.push('Debe reservar para al menos 1 persona');
  }

  const maxCapacity = 10;
  if (request.numberOfPeople > maxCapacity) {
    errors.push(`Máximo ${maxCapacity} personas permitidas para este item`);
  }

  if (!isValidTimeSlot(request.timeSlot)) {
    errors.push('Horario inválido');
  }

  const availability = getItemAvailability(request.itemId, request.date, request.timeSlot);
  
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

  if (availability.availableSpots > 0 && availability.availableSpots <= 2) {
    warnings.push(`Quedan pocos espacios disponibles (${availability.availableSpots})`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    availability,
    errors,
    warnings
  };
};

export const getAvailableSlotsForItem = (
  itemId: string,
  date: string
): Array<{ 
  timeSlot: { startTime: string; endTime: string }; 
  availability: ItemAvailability;
}> => {
  
  const itemSlots = mockItemTimeSlots.filter(slot => slot.itemId === itemId && slot.isActive);
  
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  
  const daySlots = itemSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  
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

export const getExtendedItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): ExtendedItemAvailability => {
  console.log(`🔍 Obteniendo disponibilidad extendida para item ${itemId}`);
  
  const baseAvailability = getItemAvailability(itemId, date, timeSlot);
  
  const extendedAvailability: ExtendedItemAvailability = {
    ...baseAvailability,
    applicableRules: [],
    isBlockedByRules: false,
    blockingRules: []
  };
  
  console.log(`✅ Disponibilidad extendida: disponible=${extendedAvailability.isAvailable}, bloqueado_por_reglas=${extendedAvailability.isBlockedByRules}`);
  
  return extendedAvailability;
};

export const getExtendedAvailableSlotsForItem = (
  itemId: string,
  date: string
): Array<{ 
  timeSlot: { startTime: string; endTime: string }; 
  availability: ExtendedItemAvailability;
}> => {
  console.log(`📅 Obteniendo slots extendidos para item ${itemId} en ${date}`);
  
  const itemSlots = mockItemTimeSlots.filter(slot => slot.itemId === itemId && slot.isActive);
  
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  
  const daySlots = itemSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
  
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

export const createItemReservation = (
  request: CreateReservaItemRequest,
  currentUserId: string = "87IZYWdezwJQsILiU57z"
): { success: boolean; reserva?: ReservaItem; errors: string[] } => {
  console.log(`🚀 Intentando crear reserva:`, request);
  
  const validation = validateItemReservation(request, currentUserId);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  const defaultPrice = 50;
  const defaultBundleId = "bundle_default";
  const defaultShopId = "shop_default";

  const nuevaReserva: ReservaItem = {
    id: `reserva_item_${Date.now()}`,
    itemId: request.itemId,
    bundleId: defaultBundleId,
    shopId: defaultShopId,
    userId: currentUserId,
    customerInfo: request.customerInfo,
    date: request.date,
    timeSlot: request.timeSlot,
    numberOfPeople: request.numberOfPeople,
    status: request.isTemporary ? 'PENDING' : 'CONFIRMED',
    isTemporary: request.isTemporary || false,
    temporaryExpiresAt: request.isTemporary 
      ? new Date(Date.now() + RESERVATION_CONFIG.TEMPORARY_RESERVATION_MINUTES * 60000).toISOString()
      : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'SELLER',
    notes: request.notes,
    itemPrice: defaultPrice,
    totalPrice: defaultPrice * request.numberOfPeople,
    isGroupReservation: false,
    groupSize: request.numberOfPeople
  };

  console.log(`✅ Reserva creada exitosamente:`, nuevaReserva);
  
  mockReservasItems.push(nuevaReserva);

  return {
    success: true,
    reserva: nuevaReserva,
    errors: []
  };
};

const timeSlotsOverlap = (
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean => {
  const start1 = slot1.startTime;
  const end1 = slot1.endTime;
  const start2 = slot2.startTime;
  const end2 = slot2.endTime;
  
  return start1 < end2 && start2 < end1;
};

const isValidTimeSlot = (timeSlot: { startTime: string; endTime: string }): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(timeSlot.startTime) || !timeRegex.test(timeSlot.endTime)) {
    return false;
  }
  
  return timeSlot.startTime < timeSlot.endTime;
}; 