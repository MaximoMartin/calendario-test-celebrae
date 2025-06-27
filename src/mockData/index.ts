import type { User, Shop } from '../types';

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "BUYER", "ADMIN", "ESSENTIAL"],
  phoneNumber: "3515050672"
};

// Shops simplificados sin configuraciones complejas
export const mockShops: Shop[] = [
  {
    id: "shop_maxi",
    name: "La vuelta del Maxi",
    address: "Av. Fuerza Aérea 2350, Córdoba",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z"
  },
  {
    id: "shop_cafe", 
    name: "Café Delicias",
    address: "Belgrano 456, Córdoba",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z"
  }
];



