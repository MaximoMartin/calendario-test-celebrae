import { useState, useCallback, useMemo } from 'react';
import type { Booking, Bundle } from '../types';
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

  const getBookingsByBundle = useCallback((bundleId: string) => {
    return bookings.filter(booking => booking.bundleId === bundleId);
  }, [bookings]);

  const getBookingsByDateRange = useCallback((startDate: string, endDate: string) => {
    return bookings.filter(booking => 
      booking.date >= startDate && booking.date <= endDate
    );
  }, [bookings]);

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
    getBookingsByBundle,
    getBookingsByDateRange,
    getBookingStats,
  }), [
    bookings,
    isLoading,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingsByShop,
    getBookingsByBundle,
    getBookingsByDateRange,
    getBookingStats,
  ]);

  return value;
}; 