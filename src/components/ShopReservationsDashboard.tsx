import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar,
  Filter,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Package,
  Eye,
  ChevronDown,
  ChevronUp,
  Edit,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';
import type { ReservaItem } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { ShopStatsCard } from './ShopStatsCard';
import { bundles, items } from '../mockData/entitiesData';
import { mockShops } from '../mockData';
import { getReservasBySellerUserId, SELLER_USER_ID } from '../features/reservations/mockData';
import { ReservationManagementModal } from '../features/reservations/components/ReservationManagementModal';
import { useShopState } from '../hooks/useShopState';

// 🎯 CHECKPOINT 7: PANEL DE GESTIÓN DE RESERVAS POR SHOP PARA SELLER

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  shopId: string;
  bundleId: string;
}

export const ShopReservationsDashboard: React.FC = () => {
  // 🎯 CHECKPOINT 9.7: HOOK DE ESTADO REACTIVO DEL SHOP
  const { selectedShop, selectedShopId } = useShopState();

  // Estado principal
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: 'all',
    shopId: 'all',
    bundleId: 'all'
  });

  const [expandedShops, setExpandedShops] = useState<Set<string>>(new Set());
  const [selectedReservation, setSelectedReservation] = useState<ReservaItem | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);

  // 🎯 CHECKPOINT 9.7: REACTIVIDAD AL CAMBIO DE SHOP
  useEffect(() => {
    // Cambiar automáticamente el filtro al shop seleccionado cuando cambia
    setFilterState(prev => ({ 
      ...prev, 
      shopId: selectedShopId
    }));
    
    console.log('🏢 SELLER Panel actualizado para shop:', selectedShop.name);
    console.log('📋 Reservas visibles filtradas por shop activo');
  }, [selectedShopId, selectedShop.name]);

  // Obtener todas las reservas del seller
  const sellerReservations = useMemo(() => {
    return getReservasBySellerUserId(SELLER_USER_ID);
  }, []);

  // Aplicar filtros
  const filteredReservations = useMemo(() => {
    let filtered = sellerReservations;

    // Filtro por texto
    if (filterState.search.trim()) {
      const searchLower = filterState.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.customerInfo?.name.toLowerCase().includes(searchLower) ||
        r.customerInfo?.email.toLowerCase().includes(searchLower) ||
        r.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por fechas
    if (filterState.dateFrom) {
      filtered = filtered.filter(r => r.date >= filterState.dateFrom);
    }
    if (filterState.dateTo) {
      filtered = filtered.filter(r => r.date <= filterState.dateTo);
    }

    // Filtro por estado
    if (filterState.status !== 'all') {
      filtered = filtered.filter(r => r.status === filterState.status);
    }

    // Filtro por shop
    if (filterState.shopId !== 'all') {
      filtered = filtered.filter(r => r.shopId === filterState.shopId);
    }

    // Filtro por bundle
    if (filterState.bundleId !== 'all') {
      filtered = filtered.filter(r => r.bundleId === filterState.bundleId);
    }

    return filtered;
  }, [sellerReservations, filterState]);

  // Agrupar reservas por shop
  const reservationsByShop = useMemo(() => {
    const grouped = new Map<string, ReservaItem[]>();
    
    filteredReservations.forEach(reservation => {
      const shopId = reservation.shopId;
      if (!grouped.has(shopId)) {
        grouped.set(shopId, []);
      }
      grouped.get(shopId)!.push(reservation);
    });

    // Ordenar las reservas dentro de cada grupo por fecha
    grouped.forEach(reservations => {
      reservations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return grouped;
  }, [filteredReservations]);

  // Las estadísticas ahora se manejan con ShopStatsCard

  // Helper functions
  const getBundleName = (bundleId: string) => {
    return bundles.find(bundle => bundle.id === bundleId)?.name || 'Bundle Desconocido';
  };

  const getItemName = (itemId: string) => {
    return items.find(item => item.id === itemId)?.title || 'Item Desconocido';
  };

  const toggleShopExpansion = (shopId: string) => {
    const newExpanded = new Set(expandedShops);
    if (newExpanded.has(shopId)) {
      newExpanded.delete(shopId);
    } else {
      newExpanded.add(shopId);
    }
    setExpandedShops(newExpanded);
  };

  const handleReservationAction = (reservation: ReservaItem) => {
    setSelectedReservation(reservation);
    setShowManagementModal(true);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterState({
      search: '',
      dateFrom: '',
      dateTo: '',
      status: 'all',
      shopId: 'all',
      bundleId: 'all'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'MODIFIED': return <Edit className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
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

  // Opciones para los selects
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'CONFIRMED', label: 'Confirmadas' },
    { value: 'CANCELLED', label: 'Canceladas' },
    { value: 'COMPLETED', label: 'Completadas' },
    { value: 'MODIFIED', label: 'Modificadas' }
  ];

  const shopOptions = [
    { value: 'all', label: 'Todos los shops' },
    ...Array.from(new Set(sellerReservations.map(r => r.shopId)))
      .map(shopId => {
        const shop = mockShops.find((s: any) => s.id === shopId);
        return {
          value: shopId,
          label: shop?.name || `Shop ${shopId.substring(0, 8)}`
        };
      })
  ];

  const bundleOptions = [
    { value: 'all', label: 'Todos los bundles' },
    ...Array.from(new Set(filteredReservations.map(r => r.bundleId)))
      .map(bundleId => ({
        value: bundleId,
        label: getBundleName(bundleId)
      }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-6 h-6 mr-3 text-blue-600" />
              Panel de Gestión SELLER
            </h1>
            <p className="text-gray-600 mt-1">
              Vista consolidada de reservas por shops
            </p>
          </div>
        </div>
      </div>

      {/* 🎯 CHECKPOINT 9.6: ESTADÍSTICAS USANDO COMPONENTE REUTILIZABLE */}
      <ShopStatsCard />

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <Input
              value={filterState.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Cliente, email..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <Input
              type="date"
              value={filterState.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <Input
              type="date"
              value={filterState.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <Select
              options={statusOptions}
              value={filterState.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
            <Select
              options={shopOptions}
              value={filterState.shopId}
              onChange={(e) => updateFilter('shopId', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle</label>
            <Select
              options={bundleOptions}
              value={filterState.bundleId}
              onChange={(e) => updateFilter('bundleId', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredReservations.length} reserva{filteredReservations.length !== 1 ? 's' : ''} encontrada{filteredReservations.length !== 1 ? 's' : ''}
          </span>
          <span>
            {reservationsByShop.size} shop{reservationsByShop.size !== 1 ? 's' : ''} con reservas
          </span>
        </div>
      </Card>

      {/* Lista de reservas agrupadas por shop */}
      <div className="space-y-4">
        {Array.from(reservationsByShop.entries()).map(([shopId, reservations]) => {
          const shop = mockShops.find((s: any) => s.id === shopId);
          const shopName = shop?.name || `Shop ${shopId.substring(0, 8)}`;
          const isExpanded = expandedShops.has(shopId);

          return (
            <Card key={shopId} className="overflow-hidden">
              {/* Shop Header */}
              <button
                onClick={() => toggleShopExpansion(shopId)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{shopName}</h3>
                    <p className="text-sm text-gray-600">
                      {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Reservations List */}
              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Row 1: Status, Customer, Bundle */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(reservation.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                                {reservation.status}
                              </span>
                              {reservation.isTemporary && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                  TEMPORAL
                                </span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReservationAction(reservation)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Gestionar</span>
                            </Button>
                          </div>

                          {/* Row 2: Customer Info */}
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {reservation.customerInfo?.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {reservation.customerInfo?.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {reservation.customerInfo?.phone}
                              </span>
                            </div>
                          </div>

                          {/* Row 3: Service Details */}
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {getBundleName(reservation.bundleId)} • {getItemName(reservation.itemId)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {formatDate(reservation.date)} • {formatTime(reservation.timeSlot)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {reservation.numberOfPeople} persona{reservation.numberOfPeople !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Row 4: Additional Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-semibold text-gray-900">
                                €{reservation.totalPrice}
                              </span>
                              {reservation.history && reservation.history.length > 1 && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {reservation.history.length - 1} modificacion{reservation.history.length - 1 !== 1 ? 'es' : ''}
                                </span>
                              )}
                            </div>
                            {reservation.notes && (
                              <div className="flex items-center space-x-2 max-w-md">
                                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600 truncate" title={reservation.notes}>
                                  {reservation.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}

        {reservationsByShop.size === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron reservas
            </h3>
            <p className="text-gray-600">
              Ajusta los filtros para ver más reservas o verifica que tengas reservas en tus shops.
            </p>
          </Card>
        )}
      </div>

      {/* Modal de gestión */}
      {showManagementModal && selectedReservation && (
        <ReservationManagementModal
          reservation={selectedReservation}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedReservation(null);
          }}
          onReservationUpdated={(updatedReservation) => {
            console.log('🔄 Reserva actualizada:', updatedReservation);
            setShowManagementModal(false);
            setSelectedReservation(null);
          }}
          onReservationCancelled={(cancelledReservation) => {
            console.log('❌ Reserva cancelada:', cancelledReservation);
            setShowManagementModal(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}; 