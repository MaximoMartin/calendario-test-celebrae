# 📅 Celebrae Calendar System

**Sistema moderno de gestión de reservas multi-shop** - Base limpia para nuevos desarrollos

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

Este proyecto es una **base limpia y optimizada** para sistemas de reservas multi-shop. Ha sido simplificado para eliminar complejidad innecesaria y proporcionar una fundación sólida para nuevos desarrollos.

### ¿Qué hace?
- Gestión de múltiples shops/negocios
- Sistema de reservas con bundles (paquetes) e items individuales
- Calendario interactivo con vista de reservas
- Creación dinámica de entidades del negocio

## 🏗️ Stack Tecnológico

- **React 18** + TypeScript
- **Tailwind CSS** para estilos
- **React Big Calendar** para visualización de calendario
- **Lucide Icons** para iconografía
- **Vite** como bundler y dev server

## 📱 Funcionalidades Principales

### 🏪 **Multi-Shop**
- Selector dinámico entre shops
- Datos específicos por shop
- Estadísticas independientes

### 📅 **Calendario Interactivo**
- Vista mensual/semanal/diaria
- Eventos de reservas en tiempo real
- Filtros por bundle y búsqueda de clientes

### 📦 **Sistema de Reservas**
- **Bundles**: Paquetes completos con múltiples servicios
- **Items Individuales**: Servicios específicos
- **Extras**: Complementos opcionales
- Validación de disponibilidad y capacidad

### ⚙️ **Gestión de Entidades**
- Creación de shops, bundles, items y extras
- Formularios intuitivos con validación
- Estado reactivo en toda la aplicación

## 🗂️ Arquitectura del Código

```
src/
├── components/                 # Componentes React principales
│   ├── BookingCalendar.tsx    # Calendario principal
│   ├── EntitiesManager.tsx    # Administrador de entidades
│   ├── Create*.tsx           # Formularios de creación
│   └── ui/                   # Componentes UI base
├── features/reservations/     # Lógica de reservas
│   ├── components/           # Componentes específicos
│   ├── availabilityValidation.ts
│   ├── bundleValidation.ts
│   └── reservationModification.ts
├── hooks/                    # Hooks personalizados
│   ├── useShopState.ts      # Estado del shop activo
│   └── useEntitiesState.ts  # CRUD de entidades
├── types/                   # Definiciones TypeScript
└── mockData/               # Datos de prueba
```

## 📊 Datos de Ejemplo

El sistema incluye 2 shops con datos de prueba:

- **🎯 "La vuelta del Maxi"** - Servicios variados
- **☕ "Café Delicias"** - Experiencias gastronómicas

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

### **Componentes Clave**
- `BookingCalendar`: Calendario con gestión de eventos
- `EntitiesManager`: Panel de administración
- `ReservationTypeSelector`: Selector de tipo de reserva
- `*ReservationManager`: Gestores de reservas específicos

## 🎨 Características de Diseño

- **Totalmente Responsive**: Móvil, tablet y desktop
- **Interfaz Moderna**: Basada en Tailwind CSS
- **Componentes Reutilizables**: Sistema de diseño consistente
- **Estados de Carga**: Feedback visual para el usuario
- **Animaciones Suaves**: Transiciones CSS optimizadas

## 📈 Estado del Proyecto

### ✅ **Funcional y Estable**
- Sistema multi-shop operativo
- Reservas de bundles e items individuales
- Calendario interactivo
- Validaciones de negocio
- Gestión completa de entidades

### 🔄 **Preparado para Extensión**
- Arquitectura modular y escalable
- Código limpio y bien documentado
- Sistema de tipos TypeScript completo
- Hooks reutilizables
- Base sólida para nuevas funcionalidades

## 🚀 Próximos Pasos Sugeridos

Para convertir este proyecto en un sistema de producción:

1. **Backend**: Integrar con API REST/GraphQL
2. **Base de Datos**: Reemplazar mocks con persistencia real
3. **Autenticación**: Sistema de usuarios y permisos
4. **Notificaciones**: Email/SMS para reservas
5. **Pagos**: Integración con pasarelas de pago
6. **Reportes**: Dashboard de analytics
7. **Testing**: Pruebas unitarias e integración

## 📝 Notas Técnicas

- **Sin dependencias innecesarias**: Solo lo esencial para funcionar
- **Código simplificado**: Eliminadas complejidades no utilizadas
- **Performance optimizado**: Componentes eficientes
- **Mantenible**: Estructura clara y consistente

---

**Proyecto optimizado para ser una base de desarrollo limpia y eficiente**  
*Última actualización: Enero 2025*
