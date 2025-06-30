// Índice de datos mock
// Centraliza todas las exportaciones de datos mock

import { mockShops } from './mockShops';
import { mockBundles } from './mockBundles';
import { mockItems } from './mockItems';
import { mockExtras } from './mockExtras';

export { mockShops } from './mockShops';
export { mockBundles } from './mockBundles';
export { mockItems } from './mockItems';
export { mockExtras } from './mockExtras';

// Función helper para migrar datos mock a la estructura esperada
export const migrateMockData = () => {
  // Esta función se puede usar para migrar datos mock a la estructura esperada
  // cuando sea necesario
  return {
    shops: mockShops,
    bundles: mockBundles,
    items: mockItems,
    extras: mockExtras
  };
}; 