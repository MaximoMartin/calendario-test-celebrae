# 📅 Celebrae Calendar System

**Sistema técnico completo de gestión de reservas multi-shop** - Base modular y escalable para desarrollos avanzados

---

> **Última actualización: Enero 2025**
> **Estado del proyecto: FUNCIONAL COMPLETO** ✅

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn dev

# Acceder a la aplicación
http://localhost:5173
```

## 🎯 Propósito del Proyecto

Este proyecto es una **base técnica completa y optimizada** para sistemas de reservas multi-shop. El código está orientado a servir como referencia y punto de partida para desarrollos que requieran lógica avanzada de validación, gestión de entidades y escalabilidad.

### Características técnicas principales
- **Gestión multi-shop**: separación estricta de entidades por shop
- **Sistema de reservas basado en bundles** (paquetes) con **items y extras embebidos**
- **CRUD completo**: Crear, leer, actualizar y eliminar todas las entidades
- **Sistema de edición avanzado**: Formularios completos para modificar bundles, items y extras
- **Validación exhaustiva** de horarios, disponibilidad y capacidad
- **Gestión de estados** de reservas y reprogramaciones
- **Arquitectura modular**, hooks reutilizables y tipado TypeScript completo

## 🏗️ Stack Tecnológico

- **React 18** + TypeScript
- **Tailwind CSS** para estilos
- **React Big Calendar** para visualización de calendario
- **Lucide Icons** para iconografía
- **Vite** como bundler y dev server

## 📱 Funcionalidades Técnicas Implementadas

### 🏪 **Multi-Shop Completo**
- Selector dinámico de shop activo
- Todas las entidades (bundles, items, extras, reservas) están asociadas a un shop
- Los hooks y componentes filtran y gestionan datos por shop activo
- **Crear y editar shops** con configuración completa de horarios

### 📦 **Sistema de Bundles CRUD Completo**
- **Crear bundles** con configuración avanzada
- **Editar bundles existentes**: Vista completa con tabs organizados
  - **Tab "Datos Generales"**: Edición de nombre, descripción, precios, políticas
  - **Tab "Items"**: Gestión completa de items (agregar, editar, eliminar)
  - **Tab "Extras"**: Gestión completa de extras (agregar, editar, eliminar)
- **Items embebidos**: Servicios individuales con horarios y capacidad configurables
- **Extras embebidos**: Complementos opcionales con reglas de cantidad

### ✏️ **Sistema de Edición Avanzado**
- **Edición de items**: Formularios completos con todos los campos
  - Configuración de horarios por día de la semana
  - Sugerencias inteligentes de horarios basadas en horarios del shop
  - Validación de conflictos con horarios de negocio
- **Edición de extras**: Formularios completos con configuración detallada
  - Precios, cantidades, restricciones
  - Configuración de requisitos y dependencias
- **Estados pre-cargados**: Al editar, los formularios se cargan con los datos existentes
- **Detección automática**: Los formularios detectan si están en modo creación o edición

### 📅 **Calendario Interactivo**
- Vista mensual/semanal/diaria
- Visualización de reservas en tiempo real (mock)
- Filtros por bundle, estado y búsqueda de clientes
- Visualización de días cerrados/abiertos según horarios del shop
- **Indicadores visuales** de estados de reserva y disponibilidad

### 📋 **Sistema de Reservas**
- **Validación estricta** al crear reservas:
  - El shop debe estar abierto en la fecha/horario seleccionado
  - El item debe estar disponible ese día y horario
  - Se valida la capacidad/stock del item y el slot horario
  - Se valida la cantidad máxima de extras
- **Feedback inmediato** de errores de validación en la UI
- **Gestión de reservas** individuales y grupales (por item)
- **Reservas de bundles completos** con múltiples items y extras

### ⚙️ **Gestión de Entidades Completa**
- **CRUD completo** de shops, bundles, items y extras
- **Formularios con validación** y feedback técnico
- **Estado reactivo** y modular en toda la aplicación
- **Edición en contexto**: Los elementos se pueden editar desde múltiples puntos
- **Confirmaciones de eliminación**: Modales de seguridad para acciones destructivas

### 🕒 **Gestión de Horarios de Atención**
- **Configuración detallada** de horarios por día y rangos
- **Plantillas rápidas** (normal, fin de semana, 24/7, cerrado)
- **Validación de solapamientos** y rangos inválidos
- **Integración con items**: Los horarios de items se validan contra horarios del shop

### 🔄 **Gestión de Estados de Reservas**
- **Cambio de estado manual**: Confirmar, Cancelar, Completar, No Show, Reprogramar
- **Reprogramación**: crea una nueva reserva y marca la original como "Reprogramada"
- **Historial de acciones** y modificaciones en cada reserva
- **Estados visuales** con colores y etiquetas descriptivas

## 🗂️ Arquitectura del Código

```
src/
├── components/                 # Componentes React principales y UI
│   ├── BookingCalendar.tsx    # Calendario principal
│   ├── EntitiesManager.tsx    # Administrador de entidades
│   ├── EditBundlesManager.tsx # ✨ NUEVO: Sistema completo de edición de bundles
│   ├── Create*.tsx           # Formularios de creación
│   ├── ItemCreator.tsx       # ✨ MEJORADO: Creación y edición de items
│   ├── ExtraCreator.tsx      # ✨ MEJORADO: Creación y edición de extras
│   ├── ReservationsManager.tsx # Gestión de reservas
│   └── ui/                   # Componentes UI base (Button, Card, Input, Select)
├── features/reservations/     # Lógica y validaciones de reservas
│   ├── components/           # Componentes específicos de reservas
│   ├── availabilityValidation.ts # Validación de horarios, disponibilidad y stock
│   ├── bundleValidation.ts      # Validación de reservas de bundles
│   └── types.ts
├── hooks/                    # Hooks personalizados y lógica de estado
│   ├── useShopState.ts      # Estado del shop activo y reservas
│   ├── useEntitiesState.ts  # ✨ COMPLETO: CRUD de shops, bundles, items y extras
│   └── ...                  # Otros hooks de gestión
├── types/                   # Definiciones TypeScript globales
├── data/                    # Mock data y migradores
└── utils/                   # Helpers de fechas, formato y validación
```

## 🔄 Flujo Técnico Completo de Gestión

### **Creación de Entidades**
1. **El usuario selecciona el shop activo**
2. **Crea bundles** con configuración básica
3. **Agrega items al bundle** con horarios específicos
4. **Agrega extras opcionales** con reglas de cantidad
5. **El sistema valida** toda la configuración automáticamente

### **Edición y Gestión**
1. **Desde "Editar Bundles"**, selecciona un bundle existente
2. **Navegación por tabs**:
   - **"Datos Generales"**: Edita información básica del bundle
   - **"Items"**: Ve, edita o elimina items existentes, agrega nuevos
   - **"Extras"**: Ve, edita o elimina extras existentes, agrega nuevos
3. **Edición completa**: Al hacer clic en "Editar", se abre el formulario completo con datos pre-cargados
4. **Validaciones en tiempo real**: Conflictos de horarios, capacidades, etc.
5. **Persistencia inmediata**: Los cambios se guardan al confirmar

### **Reservas y Validación**
1. **Desde el calendario o gestor de reservas**, inicia la creación
2. **Selecciona bundle, items, extras, fecha y horario**
3. **Ingresa datos del cliente** (nombre, email, teléfono)
4. **El sistema valida automáticamente**:
   - Horarios de negocio vs horarios solicitados
   - Disponibilidad de items específicos
   - Capacidad y stock en tiempo real
   - Reglas de extras y dependencias
5. **Feedback inmediato** si alguna validación falla
6. **Creación exitosa** si todas las validaciones pasan

## 📊 Datos de Ejemplo (Mock)

El sistema incluye 2 shops completamente configurados:

- **🎯 "La vuelta del Maxi"** - Servicios variados (alquiler de autos, escape room)
- **☕ "Café Delicias"** - Experiencias gastronómicas (brunch, café, postres)

### Estructura de datos actual:
- **Bundles**: Cada uno contiene arrays embebidos de `items` y `extras`
- **Items**: Configuración completa de horarios, capacidad y validaciones
- **Extras**: Reglas de cantidad, precios y dependencias
- **Reservas mock**: Simulan reservas reales con todos los estados posibles
- **Shops**: Horarios de atención detallados y configuración completa

## 🎨 Características de Diseño

- **Totalmente Responsive**: Móvil, tablet y desktop
- **Interfaz Moderna**: Basada en Tailwind CSS con componentes consistentes
- **Navegación Intuitiva**: Tabs, breadcrumbs y flujos de usuario claros
- **Estados Visuales**: Indicadores de estado, colores semánticos
- **Feedback Inmediato**: Validaciones, confirmaciones y mensajes de error
- **Animaciones Suaves**: Transiciones CSS optimizadas

## 🔧 Desarrollo

### **Comandos Disponibles**
```bash
yarn dev          # Servidor de desarrollo
yarn build        # Build de producción  
yarn lint         # Verificar código
yarn preview      # Vista previa del build
```

### **Hooks Principales**
- `useShopState()`: Estado del shop activo y reservas
- `useEntitiesState()`: **CRUD completo** de shops, bundles, items y extras
- `useShopStats()`: Estadísticas y métricas del shop
- `useCalendarManagement()`: Gestión de eventos de calendario

### **Componentes Clave**
- `BookingCalendar`: Calendario con gestión de eventos y reservas
- `EntitiesManager`: Panel de administración de entidades
- `EditBundlesManager`: **✨ NUEVO**: Sistema completo de edición de bundles
- `ItemCreator`: **✨ MEJORADO**: Creación y edición completa de items
- `ExtraCreator`: **✨ MEJORADO**: Creación y edición completa de extras
- `ReservationsManager`: Gestión avanzada de reservas
- Componentes UI reutilizables: `Button`, `Card`, `Input`, `Select`

## 📈 Estado Técnico Actual

### ✅ **Funcional y Completo (Mock)**
- **Sistema multi-shop** operativo y escalable
- **CRUD completo** de todas las entidades (shops, bundles, items, extras)
- **Sistema de edición avanzado** con formularios completos
- **Reservas de bundles e items** individuales con validación exhaustiva
- **Calendario interactivo** con filtros y estados visuales
- **Gestión completa de entidades** y horarios
- **Validaciones de negocio** integradas en toda la aplicación
- **Gestión manual de estados** de reserva y reprogramaciones
- **Interfaz de usuario profesional** con feedback inmediato

### ⚙️ **Características Técnicas Destacadas**
- **Arquitectura modular**: Componentes reutilizables y hooks especializados
- **Estado reactivo**: Cambios en tiempo real en toda la aplicación
- **Validaciones inteligentes**: Detección de conflictos y sugerencias
- **Formularios adaptativos**: Detección automática de modo creación/edición
- **Navegación fluida**: Tabs, modales y confirmaciones consistentes
- **Persistencia simulada**: Todos los cambios se mantienen durante la sesión

### ⚠️ **Limitaciones y Alcance Actual**
- **Sin backend real**: Todo es mock/in-memory, sin persistencia entre sesiones
- **Sin autenticación ni roles**: No hay control de acceso ni usuarios diferenciados
- **No existe frontend público**: Solo gestión interna por dueño/operador
- **Sin integraciones externas**: No hay notificaciones, pagos ni reportes avanzados

## 🚀 Próximos Pasos Sugeridos

Para evolucionar este proyecto hacia un sistema de producción:

### **Backend e Infraestructura**
1. **API REST/GraphQL**: Integrar con backend real y base de datos
2. **Persistencia**: Reemplazar mocks con almacenamiento persistente
3. **Autenticación**: Sistema de usuarios, roles y permisos
4. **Testing**: Pruebas unitarias e integración

### **Funcionalidades Avanzadas**
5. **Notificaciones**: Email/SMS para reservas y recordatorios
6. **Pagos**: Integración con pasarelas de pago (Stripe, PayPal)
7. **Reportes**: Dashboard de analytics y exportación de datos
8. **Frontend público**: Portal para clientes finales

### **Optimizaciones**
9. **Performance**: Optimización de consultas y renderizado
10. **Internacionalización**: Soporte multi-idioma
11. **PWA**: Funcionalidades offline y notificaciones push
12. **Integración de calendario**: Sincronización con Google Calendar, Outlook

## 📝 Notas Técnicas

- **Arquitectura escalable**: Fácil de extender con nuevas entidades y funcionalidades
- **Código mantenible**: Estructura clara, tipado completo y patrones consistentes
- **Performance optimizado**: Componentes eficientes y renderizado inteligente
- **UX/UI profesional**: Interfaz moderna con flujos de usuario intuitivos
- **Validaciones robustas**: Sistema completo de validación de reglas de negocio
- **Estado centralizado**: Gestión de estado consistente y predecible

## 🎯 Casos de Uso Ideales

Este sistema es perfecto como base para:

- **Centros de servicios**: Spas, talleres, consultoías
- **Entretenimiento**: Escape rooms, tours, experiencias
- **Gastronómía**: Restaurantes, cafeterías, catering
- **Deportes**: Clases, entrenamiento, alquiler de equipos
- **Salud y belleza**: Centros médicos, estética, bienestar
- **Educación**: Cursos, talleres, coaching

## 🤝 Cómo Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature/fix
3. Haz tus cambios y abre un Pull Request
4. ¡Toda mejora es bienvenida!

---

**Este README refleja el estado actual completo del sistema - un proyecto funcional y listo para ser extendido hacia producción.**
