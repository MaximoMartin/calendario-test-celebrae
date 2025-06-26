import type { AvailabilityRule } from '../types';

// 🎯 CHECKPOINT 5: MOCK DATA PARA REGLAS DE DISPONIBILIDAD
// Ejemplos específicos de bloqueos y aperturas por Shop, Bundle e Item

export const mockAvailabilityRules: AvailabilityRule[] = [
  // ==================== REGLAS A NIVEL SHOP ====================
  
  // Shop "La vuelta del Maxi" cierra los lunes
  {
    id: "rule_shop_maxi_closed_mondays",
    name: "Cerrado los Lunes",
    description: "El negocio está cerrado todos los lunes para descanso del personal",
    type: "CLOSED",
    level: "SHOP",
    targetId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f", // "La vuelta del Maxi"
    weekdays: [1], // Lunes
    priority: 100,
    reason: "Día de descanso del personal",
    isActive: true,
    recurring: {
      pattern: "WEEKLY",
      interval: 1 // cada semana
    },
    createdAt: "2025-01-15T09:00:00.000Z",
    updatedAt: "2025-01-15T09:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Shop "Café Delicias" cierra domingos por la noche
  {
    id: "rule_shop_cafe_sunday_evening",
    name: "Domingo Solo Hasta las 18:00",
    description: "Los domingos solo abrimos hasta las 18:00",
    type: "CLOSED",
    level: "SHOP",
    targetId: "cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf", // "Café Delicias"
    weekdays: [0], // Domingo
    startTime: "18:00",
    endTime: "23:59",
    priority: 80,
    reason: "Horario reducido dominical",
    isActive: true,
    recurring: {
      pattern: "WEEKLY",
      interval: 1
    },
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Vacaciones de invierno para "La vuelta del Maxi"
  {
    id: "rule_shop_maxi_winter_break",
    name: "Vacaciones de Invierno",
    description: "Cerrado por vacaciones de invierno",
    type: "CLOSED",
    level: "SHOP",
    targetId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    dateRange: {
      startDate: "2025-07-15",
      endDate: "2025-07-31"
    },
    priority: 200, // Alta prioridad
    reason: "Vacaciones de invierno",
    isActive: true,
    createdAt: "2025-01-15T11:00:00.000Z",
    updatedAt: "2025-01-15T11:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // ==================== REGLAS A NIVEL BUNDLE ====================

  // Bundle "Escape Room" no disponible en fechas navideñas
  {
    id: "rule_bundle_escape_christmas",
    name: "Cerrado en Navidad y Año Nuevo",
    description: "El Escape Room está cerrado en fechas navideñas",
    type: "CLOSED",
    level: "BUNDLE",
    targetId: "bundle_escape_aventura", // Bundle de Escape Room (lo crearemos)
    specificDates: ["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-01"],
    priority: 150,
    reason: "Fechas navideñas - Personal en descanso",
    isActive: true,
    createdAt: "2025-01-20T12:00:00.000Z",
    updatedAt: "2025-01-20T12:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Bundle "Spa Day" horario reducido los viernes
  {
    id: "rule_bundle_spa_friday_reduced",
    name: "Viernes Horario Reducido",
    description: "Los viernes el spa cierra más temprano",
    type: "CLOSED",
    level: "BUNDLE",
    targetId: "bundle_spa_day",
    weekdays: [5], // Viernes
    startTime: "17:00",
    endTime: "23:59",
    priority: 90,
    reason: "Limpieza profunda semanal",
    isActive: true,
    recurring: {
      pattern: "WEEKLY",
      interval: 1
    },
    createdAt: "2025-01-18T14:00:00.000Z",
    updatedAt: "2025-01-18T14:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Bundle "Alquiler París" no disponible en feriados
  {
    id: "rule_bundle_auto_holidays",
    name: "Cerrado en Feriados Nacionales",
    description: "El servicio de alquiler no está disponible en feriados",
    type: "CLOSED",
    level: "BUNDLE",
    targetId: "bundle_auto_paris",
    specificDates: [
      "2025-01-01", // Año Nuevo
      "2025-05-01", // Día del Trabajo
      "2025-07-14", // Día Nacional de Francia
      "2025-08-15", // Asunción
      "2025-12-25"  // Navidad
    ],
    priority: 120,
    reason: "Feriados nacionales - Sin personal",
    isActive: true,
    createdAt: "2025-01-16T08:30:00.000Z",
    updatedAt: "2025-01-16T08:30:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // ==================== REGLAS A NIVEL ITEM ====================

  // Item "BMW X3" solo disponible de 9:00 a 17:00
  {
    id: "rule_item_bmw_business_hours",
    name: "BMW X3 - Solo Horario Comercial",
    description: "El BMW X3 solo está disponible en horario comercial",
    type: "CLOSED",
    level: "ITEM",
    targetId: "item_auto_bmw_x3",
    startTime: "17:00",
    endTime: "08:59", // Desde las 17:00 hasta las 8:59 del día siguiente
    priority: 60,
    reason: "Vehículo premium - Solo horario comercial",
    isActive: true,
    createdAt: "2025-01-17T13:00:00.000Z",
    updatedAt: "2025-01-17T13:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Item "Masaje Completo" no disponible los miércoles
  {
    id: "rule_item_massage_wednesday",
    name: "Masaje - Miércoles Cerrado",
    description: "El servicio de masaje no está disponible los miércoles",
    type: "CLOSED",
    level: "ITEM",
    targetId: "item_spa_masaje_completo",
    weekdays: [3], // Miércoles
    priority: 70,
    reason: "Día de descanso del masajista",
    isActive: true,
    recurring: {
      pattern: "WEEKLY",
      interval: 1
    },
    createdAt: "2025-01-19T10:15:00.000Z",
    updatedAt: "2025-01-19T10:15:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Item "Escape Room" mantenimiento mensual
  {
    id: "rule_item_escape_maintenance",
    name: "Mantenimiento Mensual",
    description: "Mantenimiento técnico del Escape Room",
    type: "CLOSED",
    level: "ITEM",
    targetId: "item_escape_misterio_palacio",
    specificDates: [
      "2025-02-01", "2025-03-01", "2025-04-01", "2025-05-01",
      "2025-06-01", "2025-07-01", "2025-08-01", "2025-09-01",
      "2025-10-01", "2025-11-01", "2025-12-01"
    ],
    startTime: "08:00",
    endTime: "12:00",
    priority: 110,
    reason: "Mantenimiento técnico mensual",
    isActive: true,
    createdAt: "2025-01-20T16:00:00.000Z",
    updatedAt: "2025-01-20T16:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // ==================== REGLAS DE APERTURA (EXCEPCIONES) ====================

  // Excepción: Abrir el lunes 17 de febrero (día feriado)
  {
    id: "rule_exception_maxi_open_monday",
    name: "Excepción: Abierto Lunes 17 Feb",
    description: "Apertura especial por día feriado",
    type: "OPEN",
    level: "SHOP",
    targetId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    specificDates: ["2025-02-17"],
    priority: 300, // Muy alta prioridad para sobreescribir regla de cerrado
    reason: "Apertura especial por día feriado",
    isActive: true,
    createdAt: "2025-01-21T09:00:00.000Z",
    updatedAt: "2025-01-21T09:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // Excepción: Horario extendido en Navidad para Escape Room
  {
    id: "rule_exception_escape_christmas_extended",
    name: "Horario Extendido Pre-Navidad",
    description: "Horario extendido la semana antes de Navidad",
    type: "OPEN",
    level: "BUNDLE",
    targetId: "bundle_escape_aventura",
    dateRange: {
      startDate: "2025-12-18",
      endDate: "2025-12-23"
    },
    startTime: "20:00",
    endTime: "23:00",
    priority: 250,
    reason: "Horario extendido para temporada navideña",
    isActive: true,
    createdAt: "2025-01-22T11:30:00.000Z",
    updatedAt: "2025-01-22T11:30:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  },

  // ==================== REGLAS DE TEMPORADA ====================

  // Temporada alta verano - Horario extendido
  {
    id: "rule_season_summer_extended",
    name: "Temporada Alta Verano",
    description: "Horario extendido durante el verano",
    type: "OPEN",
    level: "SHOP",
    targetId: "ab55132c-dcc8-40d6-9ac4-5f573285f55f",
    dateRange: {
      startDate: "2025-06-21",
      endDate: "2025-09-21"
    },
    startTime: "20:00",
    endTime: "22:00",
    priority: 50,
    reason: "Temporada alta - Horario extendido",
    isActive: true,
    createdAt: "2025-01-23T14:00:00.000Z",
    updatedAt: "2025-01-23T14:00:00.000Z",
    createdBy: "87IZYWdezwJQsILiU57z"
  }
];

// 🔍 FUNCIONES AUXILIARES PARA CONSULTA DE REGLAS

/**
 * Obtiene todas las reglas que aplican a un target específico
 */
export const getRulesForTarget = (
  targetId: string,
  level: 'SHOP' | 'BUNDLE' | 'ITEM'
): AvailabilityRule[] => {
  return mockAvailabilityRules.filter(rule => 
    rule.targetId === targetId && 
    rule.level === level && 
    rule.isActive
  );
};

/**
 * Obtiene todas las reglas activas ordenadas por prioridad
 */
export const getAllActiveRules = (): AvailabilityRule[] => {
  return mockAvailabilityRules
    .filter(rule => rule.isActive)
    .sort((a, b) => b.priority - a.priority); // Mayor prioridad primero
};

/**
 * Obtiene reglas por tipo
 */
export const getRulesByType = (type: 'CLOSED' | 'OPEN'): AvailabilityRule[] => {
  return mockAvailabilityRules.filter(rule => rule.type === type && rule.isActive);
};

/**
 * Obtiene reglas que aplican a una fecha específica
 */
export const getRulesForDate = (date: string): AvailabilityRule[] => {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  
  return mockAvailabilityRules.filter(rule => {
    if (!rule.isActive) return false;
    
    // Verificar fechas específicas
    if (rule.specificDates?.includes(date)) return true;
    
    // Verificar rango de fechas
    if (rule.dateRange) {
      const startDate = new Date(rule.dateRange.startDate);
      const endDate = new Date(rule.dateRange.endDate);
      return targetDate >= startDate && targetDate <= endDate;
    }
    
    // Verificar días de la semana
    if (rule.weekdays?.includes(dayOfWeek)) return true;
    
    return false;
  });
};

/**
 * Obtiene reglas que aplican a un horario específico
 */
export const getRulesForTimeSlot = (
  date: string,
  timeSlot: { startTime: string; endTime: string }
): AvailabilityRule[] => {
  const dateRules = getRulesForDate(date);
  
  return dateRules.filter(rule => {
    // Si la regla no tiene horario específico, aplica a todo el día
    if (!rule.startTime || !rule.endTime) return true;
    
    // Verificar solapamiento de horarios
    return timeSlotOverlaps(
      { startTime: rule.startTime, endTime: rule.endTime },
      timeSlot
    );
  });
};

/**
 * Verifica si dos slots de tiempo se solapan
 */
const timeSlotOverlaps = (
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean => {
  // Casos especiales para horarios que cruzan medianoche
  if (slot1.startTime > slot1.endTime) {
    // slot1 cruza medianoche
    return slot2.startTime >= slot1.startTime || slot2.endTime <= slot1.endTime;
  }
  
  if (slot2.startTime > slot2.endTime) {
    // slot2 cruza medianoche
    return slot1.startTime >= slot2.startTime || slot1.endTime <= slot2.endTime;
  }
  
  // Caso normal: ningún horario cruza medianoche
  return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
}; 