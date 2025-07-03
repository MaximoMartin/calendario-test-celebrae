/**
 * Formatea una fecha a formato YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

export const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getDayOfWeekName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek];
};

export const generateTimeOptions = (startHour: number = 6, endHour: number = 23, step: number = 30): string[] => {
  const options: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += step) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

/**
 * Función robusta para crear fechas sin problemas de zona horaria
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Date object
 */
export const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
};

/**
 * Función robusta para obtener el día de la semana de una fecha
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Número del día de la semana (0 = domingo, 1 = lunes, etc.)
 */
export const getDayOfWeek = (dateString: string): number => {
  const date = createDateFromString(dateString);
  return date.getDay();
};

/**
 * Función para obtener el nombre del día de la semana en inglés para mapear con BusinessHours
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Nombre del día en inglés (sunday, monday, etc.)
 */
export const getDayNameForBusinessHours = (dateString: string): keyof import('../types').BusinessHours => {
  const date = createDateFromString(dateString);
  const dayOfWeek = date.getDay();
  const days: Array<keyof import('../types').BusinessHours> = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  return days[dayOfWeek];
};

/**
 * Función para obtener el nombre del día de la semana en español
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Nombre del día en español
 */
export const getDayNameInSpanish = (dateString: string): string => {
  const date = createDateFromString(dateString);
  const dayOfWeek = date.getDay();
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[dayOfWeek];
};

/**
 * Función para validar un rango de tiempo
 * @param startTime - Hora de inicio en formato HH:MM
 * @param endTime - Hora de finalización en formato HH:MM
 * @returns true si el rango es válido, false en caso contrario
 */
export const validateTimeSlot = (startTime: string, endTime: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false;
  }
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return startMinutes < endMinutes;
};

/**
 * Función para verificar si un rango de tiempo está dentro de otro rango de tiempo
 * @param slotStart - Hora de inicio del rango de tiempo
 * @param slotEnd - Hora de finalización del rango de tiempo
 * @param rangeStart - Hora de inicio del rango de tiempo
 * @param rangeEnd - Hora de finalización del rango de tiempo
 * @returns true si el rango de tiempo está dentro del rango de tiempo, false en caso contrario
 */
export const isTimeSlotWithinRange = (
  slotStart: string, 
  slotEnd: string, 
  rangeStart: string, 
  rangeEnd: string
): boolean => {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const rangeStartMinutes = timeToMinutes(rangeStart);
  const rangeEndMinutes = timeToMinutes(rangeEnd);
  
  return slotStartMinutes >= rangeStartMinutes && slotEndMinutes <= rangeEndMinutes;
};

/**
 * Función para verificar si dos rangos de tiempo se superponen
 * @param slot1Start - Hora de inicio del primer rango de tiempo
 * @param slot1End - Hora de finalización del primer rango de tiempo
 * @param slot2Start - Hora de inicio del segundo rango de tiempo
 * @param slot2End - Hora de finalización del segundo rango de tiempo
 * @returns true si los rangos de tiempo se superponen, false en caso contrario
 */
export const doTimeSlotsOverlap = (
  slot1Start: string,
  slot1End: string,
  slot2Start: string,
  slot2End: string
): boolean => {
  const slot1StartMinutes = timeToMinutes(slot1Start);
  const slot1EndMinutes = timeToMinutes(slot1End);
  const slot2StartMinutes = timeToMinutes(slot2Start);
  const slot2EndMinutes = timeToMinutes(slot2End);
  
  return slot1StartMinutes < slot2EndMinutes && slot1EndMinutes > slot2StartMinutes;
};

/**
 * Función para formatear una fecha para mostrarla al usuario
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada para mostrar al usuario
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = createDateFromString(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Función para formatear una hora para mostrarla al usuario
 * @param timeString - Hora en formato HH:MM
 * @returns Hora formateada para mostrar al usuario
 */
export const formatTimeForDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Función para formatear una fecha y hora para mostrarla al usuario
 * @param dateTimeString - Fecha y hora en formato YYYY-MM-DDTHH:MM
 * @returns Fecha y hora formateadas para mostrar al usuario
 */
export const formatDateTimeForDisplay = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Función para sumar días a una fecha
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param days - Número de días a sumar
 * @returns Fecha resultante después de sumar los días
 */
export const addDays = (dateString: string, days: number): string => {
  const date = createDateFromString(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * Función para verificar si una fecha es futura
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es futura, false en caso contrario
 */
export const isDateInFuture = (dateString: string): boolean => {
  const date = createDateFromString(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Función para verificar si una fecha es de hoy
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es de hoy, false en caso contrario
 */
export const isDateToday = (dateString: string): boolean => {
  const date = createDateFromString(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Función para obtener la diferencia en días entre dos fechas
 * @param date1String - Fecha en formato YYYY-MM-DD
 * @param date2String - Fecha en formato YYYY-MM-DD
 * @returns Diferencia en días entre las dos fechas
 */
export const getDaysDifference = (date1String: string, date2String: string): number => {
  const date1 = createDateFromString(date1String);
  const date2 = createDateFromString(date2String);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Constantes útiles para el manejo de días de la semana
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

export const DAY_NAMES_EN: Array<keyof import('../types').BusinessHours> = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

/**
 * Función para verificar si una tienda está abierta en un día específico
 * @param businessHours - Horarios de la tienda
 * @param dayOfWeek - Número del día de la semana (0 = domingo, 1 = lunes, etc.)
 * @returns true si la tienda está abierta en el día, false en caso contrario
 */
export const isShopOpenOnDay = (
  businessHours: import('../types').BusinessHours,
  dayOfWeek: number
): boolean => {
  const dayName = DAY_NAMES_EN[dayOfWeek];
  const daySchedule = businessHours[dayName];
  return daySchedule.openRanges && daySchedule.openRanges.length > 0;
};

/**
 * Función para obtener los horarios de la tienda para un día específico
 * @param businessHours - Horarios de la tienda
 * @param dayOfWeek - Número del día de la semana (0 = domingo, 1 = lunes, etc.)
 * @returns Horarios de la tienda para el día
 */
export const getShopHoursForDay = (
  businessHours: import('../types').BusinessHours,
  dayOfWeek: number
): string => {
  const dayName = DAY_NAMES_EN[dayOfWeek];
  const daySchedule = businessHours[dayName];
  
  if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
    return 'Cerrado';
  }
  
  return daySchedule.openRanges
    .map(range => `${range.from} - ${range.to}`)
    .join(', ');
};

/**
 * Función para verificar si un rango de tiempo está dentro de los horarios de la tienda
 * @param businessHours - Horarios de la tienda
 * @param dayOfWeek - Número del día de la semana (0 = domingo, 1 = lunes, etc.)
 * @param startTime - Hora de inicio del rango de tiempo
 * @param endTime - Hora de finalización del rango de tiempo
 * @returns true si el rango de tiempo está dentro de los horarios de la tienda, false en caso contrario
 */
export const isTimeSlotWithinShopHours = (
  businessHours: import('../types').BusinessHours,
  dayOfWeek: number,
  startTime: string,
  endTime: string
): boolean => {
  const dayName = DAY_NAMES_EN[dayOfWeek];
  const daySchedule = businessHours[dayName];
  
  if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
    return false;
  }
  
  return daySchedule.openRanges.some(range => 
    isTimeSlotWithinRange(startTime, endTime, range.from, range.to)
  );
}; 