# 📅 Celebrae Calendar System

**Sistema moderno de gestión de reservas multi-shop** - Base limpia y modular para nuevos desarrollos

---

> **Última actualización: Junio 2024**

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

Este proyecto es una **base limpia y optimizada** para sistemas de reservas multi-shop. Ha sido simplificado para eliminar complejidad innecesaria y proporcionar una fundación sólida y escalable para nuevos desarrollos.

### ¿Qué hace?
- Gestión de múltiples shops/negocios
- Sistema de reservas con bundles (paquetes) e items individuales
- Calendario interactivo con vista de reservas
- Creación y gestión dinámica de entidades del negocio (shops, bundles, items, extras)
- Validación de disponibilidad y horarios de atención

## 🏗️ Stack Tecnológico

- **React 18** + TypeScript
- **Tailwind CSS** para estilos
- **React Big Calendar** para visualización de calendario
- **Lucide Icons** para iconografía
- **Vite** como bundler y dev server

## 📱 Funcionalidades Principales

### 🏪 **Multi-Shop**
- Selector dinámico entre shops
- Datos y reservas específicas por shop
- Estadísticas independientes y panel de gestión

### 📅 **Calendario Interactivo**
- Vista mensual/semanal/diaria
- Eventos de reservas en tiempo real
- Filtros por bundle y búsqueda de clientes
- Visualización de días cerrados/abiertos según horarios del shop

### 📦 **Sistema de Reservas**
- **Bundles**: Paquetes completos con múltiples servicios
- **Items Individuales**: Servicios específicos
- **Extras**: Complementos opcionales y condicionales
- Validación de disponibilidad, capacidad y horarios
- Gestión de reservas individuales y grupales

### ⚙️ **Gestión de Entidades**
- Creación y edición de shops, bundles, items y extras
- Formularios intuitivos con validación y feedback
- Estado reactivo y modular en toda la aplicación

### 🕒 **Gestión de Horarios de Atención**
- Configuración detallada de horarios por día y rangos
- Plantillas rápidas (normal, fin de semana, 24/7, cerrado)
- Validación de solapamientos y rangos inválidos

## 🗂️ Arquitectura del Código

```
src/
├── components/                 # Componentes React principales y UI
│   ├── BookingCalendar.tsx    # Calendario principal
│   ├── EntitiesManager.tsx    # Administrador de entidades
│   ├── Create*.tsx           # Formularios de creación
│   └── ui/                   # Componentes UI base (Button, Card, Input, Select)
├── features/reservations/     # Lógica y validaciones de reservas
│   ├── components/           # Componentes específicos de reservas
│   ├── availabilityValidation.ts
│   ├── bundleValidation.ts
│   └── types.ts
├── hooks/                    # Hooks personalizados y lógica de estado
│   ├── useShopState.ts      # Estado del shop activo y reservas
│   ├── useEntitiesState.ts  # CRUD de entidades
│   └── ...                  # Otros hooks de gestión
├── types/                   # Definiciones TypeScript globales
├── data/                    # Mock data y migradores
└── utils/                   # Helpers de fechas, formato y validación
```

## 🔄 Flujo de Creación y Gestión de Entidades

1. **Crear Shop** → 2. **Crear Bundle** → 3. **Agregar Items** → 4. **Agregar Extras** → 5. **Gestionar Reservas**

- Cada shop tiene sus propios bundles, items y extras.
- Los horarios de atención del shop determinan la disponibilidad real de reservas.
- El sistema valida automáticamente solapamientos, capacidades y reglas de negocio.

## 📊 Datos de Ejemplo

El sistema incluye 2 shops con datos de prueba (mock):

- **🎯 "La vuelta del Maxi"** - Servicios variados
- **☕ "Café Delicias"** - Experiencias gastronómicas

> **Nota:** Actualmente, los datos son mock y no hay backend real. Todo es gestionado en memoria para facilitar pruebas y desarrollo frontend.

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
- `useEntitiesState()`: CRUD de shops, bundles, items y extras
- Hooks adicionales para gestión de bundles, items, extras y selección de shop

### **Componentes Clave**
- `BookingCalendar`: Calendario con gestión de eventos y reservas
- `EntitiesManager`: Panel de administración de entidades
- `ReservationTypeSelector`: Selector moderno para crear reservas
- `*ReservationManager`: Gestores de reservas específicos (item y bundle)
- Componentes UI reutilizables: `Button`, `Card`, `Input`, `Select`

## 🎨 Características de Diseño

- **Totalmente Responsive**: Móvil, tablet y desktop
- **Interfaz Moderna**: Basada en Tailwind CSS
- **Componentes Reutilizables**: Sistema de diseño consistente
- **Estados de Carga y Feedback**: Visual para el usuario
- **Animaciones Suaves**: Transiciones CSS optimizadas

## 📈 Estado del Proyecto

### ✅ **Funcional y Estable**
- Sistema multi-shop operativo
- Reservas de bundles e items individuales
- Calendario interactivo y validaciones de negocio
- Gestión completa de entidades y horarios

### 🔄 **Preparado para Extensión**
- Arquitectura modular y escalable
- Código limpio y bien documentado
- Sistema de tipos TypeScript completo
- Hooks reutilizables y lógica desacoplada
- Base sólida para nuevas funcionalidades

## 🚀 Próximos Pasos Sugeridos

Para convertir este proyecto en un sistema de producción:

1. **Backend**: Integrar con API REST/GraphQL y base de datos real
2. **Persistencia**: Reemplazar mocks con almacenamiento persistente
3. **Autenticación**: Sistema de usuarios y permisos
4. **Notificaciones**: Email/SMS para reservas y recordatorios
5. **Pagos**: Integración con pasarelas de pago
6. **Reportes**: Dashboard de analytics y exportación de datos
7. **Testing**: Pruebas unitarias e integración
8. **Internacionalización**: Soporte multi-idioma

## 📝 Notas Técnicas

- **Sin dependencias innecesarias**: Solo lo esencial para funcionar
- **Código simplificado**: Eliminadas complejidades no utilizadas
- **Performance optimizado**: Componentes eficientes y reactivos
- **Mantenible**: Estructura clara y consistente
- **Fácil de extender**: Añadir nuevas entidades, validaciones o vistas es sencillo

## 🤝 Cómo Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature/fix
3. Haz tus cambios y abre un Pull Request
4. ¡Toda mejora es bienvenida!

---

**Proyecto optimizado para ser una base de desarrollo limpia, eficiente y escalable**
