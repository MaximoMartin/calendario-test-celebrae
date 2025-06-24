import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import type { Booking, Kit } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface BookingListProps {
  bookings: Booking[];
  kits: Kit[];
  onUpdateBooking?: (bookingId: string, updates: Partial<Booking>) => void;
  onViewBooking?: (booking: Booking) => void;
  showActions?: boolean;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  kits,
  onUpdateBooking,
  onViewBooking,
  showActions = true,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kitFilter, setKitFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'created'>('date');

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'CONFIRMED', label: 'Confirmadas' },
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'COMPLETED', label: 'Completadas' },
    { value: 'NO_SHOW', label: 'No se presentaron' },
    { value: 'RESCHEDULED', label: 'Reprogramadas' },
    { value: 'PARTIAL_REFUND', label: 'Reembolso parcial' },
  ];

  const kitOptions = useMemo(() => [
    { value: 'all', label: 'Todos los servicios' },
    ...kits.map(kit => ({ value: kit.id, label: kit.name }))
  ], [kits]);

  const sortOptions = [
    { value: 'date', label: 'Por fecha' },
    { value: 'status', label: 'Por estado' },
    { value: 'created', label: 'Por fecha de creación' },
  ];

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings;

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filtrar por kit
    if (kitFilter !== 'all') {
      filtered = filtered.filter(booking => booking.kitId === kitFilter);
    }

    // Ordenar
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(`${a.date}T${a.timeSlot}`).getTime() - new Date(`${b.date}T${b.timeSlot}`).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [bookings, statusFilter, kitFilter, sortBy]);

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
      RESCHEDULED: 'bg-blue-100 text-blue-800',
      PARTIAL_REFUND: 'bg-indigo-100 text-indigo-800',
    };

    const labels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
      NO_SHOW: 'No se presentó',
      RESCHEDULED: 'Reprogramada',
      PARTIAL_REFUND: 'Reembolso parcial',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatBookingDate = (date: string, timeSlot: string) => {
    try {
      const bookingDate = new Date(date);
      return `${format(bookingDate, 'dd/MM/yyyy')} a las ${timeSlot}`;
    } catch {
      return `${date} a las ${timeSlot}`;
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    onUpdateBooking?.(bookingId, { status: newStatus });
  };

  return (
    <Card 
      title={`Reservas (${filteredAndSortedBookings.length})`}
      headerActions={
        <div className="flex items-center space-x-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={kitOptions}
            value={kitFilter}
            onChange={(e) => setKitFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'created')}
            className="w-40"
          />
        </div>
      }
    >
      <div className="space-y-4">
        {filteredAndSortedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay reservas que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredAndSortedBookings.map((booking) => (
            <div 
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {booking.kitName}
                    </h4>
                    {getStatusBadge(booking.status)}
                    {booking.isManual && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Manual
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{booking.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{booking.customerEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatBookingDate(booking.date, booking.timeSlot)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.numberOfPeople} persona{booking.numberOfPeople !== 1 ? 's' : ''}</span>
                      </div>
                      {booking.notes && (
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 mt-0.5" />
                          <span className="text-xs">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="ml-4 flex flex-col space-y-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                        >
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewBooking?.(booking)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}; 