# Sistema de Gestión de Reservas

Una aplicación completa de gestión de reservas y turnos desarrollada con React, TypeScript y Tailwind CSS. Diseñada para negocios que ofrecen servicios con citas programadas como restaurantes, alquiler de vehículos, actividades turísticas, etc.

## 🚀 Características Principales

### ✅ Funcionalidades Implementadas

- **📅 Calendario Visual Interactivo**
  - Vista por mes, semana y día
  - Eventos con código de colores por estado
  - Selección de slots para crear reservas
  - Filtrado por servicio/kit

- **📝 Gestión Integral de Reservas**
  - Creación manual de reservas
  - Estados: Pendiente, Confirmada, Cancelada, Completada
  - Validaciones de horarios y capacidad
  - Información completa del cliente

- **⚙️ Configuración de Negocio**
  - Horarios de atención por día de la semana
  - Gestión de servicios/kits
  - Configuración de slots de tiempo
  - Límites de reservas por slot

- **📊 Dashboard y Estadísticas**
  - Resumen de reservas por estado
  - Lista filtrable de reservas
  - Acciones rápidas (confirmar, cancelar, completar)

- **🎨 Interfaz Moderna**
  - Diseño responsive
  - Componentes reutilizables
  - Estados de carga
  - Validación de formularios

## 🛠️ Tecnologías Utilizadas

- **React 19** + **TypeScript** - Framework y tipado fuerte
- **Tailwind CSS** - Estilos utilitarios
- **React Big Calendar** - Componente de calendario
- **React Hook Form** + **Zod** - Gestión y validación de formularios
- **date-fns** - Manipulación de fechas
- **Lucide React** - Iconografía moderna
- **Vite** - Build tool y dev server

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Card.tsx
│   ├── BookingCalendar.tsx    # Calendario principal
│   ├── BookingForm.tsx        # Formulario de reservas
│   ├── BookingList.tsx        # Lista de reservas
│   ├── BookingStats.tsx       # Estadísticas
│   └── BusinessHoursForm.tsx  # Configuración de horarios
├── hooks/               # Custom hooks
│   └── useBookings.ts   # Hook para gestión de reservas
├── utils/               # Utilidades
│   └── dateHelpers.ts   # Helpers para fechas y validaciones
├── types/               # Definiciones TypeScript
│   └── index.ts         # Tipos principales
├── mockData/            # Datos de ejemplo
│   └── index.ts         # Mock data
└── App.tsx              # Componente principal
```

## 🎯 Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema (SELLER, ADMIN)
- **Shop**: Negocios/tiendas
- **Kit**: Servicios/productos ofrecidos
- **Booking**: Reservas de clientes
- **TimeSlot**: Slots de tiempo disponibles
- **BusinessHours**: Horarios de atención

### Flujo de Negocio

1. **Configuración**: El dueño configura horarios y servicios
2. **Reservas**: Se crean reservas manuales o automáticas
3. **Gestión**: Se confirman, cancelan o completan reservas
4. **Visualización**: Todo se muestra en el calendario y listas

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- Yarn

### Instalación

```bash
# Clonar e instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn dev

# Build para producción
yarn build
```

### Acceso

La aplicación estará disponible en `http://localhost:5173`

## 📋 Funcionalidades por Pantalla

### 🏠 Dashboard Principal
- Estadísticas generales de reservas
- Navegación por pestañas (Calendario, Reservas, Configuración)

### 📅 Vista Calendario
- Calendario interactivo con reservas
- Filtros por servicio
- Vistas: mes, semana, día
- Creación rápida de reservas

### 📝 Gestión de Reservas
- Lista completa de reservas
- Filtros por estado y servicio
- Acciones en masa
- Detalles completos del cliente

### ⚙️ Configuración
- Horarios de atención del negocio
- Información de servicios
- Configuración de slots

## 🔧 Personalización

### Agregar Nuevos Servicios

```typescript
const newKit: Kit = {
  id: "unique-id",
  name: "Nuevo Servicio",
  price: 50,
  maxCapacity: 6,
  duration: 120, // minutos
  shopId: "shop-id",
  slots: [...]
};
```

### Configurar Validaciones

Las validaciones se encuentran en `src/utils/dateHelpers.ts` y pueden personalizarse según las reglas de negocio.

### Personalizar Estilos

Los estilos están en `src/index.css` y utilizan Tailwind CSS. Puedes modificar colores, espaciados y componentes según tu marca.

## 🔮 Próximas Funcionalidades

- [ ] Notificaciones por email/SMS
- [ ] Integración con sistemas de pago
- [ ] Reportes y analytics avanzados
- [ ] API REST para integraciones
- [ ] Aplicación móvil
- [ ] Gestión multi-tienda
- [ ] Sistema de roles granular

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

*¿Necesitas ayuda o tienes preguntas? ¡No dudes en abrir un issue!*
