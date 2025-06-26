// 🎯 CHECKPOINT 2: TIPOS ESPECÍFICOS DEL SISTEMA DE RESERVAS
// Tipos auxiliares y constantes para el manejo de reservas de items

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'EXPIRED';

export type CreatedBy = 'SELLER' | 'BUYER' | 'SYSTEM';

export type BlockingReason = 'FULLY_BOOKED' | 'BUSINESS_HOURS' | 'ADVANCE_BOOKING' | 'EXCEPTION' | 'ITEM_INACTIVE';

// Constantes para el sistema de reservas
export const RESERVATION_CONFIG = {
  TEMPORARY_RESERVATION_MINUTES: 15, // tiempo para completar una reserva temporal
  DEFAULT_BUFFER_MINUTES: 15, // buffer por defecto entre reservas
  MIN_PEOPLE_DEFAULT: 1,
  MAX_ADVANCE_BOOKING_DAYS: 90, // máximo días de anticipación por defecto
  MIN_ADVANCE_BOOKING_HOURS: 2, // mínimo horas de anticipación
} as const;

// Mapeo de estados para display
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No se presentó',
  EXPIRED: 'Expirada'
} as const;

// Colores para estados de reserva
export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  NO_SHOW: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  EXPIRED: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' }
} as const;

// Configuración de slots de tiempo estándar
export const STANDARD_TIME_SLOTS = [
  { start: '09:00', end: '10:30' },
  { start: '10:30', end: '12:00' },
  { start: '12:00', end: '13:30' },
  { start: '14:00', end: '15:30' },
  { start: '15:30', end: '17:00' },
  { start: '17:00', end: '18:30' },
  { start: '19:00', end: '20:30' },
  { start: '20:30', end: '22:00' }
] as const; 