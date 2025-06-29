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

 