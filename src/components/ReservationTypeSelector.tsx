import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { BundleReservationManager } from '../features/reservations/components/BundleReservationManager';
import { useShopState } from '../hooks/useShopState';
import { useEntitiesState } from '../hooks/useEntitiesState';
import type { Bundle } from '../types';

interface ReservationTypeSelectorProps {
  onClose: () => void;
  onReservationCreated?: (reservationId: string) => void;
}

export const ReservationTypeSelector: React.FC<ReservationTypeSelectorProps> = ({
  onClose,
  onReservationCreated
}) => {
  const { selectedShop, shopBundles } = useShopState();
  const { getBundleWithContent } = useEntitiesState();
  
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nueva Reserva - {selectedShop.name}
            </h2>
            <p className="text-gray-600 mb-6">
              Selecciona un bundle para reservar
            </p>
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
                  <div
                    key={bundle.id}
                    className={`cursor-pointer border rounded-lg p-4 shadow-sm transition-all hover:shadow-lg ${selectedBundle?.id === bundle.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    onClick={() => setSelectedBundle(bundle)}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{bundle.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{bundle.shortDescription || bundle.description}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {bundle.itemIds.length} servicios
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* Botón para continuar con la reserva del bundle seleccionado */}
            <div className="flex justify-end gap-3 pt-6">
              <Button onClick={onClose} variant="outline">
                Cancelar
              </Button>
              <Button
                onClick={() => setShowReservationModal(true)}
                disabled={!selectedBundle}
                className="bg-blue-600 text-white"
              >
                Reservar Bundle
              </Button>
            </div>
          </div>
        </Card>
        {/* Modal de reserva de bundle */}
        {showReservationModal && selectedBundle && (
          <BundleReservationManager
            bundle={getBundleWithContent(selectedBundle.id)}
            onReservationCreated={onReservationCreated}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}; 