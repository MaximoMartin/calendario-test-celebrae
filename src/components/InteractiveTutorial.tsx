import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight,
  CheckCircle,
  Info,
  PlayCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  component?: string;
  features: string[];
  tips?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Sistema de Reservas Moderno! 🎉',
    description: 'Este tutorial te guiará a través de todas las funcionalidades del sistema de gestión de reservas para negocios.',
    component: 'Introducción',
    features: [
      'Sistema completo de gestión de reservas',
      'Calendario moderno con múltiples vistas',
      'Motor de disponibilidad inteligente',
      'Configuración flexible de horarios',
      'Dashboard con estadísticas en tiempo real'
    ],
    tips: [
      'Puedes saltar pasos usando los botones de navegación',
      'Cada componente tiene ejemplos interactivos',
      'El sistema funciona con datos de demostración realistas'
    ]
  },
  {
    id: 'header',
    title: 'Header - Panel de Control Principal 🏢',
    description: 'La barra superior contiene los controles principales y selector de negocio.',
    target: 'header',
    component: 'Header & Navigation',
    features: [
      'Selector de negocio activo',
      'Información de ubicación',
      'Navegación responsive para móvil',
      'Menú hamburguesa en dispositivos pequeños'
    ],
    tips: [
      'Cambia entre diferentes negocios para ver datos específicos',
      'La información se actualiza automáticamente al cambiar negocio'
    ]
  },
  {
    id: 'tabs',
    title: 'Pestañas de Navegación 📑',
    description: 'Sistema de pestañas para acceder a las diferentes secciones del sistema.',
    target: 'nav',
    component: 'Navigation Tabs',
    features: [
      'Calendario Moderno: Vista principal de reservas',
      'Motor Disponibilidad: Demo del sistema de disponibilidad',
      'Configuración: Horarios de negocio y settings'
    ],
    tips: [
      'Cada pestaña mantiene su estado independientemente',
      'El diseño se adapta a pantallas móviles'
    ]
  },
  {
    id: 'calendar-view',
    title: 'Calendario Moderno 📅',
    description: 'Vista principal para gestionar reservas con calendario interactivo.',
    component: 'ModernCalendar',
    features: [
      'Múltiples vistas: Mes, Semana, Día',
      'Reservas codificadas por colores según estado',
      'Filtrado por kits/servicios',
      'Estadísticas de reservas en tiempo real',
      'Selección de slots para nuevas reservas'
    ],
    tips: [
      'Haz clic en un día para crear una nueva reserva',
      'Usa los filtros para ver solo ciertos tipos de servicios',
      'Los colores indican: Verde=Confirmado, Amarillo=Pendiente, Rojo=Cancelado'
    ]
  },
  {
    id: 'stats-cards',
    title: 'Tarjetas de Estadísticas 📊',
    description: 'Panel de métricas del negocio con información clave.',
    component: 'Stats Cards',
    features: [
      'Total de reservas del período',
      'Reservas confirmadas',
      'Reservas pendientes de confirmación',
      'Reservas canceladas',
      'Actualización en tiempo real'
    ],
    tips: [
      'Las estadísticas se filtran por el negocio seleccionado',
      'Los números cambian según las fechas visibles en el calendario'
    ]
  },
  {
    id: 'availability-demo',
    title: 'Motor de Disponibilidad 🔧',
    description: 'Sistema inteligente que calcula la disponibilidad de servicios.',
    component: 'AvailabilityDemo',
    features: [
      'Cálculo automático de slots disponibles',
      'Validación de conflictos de horarios',
      'Gestión de capacidad por servicio',
      'Reglas de negocio configurables',
      'Previsualización de disponibilidad'
    ],
    tips: [
      'Selecciona diferentes fechas para ver cómo cambia la disponibilidad',
      'El sistema considera horarios de negocio y reservas existentes',
      'Cada kit tiene su propia capacidad y duración'
    ]
  },
  {
    id: 'availability-results',
    title: 'Resultados de Disponibilidad ✅',
    description: 'Visualización de slots disponibles y ocupados.',
    component: 'Availability Results',
    features: [
      'Lista de horarios disponibles',
      'Indicadores de capacidad restante',
      'Información de conflictos',
      'Sugerencias de horarios alternativos'
    ],
    tips: [
      'Los slots verdes están completamente disponibles',
      'Los slots amarillos tienen disponibilidad limitada',
      'Los slots rojos no están disponibles'
    ]
  },
  {
    id: 'business-config',
    title: 'Configuración de Negocio ⚙️',
    description: 'Panel para configurar horarios de atención y reglas del negocio.',
    component: 'BusinessHoursForm',
    features: [
      'Configuración por día de la semana',
      'Múltiples slots por día',
      'Horarios de apertura y cierre',
      'Días de descanso',
      'Validación de horarios'
    ],
    tips: [
      'Puedes agregar múltiples turnos por día',
      'Los horarios afectan la disponibilidad del sistema',
      'Desmarca los días que el negocio está cerrado'
    ]
  },
  {
    id: 'ui-components',
    title: 'Componentes UI Reutilizables 🧩',
    description: 'Sistema de componentes consistente en toda la aplicación.',
    component: 'UI Components',
    features: [
      'Button: Botones con variantes y tamaños',
      'Input: Campos de entrada validados',
      'Select: Selectores con opciones múltiples',
      'Card: Contenedores de información'
    ],
    tips: [
      'Todos los componentes siguen el mismo sistema de diseño',
      'Son responsive y accesibles',
      'Usan Tailwind CSS para estilado consistente'
    ]
  },
  {
    id: 'data-flow',
    title: 'Flujo de Datos y Hooks 🔄',
    description: 'Arquitectura de estado y gestión de datos.',
    component: 'Data Management',
    features: [
      'useBookings: Hook para gestión de reservas',
      'Estados centralizados con React useState',
      'Datos mock realistas para demostración',
      'Validaciones de tipos con TypeScript'
    ],
    tips: [
      'Los hooks encapsulan la lógica de negocio',
      'Los datos se sincronizan automáticamente',
      'TypeScript previene errores de tipos'
    ]
  },
  {
    id: 'responsive',
    title: 'Diseño Responsive 📱',
    description: 'La aplicación se adapta a todos los dispositivos.',
    component: 'Responsive Design',
    features: [
      'Layout adaptativo para móvil, tablet y desktop',
      'Menú hamburguesa en pantallas pequeñas',
      'Tablas y calendarios optimizados para touch',
      'Tipografía escalable'
    ],
    tips: [
      'Prueba redimensionar la ventana para ver las adaptaciones',
      'En móvil, usa gestos de swipe para navegar',
      'Los componentes mantienen funcionalidad en todos los tamaños'
    ]
  },
  {
    id: 'next-steps',
    title: '¡Tutorial Completado! 🎊',
    description: 'Has explorado todas las funcionalidades del sistema de reservas.',
    component: 'Conclusión',
    features: [
      'Sistema completo listo para uso',
      'Arquitectura escalable y mantenible',
      'Código TypeScript bien tipado',
      'Componentes reutilizables',
      'Diseño moderno y responsive'
    ],
    tips: [
      'Explora libremente cada sección',
      'El código está documentado y es fácil de extender',
      'Puedes repetir el tutorial cuando quieras'
    ]
  }
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (step: TutorialStep) => void;
}

export function InteractiveTutorial({ isOpen, onClose, onStepChange }: InteractiveTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Continuar Tutorial
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Tutorial Interactivo</h2>
                <p className="text-blue-100 text-sm">
                  Paso {currentStepIndex + 1} de {tutorialSteps.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Minimizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {currentStep.component}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStep.title}
            </h3>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Características Principales
            </h4>
            <ul className="space-y-2">
              {currentStep.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          {currentStep.tips && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2 text-yellow-600" />
                Consejos Útiles
              </h4>
              <ul className="space-y-2">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Navigation Pills */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Navegación Rápida</h4>
            <div className="flex flex-wrap gap-2">
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    index === currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : index < currentStepIndex
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}. {step.component}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {currentStepIndex + 1} de {tutorialSteps.length}
              </span>
              
              {currentStepIndex === tutorialSteps.length - 1 ? (
                <Button onClick={onClose} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Tutorial</span>
                </Button>
              ) : (
                <Button onClick={nextStep} className="flex items-center space-x-2">
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook para gestionar el estado del tutorial
export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);

  const startTutorial = () => setIsOpen(true);
  const closeTutorial = () => setIsOpen(false);

  return {
    isOpen,
    currentStep,
    startTutorial,
    closeTutorial,
    setCurrentStep
  };
} 