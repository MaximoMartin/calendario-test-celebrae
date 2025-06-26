import React, { useState } from 'react';
import { Calendar, Clock, Users, DollarSign } from 'lucide-react';
import type { Item } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ItemReservationManager } from './ItemReservationManager';
import { items } from '../../../mockData/entitiesData';

interface ItemSelectorProps {
  bundleId?: string; // opcional, si queremos filtrar por bundle
  onReservationCreated?: (reservationId: string) => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  bundleId,
  onReservationCreated
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showReservationManager, setShowReservationManager] = useState(false);

  // Filtrar items según el bundle si se proporciona
  const availableItems = bundleId 
    ? items.filter(item => item.bundleId === bundleId && item.isActive)
    : items.filter(item => item.isActive);

  const handleSelectItem = (item: Item) => {
    console.log(`🎯 Seleccionado item: ${item.title}`);
    setSelectedItem(item);
    setShowReservationManager(true);
  };

  const handleCloseReservationManager = () => {
    setShowReservationManager(false);
    setSelectedItem(null);
  };

  const handleReservationCreated = (reservationId: string) => {
    console.log(`✅ Reserva creada con éxito: ${reservationId}`);
    onReservationCreated?.(reservationId);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Reservas por Item Individual
          </h2>
          <p className="text-gray-600">
            Selecciona un item para ver su disponibilidad y crear una reserva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                {/* Header del item */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isForAdult 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isForAdult ? 'Adultos' : 'Familiar'}
                  </span>
                </div>

                {/* Información del item */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium text-gray-900">${item.price}</span>
                    <span>por persona</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Máximo {item.bookingConfig?.maxCapacity || item.size} personas</span>
                  </div>

                  {item.bookingConfig && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{item.bookingConfig.duration} minutos</span>
                    </div>
                  )}
                </div>

                {/* Configuración de reservas */}
                {item.bookingConfig && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📅 Anticipación: {item.bookingConfig.advanceBookingDays} días</div>
                      {item.bookingConfig.requiresConfirmation && (
                        <div>✅ Requiere confirmación</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botón de acción */}
                <Button
                  onClick={() => handleSelectItem(item)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ver Disponibilidad</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {availableItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay items disponibles
            </h3>
            <p className="text-gray-600">
              {bundleId 
                ? 'No se encontraron items activos para este bundle.'
                : 'No se encontraron items activos en el sistema.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de gestión de reservas */}
      {showReservationManager && selectedItem && (
        <ItemReservationManager
          item={selectedItem}
          onReservationCreated={handleReservationCreated}
          onClose={handleCloseReservationManager}
        />
      )}
    </>
  );
}; 