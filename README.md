# 📅 Celebrae Calendar System

Sistema moderno de gestión de reservas para múltiples shops con bundles, items y extras.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Acceder a la aplicación
http://localhost:5174
```

## 🏗️ Arquitectura

### Stack Tecnológico
- **React 18** + TypeScript
- **Tailwind CSS** para estilos
- **React Big Calendar** para el calendario
- **Lucide Icons** para iconografía
- **Vite** como bundler

### Estructura de Entidades
```
👤 Usuario
  └── 🏪 Shop (múltiples)
      └── 📦 Bundle (paquetes de servicios)
          ├── 🎯 Item (servicios individuales)
          └── ➕ Extra (complementos)
```

## 🎯 Funcionalidades Activas

### 📅 **Sistema de Calendario**
- Vista mensual, semanal y diaria
- Eventos dinámicos por shop
- Filtros por bundle y búsqueda
- Estadísticas en tiempo real

### 🏪 **Gestión Multi-Shop**
- Selector dinámico de shop activo
- Datos específicos por shop
- Estadísticas independientes

### 📦 **Sistema de Reservas**

#### **Reservas de Bundle**
- Wizard interactivo para paquetes completos
- Selección múltiple de items
- Configuración de extras opcionales
- Validación cruzada de disponibilidad

#### **Reservas Individuales**
- Reserva directa de items específicos
- Validación de capacidad y horarios
- Configuración de grupos vs individual

### ⚙️ **Gestión de Entidades**
- **Crear Shops**: Configuración completa de nuevos espacios
- **Crear Bundles**: Paquetes de servicios personalizados
- **Agregar Items**: Servicios individuales con horarios
- **Configurar Extras**: Complementos opcionales

## 🎛️ Interfaz Principal

### **Pestañas Disponibles**

1. **📅 Calendario**
   - Vista completa de reservas
   - Filtros y búsqueda
   - Creación rápida de reservas

2. **🎯 Items**
   - Lista de servicios individuales
   - Reserva directa por item

3. **📦 Bundles**
   - Paquetes completos disponibles
   - Reserva de experiencias completas

4. **⚙️ Crear Entidades**
   - Administrador de shops, bundles, items y extras

## 🗂️ Estructura del Proyecto

```
src/
├── components/                 # Componentes principales
│   ├── BookingCalendar.tsx    # Calendario principal
│   ├── EntitiesManager.tsx    # Gestión de entidades
│   ├── CreateShopForm.tsx     # Formulario de shops
│   ├── CreateBundleForm.tsx   # Formulario de bundles
│   ├── ItemCreator.tsx        # Creador de items
│   ├── ExtraCreator.tsx       # Creador de extras
│   └── ui/                    # Componentes UI base
├── features/reservations/      # Sistema de reservas
│   ├── components/            # Componentes de reservas
│   │   ├── BundleReservationManager.tsx
│   │   └── ItemReservationManager.tsx
│   ├── availabilityValidation.ts
│   ├── bundleValidation.ts
│   └── reservationModification.ts
├── hooks/                     # Hooks personalizados
│   ├── useShopState.ts       # Estado del shop activo
│   └── useEntitiesState.ts   # Gestión de entidades
├── types/                    # Definiciones TypeScript
└── mockData/                 # Datos de prueba
```

## 📊 Datos de Prueba

El sistema incluye 2 shops de ejemplo:

### **🎯 "La vuelta del Maxi"**
- Alquiler de Autos en París
- Spa Day Premium
- Cata de Vinos VIP

### **☕ "Café Delicias"**
- Brunch Especial Gourmet
- Cena Romántica Premium
- Clase de Café y Barista

## 🎨 Características de UI

- **Responsive Design**: Optimizado para móvil y desktop
- **Dark/Light Theme**: Interfaz adaptable
- **Iconografía Consistente**: Lucide Icons
- **Animaciones Suaves**: Transiciones CSS
- **Estados de Carga**: Feedback visual

## 🔧 Desarrollo

### **Comandos Útiles**
```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

### **Hooks Principales**
- `useShopState()`: Estado del shop activo y datos relacionados
- `useEntitiesState()`: Gestión CRUD de entidades del sistema

### **Componentes Clave**
- `BookingCalendar`: Calendario principal con eventos
- `ReservationTypeSelector`: Selector de tipo de reserva
- `BundleReservationManager`: Wizard de reservas de bundle
- `ItemReservationManager`: Gestor de reservas individuales

## 📈 Estado Actual

✅ **Completado:**
- Sistema multi-shop funcional
- Reservas de bundle e items
- Gestión completa de entidades
- Calendario interactivo
- Validaciones de disponibilidad

🔄 **En Desarrollo:**
- Persistencia de datos real
- Notificaciones por email
- Reportes avanzados
- API backend

---

**Versión**: Checkpoint 10 - Sistema Limpio y Optimizado  
**Última actualización**: Enero 2025
