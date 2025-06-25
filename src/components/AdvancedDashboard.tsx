import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Bundle, Shop, BookingStatus } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Calendar, Users, Euro, PieChart, Activity, Target, Star, MapPin } from 'lucide-react';

interface AdvancedDashboardProps {
  shop: Shop;
  bundles: Bundle[];
  bookings: Booking[];
  onNavigateToBooking?: (bookingId: string) => void;
  onCreateBooking?: () => void;
  onExportData?: (format: 'csv' | 'pdf') => void;
}

type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year';
type MetricType = 'revenue' | 'bookings';

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  shop,
  bundles,
  bookings,
  onNavigateToBooking,
  onCreateBooking,
  onExportData
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('month');
  const [selectedBundle, setSelectedBundle] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue');

  const analytics = useMemo(() => {
    const now = new Date();
    let dateFilter: (date: string) => boolean;

    switch (selectedDateRange) {
      case 'today':
        const today = format(now, 'yyyy-MM-dd');
        dateFilter = (date) => date === today;
        break;
      case 'week':
        const weekStart = startOfWeek(now, { locale: es });
        const weekEnd = endOfWeek(now, { locale: es });
        dateFilter = (date) => isWithinInterval(parseISO(date), { start: weekStart, end: weekEnd });
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        dateFilter = (date) => isWithinInterval(parseISO(date), { start: monthStart, end: monthEnd });
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        dateFilter = (date) => isWithinInterval(parseISO(date), { start: quarterStart, end: quarterEnd });
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        dateFilter = (date) => isWithinInterval(parseISO(date), { start: yearStart, end: yearEnd });
        break;
      default:
        dateFilter = () => true;
    }

    const filteredBookings = bookings.filter(booking => {
      const matchesDate = dateFilter(booking.date);
      const matchesBundle = selectedBundle === 'all' || booking.bundleId === selectedBundle;
      return matchesDate && matchesBundle;
    });

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0);
    const totalBookings = filteredBookings.length;
    const uniqueCustomers = new Set(filteredBookings.map(b => b.customerEmail)).size;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const statusMetrics = {
      pending: filteredBookings.filter(b => b.status === 'PENDING').length,
      confirmed: filteredBookings.filter(b => b.status === 'CONFIRMED').length,
      completed: filteredBookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: filteredBookings.filter(b => b.status === 'CANCELLED').length,
      noShow: filteredBookings.filter(b => b.status === 'NO_SHOW').length
    };

    const bundleStats = bundles.map(bundle => {
      const bundleBookings = filteredBookings.filter(b => b.bundleId === bundle.id);
      const revenue = bundleBookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0);
      return {
        id: bundle.id,
        name: bundle.name,
        bookings: bundleBookings.length,
        revenue,
        averageValue: bundleBookings.length > 0 ? revenue / bundleBookings.length : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const itemStats = new Map<string, { name: string; count: number; revenue: number }>();
    
    filteredBookings.forEach(booking => {
      booking.itemBookings.forEach(itemBooking => {
        const existing = itemStats.get(itemBooking.itemId) || { 
          name: itemBooking.itemName, 
          count: 0, 
          revenue: 0 
        };
        
        const bundle = bundles.find(b => b.id === booking.bundleId);
        const item = bundle?.items.find(i => i.id === itemBooking.itemId);
        const itemRevenue = (item?.price || 0) * itemBooking.numberOfPeople;
        
        itemStats.set(itemBooking.itemId, {
          ...existing,
          count: existing.count + 1,
          revenue: existing.revenue + itemRevenue
        });
      });
    });

    const topItems = Array.from(itemStats.values()).sort((a, b) => b.count - a.count).slice(0, 5);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(now, 6 - i), 'yyyy-MM-dd');
      const dayBookings = bookings.filter(b => b.date === date);
      const dayRevenue = dayBookings.reduce((sum, b) => sum + b.pricing.totalAmount, 0);
      
      return {
        date,
        bookings: dayBookings.length,
        revenue: dayRevenue,
        label: format(subDays(now, 6 - i), 'EEE dd', { locale: es })
      };
    });

    return {
      totalRevenue,
      totalBookings,
      uniqueCustomers,
      averageBookingValue,
      statusMetrics,
      bundleStats,
      topItems,
      last7Days,
      filteredBookings
    };
  }, [bookings, bundles, selectedDateRange, selectedBundle]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  }, []);

  const getStatusColor = useCallback((status: BookingStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-800',
      RESCHEDULED: 'bg-purple-100 text-purple-800',
      PARTIAL_REFUND: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' }
  ];

  const bundleOptions = [
    { value: 'all', label: 'Todos los bundles' },
    ...bundles.map(bundle => ({ value: bundle.id, label: bundle.name }))
  ];

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', format = 'number' }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color?: string;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        default:
          return value.toLocaleString();
      }
    };

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue()}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Avanzado</h1>
          <p className="text-gray-600">Analytics y métricas detalladas del negocio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value as DateRange)}
            options={dateRangeOptions}
          />
          
          <Select
            value={selectedBundle}
            onChange={(e) => setSelectedBundle(e.target.value)}
            options={bundleOptions}
          />
          
          {onExportData && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onExportData('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExportData('pdf')}>
                Export PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ingresos Totales" value={analytics.totalRevenue} icon={Euro} color="green" format="currency" />
        <MetricCard title="Total Reservas" value={analytics.totalBookings} icon={Calendar} color="blue" />
        <MetricCard title="Clientes Únicos" value={analytics.uniqueCustomers} icon={Users} color="purple" />
        <MetricCard title="Valor Promedio" value={analytics.averageBookingValue} icon={Target} color="orange" format="currency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estados de Reservas</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {Object.entries(analytics.statusMetrics).map(([status, count]) => {
              const percentage = analytics.totalBookings > 0 ? (count / analytics.totalBookings) * 100 : 0;
              const statusLabels = {
                pending: 'Pendientes',
                confirmed: 'Confirmadas', 
                completed: 'Completadas',
                cancelled: 'Canceladas',
                noShow: 'No se presentaron'
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.toUpperCase() as BookingStatus).split(' ')[0]}`} />
                    <span className="text-sm text-gray-600">
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tendencia (Últimos 7 días)</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            {analytics.last7Days.map((day) => {
              const maxValue = Math.max(...analytics.last7Days.map(d => 
                selectedMetric === 'revenue' ? d.revenue : d.bookings
              ));
              const value = selectedMetric === 'revenue' ? day.revenue : day.bookings;
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={day.date} className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 w-12">{day.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 w-16 text-right">
                    {selectedMetric === 'revenue' ? formatCurrency(value) : value}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant={selectedMetric === 'revenue' ? 'primary' : 'outline'}
              onClick={() => setSelectedMetric('revenue')}
            >
              Ingresos
            </Button>
            <Button
              size="sm"
              variant={selectedMetric === 'bookings' ? 'primary' : 'outline'}
              onClick={() => setSelectedMetric('bookings')}
            >
              Reservas
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Bundles</h3>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {analytics.bundleStats.slice(0, 5).map((bundle, index) => (
              <div key={bundle.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{bundle.name}</p>
                    <p className="text-sm text-gray-500">{bundle.bookings} reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(bundle.revenue)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(bundle.averageValue)} promedio</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Más Populares</h3>
          
          <div className="space-y-4">
            {analytics.topItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{item.name}</span>
                <span className="text-sm font-medium text-blue-600">{item.count} veces</span>
              </div>
            ))}
            
            {analytics.topItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reservas Recientes</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {analytics.filteredBookings
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onNavigateToBooking?.(booking.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.bundleName}</p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(booking.date), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(booking.pricing.totalAmount)}</p>
                    <p className="text-xs text-gray-500">{booking.itemBookings.length} actividades</p>
                  </div>
                </div>
              ))}
          </div>
          
          {analytics.filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay reservas en este período</p>
              {onCreateBooking && (
                <Button onClick={onCreateBooking} className="mt-3">
                  Crear primera reserva
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{shop.name}</p>
              <p className="text-sm text-gray-600">{shop.address}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Estado</p>
              <p className={`text-sm ${shop.shopStatus === 'ENABLED' ? 'text-green-600' : 'text-red-600'}`}>
                {shop.shopStatus === 'ENABLED' ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Bundles Activos</p>
              <p className="text-sm text-gray-600">{bundles.filter(b => b.isActive).length} de {bundles.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 