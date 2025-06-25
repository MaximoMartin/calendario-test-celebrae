// ========================================
// GESTOR DE ACCIONES MASIVAS AVANZADO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, BookingStatus } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  CheckSquare, Square, CheckCircle, XCircle, Clock,
  Mail, MessageSquare, Download, Printer, Trash2,
  RotateCcw, AlertTriangle, Users, Calendar,
  FileText, Send, Copy, Archive, Tag,
  Filter, Search, SortAsc, SortDesc, MoreHorizontal
} from 'lucide-react';

// ========================================
// TIPOS DE ACCIONES MASIVAS
// ========================================

export type BulkActionType = 
  | 'CONFIRM_BOOKINGS'
  | 'CANCEL_BOOKINGS'
  | 'RESCHEDULE_BOOKINGS'
  | 'SEND_REMINDERS'
  | 'SEND_CONFIRMATIONS'
  | 'EXPORT_DATA'
  | 'GENERATE_REPORT'
  | 'DELETE_BOOKINGS'
  | 'ARCHIVE_BOOKINGS'
  | 'ADD_NOTES'
  | 'UPDATE_PRICING'
  | 'TRANSFER_BOOKINGS'
  | 'DUPLICATE_BOOKINGS';

export interface BulkAction {
  id: BulkActionType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  requiresConfirmation: boolean;
  requiresInput?: boolean;
  inputType?: 'text' | 'date' | 'select' | 'textarea';
  inputOptions?: { value: string; label: string }[];
  inputPlaceholder?: string;
  dangerous?: boolean;
  minSelection?: number;
  maxSelection?: number;
}

export interface BulkActionResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface BulkActionProgress {
  total: number;
  processed: number;
  current?: string;
  stage: 'PREPARING' | 'PROCESSING' | 'COMPLETING' | 'FINISHED';
}

// ========================================
// CONFIGURACIÓN DE ACCIONES
// ========================================

const BULK_ACTIONS: BulkAction[] = [
  {
    id: 'CONFIRM_BOOKINGS',
    label: 'Confirmar Reservas',
    description: 'Confirmar todas las reservas seleccionadas',
    icon: CheckCircle,
    color: 'bg-green-600 text-white',
    requiresConfirmation: true,
    minSelection: 1
  },
  {
    id: 'CANCEL_BOOKINGS',
    label: 'Cancelar Reservas',
    description: 'Cancelar las reservas seleccionadas con motivo',
    icon: XCircle,
    color: 'bg-red-600 text-white',
    requiresConfirmation: true,
    requiresInput: true,
    inputType: 'textarea',
    inputPlaceholder: 'Motivo de la cancelación...',
    dangerous: true,
    minSelection: 1
  },
  {
    id: 'RESCHEDULE_BOOKINGS',
    label: 'Reagendar Reservas',
    description: 'Reagendar reservas a una nueva fecha',
    icon: RotateCcw,
    color: 'bg-blue-600 text-white',
    requiresConfirmation: true,
    requiresInput: true,
    inputType: 'date',
    inputPlaceholder: 'Nueva fecha',
    minSelection: 1
  },
  {
    id: 'SEND_REMINDERS',
    label: 'Enviar Recordatorios',
    description: 'Enviar recordatorios por email a los clientes',
    icon: Mail,
    color: 'bg-purple-600 text-white',
    requiresConfirmation: true,
    minSelection: 1
  },
  {
    id: 'SEND_CONFIRMATIONS',
    label: 'Enviar Confirmaciones',
    description: 'Enviar confirmaciones de reserva por email',
    icon: Send,
    color: 'bg-indigo-600 text-white',
    requiresConfirmation: true,
    minSelection: 1
  },
  {
    id: 'EXPORT_DATA',
    label: 'Exportar Datos',
    description: 'Exportar datos de reservas seleccionadas',
    icon: Download,
    color: 'bg-gray-600 text-white',
    requiresConfirmation: false,
    requiresInput: true,
    inputType: 'select',
    inputOptions: [
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel' },
      { value: 'pdf', label: 'PDF' }
    ],
    minSelection: 1
  },
  {
    id: 'GENERATE_REPORT',
    label: 'Generar Reporte',
    description: 'Generar reporte detallado de las reservas',
    icon: FileText,
    color: 'bg-orange-600 text-white',
    requiresConfirmation: false,
    minSelection: 1
  },
  {
    id: 'ADD_NOTES',
    label: 'Agregar Notas',
    description: 'Agregar notas a las reservas seleccionadas',
    icon: MessageSquare,
    color: 'bg-yellow-600 text-white',
    requiresConfirmation: true,
    requiresInput: true,
    inputType: 'textarea',
    inputPlaceholder: 'Nota a agregar...',
    minSelection: 1
  },
  {
    id: 'ARCHIVE_BOOKINGS',
    label: 'Archivar Reservas',
    description: 'Mover reservas completadas al archivo',
    icon: Archive,
    color: 'bg-gray-500 text-white',
    requiresConfirmation: true,
    minSelection: 1
  },
  {
    id: 'DELETE_BOOKINGS',
    label: 'Eliminar Reservas',
    description: 'Eliminar permanentemente las reservas seleccionadas',
    icon: Trash2,
    color: 'bg-red-700 text-white',
    requiresConfirmation: true,
    dangerous: true,
    minSelection: 1,
    maxSelection: 50
  }
];

// ========================================
// PROPS DEL COMPONENTE
// ========================================

interface BulkActionsManagerProps {
  bookings: Booking[];
  selectedBookings: string[];
  onSelectionChange: (bookingIds: string[]) => void;
  onActionComplete?: (action: BulkActionType, result: BulkActionResult) => void;
  onBookingUpdate?: (bookingId: string, updates: Partial<Booking>) => void;
  onBookingsDelete?: (bookingIds: string[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const BulkActionsManager: React.FC<BulkActionsManagerProps> = ({
  bookings,
  selectedBookings,
  onSelectionChange,
  onActionComplete,
  onBookingUpdate,
  onBookingsDelete,
  canEdit = true,
  canDelete = false
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BulkActionProgress | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'customer' | 'status' | 'bundle'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // ========================================
  // FILTROS Y ORDENAMIENTO
  // ========================================

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bundleName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'bundle':
          aValue = a.bundleName.toLowerCase();
          bValue = b.bundleName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, searchTerm, statusFilter, sortField, sortDirection]);

  const selectedBookingObjects = useMemo(() => 
    filteredBookings.filter(booking => selectedBookings.includes(booking.id))
  , [filteredBookings, selectedBookings]);

  const availableActions = useMemo(() => 
    BULK_ACTIONS.filter(action => {
      if (!canEdit && ['CONFIRM_BOOKINGS', 'CANCEL_BOOKINGS', 'RESCHEDULE_BOOKINGS', 'ADD_NOTES'].includes(action.id)) {
        return false;
      }
      if (!canDelete && action.id === 'DELETE_BOOKINGS') {
        return false;
      }
      return true;
    })
  , [canEdit, canDelete]);

  // ========================================
  // HANDLERS DE SELECCIÓN
  // ========================================

  const toggleSelectAll = useCallback(() => {
    if (selectedBookings.length === filteredBookings.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredBookings.map(b => b.id));
    }
  }, [selectedBookings, filteredBookings, onSelectionChange]);

  const toggleSelectBooking = useCallback((bookingId: string) => {
    if (selectedBookings.includes(bookingId)) {
      onSelectionChange(selectedBookings.filter(id => id !== bookingId));
    } else {
      onSelectionChange([...selectedBookings, bookingId]);
    }
  }, [selectedBookings, onSelectionChange]);

  const selectByStatus = useCallback((status: BookingStatus) => {
    const statusBookings = filteredBookings
      .filter(booking => booking.status === status)
      .map(booking => booking.id);
    onSelectionChange([...new Set([...selectedBookings, ...statusBookings])]);
  }, [filteredBookings, selectedBookings, onSelectionChange]);

  const selectByDateRange = useCallback((days: number) => {
    const now = new Date();
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const dateBookings = filteredBookings
      .filter(booking => {
        const bookingDate = parseISO(booking.date);
        return days > 0 
          ? bookingDate <= targetDate && bookingDate >= now
          : bookingDate >= targetDate && bookingDate <= now;
      })
      .map(booking => booking.id);
    
    onSelectionChange([...new Set([...selectedBookings, ...dateBookings])]);
  }, [filteredBookings, selectedBookings, onSelectionChange]);

  // ========================================
  // EJECUCIÓN DE ACCIONES
  // ========================================

  const executeAction = useCallback(async (action: BulkAction, input?: string) => {
    if (selectedBookings.length === 0) return;

    setIsProcessing(true);
    setProgress({
      total: selectedBookings.length,
      processed: 0,
      stage: 'PREPARING'
    });

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Simular procesamiento por lotes
      for (let i = 0; i < selectedBookings.length; i++) {
        const bookingId = selectedBookings[i];
        const booking = bookings.find(b => b.id === bookingId);
        
        if (!booking) {
          failedCount++;
          errors.push(`Reserva ${bookingId} no encontrada`);
          continue;
        }

        setProgress(prev => prev ? {
          ...prev,
          processed: i + 1,
          current: booking.customerName,
          stage: 'PROCESSING'
        } : null);

        try {
          // Simular delay de procesamiento
          await new Promise(resolve => setTimeout(resolve, 100));

          switch (action.id) {
            case 'CONFIRM_BOOKINGS':
              if (booking.status === 'PENDING') {
                onBookingUpdate?.(bookingId, { status: 'CONFIRMED' });
                successCount++;
              } else {
                warnings.push(`Reserva ${booking.customerName} ya está confirmada`);
              }
              break;

            case 'CANCEL_BOOKINGS':
              if (booking.status !== 'CANCELLED') {
                onBookingUpdate?.(bookingId, { 
                  status: 'CANCELLED',
                  notes: booking.notes ? `${booking.notes}\n\nCancelada: ${input}` : `Cancelada: ${input}`
                });
                successCount++;
              } else {
                warnings.push(`Reserva ${booking.customerName} ya está cancelada`);
              }
              break;

            case 'RESCHEDULE_BOOKINGS':
              if (input && booking.status !== 'CANCELLED') {
                onBookingUpdate?.(bookingId, { 
                  date: input,
                  status: 'RESCHEDULED',
                  rescheduling: {
                    originalDate: booking.date,
                    reason: 'Reagendada masivamente',
                    rescheduledAt: new Date().toISOString()
                  }
                });
                successCount++;
              } else {
                failedCount++;
                errors.push(`No se pudo reagendar reserva de ${booking.customerName}`);
              }
              break;

            case 'SEND_REMINDERS':
              // Simular envío de email
              console.log(`Enviando recordatorio a ${booking.customerEmail}`);
              successCount++;
              break;

            case 'SEND_CONFIRMATIONS':
              // Simular envío de confirmación
              console.log(`Enviando confirmación a ${booking.customerEmail}`);
              successCount++;
              break;

            case 'ADD_NOTES':
              if (input) {
                const newNotes = booking.notes 
                  ? `${booking.notes}\n\n${input}`
                  : input;
                onBookingUpdate?.(bookingId, { notes: newNotes });
                successCount++;
              }
              break;

            case 'ARCHIVE_BOOKINGS':
              if (booking.status === 'COMPLETED') {
                // Simular archivado
                console.log(`Archivando reserva ${bookingId}`);
                successCount++;
              } else {
                warnings.push(`Reserva ${booking.customerName} no está completada`);
              }
              break;

            case 'DELETE_BOOKINGS':
              onBookingsDelete?.([bookingId]);
              successCount++;
              break;

            case 'EXPORT_DATA':
              // La exportación se maneja como una sola operación
              successCount++;
              break;

            case 'GENERATE_REPORT':
              // La generación de reporte se maneja como una sola operación
              successCount++;
              break;

            default:
              failedCount++;
              errors.push(`Acción ${action.id} no implementada`);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Error procesando reserva de ${booking.customerName}: ${error}`);
        }
      }

      setProgress(prev => prev ? { ...prev, stage: 'COMPLETING' } : null);

      const result: BulkActionResult = {
        success: failedCount === 0,
        processedCount: successCount,
        failedCount,
        errors,
        warnings,
        summary: `Procesadas: ${successCount}, Fallidas: ${failedCount}`
      };

      // Limpiar selección si la acción fue exitosa
      if (result.success) {
        onSelectionChange([]);
      }

      onActionComplete?.(action.id, result);

      setProgress(prev => prev ? { ...prev, stage: 'FINISHED' } : null);

      // Limpiar progreso después de un delay
      setTimeout(() => {
        setProgress(null);
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      setIsProcessing(false);
      setProgress(null);
      console.error('Error ejecutando acción masiva:', error);
    }
  }, [selectedBookings, bookings, onBookingUpdate, onBookingsDelete, onActionComplete, onSelectionChange]);

  const handleActionClick = useCallback((action: BulkAction) => {
    if (selectedBookings.length === 0) return;
    
    if (action.minSelection && selectedBookings.length < action.minSelection) {
      alert(`Selecciona al menos ${action.minSelection} reserva(s)`);
      return;
    }

    if (action.maxSelection && selectedBookings.length > action.maxSelection) {
      alert(`Selecciona máximo ${action.maxSelection} reserva(s)`);
      return;
    }

    setSelectedAction(action);
    setActionInput('');
    
    if (action.requiresConfirmation || action.requiresInput) {
      setShowActionModal(true);
    } else {
      executeAction(action);
    }
  }, [selectedBookings, executeAction]);

  const confirmAction = useCallback(() => {
    if (selectedAction) {
      executeAction(selectedAction, actionInput);
      setShowActionModal(false);
      setSelectedAction(null);
      setActionInput('');
    }
  }, [selectedAction, actionInput, executeAction]);

  // ========================================
  // ESTADÍSTICAS DE SELECCIÓN
  // ========================================

  const selectionStats = useMemo(() => {
    const selected = selectedBookingObjects;
    return {
      total: selected.length,
      byStatus: selected.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<BookingStatus, number>),
      totalValue: selected.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0)
    };
  }, [selectedBookingObjects]);

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>Acciones Masivas</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Gestiona múltiples reservas simultáneamente
            </p>
          </div>

          {selectedBookings.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{selectedBookings.length}</div>
              <div className="text-sm text-gray-600">seleccionadas</div>
            </div>
          )}
        </div>

        {/* Controles de filtro y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
            options={[
              { value: 'ALL', label: 'Todos los estados' },
              { value: 'PENDING', label: 'Pendientes' },
              { value: 'CONFIRMED', label: 'Confirmadas' },
              { value: 'CANCELLED', label: 'Canceladas' },
              { value: 'COMPLETED', label: 'Completadas' }
            ]}
          />

          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as typeof sortField)}
            options={[
              { value: 'date', label: 'Fecha' },
              { value: 'customer', label: 'Cliente' },
              { value: 'status', label: 'Estado' },
              { value: 'bundle', label: 'Servicio' }
            ]}
          />

          <Button
            variant="outline"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2"
          >
            {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span>{sortDirection === 'asc' ? 'Ascendente' : 'Descendente'}</span>
          </Button>
        </div>

        {/* Selección rápida */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Selección rápida:</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="flex items-center space-x-1"
          >
            {selectedBookings.length === filteredBookings.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Todas ({filteredBookings.length})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByStatus('PENDING')}
          >
            Pendientes
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByStatus('CONFIRMED')}
          >
            Confirmadas
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectByDateRange(7)}
          >
            Próximos 7 días
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectionChange([])}
            className="text-red-600"
          >
            Limpiar
          </Button>
        </div>

        {/* Estadísticas de selección */}
        {selectedBookings.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{selectionStats.total}</div>
                <div className="text-sm text-gray-600">Reservas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${selectionStats.totalValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {Object.entries(selectionStats.byStatus).map(([status, count]) => (
                    <span key={status} className="mr-2">
                      {status}: {count}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">Por Estado</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  Última actualización: {format(new Date(), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones disponibles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {availableActions.map((action) => {
            const isDisabled = selectedBookings.length === 0 ||
              (action.minSelection && selectedBookings.length < action.minSelection) ||
              (action.maxSelection && selectedBookings.length > action.maxSelection);

            return (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={isDisabled || isProcessing}
                className={`${action.color} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} flex flex-col items-center space-y-2 h-20 text-sm`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-center leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Progreso de ejecución */}
      {progress && (
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {progress.stage === 'PREPARING' && 'Preparando...'}
                  {progress.stage === 'PROCESSING' && `Procesando ${progress.current}...`}
                  {progress.stage === 'COMPLETING' && 'Finalizando...'}
                  {progress.stage === 'FINISHED' && '¡Completado!'}
                </span>
                <span className="text-sm text-gray-600">
                  {progress.processed} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal de confirmación */}
      {showActionModal && selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowActionModal(false)} />
          
          <Card className="w-full max-w-md bg-white z-10">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <selectedAction.icon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{selectedAction.label}</h3>
              </div>

              <p className="text-gray-600 mb-4">{selectedAction.description}</p>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Esta acción afectará <strong>{selectedBookings.length}</strong> reserva(s) seleccionada(s).
                </p>
                
                {selectedAction.dangerous && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">Esta acción no se puede deshacer</span>
                  </div>
                )}
              </div>

              {selectedAction.requiresInput && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedAction.inputType === 'textarea' ? 'Comentario:' :
                     selectedAction.inputType === 'date' ? 'Nueva fecha:' :
                     selectedAction.inputType === 'select' ? 'Formato:' :
                     'Valor:'}
                  </label>
                  
                  {selectedAction.inputType === 'textarea' ? (
                    <textarea
                      value={actionInput}
                      onChange={(e) => setActionInput(e.target.value)}
                      placeholder={selectedAction.inputPlaceholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : selectedAction.inputType === 'select' ? (
                    <Select
                      value={actionInput}
                      onChange={(e) => setActionInput(e.target.value)}
                      options={selectedAction.inputOptions || []}
                    />
                  ) : (
                    <Input
                      type={selectedAction.inputType}
                      value={actionInput}
                      onChange={(e) => setActionInput(e.target.value)}
                      placeholder={selectedAction.inputPlaceholder}
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAction}
                  className={selectedAction.dangerous ? 'bg-red-600 text-white' : ''}
                  disabled={selectedAction.requiresInput && !actionInput.trim()}
                >
                  {selectedAction.dangerous ? 'Confirmar' : 'Ejecutar'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}; 