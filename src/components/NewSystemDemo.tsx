// ========================================
// DEMO COMPLETO DEL NUEVO SISTEMA INTEGRADO
// ETAPAS 1, 2 Y 3: Modelo + Motor + Calendario
// ========================================

import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Bundle, Booking, Shop, BundleItem } from '../types/newModel';
import { useAvailability } from '../hooks/useAvailability';
import { sampleShop, sampleBundles, sampleBookings } from '../mockData/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { ChevronLeft, ChevronRight, Filter, Plus, Users, Clock, AlertTriangle } from 'lucide-react';
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

export const NewSystemDemo: React.FC = () => {
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);

  // Hook de disponibilidad con datos de ejemplo
  const availability = useAvailability({ 
    shop: sampleShop, 
    bundles: sampleBundles, 
    bookings 
  });

  // ========================================
  // CONVERSIÓN A EVENTOS DE CALENDARIO
  // ========================================

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    for (const booking of bookings) {
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
  }, [bookings]);

  // ========================================
  // FILTROS DE EVENTOS
  // ========================================

  const filteredEvents = useMemo(() => {
    let filtered = calendarEvents;

    if (selectedBundleId !== 'all') {
      filtered = filtered.filter(event => 
        event.resource.booking.bundleId === selectedBundleId
      );
    }

    if (selectedItemId !== 'all') {
      filtered = filtered.filter(event => 
        event.resource.itemBooking.itemId === selectedItemId
      );
    }

    return filtered;
  }, [calendarEvents, selectedBundleId, selectedItemId]);

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

  const itemOptions = useMemo(() => {
    if (selectedBundleId === 'all') {
      const allItems = sampleBundles.flatMap(bundle => 
        bundle.items.map(item => ({
          value: item.id,
          label: `${bundle.name} - ${item.name}`
        }))
      );
      return [{ value: 'all', label: 'Todos los items' }, ...allItems];
    } else {
      const selectedBundle = sampleBundles.find(b => b.id === selectedBundleId);
      if (!selectedBundle) return [{ value: 'all', label: 'Todos los items' }];
      
      return [
        { value: 'all', label: 'Todos los items' },
        ...selectedBundle.items.map(item => ({
          value: item.id,
          label: item.name
        }))
      ];
    }
  }, [selectedBundleId]);

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
  // CREACIÓN RÁPIDA DE RESERVAS
  // ========================================

  const handleSlotSelect = async (slotInfo: { start: Date; end: Date }) => {
    const dateStr = format(slotInfo.start, 'yyyy-MM-dd');
    
    // Verificar disponibilidad del primer bundle
    const testBundle = sampleBundles[0];
    const result = await availability.checkAvailability({
      bundleId: testBundle.id,
      date: dateStr,
      itemSelections: testBundle.items.map(item => ({
        itemId: item.id,
        timeSlotId: item.timeSlots[0]?.id || 'default-slot',
        numberOfPeople: 2
      })),
      extraSelections: []
    });

    if (result.isAvailable) {
      // Crear nueva reserva de ejemplo
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        bundleId: testBundle.id,
        bundleName: testBundle.name,
        shopId: sampleShop.id,
        customerName: 'Cliente Demo',
        customerEmail: 'demo@email.com',
        customerPhone: '+34123456789',
        date: dateStr,
        status: 'PENDING',
        isManual: true,
        createdAt: new Date().toISOString(),
        pricing: {
          totalAmount: testBundle.basePrice,
          paidAmount: 0,
          refundAmount: 0,
          cancellationFee: 0
        },
        itemBookings: testBundle.items.map((item, index) => ({
          id: `item-booking-${Date.now()}-${index}`,
          bookingId: `booking-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          timeSlotId: item.timeSlots[0].id,
          startTime: item.timeSlots[0].startTime,
          endTime: item.timeSlots[0].endTime,
          numberOfPeople: 2,
          status: 'PENDING',
          resourceAllocations: []
        })),
        extraBookings: [],
        notes: 'Reserva creada desde el calendario'
      };

      setBookings(prev => [...prev, newBooking]);
      alert('✅ Reserva creada exitosamente!');
    } else {
      alert(`❌ No disponible: ${result.conflicts.join(', ')}`);
    }
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
  // ESTADÍSTICAS DEL DÍA
  // ========================================

  const DayStats = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const stats = availability.getOccupancyStats(dateStr);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
          <div className="text-sm text-gray-600">Reservas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(stats.overallOccupancy * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Ocupación</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(stats.resources).length}
          </div>
          <div className="text-sm text-gray-600">Recursos activos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            €0
          </div>
          <div className="text-sm text-gray-600">Ingresos</div>
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Título del Demo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Nuevo Sistema de Reservas - Demo Integrado
        </h1>
        <p className="text-gray-600">
          <strong>ETAPA 3:</strong> Calendario inteligente con modelo Bundle→Items + Motor de disponibilidad
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* Header con controles */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Título y fecha */}
            <div className="flex-1">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                📅 Calendario Inteligente
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
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  options={bundleOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item específico
                </label>
                <Select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  options={itemOptions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas del día */}
        <DayStats />

        {/* Calendario */}
        <div className="p-4" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
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

        {/* Leyenda y instrucciones */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Funcionalidades demostradas:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Eventos por items individuales</strong> (no por bundles completos)</li>
              <li>• <strong>Filtros inteligentes</strong> por bundle e item específico</li>
              <li>• <strong>Creación rápida:</strong> Haz clic en un slot vacío para crear reserva</li>
              <li>• <strong>Validación automática</strong> con motor de disponibilidad</li>
              <li>• <strong>Estadísticas en tiempo real</strong> de ocupación y recursos</li>
            </ul>
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