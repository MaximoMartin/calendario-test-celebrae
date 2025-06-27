import React, { useState, useMemo } from 'react';
import { Package, Plus, Minus, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import type { Bundle, CreateReservaBundleRequest, BundleAvailabilityValidation } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { 
  validateBundleReservation, 
  useCreateBundleReservation 
} from '../bundleValidation';
import { formatDate } from '../../../utils/dateHelpers';

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
  // Estados principales
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para UI
  const [activeTab, setActiveTab] = useState<'items' | 'extras' | 'review'>('items');

  // Validación en tiempo real
  const currentValidation = useMemo((): BundleAvailabilityValidation | null => {
    if (selectedItems.length === 0 || !customerName.trim()) return null;
    
    const request: CreateReservaBundleRequest = {
      bundleId: bundle.id,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      },
      itemReservations: selectedItems,
      selectedExtras,
      notes: notes || undefined
    };

    return validateBundleReservation(request);
  }, [bundle.id, selectedItems, selectedExtras, customerName, customerEmail, customerPhone, notes]);

  // Fecha mínima (mañana)
  const minDate = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  // Agregar item seleccionado
  const handleAddItem = (itemId: string) => {
    const newItem: SelectedItem = {
      itemId,
      date: minDate,
      timeSlot: { startTime: '09:00', endTime: '12:00' },
      numberOfPeople: 1
    };
    setSelectedItems(prev => [...prev, newItem]);
  };

  // Remover item seleccionado
  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Actualizar item seleccionado
  const handleUpdateItem = (index: number, updates: Partial<SelectedItem>) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  // Agregar/actualizar extra
  const handleUpdateExtra = (extraId: string, quantity: number) => {
    if (quantity <= 0) {
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

  // Crear reserva
  const createBundleReservation = useCreateBundleReservation();

  const handleCreateReservation = async () => {
    if (!currentValidation?.isValid) return;

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
        notes: notes || undefined
      };

      console.log('🚀 Creando reserva de bundle con request:', request);
      
      const result = await createBundleReservation(request);
      
      if (result.success && result.reservationId) {
        setSuccessMessage(`¡Reserva de bundle creada exitosamente! ID: ${result.reservationId}`);
        onReservationCreated?.(result.reservationId);
        setTimeout(() => {
          onClose?.();
        }, 3000);
      } else {
        setErrorMessage(result.errors && result.errors.length > 0 ? result.errors.join(', ') : 'No se pudo crear la reserva. Verifica los datos e inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error creando reserva de bundle:', error);
      setErrorMessage('Error interno al crear la reserva');
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // Obtener información del item
  const getItemInfo = (itemId: string) => {
    return bundle.items.find(item => item.id === itemId);
  };

  // Obtener información del extra
  const getExtraInfo = (extraId: string) => {
    return bundle.extras.find(extra => extra.id === extraId);
  };

  // Obtener cantidad de extra seleccionado
  const getExtraQuantity = (extraId: string) => {
    return selectedExtras.find(e => e.extraId === extraId)?.quantity || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          {/* Header */}
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
            {/* Información del bundle */}
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

            {/* Tabs de navegación */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('items')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'items'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1. Seleccionar Items ({selectedItems.length})
              </button>
              <button
                onClick={() => setActiveTab('extras')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'extras'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2. Agregar Extras ({selectedExtras.length})
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'review'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3. Confirmar Reserva
              </button>
            </div>

            {/* Contenido según tab activo */}
            {activeTab === 'items' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Items Disponibles en el Bundle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bundle.items.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              {/* 🎯 CHECKPOINT 4: INDICADOR DE RESERVA GRUPAL */}
                              {item.isPerGroup && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                  Por Grupo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>
                                ${item.price}
                                {/* 🎯 CHECKPOINT 4: MOSTRAR LÓGICA DE PRECIOS */}
                                {item.isPerGroup ? (
                                  <span className="text-purple-600 font-medium ml-1">por grupo</span>
                                ) : (
                                  <span className="text-gray-500 ml-1">c/u</span>
                                )}
                              </span>
                              <span>
                                {item.isPerGroup ? (
                                  <>Grupo: hasta {item.bookingConfig?.groupCapacity || item.size} personas</>
                                ) : (
                                  <>Máx: {item.bookingConfig?.maxCapacity || item.size} personas</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(item.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Item
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items seleccionados */}
                {selectedItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Items Seleccionados ({selectedItems.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedItems.map((selectedItem, index) => {
                        const item = getItemInfo(selectedItem.itemId);
                        return (
                          <div key={index} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">{item?.title}</h4>
                                  {/* 🎯 CHECKPOINT 4: INDICADOR DE RESERVA GRUPAL */}
                                  {item?.isPerGroup && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                      Por Grupo
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  ${item?.price} 
                                  {/* 🎯 CHECKPOINT 4: MOSTRAR LÓGICA DE PRECIOS */}
                                  {item?.isPerGroup ? (
                                    <span className="text-purple-600 font-medium"> por grupo completo</span>
                                  ) : (
                                    <span className="text-gray-500"> por persona</span>
                                  )}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Fecha
                                </label>
                                <Input
                                  type="date"
                                  value={selectedItem.date}
                                  min={minDate}
                                  onChange={(e) => handleUpdateItem(index, { date: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Horario
                                </label>
                                <select
                                  value={`${selectedItem.timeSlot.startTime}-${selectedItem.timeSlot.endTime}`}
                                  onChange={(e) => {
                                    const [startTime, endTime] = e.target.value.split('-');
                                    handleUpdateItem(index, { timeSlot: { startTime, endTime } });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                  <option value="09:00-12:00">09:00 - 12:00</option>
                                  <option value="14:00-17:00">14:00 - 17:00</option>
                                  <option value="10:00-11:30">10:00 - 11:30</option>
                                  <option value="15:00-16:30">15:00 - 16:30</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Personas
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={item?.bookingConfig?.maxCapacity || item?.size}
                                  value={selectedItem.numberOfPeople}
                                  onChange={(e) => handleUpdateItem(index, { numberOfPeople: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'extras' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Extras Disponibles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bundle.extras.map((extra) => {
                      const quantity = getExtraQuantity(extra.id);
                      return (
                        <div
                          key={extra.id}
                          className={`border rounded-lg p-4 ${quantity > 0 ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}
                        >
                                                      <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{extra.title}</h4>
                                {/* 🎯 CHECKPOINT 4: INDICADOR DE EXTRA GRUPAL */}
                                {extra.isPerGroup && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                    Por Grupo
                                  </span>
                                )}
                                {/* 🎯 CHECKPOINT 4: INDICADOR DE RELACIÓN CONDICIONAL */}
                                {extra.requiredItemId && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                    Requiere Item
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>
                                  ${extra.price}
                                  {/* 🎯 CHECKPOINT 4: MOSTRAR LÓGICA DE PRECIOS EXTRAS */}
                                  {extra.isPerGroup ? (
                                    <span className="text-purple-600 font-medium ml-1">por grupo</span>
                                  ) : (
                                    <span className="text-gray-500 ml-1">c/u</span>
                                  )}
                                </span>
                                {extra.maxQuantity && (
                                  <span>Máx: {extra.maxQuantity}</span>
                                )}
                                {extra.isRequired && (
                                  <span className="text-orange-600 font-medium">Recomendado</span>
                                )}
                              </div>
                              {/* 🎯 CHECKPOINT 4: MOSTRAR MENSAJE PARA RELACIONES CONDICIONALES */}
                              {extra.requiredItemId && (
                                <p className="text-xs text-orange-600 mt-2">
                                  ⚠️ Este extra solo está disponible si reservas el item requerido
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* 🎯 CHECKPOINT 4: LÓGICA DIFERENTE PARA EXTRAS GRUPALES */}
                          {extra.isPerGroup ? (
                            <div className="flex items-center space-x-3">
                              <Button
                                variant={quantity > 0 ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handleUpdateExtra(extra.id, quantity > 0 ? 0 : 1)}
                                className={quantity > 0 ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                              >
                                {quantity > 0 ? (
                                  <>✓ Incluido en Grupo</>
                                ) : (
                                  <>+ Agregar al Grupo</>
                                )}
                              </Button>
                              <span className="text-sm text-gray-600 ml-2">
                                Total: ${quantity > 0 ? extra.price : 0}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateExtra(extra.id, Math.max(0, quantity - 1))}
                                disabled={quantity <= 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateExtra(extra.id, quantity + 1)}
                                disabled={quantity >= (extra.maxQuantity || 10)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <span className="text-sm text-gray-600 ml-2">
                                Total: ${extra.price * quantity}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {/* Información del cliente */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo *
                      </label>
                      <Input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre del cliente"
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
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Información adicional para la reserva..."
                    />
                  </div>
                </div>

                {/* Resumen de la reserva */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Resumen de la Reserva</h4>
                  
                  {/* Items seleccionados */}
                  <div className="space-y-2 mb-4">
                    <h5 className="text-sm font-medium text-gray-700">Items ({selectedItems.length}):</h5>
                    {selectedItems.map((selectedItem, index) => {
                      const item = getItemInfo(selectedItem.itemId);
                      return (
                        <div key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>
                            • {item?.title} - {selectedItem.date} {selectedItem.timeSlot.startTime} 
                            ({selectedItem.numberOfPeople} personas)
                            {/* 🎯 CHECKPOINT 4: INDICADOR DE PRECIO GRUPAL EN RESUMEN */}
                            {item?.isPerGroup && (
                              <span className="text-purple-600 font-medium ml-1">[Por Grupo]</span>
                            )}
                          </span>
                          <span className="font-medium">
                            {/* 🎯 CHECKPOINT 4: CÁLCULO CORRECTO PARA ITEMS GRUPALES */}
                            ${item?.isPerGroup ? (item.price || 0) : ((item?.price || 0) * selectedItem.numberOfPeople)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Extras seleccionados */}
                  {selectedExtras.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium text-gray-700">Extras ({selectedExtras.length}):</h5>
                      {selectedExtras.map((selectedExtra) => {
                        const extra = getExtraInfo(selectedExtra.extraId);
                        return (
                          <div key={selectedExtra.extraId} className="text-sm text-gray-600 flex justify-between">
                            <span>
                              • {extra?.title} 
                              {/* 🎯 CHECKPOINT 4: MOSTRAR INFORMACIÓN DIFERENTE PARA EXTRAS GRUPALES */}
                              {extra?.isPerGroup ? (
                                <span className="text-purple-600 font-medium ml-1">[Por Grupo]</span>
                              ) : (
                                <span> x{selectedExtra.quantity}</span>
                              )}
                            </span>
                            <span className="font-medium">
                              {/* 🎯 CHECKPOINT 4: CÁLCULO CORRECTO PARA EXTRAS GRUPALES */}
                              ${extra?.isPerGroup ? (extra.price || 0) : ((extra?.price || 0) * selectedExtra.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                      <span>Total:</span>
                      <span>${currentValidation?.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validación en tiempo real */}
            {currentValidation && (
              <div className="space-y-2 mt-6">
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
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-6">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-6">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Botones de navegación y acción */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex space-x-3">
                {activeTab !== 'items' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (activeTab === 'extras') setActiveTab('items');
                      if (activeTab === 'review') setActiveTab('extras');
                    }}
                  >
                    Anterior
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreatingReservation}
                >
                  Cancelar
                </Button>
                
                {activeTab !== 'review' ? (
                  <Button
                    onClick={() => {
                      if (activeTab === 'items') setActiveTab('extras');
                      if (activeTab === 'extras') setActiveTab('review');
                    }}
                    disabled={activeTab === 'items' && selectedItems.length === 0}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateReservation}
                    disabled={
                      !currentValidation?.isValid || 
                      !customerName.trim() || 
                      isCreatingReservation
                    }
                    loading={isCreatingReservation}
                  >
                    Crear Reserva Bundle
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 