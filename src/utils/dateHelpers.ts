import { format, parse, isValid, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import type { BusinessHours, BookingSettings, TimeSlot, Booking } from '../types';

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const parseTime = (timeString: string): Date => {
  return parse(timeString, 'HH:mm', new Date());
};

export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeDate = parseTime(time);
  const startDate = parseTime(startTime);
  const endDate = parseTime(endTime);
  
  return !isBefore(timeDate, startDate) && !isAfter(timeDate, endDate);
};

export const isShopOpenOnDay = (dayOfWeek: number, businessHours: BusinessHours[]): boolean => {
  const dayHours = businessHours.find(hours => hours.dayOfWeek === dayOfWeek);
  return dayHours ? dayHours.isActive : false;
};

export const getShopHoursForDay = (dayOfWeek: number, businessHours: BusinessHours[]): BusinessHours | null => {
  return businessHours.find(hours => hours.dayOfWeek === dayOfWeek && hours.isActive) || null;
};

export const isTimeInAnyPeriod = (time: string, periods: { startTime: string; endTime: string }[]): boolean => {
  return periods.some(period => isTimeInRange(time, period.startTime, period.endTime));
};

export const isBookingAllowed = (
  bookingDate: string,
  bookingTime: string,
  bookingSettings: BookingSettings,
  businessHours: BusinessHours[]
): { isAllowed: boolean; reason?: string } => {
  const targetDate = new Date(bookingDate);
  const now = new Date();
  const dayOfWeek = targetDate.getDay();

  // Check if it's a valid date
  if (!isValid(targetDate)) {
    return { isAllowed: false, reason: 'Fecha inválida' };
  }

  // Check if booking is in the past
  if (isBefore(targetDate, startOfDay(now))) {
    return { isAllowed: false, reason: 'No se pueden hacer reservas en fechas pasadas' };
  }

  // Check if same day booking is allowed
  if (!bookingSettings.allowSameDayBooking && 
      format(targetDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
    return { isAllowed: false, reason: 'No se permiten reservas el mismo día' };
  }

  // Check minimum hours before booking
  const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilBooking < bookingSettings.hoursBeforeBooking) {
    return { 
      isAllowed: false, 
      reason: `Se requiere un mínimo de ${bookingSettings.hoursBeforeBooking} horas de anticipación` 
    };
  }

  // Check maximum advance booking days
  const maxAdvanceDate = addDays(now, bookingSettings.maxAdvanceBookingDays);
  if (isAfter(targetDate, maxAdvanceDate)) {
    return { 
      isAllowed: false, 
      reason: `No se pueden hacer reservas con más de ${bookingSettings.maxAdvanceBookingDays} días de anticipación` 
    };
  }

  // Check if shop is open on that day
  if (!isShopOpenOnDay(dayOfWeek, businessHours)) {
    return { isAllowed: false, reason: 'El negocio está cerrado ese día' };
  }

  // Check if time is within business hours
  const dayHours = getShopHoursForDay(dayOfWeek, businessHours);
  if (dayHours && dayHours.periods && !isTimeInAnyPeriod(bookingTime, dayHours.periods)) {
    const periodsStr = dayHours.periods
      .map(p => `${p.startTime}-${p.endTime}`)
      .join(', ');
    return { 
      isAllowed: false, 
      reason: `El horario debe estar en los períodos: ${periodsStr}` 
    };
  }

  return { isAllowed: true };
};

export const getAvailableTimeSlots = (
  date: string,
  kitId: string,
  timeSlots: TimeSlot[],
  existingBookings: Booking[]
): TimeSlot[] => {
  const kitSlots = timeSlots.filter(slot => slot.kitId === kitId && slot.isActive);
  
  return kitSlots.filter(slot => {
    const slotBookings = existingBookings.filter(
      booking => 
        booking.date === date && 
        booking.timeSlot === slot.startTime && 
        booking.kitId === kitId &&
        booking.status !== 'CANCELLED'
    );
    
    return slotBookings.length < slot.maxBookings;
  });
};

export const getBookingConflicts = (
  date: string,
  timeSlot: string,
  kitId: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): number => {
  return existingBookings.filter(
    booking => 
      booking.date === date && 
      booking.timeSlot === timeSlot && 
      booking.kitId === kitId &&
      booking.status !== 'CANCELLED' &&
      booking.id !== excludeBookingId
  ).length;
};

export const getDayOfWeekName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek] || '';
};

export const generateTimeOptions = (startHour: number = 6, endHour: number = 23, step: number = 30): string[] => {
  const times: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += step) {
      if (hour === endHour && minute > 0) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  
  return times;
}; 