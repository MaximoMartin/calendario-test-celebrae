// Datos mock de extras
// Extraídos de useEntitiesState.tsx para mejor organización

import type { Extra } from '../types';

// IDs de bundles para referencia
const bundleParis = "bundle_paris";
const bundleEscapeRoom = "bundle_escaperoom";
const bundleSpa = "bundle_spa";
const bundleBrunch = "bundle_brunch";
const bundleTardeCafe = "bundle_tarde_cafe";

// IDs de shops para referencia
const shopMaxi = "shop_maxi";
const shopCafe = "shop_cafe";

export const mockExtras: Extra[] = [
  // --- Alquiler París ---
  {
    id: "extra_gps",
    title: "GPS",
    description: "Navegador GPS con mapas de Europa actualizados.",
    price: 10,
    isForAdult: true,
    bundleId: bundleParis,
    shopId: shopMaxi,
    isPerGroup: true,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "extra_seguro",
    title: "Seguro Completo",
    description: "Cobertura total ante accidentes y robos.",
    price: 25,
    isForAdult: true,
    bundleId: bundleParis,
    shopId: shopMaxi,
    isPerGroup: true,
    maxQuantity: 1,
    isRequired: true,
    isActive: true,
    order: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  {
    id: "extra_portaequipaje",
    title: "Porta equipaje",
    description: "Baúl adicional para equipaje voluminoso.",
    price: 15,
    isForAdult: true,
    bundleId: bundleParis,
    shopId: shopMaxi,
    isPerGroup: false,
    maxQuantity: 2,
    isRequired: false,
    isActive: true,
    order: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Escape Room ---
  {
    id: "extra_certificado",
    title: "Certificado de Escape",
    description: "Diploma para los que logran escapar.",
    price: 5,
    isForAdult: true,
    bundleId: bundleEscapeRoom,
    shopId: shopMaxi,
    isPerGroup: true,
    maxQuantity: 1,
    isRequired: false,
    requiredItemId: "item_mision_egipcia",
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Spa Day ---
  {
    id: "extra_aromaterapia",
    title: "Aromaterapia Premium",
    description: "Aceites esenciales de alta gama para tu sesión.",
    price: 20,
    isForAdult: true,
    bundleId: bundleSpa,
    shopId: shopMaxi,
    isPerGroup: false,
    maxQuantity: 2,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Brunch Especial ---
  {
    id: "extra_mimosa",
    title: "Mimosa",
    description: "Copa de mimosa (jugo de naranja y espumante).",
    price: 6,
    isForAdult: true,
    bundleId: bundleBrunch,
    shopId: shopCafe,
    isPerGroup: false,
    maxQuantity: 2,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  },
  // --- Tarde de Café ---
  {
    id: "extra_combo_postres",
    title: "Combo de Postres",
    description: "Incluye 3 postres a elección.",
    price: 15,
    isForAdult: true,
    bundleId: bundleTardeCafe,
    shopId: shopCafe,
    isPerGroup: false,
    maxQuantity: 1,
    isRequired: false,
    isActive: true,
    order: 1,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    status: 'active',
    deletedAt: null
  }
]; 