import type { User, Shop } from '../types';

export const mockUser: User = {
  id: "87IZYWdezwJQsILiU57z",
  name: "Maxi Martin Lanfranchi",
  email: "maximo.martinl@hotmail.com",
  roles: ["SELLER", "BUYER", "ADMIN", "ESSENTIAL"],
  phoneNumber: "3515050672"
};

export const mockShops: Shop[] = [
  {
    id: "shop_maxi",
    name: "La vuelta del Maxi",
    address: "Av. Fuerza Aérea 2350, Córdoba",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: {
      monday: {
        openRanges: [
          { from: "09:00", to: "13:00" },
          { from: "16:00", to: "20:00" }
        ]
      },
      tuesday: {
        openRanges: [
          { from: "09:00", to: "13:00" },
          { from: "16:00", to: "20:00" }
        ]
      },
      wednesday: {
        openRanges: [
          { from: "09:00", to: "13:00" },
          { from: "16:00", to: "20:00" }
        ]
      },
      thursday: {
        openRanges: [
          { from: "09:00", to: "13:00" },
          { from: "16:00", to: "20:00" }
        ]
      },
      friday: {
        openRanges: [
          { from: "09:00", to: "13:00" },
          { from: "16:00", to: "22:00" }
        ]
      },
      saturday: {
        openRanges: [
          { from: "10:00", to: "22:00" }
        ]
      },
      sunday: { 
        openRanges: [] // Cerrado los domingos
      }
    },
    status: 'active',
    deletedAt: null
  },
  {
    id: "shop_cafe", 
    name: "Café Delicias",
    address: "Belgrano 456, Córdoba",
    shopStatus: "ENABLED",
    userId: "87IZYWdezwJQsILiU57z",
    businessHours: {
      monday: {
        openRanges: [
          { from: "07:00", to: "11:30" },
          { from: "15:00", to: "19:30" }
        ]
      },
      tuesday: {
        openRanges: [
          { from: "07:00", to: "11:30" },
          { from: "15:00", to: "19:30" }
        ]
      },
      wednesday: {
        openRanges: [
          { from: "07:00", to: "11:30" },
          { from: "15:00", to: "19:30" }
        ]
      },
      thursday: {
        openRanges: [
          { from: "07:00", to: "11:30" },
          { from: "15:00", to: "19:30" }
        ]
      },
      friday: {
        openRanges: [
          { from: "07:00", to: "11:30" },
          { from: "15:00", to: "21:00" }
        ]
      },
      saturday: {
        openRanges: [
          { from: "08:00", to: "12:00" },
          { from: "17:00", to: "21:00" }
        ]
      },
      sunday: {
        openRanges: [
          { from: "09:00", to: "13:00" }
        ]
      }
    },
    status: 'active',
    deletedAt: null
  }
];



