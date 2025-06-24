import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  MessageSquare,
  Filter,
  ChevronDown,
  Search
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import type { Booking, Kit } from '../types';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [kitFilter, setKitFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'created'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'CONFIRMED', label: 'Confirmadas' },
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'COMPLETED', label: 'Completadas' },
    { value: 'NO_SHOW', label: 'No se presentó' },
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
    { value: 'created', label: 'Por creación' },
  ];

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

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
      PENDING: 'bg-yellow-100 text-yellow-900 border-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-900 border-green-200',
      CANCELLED: 'bg-red-100 text-red-900 border-red-200',
      COMPLETED: 'bg-gray-100 text-gray-900 border-gray-200',
      NO_SHOW: 'bg-orange-100 text-orange-900 border-orange-200',
      RESCHEDULED: 'bg-blue-100 text-blue-900 border-blue-200',
      PARTIAL_REFUND: 'bg-indigo-100 text-indigo-900 border-indigo-200',
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
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatBookingDate = (date: string, timeSlot: string) => {
    try {
      const bookingDate = new Date(date);
      return {
        date: format(bookingDate, 'dd/MM/yyyy'),
        time: timeSlot
      };
    } catch {
      return {
        date: date,
        time: timeSlot
      };
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    onUpdateBooking?.(bookingId, { status: newStatus });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Título y contador */}
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Lista de Reservas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedBookings.length} reserva{filteredAndSortedBookings.length !== 1 ? 's' : ''} encontrada{filteredAndSortedBookings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Botón de filtros para móvil */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros y Ordenación</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Filtros - Desktop siempre visible, Mobile colapsable */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servicio
              </label>
              <Select
                options={kitOptions}
                value={kitFilter}
                onChange={(e) => setKitFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'created')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedBookings.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron reservas
            </h3>
            <p className="text-gray-500">
              No hay reservas que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredAndSortedBookings.map((booking) => {
            const dateInfo = formatBookingDate(booking.date, booking.timeSlot);
            
            return (
              <div 
                key={booking.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Layout móvil y desktop */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  
                  {/* Información principal */}
                  <div className="flex-1 space-y-3">
                    {/* Header de la reserva */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base lg:text-lg font-medium text-gray-900 truncate">
                          {booking.kitName}
                        </h3>
                        {getStatusBadge(booking.status)}
                        {booking.isManual && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Manual
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {/* Cliente */}
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-500 text-xs">Cliente</p>
                          <p className="font-medium text-gray-900 truncate">{booking.customerName}</p>
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-500 text-xs">Teléfono</p>
                          <p className="font-medium text-gray-900 truncate">{booking.customerPhone}</p>
                        </div>
                      </div>

                      {/* Fecha */}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-500 text-xs">Fecha</p>
                          <p className="font-medium text-gray-900">{dateInfo.date}</p>
                        </div>
                      </div>

                      {/* Hora y personas */}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-500 text-xs">Hora y personas</p>
                          <p className="font-medium text-gray-900">
                            {dateInfo.time} • {booking.numberOfPeople} pers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    {booking.notes && (
                      <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-500 text-xs mb-1">Notas</p>
                          <p className="text-sm text-gray-700 break-words">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {showActions && (
                    <div className="lg:ml-6 flex flex-col lg:flex-col space-y-2 lg:min-w-0 lg:w-auto">
                      {/* Acciones contextuales */}
                      <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                              className="flex-1 lg:flex-none lg:w-24"
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                              className="flex-1 lg:flex-none lg:w-24"
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
                              className="flex-1 lg:flex-none lg:w-24"
                            >
                              Completar
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                              className="flex-1 lg:flex-none lg:w-24"
                            >
                              Cancelar
                            </Button>
                          </>
                        )}

                        {/* Botón ver detalles siempre visible */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewBooking?.(booking)}
                          className="flex-1 lg:flex-none lg:w-24"
                        >
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}; 