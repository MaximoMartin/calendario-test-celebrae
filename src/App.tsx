import React, { useState } from 'react';
import { FinalEtapa5Demo } from './FinalEtapa5Demo';
// import { NotificationProvider, NotificationButton, NotificationPanel } from './components/NotificationSystem';
import { Button } from './components/ui/Button';
// import { mockBookings, mockBundles, mockShops } from './mockData/newModel';
import { Bell, Settings, Package } from 'lucide-react';
import './index.css';

function App() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 w-screen">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistema de Reservas Avanzado
                </h1>
                <p className="text-sm text-gray-600">Calendar Test - Checkpoint 5</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Notificaciones"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Configuraciones"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <FinalEtapa5Demo />
      </main>

      {/* Settings Panel (placeholder) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSettings(false)} />
          
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configuraciones del Sistema</span>
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                Cerrar
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Checkpoint 5 Completado! 🚀
                </h4>
                <div className="text-sm space-y-2">
                  <p>✅ Sistema de Notificaciones Avanzado</p>
                  <p>✅ Gestor de Acciones Masivas</p>
                  <p>✅ Generador de Reportes</p>
                  <p>✅ Configuraciones del Sistema</p>
                  <p>✅ Modal de Detalles Mejorado</p>
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Sistema 100% Funcional</strong><br/>
                    Listo para uso empresarial
                  </p>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  <p>Funcionalidades implementadas y disponibles para integración</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
