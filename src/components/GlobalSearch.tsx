import React, { useState } from 'react';
import { Search, Filter, X, User, Calendar, Package, ChevronDown } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import type { Booking, Kit, CustomerInfo } from '../types';

interface GlobalSearchProps {
  kits: Kit[];
  onResultClick?: (result: any) => void;
  onClose?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  kits,
  onResultClick,
  onClose
}) => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
    searchResults
  } = useGlobalSearch();
  
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'NO_SHOW', label: 'No se presentó' },
    { value: 'RESCHEDULED', label: 'Reprogramada' },
    { value: 'PARTIAL_REFUND', label: 'Reembolso parcial' }
  ];

  const kitOptions = kits.map(kit => ({
    value: kit.id,
    label: kit.name
  }));

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'kit':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'customer':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultBadge = (type: string) => {
    const badges = {
      booking: { label: 'Reserva', color: 'bg-blue-100 text-blue-800' },
      kit: { label: 'Servicio', color: 'bg-green-100 text-green-800' },
      customer: { label: 'Cliente', color: 'bg-purple-100 text-purple-800' }
    };
    
    const badge = badges[type as keyof typeof badges];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      NO_SHOW: 'bg-orange-100 text-orange-800',
      RESCHEDULED: 'bg-blue-100 text-blue-800',
      PARTIAL_REFUND: 'bg-indigo-100 text-indigo-800'
    };

    const statusLabels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
      NO_SHOW: 'No se presentó',
      RESCHEDULED: 'Reprogramada',
      PARTIAL_REFUND: 'Reembolso parcial'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Búsqueda Global</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar reservas, clientes, servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
          </div>

          {/* Active Filters */}
          {(Object.keys(filters).length > 0 || searchQuery) && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {searchQuery && (
                  <span className="text-sm text-gray-600">
                    Búsqueda: "{searchQuery}"
                  </span>
                )}
                {filters.status && filters.status.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Estados: {filters.status.length} filtros
                  </span>
                )}
                {filters.kitIds && filters.kitIds.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Servicios: {filters.kitIds.length} filtros
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Limpiar</span>
              </Button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estados
                </label>
                <Select
                  multiple
                  options={statusOptions}
                  value={filters.status || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    updateFilters({ status: selectedOptions as any[] });
                  }}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicios
                </label>
                <Select
                  multiple
                  options={kitOptions}
                  value={filters.kitIds || []}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    updateFilters({ kitIds: selectedOptions });
                  }}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha desde
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha hasta
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilters({ dateTo: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {searchResults.length === 0 && (searchQuery || Object.keys(filters).length > 0) && (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros términos de búsqueda o ajusta los filtros</p>
            </div>
          )}

          {searchResults.length === 0 && !searchQuery && Object.keys(filters).length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Comienza escribiendo para buscar</p>
              <p className="text-sm">Busca reservas, clientes o servicios</p>
            </div>
          )}

          {searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onResultClick?.(result)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      {getResultBadge(result.type)}
                      {result.type === 'booking' && (
                        getStatusBadge((result.data as Booking).status)
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                    
                    {/* Additional info for different types */}
                    {result.type === 'booking' && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {result.id}</span>
                        <span>Personas: {(result.data as Booking).numberOfPeople}</span>
                        {(result.data as Booking).notes && (
                          <span className="truncate max-w-xs">
                            Nota: {(result.data as Booking).notes}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {result.type === 'customer' && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Tel: {(result.data as CustomerInfo).phone}</span>
                        <span className="ml-4">
                          Última reserva: {(result.data as CustomerInfo).lastBookingDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {Math.round(result.relevance)}% relevancia
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="p-3 bg-gray-50 border-t text-center text-sm text-gray-600">
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>
    </div>
  );
}; 