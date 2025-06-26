# Sistema de Gestión de Reservas

Una aplicación completa de gestión de reservas y turnos desarrollada con React, TypeScript y Tailwind CSS. Diseñada para negocios que ofrecen servicios con citas programadas como spas, restaurantes, alquiler de vehículos, actividades turísticas, etc.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **📅 Calendario Visual Interactivo**
  - Vista por mes, semana y día con navegación fluida
  - Eventos con código de colores por estado de reserva
  - Selección de slots para crear reservas directamente
  - Filtrado dinámico por servicio/kit
  - Interfaz responsive optimizada para móviles

- **📝 Gestión Integral de Reservas**
  - Creación manual de reservas con validaciones
  - 7 estados diferentes: Pendiente, Confirmada, Cancelada, Completada, No se presentó, Reprogramada, Reembolso parcial
  - Modal detallado con información completa del cliente y servicio
  - Acciones contextuales según el estado de la reserva
  - Validaciones automáticas de horarios y capacidad

- **🏢 Sistema Multi-Tienda**
  - Gestión de múltiples negocios desde una sola interfaz
  - Configuración independiente por negocio
  - Filtrado automático de reservas por negocio seleccionado

- **⚙️ Configuración Avanzada de Negocio**
  - **Horarios de Atención Flexibles**: Múltiples períodos por día (ej: mañana y tarde)
  - **Gestión de Excepciones**: Días cerrados, horarios especiales, eventos privados
  - **Disponibilidad Avanzada**: Bloques especiales con precios dinámicos y capacidad limitada
  - Configuración de servicios/kits con precios y duraciones

- **🔍 Búsqueda Global Avanzada**
  - Búsqueda unificada en reservas, clientes y servicios
  - Filtros múltiples por fecha, estado, servicio y tipo de reserva
  - Resultados con relevancia y acciones rápidas

- **📊 Dashboard y Estadísticas en Tiempo Real**
  - Resumen de reservas por estado con porcentajes
  - Estadísticas contextuales según filtros aplicados
  - Vista adaptativa por período (día, semana, mes)
  - Métricas detalladas colapsables en móvil

- **🎨 Interfaz Moderna y Responsive**
  - Diseño mobile-first completamente adaptativo
  - Componentes reutilizables con sistema de diseño coherente
  - Estados de carga y transiciones suaves
  - Validación de formularios con feedback inmediato
  - Menús colapsables para móviles

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript** - Framework y tipado fuerte
- **Tailwind CSS** - Estilos utilitarios
- **React Big Calendar** - Componente de calendario profesional
- **React Hook Form** + **Zod** - Gestión y validación de formularios
- **date-fns** - Manipulación de fechas con soporte para localización
- **Lucide React** - Iconografía moderna y consistente
- **Vite** - Build tool y dev server ultrarrápido

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base reutilizables
│   │   ├── Button.tsx   # Botón con variantes y estados
│   │   ├── Input.tsx    # Input con validación
│   │   ├── Select.tsx   # Select con opciones
│   │   └── Card.tsx     # Card container
│   ├── BookingCalendar.tsx     # Calendario principal con filtros
│   ├── BookingForm.tsx         # Formulario de creación de reservas
│   ├── BookingList.tsx         # Lista avanzada con filtros
│   ├── BookingStats.tsx        # Dashboard de estadísticas
│   ├── BookingDetailModal.tsx  # Modal detallado de reservas
│   ├── BusinessHoursForm.tsx   # Configuración de horarios
│   ├── ExceptionManager.tsx    # Gestión de excepciones
│   ├── AvailabilityManager.tsx # Disponibilidad avanzada
│   └── GlobalSearch.tsx        # Búsqueda global
├── hooks/               # Custom hooks
│   ├── useBookings.ts   # Hook para gestión de reservas
│   └── useGlobalSearch.ts # Hook para búsqueda global
├── utils/               # Utilidades
│   └── dateHelpers.ts   # Helpers para fechas y validaciones
├── types/               # Definiciones TypeScript
│   └── index.ts         # Tipos principales del dominio
├── mockData/            # Datos de ejemplo
│   └── index.ts         # Mock data para desarrollo
└── App.tsx              # Componente principal con routing
```

## 🎯 Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema (SELLER, ADMIN, BUYER, ESSENTIAL)
- **Shop**: Negocios/tiendas con configuración independiente
- **Kit**: Servicios/productos ofrecidos con precios y capacidades
- **Booking**: Reservas de clientes con 7 estados diferentes
- **TimeSlot**: Slots de tiempo configurables por servicio
- **BusinessHours**: Horarios de atención con múltiples períodos por día
- **ShopException**: Excepciones y días especiales
- **AvailabilityBlock**: Bloques de disponibilidad avanzada

### Flujo de Negocio

1. **Configuración Inicial**: Setup de horarios, servicios y excepciones
2. **Gestión de Disponibilidad**: Configuración de bloques especiales
3. **Creación de Reservas**: Manual o automática con validaciones
4. **Seguimiento**: Confirmación, cancelación o completado
5. **Análisis**: Dashboard con métricas en tiempo real

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- Yarn o npm

### Instalación

```bash
# Clonar repositorio
git clone [url-del-repositorio]
cd calendar-test

# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn dev

# Build para producción
yarn build

# Preview del build
yarn preview
```

### Acceso

La aplicación estará disponible en `http://localhost:5173`

## 📋 Funcionalidades Detalladas

### 🏠 Dashboard Principal
- Estadísticas generales con filtros contextuales
- Navegación por pestañas responsive
- Selector de negocio con información contextual

### 📅 Vista Calendario
- Calendario interactivo con múltiples vistas
- Filtros avanzados por servicio
- Creación rápida desde slots vacíos
- Leyenda de estados con códigos de color

### 📝 Gestión de Reservas
- Lista completa con filtros múltiples
- Acciones en masa según estado
- Modal detallado con toda la información
- Búsqueda y ordenación avanzada

### ⚙️ Configuración Avanzada
- **Horarios**: Múltiples períodos por día con copiar/pegar
- **Excepciones**: Gestión de días especiales y eventos
- **Disponibilidad**: Bloques con precios dinámicos y capacidad limitada
- **Servicios**: Configuración completa de kits y precios

### 🔍 Búsqueda Global
- Búsqueda unificada en toda la aplicación
- Filtros avanzados por múltiples criterios
- Resultados con relevancia y acciones rápidas

## 🔧 Personalización

### Agregar Nuevos Servicios

```typescript
const newKit: Kit = {
  id: "unique-id",
  name: "Nuevo Servicio",
  price: 50,
  maxCapacity: 6,
  duration: 120, // minutos
  shopId: "shop-id"
};
```

### Configurar Validaciones

Las validaciones se encuentran en `src/utils/dateHelpers.ts` y pueden personalizarse según las reglas de negocio específicas.

### Personalizar Estilos

Los estilos están en `src/index.css` y `src/App.css` utilizando Tailwind CSS. Puedes modificar:
- Colores del calendario y estados
- Componentes responsivos
- Animaciones y transiciones

## 🧪 Datos de Prueba

El proyecto incluye datos de ejemplo en `src/mockData/index.ts`:
- 3 tiendas diferentes con configuraciones variadas
- Múltiples servicios por tienda
- Reservas en diferentes estados
- Horarios de atención configurados

## 🤝 Contribuir

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollado por

**Maxi** - Sistema completo de gestión de reservas para negocios modernos.

---
