import { useState, useMemo } from 'react';
import type { Booking, Kit, SearchFilters, GlobalSearchResult, CustomerInfo } from '../types';
import { mockBookings, mockKits } from '../mockData';

export const useGlobalSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Generar información de clientes desde las reservas
  const customerInfo = useMemo((): CustomerInfo[] => {
    const customerMap = new Map<string, CustomerInfo>();

    mockBookings.forEach(booking => {
      const key = booking.customerEmail;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `customer_${booking.customerEmail}`,
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          totalBookings: 0,
          lastBookingDate: booking.date,
        });
      }

      const customer = customerMap.get(key)!;
      customer.totalBookings += 1;
      if (booking.date > (customer.lastBookingDate || '')) {
        customer.lastBookingDate = booking.date;
      }
    });

    return Array.from(customerMap.values());
  }, []);

  // Función de búsqueda principal
  const searchResults = useMemo((): GlobalSearchResult[] => {
    const results: GlobalSearchResult[] = [];
    const query = searchQuery.toLowerCase().trim();

    if (!query && Object.keys(filters).length === 0) {
      return [];
    }

    // Buscar en reservas
    mockBookings.forEach(booking => {
      let relevance = 0;
      let matches = false;

      // Búsqueda por texto
      if (query) {
        const searchableText = [
          booking.customerName,
          booking.customerEmail,
          booking.customerPhone,
          booking.kitName,
          booking.notes || '',
          booking.id
        ].join(' ').toLowerCase();

        if (searchableText.includes(query)) {
          matches = true;
          relevance += 100;
          
          // Mayor relevancia si coincide exactamente con el nombre o email
          if (booking.customerName.toLowerCase().includes(query)) relevance += 50;
          if (booking.customerEmail.toLowerCase().includes(query)) relevance += 50;
        }
      }

      // Aplicar filtros
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(booking.status)) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.kitIds && filters.kitIds.length > 0) {
        if (!filters.kitIds.includes(booking.kitId)) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.dateFrom) {
        if (booking.date < filters.dateFrom) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.dateTo) {
        if (booking.date > filters.dateTo) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.isManual !== undefined) {
        if (booking.isManual !== filters.isManual) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.customerEmail) {
        if (!booking.customerEmail.toLowerCase().includes(filters.customerEmail.toLowerCase())) {
          return;
        }
        if (!query) matches = true;
      }

      if (filters.customerPhone) {
        if (!booking.customerPhone.includes(filters.customerPhone)) {
          return;
        }
        if (!query) matches = true;
      }

      if (matches) {
        results.push({
          type: 'booking',
          id: booking.id,
          title: `${booking.customerName} - ${booking.kitName}`,
          subtitle: `${booking.date} ${booking.timeSlot} | ${booking.status}`,
          data: booking,
          relevance
        });
      }
    });

    // Buscar en kits
    if (query) {
      mockKits.forEach(kit => {
        const searchableText = [
          kit.name,
          kit.id
        ].join(' ').toLowerCase();

        if (searchableText.includes(query)) {
          let relevance = 75;
          if (kit.name.toLowerCase().includes(query)) relevance += 25;

          results.push({
            type: 'kit',
            id: kit.id,
            title: kit.name,
            subtitle: `€${kit.price} | Capacidad: ${kit.maxCapacity} personas`,
            data: kit,
            relevance
          });
        }
      });

      // Buscar en clientes
      customerInfo.forEach(customer => {
        const searchableText = [
          customer.name,
          customer.email,
          customer.phone
        ].join(' ').toLowerCase();

        if (searchableText.includes(query)) {
          let relevance = 80;
          if (customer.name.toLowerCase().includes(query)) relevance += 30;
          if (customer.email.toLowerCase().includes(query)) relevance += 20;

          results.push({
            type: 'customer',
            id: customer.id,
            title: customer.name,
            subtitle: `${customer.email} | ${customer.totalBookings} reservas`,
            data: customer,
            relevance
          });
        }
      });
    }

    // Ordenar por relevancia
    return results.sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery, filters, customerInfo]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
    searchResults,
    customerInfo
  };
}; 