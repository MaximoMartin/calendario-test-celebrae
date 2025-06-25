// ========================================
// HOOK DE BÚSQUEDA GLOBAL - NUEVO MODELO
// ========================================

import { useState, useMemo, useCallback } from 'react';
import type { 
  Booking, Bundle, GlobalSearchResult, CustomerData, BookingStatus 
} from '../types/newModel';

interface UseGlobalSearchProps {
  bookings: Booking[];
  bundles: Bundle[];
}

interface SearchFilters {
  type?: 'all' | 'booking' | 'customer' | 'bundle';
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export const useGlobalSearch = (props?: UseGlobalSearchProps) => {
  // ========================================
  // ESTADO
  // ========================================

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    status: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ========================================
  // DATOS MOCK SI NO SE PROPORCIONAN
  // ========================================

  const bookings = props?.bookings || [];
  const bundles = props?.bundles || [];

  // ========================================
  // MOTOR DE BÚSQUEDA
  // ========================================

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    // Buscar en reservas
    bookings.forEach(booking => {
      let relevance = 0;

      // Buscar en campos principales
      if (booking.customerName.toLowerCase().includes(query)) relevance += 10;
      if (booking.customerEmail.toLowerCase().includes(query)) relevance += 8;
      if (booking.customerPhone.includes(query)) relevance += 8;
      if (booking.bundleName.toLowerCase().includes(query)) relevance += 6;
      if (booking.id.toLowerCase().includes(query)) relevance += 5;
      if (booking.notes?.toLowerCase().includes(query)) relevance += 3;

      // Buscar en items individuales
      booking.itemBookings.forEach(itemBooking => {
        if (itemBooking.itemName.toLowerCase().includes(query)) relevance += 4;
        if (itemBooking.notes?.toLowerCase().includes(query)) relevance += 2;
      });

      if (relevance > 0) {
        results.push({
          type: 'booking',
          id: booking.id,
          title: `${booking.customerName} - ${booking.bundleName}`,
          subtitle: `${booking.date} - ${booking.status}`,
          data: booking,
          relevance
        });
      }
    });

    // Buscar en bundles
    bundles.forEach(bundle => {
      let relevance = 0;

      if (bundle.name.toLowerCase().includes(query)) relevance += 10;
      if (bundle.description.toLowerCase().includes(query)) relevance += 6;
      if (bundle.category.toLowerCase().includes(query)) relevance += 4;

      // Buscar en items del bundle
      bundle.items.forEach(item => {
        if (item.name.toLowerCase().includes(query)) relevance += 5;
        if (item.description.toLowerCase().includes(query)) relevance += 3;
      });

      if (relevance > 0) {
        results.push({
          type: 'bundle',
          id: bundle.id,
          title: bundle.name,
          subtitle: `${bundle.category} - $${bundle.basePrice}`,
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

      if (customer.name.toLowerCase().includes(query)) relevance += 10;
      if (customer.email.toLowerCase().includes(query)) relevance += 8;
      if (customer.phone.includes(query)) relevance += 8;

      if (relevance > 0) {
        results.push({
          type: 'customer',
          id: customer.email,
          title: customer.name,
          subtitle: `${customer.email} - ${customer.bookingsCount} reservas`,
          data: customer,
          relevance
        });
      }
    });

    // Ordenar por relevancia
    return results.sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery, bookings, bundles]);

  // ========================================
  // FILTRAR RESULTADOS
  // ========================================

  const filteredResults = useMemo(() => {
    let filtered = searchResults;

    // Filtrar por tipo
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(result => result.type === filters.type);
    }

    // Filtrar por estado (solo para bookings)
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).status === filters.status
      );
    }

    // Filtrar por fecha
    if (filters.dateFrom) {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).date >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(result => 
        result.type !== 'booking' || (result.data as Booking).date <= filters.dateTo!
      );
    }

    return filtered;
  }, [searchResults, filters]);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const searchStats = useMemo(() => {
    return filteredResults.reduce(
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
        }
        return acc;
      },
      { totalResults: 0, bookingsCount: 0, customersCount: 0, bundlesCount: 0 }
    );
  }, [filteredResults]);

  // ========================================
  // HANDLERS
  // ========================================

  const performSearch = useCallback((query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simular delay de búsqueda
    setTimeout(() => {
      setIsSearching(false);
    }, 300);

    // Agregar a búsquedas recientes
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  }, [recentSearches]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({ type: 'all', status: 'all' });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: 'all', status: 'all' });
  }, []);

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado
    searchQuery,
    filters,
    isSearching,
    recentSearches,
    
    // Resultados
    searchResults: filteredResults,
    searchStats,
    
    // Acciones
    setSearchQuery: performSearch,
    updateFilters,
    clearSearch,
    clearFilters,
    
    // Utilidades
    hasResults: filteredResults.length > 0,
    hasQuery: searchQuery.trim().length > 0
  };
}; 