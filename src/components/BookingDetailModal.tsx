// ========================================
// MODAL DETALLE DE RESERVA AVANZADO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO, differenceInDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Bundle, Shop } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  X, Calendar, MapPin, User, Mail, Phone, 
  Clock, DollarSign, Users, Package, Star,
  Edit, Save, RotateCcw, Trash2, Copy, Send,
  CheckCircle, XCircle, AlertTriangle, Info,
  FileText, Download, Share2, MessageSquare,
  History, Settings, Tag, CreditCard, Receipt, MapPinned, Navigation
} from 'lucide-react';

// ========================================
// TIPOS
// ========================================

export interface BookingDetailModalProps {
  booking: Booking | null;
  bundles: Bundle[];
  shops: Shop[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (bookingId: string, updates: Partial<Booking>) => void;
  onDelete?: (bookingId: string) => void;
  onDuplicate?: (booking: Booking) => void;
  onSendEmail?: (booking: Booking, type: 'CONFIRMATION' | 'REMINDER' | 'CUSTOM') => void;
  onExportPDF?: (booking: Booking) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  showAdvancedFeatures?: boolean;
}

type ModalTab = 'DETAILS' | 'ITEMS' | 'PAYMENT' | 'HISTORY' | 'CUSTOMER' | 'NOTES';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  bundles,
  shops,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onSendEmail,
  onExportPDF,
  canEdit = true,
  canDelete = false,
  showAdvancedFeatures = true
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [activeTab, setActiveTab] = useState<ModalTab>('DETAILS');
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newNote, setNewNote] = useState('');

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const bundle = useMemo(() => 
    booking ? bundles.find(b => b.id === booking.bundleId) : null
  , [booking, bundles]);

  const shop = useMemo(() => 
    booking ? shops.find(s => s.id === booking.shopId) : null
  , [booking, shops]);

  const bookingAge = useMemo(() => 
    booking ? differenceInDays(new Date(), parseISO(booking.createdAt)) : 0
  , [booking]);

  const canReschedule = useMemo(() => {
    if (!booking) return false;
    const bookingDate = parseISO(booking.date);
    const now = new Date();
    return isAfter(bookingDate, now) && booking.status !== 'CANCELLED';
  }, [booking]);

  const statusColor = useMemo(() => {
    if (!booking) return 'gray';
    switch (booking.status) {
      case 'PENDING': return 'yellow';
      case 'CONFIRMED': return 'green';
      case 'CANCELLED': return 'red';
      case 'COMPLETED': return 'blue';
      case 'RESCHEDULED': return 'purple';
      default: return 'gray';
    }
  }, [booking]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleStartEdit = useCallback(() => {
    if (booking) {
      setEditedBooking({ ...booking });
      setIsEditing(true);
    }
  }, [booking]);

  const handleSave = useCallback(() => {
    if (editedBooking && onUpdate) {
      onUpdate(editedBooking.id, editedBooking);
      setIsEditing(false);
      setEditedBooking(null);
    }
  }, [editedBooking, onUpdate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedBooking(null);
  }, []);

  const handleStatusChange = useCallback((newStatus: Booking['status']) => {
    if (!booking || !onUpdate) return;
    
    const updates: Partial<Booking> = { status: newStatus };
    
    // Agregar timestamps según el estado
    const now = new Date().toISOString();
    switch (newStatus) {
      case 'CONFIRMED':
        updates.confirmedAt = now;
        break;
      case 'CANCELLED':
        updates.cancelledAt = now;
        break;
      case 'COMPLETED':
        updates.completedAt = now;
        break;
    }

    onUpdate(booking.id, updates);
  }, [booking, onUpdate]);

  const handleAddNote = useCallback(() => {
    if (!booking || !newNote.trim() || !onUpdate) return;

    const updatedNotes = booking.notes 
      ? `${booking.notes}\n\n[${format(new Date(), 'dd/MM/yyyy HH:mm')}] ${newNote}`
      : `[${format(new Date(), 'dd/MM/yyyy HH:mm')}] ${newNote}`;

    onUpdate(booking.id, { notes: updatedNotes });
    setNewNote('');
  }, [booking, newNote, onUpdate]);

  const handleDuplicate = useCallback(() => {
    if (booking && onDuplicate) {
      onDuplicate(booking);
      onClose();
    }
  }, [booking, onDuplicate, onClose]);

  const handleDelete = useCallback(() => {
    if (booking && onDelete) {
      onDelete(booking.id);
      onClose();
    }
  }, [booking, onDelete, onClose]);

  // ========================================
  // RENDERIZADO DE TABS
  // ========================================

  const renderDetailsTab = () => {
    if (!booking) return null;

    const currentBooking = isEditing ? editedBooking! : booking;

    return (
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <Input
                    value={currentBooking.customerName}
                    onChange={(e) => setEditedBooking(prev => prev ? 
                      { ...prev, customerName: e.target.value } : null
                    )}
                    className="flex-1"
                  />
                ) : (
                  <span className="text-gray-900">{currentBooking.customerName}</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <Input
                    type="email"
                    value={currentBooking.customerEmail}
                    onChange={(e) => setEditedBooking(prev => prev ? 
                      { ...prev, customerEmail: e.target.value } : null
                    )}
                    className="flex-1"
                  />
                ) : (
                  <a 
                    href={`mailto:${currentBooking.customerEmail}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {currentBooking.customerEmail}
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <Input
                    value={currentBooking.customerPhone || ''}
                    onChange={(e) => setEditedBooking(prev => prev ? 
                      { ...prev, customerPhone: e.target.value } : null
                    )}
                    className="flex-1"
                    placeholder="Teléfono del cliente"
                  />
                ) : (
                  <span className="text-gray-900">
                    {currentBooking.customerPhone || 'No especificado'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Reserva</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <Input
                    type="date"
                    value={currentBooking.date}
                    onChange={(e) => setEditedBooking(prev => prev ? 
                      { ...prev, date: e.target.value } : null
                    )}
                    className="flex-1"
                  />
                ) : (
                  <span className="text-gray-900">
                    {format(parseISO(currentBooking.date), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{currentBooking.bundleName}</span>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{shop?.name || 'Ubicación no disponible'}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {currentBooking.itemBookings.reduce((sum, item) => sum + item.numberOfPeople, 0)} personas
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                  {currentBooking.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estado y acciones rápidas */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado de la Reserva</h3>
            {canEdit && !isEditing && (
              <Button onClick={handleStartEdit} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>

          {canEdit && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Button
                onClick={() => handleStatusChange('PENDING')}
                variant={currentBooking.status === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Pendiente</span>
              </Button>

              <Button
                onClick={() => handleStatusChange('CONFIRMED')}
                variant={currentBooking.status === 'CONFIRMED' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmada</span>
              </Button>

              <Button
                onClick={() => handleStatusChange('COMPLETED')}
                variant={currentBooking.status === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Completada</span>
              </Button>

              <Button
                onClick={() => handleStatusChange('CANCELLED')}
                variant={currentBooking.status === 'CANCELLED' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2 text-red-600"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelada</span>
              </Button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {showAdvancedFeatures && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">ID de Reserva:</span>
                <div className="font-mono text-gray-900">{currentBooking.id}</div>
              </div>
              <div>
                <span className="text-gray-500">Creada:</span>
                <div className="text-gray-900">
                  {format(parseISO(currentBooking.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Días desde creación:</span>
                <div className="text-gray-900">{bookingAge} días</div>
              </div>
              <div>
                <span className="text-gray-500">Última actualización:</span>
                <div className="text-gray-900">
                  {format(parseISO(currentBooking.updatedAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItemsTab = () => {
    if (!booking) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Items de la Reserva</h3>
        
        <div className="space-y-4">
          {booking.itemBookings.map((itemBooking, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{itemBooking.itemName}</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Horario:</span>
                      <div className="text-gray-900">
                        {itemBooking.startTime} - {itemBooking.endTime}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Personas:</span>
                      <div className="text-gray-900">{itemBooking.numberOfPeople}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Precio base:</span>
                      <div className="text-gray-900">${itemBooking.basePrice}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <div className="text-gray-900 font-semibold">${itemBooking.totalPrice}</div>
                    </div>
                  </div>

                  {itemBooking.selectedExtras && itemBooking.selectedExtras.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Extras seleccionados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {itemBooking.selectedExtras.map((extra, extraIndex) => (
                          <span 
                            key={extraIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {extra.name} (+${extra.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {itemBooking.notes && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Notas:</span>
                      <div className="text-sm text-gray-700 mt-1">{itemBooking.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen de precios */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">Resumen de Precios</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${booking.pricing.subtotal}</span>
            </div>
            {booking.pricing.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-${booking.pricing.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Impuestos:</span>
              <span className="text-gray-900">${booking.pricing.taxAmount}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">${booking.pricing.totalAmount}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderPaymentTab = () => {
    if (!booking) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
        
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Estado del Pago</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.pricing.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    booking.pricing.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.pricing.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="text-gray-900">{booking.pricing.paymentMethod || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto pagado:</span>
                  <span className="text-gray-900">${booking.pricing.paidAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto pendiente:</span>
                  <span className="text-gray-900">${booking.pricing.totalAmount - booking.pricing.paidAmount}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Detalles</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de transacción:</span>
                  <span className="text-gray-900 font-mono">
                    {booking.pricing.transactionId || 'N/A'}
                  </span>
                </div>
                {booking.pricing.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de pago:</span>
                    <span className="text-gray-900">
                      {format(parseISO(booking.pricing.paymentDate), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Acciones de pago */}
        {canEdit && booking.pricing.paymentStatus !== 'PAID' && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Acciones de Pago</h4>
            <div className="flex space-x-2">
              <Button
                onClick={() => onUpdate?.(booking.id, {
                  pricing: { 
                    ...booking.pricing, 
                    paymentStatus: 'PAID',
                    paidAmount: booking.pricing.totalAmount,
                    paymentDate: new Date().toISOString()
                  }
                })}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar como Pagado</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onSendEmail?.(booking, 'REMINDER')}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Recordatorio</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderNotesTab = () => {
    if (!booking) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Notas y Comentarios</h3>
        
        {/* Notas existentes */}
        {booking.notes ? (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Notas Existentes</h4>
            <div className="whitespace-pre-wrap text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
              {booking.notes}
            </div>
          </Card>
        ) : (
          <Card className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay notas para esta reserva</p>
          </Card>
        )}

        {/* Agregar nueva nota */}
        {canEdit && (
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Agregar Nota</h4>
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe una nota sobre esta reserva..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Agregar Nota</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderCustomerTab = () => {
    if (!booking) return null;

    // Simular historial del cliente
    const customerHistory = [
      {
        id: '1',
        date: '2024-05-15',
        service: 'Experiencia Gastronómica Regional',
        status: 'COMPLETED',
        amount: 89
      },
      {
        id: '2',
        date: '2024-04-20',
        service: 'Día de Relajación Completa',
        status: 'COMPLETED',
        amount: 125
      }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
        
        {/* Perfil del cliente */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Datos Personales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="text-gray-900">{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{booking.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="text-gray-900">{booking.customerPhone || 'No disponible'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total reservas:</span>
                  <span className="text-gray-900">{customerHistory.length + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total gastado:</span>
                  <span className="text-gray-900">
                    ${customerHistory.reduce((sum, h) => sum + h.amount, 0) + booking.pricing.totalAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente desde:</span>
                  <span className="text-gray-900">Abril 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Recurrente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Historial de reservas */}
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Historial de Reservas</span>
          </h4>
          <div className="space-y-3">
            {customerHistory.map((reservation) => (
              <div 
                key={reservation.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{reservation.service}</div>
                  <div className="text-sm text-gray-600">
                    {format(parseISO(reservation.date), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${reservation.amount}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    reservation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  if (!isOpen || !booking) return null;

  const tabs = [
    { id: 'DETAILS', label: 'Detalles', icon: Info },
    { id: 'ITEMS', label: 'Items', icon: Package },
    { id: 'PAYMENT', label: 'Pago', icon: CreditCard },
    { id: 'CUSTOMER', label: 'Cliente', icon: User },
    { id: 'NOTES', label: 'Notas', icon: MessageSquare }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalles de Reserva</h2>
            <p className="text-gray-600 mt-1">
              {booking.bundleName} - {booking.customerName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Acciones del header */}
            {showAdvancedFeatures && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportPDF?.(booking)}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicar</span>
                </Button>

                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </Button>
                )}
              </>
            )}

            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la tab */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'DETAILS' && renderDetailsTab()}
          {activeTab === 'ITEMS' && renderItemsTab()}
          {activeTab === 'PAYMENT' && renderPaymentTab()}
          {activeTab === 'CUSTOMER' && renderCustomerTab()}
          {activeTab === 'NOTES' && renderNotesTab()}
        </div>

        {/* Footer con acciones */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-2 p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)} />
          
          <Card className="w-full max-w-md bg-white z-10 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}; 