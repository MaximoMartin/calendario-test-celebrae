// Hook específico para estadísticas del shop
// Extraído de useShopState.tsx para mejor organización

import { useMemo } from 'react';
import type { ReservaItem } from '../types';

export interface ShopStats {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalRevenue: number;
  averageReservationValue: number;
  revenueByStatus: {
    confirmed: number;
    completed: number;
    pending: number;
  };
  occupancyRate: number; // Porcentaje de reservas confirmadas vs total
  completionRate: number; // Porcentaje de reservas completadas vs confirmadas
}

export const useShopStats = (reservations: ReservaItem[]): ShopStats => {
  const stats = useMemo(() => {
    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED').length;
    const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
    const cancelledReservations = reservations.filter(r => r.status === 'CANCELLED').length;
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED').length;
    
    // Calcular ingresos
    const confirmedRevenue = reservations
      .filter(r => r.status === 'CONFIRMED')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const completedRevenue = reservations
      .filter(r => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const pendingRevenue = reservations
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    
    const totalRevenue = confirmedRevenue + completedRevenue;
    const averageReservationValue = totalReservations > 0 
      ? reservations.reduce((sum, r) => sum + r.totalPrice, 0) / totalReservations 
      : 0;
    
    // Calcular tasas
    const occupancyRate = totalReservations > 0 
      ? (confirmedReservations / totalReservations) * 100 
      : 0;
    
    const completionRate = confirmedReservations > 0 
      ? (completedReservations / confirmedReservations) * 100 
      : 0;
    
    return {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations,
      completedReservations,
      totalRevenue,
      averageReservationValue,
      revenueByStatus: {
        confirmed: confirmedRevenue,
        completed: completedRevenue,
        pending: pendingRevenue
      },
      occupancyRate,
      completionRate
    };
  }, [reservations]);

  return stats;
}; 