// Utilidades de validación comunes
// Centraliza todas las validaciones reutilizables del proyecto

import { validateTimeSlot, doTimeSlotsOverlap } from './dateHelpers';
import type { BusinessHours } from '../types';
import type { CreateShopData, CreateBundleData, CreateItemData, CreateExtraData } from '../hooks/types';

// === VALIDACIONES DE FORMULARIOS ===

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export const validateShopForm = (data: Partial<CreateShopData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Validaciones básicas
  if (!data.name?.trim()) {
    errors.name = 'El nombre del negocio es obligatorio';
  }

  if (!data.address?.trim()) {
    errors.address = 'La dirección es obligatoria';
  }

  if (!data.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'El email no tiene un formato válido';
  }

  // Validaciones de horarios
  if (data.businessHours) {
    const businessHoursValidation = validateBusinessHours(data.businessHours);
    Object.assign(errors, businessHoursValidation.errors);
    warnings.push(...businessHoursValidation.warnings);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateBundleForm = (data: Partial<CreateBundleData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!data.name?.trim()) {
    errors.name = 'El nombre del bundle es obligatorio';
  }

  if (!data.description?.trim()) {
    errors.description = 'La descripción es obligatoria';
  }

  if (data.basePrice !== undefined && data.basePrice < 0) {
    errors.basePrice = 'El precio base no puede ser negativo';
  }

  if (data.maxCapacity !== undefined && data.maxCapacity < 1) {
    errors.maxCapacity = 'La capacidad máxima debe ser al menos 1';
  }

  if (data.duration !== undefined && data.duration < 15) {
    errors.duration = 'La duración debe ser al menos 15 minutos';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateItemForm = (data: Partial<CreateItemData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!data.title?.trim()) {
    errors.title = 'El título del item es obligatorio';
  }

  if (!data.description?.trim()) {
    errors.description = 'La descripción es obligatoria';
  }

  if (data.price !== undefined && data.price < 0) {
    errors.price = 'El precio no puede ser negativo';
  }

  if (data.maxCapacity !== undefined && data.maxCapacity < 1) {
    errors.maxCapacity = 'La capacidad debe ser al menos 1';
  }

  if (data.duration !== undefined && data.duration < 15) {
    errors.duration = 'La duración debe ser al menos 15 minutos';
  }

  // Validaciones de horarios
  if (data.timeSlots?.weeklySchedule) {
    const timeSlotsValidation = validateItemTimeSlots(data.timeSlots.weeklySchedule);
    Object.assign(errors, timeSlotsValidation.errors);
    warnings.push(...timeSlotsValidation.warnings);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateExtraForm = (data: Partial<CreateExtraData>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!data.title?.trim()) {
    errors.title = 'El título del extra es obligatorio';
  }

  if (!data.description?.trim()) {
    errors.description = 'La descripción es obligatoria';
  }

  if (data.price !== undefined && data.price < 0) {
    errors.price = 'El precio no puede ser negativo';
  }

  if (data.maxQuantity !== undefined && data.maxQuantity < 1) {
    errors.maxQuantity = 'La cantidad máxima debe ser al menos 1';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// === VALIDACIONES DE HORARIOS ===

export const validateBusinessHours = (businessHours: BusinessHours): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const dayNames: Array<keyof BusinessHours> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  dayNames.forEach((dayName) => {
    const dayRanges = businessHours[dayName].openRanges;
    const dayErrors: string[] = [];

    // Validar cada rango de horario
    dayRanges.forEach((range, rangeIndex) => {
      if (!validateTimeSlot(range.from, range.to)) {
        dayErrors.push(`Rango ${rangeIndex + 1}: Horario inválido`);
      }
    });

    // Verificar superposición de rangos
    for (let i = 0; i < dayRanges.length; i++) {
      for (let j = i + 1; j < dayRanges.length; j++) {
        const range1 = dayRanges[i];
        const range2 = dayRanges[j];
        
        if (doTimeSlotsOverlap(range1.from, range1.to, range2.from, range2.to)) {
          dayErrors.push(`Los rangos ${i + 1} y ${j + 1} se solapan`);
        }
      }
    }

    if (dayErrors.length > 0) {
      errors[dayName] = dayErrors.join(', ');
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateItemTimeSlots = (weeklySchedule: Record<number, any>): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  Object.entries(weeklySchedule).forEach(([dayStr, schedule]) => {
    const dayOfWeek = parseInt(dayStr);
    
    if (schedule.isAvailable && schedule.slots.length > 0) {
      const dayErrors: string[] = [];

      schedule.slots.forEach((slot: any, slotIndex: number) => {
        if (!validateTimeSlot(slot.startTime, slot.endTime)) {
          dayErrors.push(`Slot ${slotIndex + 1}: Horario inválido`);
        }

        if (slot.maxBookingsPerSlot < 1) {
          dayErrors.push(`Slot ${slotIndex + 1}: Capacidad debe ser al menos 1`);
        }
      });

      // Verificar superposición de slots
      for (let i = 0; i < schedule.slots.length; i++) {
        for (let j = i + 1; j < schedule.slots.length; j++) {
          const slot1 = schedule.slots[i];
          const slot2 = schedule.slots[j];
          
          if (doTimeSlotsOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
            dayErrors.push(`Los slots ${i + 1} y ${j + 1} se solapan`);
          }
        }
      }

      if (dayErrors.length > 0) {
        errors[`day_${dayOfWeek}`] = dayErrors.join(', ');
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// === VALIDACIONES DE DATOS ===

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Validación básica de teléfono (permite +, espacios, guiones, paréntesis)
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

export const isValidCapacity = (capacity: number): boolean => {
  return capacity > 0 && Number.isInteger(capacity);
};

export const isValidDuration = (duration: number): boolean => {
  return duration >= 15 && Number.isInteger(duration);
};

// === VALIDACIONES DE RESERVAS ===

export const validateReservationDate = (date: string): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);

  if (reservationDate < today) {
    errors.date = 'No se pueden hacer reservas en fechas pasadas';
  }

  if (reservationDate.getTime() === today.getTime()) {
    warnings.push('Reserva para el día de hoy');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

export const validateReservationTime = (
  date: string,
  startTime: string,
  endTime: string,
  businessHours: BusinessHours
): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!validateTimeSlot(startTime, endTime)) {
    errors.timeSlot = 'El horario seleccionado no es válido';
  }

  // Verificar si está dentro de los horarios del negocio
  const dayOfWeek = new Date(date).getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek] as keyof BusinessHours;
  
  const daySchedule = businessHours[dayName];
  if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
    errors.businessHours = 'El negocio está cerrado en esta fecha';
  } else {
    const isWithinHours = daySchedule.openRanges.some(range => 
      startTime >= range.from && endTime <= range.to
    );
    
    if (!isWithinHours) {
      errors.businessHours = 'El horario está fuera del horario de atención del negocio';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};

// === UTILIDADES DE VALIDACIÓN ===

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\s+/g, '').replace(/[\(\)\-]/g, '');
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `El campo ${fieldName} es obligatorio`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value && value.length < minLength) {
    return `El campo ${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value && value.length > maxLength) {
    return `El campo ${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};

export const validateMinValue = (value: number, minValue: number, fieldName: string): string | null => {
  if (value < minValue) {
    return `El campo ${fieldName} debe ser al menos ${minValue}`;
  }
  return null;
};

export const validateMaxValue = (value: number, maxValue: number, fieldName: string): string | null => {
  if (value > maxValue) {
    return `El campo ${fieldName} no puede ser mayor a ${maxValue}`;
  }
  return null;
}; 