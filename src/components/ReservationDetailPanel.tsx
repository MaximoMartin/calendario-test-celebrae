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
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useEntitiesState } from '../hooks/useEntitiesState';

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
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES');
  };

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
                  Detalle de Reserva
                </h2>
                <p className="text-sm text-gray-600">
                  {getBundleName(reservation.bundleId)} - {getItemName(reservation.itemId)}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Información de la Reserva
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Estado:</span>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(reservation.status)}`}>
                      {getStatusIcon(reservation.status)}
                      <span className="text-sm font-medium">
                        {reservation.status === 'CONFIRMED' && 'Confirmada'}
                        {reservation.status === 'PENDING' && 'Pendiente'}
                        {reservation.status === 'CANCELLED' && 'Cancelada'}
                        {reservation.status === 'COMPLETED' && 'Completada'}
                        {reservation.status === 'MODIFIED' && 'Modificada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(reservation.date)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatTime(reservation.timeSlot)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{reservation.numberOfPeople} persona{reservation.numberOfPeople !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Euro className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">€{reservation.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente
                </h3>
                
                {reservation.customerInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{reservation.customerInfo.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{reservation.customerInfo.email}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{reservation.customerInfo.phone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay información del cliente</p>
                )}
              </div>
            </div>

            {/* Descripción del item */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Descripción del Servicio</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {getItemDescription(reservation.itemId)}
              </p>
            </div>

            {/* Notas */}
            {reservation.notes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notas
                </h3>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {reservation.notes}
                </p>
              </div>
            )}

            {/* Información técnica */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Información Técnica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Creada:</span>
                  <p className="font-medium">{formatDateTime(reservation.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Actualizada:</span>
                  <p className="font-medium">{formatDateTime(reservation.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID de Reserva:</span>
                  <p className="font-medium font-mono text-xs">{reservation.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Creada por:</span>
                  <p className="font-medium">{reservation.createdBy}</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {onEdit && (
                <Button onClick={() => onEdit(reservation)}>
                  Editar
                </Button>
              )}
              {onManage && (
                <Button onClick={() => onManage(reservation)}>
                  Gestionar
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}; 