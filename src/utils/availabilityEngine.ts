import { format, parse, isValid, isAfter, isBefore, addDays, startOfDay, addMinutes, differenceInMinutes } from 'date-fns';
import type { 
  BusinessHours, BookingSettings, Booking, Bundle, BundleItem, Resource, ItemTimeSlot,
  AvailabilityCheck, AvailabilityResult, AvailabilityConflict, ResourceAvailabilityInfo,
  BookingItemSelection, BookingResourceAssignment, ItemResourceRequirement, BookingValidationResult
} from '../types';

// ==================== UTILIDADES BÁSICAS ====================

export const parseTime = (timeString: string): Date => {
  return parse(timeString, 'HH:mm', new Date());
};

export const parseDateTime = (dateString: string, timeString: string): Date => {
  return parse(`${dateString} ${timeString}`, 'yyyy-MM-dd HH:mm', new Date());
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const timeDate = parseTime(time);
  const newTime = addMinutes(timeDate, minutes);
  return format(newTime, 'HH:mm');
};

export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeDate = parseTime(time);
  const startDate = parseTime(startTime);
  const endDate = parseTime(endTime);
  
  return !isBefore(timeDate, startDate) && !isAfter(timeDate, endDate);
};

export const isTimeInAnyPeriod = (time: string, periods: { startTime: string; endTime: string }[]): boolean => {
  return periods.some(period => isTimeInRange(time, period.startTime, period.endTime));
};

// ==================== VALIDACIONES DE HORARIOS DE NEGOCIO ====================

export const isShopOpenOnDay = (dayOfWeek: number, businessHours: BusinessHours[]): boolean => {
  const dayHours = businessHours.find(hours => hours.dayOfWeek === dayOfWeek);
  return dayHours ? dayHours.isActive : false;
};

export const getShopHoursForDay = (dayOfWeek: number, businessHours: BusinessHours[]): BusinessHours | null => {
  return businessHours.find(hours => hours.dayOfWeek === dayOfWeek && hours.isActive) || null;
};

export const isTimeWithinBusinessHours = (
  time: string,
  dayOfWeek: number,
  businessHours: BusinessHours[]
): boolean => {
  const dayHours = getShopHoursForDay(dayOfWeek, businessHours);
  if (!dayHours || !dayHours.periods) return false;
  
  return isTimeInAnyPeriod(time, dayHours.periods);
};

// ==================== MOTOR DE DISPONIBILIDAD PRINCIPAL ====================

export const checkItemAvailability = (
  check: AvailabilityCheck,
  bundle: Bundle,
  allBookings: Booking[],
  shopResources: Resource[],
  businessHours: BusinessHours[],
  bookingSettings: BookingSettings
): AvailabilityResult => {
  const { itemId, date, timeSlotId, numberOfPeople } = check;
  
  // Encontrar el item y el time slot
  const item = bundle.items.find(i => i.id === itemId);
  if (!item) {
    return {
      isAvailable: false,
      reason: 'Item no encontrado',
      conflicts: [{
        type: 'TIME_CONFLICT',
        message: 'El item especificado no existe en este bundle'
      }]
    };
  }

  const timeSlot = item.availableTimeSlots.find(slot => slot.id === timeSlotId);
  if (!timeSlot) {
    return {
      isAvailable: false,
      reason: 'Horario no disponible',
      conflicts: [{
        type: 'TIME_CONFLICT',
        message: 'El horario especificado no está disponible para este item'
      }]
    };
  }

  const conflicts: AvailabilityConflict[] = [];
  const resourceAvailability: ResourceAvailabilityInfo[] = [];

  // 1. Validar fecha básica
  const targetDate = new Date(date);
  const now = new Date();
  const dayOfWeek = targetDate.getDay();

  if (!isValid(targetDate)) {
    conflicts.push({
      type: 'TIME_CONFLICT',
      message: 'Fecha inválida'
    });
  }

  if (isBefore(targetDate, startOfDay(now))) {
    conflicts.push({
      type: 'TIME_CONFLICT',
      message: 'No se pueden hacer reservas en fechas pasadas'
    });
  }

  // 2. Validar configuraciones de booking
  if (!bookingSettings.allowSameDayBooking && 
      format(targetDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
    conflicts.push({
      type: 'TIME_CONFLICT',
      message: 'No se permiten reservas el mismo día'
    });
  }

  // 3. Validar horarios de negocio
  if (!isShopOpenOnDay(dayOfWeek, businessHours)) {
    conflicts.push({
      type: 'BUSINESS_HOURS',
      message: 'El negocio está cerrado ese día'
    });
  }

  if (!isTimeWithinBusinessHours(timeSlot.startTime, dayOfWeek, businessHours)) {
    conflicts.push({
      type: 'BUSINESS_HOURS',
      message: `El horario ${timeSlot.startTime} está fuera del horario de atención`
    });
  }

  // 4. Validar días de la semana permitidos para el item
  if (!timeSlot.daysOfWeek.includes(dayOfWeek)) {
    conflicts.push({
      type: 'TIME_CONFLICT',
      message: 'Este item no está disponible en el día seleccionado'
    });
  }

  // 5. Validar capacidad del item
  if (numberOfPeople > item.maxCapacity) {
    conflicts.push({
      type: 'CAPACITY_EXCEEDED',
      itemId: item.id,
      message: `Capacidad máxima del item: ${item.maxCapacity} personas`
    });
  }

  // 6. Validar capacidad del time slot
  const existingBookingsForSlot = getBookingsForTimeSlot(allBookings, itemId, date, timeSlotId);
  if (existingBookingsForSlot.length >= timeSlot.maxBookings) {
    conflicts.push({
      type: 'CAPACITY_EXCEEDED',
      itemId: item.id,
      message: `Horario completo. Máximo ${timeSlot.maxBookings} reservas por slot`
    });
  }

  // 7. Validar tiempo mínimo de anticipación
  if (timeSlot.minimumAdvanceHours) {
    const bookingDateTime = parseDateTime(date, timeSlot.startTime);
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < timeSlot.minimumAdvanceHours) {
      conflicts.push({
        type: 'TIME_CONFLICT',
        message: `Se requiere un mínimo de ${timeSlot.minimumAdvanceHours} horas de anticipación`
      });
    }
  }

  // 8. Validar disponibilidad de recursos
  const resourceConflicts = checkResourceAvailability(
    item,
    timeSlot,
    date,
    allBookings,
    shopResources
  );
  
  conflicts.push(...resourceConflicts.conflicts);
  resourceAvailability.push(...resourceConflicts.resourceInfo);

  // 9. Buscar alternativas si hay conflictos
  let alternativeItems: string[] = [];
  let nextAvailableSlot: string | undefined;

  if (conflicts.length > 0) {
    alternativeItems = findAlternativeItems(bundle, date, numberOfPeople, allBookings, businessHours);
    nextAvailableSlot = findNextAvailableSlot(item, date, allBookings, shopResources, businessHours);
  }

  // Calcular capacidad restante
  const remainingCapacity = Math.max(0, timeSlot.maxBookings - existingBookingsForSlot.length);

  return {
    isAvailable: conflicts.length === 0,
    reason: conflicts.length > 0 ? conflicts[0].message : undefined,
    conflicts: conflicts.length > 0 ? conflicts : undefined,
    remainingCapacity,
    nextAvailableSlot,
    alternativeItems: alternativeItems.length > 0 ? alternativeItems : undefined,
    resourceAvailability
  };
};

// ==================== GESTIÓN DE RECURSOS ====================

interface ResourceConflictResult {
  conflicts: AvailabilityConflict[];
  resourceInfo: ResourceAvailabilityInfo[];
}

export const checkResourceAvailability = (
  item: BundleItem,
  timeSlot: ItemTimeSlot,
  date: string,
  allBookings: Booking[],
  shopResources: Resource[]
): ResourceConflictResult => {
  const conflicts: AvailabilityConflict[] = [];
  const resourceInfo: ResourceAvailabilityInfo[] = [];

  for (const requirement of item.requiredResources) {
    const resource = shopResources.find(r => r.id === requirement.resourceId);
    
    if (!resource) {
      conflicts.push({
        type: 'RESOURCE_UNAVAILABLE',
        resourceId: requirement.resourceId,
        message: `Recurso requerido no encontrado: ${requirement.resourceId}`
      });
      continue;
    }

    if (!resource.isActive) {
      conflicts.push({
        type: 'RESOURCE_UNAVAILABLE',
        resourceId: resource.id,
        message: `Recurso no disponible: ${resource.name}`
      });
      continue;
    }

    // Calcular tiempo efectivo con setup y cleanup
    const effectiveStartTime = addMinutesToTime(
      timeSlot.startTime,
      -(requirement.setupTimeMinutes || 0)
    );
    const effectiveEndTime = addMinutesToTime(
      timeSlot.endTime,
      requirement.cleanupTimeMinutes || 0
    );

    // Verificar conflictos con otras reservas
    const resourceConflicts = getResourceConflicts(
      resource.id,
      date,
      effectiveStartTime,
      effectiveEndTime,
      allBookings
    );

    const totalUsedCapacity = resourceConflicts.length;
    const availableCapacity = Math.max(0, resource.maxConcurrentUse - totalUsedCapacity);

    if (requirement.quantityNeeded > availableCapacity) {
      // Verificar recursos alternativos
      const alternativeAvailable = requirement.alternativeResourceIds?.some(altId => {
        const altResource = shopResources.find(r => r.id === altId);
        if (!altResource || !altResource.isActive) return false;
        
        const altConflicts = getResourceConflicts(altId, date, effectiveStartTime, effectiveEndTime, allBookings);
        const altAvailable = altResource.maxConcurrentUse - altConflicts.length;
        return requirement.quantityNeeded <= altAvailable;
      });

      if (!alternativeAvailable && !requirement.isOptional) {
        conflicts.push({
          type: 'RESOURCE_UNAVAILABLE',
          resourceId: resource.id,
          message: `${resource.name} no disponible en el horario solicitado`
        });
      }
    }

    // Información de disponibilidad del recurso
    resourceInfo.push({
      resourceId: resource.id,
      resourceName: resource.name,
      totalCapacity: resource.maxConcurrentUse,
      usedCapacity: totalUsedCapacity,
      availableCapacity,
      nextAvailableTime: availableCapacity === 0 ? findNextAvailableTimeForResource(
        resource.id,
        date,
        effectiveEndTime,
        allBookings
      ) : undefined
    });
  }

  return { conflicts, resourceInfo };
};

export const getResourceConflicts = (
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string,
  allBookings: Booking[]
): BookingResourceAssignment[] => {
  const conflicts: BookingResourceAssignment[] = [];

  for (const booking of allBookings) {
    if (booking.date !== date || booking.status === 'CANCELLED') continue;

    for (const item of booking.selectedItems) {
      for (const assignment of item.assignedResources) {
        if (assignment.resourceId === resourceId) {
          // Verificar solapamiento de tiempo
          if (isTimeOverlapping(
            startTime, endTime,
            assignment.effectiveStartTime, assignment.effectiveEndTime
          )) {
            conflicts.push(assignment);
          }
        }
      }
    }
  }

  return conflicts;
};

const isTimeOverlapping = (
  start1: string, end1: string,
  start2: string, end2: string
): boolean => {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);

  return (isBefore(s1, e2) || s1.getTime() === e2.getTime()) && 
         (isAfter(e1, s2) || e1.getTime() === s2.getTime());
};

// ==================== FUNCIONES DE BÚSQUEDA Y ALTERNATIVAS ====================

export const getBookingsForTimeSlot = (
  allBookings: Booking[],
  itemId: string,
  date: string,
  timeSlotId: string
): Booking[] => {
  return allBookings.filter(booking => 
    booking.date === date &&
    booking.status !== 'CANCELLED' &&
    booking.selectedItems.some(item => 
      item.itemId === itemId && item.selectedTimeSlotId === timeSlotId
    )
  );
};

export const findAlternativeItems = (
  bundle: Bundle,
  date: string,
  numberOfPeople: number,
  allBookings: Booking[],
  businessHours: BusinessHours[]
): string[] => {
  const alternatives: string[] = [];
  
  for (const item of bundle.items) {
    if (item.maxCapacity >= numberOfPeople && item.isActive) {
      // Verificar si tiene slots disponibles en la fecha
      const hasAvailableSlots = item.availableTimeSlots.some(slot => {
        const dayOfWeek = new Date(date).getDay();
        return slot.daysOfWeek.includes(dayOfWeek) &&
               slot.isActive &&
               isTimeWithinBusinessHours(slot.startTime, dayOfWeek, businessHours);
      });
      
      if (hasAvailableSlots) {
        alternatives.push(item.id);
      }
    }
  }
  
  return alternatives;
};

export const findNextAvailableSlot = (
  item: BundleItem,
  fromDate: string,
  allBookings: Booking[],
  shopResources: Resource[],
  businessHours: BusinessHours[]
): string | undefined => {
  const startDate = new Date(fromDate);
  
  // Buscar en los próximos 30 días
  for (let i = 0; i < 30; i++) {
    const checkDate = addDays(startDate, i);
    const dateString = format(checkDate, 'yyyy-MM-dd');
    const dayOfWeek = checkDate.getDay();
    
    if (!isShopOpenOnDay(dayOfWeek, businessHours)) continue;
    
    for (const slot of item.availableTimeSlots) {
      if (!slot.isActive || !slot.daysOfWeek.includes(dayOfWeek)) continue;
      
      if (!isTimeWithinBusinessHours(slot.startTime, dayOfWeek, businessHours)) continue;
      
      // Verificar disponibilidad básica
      const existingBookings = getBookingsForTimeSlot(allBookings, item.id, dateString, slot.id);
      if (existingBookings.length >= slot.maxBookings) continue;
      
      // Verificar recursos
      const resourceCheck = checkResourceAvailability(item, slot, dateString, allBookings, shopResources);
      if (resourceCheck.conflicts.length === 0) {
        return `${dateString} ${slot.startTime}`;
      }
    }
  }
  
  return undefined;
};

const findNextAvailableTimeForResource = (
  resourceId: string,
  date: string,
  afterTime: string,
  allBookings: Booking[]
): string | undefined => {
  // Buscar próxima disponibilidad después de afterTime
  const conflicts = getResourceConflicts(resourceId, date, afterTime, '23:59', allBookings);
  
  if (conflicts.length === 0) {
    return afterTime;
  }
  
  // Encontrar el próximo hueco
  conflicts.sort((a, b) => parseTime(a.effectiveEndTime).getTime() - parseTime(b.effectiveEndTime).getTime());
  
  return conflicts[0]?.effectiveEndTime;
};

// ==================== VALIDACIONES DE DEPENDENCIAS ====================

export const validateItemDependencies = (
  selectedItems: { itemId: string; timeSlotId: string; date: string }[],
  bundle: Bundle
): AvailabilityConflict[] => {
  const conflicts: AvailabilityConflict[] = [];
  
  for (const selection of selectedItems) {
    const item = bundle.items.find(i => i.id === selection.itemId);
    if (!item?.dependencies) continue;
    
    const timeSlot = item.availableTimeSlots.find(s => s.id === selection.timeSlotId);
    if (!timeSlot) continue;
    
    for (const dependency of item.dependencies) {
      const dependentSelection = selectedItems.find(s => s.itemId === dependency.dependsOnItemId);
      
      if (!dependentSelection && dependency.type !== 'CONCURRENT_ONLY') {
        conflicts.push({
          type: 'DEPENDENCY_UNMET',
          itemId: item.id,
          message: `${item.name} requiere que primero se seleccione otro item`
        });
        continue;
      }
      
      if (!dependentSelection) continue;
      
      const dependentItem = bundle.items.find(i => i.id === dependency.dependsOnItemId);
      const dependentTimeSlot = dependentItem?.availableTimeSlots.find(s => s.id === dependentSelection.timeSlotId);
      
      if (!dependentTimeSlot) continue;
      
      // Validar timing según el tipo de dependencia
      switch (dependency.type) {
        case 'MUST_COMPLETE_BEFORE':
          const minStartTime = addMinutesToTime(
            dependentTimeSlot.endTime,
            dependency.timingOffsetMinutes || 0
          );
          if (parseTime(timeSlot.startTime) < parseTime(minStartTime)) {
            conflicts.push({
              type: 'DEPENDENCY_UNMET',
              itemId: item.id,
              message: `${item.name} debe comenzar después de que termine ${dependentItem?.name}`
            });
          }
          break;
          
        case 'MUST_START_AFTER':
          const earliestStart = addMinutesToTime(
            dependentTimeSlot.startTime,
            dependency.timingOffsetMinutes || 0
          );
          if (parseTime(timeSlot.startTime) < parseTime(earliestStart)) {
            conflicts.push({
              type: 'DEPENDENCY_UNMET',
              itemId: item.id,
              message: `${item.name} debe comenzar después de que inicie ${dependentItem?.name}`
            });
          }
          break;
          
        case 'CONCURRENT_ONLY':
          if (selection.date !== dependentSelection.date) {
            conflicts.push({
              type: 'DEPENDENCY_UNMET',
              itemId: item.id,
              message: `${item.name} debe realizarse el mismo día que ${dependentItem?.name}`
            });
          }
          break;
      }
    }
  }
  
  return conflicts;
};

// ==================== UTILIDADES DE VALIDACIÓN COMPLETA ====================

export const validateCompleteBooking = (
  bundleId: string,
  selectedItems: { itemId: string; timeSlotId: string; numberOfPeople: number; date: string }[],
  bundles: Bundle[],
  allBookings: Booking[],
  shopResources: Resource[],
  businessHours: BusinessHours[],
  bookingSettings: BookingSettings
): BookingValidationResult => {
  const bundle = bundles.find(b => b.id === bundleId);
  if (!bundle) {
    return {
      isValid: false,
      conflicts: [{ type: 'TIME_CONFLICT', message: 'Bundle no encontrado' }],
      totalPrice: 0,
      timeline: { earliest: '', latest: '' }
    };
  }

  const allConflicts: AvailabilityConflict[] = [];
  let totalPrice = 0;
  let earliestTime = '23:59';
  let latestTime = '00:00';

  // 1. Validar selección mínima/máxima de items
  if (selectedItems.length < bundle.minItemsRequired) {
    allConflicts.push({
      type: 'DEPENDENCY_UNMET',
      message: `Se requiere seleccionar al menos ${bundle.minItemsRequired} items`
    });
  }

  if (selectedItems.length > bundle.maxItemsAllowed) {
    allConflicts.push({
      type: 'CAPACITY_EXCEEDED',
      message: `No se pueden seleccionar más de ${bundle.maxItemsAllowed} items`
    });
  }

  // 2. Validar cada item individual
  for (const selection of selectedItems) {
    const check: AvailabilityCheck = {
      itemId: selection.itemId,
      date: selection.date,
      timeSlotId: selection.timeSlotId,
      numberOfPeople: selection.numberOfPeople
    };

    const result = checkItemAvailability(
      check,
      bundle,
      allBookings,
      shopResources,
      businessHours,
      bookingSettings
    );

    if (!result.isAvailable && result.conflicts) {
      allConflicts.push(...result.conflicts);
    }

    // Calcular precio y timeline
    const item = bundle.items.find(i => i.id === selection.itemId);
    const timeSlot = item?.availableTimeSlots.find(s => s.id === selection.timeSlotId);
    
    if (item && timeSlot) {
      const itemPrice = item.price * selection.numberOfPeople;
      const priceWithMultiplier = itemPrice * (timeSlot.priceMultiplier || 1);
      totalPrice += priceWithMultiplier;

      if (timeSlot.startTime < earliestTime) earliestTime = timeSlot.startTime;
      if (timeSlot.endTime > latestTime) latestTime = timeSlot.endTime;
    }
  }

  // 3. Validar dependencias entre items
  const dependencyConflicts = validateItemDependencies(selectedItems, bundle);
  allConflicts.push(...dependencyConflicts);

  // 4. Aplicar descuento de bundle si corresponde
  const discountApplied = bundle.bundleDiscount && selectedItems.length > 1 ? bundle.bundleDiscount : undefined;
  if (discountApplied) {
    totalPrice = totalPrice * (1 - discountApplied);
  }

  return {
    isValid: allConflicts.length === 0,
    conflicts: allConflicts,
    totalPrice,
    discountApplied,
    timeline: { earliest: earliestTime, latest: latestTime }
  };
};

// ==================== API PARA COMPONENTES ====================

export const getAvailableSlotsForItem = (
  itemId: string,
  date: string,
  bundle: Bundle,
  allBookings: Booking[],
  shopResources: Resource[],
  businessHours: BusinessHours[],
  bookingSettings: BookingSettings
): { slot: ItemTimeSlot; isAvailable: boolean; conflicts?: AvailabilityConflict[] }[] => {
  const item = bundle.items.find(i => i.id === itemId);
  if (!item) return [];

  const dayOfWeek = new Date(date).getDay();
  
  return item.availableTimeSlots
    .filter(slot => slot.isActive && slot.daysOfWeek.includes(dayOfWeek))
    .map(slot => {
      const check: AvailabilityCheck = {
        itemId,
        date,
        timeSlotId: slot.id,
        numberOfPeople: 1 // Verificación básica
      };

      const result = checkItemAvailability(
        check,
        bundle,
        allBookings,
        shopResources,
        businessHours,
        bookingSettings
      );

      return {
        slot,
        isAvailable: result.isAvailable,
        conflicts: result.conflicts
      };
    })
    .sort((a, b) => parseTime(a.slot.startTime).getTime() - parseTime(b.slot.startTime).getTime());
};

export const getResourceUtilization = (
  shopId: string,
  date: string,
  resources: Resource[],
  allBookings: Booking[]
): { resourceId: string; name: string; utilization: number; conflicts: number }[] => {
  return resources
    .filter(r => r.shopId === shopId && r.isActive)
    .map(resource => {
      const conflicts = getResourceConflicts(resource.id, date, '00:00', '23:59', allBookings);
      const utilization = conflicts.length / resource.maxConcurrentUse;
      
      return {
        resourceId: resource.id,
        name: resource.name,
        utilization: Math.min(1, utilization),
        conflicts: conflicts.length
      };
    });
}; 