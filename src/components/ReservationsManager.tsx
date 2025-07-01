import React, { useState, useMemo } from 'react';
import { useShopState } from '../hooks/useShopState';
import { useEntitiesState } from '../hooks/useEntitiesState';
import { useReservations } from '../features/reservations/mockData';
import { ReservationDetailPanel } from './ReservationDetailPanel';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { XCircle, MoreVertical } from 'lucide-react';
import type { ReservaItem } from '../types';

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
      return ['CONFIRM', 'CANCEL'];
    case 'CONFIRMED':
      return ['COMPLETE', 'NO_SHOW', 'CANCEL'];
    case 'COMPLETED':
    case 'NO_SHOW':
    case 'CANCELLED':
      return [];
    default:
      return [];
  }
};

// Hook para manejar el menú contextual de acciones
function useActionMenu() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const handleOpen = (id: string) => setOpenMenuId(id);
  const handleClose = () => setOpenMenuId(null);
  return { openMenuId, handleOpen, handleClose };
}

export const ReservationsManager: React.FC = () => {
  const { selectedShop } = useShopState();
  const { allBundles } = useEntitiesState();
  const { reservasItems, setReservasItems } = useReservations();

  // Filtros y estado
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [bundleFilter, setBundleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<ReservaItem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Bundles del shop
  const shopBundles = useMemo(() => allBundles.filter(b => b.shopId === selectedShop.id), [allBundles, selectedShop.id]);

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

  const { openMenuId, handleOpen, handleClose } = useActionMenu();

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
                          {RESERVATION_STATES.find(s => s.value === res.status)?.label || res.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 min-w-[140px] relative">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedReservation(res)}>
                            Ver Detalle
                          </Button>
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={e => {
                                e.stopPropagation();
                                if (openMenuId === res.id) {
                                  handleClose();
                                } else {
                                  handleOpen(res.id);
                                }
                              }}
                              aria-label="Acciones"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {openMenuId === res.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <ul className="py-1">
                                  {actions.includes('CONFIRM') && (
                                    <li>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                                        onClick={() => { handleChangeStatus(res.id, 'CONFIRMED'); handleClose(); }}
                                      >
                                        Confirmar
                                      </button>
                                    </li>
                                  )}
                                  {actions.includes('COMPLETE') && (
                                    <li>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                                        onClick={() => { handleChangeStatus(res.id, 'COMPLETED'); handleClose(); }}
                                      >
                                        Completar
                                      </button>
                                    </li>
                                  )}
                                  {actions.includes('NO_SHOW') && (
                                    <li>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                                        onClick={() => { handleChangeStatus(res.id, 'NO_SHOW'); handleClose(); }}
                                      >
                                        No Show
                                      </button>
                                    </li>
                                  )}
                                  {actions.includes('CANCEL') && (
                                    <li>
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-red-600"
                                        onClick={() => { handleChangeStatus(res.id, 'CANCELLED'); handleClose(); }}
                                      >
                                        Cancelar
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
    </div>
  );
}; 