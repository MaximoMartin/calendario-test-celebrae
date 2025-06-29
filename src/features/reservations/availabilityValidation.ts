import type { 
  ItemAvailability, 
  ItemAvailabilityValidation, 
  CreateReservaItemRequest,
  ReservaItem,
  BusinessHours,
  Shop
} from '../../types';
import { RESERVATION_CONFIG } from './types';
import { mockItemTimeSlots, useReservations } from './mockData';
import { useEntitiesState } from '../../hooks/useEntitiesState';

export const getItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string },
  reservasItems: ReservaItem[],
  shopId?: string,
  allShops?: Shop[]
): ItemAvailability => {
  console.log(`🔍 Verificando disponibilidad para item ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  if (shopId && allShops) {
    const businessHoursCheck = isTimeSlotWithinBusinessHours(shopId, date, timeSlot, allShops);
    if (!businessHoursCheck.isWithin) {
      console.log(`❌ Fuera del horario de atención: ${businessHoursCheck.reason}`);
      return {
        itemId,
        date,
        timeSlot,
        isAvailable: false,
        availableSpots: 0,
        totalSpots: 10,
        conflictingReservations: [],
        blockingReason: 'BUSINESS_HOURS'
      };
    }
  }
  
  const maxCapacity = 10;
  
  const existingReservations = reservasItems.filter(r => r.itemId === itemId && r.date === date);
  
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
  _currentUserId: string = "87IZYWdezwJQsILiU57z",
  reservasItems: ReservaItem[],
  allItems?: any[],
  allShops?: Shop[]
): ItemAvailabilityValidation => {
  console.log(`🔍 Validando solicitud de reserva:`, request);
  
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request.itemId) {
    errors.push('El item seleccionado no existe');
  }

  const item = allItems?.find(i => i.id === request.itemId);
  const shopId = item?.shopId;

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

  const availability = getItemAvailability(request.itemId, request.date, request.timeSlot, reservasItems, shopId, allShops);
  
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
  date: string,
  allItems?: any[],
  allShops?: Shop[]
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
    
    const item = allItems?.find(i => i.id === itemId);
    const shopId = item?.shopId;
    
    const availability = getItemAvailability(itemId, date, timeSlot, [], shopId, allShops);
    
    return {
      timeSlot,
      availability
    };
  });

  return availableSlots.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
};

export const useCreateItemReservation = () => {
  const { reservasItems, setReservasItems } = useReservations();
  const { allItems, allBundles, allShops } = useEntitiesState();

  return (request: CreateReservaItemRequest, currentUserId: string = "87IZYWdezwJQsILiU57z") => {
    // Buscar el item real
    const item = allItems.find((i: any) => i.id === request.itemId);
    if (!item) {
      return {
        success: false,
        errors: ['El item seleccionado no existe en el sistema.']
      };
    }
    // Buscar el bundle real
    const bundle = allBundles.find((b: any) => b.id === item.bundleId);
    if (!bundle) {
      return {
        success: false,
        errors: ['No se encontró el bundle asociado a este item.']
      };
    }
    const validation = validateItemReservation(request, currentUserId, reservasItems, allItems, allShops);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    const price = item.price;
    const nuevaReserva: ReservaItem = {
      id: `reserva_item_${Date.now()}`,
      itemId: item.id,
      bundleId: bundle.id,
      shopId: bundle.shopId,
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
      itemPrice: price,
      totalPrice: price * request.numberOfPeople,
      isGroupReservation: false,
      groupSize: request.numberOfPeople
    };
    setReservasItems((prev: any) => [...prev, nuevaReserva]);
    return {
      success: true,
      reserva: nuevaReserva,
      errors: []
    };
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

/**
 * Obtiene el día de la semana en formato string a partir de un número (0-6)
 */
const getDayNameFromNumber = (dayNumber: number): keyof BusinessHours => {
  const days: Array<keyof BusinessHours> = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayNumber];
};

/**
 * Convierte una hora en formato "HH:mm" a minutos desde medianoche
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Verifica si un horario está dentro de los rangos de horario de atención del shop
 */
export const isTimeSlotWithinBusinessHours = (
  shopId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string },
  allShops: Shop[]
): { isWithin: boolean; reason?: string } => {
  // Obtener el shop desde los datos pasados como parámetro
  const shop = allShops.find(s => s.id === shopId);
  if (!shop) {
    return { isWithin: false, reason: 'Shop no encontrado' };
  }

  // Obtener el día de la semana
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  const dayName = getDayNameFromNumber(dayOfWeek);

  // Obtener los horarios de atención para ese día
  const dayBusinessHours = shop.businessHours[dayName];
  
  // Si no hay rangos de horario, el shop está cerrado ese día
  if (!dayBusinessHours.openRanges || dayBusinessHours.openRanges.length === 0) {
    return { isWithin: false, reason: `El negocio está cerrado los ${dayName}s` };
  }

  // Convertir el timeSlot solicitado a minutos
  const requestStartMinutes = timeToMinutes(timeSlot.startTime);
  const requestEndMinutes = timeToMinutes(timeSlot.endTime);

  // Verificar si el timeSlot está completamente dentro de algún rango de horario de atención
  const isWithinAnyRange = dayBusinessHours.openRanges.some(range => {
    const rangeStartMinutes = timeToMinutes(range.from);
    const rangeEndMinutes = timeToMinutes(range.to);
    
    // El timeSlot debe estar completamente dentro del rango
    return requestStartMinutes >= rangeStartMinutes && requestEndMinutes <= rangeEndMinutes;
  });

  if (!isWithinAnyRange) {
    const openRangesText = dayBusinessHours.openRanges
      .map(range => `${range.from} - ${range.to}`)
      .join(', ');
    return { 
      isWithin: false, 
      reason: `Fuera del horario de atención. Horarios disponibles: ${openRangesText}` 
    };
  }

  return { isWithin: true };
};

/**
 * Obtiene todos los rangos de horario disponibles para un shop en una fecha específica
 */
export const getShopBusinessHoursForDate = (
  shopId: string,
  date: string,
  allShops: Shop[]
): { from: string; to: string }[] => {
  const shop = allShops.find(s => s.id === shopId);
  if (!shop) {
    return [];
  }

  const requestDate = new Date(date);
  const dayOfWeek = requestDate.getDay();
  const dayName = getDayNameFromNumber(dayOfWeek);

  return shop.businessHours[dayName].openRanges || [];
};

/**
 * Verifica si un shop está abierto en una fecha específica
 */
export const isShopOpenOnDate = (
  shopId: string, 
  date: string,
  allShops: Shop[]
): boolean => {
  const ranges = getShopBusinessHoursForDate(shopId, date, allShops);
  return ranges.length > 0;
}; 