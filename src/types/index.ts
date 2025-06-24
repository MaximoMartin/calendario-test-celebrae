export interface User {
  id: string;
  name: string;
  email: string;
  roles: ('SELLER' | 'ADMIN' | 'BUYER' | 'ESSENTIAL')[];
  phoneNumber: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  shopStatus: 'ENABLED' | 'DISABLED';
  userId: string;
  businessHours?: BusinessHours[];
  bookingSettings?: BookingSettings;
}

export interface Kit {
  id: string;
  name: string;
  price: number;
  maxCapacity: number;
  duration: number; // in minutes
  items?: any[];
  extras?: any[];
  shopId: string;
  slots?: TimeSlot[];
}

export interface BusinessHoursPeriod {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  periods: BusinessHoursPeriod[]; // Multiple periods per day
}

export interface TimeSlot {
  id: string;
  kitId: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  maxBookings: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  kitId: string;
  kitName: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // ISO date string
  timeSlot: string; // HH:mm format
  numberOfPeople: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED' | 'PARTIAL_REFUND';
  isManual: boolean; // true if created by shop owner
  createdAt: string;
  notes?: string;
  rescheduledFrom?: string; // original date if rescheduled
  refundAmount?: number; // amount refunded for partial refunds
  cancellationReason?: string;
}

export interface BookingSettings {
  hoursBeforeBooking: number; // minimum hours before booking
  maxAdvanceBookingDays: number; // maximum days in advance
  allowSameDayBooking: boolean;
  autoConfirmBookings: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

export type ViewType = 'month' | 'week' | 'day';

export interface BookingFormData {
  kitId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  numberOfPeople: number;
  notes?: string;
}

export interface BusinessHoursFormData {
  monday: BusinessHourDay;
  tuesday: BusinessHourDay;
  wednesday: BusinessHourDay;
  thursday: BusinessHourDay;
  friday: BusinessHourDay;
  saturday: BusinessHourDay;
  sunday: BusinessHourDay;
}

export interface BusinessHourDay {
  isActive: boolean;
  periods: BusinessHoursPeriod[];
}

export interface TimeSlotFormData {
  kitId: string;
  startTime: string;
  endTime: string;
  maxBookings: number;
}

// Gestión de Excepciones y Disponibilidad Avanzada
export interface ShopException {
  id: string;
  shopId: string;
  date: string; // ISO date string
  type: 'CLOSED' | 'SPECIAL_HOURS' | 'PRIVATE_EVENT' | 'MAINTENANCE';
  title: string;
  description?: string;
  specialHours?: {
    startTime: string;
    endTime: string;
  };
  affectedKits?: string[]; // kit IDs affected, empty array means all kits
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilityBlock {
  id: string;
  shopId: string;
  kitId?: string; // if not specified, applies to all kits
  startDate: string;
  endDate: string;
  type: 'BLOCKED' | 'SPECIAL_PRICING' | 'LIMITED_CAPACITY';
  reason: string;
  settings?: {
    maxBookings?: number;
    priceMultiplier?: number; // for special pricing
    allowedStatuses?: Booking['status'][]; // which booking statuses are allowed
  };
  isActive: boolean;
}

export interface SearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Booking['status'][];
  kitIds?: string[];
  isManual?: boolean;
  customerEmail?: string;
  customerPhone?: string;
}

export interface GlobalSearchResult {
  type: 'booking' | 'customer' | 'kit';
  id: string;
  title: string;
  subtitle: string;
  data: Booking | Kit | CustomerInfo;
  relevance: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBookingDate?: string;
  notes?: string;
} 