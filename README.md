# 🗓️ Sistema de Reservas Moderno

Sistema completo de gestión de reservas desarrollado con React, TypeScript y la nueva arquitectura Bundle-Item-Resource. Diseñado para negocios que requieren gestión avanzada de recursos físicos, horarios y experiencias complejas.

## ✨ Características Principales

### 🏗️ Arquitectura Moderna
- **Bundles**: Paquetes de experiencias que contienen múltiples items y extras
- **Items**: Actividades específicas con horarios, recursos y dependencias
- **Recursos**: Entidades físicas (salas, equipos, personal) compartidas entre items
- **Sistema de Dependencias**: Items que deben ejecutarse en secuencia o concurrentemente

### 📅 Calendario Avanzado
- Vista de reservas por Bundle, Item o Recurso
- Navegación fluida entre vistas mes/semana/día
- Código de colores por estado de reserva
- Filtros avanzados por Bundle, Item o Recurso
- Localización completa en español

### 🎯 Motor de Disponibilidad
- Validación en tiempo real de recursos
- Gestión de conflictos y dependencias
- Sugerencias de horarios alternativos
- Verificación de capacidad máxima
- Validación de horarios de negocio

## 🚀 Tecnologías

- **React 19** con TypeScript
- **Vite** para desarrollo ultra-rápido
- **Tailwind CSS v4** para estilos modernos
- **React Big Calendar** con localización
- **Moment.js** para manejo de fechas
- **Lucide React** para iconografía

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                    # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   ├── ModernCalendar.tsx     # Calendario principal con vistas avanzadas
│   ├── AvailabilityDemo.tsx   # Demo del motor de disponibilidad
│   └── BusinessHoursForm.tsx  # Configuración de horarios
├── hooks/
│   ├── useBookings.ts         # Gestión de estado de reservas
│   └── useAvailability.ts     # Motor de disponibilidad y validaciones
├── types/
│   └── index.ts               # Definiciones TypeScript completas
├── utils/
│   ├── dateHelpers.ts         # Utilidades para manejo de fechas
│   └── availabilityEngine.ts  # Lógica del motor de disponibilidad
├── mockData/
│   └── index.ts               # Datos de ejemplo realistas
└── App.tsx                    # Componente principal
```

## 🎮 Funcionalidades Implementadas

### ✅ Sistema de Reservas Moderno
- **Estructura Bundle-Item-Resource**: Arquitectura escalable y flexible
- **Gestión de Recursos**: Asignación automática de recursos físicos
- **Horarios Complejos**: Items con horarios específicos y dependencias
- **Pricing Dinámico**: Precios por persona, multiplicadores de horario

### ✅ Calendario Visual Avanzado
- **Múltiples Vistas**: Reservas, Items individuales, Recursos, Timeline
- **Filtros Inteligentes**: Por Bundle, Item específico o Recurso
- **Estados Visuales**: Código de colores por estado de reserva
- **Interactividad**: Selección de slots, navegación fluida

### ✅ Motor de Disponibilidad
- **Validación en Tiempo Real**: Verificación instantánea de disponibilidad
- **Gestión de Conflictos**: Detección y resolución de conflictos de recursos
- **Sugerencias Inteligentes**: Horarios alternativos automáticos
- **Dependencias**: Validación de secuencias entre items

### ✅ Configuración Avanzada
- **Horarios de Negocio**: Configuración por día con múltiples períodos
- **Recursos Físicos**: Gestión de salas, equipos, personal
- **Excepciones**: Días especiales, mantenimiento, eventos privados

## 🎯 Datos de Ejemplo

El proyecto incluye datos realistas que simulan:

### 🏪 Negocios Configurados
1. **La vuelta del Maxi** - Escape Room Center
2. **Café Delicias** - Experiencias Gastronómicas  
3. **El Mono Épico Editado** - Experiencias Gourmet

### 🎁 Bundles de Ejemplo
- **Aventura Egipcia Completa** - Escape room con experiencia inmersiva
- **Experiencia Gastronómica Completa** - Clase de barista + cena romántica
- **Catadores y Exploradores** - Experiencias culinarias únicas

### 🔧 Recursos Físicos
- Salas temáticas (Sala Egipcia)
- Personal especializado (Game Masters, Chefs)
- Equipamiento (Sistemas de sonido, máquinas espresso)
- Mobiliario (Mesas VIP, espacios privados)

## 🚀 Instalación y Uso

```bash
# Clonar el repositorio
git clone [repository-url]
cd calendar-test

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5174
```

## 🎨 Personalización

### Agregar Nuevos Bundles
1. Editar `src/mockData/index.ts`
2. Definir Items con sus horarios y recursos
3. Configurar dependencias entre Items
4. Añadir Extras opcionales

### Configurar Recursos
1. Agregar recursos en `mockResources`
2. Asignar a Shop específico
3. Definir capacidad máxima concurrent
4. Configurar en `requiredResources` de Items

### Personalizar Horarios
1. Editar `availableTimeSlots` en Items
2. Configurar días de la semana disponibles
3. Establecer multiplicadores de precio
4. Definir restricciones de anticipación

## 🎯 Casos de Uso Ideales

- **Escape Rooms**: Gestión de salas, game masters y horarios
- **Restaurantes**: Mesas, chefs, experiencias gastronómicas
- **Spas**: Salas de tratamiento, terapeutas, equipamiento
- **Centros de Actividades**: Espacios, instructores, equipos
- **Estudios de Fotografía**: Salas, fotógrafos, equipamiento
- **Centros de Eventos**: Salones, personal, servicios

## 📈 Próximas Mejoras

- [ ] **Sistema de Notificaciones**: Email/SMS automáticos
- [ ] **Reportes y Analytics**: Estadísticas avanzadas
- [ ] **API Backend**: Integración con base de datos real
- [ ] **Pagos Online**: Integración con pasarelas de pago
- [ ] **App Móvil**: Versión nativa para gestión móvil
- [ ] **Multi-tenant**: Soporte para múltiples organizaciones

## 🔧 Desarrollo

```bash
# Lint del código
npm run lint

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

**Desarrollado con ❤️ para modernizar la gestión de reservas**
