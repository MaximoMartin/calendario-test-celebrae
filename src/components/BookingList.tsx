// ========================================
// LISTA AVANZADA DE RESERVAS - NUEVO MODELO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { 
  Booking, Bundle, BookingStatus, BundleItem 
} from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Search, Filter, ChevronDown, ChevronUp, Eye, Edit3, 
  Trash2, CheckCircle, XCircle, RotateCcw, Clock, 
  User, Calendar, Package, DollarSign, Phone, Mail, 
  MoreHorizontal, Download, Printer, ArrowUpDown,
  Users, MapPin, Star
} from 'lucide-react';

interface BookingListProps {
  bookings: Booking[];
  bundles: Bundle[];
  onBookingClick?: (booking: Booking) => void;
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
  onEditBooking?: (bookingId: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onBulkAction?: (bookingIds: string[], action: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface BookingFilters {
  search: string;
  status: BookingStatus | 'all';
  bundleId: string;
  dateFrom: string;
  dateTo: string;
  isManual: 'all' | 'true' | 'false';
}

type SortField = 'date' | 'customerName' | 'bundleName' | 'status' | 'totalAmount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  bundles,
  onBookingClick,
  onStatusChange,
  onEditBooking,
  onDeleteBooking,
  onBulkAction,
  canEdit = true,
  canDelete = false
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: 'all',
    bundleId: 'all',
    dateFrom: '',
    dateTo: '',
    isManual: 'all'
  });

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ========================================
  // FILTRADO Y ORDENAMIENTO
  // ========================================

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings;

    // Filtro de búsqueda
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query) ||
        booking.customerPhone.includes(query) ||
        booking.bundleName.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query) ||
        booking.itemBookings.some(item => 
          item.itemName.toLowerCase().includes(query)
        )
      );
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filtro por bundle
    if (filters.bundleId !== 'all') {
      filtered = filtered.filter(booking => booking.bundleId === filters.bundleId);
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      filtered = filtered.filter(booking => booking.date >= filters.dateFrom);
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      filtered = filtered.filter(booking => booking.date <= filters.dateTo);
    }

    // Filtro por tipo (manual/automática)
    if (filters.isManual !== 'all') {
      filtered = filtered.filter(booking => 
        booking.isManual === (filters.isManual === 'true')
      );
    }

    // Ordenamiento
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'bundleName':
          aValue = a.bundleName.toLowerCase();
          bValue = b.bundleName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'totalAmount':
          aValue = a.pricing.totalAmount;
          bValue = b.pricing.totalAmount;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [bookings, filters, sortField, sortDirection]);

  // ========================================
  // PAGINACIÓN
  // ========================================

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedBookings.slice(startIndex, endIndex);
  }, [filteredAndSortedBookings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const listStats = useMemo(() => {
    const stats = filteredAndSortedBookings.reduce(
      (acc, booking) => {
        acc.total++;
        acc.totalRevenue += booking.pricing.totalAmount;
        
        switch (booking.status) {
          case 'PENDING':
            acc.pending++;
            break;
          case 'CONFIRMED':
            acc.confirmed++;
            break;
          case 'CANCELLED':
            acc.cancelled++;
            break;
          case 'COMPLETED':
            acc.completed++;
            break;
        }
        
        return acc;
      },
      { 
        total: 0, 
        pending: 0, 
        confirmed: 0, 
        cancelled: 0, 
        completed: 0,
        totalRevenue: 0 
      }
    );

    return stats;
  }, [filteredAndSortedBookings]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleSelectBooking = useCallback((bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map(b => b.id));
    }
  }, [selectedBookings.length, paginatedBookings]);

  const handleFilterChange = useCallback((key: keyof BookingFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset a primera página
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    if (selectedBookings.length > 0 && onBulkAction) {
      onBulkAction(selectedBookings, action);
      setSelectedBookings([]);
    }
  }, [selectedBookings, onBulkAction]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      bundleId: 'all',
      dateFrom: '',
      dateTo: '',
      isManual: 'all'
    });
    setCurrentPage(1);
  }, []);

  // ========================================
  // UTILIDADES DE RENDERIZADO
  // ========================================

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      case 'RESCHEDULED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'NO_SHOW':
        return <XCircle className="w-4 h-4" />;
      case 'RESCHEDULED':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{listStats.total}</div>
          <div className="text-sm text-gray-600">Total Reservas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{listStats.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{listStats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmadas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{listStats.completed}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{listStats.cancelled}</div>
          <div className="text-sm text-gray-600">Canceladas</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(listStats.totalRevenue)}</div>
          <div className="text-sm text-gray-600">Ingresos</div>
        </Card>
      </div>

      {/* Controles y filtros */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Búsqueda y controles principales */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente, email, servicio..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
              
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'compact' | 'detailed')}
                options={[
                  { value: 'detailed', label: 'Detallado' },
                  { value: 'compact', label: 'Compacto' }
                ]}
              />
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'PENDING', label: 'Pendiente' },
                    { value: 'CONFIRMED', label: 'Confirmada' },
                    { value: 'CANCELLED', label: 'Cancelada' },
                    { value: 'COMPLETED', label: 'Completada' },
                    { value: 'NO_SHOW', label: 'No show' },
                    { value: 'RESCHEDULED', label: 'Reprogramada' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <Select
                  value={filters.bundleId}
                  onChange={(e) => handleFilterChange('bundleId', e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    ...bundles.map(bundle => ({
                      value: bundle.id,
                      label: bundle.name
                    }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          )}

          {/* Acciones masivas */}
          {selectedBookings.length > 0 && (
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedBookings.length} reservas seleccionadas
              </span>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleBulkAction('confirm')}>
                  Confirmar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('cancel')}>
                  Cancelar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de reservas */}
      <Card className="overflow-hidden">
        {/* Header de tabla */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </div>
            <div 
              className="col-span-2 flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('customerName')}
            >
              <span>Cliente</span>
              {getSortIcon('customerName')}
            </div>
            <div 
              className="col-span-2 flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('bundleName')}
            >
              <span>Servicio</span>
              {getSortIcon('bundleName')}
            </div>
            <div 
              className="col-span-1 flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('date')}
            >
              <span>Fecha</span>
              {getSortIcon('date')}
            </div>
            <div 
              className="col-span-1 flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('status')}
            >
              <span>Estado</span>
              {getSortIcon('status')}
            </div>
            <div 
              className="col-span-1 flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('totalAmount')}
            >
              <span>Total</span>
              {getSortIcon('totalAmount')}
            </div>
            <div className="col-span-1">Actividades</div>
            <div className="col-span-2">Contacto</div>
            <div className="col-span-1 text-center">Acciones</div>
          </div>
        </div>

        {/* Filas de datos */}
        <div className="divide-y">
          {paginatedBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onBookingClick?.(booking)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectBooking(booking.id);
                    }}
                    className="rounded border-gray-300"
                  />
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      {booking.isManual && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Manual</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{booking.bundleName}</span>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(parseISO(booking.date), 'dd/MM', { locale: es })}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatCurrency(booking.pricing.totalAmount)}</span>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{booking.itemBookings.length}</span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{booking.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(booking);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBooking?.(booking.id);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {paginatedBookings.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-600 mb-4">
              {filteredAndSortedBookings.length === 0 
                ? "No se encontraron reservas que coincidan con los filtros."
                : "No hay más reservas en esta página."
              }
            </p>
            {filteredAndSortedBookings.length === 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedBookings.length)} de {filteredAndSortedBookings.length} reservas
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 