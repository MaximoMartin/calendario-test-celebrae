// ========================================
// HOOK PARA GESTIÓN INTELIGENTE DE RESERVAS - ETAPA 4
// ========================================

import { useState, useCallback } from 'react';
import type {
  Booking,
  Bundle,
  Shop,
  CreateBookingData,
  ItemBooking,
  ExtraBooking,
  ResourceAllocation,
  BookingStatus
} from '../types/newModel';
import { generateBookingId } from '../utils/bookingValidations';

interface UseIntelligentBookingsReturn {
  bookings: Booking[];
  createBooking: (data: CreateBookingData) => Promise<{ success: boolean; error?: string; bookingId?: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<boolean>;
  getBookingsByDate: (date: string) => Booking[];
  getBookingsByBundle: (bundleId: string) => Booking[];
  getBookingById: (bookingId: string) => Booking | undefined;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  rescheduleBooking: (bookingId: string, newDate: string, newItemSelections: CreateBookingData['itemSelections']) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useIntelligentBookings = (
  shop: Shop,
  bundles: Bundle[],
  initialBookings: Booking[] = []
): UseIntelligentBookingsReturn => {
  // ========================================
  // ESTADO
  // ========================================

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // UTILIDADES
  // ========================================

  const getBundleById = useCallback((bundleId: string) => 
    bundles.find(b => b.id === bundleId),
    [bundles]
  );

  const createItemBookings = useCallback((
    bookingId: string,
    bundleId: string,
    itemSelections: CreateBookingData['itemSelections']
  ): ItemBooking[] => {
    const bundle = getBundleById(bundleId);
    if (!bundle) return [];

    return itemSelections.map(selection => {
      const item = bundle.items.find(i => i.id === selection.itemId);
      const timeSlot = item?.timeSlots.find(ts => ts.id === selection.timeSlotId);
      
      if (!item || !timeSlot) {
        throw new Error(`Item o TimeSlot no encontrado: ${selection.itemId}`);
      }

      // Crear asignaciones de recursos básicas (esto se puede mejorar)
      const resourceAllocations: ResourceAllocation[] = item.requiredResources.map(req => {
        const resource = shop.resources.find(r => r.id === req.resourceId);
        return {
          id: `alloc_${Math.random().toString(36).substr(2, 9)}`,
          resourceId: req.resourceId,
          resourceName: resource?.name || 'Recurso desconocido',
          quantity: req.quantity,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          isConfirmed: true,
          notes: `Auto-asignado para ${item.name}`
        };
      });

      return {
        id: `item_${Math.random().toString(36).substr(2, 9)}`,
        bookingId,
        itemId: selection.itemId,
        itemName: item.name,
        timeSlotId: selection.timeSlotId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        numberOfPeople: selection.numberOfPeople,
        status: 'PENDING' as BookingStatus,
        resourceAllocations,
        notes: `Reserva para ${selection.numberOfPeople} personas`
      };
    });
  }, [shop.resources, getBundleById]);

  const createExtraBookings = useCallback((
    bookingId: string,
    bundleId: string,
    extraSelections: CreateBookingData['extraSelections'] = []
  ): ExtraBooking[] => {
    const bundle = getBundleById(bundleId);
    if (!bundle) return [];

    return extraSelections.map(selection => {
      const extra = bundle.extras.find(e => e.id === selection.extraId);
      
      if (!extra) {
        throw new Error(`Extra no encontrado: ${selection.extraId}`);
      }

      // Crear asignaciones de recursos para extras si las hay
      const resourceAllocations: ResourceAllocation[] = extra.resourceRequirements?.map(req => {
        const resource = shop.resources.find(r => r.id === req.resourceId);
        return {
          id: `alloc_${Math.random().toString(36).substr(2, 9)}`,
          resourceId: req.resourceId,
          resourceName: resource?.name || 'Recurso desconocido',
          quantity: req.quantity,
          startTime: '00:00', // Los extras no tienen horarios específicos
          endTime: '23:59',
          isConfirmed: true,
          notes: `Extra: ${extra.name}`
        };
      }) || [];

      return {
        id: `extra_${Math.random().toString(36).substr(2, 9)}`,
        bookingId,
        extraId: selection.extraId,
        extraName: extra.name,
        quantity: selection.quantity,
        unitPrice: extra.price,
        resourceAllocations
      };
    });
  }, [shop.resources, getBundleById]);

  const calculateTotalPrice = useCallback((
    itemBookings: ItemBooking[],
    extraBookings: ExtraBooking[]
  ): number => {
    const itemsTotal = itemBookings.reduce((sum, item) => {
      const bundle = getBundleById(item.itemId);
      const bundleItem = bundle?.items.find(i => i.id === item.itemId);
      return sum + (bundleItem?.price || 0) * item.numberOfPeople;
    }, 0);

    const extrasTotal = extraBookings.reduce((sum, extra) => 
      sum + (extra.unitPrice * extra.quantity), 0
    );

    return itemsTotal + extrasTotal;
  }, [getBundleById]);

  // ========================================
  // OPERACIONES PRINCIPALES
  // ========================================

  const createBooking = useCallback(async (data: CreateBookingData): Promise<{ success: boolean; error?: string; bookingId?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const bundle = getBundleById(data.bundleId);
      if (!bundle) {
        throw new Error('Bundle no encontrado');
      }

      const bookingId = generateBookingId();
      const now = new Date().toISOString();

      // Crear bookings de items
      const itemBookings = createItemBookings(bookingId, data.bundleId, data.itemSelections);
      
      // Crear bookings de extras
      const extraBookings = createExtraBookings(bookingId, data.bundleId, data.extraSelections);

      // Calcular precio total
      const totalAmount = calculateTotalPrice(itemBookings, extraBookings);

      // Crear la reserva principal
      const newBooking: Booking = {
        id: bookingId,
        bundleId: data.bundleId,
        bundleName: bundle.name,
        shopId: shop.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        date: data.date,
        status: 'PENDING',
        isManual: data.isManual || true,
        createdAt: now,
        notes: data.notes,
        itemBookings,
        extraBookings,
        pricing: {
          totalAmount,
          paidAmount: 0,
          refundAmount: 0,
          cancellationFee: 0
        }
      };

      // Agregar la nueva reserva al estado
      setBookings(prev => [...prev, newBooking]);

      return { success: true, bookingId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [shop.id, getBundleById, createItemBookings, createExtraBookings, calculateTotalPrice]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              status,
              // También actualizar el status de todos los items
              itemBookings: booking.itemBookings.map(item => ({ ...item, status }))
            }
          : booking
      ));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar reserva';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rescheduleBooking = useCallback(async (
    bookingId: string, 
    newDate: string, 
    newItemSelections: CreateBookingData['itemSelections']
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const existingBooking = bookings.find(b => b.id === bookingId);
      if (!existingBooking) {
        throw new Error('Reserva no encontrada');
      }

      // Crear nuevos item bookings con la nueva fecha y horarios
      const newItemBookings = createItemBookings(bookingId, existingBooking.bundleId, newItemSelections);

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              date: newDate,
              itemBookings: newItemBookings,
              status: 'RESCHEDULED' as BookingStatus,
              rescheduling: {
                originalDate: booking.date,
                reason: 'Reprogramada por el cliente',
                rescheduledAt: new Date().toISOString()
              }
            }
          : booking
      ));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al reprogramar';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [bookings, createItemBookings]);

  // ========================================
  // CONSULTAS Y FILTROS
  // ========================================

  const getBookingsByDate = useCallback((date: string): Booking[] => {
    return bookings.filter(booking => booking.date === date);
  }, [bookings]);

  const getBookingsByBundle = useCallback((bundleId: string): Booking[] => {
    return bookings.filter(booking => booking.bundleId === bundleId);
  }, [bookings]);

  const getBookingById = useCallback((bookingId: string): Booking | undefined => {
    return bookings.find(booking => booking.id === bookingId);
  }, [bookings]);

  return {
    bookings,
    createBooking,
    updateBookingStatus,
    getBookingsByDate,
    getBookingsByBundle,
    getBookingById,
    deleteBooking,
    rescheduleBooking,
    isLoading,
    error
  };
}; 