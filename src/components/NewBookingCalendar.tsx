// ========================================
// NUEVO CALENDARIO INTELIGENTE CON ITEMS
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent, ViewType } from '../types/newModel';
import type { Bundle, Booking, Shop, BundleItem, ItemBooking } from '../types/newModel';
import { useAvailability } from '../hooks/useAvailability';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { ChevronLeft, ChevronRight, Filter, Plus, AlertTriangle, Eye, Users, Clock } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface NewBookingCalendarProps {
  shop: Shop;
  bundles: Bundle[];
  bookings: Booking[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onCreateBooking?: (bundleId: string, date: string, itemSelections: any[]) => void;
  selectedBundleId?: string;
  selectedItemId?: string;
  onBundleFilter?: (bundleId: string) => void;
  onItemFilter?: (itemId: string) => void;
  onViewChange?: (view: ViewType, date: Date) => void;
}

export const NewBookingCalendar: React.FC<NewBookingCalendarProps> = ({
  shop,
  bundles,
  bookings,
  onSelectEvent,
  onSelectSlot,
  onCreateBooking,
  selectedBundleId,
  selectedItemId,
  onBundleFilter,
  onItemFilter,
  onViewChange,
}) => {
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Hook de disponibilidad
  const availability = useAvailability({ shop, bundles, bookings });

  // Notificar cambios de vista y fecha al componente padre
  React.useEffect(() => {
    onViewChange?.(view, date);
  }, [view, date, onViewChange]);

  // ========================================
  // CONVERSIÓN DE RESERVAS A EVENTOS DEL CALENDARIO
  // ========================================

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    for (const booking of bookings) {
      for (const itemBooking of booking.itemBookings) {
        // Buscar el item para obtener información adicional
        const bundle = bundles.find(b => b.id === booking.bundleId);
        const item = bundle?.items.find(i => i.id === itemBooking.itemId);
        
        if (!item) continue;

        const startDateTime = new Date(`${booking.date}T${itemBooking.startTime}:00`);
        const endDateTime = new Date(`${booking.date}T${itemBooking.endTime}:00`);

        events.push({
          id: `${booking.id}_${itemBooking.id}`,
          title: `${item.name} - ${booking.customerName}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            type: 'BOOKING',
            data: {
              booking,
              itemBooking,
              item,
              bundle
            }
          },
          color: getItemEventColor(itemBooking.status, item)
        });
      }
    }

    return events;
  }, [bookings, bundles]);

  // ========================================
  // EVENTOS FILTRADOS
  // ========================================

  const filteredEvents = useMemo(() => {
    let filtered = calendarEvents;

    // Filtrar por bundle
    if (selectedBundleId && selectedBundleId !== 'all') {
      filtered = filtered.filter(event => {
        const eventData = event.resource.data;
        return eventData.booking.bundleId === selectedBundleId;
      });
    }

    // Filtrar por item específico
    if (selectedItemId && selectedItemId !== 'all') {
      filtered = filtered.filter(event => {
        const eventData = event.resource.data;
        return eventData.itemBooking.itemId === selectedItemId;
      });
    }

    return filtered;
  }, [calendarEvents, selectedBundleId, selectedItemId]);

  // ========================================
  // OPCIONES DE FILTROS
  // ========================================

  const bundleOptions = useMemo(() => [
    { value: 'all', label: 'Todos los bundles' },
    ...bundles.map(bundle => ({ 
      value: bundle.id, 
      label: bundle.name 
    }))
  ], [bundles]);

  const itemOptions = useMemo(() => {
    if (!selectedBundleId || selectedBundleId === 'all') {
      // Mostrar todos los items de todos los bundles
      const allItems = bundles.flatMap(bundle => 
        bundle.items.map(item => ({
          value: item.id,
          label: `${bundle.name} - ${item.name}`
        }))
      );
      return [
        { value: 'all', label: 'Todos los items' },
        ...allItems
      ];
    } else {
      // Mostrar solo items del bundle seleccionado
      const selectedBundle = bundles.find(b => b.id === selectedBundleId);
      if (!selectedBundle) return [{ value: 'all', label: 'Todos los items' }];
      
      return [
        { value: 'all', label: 'Todos los items' },
        ...selectedBundle.items.map(item => ({
          value: item.id,
          label: item.name
        }))
      ];
    }
  }, [bundles, selectedBundleId]);

  // ========================================
  // MANEJO DE NAVEGACIÓN
  // ========================================

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date);
    
    switch (action) {
      case 'PREV':
        if (view === 'month') {
          newDate = subMonths(date, 1);
        } else if (view === 'week') {
          newDate = subWeeks(date, 1);
        } else if (view === 'day') {
          newDate = subDays(date, 1);
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          newDate = addMonths(date, 1);
        } else if (view === 'week') {
          newDate = addWeeks(date, 1);
        } else if (view === 'day') {
          newDate = addDays(date, 1);
        }
        break;
      case 'TODAY':
        newDate = new Date();
        break;
    }
    
    setDate(newDate);
  };

  // ========================================
  // ESTILOS DE EVENTOS
  // ========================================

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource.data;
    const status = eventData.itemBooking.status;
    
    let backgroundColor = event.color || getItemEventColor(status, eventData.item);
    let borderColor = backgroundColor;
    
    // Agregar indicadores visuales especiales
    if (eventData.itemBooking.resourceAllocations.length > 0) {
      borderColor = '#f59e0b'; // Borde dorado para items con recursos
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px'
      },
    };
  };

  // ========================================
  // MANEJO DE SELECCIONES
  // ========================================

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    onSelectEvent?.(event);
  }, [onSelectEvent]);

  const handleSlotSelect = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setShowCreateModal(true);
    onSelectSlot?.(slotInfo);
  }, [onSelectSlot]);

  // ========================================
  // CREACIÓN RÁPIDA DE RESERVAS
  // ========================================

  const handleQuickBooking = async (bundleId: string) => {
    if (!selectedSlot) return;

    const dateStr = format(selectedSlot.start, 'yyyy-MM-dd');
    const result = await availability.canQuickBook(bundleId, dateStr, 1);

    if (result.canBook) {
      onCreateBooking?.(bundleId, dateStr, result.suggestedItems);
      setShowCreateModal(false);
      setSelectedSlot(null);
    } else {
      alert(`No se puede crear la reserva: ${result.conflicts.join(', ')}`);
    }
  };

  // ========================================
  // COMPONENTE DE ESTADÍSTICAS RÁPIDAS
  // ========================================

  const QuickStats = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const stats = availability.getOccupancyStats(dateStr);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
          <div className="text-sm text-gray-600">Reservas del día</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(stats.overallOccupancy * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Ocupación general</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(stats.resources).length}
          </div>
          <div className="text-sm text-gray-600">Recursos activos</div>
        </div>
      </div>
    );
  };

  // ========================================
  // MODAL DE CREACIÓN RÁPIDA
  // ========================================

  const CreateBookingModal = () => {
    if (!showCreateModal || !selectedSlot) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Crear reserva rápida</h3>
          <p className="text-gray-600 mb-4">
            Fecha: {format(selectedSlot.start, 'dd/MM/yyyy', { locale: es })}
          </p>
          
          <div className="space-y-2 mb-6">
            {bundles.map(bundle => (
              <Button
                key={bundle.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickBooking(bundle.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{bundle.name}</div>
                  <div className="text-sm text-gray-500">${bundle.basePrice}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setSelectedSlot(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Abrir formulario completo
                setShowCreateModal(false);
                onSelectSlot?.(selectedSlot);
              }}
              className="flex-1"
            >
              Formulario completo
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // TEXTO DE FECHA ACTUAL
  // ========================================

  const getCurrentDateText = () => {
    try {
      switch (view) {
        case 'day':
          return format(date, 'dd \'de\' MMMM yyyy', { locale: es });
        case 'week':
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return `${format(weekStart, 'dd MMM', { locale: es })} - ${format(weekEnd, 'dd MMM yyyy', { locale: es })}`;
        case 'month':
          return format(date, 'MMMM yyyy', { locale: es });
        default:
          return format(date, 'MMM yyyy', { locale: es });
      }
    } catch {
      return 'Fecha inválida';
    }
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    showMore: (count: number) => `+ Ver más (${count})`,
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header con controles */}
        <div className="p-4 border-b bg-gray-50">
          {/* Título y navegación principal */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Título y fecha */}
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                Calendario Inteligente
              </h2>
              <p className="text-sm text-gray-600 capitalize">
                {getCurrentDateText()}
              </p>
            </div>

            {/* Navegación */}
            <div className="flex items-center justify-between lg:justify-end space-x-2">
              {/* Controles de navegación */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('PREV')}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('TODAY')}
                  className="px-3 h-8 text-xs"
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('NEXT')}
                  className="p-1 h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Selector de vista */}
              <div className="flex border rounded-md overflow-hidden">
                {(['day', 'week', 'month'] as ViewType[]).map((viewOption) => (
                                 <Button
                 key={viewOption}
                 variant={view === viewOption ? 'primary' : 'outline'}
                 size="sm"
                 onClick={() => setView(viewOption)}
                 className="rounded-none border-0 text-xs px-2 h-8"
               >
                 {viewOption === 'day' ? 'Día' : viewOption === 'week' ? 'Semana' : 'Mes'}
               </Button>
                ))}
              </div>

              {/* Filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="p-1 h-8 w-8"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle
                </label>
                                 <Select
                   value={selectedBundleId || 'all'}
                   onChange={(e) => onBundleFilter?.(e.target.value)}
                   options={bundleOptions}
                 />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item específico
                </label>
                                 <Select
                   value={selectedItemId || 'all'}
                   onChange={(e) => onItemFilter?.(e.target.value)}
                   options={itemOptions}
                 />
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <QuickStats />

        {/* Calendario */}
        <div className="p-4" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleEventSelect}
            onSelectSlot={handleSlotSelect}
            selectable
            view={view as View}
                         onView={(view) => setView(view as ViewType)}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            }}
            step={30}
            timeslots={2}
            min={new Date(2023, 1, 1, 7, 0)}
            max={new Date(2023, 1, 1, 22, 0)}
          />
        </div>

        {/* Leyenda */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pendiente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Cancelado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded border-2 border-yellow-400"></div>
              <span>Con recursos asignados</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de creación rápida */}
      <CreateBookingModal />
    </>
  );
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Obtener color del evento según estado del item
 */
function getItemEventColor(status: string, item: BundleItem): string {
  const baseColors = {
    'PENDING': '#f59e0b',
    'CONFIRMED': '#10b981',
    'CANCELLED': '#ef4444',
    'COMPLETED': '#6b7280',
    'NO_SHOW': '#f97316',
    'RESCHEDULED': '#3b82f6',
    'PARTIAL_REFUND': '#6366f1'
  };

  return baseColors[status as keyof typeof baseColors] || '#3174ad';
} 