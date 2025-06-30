// Interfaces para creación de entidades
// Extraídas de useEntitiesState.tsx para mejor organización

import type { BusinessHours } from '../types';

export interface CreateShopData {
  name: string;
  address: string;
  description?: string;
  phone: string;
  email: string;
  category?: string;
  subCategory?: string;
  businessHours?: BusinessHours;
  maxCapacity?: number;
  advanceBookingDays?: number;
  cancellationPolicy?: string;
  refundPolicy?: string;
  allowInstantBooking?: boolean;
  requiresApproval?: boolean;
}

export interface CreateBundleData {
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  maxCapacity: number;
  duration: number;
  allowInstantBooking: boolean;
  requiresApproval: boolean;
  cancellationPolicy: string;
  refundPolicy: string;
  tags: string[];
  isFeatured?: boolean;
  order?: number;
  imageUrls?: string[];
}

export interface CreateItemData {
  title: string;
  description: string;
  price: number;
  isPerGroup: boolean;
  maxCapacity: number;
  duration: number;
  isForAdult?: boolean;
  isRequired?: boolean;
  order?: number;
  
  // Configuración avanzada de reservas
  requiresConfirmation?: boolean;
  advanceBookingDays?: number;
  groupCapacity?: number;
  isExclusive?: boolean;
  
  // Configuración de horarios flexible
  timeSlots?: {
    scheduleType: 'FIXED' | 'FLEXIBLE' | 'CUSTOM' | 'CONTINUOUS';
    
    // Horarios fijos por día de la semana
    weeklySchedule?: {
      [dayOfWeek: number]: {
        isAvailable: boolean;
        slots: Array<{
          startTime: string;
          endTime: string;
          maxBookingsPerSlot: number;
          minPeoplePerBooking?: number;
          maxPeoplePerBooking?: number;
          bufferMinutes?: number;
          isActive: boolean;
        }>;
      };
    };
    
    // Horarios especiales para fechas específicas
    specialDates?: {
      [date: string]: {
        isAvailable: boolean;
        slots: Array<{
          startTime: string;
          endTime: string;
          maxBookingsPerSlot: number;
          minPeoplePerBooking?: number;
          maxPeoplePerBooking?: number;
          bufferMinutes?: number;
          isActive: boolean;
        }>;
        reason?: string;
      };
    };
    
    // Configuración para horarios flexibles
    flexibleConfig?: {
      startHour: number;
      endHour: number;
      slotDuration: number;
      intervalMinutes: number;
      maxBookingsPerSlot: number;
      minPeoplePerBooking?: number;
      maxPeoplePerBooking?: number;
      bufferMinutes?: number;
    };
    
    // Configuración para horarios continuos
    continuousConfig?: {
      slotDuration: number;
      intervalMinutes: number;
      maxBookingsPerSlot: number;
      minPeoplePerBooking?: number;
      maxPeoplePerBooking?: number;
      bufferMinutes?: number;
    };
    
    // Excepciones
    exceptions?: Array<{
      id: string;
      type: 'CLOSED' | 'MODIFIED_HOURS' | 'SPECIAL_EVENT';
      date: string;
      endDate?: string;
      reason: string;
      slots?: Array<{
        startTime: string;
        endTime: string;
        maxBookingsPerSlot: number;
        minPeoplePerBooking?: number;
        maxPeoplePerBooking?: number;
        bufferMinutes?: number;
        isActive: boolean;
      }>;
    }>;
    
    // Configuración de anticipación y límites
    bookingLimits?: {
      minAdvanceHours: number;
      maxAdvanceDays: number;
      sameDayBooking: boolean;
      lastMinuteBooking: boolean;
    };
  };
}

export interface CreateExtraData {
  title: string;
  description: string;
  price: number;
  isPerGroup: boolean;
  isForAdult?: boolean;
  maxQuantity?: number;
  isRequired?: boolean;
  requiredItemId?: string;
  order?: number;
  
  // Configuración de cantidad
  defaultQuantity?: number;
  
  // Configuración de disponibilidad
  isActive?: boolean;
} 