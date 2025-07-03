// Datos mock de shops
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Shop } from '../types';

export const shopMaxi = "shop_maxi";
export const shopCafe = "shop_cafe";

export const mockShops: Shop[] = [
  {
    id: shopMaxi,
    name: "La vuelta del Maxi",
    address: "Av. Siempre Viva 123, Córdoba",
    description: "Alquiler de autos, escape room y spa en un solo lugar.",
    phone: "+54 351 123-4567",
    email: "contacto@maxi.com",
    category: "Servicios",
    subCategory: "Experiencias",
    shopStatus: "ENABLED",
    userId: "user_maxi",
    businessHours: {
      monday: { openRanges: [{ from: "09:00", to: "17:00" }] },
      tuesday: { openRanges: [{ from: "09:00", to: "17:00" }] },
      wednesday: { openRanges: [{ from: "09:00", to: "17:00" }] },
      thursday: { openRanges: [{ from: "09:00", to: "17:00" }] },
      friday: { openRanges: [{ from: "09:00", to: "17:00" }] },
      saturday: { openRanges: [{ from: "10:00", to: "14:00" }] },
      sunday: { openRanges: [] }
    },
    maxCapacity: 20,
    advanceBookingDays: 30,
    cancellationPolicy: "Cancelación gratuita hasta 24 horas antes",
    refundPolicy: "Reembolso total hasta 24 horas antes",
    allowInstantBooking: true,
    requiresApproval: false,
    status: "active",
    deletedAt: null
  },
  {
    id: shopCafe,
    name: "Café Delicias",
    address: "Calle Sabores 456, Córdoba",
    description: "Café gourmet, brunch y meriendas artesanales.",
    phone: "+54 351 987-6543",
    email: "hola@cafedelicias.com",
    category: "Gastronomía",
    subCategory: "Café y Brunch",
    shopStatus: "ENABLED",
    userId: "user_cafe",
    businessHours: {
      monday: { openRanges: [{ from: "08:00", to: "18:00" }] },
      tuesday: { openRanges: [{ from: "08:00", to: "18:00" }] },
      wednesday: { openRanges: [{ from: "08:00", to: "18:00" }] },
      thursday: { openRanges: [{ from: "08:00", to: "18:00" }] },
      friday: { openRanges: [{ from: "08:00", to: "18:00" }] },
      saturday: { openRanges: [{ from: "09:00", to: "14:00" }] },
      sunday: { openRanges: [{ from: "09:00", to: "14:00" }] }
    },
    maxCapacity: 30,
    advanceBookingDays: 14,
    cancellationPolicy: "Cancelación gratuita hasta 2 horas antes",
    refundPolicy: "Reembolso total hasta 2 horas antes",
    allowInstantBooking: true,
    requiresApproval: false,
    status: "active",
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