import React, { useState } from 'react';
import { Package, ListTodo, Plus, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { BundleReservationManager } from '../features/reservations/components/BundleReservationManager';
import { ItemReservationManager } from '../features/reservations/components/ItemReservationManager';
import { useShopState } from '../hooks/useShopState';
import { useEntitiesState } from '../hooks/useEntitiesState';
import type { Bundle, Item } from '../types';

type ReservationType = 'bundle' | 'item';
type SelectorStep = 'type' | 'selection';

interface ReservationTypeSelectorProps {
  onClose: () => void;
  onReservationCreated?: (reservationId: string) => void;
}

export const ReservationTypeSelector: React.FC<ReservationTypeSelectorProps> = ({
  onClose,
  onReservationCreated
}) => {
  const { selectedShop, shopBundles, shopItems } = useShopState();
  const { getBundleWithContent } = useEntitiesState();
  
  const [currentStep, setCurrentStep] = useState<SelectorStep>('type');
  const [selectedType, setSelectedType] = useState<ReservationType | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const handleTypeSelection = (type: ReservationType) => {
    setSelectedType(type);
    setCurrentStep('selection');
  };

  const handleBundleSelection = (bundle: Bundle) => {
    setSelectedBundle(getBundleWithContent(bundle.id));
    setShowReservationModal(true);
  };

  const handleItemSelection = (item: Item) => {
    setSelectedItem(item);
    setShowReservationModal(true);
  };

  const handleReservationComplete = (reservationId: string) => {
    setShowReservationModal(false);
    onReservationCreated?.(reservationId);
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 'selection') {
      setCurrentStep('type');
      setSelectedType(null);
    }
  };

  // Modal de reserva actual
  if (showReservationModal) {
    if (selectedBundle) {
      return (
        <BundleReservationManager
          bundle={selectedBundle}
          onReservationCreated={handleReservationComplete}
          onClose={() => setShowReservationModal(false)}
        />
      );
    }
    
    if (selectedItem) {
      return (
        <ItemReservationManager
          item={selectedItem}
          onReservationCreated={handleReservationComplete}
          onClose={() => setShowReservationModal(false)}
        />
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Plus className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">Nueva Reserva</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Contenido principal */}
          {currentStep === 'type' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Nueva Reserva - {selectedShop.name}
                </h2>
                <p className="text-gray-600">
                  ¿Qué tipo de reserva deseas crear?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opción Bundle */}
                <div className="cursor-pointer" onClick={() => handleTypeSelection('bundle')}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Reserva de Bundle
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Paquete completo con múltiples servicios e items
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>{shopBundles.length}</strong> bundles disponibles
                        </p>
                      </div>
                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Seleccionar Bundle
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Opción Item */}
                <div className="cursor-pointer" onClick={() => handleTypeSelection('item')}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListTodo className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Reserva Individual
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Reserva un servicio específico por separado
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>{shopItems.length}</strong> items disponibles
                        </p>
                      </div>
                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Seleccionar Item
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'selection' && selectedType === 'bundle' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Seleccionar Bundle - {selectedShop.name}
                  </h2>
                  <p className="text-gray-600">
                    Elige el paquete que deseas reservar
                  </p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  ← Volver
                </Button>
              </div>

              {shopBundles.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay bundles disponibles
                  </h3>
                  <p className="text-gray-500">
                    Este shop no tiene bundles configurados para reservar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {shopBundles.map((bundle) => (
                    <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {bundle.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {bundle.description}
                            </p>
                          </div>
                          {bundle.isFeatured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              Destacado
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Precio base:</span>
                            <span className="font-semibold text-gray-900">€{bundle.basePrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Items incluidos:</span>
                            <span className="text-gray-700">{bundle.items.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Capacidad máxima:</span>
                            <span className="text-gray-700">{bundle.maxCapacity} personas</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleBundleSelection(bundle)}
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Reservar Bundle
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'selection' && selectedType === 'item' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Seleccionar Item - {selectedShop.name}
                  </h2>
                  <p className="text-gray-600">
                    Elige el servicio individual que deseas reservar
                  </p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  ← Volver
                </Button>
              </div>

              {shopItems.length === 0 ? (
                <div className="text-center py-12">
                  <ListTodo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay items disponibles
                  </h3>
                  <p className="text-gray-500">
                    Este shop no tiene items configurados para reservar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shopItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {item.description}
                            </p>
                          </div>
                          {item.isPerGroup && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              Por Grupo
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Precio:</span>
                            <span className="font-semibold text-gray-900">€{item.price}</span>
                          </div>
                          {item.bookingConfig && (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Capacidad:</span>
                                <span className="text-gray-700">{item.bookingConfig.maxCapacity} personas</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Duración:</span>
                                <span className="text-gray-700">{item.bookingConfig.duration} min</span>
                              </div>
                            </>
                          )}
                        </div>

                        <Button
                          onClick={() => handleItemSelection(item)}
                          className="w-full"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Reservar Item
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 