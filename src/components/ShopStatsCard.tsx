import React, { useMemo } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Euro } from 'lucide-react';
import { Card } from './ui/Card';
import { useShopState } from '../hooks/useShopState';


interface ShopStatsCardProps {
  className?: string;
  layout?: 'grid' | 'horizontal';
  showRevenue?: boolean;
}

export const ShopStatsCard: React.FC<ShopStatsCardProps> = ({
  className = '',
  layout = 'grid',
  showRevenue = true
}) => {
  const { 
    selectedShop, 
    shopReservations, 
    shopStats 
  } = useShopState();

  // Calcular ingresos dinámicamente
  const revenue = useMemo(() => {
    return shopReservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.totalPrice, 0);
  }, [shopReservations]);

  const stats = [
    {
      label: 'Total Reservas',
      value: shopStats.totalReservations,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Confirmadas',
      value: shopStats.confirmedReservations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Pendientes',
      value: shopStats.pendingReservations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Canceladas',
      value: shopStats.cancelledReservations,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  if (showRevenue) {
    stats.push({
      label: 'Ingresos',
      value: `€${revenue.toFixed(2)}`,
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    });
  }

  if (layout === 'horizontal') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedShop.name}
              </h3>
              <p className="text-sm text-gray-600">
                Estadísticas del negocio
              </p>
            </div>
          </div>
          <div className="flex space-x-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stat.bgColor} mb-1`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedShop.name}
            </h3>
            <p className="text-sm text-gray-600">
              Estadísticas del negocio
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}; 