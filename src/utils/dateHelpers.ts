import { format } from 'date-fns';

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const parseTime = (timeString: string): Date => {
  return new Date(`1970-01-01T${timeString}:00`);
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
  return days[dayOfWeek] || 'Día inválido';
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