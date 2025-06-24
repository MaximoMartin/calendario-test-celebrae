import React from 'react';
import { TrendingUp, Calendar, Users, Clock } from 'lucide-react';
import { Card } from './ui/Card';

interface BookingStatsProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  className?: string;
}

export const BookingStats: React.FC<BookingStatsProps> = ({
  stats,
  className,
}) => {
  const statCards = [
    {
      title: 'Total de Reservas',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Confirmadas',
      value: stats.confirmed,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completadas',
      value: stats.completed,
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  const getPercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const percentage = getPercentage(stat.value);
        
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stats.total > 0 && (
                    <p className="ml-2 text-sm text-gray-500">({percentage}%)</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}; 