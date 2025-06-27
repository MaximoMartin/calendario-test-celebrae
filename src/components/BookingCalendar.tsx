import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import type { Bundle } from '../types';
import { useShopState } from '../hooks/useShopState';
import { ReservationDetailPanel } from './ReservationDetailPanel';
import { ReservationTypeSelector } from './ReservationTypeSelector';
import { ShopStatsCard } from './ShopStatsCard';
import { ChevronLeft, ChevronRight, CalendarIcon, Plus } from 'lucide-react';

// 🎯 CHECKPOINT 8: CALENDARIO REFACTORIZADO CON DATOS MODERNOS
// Configuración de locale en español
moment.locale('es');
const localizer = momentLocalizer(moment);

// Configuración de mensajes en español
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

// Colores por estado de reserva
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
  // 🎯 CHECKPOINT 9.7: USO DEL HOOK CENTRALIZADO REACTIVO DEL SHOP
  const { 
    selectedShop, 
    selectedShopId,
    calendarEvents, 
    shopBundles
  } = useShopState();

  // Estados locales
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof calendarEvents[0] | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🎯 CHECKPOINT 9.7: REACTIVIDAD AL CAMBIO DE SHOP
  useEffect(() => {
    // Resetear filtros locales cuando cambia el shop
    setSelectedBundleId('');
    setSearchTerm('');
    setSelectedEvent(null);
    setShowCreateModal(false);
    
    console.log('📅 Calendario actualizado para shop:', selectedShop.name);
    console.log('📊 Eventos cargados:', calendarEvents.length);
  }, [selectedShopId, selectedShop.name, calendarEvents.length]);

  // Eventos filtrados por bundle y búsqueda
  const filteredEvents = useMemo(() => {
    let events = calendarEvents;

    // Filtrar por bundle seleccionado
    if (selectedBundleId) {
      events = events.filter(event => 
        event.resource.kitId === selectedBundleId
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.resource.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return events;
  }, [calendarEvents, selectedBundleId, searchTerm]);

  // Estilo de eventos personalizado
  const eventStyleGetter = (event: typeof calendarEvents[0]) => {
    const status = event.resource.status;
    const colors = statusColors[status] || statusColors.PENDING;
    
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

  // Manejar selección de slot para crear reserva
  const handleSelectSlot = ({ start: _start }: { start: Date; end: Date }) => {
    setShowCreateModal(true);
  };

  // Manejar selección de evento para ver detalles
  const handleSelectEvent = (event: typeof calendarEvents[0]) => {
    setSelectedEvent(event);
  };

  // Manejar navegación del calendario
  const handleNavigate = (newDate: Date, view: View) => {
    setCurrentDate(newDate);
    setCurrentView(view);
  };

  // Opciones para el select de bundles
  const bundleOptions = [
    { value: '', label: 'Todos los bundles' },
    ...shopBundles.map((bundle: Bundle) => ({ 
      value: bundle.id, 
      label: bundle.name 
    }))
  ];

  return (
    <div className="space-y-6">
      {/* 🎯 CHECKPOINT 9.6: HEADER CON INFORMACIÓN DEL SHOP ACTIVO */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📅 Calendario - {selectedShop.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión completa de reservas del shop activo
            </p>
          </div>

              <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
            </Button>
          </div>
        </div>

      {/* 🎯 CHECKPOINT 9.6: ESTADÍSTICAS DEL SHOP EN CALENDARIO */}
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">Estado de Reservas</h3>
        <div className="flex flex-wrap gap-4">
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

      {/* Calendario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            messages={messages}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
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
                      variant={currentView === 'month' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Mes
                    </Button>
                    <Button
                      onClick={() => onView('week')}
                      variant={currentView === 'week' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Semana
                    </Button>
                    <Button
                      onClick={() => onView('day')}
                      variant={currentView === 'day' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Día
                    </Button>
                  </div>
                </div>
              ),
            }}
          />
        </div>
      </div>

      {/* Modal de creación de reserva con selector moderno */}
      {showCreateModal && (
        <ReservationTypeSelector
          onReservationCreated={(reservationId: string) => {
            console.log('Reserva creada:', reservationId);
            setShowCreateModal(false);
          }}
          onClose={() => {
            setShowCreateModal(false);
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