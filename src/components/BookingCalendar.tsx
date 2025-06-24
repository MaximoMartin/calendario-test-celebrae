import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent, Booking, Kit, ViewType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
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
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  events,
  kits,
  onSelectEvent,
  onSelectSlot,
  selectedKitId,
  onKitFilter,
}) => {
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());

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
    return events.filter(event => event.resource.kitId === selectedKitId);
  }, [events, selectedKitId]);

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

  return (
    <Card 
      title="Calendario de Reservas"
      headerActions={
        <div className="flex items-center space-x-4">
          <Select
            options={kitOptions}
            value={selectedKitId || 'all'}
            onChange={(e) => onKitFilter?.(e.target.value)}
            className="w-48"
          />
          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mes
            </Button>
            <Button
              variant={view === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semana
            </Button>
            <Button
              variant={view === 'day' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Día
            </Button>
          </div>
        </div>
      }
    >
      <div className="h-96">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          view={view as View}
          onView={(newView) => setView(newView as ViewType)}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          date={date}
          onNavigate={(newDate, view, action) => {
            setDate(newDate);
          }}
          selectable
          eventPropGetter={eventStyleGetter}
          messages={messages}
          culture="es"
          className="booking-calendar"
        />
      </div>
      
      {/* Leyenda de estados */}
      <div className="mt-4 flex items-center justify-center flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Cancelada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-sm text-gray-600">Completada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-sm text-gray-600">No se presentó</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Reprogramada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded"></div>
          <span className="text-sm text-gray-600">Reembolso parcial</span>
        </div>
      </div>
    </Card>
  );
}; 