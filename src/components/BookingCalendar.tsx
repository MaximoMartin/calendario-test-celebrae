import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ReservationTypeSelector } from './ReservationTypeSelector';
import { ReservationDetailPanel } from './ReservationDetailPanel';
import { ShopStatsCard } from './ShopStatsCard';
import { useShopState } from '../hooks/useShopState';
import { useEntitiesState } from '../hooks/useEntitiesState';
import { isShopOpenOnDate } from '../features/reservations/availabilityValidation';
import type { Bundle } from '../types';
import { formatReservationStatus, isReservationRescheduled } from '../utils/formatHelpers';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es }
});

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
  noEventsInRange: 'No hay reservas en este rango de fechas',
  showMore: (total: number) => `+ Ver ${total} más`
};

const statusColors = {
  PENDING: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
  CONFIRMED: { backgroundColor: '#10b981', borderColor: '#059669' },
  CANCELLED: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
  COMPLETED: { backgroundColor: '#6366f1', borderColor: '#4f46e5' },
  NO_SHOW: { backgroundColor: '#6b7280', borderColor: '#374151' },
  RESCHEDULED: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' },
  PARTIAL_REFUND: { backgroundColor: '#f97316', borderColor: '#ea580c' }
};

const BookingCalendar: React.FC = () => {
  const { selectedShop, calendarEvents, shopBundles } = useShopState();
  const { allShops } = useEntitiesState();

  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof calendarEvents[0] | null>(null);
  const [showReservationSelector, setShowReservationSelector] = useState(false);

  useEffect(() => {
    setSelectedBundleId('');
    setSearchTerm('');
    setSelectedEvent(null);
    setShowReservationSelector(false);
    
    console.log('📅 Calendario actualizado para shop:', selectedShop.name);
    console.log('📊 Eventos cargados:', calendarEvents.length);
  }, [selectedShop.id, selectedShop.name, calendarEvents.length]);

  const dayPropGetter = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const isShopClosed = !isShopOpenOnDate(selectedShop.id, dateString, allShops);
    
    if (isShopClosed) {
      return {
        className: 'shop-closed-day',
        style: {
          backgroundColor: '#fef2f2',
          position: 'relative' as const
        },
        title: `🚫 ${selectedShop.name} está cerrado este día`
      };
    }
    
    return {};
  };

  const filteredEvents = useMemo(() => {
    let events = calendarEvents;

    if (selectedBundleId) {
      events = events.filter(event => 
        event.resource.kitId === selectedBundleId
      );
    }

    if (searchTerm) {
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return events;
  }, [calendarEvents, selectedBundleId, searchTerm]);

  const eventStyleGetter = (event: typeof calendarEvents[0]) => {
    // Detectar si la reserva es reprogramada
    const isRescheduled = isReservationRescheduled(event.resource.modernReservation || event.resource);
    const status = isRescheduled ? 'RESCHEDULED' : event.resource.status;
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
    return {
      style: {
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        color: 'white',
        border: '2px solid',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    const dateString = start.toISOString().split('T')[0];
    const isOpen = isShopOpenOnDate(selectedShop.id, dateString, allShops);
    
    if (!isOpen) {
      alert(`⚠️ No se pueden crear reservas en días que el negocio está cerrado.\n\nFecha seleccionada: ${start.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`);
      return;
    }
    
    setShowReservationSelector(true);
  };

  const handleSelectEvent = (event: typeof calendarEvents[0]) => {
    setSelectedEvent(event);
  };

  const handleNavigate = (newDate: Date, view: View) => {
    setDate(newDate);
    setView(view);
  };

  const bundleOptions = [
    { value: '', label: 'Todos los bundles' },
    ...shopBundles.map((bundle: Bundle) => ({ 
      value: bundle.id, 
      label: bundle.name 
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📅 Calendario - {selectedShop.name}
            </h1>
          </div>

              <Button
            onClick={() => setShowReservationSelector(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
            </Button>
          </div>
        </div>

      <ShopStatsCard className="mb-6" />

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar reservas
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cliente, email o bundle..."
              className="w-full"
            />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Bundle
            </label>
              <Select
              options={bundleOptions}
              value={selectedBundleId}
              onChange={(e) => setSelectedBundleId(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resultados
            </label>
            <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-50">
              <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">
                {filteredEvents.length} reserva{filteredEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Estado de Reservas y Disponibilidad</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Estados de Reserva</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusColors).map(([status, colors]) => (
                <div key={status} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded border-2 mr-2"
                    style={{
                      backgroundColor: colors.backgroundColor,
                      borderColor: colors.borderColor
                    }}
                  />
                  <span className="text-sm text-gray-600">
                    {status === 'PENDING' && 'Pendiente'}
                    {status === 'CONFIRMED' && 'Confirmada'}
                    {status === 'CANCELLED' && 'Cancelada'}
                    {status === 'COMPLETED' && 'Completada'}
                    {status === 'NO_SHOW' && 'No se presentó'}
                    {status === 'RESCHEDULED' && 'Reprogramada'}
                    {status === 'PARTIAL_REFUND' && 'Reembolso parcial'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Disponibilidad del Negocio</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-white border-2 border-gray-300 mr-2" />
                <span className="text-sm text-gray-600">Día abierto</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-red-50 border-2 border-red-200 mr-2 opacity-60" />
                <span className="text-sm text-gray-600">Día cerrado</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Los días en rojo indican que el negocio está cerrado y no se pueden crear reservas
            </p>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            messages={messages}
            view={view}
            onView={setView}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            popup
            components={{
              toolbar: ({ label, onNavigate, onView }) => (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => onNavigate('PREV')}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                      {label}
                    </h2>
                    <Button
                      onClick={() => onNavigate('NEXT')}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onNavigate('TODAY')}
                      variant="outline"
                      size="sm"
                    >
                      Hoy
                    </Button>
                    <Button
                      onClick={() => onView('month')}
                      variant={view === 'month' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Mes
                    </Button>
                    <Button
                      onClick={() => onView('week')}
                      variant={view === 'week' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Semana
                    </Button>
                    <Button
                      onClick={() => onView('day')}
                      variant={view === 'day' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Día
                    </Button>
                  </div>
                </div>
              ),
              event: (props: any) => {
                // Mostrar el label correcto del estado
                const resource = props.event.resource.modernReservation || props.event.resource;
                const label = formatReservationStatus(resource.status, resource);
                return (
                  <span>
                    {props.title} <span className="ml-1 text-xs font-semibold">({label})</span>
                  </span>
                );
              }
            }}
          />
        </div>
      </div>

      {/* Modal de creación de reserva con selector moderno */}
      {showReservationSelector && (
        <ReservationTypeSelector
          onReservationCreated={(reservationId: string) => {
            console.log('Reserva creada:', reservationId);
            setShowReservationSelector(false);
          }}
          onClose={() => {
            setShowReservationSelector(false);
          }}
        />
      )}

      {/* Modal de detalle de reserva */}
      {selectedEvent && (
        <ReservationDetailPanel
          reservation={selectedEvent.resource.modernReservation}
          onClose={() => setSelectedEvent(null)}
          onEdit={(reservation) => {
            console.log('Editar reserva:', reservation);
          }}
          onManage={(reservation) => {
            console.log('Gestionar reserva:', reservation);
          }}
        />
      )}
      </div>
  );
}; 

export default BookingCalendar; 