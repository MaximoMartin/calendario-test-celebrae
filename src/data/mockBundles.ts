// Datos mock de bundles
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Bundle } from '../types';

// IDs de shops para referencia
const shopMaxi = "shop_maxi";
const shopCafe = "shop_cafe";

export const mockBundles: Bundle[] = [
  // --- La vuelta del Maxi ---
  {
    id: "bundle_paris",
    name: "Alquiler París",
    description: "Alquiler de autos premium para recorrer París a tu ritmo.",
    shortDescription: "Incluye seguro y asistencia.",
    shopId: shopMaxi,
    itemIds: ["item_vw_jetta", "item_bmw_x3"],
    extraIds: ["extra_gps", "extra_seguro", "extra_portaequipaje"],
    items: [],
    extras: [],
    basePrice: 120,
    maxCapacity: 5,
    duration: 1440,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 24h antes",
      refundPolicy: "Reembolso total hasta 24h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800"],
    tags: ["auto", "viaje", "premium"],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_escaperoom",
    name: "Escape Room Misión Egipcia",
    description: "Vive la experiencia de un escape room temático con enigmas y desafíos.",
    shortDescription: "Ideal para grupos y familias.",
    shopId: shopMaxi,
    itemIds: ["item_mision_egipcia"],
    extraIds: ["extra_certificado"],
    items: [],
    extras: [],
    basePrice: 80,
    maxCapacity: 8,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: false,
      requiresApproval: true,
      cancellationPolicy: "No reembolsable 12h antes",
      refundPolicy: "Reembolso parcial según política"
    },
    imageUrls: ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800"],
    tags: ["escape", "juego", "familia"],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_spa",
    name: "Spa Day con Aromaterapia",
    description: "Jornada de spa con masajes, sauna y aromaterapia.",
    shortDescription: "Relajación total para cuerpo y mente.",
    shopId: shopMaxi,
    itemIds: ["item_masaje", "item_sauna"],
    extraIds: ["extra_aromaterapia"],
    items: [],
    extras: [],
    basePrice: 150,
    maxCapacity: 4,
    duration: 180,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 48h antes",
      refundPolicy: "Reembolso total hasta 48h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"],
    tags: ["spa", "relax", "salud"],
    isActive: true,
    isFeatured: false,
    order: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Café Delicias ---
  {
    id: "bundle_brunch",
    name: "Brunch Especial",
    description: "Disfruta de un brunch gourmet con opciones continentales y americanas.",
    shortDescription: "Incluye bebida y postre.",
    shopId: shopCafe,
    itemIds: ["item_continental", "item_americano"],
    extraIds: ["extra_mimosa"],
    items: [],
    extras: [],
    basePrice: 35,
    maxCapacity: 20,
    duration: 120,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 2h antes",
      refundPolicy: "Reembolso total hasta 2h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
    tags: ["brunch", "café", "gourmet"],
    isActive: true,
    isFeatured: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "bundle_tarde_cafe",
    name: "Tarde de Café y Postres",
    description: "Merienda con selección de cafés y postres artesanales.",
    shortDescription: "Ideal para compartir.",
    shopId: shopCafe,
    itemIds: ["item_cafe_gourmet", "item_postres"],
    extraIds: ["extra_combo_postres"],
    items: [],
    extras: [],
    basePrice: 20,
    maxCapacity: 15,
    duration: 90,
    bookingSettings: {
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: "Cancelación gratuita hasta 1h antes",
      refundPolicy: "Reembolso total hasta 1h antes"
    },
    imageUrls: ["https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=800"],
    tags: ["café", "postre", "merienda"],
    isActive: true,
    isFeatured: false,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  }
]; 