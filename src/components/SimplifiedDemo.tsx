// ========================================
// DEMO SIMPLIFICADO PARA ETAPA 3 - SIN ERRORES
// ========================================

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { sampleShop, sampleBundles, sampleBookings } from '../mockData/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type ViewType = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
  color?: string;
}

export const SimplifiedDemo: React.FC = () => {
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // ========================================
  // CONVERSIÓN A EVENTOS DE CALENDARIO
  // ========================================

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    for (const booking of sampleBookings) {
      for (const itemBooking of booking.itemBookings) {
        const bundle = sampleBundles.find(b => b.id === booking.bundleId);
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
            booking,
            itemBooking,
            item,
            bundle
          },
          color: getEventColor(itemBooking.status)
        });
      }
    }

    return events;
  }, []);

  // ========================================
  // FILTROS DE EVENTOS
  // ========================================

  const filteredEvents = useMemo(() => {
    if (selectedBundleId === 'all') {
      return calendarEvents;
    }
    
    return calendarEvents.filter(event => 
      event.resource.booking.bundleId === selectedBundleId
    );
  }, [calendarEvents, selectedBundleId]);

  // ========================================
  // OPCIONES DE FILTROS
  // ========================================

  const bundleOptions = [
    { value: 'all', label: 'Todos los bundles' },
    ...sampleBundles.map(bundle => ({ 
      value: bundle.id, 
      label: bundle.name 
    }))
  ];

  // ========================================
  // NAVEGACIÓN DEL CALENDARIO
  // ========================================

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    let newDate = new Date(date);
    
    switch (action) {
      case 'PREV':
        newDate = addDays(date, view === 'month' ? -30 : view === 'week' ? -7 : -1);
        break;
      case 'NEXT':
        newDate = addDays(date, view === 'month' ? 30 : view === 'week' ? 7 : 1);
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
    const backgroundColor = event.color || '#3174ad';
    
    return {
      style: {
        backgroundColor,
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Título del Demo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Calendario Inteligente - Demo Limpio
        </h1>
        <p className="text-gray-600">
          <strong>ETAPA 3:</strong> Mostrando items individuales en lugar de bundles completos
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">🎯 Logros Principales:</h3>
          <ul className="text-sm text-blue-800 mt-1 space-y-1">
            <li>✅ <strong>Eventos granulares:</strong> Cada actividad (item) aparece por separado</li>
            <li>✅ <strong>Filtros inteligentes:</strong> Por bundle completo</li>
            <li>✅ <strong>Modelo corregido:</strong> Horarios asignados a items, no a bundles</li>
            <li>✅ <strong>Integración completa:</strong> Etapa 1 + Etapa 2 + Etapa 3</li>
          </ul>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Header con controles */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Título y fecha */}
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                📅 Calendario por Items
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
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle
                </label>
                <Select
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  options={bundleOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas básicas */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{filteredEvents.length}</div>
              <div className="text-sm text-gray-600">Items programados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{sampleBundles.length}</div>
              <div className="text-sm text-gray-600">Bundles disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{sampleBookings.length}</div>
              <div className="text-sm text-gray-600">Reservas totales</div>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="p-4" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
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

        {/* Leyenda y explicación */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              💡 Diferencias vs Sistema Anterior:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="space-y-1">
                <h4 className="font-semibold text-red-700">❌ ANTES (Incorrecto):</h4>
                <li>• Un evento por bundle completo</li>
                <li>• "Día de Campo" (8:00-14:30)</li>
                <li>• Horarios asignados al bundle</li>
                <li>• Imposible gestionar recursos específicos</li>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-green-700">✅ AHORA (Correcto):</h4>
                <li>• Un evento por item individual</li>
                <li>• "Desayuno" (8:00-9:00), "Cabalgata" (10:30-12:00)</li>
                <li>• Horarios asignados a cada actividad</li>
                <li>• Gestión granular de recursos</li>
              </div>
            </div>
          </div>
          
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
          </div>
        </div>
      </Card>
    </div>
  );
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function getEventColor(status: string): string {
  const colors = {
    'PENDING': '#f59e0b',
    'CONFIRMED': '#10b981',
    'CANCELLED': '#ef4444',
    'COMPLETED': '#6b7280',
    'NO_SHOW': '#f97316',
    'RESCHEDULED': '#3b82f6',
    'PARTIAL_REFUND': '#6366f1'
  };

  return colors[status as keyof typeof colors] || '#3174ad';
} 