import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  History,
  User,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import type { 
  ReservaItem, 
  ModifyReservationRequest, 
  CancelReservationRequest,
  ReservationModificationValidation 
} from '../../../types';
import { 
  validateReservationModification,
  modifyReservation,
  cancelReservation,
  getReservationActions,
  formatReservationHistory,
  getHoursUntilReservation,
  canCancelReservation
} from '../reservationModification';
import { items } from '../../../mockData/entitiesData';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface ReservationManagementModalProps {
  reservation: ReservaItem;
  onClose: () => void;
  onReservationUpdated: (updatedReservation: ReservaItem) => void;
  onReservationCancelled: (cancelledReservation: ReservaItem) => void;
}

type ModalTab = 'details' | 'modify' | 'history';

export const ReservationManagementModal: React.FC<ReservationManagementModalProps> = ({
  reservation,
  onClose,
  onReservationUpdated,
  onReservationCancelled
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [acceptPenalty, setAcceptPenalty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modificación
  const [modifyForm, setModifyForm] = useState({
    date: reservation.date,
    timeSlot: reservation.timeSlot,
    numberOfPeople: reservation.numberOfPeople,
    customerInfo: reservation.customerInfo || { name: '', email: '', phone: '' },
    notes: reservation.notes || '',
    reason: ''
  });

  const [validation, setValidation] = useState<ReservationModificationValidation | null>(null);

  // Obtener información del item
  const item = items.find(i => i.id === reservation.itemId);
  
  // Calcular acciones disponibles
  const actions = getReservationActions(reservation);
  const hoursUntilEvent = getHoursUntilReservation(reservation);
  
  // Validar cancelación si está en el modal de cancelación
  const cancellationValidation = canCancelReservation(reservation);

  useEffect(() => {
    if (activeTab === 'modify') {
      validateModification();
    }
  }, [modifyForm, activeTab]);

  const validateModification = () => {
    const request: ModifyReservationRequest = {
      reservationId: reservation.id,
      changes: {
        date: modifyForm.date !== reservation.date ? modifyForm.date : undefined,
        timeSlot: (modifyForm.timeSlot.startTime !== reservation.timeSlot.startTime || 
                  modifyForm.timeSlot.endTime !== reservation.timeSlot.endTime) ? modifyForm.timeSlot : undefined,
        numberOfPeople: modifyForm.numberOfPeople !== reservation.numberOfPeople ? modifyForm.numberOfPeople : undefined,
        customerInfo: (modifyForm.customerInfo.name !== (reservation.customerInfo?.name || '') ||
                     modifyForm.customerInfo.email !== (reservation.customerInfo?.email || '') ||
                     modifyForm.customerInfo.phone !== (reservation.customerInfo?.phone || '')) ? modifyForm.customerInfo : undefined,
        notes: modifyForm.notes !== (reservation.notes || '') ? modifyForm.notes : undefined
      },
      reason: modifyForm.reason,
      userId: "87IZYWdezwJQsILiU57z"
    };

    const validation = validateReservationModification(reservation, request);
    setValidation(validation);
  };

  const handleModifyReservation = async () => {
    if (!validation?.isValid || !modifyForm.reason.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const request: ModifyReservationRequest = {
        reservationId: reservation.id,
        changes: {
          date: modifyForm.date !== reservation.date ? modifyForm.date : undefined,
          timeSlot: (modifyForm.timeSlot.startTime !== reservation.timeSlot.startTime || 
                    modifyForm.timeSlot.endTime !== reservation.timeSlot.endTime) ? modifyForm.timeSlot : undefined,
          numberOfPeople: modifyForm.numberOfPeople !== reservation.numberOfPeople ? modifyForm.numberOfPeople : undefined,
          customerInfo: (modifyForm.customerInfo.name !== (reservation.customerInfo?.name || '') ||
                       modifyForm.customerInfo.email !== (reservation.customerInfo?.email || '') ||
                       modifyForm.customerInfo.phone !== (reservation.customerInfo?.phone || '')) ? modifyForm.customerInfo : undefined,
          notes: modifyForm.notes !== (reservation.notes || '') ? modifyForm.notes : undefined
        },
        reason: modifyForm.reason,
        userId: "87IZYWdezwJQsILiU57z"
      };

      const result = modifyReservation(request);

      if (result.success && result.updatedReservation) {
        onReservationUpdated(result.updatedReservation);
        setActiveTab('details');
        alert('✅ Reserva modificada exitosamente');
      } else {
        alert(`❌ Error: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error modificando reserva:', error);
      alert('❌ Error inesperado al modificar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelReason.trim()) {
      alert('Debe proporcionar una razón para la cancelación');
      return;
    }

    if (cancellationValidation.penalty?.willBeCharged && !acceptPenalty) {
      alert('Debe aceptar la penalidad para proceder con la cancelación');
      return;
    }

    setIsLoading(true);

    try {
      const request: CancelReservationRequest = {
        reservationId: reservation.id,
        reason: cancelReason,
        userId: "87IZYWdezwJQsILiU57z",
        acceptPenalty
      };

      const result = cancelReservation(request);

      if (result.success && result.cancelledReservation) {
        onReservationCancelled(result.cancelledReservation);
        setShowCancelConfirmation(false);
        alert('✅ Reserva cancelada exitosamente');
        onClose();
      } else {
        alert(`❌ Error: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('❌ Error inesperado al cancelar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'MODIFIED': return <Edit className="w-5 h-5 text-blue-500" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODIFIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeUntilEvent = (hours: number) => {
    if (hours < 0) return 'Evento pasado';
    if (hours < 1) return `${Math.round(hours * 60)} minutos`;
    if (hours < 24) return `${Math.round(hours)} horas`;
    return `${Math.round(hours / 24)} días`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            {getStatusIcon(reservation.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestión de Reserva
              </h2>
              <p className="text-sm text-gray-600">
                {item?.title} • {formatTimeUntilEvent(hoursUntilEvent)} hasta el evento
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
              {reservation.status}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('modify')}
              disabled={!actions.modify.enabled}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modify'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } ${!actions.modify.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Modificar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historial
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Cliente
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{reservation.customerInfo?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{reservation.customerInfo?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{reservation.customerInfo?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reserva
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{reservation.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{reservation.numberOfPeople} persona{reservation.numberOfPeople !== 1 ? 's' : ''}</span>
                    </div>
                    {reservation.notes && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm">{reservation.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones de Reserva */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Disponibles</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    variant={actions.modify.enabled ? "outline" : "outline"}
                    disabled={!actions.modify.enabled}
                    onClick={() => setActiveTab('modify')}
                    className="flex items-center justify-center space-x-2"
                    title={actions.modify.reason}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modificar</span>
                  </Button>

                  <Button
                    variant={actions.cancel.enabled ? "danger" : "outline"}
                    disabled={!actions.cancel.enabled}
                    onClick={() => setShowCancelConfirmation(true)}
                    className="flex items-center justify-center space-x-2"
                    title={actions.cancel.reason}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar</span>
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!actions.duplicate.enabled}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicar</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('history')}
                    className="flex items-center justify-center space-x-2"
                  >
                    <History className="w-4 h-4" />
                    <span>Historial</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modify' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Modificar Reserva</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Los cambios se aplicarán inmediatamente. Asegúrese de verificar toda la información antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de Modificación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Información de la Reserva</h3>
                  
                  <Input
                    label="Fecha"
                    type="date"
                    value={modifyForm.date}
                    onChange={(e) => setModifyForm(prev => ({ ...prev, date: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Hora Inicio"
                      type="time"
                      value={modifyForm.timeSlot.startTime}
                      onChange={(e) => setModifyForm(prev => ({ 
                        ...prev, 
                        timeSlot: { ...prev.timeSlot, startTime: e.target.value }
                      }))}
                    />
                    <Input
                      label="Hora Fin"
                      type="time"
                      value={modifyForm.timeSlot.endTime}
                      onChange={(e) => setModifyForm(prev => ({ 
                        ...prev, 
                        timeSlot: { ...prev.timeSlot, endTime: e.target.value }
                      }))}
                    />
                  </div>

                  <Input
                    label="Número de Personas"
                    type="number"
                    min="1"
                    max={item?.bookingConfig?.maxCapacity || 10}
                    value={modifyForm.numberOfPeople}
                    onChange={(e) => setModifyForm(prev => ({ ...prev, numberOfPeople: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Información del Cliente</h3>
                  
                  <Input
                    label="Nombre"
                    value={modifyForm.customerInfo.name}
                    onChange={(e) => setModifyForm(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={modifyForm.customerInfo.email}
                    onChange={(e) => setModifyForm(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                  />

                  <Input
                    label="Teléfono"
                    value={modifyForm.customerInfo.phone}
                    onChange={(e) => setModifyForm(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Notas
                </label>
                <textarea
                  rows={3}
                  value={modifyForm.notes}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="Notas adicionales..."
                />
              </div>

              <Input
                label="Razón del Cambio *"
                value={modifyForm.reason}
                onChange={(e) => setModifyForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ej: Cliente solicitó cambio de horario"
                required
              />

              {/* Validación y Advertencias */}
              {validation && (
                <div className="space-y-3">
                  {validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Errores:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Advertencias:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.penalties.modification && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-2">Penalidad por Modificación:</h4>
                      <p className="text-sm text-orange-700">
                        Se aplicará una penalidad de €{validation.penalties.modification.amount} - {validation.penalties.modification.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historial de Cambios
              </h3>
              
              {reservation.history && reservation.history.length > 0 ? (
                <div className="space-y-3">
                  {formatReservationHistory(reservation.history).map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <p className="text-sm text-gray-700">{entry}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay historial de cambios disponible
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            {activeTab === 'modify' && (
              <Button
                onClick={handleModifyReservation}
                disabled={!validation?.isValid || !modifyForm.reason.trim() || isLoading}
                loading={isLoading}
              >
                Confirmar Modificación
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de Confirmación de Cancelación */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Cancelar Reserva</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Esta acción no se puede deshacer. ¿Está seguro?
                  </p>
                </div>
              </div>

              {cancellationValidation.penalty?.willBeCharged && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-800 mb-2">Penalidad de Cancelación</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Se aplicará una penalidad de €{cancellationValidation.penalty.amount} 
                    ({cancellationValidation.penalty.percentage}%) - {cancellationValidation.penalty.reason}
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={acceptPenalty}
                      onChange={(e) => setAcceptPenalty(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-red-700">Acepto la penalidad de cancelación</span>
                  </label>
                </div>
              )}

              <Input
                label="Razón de la Cancelación *"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej: Cliente canceló por enfermedad"
                required
              />

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirmation(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelReservation}
                  disabled={!cancelReason.trim() || (cancellationValidation.penalty?.willBeCharged && !acceptPenalty) || isLoading}
                  loading={isLoading}
                  className="flex-1"
                >
                  Confirmar Cancelación
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}; 