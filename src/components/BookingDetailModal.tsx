import React from 'react';
import { format } from 'date-fns';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  MessageSquare,
  MapPin,
  Euro,
  Timer,
  Users,
  Info
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { Booking, Kit } from '../types';

interface BookingDetailModalProps {
  booking: Booking;
  kit?: Kit;
  onClose: () => void;
  onUpdateBooking?: (bookingId: string, updates: Partial<Booking>) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  kit,
  onClose,
  onUpdateBooking,
}) => {
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
      <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-medium border ${styles[status]}`}>
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

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus: Booking['status']) => {
    onUpdateBooking?.(booking.id, { status: newStatus });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl mx-auto my-4 lg:my-8">
        <Card className="overflow-hidden">
          {/* Header fijo */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 lg:p-6 border-b shadow-sm">
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                Detalles de Reserva
              </h2>
              {getStatusBadge(booking.status)}
              {booking.isManual && (
                <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Manual
                </span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="p-2 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content scrolleable */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Servicio */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-blue-900">
                  {booking.kitName}
                </h3>
              </div>
              {kit && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-blue-700 font-medium">Precio:</span>
                      <span className="ml-1 text-blue-900 font-semibold">€{kit.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-blue-700 font-medium">Duración:</span>
                      <span className="ml-1 text-blue-900 font-semibold">{kit.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-blue-700 font-medium">Capacidad máx:</span>
                      <span className="ml-1 text-blue-900 font-semibold">{kit.maxCapacity} pers.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información del Cliente y Reserva */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información del Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 text-gray-600 mr-2" />
                  Cliente
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                      <p className="font-medium text-gray-900 truncate">{booking.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                      <p className="font-medium text-gray-900">{booking.customerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de la Reserva */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                  Detalles
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha y Hora</p>
                      <p className="font-medium text-gray-900">{formatBookingDate(booking.date, booking.timeSlot)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Personas</p>
                      <p className="font-medium text-gray-900">{booking.numberOfPeople} persona{booking.numberOfPeople !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            {booking.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 text-yellow-600 mr-2" />
                  Notas Adicionales
                </h4>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed break-words">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Información Adicional (para estados especiales) */}
            {(booking.rescheduledFrom || booking.refundAmount || booking.cancellationReason) && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 text-purple-600 mr-2" />
                  Información Adicional
                </h4>
                <div className="space-y-2 text-sm">
                  {booking.rescheduledFrom && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-blue-700">Reprogramada desde:</span>
                        <span className="ml-1 text-blue-900">{booking.rescheduledFrom}</span>
                      </div>
                    </div>
                  )}
                  {booking.refundAmount && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-purple-700">Monto reembolsado:</span>
                        <span className="ml-1 text-purple-900 font-semibold">€{booking.refundAmount}</span>
                      </div>
                    </div>
                  )}
                  {booking.cancellationReason && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-red-700">Motivo de cancelación:</span>
                        <span className="ml-1 text-red-900">{booking.cancellationReason}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del Sistema */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
                Información del Sistema
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded p-3">
                  <span className="font-medium text-gray-700">ID de Reserva:</span>
                  <p className="font-mono text-xs text-gray-900 mt-1 break-all">{booking.id}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <span className="font-medium text-gray-700">Fecha de Creación:</span>
                  <p className="text-gray-900 mt-1">{formatCreatedDate(booking.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones - Sticky en móvil */}
          <div className="sticky bottom-0 bg-white border-t p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              {/* Acciones principales */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {booking.status === 'PENDING' && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => handleStatusChange('CONFIRMED')}
                      className="w-full sm:w-auto"
                    >
                      Confirmar Reserva
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleStatusChange('CANCELLED')}
                      className="w-full sm:w-auto"
                    >
                      Cancelar Reserva
                    </Button>
                  </>
                )}
                
                {booking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="w-full sm:w-auto"
                    >
                      Marcar como Completada
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleStatusChange('CANCELLED')}
                      className="w-full sm:w-auto"
                    >
                      Cancelar Reserva
                    </Button>
                  </>
                )}

                {booking.status === 'COMPLETED' && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Reserva completada exitosamente
                  </div>
                )}

                {booking.status === 'CANCELLED' && (
                  <div className="text-sm text-red-600 font-medium">
                    ✗ Reserva cancelada
                  </div>
                )}
              </div>

              {/* Botón cerrar */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 