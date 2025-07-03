// Índice de hooks
// Centraliza todas las exportaciones de hooks

// Hook principal de entidades
export { useEntitiesState, EntitiesStateProvider } from './useEntitiesState';

// Hooks específicos de gestión
export { useShopManagement } from './useShopManagement';
export { useBundleManagement } from './useBundleManagement';

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

// Importar explícitamente los hooks usados en useAllManagementHooks
import { useShopManagement } from './useShopManagement';
import { useBundleManagement } from './useBundleManagement';

// Función helper para obtener todos los hooks de gestión
export const useAllManagementHooks = () => {
  return {
    shop: useShopManagement(),
    bundle: useBundleManagement(),
  };
}; 