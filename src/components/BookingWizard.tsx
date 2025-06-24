import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAvailability, useRealtimeValidation } from '../hooks/useAvailability';
import { mockBundles, mockShops } from '../mockData';
import type { Bundle, BookingFormData } from '../types';

interface BookingWizardProps {
  initialShopId?: string;
  initialBundleId?: string;
  onSubmit: (bookingData: BookingFormData) => void;
  onCancel: () => void;
}

interface SelectedItem {
  itemId: string;
  timeSlotId: string;
  numberOfPeople: number;
  date: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

type WizardStep = 'shop' | 'bundle' | 'items' | 'customer' | 'summary';

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialShopId = '',
  initialBundleId = '',
  onSubmit,
  onCancel
}) => {
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('shop');
  const [selectedShopId, setSelectedShopId] = useState(initialShopId);
  const [selectedBundleId, setSelectedBundleId] = useState(initialBundleId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: ''
  });

  // Hooks
  const { getAvailableSlots } = useAvailability();
  const realtimeValidation = useRealtimeValidation(selectedBundleId, selectedItems);

  // Datos derivados
  const selectedShop = useMemo(() => 
    mockShops.find(shop => shop.id === selectedShopId),
    [selectedShopId]
  );

  const availableBundles = useMemo(() => 
    mockBundles.filter(bundle => bundle.shopId === selectedShopId),
    [selectedShopId]
  );

  const selectedBundle = useMemo(() => 
    availableBundles.find(bundle => bundle.id === selectedBundleId),
    [availableBundles, selectedBundleId]
  );

  // Navegación del wizard
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'shop':
        return !!selectedShopId;
      case 'bundle':
        return !!selectedBundleId;
      case 'items':
        return selectedItems.length >= (selectedBundle?.minItemsRequired || 1) && 
               realtimeValidation.isValid;
      case 'customer':
        return customerData.name && customerData.email && customerData.phone;
      case 'summary':
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedShopId, selectedBundleId, selectedItems, selectedBundle, realtimeValidation, customerData]);

  const stepTitles = {
    shop: 'Seleccionar Negocio',
    bundle: 'Elegir Experiencia',
    items: 'Configurar Actividades',
    customer: 'Datos del Cliente',
    summary: 'Confirmar Reserva'
  };

  // Handlers
  const handleNextStep = () => {
    const steps: WizardStep[] = ['shop', 'bundle', 'items', 'customer', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: WizardStep[] = ['shop', 'bundle', 'items', 'customer', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(shopId);
    setSelectedBundleId('');
    setSelectedItems([]);
  };

  const handleBundleSelect = (bundleId: string) => {
    setSelectedBundleId(bundleId);
    setSelectedItems([]);
  };

  const handleItemAdd = (itemId: string, timeSlotId: string, numberOfPeople: number) => {
    const newItem: SelectedItem = {
      itemId,
      timeSlotId,
      numberOfPeople,
      date: selectedDate
    };
    setSelectedItems(prev => [...prev, newItem]);
  };

  const handleItemRemove = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedBundle || !realtimeValidation.isValid) return;

    const bookingData: BookingFormData = {
      bundleId: selectedBundleId,
      shopId: selectedShopId,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      date: selectedDate,
      notes: customerData.notes || '',
      selectedItems: selectedItems,
      totalPrice: realtimeValidation.validation?.totalPrice || 0,
      timeline: realtimeValidation.validation?.timeline || { earliest: '', latest: '' }
    };

    onSubmit(bookingData);
  };

  // Renderizado por steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 'shop':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Selecciona el negocio donde deseas hacer tu reserva:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockShops.map(shop => (
                <div 
                  key={shop.id}
                  className={`cursor-pointer transition-all hover:shadow-lg rounded-lg border ${
                    selectedShopId === shop.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                  onClick={() => handleShopSelect(shop.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{shop.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'bundle':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Elige la experiencia que deseas reservar:
            </p>
            
            <div className="space-y-4">
              {availableBundles.map(bundle => (
                <div 
                  key={bundle.id}
                  className={`cursor-pointer transition-all hover:shadow-lg rounded-lg border ${
                    selectedBundleId === bundle.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                  onClick={() => handleBundleSelect(bundle.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {bundle.name}
                        </h3>
                        <p className="text-gray-600 mb-3">{bundle.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          Desde ${Math.min(...bundle.items.map(item => item.price))}
                        </div>
                        {bundle.bundleDiscount && (
                          <div className="text-sm text-green-600">
                            {Math.round(bundle.bundleDiscount * 100)}% descuento
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{bundle.items.length} actividades</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Flexible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {bundle.minItemsRequired === bundle.maxItemsAllowed 
                            ? `${bundle.minItemsRequired} obligatorias`
                            : `${bundle.minItemsRequired}-${bundle.maxItemsAllowed} actividades`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {bundle.items.slice(0, 3).map(item => (
                        <span 
                          key={item.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {item.name}
                        </span>
                      ))}
                      {bundle.items.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{bundle.items.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'items':
        return (
          <div className="space-y-6">
            {/* Configuración global */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Configuración de la Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la experiencia
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </Card>

            {/* Items seleccionados */}
            {selectedItems.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Actividades Seleccionadas</h3>
                <div className="space-y-3">
                  {selectedItems.map((selectedItem, index) => {
                    const item = selectedBundle?.items.find(i => i.id === selectedItem.itemId);
                    const timeSlot = item?.availableTimeSlots.find(s => s.id === selectedItem.timeSlotId);
                    
                    return (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item?.name}</div>
                          <div className="text-sm text-gray-600">
                            {timeSlot?.startTime} - {timeSlot?.endTime} • {selectedItem.numberOfPeople} personas
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemRemove(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Validación en tiempo real */}
                <div className={`mt-4 p-3 rounded ${realtimeValidation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {realtimeValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {realtimeValidation.isValid ? 'Selección válida' : 'Conflictos detectados'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Precio total:</span>
                      <div className="font-semibold">
                        ${(realtimeValidation.validation?.totalPrice || 0).toFixed(2)}
                        {realtimeValidation.validation?.discountApplied && (
                          <span className="text-green-600 ml-1">
                            (-{Math.round((realtimeValidation.validation.discountApplied || 0) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Horario:</span>
                      <div className="font-semibold">
                        {realtimeValidation.validation?.timeline?.earliest || '--'} - {realtimeValidation.validation?.timeline?.latest || '--'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <div className="font-semibold">
                        {selectedItems.length} / {selectedBundle?.minItemsRequired || 1}-{selectedBundle?.maxItemsAllowed || 1}
                      </div>
                    </div>
                  </div>

                  {(realtimeValidation.allConflicts || []).length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm text-red-700 space-y-1">
                        {(realtimeValidation.allConflicts || []).slice(0, 3).map((conflict: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{conflict?.message || 'Error desconocido'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Selección de actividades */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Actividades Disponibles</h3>
              
              <div className="space-y-4">
                {selectedBundle?.items.map(item => {
                  const availableSlots = getAvailableSlots(item.id, selectedDate, selectedBundle.id);
                  const isAlreadySelected = selectedItems.some(si => si.itemId === item.id);
                  
                  return (
                    <div key={item.id} className={`border rounded-lg p-4 ${isAlreadySelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Máx. {item.maxCapacity} personas
                            </span>
                            <span>${item.price} por persona</span>
                          </div>
                        </div>
                        {isAlreadySelected && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Seleccionado
                          </span>
                        )}
                      </div>

                      {!isAlreadySelected && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {availableSlots.slice(0, 6).map(({ slot, isAvailable }) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              size="sm"
                              disabled={!isAvailable}
                              onClick={() => handleItemAdd(item.id, slot.id, 2)}
                              className={`text-xs ${isAvailable ? 'hover:bg-blue-50' : 'opacity-50'}`}
                            >
                              {slot.startTime} - {slot.endTime}
                            </Button>
                          ))}
                        </div>
                      )}

                      {availableSlots.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No hay horarios disponibles para esta fecha
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      
      case 'customer':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <Input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="+54 9 11 1234-5678"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={customerData.notes || ''}
                  onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                  placeholder="Alguna solicitud especial, restricciones alimentarias, etc."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </Card>
          </div>
        );
      
      case 'summary':
        return (
          <div className="space-y-6">
            {/* Resumen de la experiencia */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Reserva</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">{selectedBundle?.name}</h4>
                <p className="text-gray-600 text-sm">{selectedBundle?.description}</p>
              </div>

              <div className="space-y-3">
                {selectedItems.map((selectedItem, index) => {
                  const item = selectedBundle?.items.find(i => i.id === selectedItem.itemId);
                  const timeSlot = item?.availableTimeSlots.find(s => s.id === selectedItem.timeSlotId);
                  const itemPrice = (item?.price || 0) * selectedItem.numberOfPeople * (timeSlot?.priceMultiplier || 1);
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">{item?.name}</div>
                        <div className="text-sm text-gray-600">
                          {selectedItem.date} • {timeSlot?.startTime} - {timeSlot?.endTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedItem.numberOfPeople} personas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${itemPrice.toFixed(2)}</div>
                        {timeSlot?.priceMultiplier && timeSlot.priceMultiplier !== 1 && (
                          <div className="text-xs text-gray-500">
                            {timeSlot.priceMultiplier > 1 ? `+${Math.round((timeSlot.priceMultiplier - 1) * 100)}%` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <div>
                    ${realtimeValidation.validation.totalPrice.toFixed(2)}
                    {realtimeValidation.validation.discountApplied && (
                      <span className="text-sm text-green-600 font-normal ml-2">
                        (Descuento {Math.round(realtimeValidation.validation.discountApplied * 100)}% aplicado)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Información del cliente */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <div className="font-medium">{customerData.name}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <div className="font-medium">{customerData.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <div className="font-medium">{customerData.phone}</div>
                </div>
              </div>
              
              {customerData.notes && (
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Notas:</span>
                  <div className="font-medium mt-1">{customerData.notes}</div>
                </div>
              )}
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline de la Experiencia</h3>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Inicio: {realtimeValidation.validation.timeline.earliest}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Fin: {realtimeValidation.validation.timeline.latest}</span>
                </div>
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {stepTitles[currentStep]}
            </h2>
            <p className="text-gray-600 mt-1">
              Paso {['shop', 'bundle', 'items', 'customer', 'summary'].indexOf(currentStep) + 1} de 5
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ 
              width: `${((['shop', 'bundle', 'items', 'customer', 'summary'].indexOf(currentStep) + 1) / 5) * 100}%` 
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 'shop'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === 'summary' ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar Reserva
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 