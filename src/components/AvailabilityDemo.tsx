import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle, Settings, BarChart3 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { useAvailability, useRealtimeValidation, useAvailabilitySuggestions } from '../hooks/useAvailability';
import { mockBundles, mockShops } from '../mockData';
import type { AvailabilityCheck } from '../types';

export const AvailabilityDemo: React.FC = () => {
  // Estados para el formulario de demostración
  const [selectedShopId, setSelectedShopId] = useState(mockShops[0]?.id || '');
  const [selectedBundleId, setSelectedBundleId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  
  // Estados para items seleccionados (demo de reserva completa)
  const [selectedItems, setSelectedItems] = useState<{
    itemId: string;
    timeSlotId: string;
    numberOfPeople: number;
    date: string;
  }[]>([]);

  // Hook principal del motor de disponibilidad
  const { 
    checkAvailability, 
    validateBooking, 
    getAvailableSlots, 
    getResourceStats,
    validateDependencies,
    clearCache
  } = useAvailability();

  // Validación en tiempo real
  const realtimeValidation = useRealtimeValidation(selectedBundleId, selectedItems);

  // Bundles filtrados por shop
  const availableBundles = useMemo(() => {
    return mockBundles.filter(bundle => bundle.shopId === selectedShopId);
  }, [selectedShopId]);

  // Bundle seleccionado
  const selectedBundle = useMemo(() => {
    return availableBundles.find(b => b.id === selectedBundleId);
  }, [availableBundles, selectedBundleId]);

  // Estadísticas de recursos del shop
  const resourceStats = useMemo(() => {
    if (!selectedShopId) return [];
    return getResourceStats(selectedShopId, selectedDate);
  }, [selectedShopId, selectedDate]);

  // Funciones memoizadas para evitar re-renders
  const addItem = useCallback((itemId: string, timeSlotId: string) => {
    setSelectedItems(prev => [...prev, {
      itemId,
      timeSlotId,
      numberOfPeople,
      date: selectedDate
    }]);
  }, [numberOfPeople, selectedDate]);

  const removeItem = useCallback((index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Slots disponibles memoizados para evitar recálculos constantes
  const availableSlotsForBundle = useMemo(() => {
    if (!selectedBundle) return {};
    
    const slotsMap: Record<string, {
      slot: { id: string; startTime: string; endTime: string; maxBookings: number };
      isAvailable: boolean;
      conflicts?: { message: string; type: string }[];
    }[]> = {};
    
    selectedBundle.items.forEach(item => {
      slotsMap[item.id] = getAvailableSlots(item.id, selectedDate, selectedBundleId);
    });
    return slotsMap;
  }, [selectedBundle, selectedDate, selectedBundleId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Motor de Disponibilidad</h1>
          <p className="text-gray-600">Demostración del Checkpoint 2 - Sistema de validación avanzado</p>
        </div>
        <Button onClick={clearCache} variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Limpiar Caché
        </Button>
      </div>

      {/* Controles principales */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Prueba
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Negocio</label>
            <Select
              value={selectedShopId}
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                setSelectedBundleId('');
                setSelectedItems([]);
              }}
              options={mockShops.map(shop => ({ value: shop.id, label: shop.name }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bundle</label>
            <Select
              value={selectedBundleId}
              onChange={(e) => {
                setSelectedBundleId(e.target.value);
                setSelectedItems([]);
              }}
              options={[
                { value: '', label: 'Seleccionar bundle...' },
                ...availableBundles.map(bundle => ({ value: bundle.id, label: bundle.name }))
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personas</label>
            <Input
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
          </div>
        </div>
      </Card>

      {/* Estadísticas de recursos */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Utilización de Recursos - {selectedDate}
        </h2>
        
        {resourceStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceStats.map(stat => (
              <div key={stat.resourceId} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{stat.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    stat.utilization < 0.5 ? 'bg-green-100 text-green-800' :
                    stat.utilization < 0.8 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(stat.utilization * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stat.utilization < 0.5 ? 'bg-green-500' :
                      stat.utilization < 0.8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stat.utilization * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{stat.conflicts} conflictos</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Selecciona un negocio para ver las estadísticas de recursos</p>
        )}
      </Card>

      {/* Items disponibles */}
      {selectedBundle && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Items Disponibles - {selectedBundle.name}
          </h2>
          
          <div className="space-y-4">
            {selectedBundle.items.map(item => {
              const availableSlots = availableSlotsForBundle[item.id] || [];
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Máx. {item.maxCapacity} personas
                        </span>
                        <span>${item.price} por persona</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {availableSlots.map(({ slot, isAvailable, conflicts }) => {
                      return (
                        <div 
                          key={slot.id}
                          className={`p-3 rounded border ${
                            isAvailable 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Clock className="h-3 w-3" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {isAvailable ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            Capacidad máxima: {slot.maxBookings} reservas
                          </div>

                          {conflicts && conflicts.length > 0 && (
                            <div className="mb-2">
                              {conflicts.slice(0, 2).map((conflict, idx) => (
                                <div key={idx} className="text-xs text-red-600 flex items-start gap-1">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{conflict.message}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant={isAvailable ? "primary" : "outline"}
                            disabled={!isAvailable}
                            onClick={() => addItem(item.id, slot.id)}
                            className="w-full"
                          >
                            {isAvailable ? 'Agregar' : 'No disponible'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {availableSlots.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay horarios disponibles para este item en la fecha seleccionada
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Resumen de selección y validación */}
      {selectedItems.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Validación de Reserva en Tiempo Real
          </h2>

          {/* Items seleccionados */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Items Seleccionados:</h3>
            <div className="space-y-2">
              {selectedItems.map((selectedItem, index) => {
                const item = selectedBundle?.items.find(i => i.id === selectedItem.itemId);
                const timeSlot = item?.availableTimeSlots.find(s => s.id === selectedItem.timeSlotId);
                
                return (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium">{item?.name}</span>
                      <span className="text-gray-600 ml-2">
                        {timeSlot?.startTime} - {timeSlot?.endTime}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({selectedItem.numberOfPeople} personas)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(index)}
                    >
                      Remover
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resultado de validación */}
          <div className={`p-4 rounded-lg border ${
            realtimeValidation.isValid 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {realtimeValidation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {realtimeValidation.isValid ? 'Reserva Válida' : 'Conflictos Detectados'}
              </span>
            </div>

            {/* Información de la reserva */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Precio Total:</span>
                <div className="font-semibold">
                  ${(realtimeValidation.validation?.totalPrice || 0).toFixed(2)}
                  {realtimeValidation.validation?.discountApplied && (
                    <span className="text-green-600 text-sm ml-1">
                      (-{Math.round((realtimeValidation.validation.discountApplied || 0) * 100)}% descuento)
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Horario:</span>
                <div className="font-semibold">
                  {realtimeValidation.validation?.timeline?.earliest || '--'} - {realtimeValidation.validation?.timeline?.latest || '--'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duración Total:</span>
                <div className="font-semibold">
                  {realtimeValidation.validation?.timeline?.latest && realtimeValidation.validation?.timeline?.earliest
                    ? `${Math.round(
                        (new Date(`2000-01-01 ${realtimeValidation.validation.timeline.latest}`).getTime() - 
                         new Date(`2000-01-01 ${realtimeValidation.validation.timeline.earliest}`).getTime()) / 60000
                      )} minutos`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Conflictos */}
            {(realtimeValidation.allConflicts || []).length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Conflictos encontrados:</h4>
                <div className="space-y-1">
                  {(realtimeValidation.allConflicts || []).map((conflict: { message: string }, index: number) => (
                    <div key={index} className="text-sm text-red-700 flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{conflict.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="mt-4">
              <Button
                disabled={!realtimeValidation.isValid}
                className="w-full"
              >
                {realtimeValidation.isValid ? 'Confirmar Reserva' : 'Resolver Conflictos'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 