// ========================================
// UTILIDADES DE VALIDACIÓN DE RESERVAS
// ========================================

import { parseISO, format, isValid, addDays, startOfDay, endOfDay } from 'date-fns';
import type {
  Bundle, BundleItem, Shop, Booking, BookingFormData,
  AvailabilityRequest, ShopException
} from '../types/newModel';

// ========================================
// VALIDACIONES DE FORMULARIO
// ========================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validar datos del formulario de reserva
 */
export const validateBookingForm = (
  formData: BookingFormData,
  bundle: Bundle,
  shop: Shop
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar datos del cliente
  if (!formData.customerName.trim()) {
    errors.push({
      field: 'customerName',
      message: 'El nombre del cliente es obligatorio',
      severity: 'error'
    });
  }

  if (!formData.customerEmail.trim()) {
    errors.push({
      field: 'customerEmail',
      message: 'El email del cliente es obligatorio',
      severity: 'error'
    });
  } else if (!isValidEmail(formData.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'El formato del email no es válido',
      severity: 'error'
    });
  }

  if (!formData.customerPhone.trim()) {
    errors.push({
      field: 'customerPhone',
      message: 'El teléfono del cliente es obligatorio',
      severity: 'error'
    });
  }

  // Validar fecha
  if (!formData.date) {
    errors.push({
      field: 'date',
      message: 'La fecha es obligatoria',
      severity: 'error'
    });
  } else {
    const dateValidation = validateBookingDate(formData.date, shop);
    errors.push(...dateValidation);
  }

  // Validar selecciones de items
  if (!formData.itemSelections || formData.itemSelections.length === 0) {
    errors.push({
      field: 'itemSelections',
      message: 'Debe seleccionar al menos un item',
      severity: 'error'
    });
  } else {
    const itemsValidation = validateItemSelections(formData.itemSelections, bundle);
    errors.push(...itemsValidation);
  }

  // Validar extras
  if (formData.extraSelections) {
    const extrasValidation = validateExtraSelections(formData.extraSelections, bundle);
    errors.push(...extrasValidation);
  }

  return errors;
};

/**
 * Validar fecha de reserva
 */
const validateBookingDate = (date: string, shop: Shop): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!isValid(parseISO(date))) {
    errors.push({
      field: 'date',
      message: 'Formato de fecha inválido',
      severity: 'error'
    });
    return errors;
  }

  const bookingDate = parseISO(date);
  const now = new Date();
  const today = startOfDay(now);

  // Validar no sea fecha pasada
  if (bookingDate < today) {
    errors.push({
      field: 'date',
      message: 'No se pueden hacer reservas para fechas pasadas',
      severity: 'error'
    });
  }

  // Validar límites de anticipación
  const maxAdvanceDate = addDays(today, shop.bookingSettings.maxAdvanceBookingDays);
  if (bookingDate > maxAdvanceDate) {
    errors.push({
      field: 'date',
      message: `No se pueden hacer reservas con más de ${shop.bookingSettings.maxAdvanceBookingDays} días de anticipación`,
      severity: 'error'
    });
  }

  // Validar horarios de negocio
  const dayOfWeek = bookingDate.getDay();
  const businessHour = shop.businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
  
  if (!businessHour || !businessHour.isActive) {
    errors.push({
      field: 'date',
      message: 'El negocio está cerrado en la fecha seleccionada',
      severity: 'error'
    });
  }

  return errors;
};

/**
 * Validar selecciones de items
 */
const validateItemSelections = (
  itemSelections: BookingFormData['itemSelections'],
  bundle: Bundle
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const selection of itemSelections) {
    const item = bundle.items.find(i => i.id === selection.itemId);
    
    if (!item) {
      errors.push({
        field: 'itemSelections',
        message: `Item ${selection.itemId} no encontrado`,
        severity: 'error'
      });
      continue;
    }

    // Validar timeSlot existe
    const timeSlot = item.timeSlots.find(ts => ts.id === selection.timeSlotId);
    if (!timeSlot) {
      errors.push({
        field: 'itemSelections',
        message: `Horario no válido para ${item.name}`,
        severity: 'error'
      });
      continue;
    }

    // Validar número de personas
    if (selection.numberOfPeople < 1) {
      errors.push({
        field: 'itemSelections',
        message: 'El número de personas debe ser mayor a 0',
        severity: 'error'
      });
    }

    if (selection.numberOfPeople > item.maxCapacity) {
      errors.push({
        field: 'itemSelections',
        message: `${item.name} tiene capacidad máxima de ${item.maxCapacity} personas`,
        severity: 'error'
      });
    }
  }

  // Validar items requeridos
  const requiredItems = bundle.items.filter(i => i.isRequired);
  const selectedItemIds = itemSelections.map(s => s.itemId);
  
  for (const requiredItem of requiredItems) {
    if (!selectedItemIds.includes(requiredItem.id)) {
      errors.push({
        field: 'itemSelections',
        message: `${requiredItem.name} es obligatorio`,
        severity: 'error'
      });
    }
  }

  return errors;
};

/**
 * Validar selecciones de extras
 */
const validateExtraSelections = (
  extraSelections: BookingFormData['extraSelections'],
  bundle: Bundle
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const selection of extraSelections) {
    const extra = bundle.extras.find(e => e.id === selection.extraId);
    
    if (!extra) {
      errors.push({
        field: 'extraSelections',
        message: `Extra ${selection.extraId} no encontrado`,
        severity: 'error'
      });
      continue;
    }

    if (selection.quantity < 0) {
      errors.push({
        field: 'extraSelections',
        message: 'La cantidad no puede ser negativa',
        severity: 'error'
      });
    }

    if (selection.quantity > extra.maxQuantity) {
      errors.push({
        field: 'extraSelections',
        message: `${extra.name} tiene cantidad máxima de ${extra.maxQuantity}`,
        severity: 'error'
      });
    }
  }

  return errors;
};

// ========================================
// UTILIDADES DE CONVERSIÓN
// ========================================

/**
 * Convertir BookingFormData a AvailabilityRequest
 */
export const formDataToAvailabilityRequest = (formData: BookingFormData): AvailabilityRequest => {
  return {
    bundleId: formData.bundleId,
    date: formData.date,
    itemSelections: formData.itemSelections,
    extraSelections: formData.extraSelections
  };
};

/**
 * Obtener nombre del día de la semana
 */
export const getDayName = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dateObj.getDay()];
};

/**
 * Formatear fecha para mostrar
 */
export const formatDisplayDate = (date: string): string => {
  const dateObj = parseISO(date);
  return format(dateObj, "dd 'de' MMMM, yyyy");
};

/**
 * Formatear rango de tiempo
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

// ========================================
// VALIDACIONES DE NEGOCIO
// ========================================

/**
 * Verificar si una fecha tiene excepciones
 */
export const checkDateExceptions = (date: string, exceptions: ShopException[]): ShopException[] => {
  return exceptions.filter(ex => ex.date === date && ex.isActive);
};

/**
 * Verificar si el negocio está abierto en una fecha/hora específica
 */
export const isShopOpenAt = (
  date: string,
  time: string,
  businessHours: Shop['businessHours']
): boolean => {
  const dateObj = parseISO(date);
  const dayOfWeek = dateObj.getDay();
  
  const businessHour = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
  if (!businessHour || !businessHour.isActive) {
    return false;
  }

  // Verificar si el tiempo está dentro de algún período
  return businessHour.periods.some(period => 
    time >= period.startTime && time <= period.endTime
  );
};

/**
 * Calcular tiempo total de una experiencia
 */
export const calculateBundleDuration = (bundle: Bundle): number => {
  if (bundle.items.length === 0) return 0;
  
  // Suma todas las duraciones de items requeridos
  return bundle.items
    .filter(item => item.isRequired)
    .reduce((total, item) => total + item.duration, 0);
};

/**
 * Obtener horario más temprano y más tardío de un bundle
 */
export const getBundleTimeRange = (bundle: Bundle): { earliest: string; latest: string } | null => {
  const allSlots = bundle.items.flatMap(item => item.timeSlots);
  
  if (allSlots.length === 0) return null;

  const startTimes = allSlots.map(slot => slot.startTime).sort();
  const endTimes = allSlots.map(slot => slot.endTime).sort();

  return {
    earliest: startTimes[0],
    latest: endTimes[endTimes.length - 1]
  };
};

// ========================================
// UTILIDADES AUXILIARES
// ========================================

/**
 * Validar formato de email
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generar ID único para reservas
 */
export const generateBookingId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `booking_${timestamp}_${random}`;
};

/**
 * Verificar si dos rangos de tiempo se solapan
 */
export const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  return start1 < end2 && end1 > start2;
};

/**
 * Calcular precio total de una selección
 */
export const calculateTotalPrice = (
  itemSelections: BookingFormData['itemSelections'],
  extraSelections: BookingFormData['extraSelections'],
  bundle: Bundle
): number => {
  let total = 0;

  // Sumar precios de items
  for (const selection of itemSelections) {
    const item = bundle.items.find(i => i.id === selection.itemId);
    if (item) {
      total += item.price * selection.numberOfPeople;
    }
  }

  // Sumar precios de extras
  for (const selection of extraSelections) {
    const extra = bundle.extras.find(e => e.id === selection.extraId);
    if (extra) {
      total += extra.price * selection.quantity;
    }
  }

  return total;
}; 