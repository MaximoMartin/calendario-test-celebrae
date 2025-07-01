import React, { useState, useMemo } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { Item, CreateReservaItemRequest } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { 
  getAvailableSlotsForItem, 
  validateItemReservation, 
  useCreateItemReservation,
  getShopBusinessHoursForDate,
  isShopOpenOnDate
} from '../availabilityValidation';
import { formatDate } from '../../../utils/dateHelpers';
import { useReservations } from '../mockData';
import { useEntitiesState } from '../../../hooks/useEntitiesState';

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
  const { allItems, allShops } = useEntitiesState();
  
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

  const createItemReservation = useCreateItemReservation();
  const { reservasItems } = useReservations();

  const availableSlots = useMemo(() => {
    console.log(`🔄 Recalculando slots para ${item.id} en ${currentDate}`);
    return getAvailableSlotsForItem(item.id, currentDate, allItems, allShops, reservasItems);
  }, [item.id, currentDate, allItems, allShops, reservasItems]);

  const shopBusinessHours = useMemo(() => {
    return getShopBusinessHoursForDate(item.shopId, currentDate, allShops);
  }, [item.shopId, currentDate, allShops]);

  const isShopOpen = useMemo(() => {
    return isShopOpenOnDate(item.shopId, currentDate, allShops);
  }, [item.shopId, currentDate, allShops]);

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

    return validateItemReservation(request, undefined, reservasItems, allItems, allShops);
  }, [item.id, currentDate, selectedTimeSlot, numberOfPeople, customerName, customerEmail, customerPhone, notes, reservasItems, allItems, allShops]);

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    setSelectedTimeSlot(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

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
        
        setSelectedTimeSlot(null);
        setNumberOfPeople(1);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setNotes('');
        
        onReservationCreated?.(result.reserva.id);
        
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

            <div className={`p-4 rounded-lg border ${isShopOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${isShopOpen ? 'text-green-600' : 'text-red-600'}`} />
                <h3 className={`text-sm font-medium ${isShopOpen ? 'text-green-800' : 'text-red-800'}`}>
                  Horarios de Atención para {new Date(currentDate).toLocaleDateString('es-ES', { weekday: 'long' })}
                </h3>
              </div>
              
              {isShopOpen ? (
                <div className="space-y-1">
                  {shopBusinessHours.map((range, index) => (
                    <div key={index} className="text-sm text-green-700">
                      📅 {range.from} - {range.to}
                    </div>
                  ))}
                  <p className="text-xs text-green-600 mt-2">
                    ✅ Solo puedes reservar dentro de estos horarios
                  </p>
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  🚫 El negocio está cerrado este día. No se pueden hacer reservas.
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
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay horarios disponibles para esta fecha</p>
                    </div>
                  ) : (
                    <select
                      className="w-full border rounded-md p-2 text-sm"
                      value={selectedTimeSlot ? `${selectedTimeSlot.startTime}-${selectedTimeSlot.endTime}` : ''}
                      onChange={e => {
                        const val = e.target.value;
                        const slot = availableSlots.find(s => `${s.timeSlot.startTime}-${s.timeSlot.endTime}` === val);
                        setSelectedTimeSlot(slot ? slot.timeSlot : null);
                        setErrorMessage('');
                      }}
                    >
                      <option value="">Selecciona un horario...</option>
                      {availableSlots.map(({ timeSlot, availability }, idx) => (
                        <option
                          key={idx}
                          value={`${timeSlot.startTime}-${timeSlot.endTime}`}
                          disabled={!availability.isAvailable}
                        >
                          {`${timeSlot.startTime} - ${timeSlot.endTime} (${availability.availableSpots}/${availability.totalSpots} disponibles)`}
                        </option>
                      ))}
                    </select>
                  )}
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