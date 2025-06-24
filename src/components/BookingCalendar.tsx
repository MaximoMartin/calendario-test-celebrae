import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent, Kit, ViewType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
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

interface BookingCalendarProps {
  events: CalendarEvent[];
  kits: Kit[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  selectedKitId?: string;
  onKitFilter?: (kitId: string) => void;
  onViewChange?: (view: ViewType, date: Date) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  events,
  kits,
  onSelectEvent,
  onSelectSlot,
  selectedKitId,
  onKitFilter,
  onViewChange,
}) => {
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  // Notificar cambios de vista y fecha al componente padre
  React.useEffect(() => {
    onViewChange?.(view, date);
  }, [view, date, onViewChange]);

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

  const filteredEvents = useMemo(() => {
    if (!selectedKitId || selectedKitId === 'all') {
      return events;
    }
    
    // Verificar que el kit seleccionado existe en la lista de kits del shop actual
    const kitExists = kits.some(kit => kit.id === selectedKitId);
    if (!kitExists) {
      // Si el kit no existe en este shop, mostrar todos los eventos
      return events;
    }
    
    return events.filter(event => event.resource.kitId === selectedKitId);
  }, [events, selectedKitId, kits]);

  const kitOptions = useMemo(() => [
    { value: 'all', label: 'Todos los servicios' },
    ...kits.map(kit => ({ value: kit.id, label: kit.name }))
  ], [kits]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const booking = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (booking.status) {
      case 'PENDING':
        backgroundColor = '#f59e0b';
        break;
      case 'CONFIRMED':
        backgroundColor = '#10b981';
        break;
      case 'CANCELLED':
        backgroundColor = '#ef4444';
        break;
      case 'COMPLETED':
        backgroundColor = '#6b7280';
        break;
      case 'NO_SHOW':
        backgroundColor = '#f97316';
        break;
      case 'RESCHEDULED':
        backgroundColor = '#3b82f6';
        break;
      case 'PARTIAL_REFUND':
        backgroundColor = '#6366f1';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
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

  return (
    <Card className="overflow-hidden">
      {/* Header con controles */}
      <div className="p-4 border-b bg-gray-50">
        {/* Título y navegación principal */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Título y fecha */}
          <div className="flex-1">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
              Calendario de Reservas
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
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('TODAY')}
                className="px-3 py-2 text-xs lg:text-sm"
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('NEXT')}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Botón de filtros para móvil */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span className="text-xs">Filtros</span>
            </Button>
          </div>
        </div>

        {/* Controles de vista y filtros */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4 space-y-3 lg:space-y-0`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            {/* Selector de vista */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 hidden lg:inline">Vista:</span>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg border border-gray-200 p-1">
                <Button
                  variant={view === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                  className={`text-xs lg:text-sm px-2 lg:px-3 ${
                    view === 'month' 
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Mes
                </Button>
                <Button
                  variant={view === 'week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                  className={`text-xs lg:text-sm px-2 lg:px-3 ${
                    view === 'week' 
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Semana
                </Button>
                <Button
                  variant={view === 'day' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('day')}
                  className={`text-xs lg:text-sm px-2 lg:px-3 ${
                    view === 'day' 
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Día
                </Button>
              </div>
            </div>

            {/* Filtro de servicios */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 hidden lg:inline">Servicio:</span>
              <Select
                options={kitOptions}
                value={selectedKitId || 'all'}
                onChange={(e) => onKitFilter?.(e.target.value)}
                className="w-full lg:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white">
        <div className="h-[400px] sm:h-[500px] lg:h-[600px] p-2 lg:p-4">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={view as View}
            onView={(newView) => setView(newView as ViewType)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectEvent={(event) => onSelectEvent?.(event as CalendarEvent)}
            onSelectSlot={(slotInfo) => onSelectSlot?.(slotInfo)}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={messages}
            culture="es"
            className="h-full"
            dayLayoutAlgorithm="no-overlap"
            step={30}
            timeslots={2}
            min={new Date(2025, 0, 1, 8, 0, 0)}
            max={new Date(2025, 0, 1, 22, 0, 0)}
            formats={{
              dayFormat: (date, culture, localizer) =>
                localizer?.format(date, 'dd', culture) || '',
              weekdayFormat: (date, culture, localizer) =>
                localizer?.format(date, 'eee', culture) || '',
              monthHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'MMMM yyyy', culture) || '',
              dayHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'eeee, dd \'de\' MMMM', culture) || '',
              timeGutterFormat: (date, culture, localizer) =>
                localizer?.format(date, 'HH:mm', culture) || '',
            }}
            components={{
              toolbar: () => null, // Ocultamos la toolbar por defecto
            }}
          />
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <h4 className="text-sm font-medium text-gray-700 mb-2 lg:mb-0">
            Leyenda de Estados:
          </h4>
          <div className="grid grid-cols-3 lg:flex lg:flex-wrap gap-2 lg:gap-4 text-xs">
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-800 font-medium">Pendiente</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-800 font-medium">Confirmada</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-gray-800 font-medium">Completada</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-800 font-medium">Cancelada</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-800 font-medium">No se presentó</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-800 font-medium">Reprogramada</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-800 font-medium">Reembolso</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}; 