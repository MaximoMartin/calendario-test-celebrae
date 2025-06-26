import type { 
  AvailabilityRule,
  AvailabilityRuleValidation,
  ExtendedItemAvailability,
  ItemAvailability
} from '../../types';
import { mockAvailabilityRules, getRulesForTimeSlot } from '../../mockData/availabilityRules';
import { items, bundles } from '../../mockData/entitiesData';

// 🎯 CHECKPOINT 5: LÓGICA DE VALIDACIÓN DE REGLAS DE DISPONIBILIDAD
// Integración completa con el sistema de validación existente

/**
 * Valida si una reserva está bloqueada por reglas de disponibilidad
 */
export const validateAvailabilityRules = (
  itemId: string,
  date: string,
  timeSlot: { startTime: string; endTime: string }
): {
  isBlocked: boolean;
  applicableRules: AvailabilityRuleValidation[];
  blockingRules: AvailabilityRuleValidation[];
} => {
  console.log(`🔒 Validando reglas de disponibilidad para item ${itemId} en ${date} ${timeSlot.startTime}-${timeSlot.endTime}`);
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    console.log(`❌ Item ${itemId} no encontrado`);
    return {
      isBlocked: false,
      applicableRules: [],
      blockingRules: []
    };
  }

  const bundle = bundles.find(b => b.id === item.bundleId);
  if (!bundle) {
    console.log(`❌ Bundle ${item.bundleId} no encontrado`);
    return {
      isBlocked: false,
      applicableRules: [],
      blockingRules: []
    };
  }

  // Obtener reglas que aplican a este horario
  const timeSlotRules = getRulesForTimeSlot(date, timeSlot);
  
  // Filtrar reglas relevantes para este item, bundle o shop
  const relevantRules = timeSlotRules.filter(rule => {
    switch (rule.level) {
      case 'ITEM':
        return rule.targetId === itemId;
      case 'BUNDLE':
        return rule.targetId === item.bundleId;
      case 'SHOP':
        return rule.targetId === bundle.shopId;
      default:
        return false;
    }
  });

  console.log(`📋 Reglas relevantes encontradas: ${relevantRules.length}`);

  // Crear validaciones para cada regla
  const applicableRules: AvailabilityRuleValidation[] = relevantRules.map(rule => ({
    ruleId: rule.id,
    ruleName: rule.name,
    ruleType: rule.type,
    level: rule.level,
    targetId: rule.targetId,
    reason: rule.reason,
    priority: rule.priority,
    blocksReservation: rule.type === 'CLOSED',
    appliesTo: {
      date,
      timeSlot: rule.startTime && rule.endTime ? 
        { startTime: rule.startTime, endTime: rule.endTime } : 
        undefined
    }
  }));

  // Aplicar lógica de prioridad para determinar bloqueo final
  const finalBlockingState = determineBlockingState(applicableRules);
  
  const blockingRules = applicableRules.filter(rule => 
    rule.blocksReservation && finalBlockingState.isBlocked
  );

  console.log(`✅ Validación de reglas completada. Bloqueado: ${finalBlockingState.isBlocked}, Reglas aplicables: ${applicableRules.length}`);

  return {
    isBlocked: finalBlockingState.isBlocked,
    applicableRules,
    blockingRules
  };
};

/**
 * Determina el estado final de bloqueo basado en prioridades
 */
const determineBlockingState = (
  rules: AvailabilityRuleValidation[]
): { isBlocked: boolean; reason?: string } => {
  if (rules.length === 0) {
    return { isBlocked: false };
  }

  // Ordenar por prioridad (mayor prioridad primero)
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
  
  // La regla de mayor prioridad determina el estado final
  const highestPriorityRule = sortedRules[0];
  
  // Si la regla de mayor prioridad es OPEN, no está bloqueado
  // Si es CLOSED, está bloqueado
  const isBlocked = highestPriorityRule.ruleType === 'CLOSED';
  
  return {
    isBlocked,
    reason: isBlocked ? highestPriorityRule.reason : undefined
  };
};

/**
 * Extiende ItemAvailability con información de reglas
 */
export const extendItemAvailabilityWithRules = (
  baseAvailability: ItemAvailability,
  itemId: string
): ExtendedItemAvailability => {
  console.log(`🔍 Extendiendo disponibilidad con reglas para item ${itemId}`);
  
  const rulesValidation = validateAvailabilityRules(
    itemId,
    baseAvailability.date,
    baseAvailability.timeSlot
  );

  // Si las reglas bloquean la reserva, actualizar la disponibilidad
  let finalAvailability = { ...baseAvailability };
  
  if (rulesValidation.isBlocked) {
    finalAvailability = {
      ...baseAvailability,
      isAvailable: false,
      availableSpots: 0,
      blockingReason: 'EXCEPTION' // Usamos EXCEPTION para reglas personalizadas
    };
  }

  return {
    ...finalAvailability,
    applicableRules: rulesValidation.applicableRules,
    isBlockedByRules: rulesValidation.isBlocked,
    blockingRules: rulesValidation.blockingRules
  };
};

/**
 * Obtiene todas las reglas activas para un target específico
 */
export const getActiveRulesForTarget = (
  targetId: string,
  level: 'SHOP' | 'BUNDLE' | 'ITEM'
): AvailabilityRule[] => {
  return mockAvailabilityRules.filter(rule => 
    rule.targetId === targetId && 
    rule.level === level && 
    rule.isActive
  ).sort((a, b) => b.priority - a.priority);
};

/**
 * Obtiene un resumen de reglas para mostrar en la UI
 */
export const getRulesSummaryForItem = (itemId: string): {
  shopRules: AvailabilityRule[];
  bundleRules: AvailabilityRule[];
  itemRules: AvailabilityRule[];
  totalActiveRules: number;
} => {
  const item = items.find(i => i.id === itemId);
  if (!item) {
    return { shopRules: [], bundleRules: [], itemRules: [], totalActiveRules: 0 };
  }

  const bundle = bundles.find(b => b.id === item.bundleId);
  if (!bundle) {
    return { shopRules: [], bundleRules: [], itemRules: [], totalActiveRules: 0 };
  }

  const shopRules = getActiveRulesForTarget(bundle.shopId, 'SHOP');
  const bundleRules = getActiveRulesForTarget(item.bundleId, 'BUNDLE');
  const itemRules = getActiveRulesForTarget(itemId, 'ITEM');

  return {
    shopRules,
    bundleRules,
    itemRules,
    totalActiveRules: shopRules.length + bundleRules.length + itemRules.length
  };
};

/**
 * Verifica si un día específico está bloqueado para un item
 */
export const isDayBlockedForItem = (
  itemId: string,
  date: string
): { isBlocked: boolean; reason?: string; rules: AvailabilityRule[] } => {
  const item = items.find(i => i.id === itemId);
  if (!item) {
    return { isBlocked: false, rules: [] };
  }

  const bundle = bundles.find(b => b.id === item.bundleId);
  if (!bundle) {
    return { isBlocked: false, rules: [] };
  }

  // Obtener reglas que aplican a esta fecha (sin horario específico)
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();
  
  const relevantRules = mockAvailabilityRules.filter(rule => {
    if (!rule.isActive) return false;
    
    // Verificar si la regla aplica a este target
    let appliesToTarget = false;
    switch (rule.level) {
      case 'ITEM':
        appliesToTarget = rule.targetId === itemId;
        break;
      case 'BUNDLE':
        appliesToTarget = rule.targetId === item.bundleId;
        break;
      case 'SHOP':
        appliesToTarget = rule.targetId === bundle.shopId;
        break;
    }
    
    if (!appliesToTarget) return false;
    
    // Verificar si la regla aplica a esta fecha
    if (rule.specificDates?.includes(date)) return true;
    
    if (rule.dateRange) {
      const startDate = new Date(rule.dateRange.startDate);
      const endDate = new Date(rule.dateRange.endDate);
      return targetDate >= startDate && targetDate <= endDate;
    }
    
    if (rule.weekdays?.includes(dayOfWeek)) return true;
    
    return false;
  });

  // Determinar si el día está bloqueado basado en prioridades
  if (relevantRules.length === 0) {
    return { isBlocked: false, rules: [] };
  }

  const sortedRules = relevantRules.sort((a, b) => b.priority - a.priority);
  const highestPriorityRule = sortedRules[0];
  
  const isBlocked = highestPriorityRule.type === 'CLOSED';
  
  return {
    isBlocked,
    reason: isBlocked ? highestPriorityRule.reason : undefined,
    rules: relevantRules
  };
};

/**
 * Genera mensajes informativos sobre las reglas aplicables
 */
export const generateRulesInfoMessages = (
  applicableRules: AvailabilityRuleValidation[]
): string[] => {
  const messages: string[] = [];
  
  const groupedByType = applicableRules.reduce((acc, rule) => {
    const key = rule.ruleType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rule);
    return acc;
  }, {} as Record<string, AvailabilityRuleValidation[]>);

  // Mensajes para reglas de cierre
  if (groupedByType.CLOSED?.length > 0) {
    const closedRules = groupedByType.CLOSED.sort((a, b) => b.priority - a.priority);
    closedRules.forEach(rule => {
      messages.push(`🔒 ${rule.ruleName}: ${rule.reason}`);
    });
  }

  // Mensajes para reglas de apertura
  if (groupedByType.OPEN?.length > 0) {
    const openRules = groupedByType.OPEN.sort((a, b) => b.priority - a.priority);
    openRules.forEach(rule => {
      messages.push(`✅ ${rule.ruleName}: ${rule.reason}`);
    });
  }

  return messages;
}; 