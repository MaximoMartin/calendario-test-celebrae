// ========================================
// ESTADÍSTICAS Y MÉTRICAS AVANZADAS - NUEVO MODELO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Bundle, BookingStatus } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  Users, Package, Star, Clock, MapPin, AlertTriangle,
  BarChart3, PieChart, Activity, Target, Award,
  ChevronUp, ChevronDown, Download, RefreshCw
} from 'lucide-react';

interface BookingStatsProps {
  bookings: Booking[];
  bundles: Bundle[];
  onExportData?: (format: 'csv' | 'pdf') => void;
  showAdvanced?: boolean;
}

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type MetricType = 'revenue' | 'bookings' | 'customers' | 'items' | 'occupancy';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export const BookingStats: React.FC<BookingStatsProps> = ({
  bookings,
  bundles,
  onExportData,
  showAdvanced = true
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('month');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');
  const [showComparison, setShowComparison] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  // ========================================
  // CÁLCULOS DE FECHAS
  // ========================================

  const dateRanges = useMemo(() => {
    const now = new Date();
    
    switch (selectedTimeRange) {
      case 'today':
        return {
          current: { start: now, end: now },
          previous: { start: subDays(now, 1), end: subDays(now, 1) }
        };
      case 'week':
        return {
          current: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) },
          previous: { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) }
        };
      case 'month':
        return {
          current: { start: startOfMonth(now), end: endOfMonth(now) },
          previous: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) }
        };
      default:
        return {
          current: { start: startOfMonth(now), end: endOfMonth(now) },
          previous: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) }
        };
    }
  }, [selectedTimeRange]);

  // ========================================
  // FILTROS DE DATOS
  // ========================================

  const filteredBookings = useMemo(() => {
    const { current } = dateRanges;
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.date);
      return bookingDate >= current.start && bookingDate <= current.end;
    });
  }, [bookings, dateRanges]);

  const previousBookings = useMemo(() => {
    const { previous } = dateRanges;
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.date);
      return bookingDate >= previous.start && bookingDate <= previous.end;
    });
  }, [bookings, dateRanges]);

  // ========================================
  // MÉTRICAS PRINCIPALES
  // ========================================

  const metrics = useMemo(() => {
    // Métricas actuales
    const currentRevenue = filteredBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0);
    const currentBookingsCount = filteredBookings.length;
    const currentCustomers = new Set(filteredBookings.map(b => b.customerEmail)).size;
    const currentItems = filteredBookings.reduce((sum, booking) => sum + booking.itemBookings.length, 0);
    
    // Métricas del período anterior
    const previousRevenue = previousBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0);
    const previousBookingsCount = previousBookings.length;
    const previousCustomers = new Set(previousBookings.map(b => b.customerEmail)).size;
    const previousItems = previousBookings.reduce((sum, booking) => sum + booking.itemBookings.length, 0);

    // Calcular cambios porcentuales
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(currentRevenue, previousRevenue);
    const bookingsChange = calculateChange(currentBookingsCount, previousBookingsCount);
    const customersChange = calculateChange(currentCustomers, previousCustomers);
    const itemsChange = calculateChange(currentItems, previousItems);

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange
      },
      bookings: {
        current: currentBookingsCount,
        previous: previousBookingsCount,
        change: bookingsChange
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        change: customersChange
      },
      items: {
        current: currentItems,
        previous: previousItems,
        change: itemsChange
      },
      averageBookingValue: currentBookingsCount > 0 ? currentRevenue / currentBookingsCount : 0,
      customerRetention: 0, // Calcular retención de clientes
      occupancyRate: 0 // Calcular tasa de ocupación
    };
  }, [filteredBookings, previousBookings]);

  // ========================================
  // MÉTRICAS POR ESTADO
  // ========================================

  const statusMetrics = useMemo(() => {
    const statusCounts = filteredBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<BookingStatus, number>);

    const total = filteredBookings.length;
    
    return {
      confirmed: { count: statusCounts.CONFIRMED || 0, percentage: total > 0 ? ((statusCounts.CONFIRMED || 0) / total) * 100 : 0 },
      pending: { count: statusCounts.PENDING || 0, percentage: total > 0 ? ((statusCounts.PENDING || 0) / total) * 100 : 0 },
      cancelled: { count: statusCounts.CANCELLED || 0, percentage: total > 0 ? ((statusCounts.CANCELLED || 0) / total) * 100 : 0 },
      completed: { count: statusCounts.COMPLETED || 0, percentage: total > 0 ? ((statusCounts.COMPLETED || 0) / total) * 100 : 0 },
      noShow: { count: statusCounts.NO_SHOW || 0, percentage: total > 0 ? ((statusCounts.NO_SHOW || 0) / total) * 100 : 0 }
    };
  }, [filteredBookings]);

  // ========================================
  // BUNDLES MÁS POPULARES
  // ========================================

  const bundleStats = useMemo(() => {
    const bundleCounts = filteredBookings.reduce((acc, booking) => {
      acc[booking.bundleId] = (acc[booking.bundleId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bundleRevenue = filteredBookings.reduce((acc, booking) => {
      acc[booking.bundleId] = (acc[booking.bundleId] || 0) + booking.pricing.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(bundleCounts)
      .map(([bundleId, count]) => {
        const bundle = bundles.find(b => b.id === bundleId);
        return {
          id: bundleId,
          name: bundle?.name || 'Bundle Desconocido',
          bookings: count,
          revenue: bundleRevenue[bundleId] || 0,
          percentage: (count / filteredBookings.length) * 100
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [filteredBookings, bundles]);

  // ========================================
  // TENDENCIAS TEMPORALES
  // ========================================

  const trendData = useMemo(() => {
    const { current } = dateRanges;
    let intervals: Date[] = [];

    if (selectedTimeRange === 'week') {
      intervals = eachDayOfInterval(current);
    } else if (selectedTimeRange === 'month') {
      intervals = eachWeekOfInterval(current);
    } else {
      intervals = eachDayOfInterval(current);
    }

    return intervals.map(date => {
      const dayBookings = filteredBookings.filter(booking => {
        const bookingDate = parseISO(booking.date);
        if (selectedTimeRange === 'week') {
          return format(bookingDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        } else {
          return bookingDate >= startOfWeek(date, { weekStartsOn: 1 }) && 
                 bookingDate <= endOfWeek(date, { weekStartsOn: 1 });
        }
      });

      return {
        label: selectedTimeRange === 'week' 
          ? format(date, 'dd/MM', { locale: es })
          : format(date, "'Sem' w", { locale: es }),
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0)
      };
    });
  }, [filteredBookings, dateRanges, selectedTimeRange]);

  // ========================================
  // HORARIOS PICO
  // ========================================

  const peakHours = useMemo(() => {
    const hourCounts = {} as Record<string, number>;
    
    filteredBookings.forEach(booking => {
      booking.itemBookings.forEach(item => {
        const hour = item.startTime.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        bookings: count,
        percentage: (count / Object.values(hourCounts).reduce((a, b) => a + b, 0)) * 100
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [filteredBookings]);

  // ========================================
  // HANDLERS
  // ========================================

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    onExportData?.(format);
  }, [onExportData]);

  // ========================================
  // UTILIDADES DE RENDERIZADO
  // ========================================

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.revenue.current),
      change: metrics.revenue.change,
      changeLabel: formatPercentage(metrics.revenue.change),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: metrics.revenue.change > 0 ? 'up' : metrics.revenue.change < 0 ? 'down' : 'stable'
    },
    {
      title: 'Total Reservas',
      value: metrics.bookings.current,
      change: metrics.bookings.change,
      changeLabel: formatPercentage(metrics.bookings.change),
      icon: Calendar,
      color: 'bg-blue-500',
      trend: metrics.bookings.change > 0 ? 'up' : metrics.bookings.change < 0 ? 'down' : 'stable'
    },
    {
      title: 'Clientes Únicos',
      value: metrics.customers.current,
      change: metrics.customers.change,
      changeLabel: formatPercentage(metrics.customers.change),
      icon: Users,
      color: 'bg-purple-500',
      trend: metrics.customers.change > 0 ? 'up' : metrics.customers.change < 0 ? 'down' : 'stable'
    },
    {
      title: 'Actividades Vendidas',
      value: metrics.items.current,
      change: metrics.items.change,
      changeLabel: formatPercentage(metrics.items.change),
      icon: Package,
      color: 'bg-orange-500',
      trend: metrics.items.change > 0 ? 'up' : metrics.items.change < 0 ? 'down' : 'stable'
    }
  ];

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>Estadísticas y Métricas</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Analytics completos del rendimiento del negocio
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
              options={[
                { value: 'today', label: 'Hoy' },
                { value: 'week', label: 'Esta Semana' },
                { value: 'month', label: 'Este Mes' },
                { value: 'quarter', label: 'Trimestre' },
                { value: 'year', label: 'Año' }
              ]}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>

        {/* Período seleccionado */}
        <div className="text-sm text-gray-600">
          Período: {format(dateRanges.current.start, 'dd/MM/yyyy', { locale: es })} - {format(dateRanges.current.end, 'dd/MM/yyyy', { locale: es })}
          {showComparison && (
            <span className="ml-2">
              • Comparando con: {format(dateRanges.previous.start, 'dd/MM/yyyy', { locale: es })} - {format(dateRanges.previous.end, 'dd/MM/yyyy', { locale: es })}
            </span>
          )}
        </div>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color} rounded-lg p-3`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              {showComparison && metric.change !== undefined && (
                <div className={`flex items-center space-x-1 ${getChangeColor(metric.change)}`}>
                  {getChangeIcon(metric.change)}
                  <span className="text-sm font-medium">{metric.changeLabel}</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Estados de reservas */}
      <Card className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('status')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Estado de Reservas</span>
          </h3>
          {expandedSections.includes('status') ? 
            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </div>
        
        {expandedSections.includes('status') && (
          <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{statusMetrics.confirmed.count}</div>
                <div className="text-sm text-gray-600">Confirmadas</div>
                <div className="text-xs text-green-600">{statusMetrics.confirmed.percentage.toFixed(1)}%</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{statusMetrics.pending.count}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
                <div className="text-xs text-yellow-600">{statusMetrics.pending.percentage.toFixed(1)}%</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{statusMetrics.completed.count}</div>
                <div className="text-sm text-gray-600">Completadas</div>
                <div className="text-xs text-gray-600">{statusMetrics.completed.percentage.toFixed(1)}%</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{statusMetrics.cancelled.count}</div>
                <div className="text-sm text-gray-600">Canceladas</div>
                <div className="text-xs text-red-600">{statusMetrics.cancelled.percentage.toFixed(1)}%</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{statusMetrics.noShow.count}</div>
                <div className="text-sm text-gray-600">No Show</div>
                <div className="text-xs text-orange-600">{statusMetrics.noShow.percentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bundles más populares */}
      <Card className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('bundles')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Servicios Más Populares</span>
          </h3>
          {expandedSections.includes('bundles') ? 
            <ChevronUp className="w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </div>
        
        {expandedSections.includes('bundles') && (
          <div className="mt-6 space-y-4">
            {bundleStats.map((bundle, index) => (
              <div key={bundle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-600">{bundle.bookings} reservas • {bundle.percentage.toFixed(1)}% del total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(bundle.revenue)}</p>
                  <p className="text-sm text-gray-600">Ingresos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Horarios pico */}
      {showAdvanced && (
        <Card className="p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('hours')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Horarios Pico</span>
            </h3>
            {expandedSections.includes('hours') ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </div>
          
          {expandedSections.includes('hours') && (
            <div className="mt-6">
              <div className="space-y-3">
                {peakHours.map((hour, index) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-blue-500 rounded" style={{ 
                        height: `${Math.max(12, (hour.percentage / 100) * 32)}px` 
                      }}></div>
                      <span className="font-medium">{hour.hour}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{hour.bookings}</span>
                      <span className="text-sm text-gray-600 ml-2">({hour.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Valor Promedio</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(metrics.averageBookingValue)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Por reserva</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Tasa de Retención</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {metrics.customerRetention.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Clientes recurrentes</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Activity className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Ocupación</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {metrics.occupancyRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Capacidad utilizada</p>
        </Card>
      </div>
    </div>
  );
}; 