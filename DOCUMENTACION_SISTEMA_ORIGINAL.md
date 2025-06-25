# 📚 DOCUMENTACIÓN SISTEMA ORIGINAL - PRESERVACIÓN DE CONOCIMIENTO

## 🎯 PROPÓSITO DE ESTE DOCUMENTO
Este archivo documenta toda la funcionalidad del sistema de reservas original que será eliminado durante la limpieza del proyecto. Contiene la lógica, patrones y funcionalidades implementadas para referencia futura.

---

## 🏗️ ARQUITECTURA GENERAL DEL SISTEMA ORIGINAL

### **Filosofía de Diseño:**
- Sistema centralizado con estado React local
- Componentes modulares y reutilizables
- Hook principal `useBookings` para gestión de estado
- Modelo de datos basado en Kit/Servicio + TimeSlots
- Validaciones distribuidas entre componentes

### **Flujo Principal:**
1. **Selección de Negocio** → Filtrar kits disponibles
2. **Gestión de Reservas** → CRUD completo con validaciones
3. **Calendario Visual** → React Big Calendar con eventos
4. **Dashboard** → Estadísticas y métricas en tiempo real
5. **Búsqueda Global** → Filtros avanzados por múltiples criterios

---

## 📁 COMPONENTES PRINCIPALES DEL SISTEMA ORIGINAL

### 1. **BookingForm.tsx** - FORMULARIO DE RESERVAS ORIGINAL
**Funcionalidad:**
- Formulario completo para crear/editar reservas
- Validación en tiempo real con React Hook Form + Zod
- Integración con timeSlots y disponibilidad
- Selección de clientes y servicios
- Cálculo automático de precios

**Patrones Implementados:**
```typescript
// Estructura de validación
const bookingSchema = z.object({
  kitId: z.string().min(1, "Selecciona un servicio"),
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Email inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  timeSlot: z.string().min(1, "Selecciona un horario"),
  numberOfPeople: z.number().min(1).max(20)
});

// Validación de disponibilidad en tiempo real
const validateAvailability = (formData) => {
  // Verificar conflictos con reservas existentes
  // Validar horarios de negocio
  // Verificar capacidad máxima
  // Aplicar reglas de anticipación
};
```

### 2. **BookingCalendar.tsx** - CALENDARIO VISUAL ORIGINAL
**Funcionalidad:**
- React Big Calendar con localización en español
- Eventos coloreados por estado de reserva
- Filtros por servicio/kit específico
- Navegación entre vistas (mes/semana/día)
- Selección de slots para nuevas reservas
- Modal de detalle al hacer clic en eventos

**Patrones de Eventos:**
```typescript
// Conversión de reservas a eventos de calendario
const convertBookingsToEvents = (bookings, kits) => {
  return bookings.map(booking => ({
    id: booking.id,
    title: `${booking.kitName} - ${booking.customerName}`,
    start: new Date(`${booking.date}T${booking.timeSlot}`),
    end: calculateEndTime(booking.date, booking.timeSlot, kit.duration),
    resource: booking, // Data completa para modals
    color: getStatusColor(booking.status)
  }));
};

// Colores semánticos por estado
const statusColors = {
  'PENDING': '#f59e0b',      // Amarillo
  'CONFIRMED': '#10b981',    // Verde
  'CANCELLED': '#ef4444',    // Rojo
  'COMPLETED': '#6b7280',    // Gris
  'NO_SHOW': '#f97316',      // Naranja
  'RESCHEDULED': '#3b82f6'   // Azul
};
```

### 3. **BookingList.tsx** - GESTIÓN DE RESERVAS ORIGINAL
**Funcionalidad:**
- Lista completa de reservas con paginación
- Filtros avanzados (fecha, estado, servicio, cliente)
- Acciones rápidas (confirmar, cancelar, reagendar)
- Ordenamiento por columnas
- Búsqueda en tiempo real
- Exportación de datos

**Patrones de Filtrado:**
```typescript
// Sistema de filtros múltiples
const FilterSystem = {
  byDate: (bookings, dateRange) => filterByDateRange(bookings, dateRange),
  byStatus: (bookings, statuses) => bookings.filter(b => statuses.includes(b.status)),
  byKit: (bookings, kitIds) => bookings.filter(b => kitIds.includes(b.kitId)),
  byCustomer: (bookings, query) => bookings.filter(b => 
    b.customerName.toLowerCase().includes(query.toLowerCase()) ||
    b.customerEmail.toLowerCase().includes(query.toLowerCase())
  )
};

// Acciones masivas
const bulkActions = {
  confirmMultiple: (bookingIds) => updateMultipleBookings(bookingIds, { status: 'CONFIRMED' }),
  cancelMultiple: (bookingIds, reason) => updateMultipleBookings(bookingIds, { status: 'CANCELLED', reason }),
  exportSelected: (bookingIds, format) => generateExport(bookingIds, format)
};
```

### 4. **BookingStats.tsx** - DASHBOARD DE ESTADÍSTICAS ORIGINAL
**Funcionalidad:**
- Métricas en tiempo real (ingresos, reservas, clientes)
- Gráficos de tendencias y ocupación
- Análisis por períodos (día/semana/mes)
- Comparativas con períodos anteriores
- Alertas de capacidad y conflictos

**Cálculos de Métricas:**
```typescript
// Métricas principales
const calculateMetrics = (bookings, kits, timeRange) => ({
  totalRevenue: bookings.reduce((sum, b) => sum + calculateBookingPrice(b), 0),
  totalBookings: bookings.length,
  averageBookingValue: totalRevenue / totalBookings,
  occupancyRate: calculateOccupancy(bookings, timeSlots),
  customerRetention: calculateRetention(bookings),
  popularServices: getTopPerformingKits(bookings, kits),
  peakHours: getOptimalTimeSlots(bookings),
  cancellationRate: getCancellationStats(bookings)
});

// Análisis de tendencias
const trendAnalysis = {
  daily: groupBookingsByDay(bookings),
  weekly: groupBookingsByWeek(bookings),
  monthly: groupBookingsByMonth(bookings),
  seasonal: identifySeasonalPatterns(bookings)
};
```

### 5. **GlobalSearch.tsx** - BÚSQUEDA AVANZADA ORIGINAL
**Funcionalidad:**
- Búsqueda unificada en reservas, clientes y servicios
- Filtros contextuales dinámicos
- Resultados instantáneos con debounce
- Navegación directa a elementos encontrados
- Historial de búsquedas recientes

**Motor de Búsqueda:**
```typescript
// Búsqueda multi-entidad
const GlobalSearchEngine = {
  searchBookings: (query) => bookings.filter(booking =>
    booking.customerName.includes(query) ||
    booking.customerEmail.includes(query) ||
    booking.kitName.includes(query) ||
    booking.id.includes(query)
  ),
  
  searchCustomers: (query) => extractUniqueCustomers(bookings).filter(customer =>
    customer.name.includes(query) ||
    customer.email.includes(query) ||
    customer.phone.includes(query)
  ),
  
  searchServices: (query) => kits.filter(kit =>
    kit.name.includes(query) ||
    kit.description.includes(query) ||
    kit.category.includes(query)
  )
};

// Relevancia y ranking
const calculateRelevance = (result, query) => {
  let score = 0;
  if (result.title.toLowerCase().includes(query.toLowerCase())) score += 10;
  if (result.subtitle.toLowerCase().includes(query.toLowerCase())) score += 5;
  if (result.description?.toLowerCase().includes(query.toLowerCase())) score += 2;
  return score;
};
```

### 6. **BusinessHoursForm.tsx** - CONFIGURACIÓN HORARIOS ORIGINAL
**Funcionalidad:**
- Configuración de horarios por día de semana
- Múltiples períodos por día (mañana/tarde)
- Validación de solapamientos
- Presets comunes (9-17, 24h, etc.)
- Vista previa de disponibilidad

**Gestión de Horarios:**
```typescript
// Estructura de horarios de negocio
const BusinessHoursStructure = {
  dayOfWeek: number, // 0-6 (Domingo-Sábado)
  isActive: boolean,
  periods: [
    {
      startTime: "09:00",
      endTime: "13:00",
      name: "Mañana"
    },
    {
      startTime: "15:00", 
      endTime: "19:00",
      name: "Tarde"
    }
  ]
};

// Validaciones de horarios
const validateBusinessHours = (hours) => {
  // Verificar que no se solapen períodos
  // Validar formato de horas
  // Asegurar que start < end
  // Verificar días consecutivos
};
```

### 7. **AvailabilityManager.tsx** - GESTIÓN DISPONIBILIDAD ORIGINAL
**Funcionalidad:**
- Configuración de disponibilidad por servicio
- Gestión de excepciones (días cerrados, eventos especiales)
- Límites de capacidad personalizados
- Bloqueos temporales de servicios
- Configuración de anticipación mínima

**Lógica de Disponibilidad:**
```typescript
// Motor de disponibilidad original
const AvailabilityEngine = {
  checkSlotAvailability: (kitId, date, timeSlot) => {
    // Verificar horarios de negocio
    // Comprobar excepciones del día
    // Validar capacidad máxima del slot
    // Verificar conflictos con otras reservas
    // Aplicar reglas de anticipación
    return { available: boolean, conflicts: string[] };
  },
  
  getAvailableSlots: (kitId, date) => {
    const kit = getKitById(kitId);
    const businessHours = getBusinessHoursForDate(date);
    const existingBookings = getBookingsForDate(date);
    
    return generateTimeSlots(kit, businessHours)
      .filter(slot => !hasConflicts(slot, existingBookings))
      .filter(slot => hasCapacity(slot, kit.maxCapacity));
  }
};
```

### 8. **ExceptionManager.tsx** - GESTIÓN EXCEPCIONES ORIGINAL
**Funcionalidad:**
- Creación de excepciones por fecha específica
- Tipos: Cerrado, Horarios especiales, Eventos privados
- Afectación a servicios específicos o generales
- Notificaciones automáticas a clientes
- Historial de excepciones

**Tipos de Excepciones:**
```typescript
const ExceptionTypes = {
  CLOSED: {
    description: "Día completamente cerrado",
    affectsAllServices: true,
    allowBookings: false
  },
  SPECIAL_HOURS: {
    description: "Horarios especiales",
    customHours: { start: "10:00", end: "16:00" },
    affectsAllServices: true
  },
  PRIVATE_EVENT: {
    description: "Evento privado",
    affectedServices: ["kit-1", "kit-2"],
    blockedTimeSlots: ["14:00-18:00"]
  },
  MAINTENANCE: {
    description: "Mantenimiento de instalaciones",
    affectedResources: ["sala-1", "equipo-2"],
    estimatedDuration: 240 // minutos
  }
};
```

---

## 🔧 HOOKS Y UTILIDADES DEL SISTEMA ORIGINAL

### **useBookings.ts** - HOOK PRINCIPAL ORIGINAL
**Responsabilidades:**
- Estado centralizado de todas las reservas
- CRUD completo (Create, Read, Update, Delete)
- Validaciones de negocio
- Sincronización con localStorage
- Notificaciones de cambios

**Patrones de Estado:**
```typescript
const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // CRUD Operations
  const addBooking = async (bookingData) => {
    // Validar datos
    // Verificar disponibilidad
    // Crear reserva
    // Actualizar estado
    // Guardar en localStorage
  };
  
  const updateBooking = async (id, updates) => {
    // Validar cambios
    // Verificar permisos
    // Aplicar actualizaciones
    // Mantener historial
  };
  
  // Utilidades
  const convertBookingsToCalendarEvents = useCallback(...);
  const getBookingsByDate = useCallback(...);
  const getBookingStats = useCallback(...);
  
  return { bookings, addBooking, updateBooking, ... };
};
```

### **useGlobalSearch.ts** - BÚSQUEDA ORIGINAL
**Funcionalidad:**
- Búsqueda en tiempo real con debounce
- Filtros contextuales
- Historial de búsquedas
- Cache de resultados
- Navegación directa

---

## 📊 TIPOS Y MODELOS DEL SISTEMA ORIGINAL

### **types/index.ts** - MODELO ORIGINAL
**Estructura Principal:**
```typescript
// Modelo orientado a Kit/Servicio
interface Kit {
  id: string;
  name: string;
  price: number;
  maxCapacity: number;
  duration: number; // minutos
  shopId: string;
  items: any[]; // elementos incluidos
  extras: any[]; // opcionales
}

// Reserva simple por kit
interface Booking {
  id: string;
  kitId: string;
  kitName: string;
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string; // HH:mm
  numberOfPeople: number;
  status: BookingStatus;
  isManual: boolean;
  createdAt: string;
  notes?: string;
}

// TimeSlots independientes
interface TimeSlot {
  id: string;
  kitId: string;
  startTime: string;
  endTime: string;
  maxBookings: number;
  isActive: boolean;
}
```

**Limitaciones del Modelo Original:**
- Horarios asignados al kit completo, no a actividades individuales
- No manejo de recursos compartidos
- Sin soporte para experiencias complejas multi-actividad
- Validaciones básicas de disponibilidad
- No contempla dependencias entre servicios

---

## 🗄️ DATOS MOCK DEL SISTEMA ORIGINAL

### **mockData/index.ts** - DATOS ORIGINALES
**Estructura de Datos:**
```typescript
// Negocios de ejemplo
const mockShops = [
  {
    id: "shop-1",
    name: "La vuelta del Maxi",
    address: "Turín, Italia",
    categories: ["Ofertas", "Relajación"],
    businessHours: [...],
    kits: ["kit-1", "kit-2", "kit-3"]
  },
  // ... más shops
];

// Servicios/Kits
const mockKits = [
  {
    id: "kit-1",
    name: "Alquiler autos París",
    price: 120,
    maxCapacity: 4,
    duration: 480, // 8 horas
    shopId: "shop-1",
    timeSlots: ["slot-1", "slot-2"]
  },
  // ... más kits
];

// TimeSlots por kit
const mockTimeSlots = [
  {
    id: "slot-1",
    kitId: "kit-1",
    startTime: "09:00",
    endTime: "17:00",
    maxBookings: 2,
    isActive: true
  },
  // ... más slots
];
```

---

## 🎨 PATRONES DE UI Y ESTILOS

### **Componentes UI Reutilizables:**
- `Button.tsx` - Botón con variantes (primary, outline, danger)
- `Card.tsx` - Tarjeta contenedora con título y bordes
- `Input.tsx` - Campo de entrada con validación visual
- `Select.tsx` - Selector dropdown estilizado

### **Patrones de Estilo:**
```css
/* Sistema de colores semánticos */
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-gray: #6b7280;
}

/* Estados de reservas */
.booking-pending { @apply bg-yellow-100 text-yellow-800; }
.booking-confirmed { @apply bg-green-100 text-green-800; }
.booking-cancelled { @apply bg-red-100 text-red-800; }
.booking-completed { @apply bg-gray-100 text-gray-800; }

/* Responsive design */
.mobile-first { @apply block sm:hidden; }
.desktop-only { @apply hidden lg:block; }
```

---

## 🚀 FLUJOS DE USUARIO IMPLEMENTADOS

### **Flujo 1: Crear Nueva Reserva**
1. Seleccionar negocio → Filtrar servicios disponibles
2. Completar formulario → Validar en tiempo real
3. Verificar disponibilidad → Mostrar alternativas si no disponible
4. Confirmar reserva → Actualizar calendario
5. Notificar cliente → Guardar en sistema

### **Flujo 2: Gestionar Reservas Existentes**
1. Buscar reserva → Filtros múltiples
2. Ver detalles → Modal completo
3. Modificar estado → Validar cambios
4. Reagendar si necesario → Verificar nueva disponibilidad
5. Notificar cambios → Actualizar dashboard

### **Flujo 3: Configurar Negocio**
1. Definir horarios → Validar coherencia
2. Configurar servicios → Asignar timeSlots
3. Gestionar excepciones → Aplicar a fechas específicas
4. Configurar disponibilidad → Límites y restricciones

---

## 📈 MÉTRICAS Y ANALÍTICAS IMPLEMENTADAS

### **Métricas de Negocio:**
- Ingresos totales y por período
- Tasa de ocupación por servicio
- Clientes únicos y recurrentes
- Servicios más populares
- Horarios pico de demanda

### **Métricas Operativas:**
- Tiempo promedio de reserva
- Tasa de cancelación
- Eficiencia de slots
- Conflictos de disponibilidad
- Satisfacción del cliente (implícita)

---

## 🔮 LIMITACIONES Y ÁREAS DE MEJORA IDENTIFICADAS

### **Limitaciones del Sistema Original:**
1. **Modelo de datos simplificado** - No soporta experiencias complejas
2. **Recursos no compartidos** - Cada kit es independiente
3. **Validaciones básicas** - No contempla dependencias complejas
4. **Sin persistencia real** - Solo localStorage
5. **UI no optimizada** - No responsive en todos los casos

### **Mejoras Implementadas en Nueva Versión:**
1. **Modelo Bundle→Items→Extras** - Experiencias complejas
2. **Recursos compartidos** - Gestión avanzada de capacidad
3. **Motor de disponibilidad robusto** - Validaciones granulares
4. **UI moderna y responsive** - Mejor experiencia de usuario
5. **Arquitectura escalable** - Preparada para backend real

---

## 💾 PERSISTENCIA Y ALMACENAMIENTO

### **Sistema Original:**
```typescript
// localStorage para persistencia
const StorageKeys = {
  BOOKINGS: 'calendar-bookings',
  BUSINESS_HOURS: 'business-hours',
  EXCEPTIONS: 'shop-exceptions',
  USER_PREFERENCES: 'user-preferences'
};

// Sincronización automática
const syncToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};
```

---

## 🔒 VALIDACIONES Y REGLAS DE NEGOCIO

### **Validaciones Implementadas:**
1. **Horarios de negocio** - No reservas fuera de horario
2. **Capacidad máxima** - Límites por slot y servicio
3. **Anticipación mínima** - Tiempo mínimo antes de la reserva
4. **Días máximos adelante** - Límite de reserva futura
5. **Conflictos de disponibilidad** - No solapamientos

### **Reglas de Negocio:**
```typescript
const BusinessRules = {
  minAdvanceBooking: 24, // horas
  maxAdvanceBooking: 30, // días
  allowSameDayBooking: false,
  autoConfirmBookings: false,
  maxSimultaneousBookings: 5,
  cancellationPolicy: "24h antes sin cargo",
  reschedulePolicy: "Hasta 2 veces por reserva"
};
```

---

## 🎯 CONCLUSIÓN DE LA DOCUMENTACIÓN

Este sistema original representa una **base sólida** para gestión de reservas con:

### **Fortalezas:**
- ✅ Arquitectura modular y bien estructurada
- ✅ UI/UX intuitiva y funcional
- ✅ Validaciones robustas
- ✅ Componentes reutilizables
- ✅ Métricas y analytics básicas

### **Evolución Hacia Nueva Versión:**
- 🚀 **Modelo más complejo** Bundle→Items→Extras
- 🚀 **Motor de disponibilidad avanzado**
- 🚀 **Recursos compartidos**
- 🚀 **Validaciones granulares**
- 🚀 **UI moderna y responsive**

### **Conocimiento Preservado:**
- 📚 Patrones de diseño probados
- 📚 Flujos de usuario validados
- 📚 Estructuras de datos base
- 📚 Validaciones de negocio core
- 📚 Métricas y analytics fundamentales

---

*Este documento preserva todo el conocimiento del sistema original para referencia futura y evolución continua del proyecto.* 