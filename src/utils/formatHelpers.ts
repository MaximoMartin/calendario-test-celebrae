// Utilidades de formateo de datos comunes
// Centraliza todas las funciones de formateo reutilizables del proyecto

import { formatDateForDisplay } from './dateHelpers';
import type { Shop, Bundle, Item, Extra, ReservaItem, ReservaBundle } from '../types';

// === FORMATEO DE PRECIOS ===

export const formatPrice = (price: number, currency: string = '€'): string => {
  return `${currency}${price.toFixed(2)}`;
};

export const formatPriceRange = (minPrice: number, maxPrice: number, currency: string = '€'): string => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }
  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
};

export const formatPriceWithDiscount = (
  originalPrice: number, 
  discountedPrice: number, 
  currency: string = '€'
): {
  original: string;
  discounted: string;
  discount: string;
  discountPercentage: string;
} => {
  const discount = originalPrice - discountedPrice;
  const discountPercentage = Math.round((discount / originalPrice) * 100);
  
  return {
    original: formatPrice(originalPrice, currency),
    discounted: formatPrice(discountedPrice, currency),
    discount: formatPrice(discount, currency),
    discountPercentage: `${discountPercentage}%`
  };
};

// === FORMATEO DE CAPACIDAD Y DURACIÓN ===

export const formatCapacity = (capacity: number): string => {
  if (capacity === 1) {
    return '1 persona';
  }
  return `${capacity} personas`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDurationRange = (minMinutes: number, maxMinutes: number): string => {
  if (minMinutes === maxMinutes) {
    return formatDuration(minMinutes);
  }
  return `${formatDuration(minMinutes)} - ${formatDuration(maxMinutes)}`;
};

// === FORMATEO DE ESTADOS ===

export const formatReservationStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmada',
    'CANCELLED': 'Cancelada',
    'COMPLETED': 'Completada',
    'NO_SHOW': 'No se presentó',
    'EXPIRED': 'Expirada',
    'MODIFIED': 'Modificada',
    'RESCHEDULED': 'Reprogramada',
    'PARTIAL_REFUND': 'Reembolso parcial'
  };
  
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'PENDING': 'text-yellow-600 bg-yellow-50',
    'CONFIRMED': 'text-green-600 bg-green-50',
    'CANCELLED': 'text-red-600 bg-red-50',
    'COMPLETED': 'text-blue-600 bg-blue-50',
    'NO_SHOW': 'text-gray-600 bg-gray-50',
    'EXPIRED': 'text-orange-600 bg-orange-50',
    'MODIFIED': 'text-purple-600 bg-purple-50',
    'RESCHEDULED': 'text-indigo-600 bg-indigo-50',
    'PARTIAL_REFUND': 'text-pink-600 bg-pink-50'
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-50';
};

export const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    'PENDING': '⏳',
    'CONFIRMED': '✅',
    'CANCELLED': '❌',
    'COMPLETED': '🎉',
    'NO_SHOW': '👤',
    'EXPIRED': '⏰',
    'MODIFIED': '✏️',
    'RESCHEDULED': '📅',
    'PARTIAL_REFUND': '💰'
  };
  
  return iconMap[status] || '❓';
};

// === FORMATEO DE ENTIDADES ===

export const formatShopInfo = (shop: Shop): string => {
  const parts = [shop.name];
  
  if (shop.address) {
    parts.push(shop.address);
  }
  
  if (shop.phone) {
    parts.push(shop.phone);
  }
  
  return parts.join(' • ');
};

export const formatBundleInfo = (bundle: Bundle): string => {
  const parts = [
    bundle.name,
    formatPrice(bundle.basePrice),
    formatCapacity(bundle.maxCapacity),
    formatDuration(bundle.duration)
  ];
  
  return parts.join(' • ');
};

export const formatItemInfo = (item: Item): string => {
  const parts = [
    item.title,
    formatPrice(item.price),
    formatCapacity(item.bookingConfig?.maxCapacity || 1),
    formatDuration(item.bookingConfig?.duration || 60)
  ];
  
  return parts.join(' • ');
};

export const formatExtraInfo = (extra: Extra): string => {
  const parts = [
    extra.title,
    formatPrice(extra.price)
  ];
  
  if (extra.maxQuantity) {
    parts.push(`Máx: ${extra.maxQuantity}`);
  }
  
  return parts.join(' • ');
};

// === FORMATEO DE RESERVAS ===

export const formatReservationInfo = (reservation: ReservaItem): string => {
  const parts = [
    formatDateForDisplay(reservation.date),
    `${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`,
    formatCapacity(reservation.numberOfPeople)
  ];
  
  if (reservation.customerInfo?.name) {
    parts.unshift(reservation.customerInfo.name);
  }
  
  return parts.join(' • ');
};

export const formatBundleReservationInfo = (reservation: ReservaBundle): string => {
  const parts = [
    formatDateForDisplay(reservation.createdAt),
    formatCapacity(reservation.reservasItems.reduce((sum, item) => sum + item.numberOfPeople, 0)),
    formatPrice(reservation.totalPrice)
  ];
  
  if (reservation.customerInfo?.name) {
    parts.unshift(reservation.customerInfo.name);
  }
  
  return parts.join(' • ');
};

// === FORMATEO DE HORARIOS ===

export const formatBusinessHours = (businessHours: any): string => {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const formattedDays: string[] = [];
  
  Object.entries(businessHours).forEach(([dayName, schedule]: [string, any]) => {
    if (schedule.openRanges && schedule.openRanges.length > 0) {
      const ranges = schedule.openRanges
        .map((range: any) => `${range.from}-${range.to}`)
        .join(', ');
      formattedDays.push(`${dayNames[Object.keys(businessHours).indexOf(dayName)]}: ${ranges}`);
    }
  });
  
  return formattedDays.join(' | ');
};

export const formatTimeSlot = (timeSlot: { startTime: string; endTime: string }): string => {
  return `${timeSlot.startTime} - ${timeSlot.endTime}`;
};

// === FORMATEO DE TEXTO ===

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone: string): string => {
  // Eliminar todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según la longitud
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 10) {
    return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Devolver original si no coincide con formatos conocidos
};

export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// === FORMATEO DE LISTAS ===

export const formatList = (items: string[], separator: string = ', '): string => {
  if (items.length === 0) {
    return '';
  }
  
  if (items.length === 1) {
    return items[0];
  }
  
  if (items.length === 2) {
    return items.join(' y ');
  }
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  
  return `${otherItems.join(separator)} y ${lastItem}`;
};

export const formatTags = (tags: string[]): string => {
  return tags.map(tag => `#${tag}`).join(' ');
};

// === FORMATEO DE FECHAS ESPECIALES ===

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoy';
  }
  
  if (diffDays === 1) {
    return 'Ayer';
  }
  
  if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  }
  
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  
  return formatDateForDisplay(dateString);
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 1) {
    return 'Ahora mismo';
  }
  
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

// === FORMATEO DE ESTADÍSTICAS ===

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// === FORMATEO DE ERRORES ===

export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'Error desconocido';
};

// === CONSTANTES DE FORMATEO ===

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥'
};

export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  LONG: 'HH:mm:ss',
  WITH_TIMEZONE: 'HH:mm Z'
};

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD de MMMM de YYYY',
  ISO: 'YYYY-MM-DD'
}; 