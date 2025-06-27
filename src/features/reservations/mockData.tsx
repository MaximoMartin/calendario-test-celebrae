import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReservaItem, ItemTimeSlot, ReservaBundle } from '../../types';

// Datos de prueba para simular reservas existentes y conflictos

// --- CONTEXTO GLOBAL DE RESERVAS ---
interface ReservationsContextType {
  reservasItems: ReservaItem[];
  setReservasItems: React.Dispatch<React.SetStateAction<ReservaItem[]>>;
  reservasBundle: ReservaBundle[];
  setReservasBundle: React.Dispatch<React.SetStateAction<ReservaBundle[]>>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [reservasItems, setReservasItems] = useState<ReservaItem[]>([]);
  const [reservasBundle, setReservasBundle] = useState<ReservaBundle[]>([]);

  const value = useMemo(() => ({
    reservasItems,
    setReservasItems,
    reservasBundle,
    setReservasBundle
  }), [reservasItems, reservasBundle]);

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) throw new Error('useReservations debe usarse dentro de ReservationsProvider');
  return context;
};

// Time slots disponibles por item
export const mockItemTimeSlots: ItemTimeSlot[] = [
  // --- La vuelta del Maxi ---
  // Alquiler París
  {
    id: 'slot_vw_jetta_1',
    itemId: 'item_vw_jetta',
    dayOfWeek: 1, // Lunes
    startTime: '09:00',
    endTime: '12:00',
    maxBookingsPerSlot: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_bmw_x3_1',
    itemId: 'item_bmw_x3',
    dayOfWeek: 3, // Miércoles
    startTime: '14:00',
    endTime: '17:00',
    maxBookingsPerSlot: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Escape Room
  {
    id: 'slot_mision_egipcia_1',
    itemId: 'item_mision_egipcia',
    dayOfWeek: 5, // Viernes
    startTime: '18:00',
    endTime: '19:30',
    maxBookingsPerSlot: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Spa Day
  {
    id: 'slot_masaje_1',
    itemId: 'item_masaje',
    dayOfWeek: 2, // Martes
    startTime: '10:00',
    endTime: '11:00',
    maxBookingsPerSlot: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_sauna_1',
    itemId: 'item_sauna',
    dayOfWeek: 2, // Martes
    startTime: '11:30',
    endTime: '12:00',
    maxBookingsPerSlot: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // --- Café Delicias ---
  // Brunch Especial
  {
    id: 'slot_continental_1',
    itemId: 'item_continental',
    dayOfWeek: 0, // Domingo
    startTime: '10:00',
    endTime: '11:00',
    maxBookingsPerSlot: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_americano_1',
    itemId: 'item_americano',
    dayOfWeek: 0, // Domingo
    startTime: '11:00',
    endTime: '12:00',
    maxBookingsPerSlot: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Tarde de Café
  {
    id: 'slot_cafe_gourmet_1',
    itemId: 'item_cafe_gourmet',
    dayOfWeek: 6, // Sábado
    startTime: '16:00',
    endTime: '16:30',
    maxBookingsPerSlot: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'slot_postres_1',
    itemId: 'item_postres',
    dayOfWeek: 6, // Sábado
    startTime: '16:30',
    endTime: '17:00',
    maxBookingsPerSlot: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 🎯 CHECKPOINT 3: FUNCIONES HELPER PARA CONSULTAS
// (Eliminados helpers vacíos para limpieza máxima) 
 