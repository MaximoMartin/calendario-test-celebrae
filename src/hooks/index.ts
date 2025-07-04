// Índice de hooks
// Centraliza todas las exportaciones de hooks

// Hook principal de entidades
export { useEntitiesState, EntitiesStateProvider } from './useEntitiesState';

// Hook específico de gestión de shops
export { useShopManagement } from './useShopManagement';

// Hook de estado de shops para calendario
export { useShopState, ShopStateProvider } from './useShopState';

// Hooks específicos de shop (nuevos)
export { useShopSelection } from './useShopSelection';
export { useCalendarManagement } from './useCalendarManagement';
export { useShopStats } from './useShopStats';
export type { ShopStats } from './useShopStats';

// Tipos para creación de entidades
export type { 
  CreateShopData, 
  CreateBundleData, 
  CreateItemData, 
  CreateExtraData 
} from './types'; 