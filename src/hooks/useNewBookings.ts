// ========================================
// HOOK PARA GESTIÓN DE RESERVAS CON NUEVO MODELO
// ========================================

import { useState, useCallback } from 'react';
import type { 
  Booking, 
  Bundle, 
  Shop, 
  ItemBooking, 
  ExtraBooking,
  CalendarEvent,
  CreateBookingData 
} from '../types/newModel';
import { format } from 'date-fns';

interface UseNewBookingsProps {
  shop: Shop;
  bundles: Bundle[];
}

interface UseNewBookingsReturn {
  bookings: Booking[];
  addBooking: (data: CreateBookingData) => Promise<{ success: boolean; bookingId?: string; error?: string }>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<boolean>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
  convertToCalendarEvents: () => CalendarEvent[];
  getBookingsByDate: (date: string) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  deleteBooking: (bookingId: string) => Promise<boolean>;
}

export const useNewBookings = ({ shop, bundles }: UseNewBookingsProps): UseNewBookingsReturn => {
  // Estado inicial con algunas reservas de ejemplo
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'booking-001',
      bundleId: 'bundle-001',
      bundleName: 'Bundle de Ejemplo',
      shopId: shop.id,
      customerName: 'María García',
      customerEmail: 'maria.garcia@email.com',
      customerPhone: '+34912345678',
      date: format(new Date(), 'yyyy-MM-dd'),
      pricing: {
        totalAmount: 150,
        paidAmount: 150,
        refundAmount: 0,
        cancellationFee: 0
      },
      status: 'CONFIRMED',
      isManual: true,
      createdAt: new Date().toISOString(),
      itemBookings: [
        {
          id: 'item-booking-001',
          bookingId: 'booking-001',
          itemId: 'item-001',
          itemName: 'Desayuno Especial',
          timeSlotId: 'slot-001',
          startTime: '09:00',
          endTime: '10:00',
          numberOfPeople: 2,
          status: 'CONFIRMED',
          resourceAllocations: [
            {
              id: 'alloc-001',
              resourceId: 'resource-001',
              resourceName: 'Mesa Principal',
              quantity: 1,
              startTime: '08:45',
              endTime: '10:15',
              isConfirmed: true
            }
          ]
        }
      ],
      extraBookings: [],
      notes: 'Reserva de ejemplo del sistema'
    }
  ]);

  // ========================================
  // AGREGAR NUEVA RESERVA
  // ========================================

  const addBooking = useCallback(async (data: CreateBookingData): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
    try {
      // Buscar el bundle
      const bundle = bundles.find(b => b.id === data.bundleId);
      if (!bundle) {
        return { success: false, error: 'Bundle no encontrado' };
      }

      // Calcular precio base
      let baseAmount = bundle.basePrice;
      let extrasAmount = 0;
      
      // Agregar precio de extras
      if (data.extraSelections) {
        for (const extraSelection of data.extraSelections) {
          const extra = bundle.extras.find(e => e.id === extraSelection.extraId);
          if (extra) {
            extrasAmount += extra.price * extraSelection.quantity;
          }
        }
      }

      const totalAmount = baseAmount + extrasAmount;

      // Crear ItemBookings automáticamente para todos los items del bundle
      const itemBookings: ItemBooking[] = bundle.items.map((item, index) => {
        const timeSlot = item.timeSlots[0];
        return {
          id: `item-booking-${Date.now()}-${index}`,
          bookingId: `booking-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          timeSlotId: timeSlot?.id || 'default-slot',
          startTime: timeSlot?.startTime || '09:00',
          endTime: timeSlot?.endTime || '10:00',
          numberOfPeople: data.numberOfPeople,
          status: 'PENDING',
          resourceAllocations: item.requiredResources.map((req, reqIndex) => ({
            id: `alloc-${Date.now()}-${index}-${reqIndex}`,
            resourceId: req.resourceId,
            resourceName: req.resourceId, // Simplificado
            quantity: Math.ceil(data.numberOfPeople / req.quantity),
            startTime: timeSlot?.startTime || '09:00',
            endTime: timeSlot?.endTime || '10:00',
            isConfirmed: false
          }))
        };
      });

      // Crear ExtraBookings
      const extraBookings: ExtraBooking[] = data.extraSelections?.map((selection, index) => {
        const extra = bundle.extras.find(e => e.id === selection.extraId);
        return {
          id: `extra-booking-${Date.now()}-${index}`,
          bookingId: `booking-${Date.now()}`,
          extraId: selection.extraId,
          extraName: extra?.name || 'Extra desconocido',
          quantity: selection.quantity,
          unitPrice: extra?.price || 0,
          price: (extra?.price || 0) * selection.quantity
        };
      }) || [];

      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        bundleId: data.bundleId,
        bundleName: bundle.name,
        shopId: shop.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        date: data.date,
        pricing: {
          totalAmount,
          paidAmount: 0,
          refundAmount: 0,
          cancellationFee: 0
        },
        status: data.isManual ? 'CONFIRMED' : 'PENDING',
        isManual: data.isManual || false,
        createdAt: new Date().toISOString(),
        itemBookings,
        extraBookings,
        notes: data.notes
      };

      setBookings(prev => [...prev, newBooking]);

      return { success: true, bookingId: newBooking.id };
    } catch (error) {
      console.error('Error adding booking:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  }, [bundles, shop]);

  // ========================================
  // ACTUALIZAR RESERVA
  // ========================================

  const updateBooking = useCallback(async (bookingId: string, updates: Partial<Booking>): Promise<boolean> => {
    try {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updates }
          : booking
      ));
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      return false;
    }
  }, []);

  // ========================================
  // CANCELAR RESERVA
  // ========================================

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<boolean> => {
    try {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              status: 'CANCELLED',
              cancellationReason: reason,
              itemBookings: booking.itemBookings.map(item => ({
                ...item,
                status: 'CANCELLED'
              }))
            }
          : booking
      ));
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }, []);

  // ========================================
  // ELIMINAR RESERVA
  // ========================================

  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      return true;
    } catch (error) {
      console.error('Error deleting booking:', error);
      return false;
    }
  }, []);

  // ========================================
  // CONVERTIR A EVENTOS DE CALENDARIO
  // ========================================

  const convertToCalendarEvents = useCallback((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    for (const booking of bookings) {
      for (const itemBooking of booking.itemBookings) {
        const bundle = bundles.find(b => b.id === booking.bundleId);
        const item = bundle?.items.find(i => i.id === itemBooking.itemId);
        
        if (!item) continue;

        const startDateTime = new Date(`${booking.date}T${itemBooking.startTime}:00`);
        const endDateTime = new Date(`${booking.date}T${itemBooking.endTime}:00`);

        events.push({
          id: `${booking.id}_${itemBooking.id}`,
          title: `${item.name} - ${booking.customerName}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            type: 'BOOKING',
            data: {
              booking,
              itemBooking,
              item,
              bundle
            }
          },
          color: getEventColor(itemBooking.status)
        });
      }
    }

    return events;
  }, [bookings, bundles]);

  // ========================================
  // OBTENER RESERVAS POR FECHA
  // ========================================

  const getBookingsByDate = useCallback((date: string): Booking[] => {
    return bookings.filter(booking => booking.date === date);
  }, [bookings]);

  // ========================================
  // OBTENER RESERVA POR ID
  // ========================================

  const getBookingById = useCallback((id: string): Booking | undefined => {
    return bookings.find(booking => booking.id === id);
  }, [bookings]);

  return {
    bookings,
    addBooking,
    updateBooking,
    cancelBooking,
    convertToCalendarEvents,
    getBookingsByDate,
    getBookingById,
    deleteBooking
  };
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Obtener color del evento según el estado
 */
function getEventColor(status: string): string {
  const colors = {
    'PENDING': '#f59e0b',
    'CONFIRMED': '#10b981',
    'CANCELLED': '#ef4444',
    'COMPLETED': '#6b7280',
    'NO_SHOW': '#f97316',
    'RESCHEDULED': '#3b82f6',
    'PARTIAL_REFUND': '#6366f1'
  };

  return colors[status as keyof typeof colors] || '#3174ad';
} 