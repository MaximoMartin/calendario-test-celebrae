# 📅 Celebrae Calendar System

**Sistema técnico de gestión de reservas multi-shop** - Base modular y escalable para desarrollos avanzados

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

Este proyecto es una **base técnica y optimizada** para sistemas de reservas multi-shop. El código está orientado a servir como referencia y punto de partida para desarrollos que requieran lógica avanzada de validación, gestión de entidades y escalabilidad.

### Características técnicas principales
- Gestión multi-shop: separación estricta de entidades por shop
- Sistema de reservas basado en bundles (paquetes) e items individuales
- Validación exhaustiva de horarios, disponibilidad y capacidad
- Gestión de estados de reservas y reprogramaciones
- Arquitectura modular, hooks reutilizables y tipado TypeScript completo

## 🏗️ Stack Tecnológico

- **React 18** + TypeScript
- **Tailwind CSS** para estilos
- **React Big Calendar** para visualización de calendario
- **Lucide Icons** para iconografía
- **Vite** como bundler y dev server

## 📱 Funcionalidades Técnicas

### 🏪 **Multi-Shop**
- Selector dinámico de shop activo
- Todas las entidades (bundles, items, extras, reservas) están asociadas a un shop
- Los hooks y componentes filtran y gestionan datos por shop activo

### 📅 **Calendario Interactivo**
- Vista mensual/semanal/diaria
- Visualización de reservas en tiempo real (mock)
- Filtros por bundle, estado y búsqueda de clientes
- Visualización de días cerrados/abiertos según horarios del shop

### 📦 **Sistema de Reservas**
- **Bundles**: Paquetes con múltiples servicios (items)
- **Items**: Servicios individuales con horarios y capacidad configurables
- **Extras**: Complementos opcionales y condicionales
- Validación estricta al crear reservas:
  - El shop debe estar abierto en la fecha/horario seleccionado
  - El item debe estar disponible ese día y horario
  - Se valida la capacidad/stock del item y el slot horario
  - Se valida la cantidad máxima de extras
- Feedback inmediato de errores de validación en la UI
- Gestión de reservas individuales y grupales (por item)

### ⚙️ **Gestión de Entidades**
- CRUD completo de shops, bundles, items y extras
- Formularios con validación y feedback técnico
- Estado reactivo y modular en toda la aplicación

### 🕒 **Gestión de Horarios de Atención**
- Configuración detallada de horarios por día y rangos
- Plantillas rápidas (normal, fin de semana, 24/7, cerrado)
- Validación de solapamientos y rangos inválidos

### 🔄 **Gestión de Estados de Reservas**
- Cambio de estado manual: Confirmar, Cancelar, Completar, No Show, Reprogramar
- Reprogramación: crea una nueva reserva y marca la original como "Reprogramada", manteniendo historial
- Historial de acciones y modificaciones en cada reserva

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
│   ├── availabilityValidation.ts # Validación de horarios, disponibilidad y stock
│   ├── bundleValidation.ts      # Validación de reservas de bundles
│   └── types.ts
├── hooks/                    # Hooks personalizados y lógica de estado
│   ├── useShopState.ts      # Estado del shop activo y reservas
│   ├── useEntitiesState.ts  # CRUD de entidades
│   └── ...                  # Otros hooks de gestión
├── types/                   # Definiciones TypeScript globales
├── data/                    # Mock data y migradores
└── utils/                   # Helpers de fechas, formato y validación
```

## 🔄 Flujo Técnico de Creación y Gestión de Reservas

1. **El usuario (dueño/operador) selecciona el shop activo**
2. **Crea bundles, items y extras según la configuración del negocio**
3. **Desde el calendario o el gestor de reservas, inicia la creación de una reserva**
   - Selecciona bundle, items, extras, fecha y horario
   - Ingresa datos del cliente (nombre, email, teléfono)
   - El sistema valida automáticamente horarios, disponibilidad y stock
   - Si alguna validación falla, se muestra feedback inmediato y no se permite crear la reserva
4. **La reserva se almacena en memoria (mock) y se visualiza en el calendario y gestor**
5. **El usuario puede cambiar el estado de la reserva manualmente**
   - Confirmar, Cancelar, Completar, No Show, Reprogramar
   - Al reprogramar, se crea una nueva reserva y la original queda como "Reprogramada"

> **Nota:** Actualmente, todas las reservas se crean desde la interfaz de administración. No existe frontend público para clientes finales ni distinción real entre reservas "manuales" y "de cliente".

## 📊 Datos de Ejemplo

El sistema incluye 2 shops con datos de prueba (mock):

- **🎯 "La vuelta del Maxi"** - Servicios variados
- **☕ "Café Delicias"** - Experiencias gastronómicas

> **Nota:** Todos los datos son mock y se gestionan en memoria. No hay backend real ni persistencia.

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
- `ReservationTypeSelector`: Selector para crear reservas (flujo manual)
- `*ReservationManager`: Gestores de reservas específicos (item y bundle)
- Componentes UI reutilizables: `Button`, `Card`, `Input`, `Select`

## 🎨 Características de Diseño

- **Totalmente Responsive**: Móvil, tablet y desktop
- **Interfaz Moderna**: Basada en Tailwind CSS
- **Componentes Reutilizables**: Sistema de diseño consistente
- **Estados de Carga y Feedback**: Visual para el usuario
- **Animaciones Suaves**: Transiciones CSS optimizadas

## 📈 Estado Técnico Actual

### ✅ **Funcional y Estable (Mock)**
- Sistema multi-shop operativo
- Reservas de bundles e items individuales
- Calendario interactivo y validaciones de negocio
- Gestión completa de entidades y horarios
- Validaciones exhaustivas de horarios, disponibilidad y stock
- Gestión manual de estados de reserva y reprogramaciones

### ⚠️ **Limitaciones y Alcance Actual**
- **Sin backend real**: Todo es mock/in-memory, sin persistencia
- **Sin autenticación ni roles**: No hay control de acceso ni usuarios diferenciados
- **No existe frontend público para clientes**: Solo gestión interna por dueño/operador
- **No hay notificaciones, pagos ni reportes**: Solo lógica de reservas y gestión básica

## 🚀 Próximos Pasos Sugeridos

Para evolucionar este proyecto hacia un sistema de producción:

1. **Backend**: Integrar con API REST/GraphQL y base de datos real
2. **Persistencia**: Reemplazar mocks con almacenamiento persistente
3. **Autenticación y roles**: Sistema de usuarios y permisos
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

**Este README está orientado a desarrolladores y sirve como referencia técnica del estado y arquitectura actual del sistema.**
