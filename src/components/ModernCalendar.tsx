import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Filter, Grid3X3, List, Layers, Eye } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { mockBundles, mockShops, mockBookings } from '../mockData';
import type { Booking, Bundle, BundleItem, Resource, ViewType } from '../types';

// Configuración del localizador
moment.locale('es');
const localizer = momentLocalizer(moment);

interface ModernCalendarProps {
  selectedShopId: string;
  onSelectBooking?: (booking: Booking) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; resource?: any }) => void;
}

type CalendarViewMode = 'bookings' | 'items' | 'resources' | 'timeline';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'booking' | 'item' | 'resource_block';
    data: any;
    bookingId?: string;
    itemId?: string;
    resourceId?: string;
    status?: string;
    customerName?: string;
    bundleName?: string;
    color?: string;
  };
}

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  selectedShopId,
  onSelectBooking,
  onSelectSlot
}) => {
  // Estados
  const [viewMode, setViewMode] = useState<CalendarViewMode>('bookings');
  const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string>('all');

  // Datos derivados
  const selectedShop = useMemo(() => 
    mockShops.find(shop => shop.id === selectedShopId),
    [selectedShopId]
  );

  const shopBundles = useMemo(() => 
    mockBundles.filter(bundle => bundle.shopId === selectedShopId),
    [selectedShopId]
  );

  const shopBookings = useMemo(() => 
    mockBookings.filter(booking => booking.shopId === selectedShopId),
    [selectedShopId]
  );

  const allItems = useMemo(() => 
    shopBundles.flatMap(bundle => 
      bundle.items.map(item => ({ ...item, bundleId: bundle.id, bundleName: bundle.name }))
    ),
    [shopBundles]
  );

  const allResources = useMemo(() => 
    selectedShop?.resources || [],
    [selectedShop]
  );

  // Funciones de color (definidas antes de usarse en useMemo)
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#6366f1';
      case 'CANCELLED': return '#ef4444';
      case 'NO_SHOW': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getItemColor = (itemId: string): string => {
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#84cc16'];
    const index = Array.from(itemId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getResourceColor = (resourceId: string): string => {
    const colors = ['#f97316', '#e11d48', '#7c3aed', '#059669', '#dc2626', '#2563eb'];
    const index = Array.from(resourceId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Conversión de datos a eventos de calendario
  const calendarEvents = useMemo((): CalendarEvent[] => {
    switch (viewMode) {
      case 'bookings':
        return shopBookings.map(booking => {
          const bundle = shopBundles.find(b => b.id === booking.bundleId);
          // Validación defensiva para fechas
          const startTime = booking.earliestStartTime || '00:00';
          const endTime = booking.latestEndTime || '23:59';
          const bookingDate = booking.date || new Date().toISOString().split('T')[0];
          
          return {
            id: booking.id,
            title: `${booking.customerName} - ${booking.bundleName}`,
            start: new Date(`${bookingDate}T${startTime}`),
            end: new Date(`${bookingDate}T${endTime}`),
            resource: {
              type: 'booking' as const,
              data: booking,
              bookingId: booking.id,
              status: booking.status,
              customerName: booking.customerName,
              bundleName: booking.bundleName,
              color: getStatusColor(booking.status)
            }
          };
        });

      case 'items':
        return shopBookings.flatMap(booking => 
          (booking.selectedItems || []).map(item => {
            const bundleItem = allItems.find(bi => bi.id === item.itemId);
            // Validación defensiva para fechas de items
            const itemStartTime = item.startTime || '00:00';
            const itemEndTime = item.endTime || '23:59';
            const itemDate = item.date || booking.date || new Date().toISOString().split('T')[0];
            
            return {
              id: `${booking.id}-${item.itemId}`,
              title: `${bundleItem?.name || 'Item'} - ${booking.customerName}`,
              start: new Date(`${itemDate}T${itemStartTime}`),
              end: new Date(`${itemDate}T${itemEndTime}`),
              resource: {
                type: 'item' as const,
                data: { booking, item, bundleItem },
                bookingId: booking.id,
                itemId: item.itemId,
                status: booking.status,
                customerName: booking.customerName,
                bundleName: booking.bundleName,
                color: getItemColor(item.itemId)
              }
            };
          })
        ).filter(event => 
          selectedItemFilter === 'all' || event.resource.itemId === selectedItemFilter
        );

      case 'resources':
        return shopBookings.flatMap(booking => 
          (booking.selectedItems || []).flatMap(item => 
            (item.assignedResources || []).map(resource => {
              // Validación defensiva para fechas de recursos
              const resourceStartTime = resource.effectiveStartTime || resource.startTime || '00:00';
              const resourceEndTime = resource.effectiveEndTime || resource.endTime || '23:59';
              const resourceDate = booking.date || new Date().toISOString().split('T')[0];
              
              return {
                id: `${booking.id}-${item.itemId}-${resource.resourceId}`,
                title: `${allResources.find(r => r.id === resource.resourceId)?.name || 'Recurso'} - ${booking.customerName}`,
                start: new Date(`${resourceDate}T${resourceStartTime}`),
                end: new Date(`${resourceDate}T${resourceEndTime}`),
                resource: {
                  type: 'resource_block' as const,
                  data: { booking, item, resource },
                  bookingId: booking.id,
                  resourceId: resource.resourceId,
                  status: booking.status,
                  customerName: booking.customerName,
                  color: getResourceColor(resource.resourceId)
                }
              };
            })
          )
        ).filter(event => 
          selectedResourceFilter === 'all' || event.resource.resourceId === selectedResourceFilter
        );

      case 'timeline':
        // Vista timeline combinada
        return [
          ...shopBookings.map(booking => {
            const startTime = booking.earliestStartTime || '00:00';
            const endTime = booking.latestEndTime || '23:59';
            const bookingDate = booking.date || new Date().toISOString().split('T')[0];
            
            return {
              id: booking.id,
              title: `📅 ${booking.customerName} - ${booking.bundleName}`,
              start: new Date(`${bookingDate}T${startTime}`),
              end: new Date(`${bookingDate}T${endTime}`),
              resource: {
                type: 'booking' as const,
                data: booking,
                color: getStatusColor(booking.status)
              }
            };
          }),
          ...shopBookings.flatMap(booking => 
            (booking.selectedItems || []).map(item => {
              const bundleItem = allItems.find(bi => bi.id === item.itemId);
              const itemStartTime = item.startTime || '00:00';
              const itemEndTime = item.endTime || '23:59';
              const itemDate = item.date || booking.date || new Date().toISOString().split('T')[0];
              
              return {
                id: `item-${booking.id}-${item.itemId}`,
                title: `🎯 ${bundleItem?.name || 'Item'}`,
                start: new Date(`${itemDate}T${itemStartTime}`),
                end: new Date(`${itemDate}T${itemEndTime}`),
                resource: {
                  type: 'item' as const,
                  data: { booking, item, bundleItem },
                  color: getItemColor(item.itemId)
                }
              };
            })
          )
        ];

      default:
        return [];
    }
  }, [viewMode, shopBookings, shopBundles, allItems, allResources, selectedItemFilter, selectedResourceFilter, getStatusColor, getItemColor, getResourceColor]);

  // Handlers
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.type === 'booking' && onSelectBooking) {
      onSelectBooking(event.resource.data);
    }
  }, [onSelectBooking]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; resource?: any }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  }, [onSelectSlot]);

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCalendarView(view);
  };

  // Componente de estilo de eventos
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const baseStyle = {
      backgroundColor: event.resource.color || '#3174ad',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      display: 'block',
      fontSize: '12px',
      fontWeight: '500',
      padding: '2px 4px'
    };

    // Estilos específicos por tipo
    switch (event.resource.type) {
      case 'booking':
        return {
          style: {
            ...baseStyle,
            border: `2px solid ${event.resource.color}`,
            backgroundColor: `${event.resource.color}20`,
            color: event.resource.color
          }
        };
      case 'item':
        return {
          style: {
            ...baseStyle,
            border: 'none',
            borderLeft: `4px solid ${event.resource.color}`,
            backgroundColor: `${event.resource.color}40`
          }
        };
      case 'resource_block':
        return {
          style: {
            ...baseStyle,
            border: 'none',
            backgroundImage: `repeating-linear-gradient(45deg, ${event.resource.color}, ${event.resource.color} 10px, transparent 10px, transparent 20px)`,
            opacity: 0.6
          }
        };
      default:
        return { 
          style: {
            ...baseStyle,
            border: 'none'
          }
        };
    }
  }, []);

  // Vistas disponibles
  const viewModes = [
    { id: 'bookings' as const, label: 'Reservas', icon: CalendarIcon, description: 'Vista general de reservas' },
    { id: 'items' as const, label: 'Actividades', icon: List, description: 'Vista detallada por actividad' },
    { id: 'resources' as const, label: 'Recursos', icon: Grid3X3, description: 'Uso de recursos físicos' },
    { id: 'timeline' as const, label: 'Timeline', icon: Layers, description: 'Vista combinada y timeline' }
  ];

  const calendarViews = [
    { id: Views.DAY, label: 'Día' },
    { id: Views.WEEK, label: 'Semana' },
    { id: Views.MONTH, label: 'Mes' }
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Modo de vista */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Vista:</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {viewModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={mode.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtros específicos */}
          <div className="flex items-center gap-4">
            {viewMode === 'items' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                                 <select
                   value={selectedItemFilter}
                   onChange={(e) => setSelectedItemFilter(e.target.value)}
                   className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">Todas las actividades</option>
                   {allItems.map(item => (
                     <option key={item.id} value={item.id}>
                       {item.name} ({item.bundleName})
                     </option>
                   ))}
                 </select>
              </div>
            )}

            {viewMode === 'resources' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                                 <select
                   value={selectedResourceFilter}
                   onChange={(e) => setSelectedResourceFilter(e.target.value)}
                   className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">Todos los recursos</option>
                   {allResources.map(resource => (
                     <option key={resource.id} value={resource.id}>
                       {resource.name} ({resource.type})
                     </option>
                   ))}
                 </select>
              </div>
            )}

            {/* Vista de calendario */}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
                             <select
                 value={calendarView}
                 onChange={(e) => setCalendarView(e.target.value as View)}
                 className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 {calendarViews.map(view => (
                   <option key={view.id} value={view.id}>
                     {view.label}
                   </option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold text-blue-900">Reservas Hoy</div>
            <div className="text-blue-600 text-lg font-bold">
              {shopBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-semibold text-green-900">Items Activos</div>
            <div className="text-green-600 text-lg font-bold">
              {allItems.length}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-semibold text-purple-900">Recursos</div>
            <div className="text-purple-600 text-lg font-bold">
              {allResources.length}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="font-semibold text-orange-900">En Progreso</div>
            <div className="text-orange-600 text-lg font-bold">
              {shopBookings.filter(b => b.status === 'IN_PROGRESS').length}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendario */}
      <Card className="p-4">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={calendarView}
            views={['month', 'week', 'day']}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este período",
              showMore: (total) => `+ Ver ${total} más`
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              dayFormat: 'dddd DD/MM',
              dateFormat: 'DD',
              monthHeaderFormat: 'MMMM YYYY',
              dayHeaderFormat: 'dddd DD/MM'
            }}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 7, 0, 0)}
            max={new Date(2024, 0, 1, 23, 0, 0)}
            dayLayoutAlgorithm="no-overlap"
          />
        </div>
      </Card>

      {/* Leyenda */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {viewMode === 'bookings' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span>Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>En Progreso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Cancelada</span>
              </div>
            </>
          )}

          {viewMode === 'items' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-l-4 border-purple-500 bg-purple-100"></div>
                <span>Actividad Individual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-l-4 border-blue-500 bg-blue-100"></div>
                <span>Actividad con Dependencias</span>
              </div>
            </>
          )}

          {viewMode === 'resources' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500 opacity-60"></div>
                <span>Recurso en Uso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 4px, transparent 4px, transparent 8px)' 
                }}></div>
                <span>Recurso con Setup/Cleanup</span>
              </div>
            </>
          )}

          {viewMode === 'timeline' && (
            <>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Reserva Completa</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>Actividad Específica</span>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}; 