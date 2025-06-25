// ========================================
// DEMO FINAL - ETAPA 5: INTEGRACIÓN COMPLETA
// ========================================

import React, { useState } from 'react';
import { AdvancedDashboard } from './components/AdvancedDashboard';
import { SimplifiedDemo } from './components/SimplifiedDemo';
import { Stage4Demo } from './components/Stage4Demo';
import { IntelligentBookingForm } from './components/IntelligentBookingForm';
import { mockShop, mockBundle, mockBookings, mockUser } from './mockData/newModel';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  List, 
  BarChart3,
  CheckCircle,
  Star,
  Users
} from 'lucide-react';

type ActiveDemo = 'dashboard' | 'calendar' | 'booking-form' | 'booking-management' | 'overview';

export const FinalEtapa5Demo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<ActiveDemo>('overview');

  const demoSections = [
    {
      id: 'overview' as ActiveDemo,
      title: '📋 Resumen del Sistema',
      icon: CheckCircle,
      description: 'Vista general de todas las funcionalidades implementadas'
    },
    {
      id: 'dashboard' as ActiveDemo,
      title: '📊 Dashboard Avanzado',
      icon: LayoutDashboard,
      description: 'Analytics, métricas y estadísticas detalladas'
    },
    {
      id: 'calendar' as ActiveDemo,
      title: '📅 Calendario Inteligente',
      icon: Calendar,
      description: 'Vista de calendario con eventos por items individuales'
    },
    {
      id: 'booking-form' as ActiveDemo,
      title: '🎯 Formulario Inteligente',
      icon: Plus,
      description: 'Creación de reservas con validación en tiempo real'
    },
    {
      id: 'booking-management' as ActiveDemo,
      title: '📝 Gestión de Reservas',
      icon: List,
      description: 'CRUD completo de reservas con funcionalidades avanzadas'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Sistema Completo de Gestión de Reservas
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          <strong>Etapa 5 Completada</strong> - Integración Final Exitosa
        </p>
        <p className="text-gray-500">
          Todas las funcionalidades del prompt original han sido implementadas exitosamente
        </p>
      </div>

      {/* Resumen de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900">Modelo de Datos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Bundle → Items → Extras<br/>
            Horarios en items, no bundles
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900">Motor de Disponibilidad</h3>
          <p className="text-sm text-gray-600 mt-1">
            Validación completa<br/>
            Recursos compartidos
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900">Calendario Inteligente</h3>
          <p className="text-sm text-gray-600 mt-1">
            Eventos por items<br/>
            Filtros avanzados
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-900">Dashboard Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Métricas en tiempo real<br/>
            Análisis completo
          </p>
        </Card>
      </div>

      {/* Funcionalidades implementadas */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Funcionalidades Completadas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧱 Etapa 1: Modelo de Datos</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Jerarquía Bundle → Items → Extras</li>
              <li>✅ Horarios asignados a items individuales</li>
              <li>✅ Recursos compartidos con gestión de conflictos</li>
              <li>✅ Tipos de recursos (PERSON, EQUIPMENT, ROOM, VEHICLE)</li>
              <li>✅ Tiempos de preparación y limpieza</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Etapa 2: Motor de Disponibilidad</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Verificación integral de disponibilidad</li>
              <li>✅ Detección automática de conflictos</li>
              <li>✅ Cálculo de precios con desglose</li>
              <li>✅ Validaciones granulares por item</li>
              <li>✅ Generación de alternativas</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Etapa 3: Calendario Inteligente</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Eventos por items individuales</li>
              <li>✅ Filtros por bundle e item</li>
              <li>✅ Creación rápida de reservas</li>
              <li>✅ Estados visuales avanzados</li>
              <li>✅ Estadísticas en tiempo real</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Etapa 4: Formularios Inteligentes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ Validación en tiempo real</li>
              <li>✅ Motor de disponibilidad integrado</li>
              <li>✅ Cálculo dinámico de precios</li>
              <li>✅ Configuración granular por item</li>
              <li>✅ CRUD completo de reservas</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Cambio conceptual logrado */}
      <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Cambio Conceptual Logrado</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">❌ ANTES (Sistema Original)</h3>
            <div className="text-sm text-red-700">
              <p className="mb-2"><strong>Problema:</strong> Horarios asignados al bundle completo</p>
              <p className="mb-2"><strong>Calendario:</strong> "Día de Campo - Cliente X" (8:00-14:30)</p>
              <p><strong>Limitación:</strong> No refleja la realidad de las actividades individuales</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">✅ AHORA (Sistema Nuevo)</h3>
            <div className="text-sm text-green-700">
              <p className="mb-2"><strong>Solución:</strong> Horarios específicos por item</p>
              <div className="mb-2">
                <strong>Calendario:</strong>
                <br />• "Desayuno - Cliente X" (8:00-9:00)
                <br />• "Cabalgata - Cliente X" (10:30-12:00)
                <br />• "Asado - Cliente X" (13:00-14:30)
              </div>
              <p><strong>Ventaja:</strong> Gestión granular de recursos y horarios</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tecnologías utilizadas */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Stack Tecnológico</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 border rounded-lg">
            <div className="font-bold text-blue-600 mb-1">React 19</div>
            <div className="text-sm text-gray-600">Framework principal</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-bold text-blue-600 mb-1">TypeScript</div>
            <div className="text-sm text-gray-600">Tipado fuerte</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-bold text-blue-600 mb-1">Tailwind CSS</div>
            <div className="text-sm text-gray-600">Estilos utilitarios</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-bold text-blue-600 mb-1">date-fns</div>
            <div className="text-sm text-gray-600">Manejo de fechas</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderActiveDemo = () => {
    switch (activeDemo) {
      case 'overview':
        return renderOverview();
        
      case 'dashboard':
        return (
          <AdvancedDashboard
            shop={mockShop}
            bundles={[mockBundle]}
            bookings={mockBookings}
            onNavigateToBooking={(id) => console.log('Navigate to booking:', id)}
            onCreateBooking={() => setActiveDemo('booking-form')}
            onExportData={(format) => console.log('Export:', format)}
          />
        );
        
      case 'calendar':
        return <SimplifiedDemo />;
        
      case 'booking-form':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">🎯 Formulario Inteligente</h1>
              <p className="text-gray-600">Validación en tiempo real con motor de disponibilidad</p>
            </div>
            
            <IntelligentBookingForm
              shop={mockShop}
              bundles={[mockBundle]}
              onSubmit={async (data) => {
                console.log('Booking created:', data);
                setActiveDemo('overview');
                return { success: true };
              }}
              onCancel={() => setActiveDemo('overview')}
            />
          </div>
        );
        
      case 'booking-management':
        return <Stage4Demo />;
        
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Sistema de Gestión de Reservas
                </h1>
                <p className="text-sm text-gray-500">Etapa 5 - Integración Final Completa</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{mockShop.name}</p>
                <p className="text-xs text-gray-500">{mockUser.name}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Navegación */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Demos Disponibles</h3>
              
              <div className="space-y-2">
                {demoSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveDemo(section.id)}
                    className={`w-full flex items-start p-3 rounded-lg text-left transition-colors ${
                      activeDemo === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{section.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Estado del sistema */}
            <Card className="p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Estado del Sistema</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reservas Mock</span>
                  <span className="font-semibold text-gray-900">{mockBookings.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bundle Activo</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items por Bundle</span>
                  <span className="font-semibold text-blue-600">{mockBundle.items.length}</span>
                </div>
                
                                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">Recursos</span>
                   <span className="font-semibold text-purple-600">{mockShop.resources?.length || 0}</span>
                 </div>
              </div>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="col-span-12 lg:col-span-9">
            {renderActiveDemo()}
          </div>
        </div>
      </div>
    </div>
  );
}; 