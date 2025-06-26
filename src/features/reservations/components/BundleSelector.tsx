import React, { useState } from 'react';
import { Package, Calendar, DollarSign, Users, Star } from 'lucide-react';
import type { Bundle } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { BundleReservationManager } from '../components/BundleReservationManager';
import { bundles } from '../../../mockData/entitiesData';

interface BundleSelectorProps {
  shopId?: string; // opcional, si queremos filtrar por shop
  onReservationCreated?: (reservationId: string) => void;
}

export const BundleSelector: React.FC<BundleSelectorProps> = ({
  shopId,
  onReservationCreated
}) => {
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showReservationManager, setShowReservationManager] = useState(false);

  // Filtrar bundles según el shop si se proporciona
  const availableBundles = shopId 
    ? bundles.filter(bundle => bundle.shopId === shopId && bundle.isActive)
    : bundles.filter(bundle => bundle.isActive);

  const handleSelectBundle = (bundle: Bundle) => {
    console.log(`🎯 Seleccionado bundle: ${bundle.name}`);
    setSelectedBundle(bundle);
    setShowReservationManager(true);
  };

  const handleCloseReservationManager = () => {
    setShowReservationManager(false);
    setSelectedBundle(null);
  };

  const handleReservationCreated = (reservationId: string) => {
    console.log(`✅ Reserva de bundle creada con éxito: ${reservationId}`);
    onReservationCreated?.(reservationId);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Reservas por Bundle Completo
          </h2>
          <p className="text-gray-600">
            Selecciona un bundle para reservar múltiples items y agregar extras opcionales.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {availableBundles.map((bundle) => (
            <Card key={bundle.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                {/* Header del bundle */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bundle.name}
                      </h3>
                      {bundle.isFeatured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {bundle.shortDescription || bundle.description}
                    </p>
                  </div>
                </div>

                {/* Información del bundle */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-gray-900">Desde ${bundle.basePrice}</span>
                    <span>+ items seleccionados</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Máximo {bundle.maxCapacity} personas</span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{bundle.items.length} items disponibles</span>
                    {bundle.extras.length > 0 && (
                      <span>• {bundle.extras.length} extras</span>
                    )}
                  </div>
                </div>

                {/* Contenido del bundle */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="font-medium text-gray-700 mb-1">Items incluidos:</div>
                    {bundle.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>• {item.title}</span>
                        <span className="font-medium">${item.price}</span>
                      </div>
                    ))}
                    {bundle.items.length > 3 && (
                      <div className="text-gray-500 italic">
                        +{bundle.items.length - 3} items más...
                      </div>
                    )}
                  </div>

                  {bundle.extras.length > 0 && (
                    <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200">
                      <div className="font-medium text-gray-700 mb-1">Extras disponibles:</div>
                      {bundle.extras.slice(0, 2).map((extra) => (
                        <div key={extra.id} className="flex justify-between">
                          <span>• {extra.title}</span>
                          <span className="font-medium">${extra.price}</span>
                        </div>
                      ))}
                      {bundle.extras.length > 2 && (
                        <div className="text-gray-500 italic">
                          +{bundle.extras.length - 2} extras más...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {bundle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bundle.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {bundle.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{bundle.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Configuración de reservas */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-blue-800 space-y-1">
                    <div>⏱️ Duración estimada: {bundle.duration} minutos</div>
                    {bundle.bookingSettings.allowInstantBooking ? (
                      <div>⚡ Reserva instantánea disponible</div>
                    ) : (
                      <div>✅ Requiere aprobación</div>
                    )}
                    {bundle.bookingSettings.cancellationPolicy && (
                      <div>🔄 {bundle.bookingSettings.cancellationPolicy}</div>
                    )}
                  </div>
                </div>

                {/* Botón de acción */}
                <Button
                  onClick={() => handleSelectBundle(bundle)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar Bundle</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {availableBundles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay bundles disponibles
            </h3>
            <p className="text-gray-600">
              {shopId 
                ? 'No se encontraron bundles activos para este shop.'
                : 'No se encontraron bundles activos en el sistema.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de gestión de reservas de bundle */}
      {showReservationManager && selectedBundle && (
        <BundleReservationManager
          bundle={selectedBundle}
          onReservationCreated={handleReservationCreated}
          onClose={handleCloseReservationManager}
        />
      )}
    </>
  );
}; 