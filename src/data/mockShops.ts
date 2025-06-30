// Datos mock de shops
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Shop } from '../types';

export const mockShops: Shop[] = [
  {
    id: "shop_maxi",
    name: "La vuelta del Maxi",
    address: "Calle Mayor 123, Madrid",
    description: "Alquiler de autos premium y experiencias únicas",
    phone: "+34 600 123 456",
    email: "info@lavueltadelmaxi.com",
    category: "Transporte",
    subCategory: "Alquiler de autos",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: {
      monday: { openRanges: [{ from: '09:00', to: '13:00' }, { from: '16:00', to: '20:00' }] },
      tuesday: { openRanges: [{ from: '09:00', to: '13:00' }, { from: '16:00', to: '20:00' }] },
      wednesday: { openRanges: [{ from: '09:00', to: '13:00' }, { from: '16:00', to: '20:00' }] },
      thursday: { openRanges: [{ from: '09:00', to: '13:00' }, { from: '16:00', to: '20:00' }] },
      friday: { openRanges: [{ from: '09:00', to: '13:00' }, { from: '16:00', to: '22:00' }] },
      saturday: { openRanges: [{ from: '10:00', to: '22:00' }] },
      sunday: { openRanges: [] }
    },
    maxCapacity: 50,
    advanceBookingDays: 30,
    cancellationPolicy: "Cancelación gratuita hasta 24h antes",
    refundPolicy: "Reembolso total hasta 24h antes",
    allowInstantBooking: true,
    requiresApproval: false,
    status: 'active',
    deletedAt: null
  },
  {
    id: "shop_cafe",
    name: "Café Delicias",
    address: "Plaza Central 45, Barcelona",
    description: "Café gourmet con ambiente acogedor y menú variado",
    phone: "+34 600 789 012",
    email: "hola@cafedelicias.com",
    category: "Gastronomía",
    subCategory: "Café y Restaurante",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: {
      monday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      tuesday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      wednesday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      thursday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      friday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      saturday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] },
      sunday: { openRanges: [{ from: '07:00', to: '11:30' }, { from: '15:00', to: '19:30' }] }
    },
    maxCapacity: 30,
    advanceBookingDays: 7,
    cancellationPolicy: "Cancelación gratuita hasta 2h antes",
    refundPolicy: "Reembolso total hasta 2h antes",
    allowInstantBooking: true,
    requiresApproval: false,
    status: 'active',
    deletedAt: null
  },
  {
    id: "shop_spa",
    name: "M,i cafe",
    address: "Avenida Relax 78, Valencia",
    description: "Spa y centro de bienestar con tratamientos personalizados",
    phone: "+34 600 345 678",
    email: "info@micafe.com",
    category: "Bienestar",
    subCategory: "Spa y Masajes",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: {
      monday: { openRanges: [] },
      tuesday: { openRanges: [] },
      wednesday: { openRanges: [] },
      thursday: { openRanges: [] },
      friday: { openRanges: [] },
      saturday: { openRanges: [{ from: '10:00', to: '20:00' }] },
      sunday: { openRanges: [{ from: '10:00', to: '18:00' }] }
    },
    maxCapacity: 20,
    advanceBookingDays: 14,
    cancellationPolicy: "Cancelación gratuita hasta 48h antes",
    refundPolicy: "Reembolso total hasta 48h antes",
    allowInstantBooking: true,
    requiresApproval: false,
    status: 'active',
    deletedAt: null
  }
]; 