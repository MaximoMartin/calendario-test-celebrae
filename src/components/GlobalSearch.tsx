// ========================================
// BÚSQUEDA GLOBAL AVANZADA - NUEVO MODELO
// ========================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { 
  Booking, Bundle, BundleItem, GlobalSearchResult, 
  SearchFilters, BookingStatus, CustomerData 
} from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Search, Filter, X, User, Calendar, Package, 
  Clock, Phone, Mail, MapPin, Star, ChevronRight 
} from 'lucide-react';

interface GlobalSearchProps {
  bookings: Booking[];
  bundles: Bundle[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchResults?: GlobalSearchResult[];
  isSearching?: boolean;
  onBookingClick?: (bookingId: string) => void;
  onBundleClick?: (bundleId: string) => void;
  onCustomerClick?: (customerEmail: string) => void;
  onItemClick?: (itemId: string) => void;
}

interface SearchStats {
  totalResults: number;
  bookingsCount: number;
  customersCount: number;
  bundlesCount: number;
  itemsCount: number;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  bookings,
  bundles,
  searchQuery = '',
  onSearchChange,
  searchResults = [],
  isSearching = false,
  onBookingClick,
  onBundleClick,
  onCustomerClick,
  onItemClick
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(internalQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [internalQuery, onSearchChange]);

  // ========================================
  // MOTOR DE BÚSQUEDA INTERNO
  // ========================================

  const internalSearchResults = useMemo(() => {
    if (!internalQuery.trim()) return [];

    const query = internalQuery.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    // Buscar en reservas
    bookings.forEach(booking => {
      let relevance = 0;
      let matchedFields: string[] = [];

      // Buscar en campos principales
      if (booking.customerName.toLowerCase().includes(query)) {
        relevance += 10;
        matchedFields.push('nombre');
      }
      if (booking.customerEmail.toLowerCase().includes(query)) {
        relevance += 8;
        matchedFields.push('email');
      }
      if (booking.customerPhone.includes(query)) {
        relevance += 8;
        matchedFields.push('teléfono');
      }
      if (booking.bundleName.toLowerCase().includes(query)) {
        relevance += 6;
        matchedFields.push('bundle');
      }
      if (booking.id.toLowerCase().includes(query)) {
        relevance += 5;
        matchedFields.push('ID');
      }
      if (booking.notes?.toLowerCase().includes(query)) {
        relevance += 3;
        matchedFields.push('notas');
      }

      // Buscar en items individuales
      booking.itemBookings.forEach(itemBooking => {
        if (itemBooking.itemName.toLowerCase().includes(query)) {
          relevance += 4;
          matchedFields.push('actividad');
        }
        if (itemBooking.notes?.toLowerCase().includes(query)) {
          relevance += 2;
          matchedFields.push('notas de actividad');
        }
      });

      if (relevance > 0) {
        results.push({
          type: 'booking',
          id: booking.id,
          title: `${booking.customerName} - ${booking.bundleName}`,
          subtitle: `${format(parseISO(booking.date), 'dd/MM/yyyy', { locale: es })} - ${booking.status}`,
          data: booking,
          relevance
        });
      }
    });

    // Buscar en bundles
    bundles.forEach(bundle => {
      let relevance = 0;
      let matchedFields: string[] = [];

      if (bundle.name.toLowerCase().includes(query)) {
        relevance += 10;
        matchedFields.push('nombre');
      }
      if (bundle.description.toLowerCase().includes(query)) {
        relevance += 6;
        matchedFields.push('descripción');
      }
      if (bundle.category.toLowerCase().includes(query)) {
        relevance += 4;
        matchedFields.push('categoría');
      }

      // Buscar en items del bundle
      bundle.items.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
          relevance += 5;
          matchedFields.push('actividad incluida');
        }
        if (item.description.toLowerCase().includes(query)) {
          relevance += 3;
          matchedFields.push('descripción de actividad');
        }
      });

      // Buscar en extras
      bundle.extras.forEach(extra => {
        if (extra.name.toLowerCase().includes(query)) {
          relevance += 3;
          matchedFields.push('extra disponible');
        }
      });

      if (relevance > 0) {
        results.push({
          type: 'bundle',
          id: bundle.id,
          title: bundle.name,
          subtitle: `${bundle.category} - $${bundle.basePrice} - ${bundle.items.length} actividades`,
          data: bundle,
          relevance
        });
      }
    });

    // Buscar clientes únicos
    const uniqueCustomers = Array.from(
      new Map(
        bookings.map(b => [
          b.customerEmail, 
          {
            name: b.customerName,
            email: b.customerEmail,
            phone: b.customerPhone,
            bookingsCount: bookings.filter(booking => booking.customerEmail === b.customerEmail).length,
            totalSpent: bookings
              .filter(booking => booking.customerEmail === b.customerEmail)
              .reduce((sum, booking) => sum + booking.pricing.totalAmount, 0),
            lastBooking: bookings
              .filter(booking => booking.customerEmail === b.customerEmail)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          }
        ])
      ).values()
    );

    uniqueCustomers.forEach(customer => {
      let relevance = 0;
      let matchedFields: string[] = [];

      if (customer.name.toLowerCase().includes(query)) {
        relevance += 10;
        matchedFields.push('nombre');
      }
      if (customer.email.toLowerCase().includes(query)) {
        relevance += 8;
        matchedFields.push('email');
      }
      if (customer.phone.includes(query)) {
        relevance += 8;
        matchedFields.push('teléfono');
      }

      if (relevance > 0) {
        results.push({
          type: 'customer',
          id: customer.email,
          title: customer.name,
          subtitle: `${customer.email} - ${customer.bookingsCount} reservas - $${customer.totalSpent}`,
          data: customer,
          relevance
        });
      }
    });

    // Ordenar por relevancia
    return results.sort((a, b) => b.relevance - a.relevance);
  }, [internalQuery, bookings, bundles]);

  // ========================================
  // FILTRAR RESULTADOS
  // ========================================

  const filteredResults = useMemo(() => {
    let filtered = internalSearchResults;

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType);
    }

    // Filtrar por estado (solo para bookings)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).status === selectedStatus
      );
    }

    // Filtrar por fecha
    if (dateFrom) {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).date >= dateFrom
      );
    }

    if (dateTo) {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).date <= dateTo
      );
    }

    return filtered;
  }, [internalSearchResults, selectedType, selectedStatus, dateFrom, dateTo]);

  // ========================================
  // ESTADÍSTICAS DE BÚSQUEDA
  // ========================================

  const searchStats: SearchStats = useMemo(() => {
    const stats = filteredResults.reduce(
      (acc, result) => {
        acc.totalResults++;
        switch (result.type) {
          case 'booking':
            acc.bookingsCount++;
            break;
          case 'bundle':
            acc.bundlesCount++;
            break;
          case 'customer':
            acc.customersCount++;
            break;
          case 'item':
            acc.itemsCount++;
            break;
        }
        return acc;
      },
      { totalResults: 0, bookingsCount: 0, customersCount: 0, bundlesCount: 0, itemsCount: 0 }
    );

    return stats;
  }, [filteredResults]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleSearch = useCallback((value: string) => {
    setInternalQuery(value);
    
    // Agregar a búsquedas recientes
    if (value.trim() && !recentSearches.includes(value.trim())) {
      setRecentSearches(prev => [value.trim(), ...prev.slice(0, 4)]);
    }
  }, [recentSearches]);

  const handleResultClick = useCallback((result: GlobalSearchResult) => {
    switch (result.type) {
      case 'booking':
        onBookingClick?.(result.id);
        break;
      case 'bundle':
        onBundleClick?.(result.id);
        break;
      case 'customer':
        onCustomerClick?.(result.id);
        break;
      case 'item':
        onItemClick?.(result.id);
        break;
    }
  }, [onBookingClick, onBundleClick, onCustomerClick, onItemClick]);

  const clearSearch = useCallback(() => {
    setInternalQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
  }, []);

  // ========================================
  // UTILIDADES DE RENDERIZADO
  // ========================================

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'bundle':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'customer':
        return <User className="w-4 h-4 text-green-500" />;
      case 'item':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'border-l-blue-500 bg-blue-50';
      case 'bundle':
        return 'border-l-purple-500 bg-purple-50';
      case 'customer':
        return 'border-l-green-500 bg-green-50';
      case 'item':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

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

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda principal */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Campo de búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar reservas, clientes, servicios..."
              value={internalQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {internalQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Búsquedas recientes */}
          {recentSearches.length > 0 && !internalQuery && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Búsquedas recientes:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setInternalQuery(search)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controles de filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>

              {searchStats.totalResults > 0 && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-medium">{searchStats.totalResults} resultados</span>
                  {searchStats.bookingsCount > 0 && <span>{searchStats.bookingsCount} reservas</span>}
                  {searchStats.customersCount > 0 && <span>{searchStats.customersCount} clientes</span>}
                  {searchStats.bundlesCount > 0 && <span>{searchStats.bundlesCount} servicios</span>}
                </div>
              )}
            </div>

            {(selectedType !== 'all' || selectedStatus !== 'all' || dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="text-red-600 hover:text-red-700"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'booking', label: 'Reservas' },
                    { value: 'customer', label: 'Clientes' },
                    { value: 'bundle', label: 'Servicios' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado (Reservas)
                </label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BookingStatus | 'all')}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'PENDING', label: 'Pendiente' },
                    { value: 'CONFIRMED', label: 'Confirmada' },
                    { value: 'CANCELLED', label: 'Cancelada' },
                    { value: 'COMPLETED', label: 'Completada' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha hasta
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Resultados de búsqueda */}
      {internalQuery && (
        <div className="space-y-3">
          {isSearching ? (
            <Card className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Buscando...</p>
            </Card>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Card
                key={`${result.type}-${result.id}`}
                className={`p-4 cursor-pointer hover:shadow-md transition-all border-l-4 ${getResultColor(result.type)}`}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {result.type === 'booking' ? 'Reserva' : 
                           result.type === 'customer' ? 'Cliente' : 
                           result.type === 'bundle' ? 'Servicio' : 'Item'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                      
                      {/* Información específica por tipo */}
                      {result.type === 'booking' && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${getStatusColor((result.data as Booking).status)}`}>
                            {(result.data as Booking).status}
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{(result.data as Booking).customerPhone}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{(result.data as Booking).customerEmail}</span>
                          </span>
                        </div>
                      )}

                      {result.type === 'bundle' && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Package className="w-3 h-3" />
                            <span>{(result.data as Bundle).items.length} actividades</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>${(result.data as Bundle).basePrice}</span>
                          </span>
                        </div>
                      )}

                      {result.type === 'customer' && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{(result.data as CustomerData).bookingsCount} reservas</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>${(result.data as CustomerData).totalSpent} gastado</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron resultados para "{internalQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">
                Intenta con términos diferentes o ajusta los filtros
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Estado inicial */}
      {!internalQuery && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Búsqueda Global del Sistema
          </h3>
          <p className="text-gray-600 mb-4">
            Busca en reservas, clientes, servicios y actividades de forma unificada
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>Consejos de búsqueda:</strong></p>
            <ul className="space-y-1 text-left max-w-md mx-auto">
              <li>• Busca por nombre, email o teléfono del cliente</li>
              <li>• Escribe el nombre de un servicio o actividad</li>
              <li>• Usa ID de reserva para búsquedas exactas</li>
              <li>• Combina filtros para resultados más precisos</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}; 