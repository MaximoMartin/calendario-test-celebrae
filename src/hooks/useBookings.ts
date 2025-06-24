import { useState, useCallback, useMemo } from 'react';
import type { Booking, Kit, CalendarEvent } from '../types';
import { mockBookings } from '../mockData';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isLoading, setIsLoading] = useState(false);

  const addBooking = useCallback((newBooking: Omit<Booking, 'id' | 'createdAt'>) => {
    const booking: Booking = {
      ...newBooking,
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    setBookings(prev => [...prev, booking]);
    return booking;
  }, []);

  const updateBooking = useCallback((bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates }
          : booking
      )
    );
  }, []);

  const deleteBooking = useCallback((bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  }, []);

  const getBookingsByShop = useCallback((shopId: string) => {
    return bookings.filter(booking => booking.shopId === shopId);
  }, [bookings]);

  const getBookingsByKit = useCallback((kitId: string) => {
    return bookings.filter(booking => booking.kitId === kitId);
  }, [bookings]);

  const getBookingsByDateRange = useCallback((startDate: string, endDate: string) => {
    return bookings.filter(booking => 
      booking.date >= startDate && booking.date <= endDate
    );
  }, [bookings]);

  const convertBookingsToCalendarEvents = useCallback((
    bookingsToConvert: Booking[], 
    kits: Kit[]
  ): CalendarEvent[] => {
    return bookingsToConvert.map(booking => {
      const kit = kits.find(k => k.id === booking.kitId);
      const startDateTime = new Date(`${booking.date}T${booking.timeSlot}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (kit?.duration || 60) * 60000);

      return {
        id: booking.id,
        title: `${booking.kitName} - ${booking.customerName}`,
        start: startDateTime,
        end: endDateTime,
        resource: booking,
      };
    });
  }, []);

  const getBookingStats = useCallback((shopId?: string) => {
    const relevantBookings = shopId 
      ? getBookingsByShop(shopId)
      : bookings;

    const stats = {
      total: relevantBookings.length,
      pending: relevantBookings.filter(b => b.status === 'PENDING').length,
      confirmed: relevantBookings.filter(b => b.status === 'CONFIRMED').length,
      cancelled: relevantBookings.filter(b => b.status === 'CANCELLED').length,
      completed: relevantBookings.filter(b => b.status === 'COMPLETED').length,
    };

    return stats;
  }, [bookings, getBookingsByShop]);

  const value = useMemo(() => ({
    bookings,
    isLoading,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingsByShop,
    getBookingsByKit,
    getBookingsByDateRange,
    convertBookingsToCalendarEvents,
    getBookingStats,
  }), [
    bookings,
    isLoading,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingsByShop,
    getBookingsByKit,
    getBookingsByDateRange,
    convertBookingsToCalendarEvents,
    getBookingStats,
  ]);

  return value;
}; 