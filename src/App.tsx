import React, { useState } from 'react';
import { 
  Calendar, 
  ListTodo, 
  Package, 
  BarChart3, 
  Building2,
  Layers3,
  ChevronDown,
  Plus,
  Zap,
  Euro,
  Settings
} from 'lucide-react';
import './App.css';
import BookingCalendar from './components/BookingCalendar';
import { ItemReservationManager } from './features/reservations/components/ItemReservationManager';
import { BundleReservationManager } from './features/reservations/components/BundleReservationManager';

import { EntitiesManager } from './components/EntitiesManager';
import { useShopState } from './hooks/useShopState';
import { mockShops } from './mockData';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import type { Item, Bundle } from './types';

// 🎯 CHECKPOINT 8: REFACTORIZACIÓN COMPLETA Y ALINEACIÓN POR SHOP

type ActiveTab = 'calendar' | 'items' | 'bundles' | 'entities-manager';

const App: React.FC = () => {
  // 🎯 CHECKPOINT 8: ESTADO CENTRALIZADO DEL SHOP
  const {
    selectedShop, 
    selectedShopId, 
    setSelectedShopId,
    shopBundles,
    shopStats,
    shopItems
  } = useShopState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [showShopSelector, setShowShopSelector] = useState(false);
  
  // 🐞 CHECKPOINT 9.5: ESTADOS PARA CONTROLAR MODALES
  const [selectedItemForReservation, setSelectedItemForReservation] = useState<Item | null>(null);
  const [selectedBundleForReservation, setSelectedBundleForReservation] = useState<Bundle | null>(null);

  // 🎯 CHECKPOINT 8: PESTAÑAS ACTUALIZADAS (SIN "+ RESERVAS")
  const tabs = [
    {
      id: 'calendar' as const,
      name: 'Calendario',
      icon: Calendar,
      description: 'Vista de calendario con reservas modernas'
    },
    {
      id: 'items' as const,
      name: 'Items',
      icon: ListTodo,
      description: 'Reservas individuales de items'
    },
    {
      id: 'bundles' as const,
      name: 'Bundles',
      icon: Package,
      description: 'Reservas de paquetes completos'
    },
    {
      id: 'entities-manager' as const,
      name: 'Crear Entidades',
      icon: Settings,
      description: 'Crear shops, bundles, items y extras'
    }
  ];

  // 🐞 CHECKPOINT 9.5: RENDERIZAR VISTA DE ITEMS SIN MODAL AUTOMÁTICO
  const renderItemsTab = () => {
    if (shopItems.length === 0) {
      return (
        <div className="text-center py-12">
          <ListTodo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay items disponibles
          </h3>
          <p className="text-gray-500">
            El shop "{selectedShop.name}" no tiene items configurados.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 Items - {selectedShop.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {shopItems.length} items disponibles para reserva individual
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </p>
                  </div>
                  {item.isPerGroup && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      Por Grupo
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Euro className="w-4 h-4 mr-1" />
                      {item.price}
                    </span>
                  </div>
                  
                  {item.bookingConfig && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Capacidad:</span>
                        <span className="text-gray-700">{item.bookingConfig.maxCapacity} personas</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Duración:</span>
                        <span className="text-gray-700">{item.bookingConfig.duration} min</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedItemForReservation(item)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Reservar Item
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // 🐞 CHECKPOINT 9.5: RENDERIZAR VISTA DE BUNDLES SIN MODAL AUTOMÁTICO
  const renderBundlesTab = () => {
    if (shopBundles.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay bundles disponibles
          </h3>
          <p className="text-gray-500">
            El shop "{selectedShop.name}" no tiene bundles configurados.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📦 Bundles - {selectedShop.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {shopBundles.length} paquetes disponibles con múltiples servicios
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Bundles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shopBundles.map((bundle) => (
            <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {bundle.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {bundle.description}
                    </p>
                  </div>
                  {bundle.isFeatured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Destacado
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Precio base:</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Euro className="w-4 h-4 mr-1" />
                      {bundle.basePrice}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Items incluidos:</span>
                    <span className="text-gray-700">{bundle.items.length} servicios</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Extras disponibles:</span>
                    <span className="text-gray-700">{bundle.extras.length} opciones</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Capacidad máxima:</span>
                    <span className="text-gray-700">{bundle.maxCapacity} personas</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duración estimada:</span>
                    <span className="text-gray-700">{bundle.duration} min</span>
                  </div>
                </div>

                {/* Resumen de contenido */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Incluye:</h4>
                  <div className="space-y-1">
                    {bundle.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {item.title} (€{item.price})
                      </div>
                    ))}
                    {bundle.items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        + {bundle.items.length - 3} servicios más...
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedBundleForReservation(bundle)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Reservar Bundle
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <BookingCalendar />;
      case 'items':
        // 🐞 CHECKPOINT 9.5: RENDERIZAR VISTA DE ITEMS SIN MODAL AUTOMÁTICO
        return renderItemsTab();
      case 'bundles':
        // 🐞 CHECKPOINT 9.5: RENDERIZAR VISTA DE BUNDLES SIN MODAL AUTOMÁTICO
        return renderBundlesTab();
      case 'entities-manager':
        return <EntitiesManager />;
      default:
        return <BookingCalendar />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎯 CHECKPOINT 8: HEADER CON SELECTOR DE SHOP */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Celebrae Calendar System
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema evolutivo de reservas • Checkpoint 10
              </p>
            </div>
            </div>

            {/* Selector de Shop */}
            <div className="relative">
              <button
                onClick={() => setShowShopSelector(!showShopSelector)}
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedShop.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shopStats.totalReservations} reservas
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown del selector */}
              {showShopSelector && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                      Cambiar Shop Activo
                    </p>
                    {mockShops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => {
                          setSelectedShopId(shop.id);
                          setShowShopSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          shop.id === selectedShopId
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-sm text-gray-500">{shop.address}</p>
                          </div>
                          {shop.id === selectedShopId && (
                            <Layers3 className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>

          {/* Navigation tabs */}
          <nav className="flex space-x-8 overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* 🐞 CHECKPOINT 9.5: MODAL DE RESERVA DE ITEM (CONTROLADO) */}
      {selectedItemForReservation && (
        <ItemReservationManager
          item={selectedItemForReservation}
          onReservationCreated={(reservationId) => {
            console.log('Item reservation created:', reservationId);
            setSelectedItemForReservation(null);
          }}
          onClose={() => setSelectedItemForReservation(null)}
        />
      )}

      {/* 🐞 CHECKPOINT 9.5: MODAL DE RESERVA DE BUNDLE (CONTROLADO) */}
      {selectedBundleForReservation && (
        <BundleReservationManager
          bundle={selectedBundleForReservation}
          onReservationCreated={(reservationId) => {
            console.log('Bundle reservation created:', reservationId);
            setSelectedBundleForReservation(null);
          }}
          onClose={() => setSelectedBundleForReservation(null)}
        />
      )}

      {/* Click outside handler para cerrar el selector */}
      {showShopSelector && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowShopSelector(false)}
        />
      )}
    </div>
  );
};

export default App;
