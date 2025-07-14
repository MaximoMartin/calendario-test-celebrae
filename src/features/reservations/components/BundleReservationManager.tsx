import React, { useState } from 'react';
import { Users, Package, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { Bundle, CreateReservaBundleRequest } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useCreateBundleReservation } from '../bundleValidation';
import { formatDate } from '../../../utils/dateHelpers';
import { useEntitiesState } from '../../../hooks/useEntitiesState';
import { getAvailableSlotsForItem, validateItemAgainstShopHours } from '../availabilityValidation';
import { useShopState } from '../../../hooks/useShopState';
import { capitalizeFirst } from '../../../utils/formatHelpers';

interface BundleReservationManagerProps {
  bundle: Bundle;
  onReservationCreated?: (reservationId: string) => void;
  onClose?: () => void;
}

interface SelectedItem {
  itemId: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  numberOfPeople: number;
}

interface SelectedExtra {
  extraId: string;
  quantity: number;
}

export const BundleReservationManager: React.FC<BundleReservationManagerProps> = ({
  bundle,
  onReservationCreated,
  onClose
}) => {
  const { allShops } = useEntitiesState();
  const bundleItems = bundle.items;
  const bundleExtras = bundle.extras;

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const createBundleReservation = useCreateBundleReservation();
  const { selectedShop } = useShopState();

  const handleAddItem = (itemId: string) => {
    const item = bundleItems.find(i => i.id === itemId);
    if (!item) return;

    const newItem: SelectedItem = {
      itemId,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeSlot: { startTime: '10:00', endTime: '11:00' },
      numberOfPeople: 1
    };

    setSelectedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, updates: Partial<SelectedItem>) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const handleUpdateExtra = (extraId: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedExtras(prev => prev.filter(e => e.extraId !== extraId));
    } else {
      setSelectedExtras(prev => {
        const existing = prev.find(e => e.extraId === extraId);
        if (existing) {
          return prev.map(e => e.extraId === extraId ? { ...e, quantity } : e);
        } else {
          return [...prev, { extraId, quantity }];
        }
      });
    }
  };

  const handleCreateReservation = async () => {
    if (selectedItems.length === 0) {
      setErrorMessage('Debe seleccionar al menos un item');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('El nombre del cliente es obligatorio');
      return;
    }

    setIsCreatingReservation(true);
    setErrorMessage('');

    try {
      const request: CreateReservaBundleRequest = {
        bundleId: bundle.id,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        itemReservations: selectedItems,
        selectedExtras,
        ...(notes && { notes })
      };

      const result = await createBundleReservation(request);

      if (result.success) {
        setSuccessMessage(`¡Reserva de bundle creada exitosamente! ID: ${result.reservationId}`);
        
        setSelectedItems([]);
        setSelectedExtras([]);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setNotes('');
        
        onReservationCreated?.(result.reservationId || '');
        
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        setErrorMessage(result.errors.join(', '));
      }
    } catch (error) {
      console.error('Error creando reserva de bundle:', error);
      setErrorMessage('Error interno al crear la reserva');
    } finally {
      setIsCreatingReservation(false);
    }
  };

  const getExtraQuantity = (extraId: string) => {
    return selectedExtras.find(e => e.extraId === extraId)?.quantity || 0;
  };

  // --- RESUMEN DE HORARIOS Y DISPONIBILIDAD ---
  const renderItemSummary = (item: typeof bundleItems[0]) => {
    const validation = validateItemAgainstShopHours(item, selectedShop);
    const bookingLimits = item.timeSlots?.bookingLimits;
    return (
      <div key={item.id} className="mb-4 p-3 border border-gray-100 rounded bg-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{item.title}</span>
          {!item.isActive && <span className="text-xs text-red-600 ml-2">(Inactivo)</span>}
          {item.isForAdult && <span className="text-xs text-orange-600 ml-2">Solo adultos</span>}
          {item.isPerGroup ? <span className="text-xs text-blue-600 ml-2">Por grupo</span> : <span className="text-xs text-green-600 ml-2">Por persona</span>}
          {item.bookingConfig?.isExclusive && <span className="text-xs text-purple-600 ml-2">Exclusivo de grupo</span>}
          {item.bookingConfig?.requiresConfirmation && <span className="text-xs text-yellow-600 ml-2">Requiere confirmación</span>}
        </div>
        <div className="text-xs text-gray-700 mb-1">{item.description}</div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-1">
          <span>💶 Precio: €{item.price}</span>
          <span>👥 Capacidad: {item.bookingConfig?.maxCapacity || '-'} personas</span>
          <span>⏱️ Duración: {item.bookingConfig?.duration || '-'} min</span>
        </div>
        {bookingLimits && (
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-1">
            <span>Anticipación mínima: {bookingLimits.minAdvanceHours}h</span>
            <span>Anticipación máxima: {bookingLimits.maxAdvanceDays} días</span>
            <span>{bookingLimits.sameDayBooking ? 'Permite reserva el mismo día' : 'No permite reserva el mismo día'}</span>
            <span>{bookingLimits.lastMinuteBooking ? 'Permite última hora' : 'No permite última hora'}</span>
          </div>
        )}
        <div className="text-xs text-gray-600 mb-1">
          <span className="font-medium">Horarios configurados:</span>
          {item.timeSlots?.weeklySchedule
            ? (
              <ul className="ml-2 list-disc">
                {Object.entries(item.timeSlots.weeklySchedule).map(([day, sched]: any) => (
                  <li key={day}>
                    <span className="font-medium">{['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][+day]}:</span> {sched.isAvailable && sched.slots.length > 0
                      ? sched.slots.map((slot: any, idx: number) => (
                          <span key={idx} className="inline-block mr-2">{slot.startTime}-{slot.endTime} <span className="text-gray-400">({slot.maxBookingsPerSlot} reservas)</span></span>
                        ))
                      : <span className="text-gray-400">No disponible</span>}
                  </li>
                ))}
              </ul>
            ) : <span className="ml-2 text-gray-400">No configurado</span>}
        </div>
        {validation.conflicts.length > 0 && (
          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <div className="font-medium mb-1">Conflictos con el horario del negocio:</div>
            <ul className="list-disc ml-4">
              {validation.conflicts.map((conf, i) => (
                <li key={i}>
                  {capitalizeFirst(conf.dayName)}: {conf.reason === 'SHOP_CLOSED' ? 'Negocio cerrado' : 'Fuera del horario del negocio'}
                  {conf.itemSlots.length > 0 && ': '}
                  {conf.itemSlots.map((slot, idx) => (
                    <span key={idx}>{slot.startTime}-{slot.endTime}{idx < conf.itemSlots.length-1 ? ', ' : ''}</span>
                  ))}
                  {conf.shopHours && (
                    <span className="ml-2 text-gray-500">(Horario negocio: {conf.shopHours})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderExtraSummary = (extra: typeof bundleExtras[0]) => {
    const requiredItem = extra.requiredItemId && !bundleItems.some(i => i.id === extra.requiredItemId);
    const requiredItemName = extra.requiredItemId && bundleItems.find(i => i.id === extra.requiredItemId)?.title;
    return (
      <div key={extra.id} className="mb-2 p-2 border border-gray-100 rounded bg-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{extra.title}</span>
          {!extra.isActive && <span className="text-xs text-red-600 ml-2">(Inactivo)</span>}
          {extra.isRequired && <span className="text-xs text-blue-600 ml-2">(Obligatorio)</span>}
          {extra.isForAdult && <span className="text-xs text-orange-600 ml-2">Solo adultos</span>}
          {extra.isPerGroup ? <span className="text-xs text-blue-600 ml-2">Por grupo</span> : <span className="text-xs text-green-600 ml-2">Por persona</span>}
        </div>
        <div className="text-xs text-gray-700 mb-1">{extra.description}</div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-1">
          <span>💶 Precio: €{extra.price}</span>
          <span>Máx: {extra.maxQuantity || 10}</span>
          {typeof extra.quantity === 'number' && <span>Por defecto: {extra.quantity}</span>}
        </div>
        {extra.requiredItemId && (
          <div className="text-xs text-gray-500 mb-1">
            Requiere reservar: <span className="font-medium">{requiredItemName || extra.requiredItemId}</span>
          </div>
        )}
        {requiredItem && (
          <div className="text-xs text-red-600 mt-1">⚠️ El item requerido no está en este bundle</div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Reservar Bundle: {bundle.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Desde ${bundle.basePrice} • {bundle.items.length} items • {bundle.extras.length} extras
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6">
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-purple-800 mb-2">{bundle.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-purple-700">
                <span>⏱️ Duración: {bundle.duration} min</span>
                <span>👥 Máx: {bundle.maxCapacity} personas</span>
                {bundle.bookingSettings.allowInstantBooking ? (
                  <span>⚡ Reserva instantánea</span>
                ) : (
                  <span>✅ Requiere aprobación</span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
                <h3 className="text-base font-semibold text-blue-900 mb-2">Resumen de horarios y disponibilidad de items y extras</h3>
                <div className="mb-2">
                  <div className="font-medium text-blue-800 mb-1">Items:</div>
                  {bundleItems.map(renderItemSummary)}
                </div>
                <div>
                  <div className="font-medium text-blue-800 mb-1">Extras:</div>
                  {bundleExtras.length === 0 ? <div className="text-xs text-gray-500">No hay extras configurados</div> : bundleExtras.map(renderExtraSummary)}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Items Disponibles
                  </h3>
                  
                  <div className="space-y-3">
                    {bundleItems.map((item) => {
                      const isSelected = selectedItems.some(si => si.itemId === item.id);
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className="text-sm font-semibold text-gray-900">${item.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          
                          {isSelected ? (
                            <div className="space-y-3">
                              {selectedItems.map((selectedItem, index) => {
                                if (selectedItem.itemId !== item.id) return null;
                                return (
                                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-blue-900">Configuración</span>
                                      <Button
                                        onClick={() => handleRemoveItem(index)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-blue-700 mb-1">
                                          Fecha
                                        </label>
                                        <Input
                                          type="date"
                                          value={selectedItem.date}
                                          min={formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                                          onChange={(e) => handleUpdateItem(index, { date: e.target.value })}
                                          className="text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-blue-700 mb-1">
                                          Personas
                                        </label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={item.bookingConfig?.maxCapacity || 10}
                                          value={selectedItem.numberOfPeople}
                                          onChange={(e) => handleUpdateItem(index, { numberOfPeople: parseInt(e.target.value) || 1 })}
                                          className="text-xs"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="mt-2">
                                      <label className="block text-xs font-medium text-blue-700 mb-1">
                                        Horario
                                      </label>
                                      {(() => {
                                        const slots = getAvailableSlotsForItem(
                                          selectedItem.itemId,
                                          selectedItem.date,
                                          bundleItems,
                                          allShops
                                        )
                                          .filter(s => s.availability.isAvailable)
                                          .map(s => s.timeSlot);
                                        return slots.length === 0 ? (
                                          <div className="text-xs text-gray-500 py-2">No hay horarios disponibles para esta fecha</div>
                                        ) : (
                                          <select
                                            className="w-full border rounded-md p-2 text-xs"
                                            value={`${selectedItem.timeSlot.startTime}-${selectedItem.timeSlot.endTime}`}
                                            onChange={e => {
                                              const val = e.target.value;
                                              const slot = slots.find(s => `${s.startTime}-${s.endTime}` === val);
                                              handleUpdateItem(index, { timeSlot: slot ? slot : { startTime: '', endTime: '' } });
                                            }}
                                          >
                                            <option value="">Selecciona un horario...</option>
                                            {slots.map((slot, idx) => (
                                              <option
                                                key={idx}
                                                value={`${slot.startTime}-${slot.endTime}`}
                                              >
                                                {`${slot.startTime} - ${slot.endTime}`}
                                              </option>
                                            ))}
                                          </select>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAddItem(item.id)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Item
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Extras Disponibles
                  </h3>
                  
                  <div className="space-y-3">
                    {bundleExtras.map((extra) => {
                      const quantity = getExtraQuantity(extra.id);
                      return (
                        <div key={extra.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{extra.title}</h4>
                            <span className="text-sm font-semibold text-gray-900">${extra.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{extra.description}</p>
                          
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => handleUpdateExtra(extra.id, Math.max(0, quantity - 1))}
                              variant="outline"
                              size="sm"
                              disabled={quantity === 0}
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                              {quantity}
                            </span>
                            <Button
                              onClick={() => handleUpdateExtra(extra.id, quantity + 1)}
                              variant="outline"
                              size="sm"
                              disabled={quantity >= (extra.maxQuantity || 10)}
                            >
                              +
                            </Button>
                            {extra.maxQuantity && (
                              <span className="text-xs text-gray-500">
                                Máx: {extra.maxQuantity}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Información del Cliente
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nombre del cliente *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre completo"
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                    />
                    
                    <Input
                      label="Teléfono"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+34 600 123 456"
                    />
                    
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen de la reserva:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items seleccionados:</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extras seleccionados:</span>
                      <span className="font-medium">{selectedExtras.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total personas:</span>
                      <span className="font-medium">
                        {selectedItems.reduce((sum, item) => sum + item.numberOfPeople, 0)}
                      </span>
                    </div>
                  </div>
                </div>

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
                      selectedItems.length === 0 || 
                      !customerName.trim() || 
                      isCreatingReservation
                    }
                    loading={isCreatingReservation}
                  >
                    Crear Reserva
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 