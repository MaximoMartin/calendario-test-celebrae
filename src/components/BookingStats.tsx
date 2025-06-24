import React, { useMemo } from 'react';
import { TrendingUp, Calendar, Users, Clock, Filter, ChevronDown } from 'lucide-react';
import type { Booking, Kit, ViewType } from '../types';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfDay, 
  endOfDay,
  format 
} from 'date-fns';
import { es } from 'date-fns/locale';

interface BookingStatsProps {
  bookings: Booking[];
  selectedKitId?: string;
  selectedView?: ViewType;
  currentDate?: Date;
  kits?: Kit[];
  className?: string;
}

export const BookingStats: React.FC<BookingStatsProps> = ({
  bookings,
  selectedKitId,
  selectedView = 'week',
  currentDate = new Date(),
  kits = [],
  className,
}) => {
  const [showAdditionalStats, setShowAdditionalStats] = React.useState(false);

  // Filtrar reservas según los criterios
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Filtrar por kit si hay uno seleccionado
    if (selectedKitId && selectedKitId !== 'all') {
      filtered = filtered.filter(booking => booking.kitId === selectedKitId);
    }

    // Filtrar por período de tiempo según la vista del calendario
    const currentDateObj = new Date(currentDate);
    let startDate: Date;
    let endDate: Date;

    switch (selectedView) {
      case 'day':
        startDate = startOfDay(currentDateObj);
        endDate = endOfDay(currentDateObj);
        break;
      case 'week':
        startDate = startOfWeek(currentDateObj, { weekStartsOn: 1 }); // Lunes
        endDate = endOfWeek(currentDateObj, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(currentDateObj);
        endDate = endOfMonth(currentDateObj);
        break;
      default:
        startDate = startOfWeek(currentDateObj, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDateObj, { weekStartsOn: 1 });
    }

    // Filtrar por rango de fechas
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    return filtered;
  }, [bookings, selectedKitId, selectedView, currentDate]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    return {
      total: filteredBookings.length,
      pending: filteredBookings.filter(b => b.status === 'PENDING').length,
      confirmed: filteredBookings.filter(b => b.status === 'CONFIRMED').length,
      cancelled: filteredBookings.filter(b => b.status === 'CANCELLED').length,
      completed: filteredBookings.filter(b => b.status === 'COMPLETED').length,
      noShow: filteredBookings.filter(b => b.status === 'NO_SHOW').length,
      rescheduled: filteredBookings.filter(b => b.status === 'RESCHEDULED').length,
      partialRefund: filteredBookings.filter(b => b.status === 'PARTIAL_REFUND').length,
    };
  }, [filteredBookings]);

  // Información contextual para mostrar qué se está filtrando
  const getContextInfo = () => {
    const parts = [];
    
    // Información del kit
    if (selectedKitId && selectedKitId !== 'all') {
      const kit = kits.find(k => k.id === selectedKitId);
      if (kit) {
        parts.push(`Servicio: ${kit.name}`);
      }
    } else {
      parts.push('Todos los servicios');
    }

    // Información del período
    const currentDateObj = new Date(currentDate);
    switch (selectedView) {
      case 'day':
        parts.push(`Día: ${format(currentDateObj, 'dd/MM/yyyy', { locale: es })}`);
        break;
      case 'week':
        const weekStart = startOfWeek(currentDateObj, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDateObj, { weekStartsOn: 1 });
        parts.push(`Semana: ${format(weekStart, 'dd/MM', { locale: es })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: es })}`);
        break;
      case 'month':
        parts.push(`Mes: ${format(currentDateObj, 'MMMM yyyy', { locale: es })}`);
        break;
    }

    return parts.join(' • ');
  };

  const mainStatCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Confirmadas',
      value: stats.confirmed,
      icon: TrendingUp,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: Users,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  ];

  // Estadísticas adicionales si hay espacio
  const additionalStats = [
    { label: 'Canceladas', value: stats.cancelled, color: 'text-red-700', bgColor: 'bg-red-50' },
    { label: 'No se presentó', value: stats.noShow, color: 'text-orange-700', bgColor: 'bg-orange-50' },
    { label: 'Reprogramadas', value: stats.rescheduled, color: 'text-blue-700', bgColor: 'bg-blue-50' },
    { label: 'Reembolso parcial', value: stats.partialRefund, color: 'text-purple-700', bgColor: 'bg-purple-50' },
  ];

  const getPercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <div className={className}>
      {/* Header con información contextual - Responsive */}
      <div className="mb-4 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <span className="text-sm text-gray-600 leading-relaxed">{getContextInfo()}</span>
        </div>
      </div>

      {/* Estadísticas principales - Grid responsive mejorado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
        {mainStatCards.map((stat) => {
          const Icon = stat.icon;
          const percentage = getPercentage(stat.value);
          
          return (
            <div
              key={stat.title}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-3 lg:p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 lg:p-2 rounded-lg bg-white/80 ${stat.borderColor} border`}>
                  <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.color}`} />
                </div>
                {stats.total > 0 && (
                  <span className="text-xs lg:text-sm text-gray-500 font-medium">
                    {percentage}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas adicionales - Colapsable en móvil */}
      <div className="space-y-3">
        {/* Toggle button para móvil */}
        <button
          onClick={() => setShowAdditionalStats(!showAdditionalStats)}
          className="lg:hidden w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>Estadísticas detalladas</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdditionalStats ? 'rotate-180' : ''}`} />
        </button>

        {/* Estadísticas adicionales */}
        <div className={`${showAdditionalStats ? 'block' : 'hidden'} lg:block`}>
          {additionalStats.some(stat => stat.value > 0) ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Estadísticas Detalladas
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {additionalStats.map((stat) => {
                  if (stat.value === 0) return null;
                  const percentage = getPercentage(stat.value);
                  
                  return (
                    <div
                      key={stat.label}
                      className={`${stat.bgColor} border border-gray-100 rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1 leading-tight">
                            {stat.label}
                          </p>
                          <div className="flex items-baseline space-x-2">
                            <p className={`text-lg font-semibold ${stat.color}`}>
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500">
                              ({percentage}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-center text-gray-500">
                <p className="text-sm">No hay estadísticas adicionales para mostrar</p>
                <p className="text-xs mt-1">Solo se muestran las estadísticas principales</p>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje informativo cuando no hay datos */}
        {stats.total === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium">No hay reservas en el período seleccionado</p>
              <p className="text-xs mt-1">Intenta cambiar los filtros o el rango de fechas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 