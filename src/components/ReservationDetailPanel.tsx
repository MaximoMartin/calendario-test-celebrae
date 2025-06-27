import React from 'react';
import { 
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MessageSquare,
  Package,
  Euro,
  History,
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  X
} from 'lucide-react';
import type { ReservaItem } from '../types';
import { formatReservationHistory } from '../features/reservations/reservationModification';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useEntitiesState } from '../hooks/useEntitiesState';

// 🎯 CHECKPOINT 7: PANEL DE DETALLE DE RESERVA PARA SELLER

interface ReservationDetailPanelProps {
  reservation: ReservaItem;
  onClose: () => void;
  onEdit?: (reservation: ReservaItem) => void;
  onManage?: (reservation: ReservaItem) => void;
}

export const ReservationDetailPanel: React.FC<ReservationDetailPanelProps> = ({
  reservation,
  onClose,
  onEdit,
  onManage
}) => {
  const { allBundles, allItems } = useEntitiesState();
  
  // Helper functions
  const getBundleName = (bundleId: string) => {
    return allBundles.find(bundle => bundle.id === bundleId)?.name || 'Bundle Desconocido';
  };

  const getItemName = (itemId: string) => {
    return allItems.find(item => item.id === itemId)?.title || 'Item Desconocido';
  };

  const getItemDescription = (itemId: string) => {
    return allItems.find(item => item.id === itemId)?.description || '';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case 'MODIFIED': return <Edit className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'MODIFIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('es-ES');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            {getStatusIcon(reservation.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Detalle de Reserva
              </h2>
              <p className="text-sm text-gray-600">
                ID: {reservation.id}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
              {reservation.status}
            </span>
            {reservation.isTemporary && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                TEMPORAL
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Información del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información del Cliente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {reservation.customerInfo?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {reservation.customerInfo?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {reservation.customerInfo?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Detalles de la Reserva
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(reservation.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {formatTime(reservation.timeSlot)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {reservation.numberOfPeople} persona{reservation.numberOfPeople !== 1 ? 's' : ''}
                      {reservation.isGroupReservation && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Reserva grupal
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bundle e Item */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Servicio Reservado
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {getBundleName(reservation.bundleId)}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Bundle principal del servicio
                </p>
              </div>
              <div className="border-l-4 border-blue-200 pl-4">
                <h5 className="font-medium text-gray-900">
                  {getItemName(reservation.itemId)}
                </h5>
                <p className="text-sm text-gray-600 mt-1">
                  {getItemDescription(reservation.itemId)}
                </p>
              </div>
            </div>
          </Card>

          {/* Información Financiera */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Euro className="w-5 h-5 mr-2" />
              Información Financiera
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Precio por ítem</p>
                <p className="text-lg font-semibold text-gray-900">
                  €{reservation.itemPrice}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de la reserva</p>
                <p className="text-xl font-bold text-blue-600">
                  €{reservation.totalPrice}
                </p>
              </div>
            </div>
            
            {reservation.cancellationPenalty && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Penalidad de cancelación:</strong> {reservation.cancellationPenalty.reason}
                </p>
              </div>
            )}
          </Card>

          {/* Notas */}
          {reservation.notes && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Notas
              </h3>
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-gray-700">{reservation.notes}</p>
              </div>
            </Card>
          )}

          {/* Historial */}
          {reservation.history && reservation.history.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historial de Cambios
              </h3>
              <div className="space-y-3">
                {formatReservationHistory(reservation.history).map((entry, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <p className="text-sm text-gray-700">{entry}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Metadatos */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información del Sistema
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Creado por</p>
                <p className="font-medium">{reservation.createdBy}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha de creación</p>
                <p className="font-medium">{formatDateTime(reservation.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Última actualización</p>
                <p className="font-medium">{formatDateTime(reservation.updatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">ID del usuario</p>
                <p className="font-medium text-xs">{reservation.userId}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer con Acciones */}
        <div className="border-t p-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            <div className="flex space-x-3">
              {onEdit && reservation.canBeModified && (
                <Button variant="outline" onClick={() => onEdit(reservation)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              
              {onManage && (
                <Button onClick={() => onManage(reservation)}>
                  <Package className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 