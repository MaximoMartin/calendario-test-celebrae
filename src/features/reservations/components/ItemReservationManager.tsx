import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { Item, CreateReservaItemRequest, ItemAvailability } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { 
  getAvailableSlotsForItem, 
  validateItemReservation, 
  createItemReservation
} from '../availabilityValidation';
import { formatDate } from '../../../utils/dateHelpers';

interface ItemReservationManagerProps {
  item: Item;
  selectedDate?: string;
  onReservationCreated?: (reservationId: string) => void;
  onClose?: () => void;
}

export const ItemReservationManager: React.FC<ItemReservationManagerProps> = ({
  item,
  selectedDate,
  onReservationCreated,
  onClose
}) => {
  // Estados locales
  const [currentDate, setCurrentDate] = useState(selectedDate || formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener slots disponibles para la fecha actual
  const availableSlots = useMemo(() => {
    console.log(`🔄 Recalculando slots para ${item.id} en ${currentDate}`);
    return getAvailableSlotsForItem(item.id, currentDate);
  }, [item.id, currentDate]);

  // Validación en tiempo real
  const currentValidation = useMemo(() => {
    if (!selectedTimeSlot) return null;
    
    const request: CreateReservaItemRequest = {
      itemId: item.id,
      date: currentDate,
      timeSlot: selectedTimeSlot,
      numberOfPeople,
      customerInfo: customerName ? {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      } : undefined,
      notes: notes || undefined
    };

    return validateItemReservation(request);
  }, [item.id, currentDate, selectedTimeSlot, numberOfPeople, customerName, customerEmail, customerPhone, notes]);

  // Manejo de cambio de fecha
  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    setSelectedTimeSlot(null); // Reset selection
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Manejo de selección de horario
  const handleTimeSlotSelect = (timeSlot: { startTime: string; endTime: string }) => {
    setSelectedTimeSlot(timeSlot);
    setErrorMessage('');
  };

  // Crear reserva
  const handleCreateReservation = async () => {
    if (!selectedTimeSlot || !currentValidation?.isValid) return;

    setIsCreatingReservation(true);
    setErrorMessage('');
    
    try {
      const request: CreateReservaItemRequest = {
        itemId: item.id,
        date: currentDate,
        timeSlot: selectedTimeSlot,
        numberOfPeople,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        notes: notes || undefined
      };

      console.log('🚀 Creando reserva con request:', request);
      
      const result = createItemReservation(request);
      
      if (result.success && result.reserva) {
        setSuccessMessage(`¡Reserva creada exitosamente! ID: ${result.reserva.id}`);
        
        // Reset form
        setSelectedTimeSlot(null);
        setNumberOfPeople(1);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setNotes('');
        
        // Callback
        onReservationCreated?.(result.reserva.id);
        
        // Auto-close after success
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        setErrorMessage(result.errors.join(', '));
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
      setErrorMessage('Error interno al crear la reserva');
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // Obtener color del slot según disponibilidad
  const getSlotColor = (availability: ItemAvailability) => {
    if (!availability.isAvailable) {
      return 'bg-red-100 border-red-200 text-red-800 cursor-not-allowed';
    }
    if (availability.availableSpots <= 2) {
      return 'bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-200 cursor-pointer';
    }
    return 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200 cursor-pointer';
  };

  // Fecha mínima (mañana)
  const minDate = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Reservar: {item.title}
                </h2>
                <p className="text-sm text-gray-600">
                  ${item.price} • Máx: {item.bookingConfig?.maxCapacity || item.size} personas
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Información del item */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">{item.description}</p>
              {item.bookingConfig && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-blue-700">
                  <span>⏱️ Duración: {item.bookingConfig.duration} min</span>
                  <span>📅 Anticipación: {item.bookingConfig.advanceBookingDays} días</span>
                  {item.bookingConfig.requiresConfirmation && (
                    <span>✅ Requiere confirmación</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Selección de fecha y horarios */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la reserva
                  </label>
                  <Input
                    type="date"
                    value={currentDate}
                    min={minDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios disponibles
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No hay horarios disponibles para esta fecha</p>
                      </div>
                    ) : (
                      availableSlots.map(({ timeSlot, availability }, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg transition-colors ${getSlotColor(availability)} ${
                            selectedTimeSlot?.startTime === timeSlot.startTime ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => availability.isAvailable && handleTimeSlotSelect(timeSlot)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <Users className="w-3 h-3" />
                              <span>
                                {availability.isAvailable 
                                  ? `${availability.availableSpots}/${availability.totalSpots} disponibles`
                                  : 'No disponible'
                                }
                              </span>
                            </div>
                          </div>
                          {!availability.isAvailable && (
                            <p className="text-xs mt-1 opacity-75">
                              {availability.blockingReason === 'FULLY_BOOKED' 
                                ? 'Completamente reservado' 
                                : 'No disponible'
                              }
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Formulario de reserva */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de personas
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={item.bookingConfig?.maxCapacity || item.size}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del cliente *
                  </label>
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+34 600 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Información adicional..."
                  />
                </div>
              </div>
            </div>

            {/* Validación en tiempo real */}
            {currentValidation && selectedTimeSlot && (
              <div className="space-y-2">
                {currentValidation.errors.length > 0 && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Errores:</h4>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {currentValidation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {currentValidation.warnings.length > 0 && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Advertencias:</h4>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {currentValidation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mensajes de éxito/error */}
            {successMessage && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Resumen y acciones */}
            {selectedTimeSlot && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Resumen de la reserva:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <span className="ml-2 font-medium">{currentDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Horario:</span>
                    <span className="ml-2 font-medium">
                      {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Personas:</span>
                    <span className="ml-2 font-medium">{numberOfPeople}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-medium">${item.price * numberOfPeople}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreatingReservation}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateReservation}
                disabled={
                  !selectedTimeSlot || 
                  !customerName.trim() || 
                  !currentValidation?.isValid || 
                  isCreatingReservation
                }
                loading={isCreatingReservation}
              >
                Crear Reserva
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 