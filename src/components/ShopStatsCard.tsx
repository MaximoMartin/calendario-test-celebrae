import React, { useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Euro } from 'lucide-react';
import { Card } from './ui/Card';
import { useShopState } from '../hooks/useShopState';

// 🎯 CHECKPOINT 9.6: COMPONENTE REUTILIZABLE PARA ESTADÍSTICAS DEL SHOP

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
  // 🎯 CHECKPOINT 9.8: ESTADÍSTICAS SINCRONIZADAS DINÁMICAMENTE
  const { 
    selectedShop, 
    selectedShopId, 
    shopReservations, 
    shopStats 
  } = useShopState();

  // 🎯 CHECKPOINT 9.8: REACTIVIDAD AL CAMBIO DE SHOP
  useEffect(() => {
    console.log('📊 Estadísticas actualizadas para shop:', selectedShop.name);
    console.log('📈 Nuevas métricas:', {
      total: shopStats.totalReservations,
      confirmadas: shopStats.confirmed,
      pendientes: shopStats.pending,
      canceladas: shopStats.cancelled,
      reservasData: shopReservations.length
    });
  }, [selectedShopId, selectedShop.name, shopStats, shopReservations.length]);

  // Calcular ingresos dinámicamente
  const revenue = useMemo(() => {
    return shopReservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.totalPrice, 0);
  }, [shopReservations]);

  // Estadísticas optimizadas con useMemo
  const statsData = useMemo(() => {
    const baseStats: Array<{
      key: string;
      label: string;
      value: string | number;
      icon: any;
      color: string;
      bgColor: string;
    }> = [
      {
        key: 'total',
        label: 'Total Reservas',
        value: shopStats.totalReservations,
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        key: 'confirmed',
        label: 'Confirmadas',
        value: shopStats.confirmed,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        key: 'pending',
        label: 'Pendientes',
        value: shopStats.pending,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        key: 'cancelled',
        label: 'Canceladas',
        value: shopStats.cancelled,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];

    if (showRevenue) {
      baseStats.push({
        key: 'revenue',
        label: 'Ingresos',
        value: `€${revenue}`,
        icon: Euro,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      });
    }

    return baseStats;
  }, [shopStats, revenue, showRevenue]);

  const containerClasses = layout === 'grid' 
    ? `grid gap-4 ${
        statsData.length === 5 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' 
          : 'grid-cols-2 md:grid-cols-4'
      }`
    : 'flex flex-wrap gap-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      {statsData.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={stat.key} className="p-4 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0 ml-3`}>
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}; 