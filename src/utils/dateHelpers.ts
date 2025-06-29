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
      options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
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
  const dayOfWeek = getDayOfWeek(dateString);
  const dayNames: Array<keyof import('../types').BusinessHours> = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  return dayNames[dayOfWeek];
};

/**
 * Función para obtener el nombre del día de la semana en español
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Nombre del día en español
 */
export const getDayNameInSpanish = (dateString: string): string => {
  const dayOfWeek = getDayOfWeek(dateString);
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return dayNames[dayOfWeek];
}; 