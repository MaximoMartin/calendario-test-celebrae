// ========================================
// DEMO DEL MOTOR DE DISPONIBILIDAD
// ========================================

import { AvailabilityEngine } from '../utils/availabilityEngine';
import { useAvailability } from '../hooks/useAvailability';
import { validateBookingForm, formDataToAvailabilityRequest } from '../utils/bookingValidations';
import {
  mockShop, mockBundle, mockBookings
} from '../mockData/newModel';
import type {
  AvailabilityRequest, BookingFormData
} from '../types/newModel';

// ========================================
// EJEMPLO 1: VERIFICACIÓN BÁSICA DE DISPONIBILIDAD
// ========================================

/**
 * Ejemplo de verificación de disponibilidad para el "Día de Campo"
 */
export const exampleBasicAvailability = async () => {
  console.log('🔍 === EJEMPLO 1: VERIFICACIÓN BÁSICA ===');
  
  const engine = new AvailabilityEngine(mockShop, [mockBundle], mockBookings);
  
  // Solicitud para familia de 4 personas
  const request: AvailabilityRequest = {
    bundleId: 'bundle_dia_campo',
    date: '2024-02-20',
    itemSelections: [
      {
        itemId: 'item_breakfast',
        timeSlotId: 'slot_breakfast_1', // 08:00-09:00
        numberOfPeople: 4
      },
      {
        itemId: 'item_horseride',
        timeSlotId: 'slot_horseride_1', // 10:30-12:00
        numberOfPeople: 4
      },
      {
        itemId: 'item_bbq',
        timeSlotId: 'slot_bbq_1', // 13:00-14:30
        numberOfPeople: 4
      }
    ],
    extraSelections: [
      {
        extraId: 'extra_wine',
        quantity: 1
      },
      {
        extraId: 'extra_transport',
        quantity: 4
      }
    ]
  };
  
  const result = await engine.checkAvailability(request);
  
  console.log('📋 Resultado:', {
    disponible: result.isAvailable,
    precio: result.pricing.totalPrice,
    conflictos: result.conflicts.length,
    alternativas: result.suggestedAlternatives?.length || 0
  });
  
  if (result.conflicts.length > 0) {
    console.log('⚠️  Conflictos encontrados:');
    result.conflicts.forEach(conflict => {
      console.log(`  - ${conflict.type}: ${conflict.message}`);
    });
  }
  
  console.log('💰 Desglose de precios:');
  result.pricing.breakdown.forEach(item => {
    console.log(`  - ${item.name}: $${item.unitPrice} x ${item.quantity} = $${item.totalPrice}`);
  });
  
  return result;
};

// ========================================
// EJEMPLO 2: DETECCIÓN DE CONFLICTOS DE RECURSOS
// ========================================

/**
 * Ejemplo de conflicto: Chef María no puede estar en dos lugares a la vez
 */
export const exampleResourceConflict = async () => {
  console.log('\n🚨 === EJEMPLO 2: CONFLICTOS DE RECURSOS ===');
  
  const engine = new AvailabilityEngine(mockShop, [mockBundle], mockBookings);
  
  // Intentar reservar dos actividades que requieren a Chef María al mismo tiempo
  const conflictRequest: AvailabilityRequest = {
    bundleId: 'bundle_dia_campo',
    date: '2024-02-21',
    itemSelections: [
      {
        itemId: 'item_breakfast',
        timeSlotId: 'slot_breakfast_1', // 08:00-09:00 (Chef: 07:30-09:00)
        numberOfPeople: 2
      },
      {
        itemId: 'item_bbq',
        timeSlotId: 'slot_bbq_1', // 13:00-14:30 (Chef: 12:00-15:00)
        numberOfPeople: 2
      }
    ],
    extraSelections: []
  };
  
  const result = await engine.checkAvailability(conflictRequest);
  
  console.log('📋 Resultado:', {
    disponible: result.isAvailable,
    conflictos: result.conflicts.length
  });
  
  // Mostrar conflictos específicos de recursos
  const resourceConflicts = result.conflicts.filter(c => c.type === 'RESOURCE_CONFLICT');
  console.log('⚠️  Conflictos de recursos:');
  resourceConflicts.forEach(conflict => {
    console.log(`  - ${conflict.message}`);
    console.log(`    Items afectados: ${conflict.affectedItems.join(', ')}`);
    console.log(`    Recursos: ${conflict.affectedResources?.join(', ')}`);
  });
  
  return result;
};

// ========================================
// EJEMPLO 3: USO DEL HOOK DE REACT
// ========================================

/**
 * Ejemplo de cómo usar el hook en un componente React
 */
export const exampleReactHookUsage = () => {
  console.log('\n⚛️  === EJEMPLO 3: HOOK DE REACT ===');
  
  // Simulación de uso en componente React
  const availabilityData = {
    shop: mockShop,
    bundles: [mockBundle],
    bookings: mockBookings
  };
  
  // En un componente real sería:
  // const availability = useAvailability(availabilityData);
  
  console.log('✅ Hook configurado correctamente');
  console.log('📊 Funciones disponibles:');
  console.log('  - checkAvailability()');
  console.log('  - getAvailableSlots()');
  console.log('  - checkResourceAvailability()');
  console.log('  - getOccupancyStats()');
  console.log('  - canQuickBook()');
  
  return availabilityData;
};

// ========================================
// EJEMPLO 4: VALIDACIÓN DE FORMULARIO
// ========================================

/**
 * Ejemplo de validación de formulario antes de verificar disponibilidad
 */
export const exampleFormValidation = () => {
  console.log('\n📝 === EJEMPLO 4: VALIDACIÓN DE FORMULARIO ===');
  
  // Formulario con datos incorretos
  const invalidFormData: BookingFormData = {
    bundleId: 'bundle_dia_campo',
    customerName: '', // Error: vacío
    customerEmail: 'email-invalido', // Error: formato
    customerPhone: '', // Error: vacío
    date: '2024-01-01', // Error: fecha pasada
    itemSelections: [], // Error: ningún item seleccionado
    extraSelections: []
  };
  
  const errors = validateBookingForm(invalidFormData, mockBundle, mockShop);
  
  console.log(`❌ Se encontraron ${errors.length} errores:`);
  errors.forEach(error => {
    console.log(`  - ${error.field}: ${error.message} (${error.severity})`);
  });
  
  // Formulario corregido
  const validFormData: BookingFormData = {
    bundleId: 'bundle_dia_campo',
    customerName: 'María González',
    customerEmail: 'maria.gonzalez@email.com',
    customerPhone: '+54 351 555-1234',
    date: '2024-03-15',
    itemSelections: [
      {
        itemId: 'item_breakfast',
        timeSlotId: 'slot_breakfast_1',
        numberOfPeople: 2
      },
      {
        itemId: 'item_horseride',
        timeSlotId: 'slot_horseride_1',
        numberOfPeople: 2
      },
      {
        itemId: 'item_bbq',
        timeSlotId: 'slot_bbq_1',
        numberOfPeople: 2
      }
    ],
    extraSelections: [
      {
        extraId: 'extra_wine',
        quantity: 1
      }
    ]
  };
  
  const validationResult = validateBookingForm(validFormData, mockBundle, mockShop);
  console.log(`✅ Formulario corregido: ${validationResult.length} errores`);
  
  // Convertir a request de disponibilidad
  const availabilityRequest = formDataToAvailabilityRequest(validFormData);
  console.log('🔄 Convertido a AvailabilityRequest:', {
    bundle: availabilityRequest.bundleId,
    fecha: availabilityRequest.date,
    items: availabilityRequest.itemSelections.length,
    extras: availabilityRequest.extraSelections.length
  });
  
  return { validFormData, availabilityRequest };
};

// ========================================
// EJEMPLO 5: ESTADÍSTICAS DE OCUPACIÓN
// ========================================

/**
 * Ejemplo de estadísticas de ocupación para una fecha específica
 */
export const exampleOccupancyStats = () => {
  console.log('\n📊 === EJEMPLO 5: ESTADÍSTICAS DE OCUPACIÓN ===');
  
  // Simular el hook (en componente real sería useAvailability)
  const mockUseAvailability = {
    getOccupancyStats: (date: string) => {
      const dayBookings = mockBookings.filter(b => 
        b.date === date && 
        b.status !== 'CANCELLED'
      );
      
      return {
        totalBookings: dayBookings.length,
        items: {
          'item_breakfast': { itemName: 'Desayuno', totalSlots: 2, occupiedSlots: 1, occupancyRate: 0.5 },
          'item_horseride': { itemName: 'Cabalgata', totalSlots: 2, occupiedSlots: 1, occupancyRate: 0.5 },
          'item_bbq': { itemName: 'Asado', totalSlots: 2, occupiedSlots: 1, occupancyRate: 0.5 }
        },
        resources: {
          'res_chef_maria': { resourceName: 'Chef María', totalCapacity: 12, usedCapacity: 4, occupancyRate: 0.33 },
          'res_guide_juan': { resourceName: 'Guía Juan', totalCapacity: 8, usedCapacity: 4, occupancyRate: 0.5 },
          'res_horses': { resourceName: 'Caballos', totalCapacity: 6, usedCapacity: 4, occupancyRate: 0.67 }
        },
        overallOccupancy: 0.5
      };
    }
  };
  
  const stats = mockUseAvailability.getOccupancyStats('2024-02-15');
  
  console.log('📈 Estadísticas para 2024-02-15:');
  console.log(`  Total de reservas: ${stats.totalBookings}`);
  console.log(`  Ocupación general: ${(stats.overallOccupancy * 100).toFixed(1)}%`);
  
  console.log('\n📋 Por items:');
  Object.values(stats.items).forEach(item => {
    console.log(`  - ${item.itemName}: ${item.occupiedSlots}/${item.totalSlots} slots (${(item.occupancyRate * 100).toFixed(1)}%)`);
  });
  
  console.log('\n🔧 Por recursos:');
  Object.values(stats.resources).forEach(resource => {
    console.log(`  - ${resource.resourceName}: ${resource.usedCapacity}/${resource.totalCapacity} capacidad (${(resource.occupancyRate * 100).toFixed(1)}%)`);
  });
  
  return stats;
};

// ========================================
// FUNCIÓN PRINCIPAL DE DEMOSTRACIÓN
// ========================================

/**
 * Ejecutar todos los ejemplos
 */
export const runAvailabilityDemo = async () => {
  console.log('🚀 === DEMO DEL MOTOR DE DISPONIBILIDAD ===\n');
  
  try {
    // Ejecutar ejemplos en secuencia
    await exampleBasicAvailability();
    await exampleResourceConflict();
    exampleReactHookUsage();
    exampleFormValidation();
    exampleOccupancyStats();
    
    console.log('\n✅ === DEMO COMPLETADO EXITOSAMENTE ===');
    
  } catch (error) {
    console.error('❌ Error en el demo:', error);
  }
};

// ========================================
// CASOS DE PRUEBA ESPECÍFICOS
// ========================================

export const testCases = {
  // Caso 1: Bundle no existe
  nonExistentBundle: {
    bundleId: 'bundle_inexistente',
    date: '2024-03-01',
    itemSelections: [],
    extraSelections: []
  },
  
  // Caso 2: Fecha en el pasado
  pastDate: {
    bundleId: 'bundle_dia_campo',
    date: '2023-01-01',
    itemSelections: [
      { itemId: 'item_breakfast', timeSlotId: 'slot_breakfast_1', numberOfPeople: 2 }
    ],
    extraSelections: []
  },
  
  // Caso 3: Capacidad excedida
  overCapacity: {
    bundleId: 'bundle_dia_campo',
    date: '2024-03-01',
    itemSelections: [
      { itemId: 'item_horseride', timeSlotId: 'slot_horseride_1', numberOfPeople: 10 } // Max: 6
    ],
    extraSelections: []
  },
  
  // Caso 4: Día cerrado
  closedDay: {
    bundleId: 'bundle_dia_campo',
    date: '2024-03-03', // Domingo (cerrado)
    itemSelections: [
      { itemId: 'item_breakfast', timeSlotId: 'slot_breakfast_1', numberOfPeople: 2 }
    ],
    extraSelections: []
  }
};

export default {
  runAvailabilityDemo,
  exampleBasicAvailability,
  exampleResourceConflict,
  exampleReactHookUsage,
  exampleFormValidation,
  exampleOccupancyStats,
  testCases
}; 