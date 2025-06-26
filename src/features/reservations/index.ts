// 🎯 CHECKPOINT 2: SISTEMA DE RESERVAS PARA ITEMS INDIVIDUALES
// 🎯 CHECKPOINT 3: SISTEMA DE RESERVAS DE BUNDLE COMPLETO
// Exportaciones principales del sistema de reservas

// Tipos y constantes
export * from './types';

// Mock data
export * from './mockData';

// Lógica de validación y disponibilidad
export * from './availabilityValidation';
export * from './bundleValidation';
// 🎯 CHECKPOINT 5: SISTEMA DE REGLAS DE DISPONIBILIDAD
export * from './availabilityRulesValidation';

// Componentes
export { ItemReservationManager } from './components/ItemReservationManager';
export { ItemSelector } from './components/ItemSelector';
export { BundleReservationManager } from './components/BundleReservationManager';
export { BundleSelector } from './components/BundleSelector';

// Re-exportar tipos importantes del sistema principal
export type {
  ReservaItem,
  ItemAvailability,
  ItemAvailabilityValidation,
  CreateReservaItemRequest,
  ItemTimeSlot,
  ReservaBundle,
  ExtraSelected,
  CreateReservaBundleRequest,
  BundleAvailabilityValidation,
  ExtraValidation
} from '../../types'; 