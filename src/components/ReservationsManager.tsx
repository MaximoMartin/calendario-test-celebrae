import React, { useState, useMemo, useRef } from 'react';
import { useShopState } from '../hooks/useShopState';
import { useEntitiesState } from '../hooks/useEntitiesState';
import { useReservations } from '../features/reservations/mockData';
import { ReservationDetailPanel } from './ReservationDetailPanel';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { XCircle, Eye, Zap, CheckCircle, X as XIcon, Check, Slash } from 'lucide-react';
import type { ReservaItem } from '../types';
import { getItemAvailability, getAvailableSlotsForItem } from '../features/reservations/availabilityValidation';
import { v4 as uuidv4 } from 'uuid';
import { formatReservationStatus } from '../utils/formatHelpers';

const RESERVATION_STATES = [
  { value: '', label: 'Todos los estados' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'RESCHEDULED', label: 'Reprogramada' },
  { value: 'PARTIAL_REFUND', label: 'Reembolso parcial' }
];

const getAvailableActions = (status: string) => {
  switch (status) {
    case 'PENDING':
      return ['CONFIRM', 'CANCEL', 'RESCHEDULE'];
    case 'CONFIRMED':
      return ['COMPLETE', 'NO_SHOW', 'CANCEL', 'RESCHEDULE'];
    case 'COMPLETED':
    case 'NO_SHOW':
    case 'CANCELLED':
      return ['RESCHEDULE'];
    default:
      return [];
  }
};

// Hook para manejar el menú contextual de acciones
function useActionMenu() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleOpen = (id: string) => {
    setOpenMenuId(id);
    // Calcular posición del botón
    const div = buttonRefs.current[id];
    if (div) {
      const rect = div.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4, // 4px de separación
        left: rect.right - 208 + window.scrollX // 208px = ancho del menú (w-52)
      });
    }
  };
  const handleClose = () => {
    setOpenMenuId(null);
    setMenuPosition(null);
  };
  return { openMenuId, handleOpen, handleClose, buttonRefs, menuPosition };
}

export const ReservationsManager: React.FC = () => {
  const { selectedShop } = useShopState();
  const { allBundles, allShops } = useEntitiesState();
  const { reservasItems, setReservasItems } = useReservations();

  // Filtros y estado
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [bundleFilter, setBundleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservaItem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<{ reservation: ReservaItem } | null>(null);

  // Estado para el modal de reprogramación
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ startTime: string; endTime: string }[]>([]);

  // Bundles del shop
  const shopBundles = useMemo(() => allBundles.filter(b => b.shopId === selectedShop.id), [allBundles, selectedShop.id]);

  // Helper para obtener todos los items embebidos
  const allItems = useMemo(() => allBundles.flatMap(b => b.items), [allBundles]);

  // Reservas filtradas
  const filteredReservations = useMemo(() => {
    return reservasItems
      .filter(r => r.shopId === selectedShop.id)
      .filter(r => !stateFilter || r.status === stateFilter)
      .filter(r => !bundleFilter || r.bundleId === bundleFilter)
      .filter(r => !dateFilter || r.date === dateFilter)
      .filter(r => {
        if (!search) return true;
        const bundle = allBundles.find(b => b.id === r.bundleId);
        return (
          r.customerInfo?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.customerInfo?.email?.toLowerCase().includes(search.toLowerCase()) ||
          bundle?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.id.toLowerCase().includes(search.toLowerCase())
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reservasItems, selectedShop.id, stateFilter, bundleFilter, dateFilter, search, allBundles]);

  // Acción para cambiar el estado de una reserva
  const handleChangeStatus = (resId: string, newStatus: string) => {
    setReservasItems(prev => prev.map(r =>
      r.id === resId ? { ...r, status: newStatus as ReservaItem['status'], updatedAt: new Date().toISOString() } : r
    ));
    let msg = '';
    switch (newStatus) {
      case 'CONFIRMED': msg = 'Reserva confirmada.'; break;
      case 'CANCELLED': msg = 'Reserva cancelada.'; break;
      case 'COMPLETED': msg = 'Reserva marcada como completada.'; break;
      case 'NO_SHOW': msg = 'Reserva marcada como No Show.'; break;
      default: msg = 'Estado actualizado.';
    }
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 2000);
  };

  const { openMenuId, handleOpen, handleClose, buttonRefs, menuPosition } = useActionMenu();

  // Lógica de reprogramación
  const handleReschedule = async () => {
    setRescheduleError(null);
    setRescheduleLoading(true);
    const reservation = showRescheduleModal?.reservation;
    if (!reservation) {
      setRescheduleError('Reserva no encontrada');
      setRescheduleLoading(false);
      return;
    }
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Debes seleccionar fecha y horario');
      setRescheduleLoading(false);
      return;
    }
    if (!rescheduleReason.trim()) {
      setRescheduleError('Debes ingresar el motivo de la reprogramación');
      setRescheduleLoading(false);
      return;
    }
    // Validar disponibilidad del item
    const reservasSinOriginal = reservasItems.filter(r => r.id !== reservation.id);
    const availability = getItemAvailability(
      reservation.itemId,
      rescheduleDate,
      reservation.timeSlot ? { ...reservation.timeSlot, startTime: rescheduleTime, endTime: reservation.timeSlot.endTime } : { startTime: rescheduleTime, endTime: '' },
      reservasSinOriginal,
      allItems,
      allShops
    );
    if (!availability.isAvailable) {
      setRescheduleError('El horario seleccionado no está disponible.');
      setRescheduleLoading(false);
      return;
    }
    // Crear nueva reserva duplicada
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newReservation: ReservaItem = {
      ...reservation,
      id: newId,
      date: rescheduleDate,
      timeSlot: { ...reservation.timeSlot, startTime: rescheduleTime },
      status: 'CONFIRMED',
      originalReservationId: reservation.id,
      rescheduledToReservationId: undefined,
      createdAt: now,
      updatedAt: now,
      history: [
        ...(reservation.history || []),
        {
          id: uuidv4(),
          action: 'MODIFIED',
          timestamp: now,
          userId: 'SELLER',
          userType: 'SELLER',
          details: {
            reason: rescheduleReason,
            changes: [
              { field: 'date', previousValue: reservation.date, newValue: rescheduleDate, description: 'Cambio de fecha' },
              { field: 'timeSlot', previousValue: reservation.timeSlot, newValue: { ...reservation.timeSlot, startTime: rescheduleTime }, description: 'Cambio de horario' }
            ]
          },
          notes: rescheduleReason
        }
      ]
    };
    // Actualizar la original
    const updatedOriginal: ReservaItem = {
      ...reservation,
      status: 'RESCHEDULED',
      rescheduledToReservationId: newId,
      updatedAt: now,
      history: [
        ...(reservation.history || []),
        {
          id: uuidv4(),
          action: 'MODIFIED',
          timestamp: now,
          userId: 'SELLER',
          userType: 'SELLER',
          details: {
            reason: rescheduleReason,
            changes: [
              { field: 'status', previousValue: reservation.status, newValue: 'RESCHEDULED', description: 'Reserva reprogramada' }
            ]
          },
          notes: rescheduleReason
        }
      ]
    };
    // Guardar en el estado global
    setReservasItems(prev => [
      ...prev.map(r => r.id === reservation.id ? updatedOriginal : r),
      newReservation
    ]);
    setRescheduleSuccess(true);
    setTimeout(() => {
      setShowRescheduleModal(null);
      setRescheduleSuccess(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setRescheduleReason('');
      setRescheduleError(null);
      setRescheduleLoading(false);
    }, 1500);
  };

  // Actualizar horarios disponibles al cambiar la fecha
  React.useEffect(() => {
    if (showRescheduleModal && rescheduleDate) {
      const itemId = showRescheduleModal.reservation.itemId;
      // Obtener slots disponibles usando la función utilitaria (corregido)
      const slots = getAvailableSlotsForItem(
        itemId,
        rescheduleDate,
        allItems,
        allShops,
        reservasItems
      )
        .filter(s => s.availability.isAvailable)
        .map(s => s.timeSlot);
      setAvailableTimeSlots(slots);
      // Si el horario seleccionado ya no está disponible, resetear
      if (!slots.find(s => s.startTime === rescheduleTime)) {
        setRescheduleTime('');
      }
    } else {
      setAvailableTimeSlots([]);
      setRescheduleTime('');
    }
  }, [showRescheduleModal, rescheduleDate, allItems, allShops, reservasItems]);

  return (
    <div className="space-y-6">
      <Card title="Gestión de Reservas" subtitle={`Shop: ${selectedShop.name}`}> 
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div className="w-64">
            <Input
              label="Buscar"
              placeholder="Cliente, email, bundle, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Estado"
              options={RESERVATION_STATES}
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            />
          </div>
          <div className="w-56">
            <Select
              label="Bundle"
              options={[{ value: '', label: 'Todos los bundles' }, ...shopBundles.map(b => ({ value: b.id, label: b.name }))]}
              value={bundleFilter}
              onChange={e => setBundleFilter(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Input
              label="Fecha"
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
          {(search || stateFilter || bundleFilter || dateFilter) && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStateFilter(''); setBundleFilter(''); setDateFilter(''); }}>
              <XCircle className="w-4 h-4 mr-1" /> Limpiar filtros
            </Button>
          )}
        </div>

        {/* Tabla de reservas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bundle</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personas</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">No se encontraron reservas</td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const bundle = allBundles.find(b => b.id === res.bundleId);
                  const actions = getAvailableActions(res.status);
                  return (
                    <tr key={res.id} className="hover:bg-blue-50 transition cursor-pointer">
                      <td className="px-4 py-2 font-mono text-xs text-gray-700">{res.id}</td>
                      <td className="px-4 py-2 text-gray-900">{res.customerInfo?.name || '-'}</td>
                      <td className="px-4 py-2 text-gray-700">{bundle?.name || '-'}</td>
                      <td className="px-4 py-2 text-gray-700">{res.date}</td>
                      <td className="px-4 py-2 text-gray-700">{res.timeSlot.startTime} - {res.timeSlot.endTime}</td>
                      <td className="px-4 py-2 text-gray-700">{res.numberOfPeople}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          res.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {formatReservationStatus(res.status, res)}
                        </span>
                      </td>
                      <td className="px-4 py-2 min-w-[180px] relative">
                        <div className="flex items-center gap-4">
                          <Button size="sm" variant="primary" onClick={() => setSelectedReservation(res)} className="font-semibold">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalle
                          </Button>
                          {(actions.length > 0 || actions.includes('RESCHEDULE')) && (
                            <div className="relative" ref={el => { buttonRefs.current[res.id] = el; }}>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (openMenuId === res.id) handleClose();
                                  else handleOpen(res.id);
                                }}
                                aria-label="Acciones de reserva"
                                className="flex items-center gap-2"
                              >
                                <Zap className="w-4 h-4" />
                                Acciones
                              </Button>
                              {openMenuId === res.id && menuPosition && (
                                <div
                                  className="w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                                  style={{
                                    position: 'fixed',
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                  }}
                                >
                                  <ul className="py-2">
                                    {actions.includes('CONFIRM') && (
                                      <li>
                                        <button
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50"
                                          onClick={() => { handleChangeStatus(res.id, 'CONFIRMED'); handleClose(); }}
                                        >
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                          Confirmar
                                        </button>
                                      </li>
                                    )}
                                    {actions.includes('COMPLETE') && (
                                      <li>
                                        <button
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50"
                                          onClick={() => { handleChangeStatus(res.id, 'COMPLETED'); handleClose(); }}
                                        >
                                          <Check className="w-4 h-4 text-blue-600" />
                                          Completar
                                        </button>
                                      </li>
                                    )}
                                    {actions.includes('NO_SHOW') && (
                                      <li>
                                        <button
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50"
                                          onClick={() => { handleChangeStatus(res.id, 'NO_SHOW'); handleClose(); }}
                                        >
                                          <Slash className="w-4 h-4 text-gray-500" />
                                          No Show
                                        </button>
                                      </li>
                                    )}
                                    {actions.includes('CANCEL') && (
                                      <li>
                                        <button
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                                          onClick={() => { handleChangeStatus(res.id, 'CANCELLED'); handleClose(); }}
                                        >
                                          <XIcon className="w-4 h-4" />
                                          Cancelar
                                        </button>
                                      </li>
                                    )}
                                    {actions.includes('RESCHEDULE') && (
                                      <li>
                                        <button
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-purple-50 text-purple-700"
                                          onClick={() => { setShowRescheduleModal({ reservation: res }); handleClose(); }}
                                        >
                                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                                          Reprogramar
                                        </button>
                                      </li>
                                    )}
                                    {actions.length === 0 && (
                                      <li>
                                        <span className="block px-4 py-2 text-sm text-gray-400">Sin acciones</span>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mensaje de feedback de acción */}
        {actionMessage && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
            {actionMessage}
          </div>
        )}
      </Card>

      {/* Panel de detalle de reserva */}
      {selectedReservation && (
        <ReservationDetailPanel
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onNavigateToReservation={(reservationId) => {
            const found = reservasItems.find(r => r.id === reservationId);
            if (found) setSelectedReservation(found);
          }}
        />
      )}
      {/* Cerrar menú contextual al hacer click fuera */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClose}
          aria-label="Cerrar menú contextual"
        />
      )}

      {/* Modal de reprogramación */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Reprogramar Reserva</h2>
            <p className="text-gray-700 mb-2">Reserva actual: <span className="font-mono text-xs">{showRescheduleModal.reservation.id}</span></p>
            <p className="text-gray-600 mb-4">Selecciona la nueva fecha y horario, y explica el motivo de la reprogramación.</p>
            <div className="flex flex-col gap-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Nueva fecha</label>
              <input type="date" className="border rounded px-3 py-2" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
              <label className="text-sm font-medium text-gray-700">Nuevo horario</label>
              <select
                className="border rounded px-3 py-2"
                value={rescheduleTime}
                onChange={e => setRescheduleTime(e.target.value)}
                disabled={availableTimeSlots.length === 0}
              >
                <option value="">{availableTimeSlots.length === 0 ? 'No hay horarios disponibles' : 'Selecciona un horario'}</option>
                {availableTimeSlots.map((slot, idx) => (
                  <option key={idx} value={slot.startTime}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
              {availableTimeSlots.length === 0 && rescheduleDate && (
                <div className="text-red-600 text-sm">No hay horarios disponibles para la fecha seleccionada.</div>
              )}
              <label className="text-sm font-medium text-gray-700">Motivo de reprogramación</label>
              <textarea className="border rounded px-3 py-2" rows={2} placeholder="Explica el motivo..." value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)} />
              {rescheduleError && <div className="text-red-600 text-sm">{rescheduleError}</div>}
              {rescheduleSuccess && <div className="text-green-600 text-sm">¡Reserva reprogramada exitosamente!</div>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRescheduleModal(null)} disabled={rescheduleLoading}>Cancelar</Button>
              <Button
                className="bg-purple-600 text-white"
                onClick={handleReschedule}
                loading={rescheduleLoading}
                disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime || !rescheduleReason || availableTimeSlots.length === 0}
              >
                Confirmar reprogramación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 