import type { ReservaItem, ItemTimeSlot, ReservaBundle } from '../../types';

// 🎯 CHECKPOINT 2: MOCK DATA PARA SISTEMA DE RESERVAS
// Datos de prueba para simular reservas existentes y conflictos

// Reservas existentes para simular conflictos
export const mockReservasItems: ReservaItem[] = [];

// Time slots disponibles por item
export const mockItemTimeSlots: ItemTimeSlot[] = [];

// Reservas de bundles completos
export const mockReservasBundle: ReservaBundle[] = [];

// 🎯 CHECKPOINT 3: FUNCIONES HELPER PARA CONSULTAS
export const getReservasByItemId = (itemId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => reserva.itemId === itemId);
};

export const getSlotsByItemId = (itemId: string): ItemTimeSlot[] => {
  return mockItemTimeSlots.filter(slot => slot.itemId === itemId);
};

export const getReservasByDateAndItem = (date: string, itemId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => 
    reserva.date === date && reserva.itemId === itemId
  );
};

export const getReservasBundleByBundleId = (bundleId: string): ReservaBundle[] => {
  return mockReservasBundle.filter(reserva => reserva.bundleId === bundleId);
};

export const getReservasBundleByShopId = (shopId: string): ReservaBundle[] => {
  return mockReservasBundle.filter(reserva => reserva.shopId === shopId);
};

export const getReservasBySellerUserId = (sellerUserId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => reserva.userId === sellerUserId);
};

export const getReservasByShopAndSeller = (shopId: string, sellerUserId: string): ReservaItem[] => {
  return mockReservasItems.filter(reserva => 
    reserva.shopId === shopId && reserva.userId === sellerUserId
  );
};

export const getSellerStats = (sellerUserId: string) => {
  const sellerReservations = getReservasBySellerUserId(sellerUserId);
  
  const stats = {
    totalReservations: sellerReservations.length,
    confirmedReservations: sellerReservations.filter(r => r.status === 'CONFIRMED').length,
    pendingReservations: sellerReservations.filter(r => r.status === 'PENDING').length,
    cancelledReservations: sellerReservations.filter(r => r.status === 'CANCELLED').length,
    totalRevenue: sellerReservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.totalPrice, 0)
  };
  
  return stats;
};

export const getSellerReservationsByDateRange = (
  sellerUserId: string,
  fromDate: string,
  toDate: string
): ReservaItem[] => {
  return mockReservasItems.filter(reserva => {
    const reservaDate = new Date(reserva.date);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    return reserva.userId === sellerUserId && 
           reservaDate >= from && 
           reservaDate <= to;
  });
}; 
 