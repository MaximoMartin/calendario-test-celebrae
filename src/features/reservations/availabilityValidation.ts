import type { 
  ReservaItem, 
  ItemAvailability, 
  Item,
  Shop,
  BusinessHours
} from '../../types';
import { 
  createDateFromString, 
  getDayOfWeek, 
  getDayNameForBusinessHours, 
  getDayNameInSpanish,
  isTimeSlotWithinRange,
} from '../../utils/dateHelpers';

// NOTA: Todas las funciones de validación de items y disponibilidad solo se usan para validar los items seleccionados dentro de una reserva de bundle. No existe reserva individual de items.

export const getItemAvailability = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string },
  reservasItems: ReservaItem[],
  bundleItems?: Item[],
  allShops?: Shop[]
): ItemAvailability => {
  console.log(`🔍 Verificando disponibilidad para item ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  // Buscar el item para obtener su configuración
  const item = bundleItems?.find(i => i.id === itemId);
  if (!item) {
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

  // Verificar si el item está activo
  if (!item.isActive) {
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

  // Buscar el shop para validar horarios
  const shop = allShops?.find(s => s.id === item.shopId);
  if (!shop) {
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

  // === VALIDACIÓN 1: Horarios del Shop ===
  const dayOfWeek = getDayOfWeek(date);
  const dayName = getDayNameForBusinessHours(date);
  const shopDaySchedule = shop.businessHours[dayName];

  // Verificar si el shop está abierto en ese día
  if (!shopDaySchedule.openRanges || shopDaySchedule.openRanges.length === 0) {
    console.log(`🚫 Shop ${shop.name} está cerrado el ${dayName} (${date})`);
    return {
      itemId,
      date,
      timeSlot,
      isAvailable: false,
      availableSpots: 0,
      totalSpots: 0,
      conflictingReservations: [],
      blockingReason: 'BUSINESS_HOURS'
    };
  }

  // Verificar si el horario del item está dentro del horario del shop
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const normalizeTime = (time: string): string => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hours = h.padStart(2, '0');
    const minutes = (m || '00').padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const slotStart = timeToMinutes(normalizeTime(timeSlot.startTime));
  const slotEnd = timeToMinutes(normalizeTime(timeSlot.endTime));

  const isWithinShopHours = shopDaySchedule.openRanges.some(range => {
    const rangeStart = timeToMinutes(normalizeTime(range.from));
    const rangeEnd = timeToMinutes(normalizeTime(range.to));
    const debugMsg = `Comparando slot [${normalizeTime(timeSlot.startTime)}-${normalizeTime(timeSlot.endTime)}] con rango [${normalizeTime(range.from)}-${normalizeTime(range.to)}] => ${slotStart} >= ${rangeStart} && ${slotEnd} <= ${rangeEnd}`;
    if (slotStart >= rangeStart && slotEnd <= rangeEnd) {
      console.log('✅', debugMsg);
      return true;
    } else {
      console.log('❌', debugMsg);
      return false;
    }
  });

  if (!isWithinShopHours) {
    console.log(`🚫 Horario ${timeSlot.startTime}-${timeSlot.endTime} está fuera del horario del shop ${shop.name} (${shopDaySchedule.openRanges.map(r => `${r.from}-${r.to}`).join(', ')})`);
    return {
      itemId,
      date,
      timeSlot,
      isAvailable: false,
      availableSpots: 0,
      totalSpots: 0,
      conflictingReservations: [],
      blockingReason: 'BUSINESS_HOURS'
    };
  }

  // === VALIDACIÓN 2: Horarios específicos del Item ===
  if (item.timeSlots) {
    // Verificar si el día está disponible según el horario del item
    const daySchedule = item.timeSlots.weeklySchedule?.[dayOfWeek];
    if (!daySchedule || !daySchedule.isAvailable) {
      console.log(`🚫 Item ${item.title} no está disponible el ${dayName} (${date})`);
      return {
        itemId,
        date,
        timeSlot,
        isAvailable: false,
        availableSpots: 0,
        totalSpots: 0,
        conflictingReservations: [],
        blockingReason: 'BUSINESS_HOURS'
      };
    }

    // Verificar si el horario específico está disponible
    const matchingSlot = daySchedule.slots.find((slot: { startTime: string; endTime: string; maxBookingsPerSlot: number; isActive: boolean }) => 
      slot.isActive && 
      slot.startTime === timeSlot.startTime && 
      slot.endTime === timeSlot.endTime
    );

    if (!matchingSlot) {
      console.log(`🚫 Horario ${timeSlot.startTime}-${timeSlot.endTime} no está configurado para el item ${item.title} el ${dayName}`);
      return {
        itemId,
        date,
        timeSlot,
        isAvailable: false,
        availableSpots: 0,
        totalSpots: 0,
        conflictingReservations: [],
        blockingReason: 'BUSINESS_HOURS'
      };
    }

    // === VALIDACIÓN 3: Capacidad y reservas existentes ===
    const maxCapacity = matchingSlot.maxBookingsPerSlot;
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

    if (!isAvailable) {
      console.log(`🚫 Item ${item.title} está completamente reservado para ${timeSlot.startTime}-${timeSlot.endTime} (${occupiedSpots}/${maxCapacity} ocupados)`);
    } else {
      console.log(`✅ Item ${item.title} disponible: ${availableSpots}/${maxCapacity} spots libres`);
    }

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
  }

  // === FALLBACK: Configuración básica del item ===
  const maxCapacity = item.bookingConfig?.maxCapacity || 10;
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

export const getAvailableSlotsForItem = (
  itemId: string,
  date: string,
  bundleItems?: Item[],
  allShops?: Shop[],
): Array<{ 
  timeSlot: { startTime: string; endTime: string }; 
  availability: ItemAvailability;
}> => {
  // --- LOG DE DEPURACIÓN INICIO ---
  console.groupCollapsed(`[DEBUG] getAvailableSlotsForItem | itemId: ${itemId} | date: ${date}`);
  const dayOfWeek = getDayOfWeek(date); // 0=domingo
  console.log('Fecha:', date, '| dayOfWeek:', dayOfWeek);
  if (!bundleItems) {
    console.warn('bundleItems no provisto');
    console.groupEnd();
    return [];
  }
  const item = bundleItems.find((i) => i.id === itemId);
  if (!item) {
    console.warn('Item no encontrado en bundleItems');
    console.groupEnd();
    return [];
  }
  if (!item.timeSlots || !item.timeSlots.weeklySchedule) {
    console.warn('Item sin timeSlots o weeklySchedule');
    console.groupEnd();
    return [];
  }
  const schedule = item.timeSlots.weeklySchedule[dayOfWeek];
  if (!schedule || !schedule.isAvailable) {
    console.log('No hay disponibilidad para este día en el item');
    console.groupEnd();
    return [];
  }
  const slots = schedule.slots.filter((slot) => slot.isActive);
  console.log('Slots activos encontrados:', slots);
  // Buscar el shop correspondiente
  let shop: Shop | undefined = undefined;
  if (item.shopId && allShops) {
    shop = allShops.find((s) => s.id === item.shopId);
  }
  if (!shop && allShops && bundleItems[0]?.shopId) {
    shop = allShops.find((s) => s.id === bundleItems[0].shopId);
  }
  if (!shop && allShops) {
    shop = allShops[0]; // fallback
  }
  if (!shop) {
    console.warn('No se encontró el shop para el item');
    console.groupEnd();
    return [];
  }
  console.log('Shop encontrado:', shop.id, shop.name);
  // Verificar que el shop esté abierto ese día
  const shopDayName = getDayNameForBusinessHours(date);
  const shopDayConfig = shop.businessHours[shopDayName];
  if (!shopDayConfig || shopDayConfig.openRanges.length === 0) {
    console.log('El shop está cerrado este día');
    console.groupEnd();
    return [];
  }
  console.log('Horarios del shop para el día:', shopDayConfig.openRanges);
  // Filtrar slots que estén dentro del horario del shop
  const validSlots = slots.filter((slot) => {
    return shopDayConfig.openRanges.some((range) =>
      isTimeSlotWithinRange(slot.startTime, slot.endTime, range.from, range.to)
    );
  });
  console.log('Slots válidos dentro del horario del shop:', validSlots);
  // --- LOG DE DEPURACIÓN FIN ---
  console.groupEnd();
  // Mapear a formato esperado
  return validSlots.map((slot) => ({
    timeSlot: { startTime: slot.startTime, endTime: slot.endTime },
    availability: {
      itemId: item.id,
      date,
      timeSlot: { startTime: slot.startTime, endTime: slot.endTime },
      isAvailable: true, // Simplificado para debug
      availableSpots: item.bookingConfig?.maxCapacity || 1,
      totalSpots: item.bookingConfig?.maxCapacity || 1,
      conflictingReservations: []
    }
  }));
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
  const dayName = getDayNameForBusinessHours(date);

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

  const dayName = getDayNameForBusinessHours(date);

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

/**
 * Función de debug para verificar el problema de fechas
 * Esta función nos ayudará a identificar si el problema está en el mapeo de días
 */
export const debugDateMapping = (
  shopId: string,
  date: string,
  allShops: Shop[]
): {
  inputDate: string;
  parsedDate: Date;
  dayOfWeek: number;
  dayName: string;
  shopDayName: keyof BusinessHours;
  isOpen: boolean;
  businessHours: { from: string; to: string }[];
} => {
  const shop = allShops.find(s => s.id === shopId);
  if (!shop) {
    return {
      inputDate: date,
      parsedDate: new Date(date),
      dayOfWeek: -1,
      dayName: 'unknown',
      shopDayName: 'sunday',
      isOpen: false,
      businessHours: []
    };
  }

  // Crear la fecha de manera más explícita para evitar problemas de zona horaria
  const parsedDate = createDateFromString(date);
  
  const dayOfWeek = getDayOfWeek(date);
  const dayName = getDayNameInSpanish(date);
  const shopDayName = getDayNameForBusinessHours(date);
  
  const businessHours = shop.businessHours[shopDayName].openRanges || [];
  const isOpen = businessHours.length > 0;

  return {
    inputDate: date,
    parsedDate,
    dayOfWeek,
    dayName,
    shopDayName,
    isOpen,
    businessHours
  };
};

/**
 * Valida si los horarios de un item siguen siendo válidos después de cambios en los horarios del shop
 * Esta función es útil para detectar items que necesitan actualización después de cambios en el shop
 */
export const validateItemAgainstShopHours = (
  item: Item,
  shop: Shop
): {
  isValid: boolean;
  conflicts: Array<{
    dayOfWeek: number;
    dayName: string;
    itemSlots: Array<{ startTime: string; endTime: string }>;
    shopHours: string;
    reason: 'SHOP_CLOSED' | 'HOURS_OUT_OF_RANGE';
  }>;
  warnings: string[];
} => {
  const conflicts: Array<{
    dayOfWeek: number;
    dayName: string;
    itemSlots: Array<{ startTime: string; endTime: string }>;
    shopHours: string;
    reason: 'SHOP_CLOSED' | 'HOURS_OUT_OF_RANGE';
  }> = [];
  const warnings: string[] = [];

  if (!item.timeSlots?.weeklySchedule) {
    return { isValid: true, conflicts, warnings };
  }

  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const shopDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Verificar cada día de la semana
  Object.entries(item.timeSlots.weeklySchedule).forEach(([dayStr, daySchedule]) => {
    const dayOfWeek = parseInt(dayStr);
    const dayName = dayNames[dayOfWeek];
    const shopDayName = shopDayNames[dayOfWeek] as keyof typeof shop.businessHours;
    const shopDaySchedule = shop.businessHours[shopDayName];

    if ((daySchedule as any).isAvailable && (daySchedule as any).slots.length > 0) {
      // Verificar si el shop está abierto en este día
      if (!shopDaySchedule.openRanges || shopDaySchedule.openRanges.length === 0) {
        conflicts.push({
          dayOfWeek,
          dayName,
          itemSlots: (daySchedule as any).slots.map((slot: any) => ({ startTime: slot.startTime, endTime: slot.endTime })),
          shopHours: 'Cerrado',
          reason: 'SHOP_CLOSED'
        });
        return;
      }

      // Verificar si los horarios del item están dentro del horario del shop
      const shopHours = shopDaySchedule.openRanges.map(r => `${r.from}-${r.to}`).join(', ');
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const conflictingSlots = (daySchedule as any).slots.filter((slot: any) => {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);

        return !shopDaySchedule.openRanges.some(range => {
          const rangeStart = timeToMinutes(range.from);
          const rangeEnd = timeToMinutes(range.to);
          return slotStart >= rangeStart && slotEnd <= rangeEnd;
        });
      });

      if (conflictingSlots.length > 0) {
        conflicts.push({
          dayOfWeek,
          dayName,
          itemSlots: conflictingSlots.map((slot: any) => ({ startTime: slot.startTime, endTime: slot.endTime })),
          shopHours,
          reason: 'HOURS_OUT_OF_RANGE'
        });
      }
    }
  });

  // Generar advertencias
  if (conflicts.length > 0) {
    warnings.push(`El item "${item.title}" tiene ${conflicts.length} conflicto(s) con los horarios actuales del negocio`);
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
    warnings
  };
};

/**
 * Obtiene todos los items que tienen conflictos con los horarios actuales del shop
 * Útil para mostrar al administrador qué items necesitan actualización
 */
export const getItemsWithShopHoursConflicts = (
  shopId: string,
  allItems?: Item[],
  allShops?: Shop[]
): Array<{
  item: Item;
  conflicts: Array<{
    dayOfWeek: number;
    dayName: string;
    itemSlots: Array<{ startTime: string; endTime: string }>;
    shopHours: string;
    reason: 'SHOP_CLOSED' | 'HOURS_OUT_OF_RANGE';
  }>;
}> => {
  const shop = allShops?.find(s => s.id === shopId);
  if (!shop) return [];

  const shopItems = allItems?.filter(item => item.shopId === shopId) || [];
  const itemsWithConflicts: Array<{
    item: Item;
    conflicts: Array<{
      dayOfWeek: number;
      dayName: string;
      itemSlots: Array<{ startTime: string; endTime: string }>;
      shopHours: string;
      reason: 'SHOP_CLOSED' | 'HOURS_OUT_OF_RANGE';
    }>;
  }> = [];

  shopItems.forEach(item => {
    const validation = validateItemAgainstShopHours(item, shop);
    if (!validation.isValid) {
      itemsWithConflicts.push({
        item,
        conflicts: validation.conflicts
      });
    }
  });

  return itemsWithConflicts;
}; 