import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReservaItem, ReservaBundle } from '../../types';

// --- RESERVAS MOCK ELIMINADAS ---

// Arrays vacíos
const allMockReservasItems: ReservaItem[] = [];
const allMockReservasBundle: ReservaBundle[] = [];

// --- CONTEXTO GLOBAL DE RESERVAS ---
interface ReservationsContextType {
  reservasItems: ReservaItem[];
  setReservasItems: React.Dispatch<React.SetStateAction<ReservaItem[]>>;
  reservasBundle: ReservaBundle[];
  setReservasBundle: React.Dispatch<React.SetStateAction<ReservaBundle[]>>;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [reservasItems, setReservasItems] = useState<ReservaItem[]>(allMockReservasItems);
  const [reservasBundle, setReservasBundle] = useState<ReservaBundle[]>(allMockReservasBundle);

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

// Time slots disponibles por item (usando el tipo correcto)
export const mockItemTimeSlots: Array<{
  id: string;
  itemId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookingsPerSlot: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}> = [];
 