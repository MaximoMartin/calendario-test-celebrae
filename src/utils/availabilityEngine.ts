// ========================================
// MOTOR DE DISPONIBILIDAD Y VALIDACIONES
// ========================================

import { addMinutes, format, isAfter, isBefore, parseISO, startOfDay, differenceInMinutes, differenceInDays } from 'date-fns';
import type {
  Bundle, BundleItem, ShopResource, Booking, ItemBooking, ResourceAllocation,
  AvailabilityRequest, AvailabilityResult, AvailabilityConflict, AvailabilityAlternative,
  PriceBreakdown, Shop, BusinessHours, ShopException, ItemTimeSlot
} from '../types/newModel';

// ========================================
// MOTOR PRINCIPAL DE DISPONIBILIDAD
// ========================================

export class AvailabilityEngine {
  private shop: Shop;
  private bundles: Bundle[];
  private existingBookings: Booking[];

  constructor(shop: Shop, bundles: Bundle[], existingBookings: Booking[]) {
    this.shop = shop;
    this.bundles = bundles;
    this.existingBookings = existingBookings;
  }

  /**
   * Verifica la disponibilidad completa de una solicitud de reserva
   */
  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResult> {
    const conflicts: AvailabilityConflict[] = [];
    const priceBreakdown: PriceBreakdown[] = [];

    try {
      // 1. Validar bundle existe y está activo
      const bundle = this.bundles.find(b => b.id === request.bundleId);
      if (!bundle || !bundle.isActive) {
        conflicts.push({
          type: 'BUSINESS_HOURS',
          message: 'El bundle solicitado no está disponible',
          affectedItems: [],
          severity: 'ERROR'
        });
        return { isAvailable: false, conflicts, pricing: { totalPrice: 0, breakdown: [] } };
      }

      // 2. Validaciones básicas de fecha y horarios de negocio
      const basicValidation = this.validateBasicConstraints(request, bundle);
      conflicts.push(...basicValidation);

      // 3. Validar disponibilidad de cada item
      for (const itemSelection of request.itemSelections) {
        const itemConflicts = await this.checkItemAvailability(
          bundle, 
          itemSelection, 
          request.date
        );
        conflicts.push(...itemConflicts);

        // Calcular precio del item
        const item = bundle.items.find(i => i.id === itemSelection.itemId);
        if (item) {
          priceBreakdown.push({
            type: 'ITEM',
            itemId: item.id,
            name: item.name,
            unitPrice: item.price,
            quantity: itemSelection.numberOfPeople,
            totalPrice: item.price * itemSelection.numberOfPeople
          });
        }
      }

      // 4. Validar extras
      for (const extraSelection of request.extraSelections) {
        const extraConflicts = this.checkExtraAvailability(bundle, extraSelection);
        conflicts.push(...extraConflicts);

        // Calcular precio del extra
        const extra = bundle.extras.find(e => e.id === extraSelection.extraId);
        if (extra) {
          priceBreakdown.push({
            type: 'EXTRA',
            itemId: extra.id,
            name: extra.name,
            unitPrice: extra.price,
            quantity: extraSelection.quantity,
            totalPrice: extra.price * extraSelection.quantity
          });
        }
      }

      // 5. Verificar conflictos de recursos entre items
      const resourceConflicts = await this.checkResourceConflicts(
        bundle, 
        request.itemSelections, 
        request.date
      );
      conflicts.push(...resourceConflicts);

      // 6. Verificar excepciones del shop
      const exceptionConflicts = this.checkShopExceptions(request.date);
      conflicts.push(...exceptionConflicts);

      // 7. Calcular precio total
      const totalPrice = priceBreakdown.reduce((sum, item) => sum + item.totalPrice, 0);

      // 8. Generar alternativas si hay conflictos
      const alternatives = conflicts.length > 0 ? 
        await this.generateAlternatives(request, bundle) : undefined;

      const hasErrors = conflicts.some(c => c.severity === 'ERROR');

      return {
        isAvailable: !hasErrors,
        conflicts,
        suggestedAlternatives: alternatives,
        pricing: {
          totalPrice,
          breakdown: priceBreakdown
        }
      };

    } catch (error) {
      conflicts.push({
        type: 'BUSINESS_HOURS',
        message: `Error interno del sistema: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedItems: [],
        severity: 'ERROR'
      });

      return {
        isAvailable: false,
        conflicts,
        pricing: { totalPrice: 0, breakdown: [] }
      };
    }
  }

  // ========================================
  // VALIDACIONES BÁSICAS
  // ========================================

  private validateBasicConstraints(request: AvailabilityRequest, bundle: Bundle): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];
    const requestDate = parseISO(request.date);
    const now = new Date();

    // Validar fecha no sea en el pasado
    if (isBefore(requestDate, startOfDay(now))) {
      conflicts.push({
        type: 'ADVANCE_BOOKING',
        message: 'No se pueden hacer reservas para fechas pasadas',
        affectedItems: [],
        severity: 'ERROR'
      });
    }

    // Validar anticipación mínima
    const hoursUntilBooking = differenceInMinutes(requestDate, now) / 60;
    if (hoursUntilBooking < this.shop.bookingSettings.hoursBeforeBooking) {
      conflicts.push({
        type: 'ADVANCE_BOOKING',
        message: `Se requieren al menos ${this.shop.bookingSettings.hoursBeforeBooking} horas de anticipación`,
        affectedItems: [],
        severity: 'ERROR'
      });
    }

    // Validar no exceder días máximos de anticipación
    const daysUntilBooking = differenceInDays(requestDate, now);
    if (daysUntilBooking > this.shop.bookingSettings.maxAdvanceBookingDays) {
      conflicts.push({
        type: 'ADVANCE_BOOKING',
        message: `No se pueden hacer reservas con más de ${this.shop.bookingSettings.maxAdvanceBookingDays} días de anticipación`,
        affectedItems: [],
        severity: 'ERROR'
      });
    }

    // Validar horarios de negocio
    const dayOfWeek = requestDate.getDay();
    const businessHour = this.shop.businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    
    if (!businessHour || !businessHour.isActive) {
      conflicts.push({
        type: 'BUSINESS_HOURS',
        message: 'El negocio está cerrado en la fecha seleccionada',
        affectedItems: [],
        severity: 'ERROR'
      });
    }

    return conflicts;
  }

  // ========================================
  // VALIDACIÓN DE ITEMS
  // ========================================

  private async checkItemAvailability(
    bundle: Bundle, 
    itemSelection: { itemId: string; timeSlotId: string; numberOfPeople: number },
    date: string
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];
    
    const item = bundle.items.find(i => i.id === itemSelection.itemId);
    if (!item) {
      conflicts.push({
        type: 'BUSINESS_HOURS',
        message: `Item ${itemSelection.itemId} no encontrado`,
        affectedItems: [itemSelection.itemId],
        severity: 'ERROR'
      });
      return conflicts;
    }

    const timeSlot = item.timeSlots.find(ts => ts.id === itemSelection.timeSlotId);
    if (!timeSlot || !timeSlot.isActive) {
      conflicts.push({
        type: 'TIME_CONFLICT',
        message: `Horario no disponible para ${item.name}`,
        affectedItems: [item.id],
        severity: 'ERROR'
      });
      return conflicts;
    }

    // Validar capacidad del item
    if (itemSelection.numberOfPeople > item.maxCapacity) {
      conflicts.push({
        type: 'CAPACITY_EXCEEDED',
        message: `${item.name} tiene capacidad máxima de ${item.maxCapacity} personas`,
        affectedItems: [item.id],
        severity: 'ERROR'
      });
    }

    // Validar día de la semana del slot
    const requestDate = parseISO(date);
    const dayOfWeek = requestDate.getDay();
    if (!timeSlot.daysOfWeek.includes(dayOfWeek)) {
      conflicts.push({
        type: 'TIME_CONFLICT',
        message: `${item.name} no está disponible los ${this.getDayName(dayOfWeek)}`,
        affectedItems: [item.id],
        severity: 'ERROR'
      });
    }

    // Validar reservas existentes en el mismo slot
    const existingItemBookings = this.getExistingItemBookings(item.id, timeSlot.id, date);
    const totalExistingPeople = existingItemBookings.reduce((sum, booking) => 
      sum + booking.numberOfPeople, 0
    );
    
    if (existingItemBookings.length >= timeSlot.maxBookings) {
      conflicts.push({
        type: 'CAPACITY_EXCEEDED',
        message: `Horario completo para ${item.name}`,
        affectedItems: [item.id],
        severity: 'ERROR'
      });
    }

    // Validar capacidad total considerando reservas existentes
    if (totalExistingPeople + itemSelection.numberOfPeople > item.maxCapacity) {
      conflicts.push({
        type: 'CAPACITY_EXCEEDED',
        message: `No hay suficiente capacidad disponible en ${item.name}`,
        affectedItems: [item.id],
        severity: 'WARNING'
      });
    }

    // Validar recursos requeridos para este item
    const resourceConflicts = await this.checkItemResourceAvailability(
      item, 
      timeSlot, 
      itemSelection.numberOfPeople, 
      date
    );
    conflicts.push(...resourceConflicts);

    return conflicts;
  }

  // ========================================
  // VALIDACIÓN DE RECURSOS
  // ========================================

  private async checkItemResourceAvailability(
    item: BundleItem,
    timeSlot: ItemTimeSlot,
    numberOfPeople: number,
    date: string
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];

    for (const resourceReq of item.requiredResources) {
      const resource = this.shop.resources.find(r => r.id === resourceReq.resourceId);
      if (!resource || !resource.isActive) {
        conflicts.push({
          type: 'RESOURCE_CONFLICT',
          message: `Recurso ${resourceReq.resourceId} no disponible`,
          affectedItems: [item.id],
          affectedResources: [resourceReq.resourceId],
          severity: 'ERROR'
        });
        continue;
      }

      // Calcular tiempos reales de uso del recurso
      const itemStartTime = parseISO(`${date}T${timeSlot.startTime}:00`);
      const resourceStartTime = addMinutes(itemStartTime, resourceReq.usageTime.offsetStart);
      const resourceEndTime = addMinutes(resourceStartTime, resourceReq.usageTime.duration);

      // Verificar si el recurso está disponible en ese horario
      const resourceConflicts = this.checkResourceTimeConflicts(
        resource,
        resourceStartTime,
        resourceEndTime,
        resourceReq.quantity,
        date
      );

      conflicts.push(...resourceConflicts.map(conflict => ({
        ...conflict,
        affectedItems: [item.id]
      })));

      // Validar capacidad del recurso
      if (resourceReq.quantity > resource.capacity) {
        conflicts.push({
          type: 'RESOURCE_CONFLICT',
          message: `${resource.name} tiene capacidad máxima de ${resource.capacity}`,
          affectedItems: [item.id],
          affectedResources: [resource.id],
          severity: 'ERROR'
        });
      }

      // Validar restricciones específicas del recurso
      if (resource.constraints) {
        const constraintConflicts = this.validateResourceConstraints(
          resource,
          resourceStartTime,
          resourceEndTime,
          item
        );
        conflicts.push(...constraintConflicts.map(conflict => ({
          ...conflict,
          affectedItems: [item.id]
        })));
      }
    }

    return conflicts;
  }

  private checkResourceTimeConflicts(
    resource: ShopResource,
    startTime: Date,
    endTime: Date,
    requiredQuantity: number,
    date: string
  ): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];

    // Buscar todas las asignaciones de recursos existentes para esta fecha
    const existingAllocations = this.getExistingResourceAllocations(resource.id, date);

    for (const allocation of existingAllocations) {
      const allocStartTime = parseISO(`${date}T${allocation.startTime}:00`);
      const allocEndTime = parseISO(`${date}T${allocation.endTime}:00`);

      // Verificar solapamiento temporal
      const hasTimeOverlap = isBefore(startTime, allocEndTime) && isAfter(endTime, allocStartTime);

      if (hasTimeOverlap) {
        // Verificar si hay suficiente capacidad
        const usedCapacity = existingAllocations
          .filter(a => {
            const aStart = parseISO(`${date}T${a.startTime}:00`);
            const aEnd = parseISO(`${date}T${a.endTime}:00`);
            return isBefore(aStart, allocEndTime) && isAfter(aEnd, allocStartTime);
          })
          .reduce((sum, a) => sum + a.quantity, 0);

        if (usedCapacity + requiredQuantity > resource.capacity) {
          conflicts.push({
            type: 'RESOURCE_CONFLICT',
            message: `${resource.name} no tiene suficiente capacidad disponible (${resource.capacity - usedCapacity} disponible, ${requiredQuantity} requerido)`,
            affectedItems: [],
            affectedResources: [resource.id],
            severity: 'ERROR'
          });
        }
      }
    }

    return conflicts;
  }

  private validateResourceConstraints(
    resource: ShopResource,
    startTime: Date,
    endTime: Date,
    item: BundleItem
  ): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];
    const constraints = resource.constraints!;

    // Validar anticipación mínima
    if (constraints.minAdvanceBooking) {
      const now = new Date();
      const minutesUntilStart = differenceInMinutes(startTime, now);
      
      if (minutesUntilStart < constraints.minAdvanceBooking) {
        conflicts.push({
          type: 'ADVANCE_BOOKING',
          message: `${resource.name} requiere ${constraints.minAdvanceBooking} minutos de anticipación`,
          affectedItems: [],
          affectedResources: [resource.id],
          severity: 'ERROR'
        });
      }
    }

    // Validar tiempo máximo de uso
    if (constraints.maxUsageTime) {
      const usageDuration = differenceInMinutes(endTime, startTime);
      
      if (usageDuration > constraints.maxUsageTime) {
        conflicts.push({
          type: 'RESOURCE_CONFLICT',
          message: `${resource.name} tiene un tiempo máximo de uso de ${constraints.maxUsageTime} minutos`,
          affectedItems: [],
          affectedResources: [resource.id],
          severity: 'ERROR'
        });
      }
    }

    return conflicts;
  }

  // ========================================
  // VALIDACIÓN DE EXTRAS
  // ========================================

  private checkExtraAvailability(
    bundle: Bundle,
    extraSelection: { extraId: string; quantity: number }
  ): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];
    
    const extra = bundle.extras.find(e => e.id === extraSelection.extraId);
    if (!extra || !extra.isActive) {
      conflicts.push({
        type: 'BUSINESS_HOURS',
        message: `Extra ${extraSelection.extraId} no disponible`,
        affectedItems: [],
        severity: 'ERROR'
      });
      return conflicts;
    }

    // Validar cantidad máxima
    if (extraSelection.quantity > extra.maxQuantity) {
      conflicts.push({
        type: 'CAPACITY_EXCEEDED',
        message: `${extra.name} tiene cantidad máxima de ${extra.maxQuantity}`,
        affectedItems: [],
        severity: 'ERROR'
      });
    }

    return conflicts;
  }

  // ========================================
  // VALIDACIÓN DE CONFLICTOS ENTRE ITEMS
  // ========================================

  private async checkResourceConflicts(
    bundle: Bundle,
    itemSelections: { itemId: string; timeSlotId: string; numberOfPeople: number }[],
    date: string
  ): Promise<AvailabilityConflict[]> {
    const conflicts: AvailabilityConflict[] = [];
    const resourceUsage = new Map<string, Array<{
      resourceId: string;
      startTime: Date;
      endTime: Date;
      quantity: number;
      itemId: string;
    }>>();

    // Recopilar uso de recursos para todos los items seleccionados
    for (const itemSelection of itemSelections) {
      const item = bundle.items.find(i => i.id === itemSelection.itemId);
      const timeSlot = item?.timeSlots.find(ts => ts.id === itemSelection.timeSlotId);
      
      if (!item || !timeSlot) continue;

      const itemStartTime = parseISO(`${date}T${timeSlot.startTime}:00`);

      for (const resourceReq of item.requiredResources) {
        const resourceStartTime = addMinutes(itemStartTime, resourceReq.usageTime.offsetStart);
        const resourceEndTime = addMinutes(resourceStartTime, resourceReq.usageTime.duration);

        if (!resourceUsage.has(resourceReq.resourceId)) {
          resourceUsage.set(resourceReq.resourceId, []);
        }

        resourceUsage.get(resourceReq.resourceId)!.push({
          resourceId: resourceReq.resourceId,
          startTime: resourceStartTime,
          endTime: resourceEndTime,
          quantity: resourceReq.quantity,
          itemId: item.id
        });
      }
    }

    // Verificar conflictos entre items del mismo bundle
    for (const [resourceId, usages] of resourceUsage) {
      const resource = this.shop.resources.find(r => r.id === resourceId);
      if (!resource) continue;

      // Ordenar por tiempo de inicio
      usages.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      for (let i = 0; i < usages.length - 1; i++) {
        for (let j = i + 1; j < usages.length; j++) {
          const usage1 = usages[i];
          const usage2 = usages[j];

          // Verificar solapamiento temporal
          const hasOverlap = isBefore(usage1.startTime, usage2.endTime) && 
                           isAfter(usage1.endTime, usage2.startTime);

          if (hasOverlap) {
            // Verificar si excede la capacidad
            if (usage1.quantity + usage2.quantity > resource.capacity) {
              conflicts.push({
                type: 'RESOURCE_CONFLICT',
                message: `Conflicto de recursos: ${resource.name} no puede atender ambos items simultáneamente`,
                affectedItems: [usage1.itemId, usage2.itemId],
                affectedResources: [resourceId],
                severity: 'ERROR'
              });
            }
          }

          // Verificar tiempo de limpieza/preparación
          if (resource.constraints?.cleaningTime) {
            const timeBetween = differenceInMinutes(usage2.startTime, usage1.endTime);
            if (timeBetween < resource.constraints.cleaningTime && timeBetween >= 0) {
              conflicts.push({
                type: 'RESOURCE_CONFLICT',
                message: `${resource.name} necesita ${resource.constraints.cleaningTime} minutos entre usos`,
                affectedItems: [usage1.itemId, usage2.itemId],
                affectedResources: [resourceId],
                severity: 'ERROR'
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  // ========================================
  // VALIDACIÓN DE EXCEPCIONES
  // ========================================

  private checkShopExceptions(date: string): AvailabilityConflict[] {
    const conflicts: AvailabilityConflict[] = [];
    
    const dateExceptions = this.shop.exceptions.filter(ex => 
      ex.date === date && ex.isActive
    );

    for (const exception of dateExceptions) {
      if (exception.type === 'CLOSED') {
        conflicts.push({
          type: 'SHOP_EXCEPTION',
          message: `El negocio está cerrado: ${exception.title}`,
          affectedItems: [],
          severity: 'ERROR'
        });
      }
    }

    return conflicts;
  }

  // ========================================
  // GENERACIÓN DE ALTERNATIVAS
  // ========================================

  private async generateAlternatives(
    request: AvailabilityRequest,
    bundle: Bundle
  ): Promise<AvailabilityAlternative[]> {
    const alternatives: AvailabilityAlternative[] = [];
    
    // Buscar fechas alternativas (siguiente semana)
    const requestDate = parseISO(request.date);
    
    for (let daysOffset = 1; daysOffset <= 7; daysOffset++) {
      const alternativeDate = addMinutes(requestDate, daysOffset * 24 * 60);
      const alternateDateStr = format(alternativeDate, 'yyyy-MM-dd');
      
      const alternativeRequest: AvailabilityRequest = {
        ...request,
        date: alternateDateStr
      };
      
      const result = await this.checkAvailability(alternativeRequest);
      
      if (result.isAvailable) {
        alternatives.push({
          date: alternateDateStr,
          itemSlots: request.itemSelections.map(sel => {
            const item = bundle.items.find(i => i.id === sel.itemId);
            const timeSlot = item?.timeSlots.find(ts => ts.id === sel.timeSlotId);
            return {
              itemId: sel.itemId,
              timeSlotId: sel.timeSlotId,
              startTime: timeSlot?.startTime || '',
              endTime: timeSlot?.endTime || ''
            };
          }),
          totalPrice: result.pricing.totalPrice,
          confidence: 1 - (daysOffset / 7) // Preferir fechas más cercanas
        });
      }
      
      if (alternatives.length >= 3) break; // Máximo 3 alternativas
    }

    return alternatives;
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private getExistingItemBookings(itemId: string, timeSlotId: string, date: string): ItemBooking[] {
    return this.existingBookings
      .filter(booking => booking.date === date && booking.status !== 'CANCELLED')
      .flatMap(booking => booking.itemBookings)
      .filter(itemBooking => 
        itemBooking.itemId === itemId && 
        itemBooking.timeSlotId === timeSlotId &&
        itemBooking.status !== 'CANCELLED'
      );
  }

  private getExistingResourceAllocations(resourceId: string, date: string): ResourceAllocation[] {
    return this.existingBookings
      .filter(booking => booking.date === date && booking.status !== 'CANCELLED')
      .flatMap(booking => booking.itemBookings)
      .filter(itemBooking => itemBooking.status !== 'CANCELLED')
      .flatMap(itemBooking => itemBooking.resourceAllocations)
      .filter(allocation => allocation.resourceId === resourceId);
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
    return days[dayOfWeek];
  }
} 