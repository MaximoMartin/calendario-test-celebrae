import { useState, useMemo } from 'react';
import { Settings, Calendar as CalendarIcon, AlertTriangle, Building2, Menu, X, HelpCircle } from 'lucide-react';
import type { BusinessHours, Shop, Booking } from './types';
import { useBookings } from './hooks/useBookings';
import { mockBundles, mockShops } from './mockData';
import { BusinessHoursForm } from './components/BusinessHoursForm';
import { AvailabilityDemo } from './components/AvailabilityDemo';
import { ModernCalendar } from './components/ModernCalendar';
import { InteractiveTutorial, useTutorial } from './components/InteractiveTutorial';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'availability' | 'settings'>('calendar');
  const [selectedShopId, setSelectedShopId] = useState<string>(mockShops[0].id);
  const [showBusinessHoursForm, setShowBusinessHoursForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { bookings } = useBookings();
  const tutorial = useTutorial();

  // Negocio seleccionado
  const selectedShop = useMemo(() => 
    mockShops.find(shop => shop.id === selectedShopId) || mockShops[0],
    [selectedShopId]
  );

  // Bundles del negocio seleccionado
  const shopBundles = useMemo(() => 
    mockBundles.filter(bundle => bundle.shopId === selectedShopId),
    [selectedShopId]
  );

  // Filtrar reservas por shop
  const shopBookings = useMemo(() => 
    bookings.filter(booking => booking.shopId === selectedShopId),
    [bookings, selectedShopId]
  );

  const handleBusinessHoursSubmit = (businessHours: BusinessHours[]) => {
    console.log('Updating business hours:', businessHours);
    setShowBusinessHoursForm(false);
  };

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    console.log('Selected slot:', slotInfo);
  };

  const getShopCategoryText = (shop: Shop) => {
    switch (shop.id) {
      case 'ab55132c-dcc8-40d6-9ac4-5f573285f55f':
        return 'Escape Room • Experiencias inmersivas';
      case 'cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf':
        return 'Gastronomía • Experiencias culinarias';
      case '75cdf85a-67f9-40c4-9fc1-ee1019138bec':
        return 'Experiencias gastronómicas únicas';
      default:
        return '';
    }
  };

  const tabs = [
    { id: 'calendar' as const, label: 'Calendario Moderno', icon: CalendarIcon },
    { id: 'availability' as const, label: 'Motor Disponibilidad', icon: AlertTriangle },
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ];

  const bookingStats = useMemo(() => {
    const total = shopBookings.length;
    const confirmed = shopBookings.filter(b => b.status === 'CONFIRMED').length;
    const pending = shopBookings.filter(b => b.status === 'PENDING').length;
    const cancelled = shopBookings.filter(b => b.status === 'CANCELLED').length;

    return { total, confirmed, pending, cancelled };
  }, [shopBookings]);

  return (
    <div className="min-h-screen bg-gray-50 w-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            {/* Logo y título */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                🗓️ Sistema de Reservas Moderno
              </h1>
              
              {/* Selector de Negocio - Desktop */}
              <div className="hidden sm:flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500 flex-shrink-0" />
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="text-sm lg:text-lg font-medium text-gray-900 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-0"
                  >
                    {mockShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Información del negocio - Desktop */}
              <p className="hidden lg:block text-gray-600 mt-1 truncate">
                {selectedShop.address} • {getShopCategoryText(selectedShop)}
              </p>
            </div>

            {/* Tutorial and Mobile menu buttons */}
            <div className="flex items-center space-x-2">
              {/* Tutorial Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={tutorial.startTutorial}
                className="p-2 hidden sm:flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Tutorial</span>
              </Button>

              {/* Mobile tutorial button */}
              <Button
                variant="outline"
                size="sm"
                onClick={tutorial.startTutorial}
                className="p-2 sm:hidden"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t bg-white">
              {/* Selector de Negocio - Mobile */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <select
                    value={selectedShopId}
                    onChange={(e) => {
                      setSelectedShopId(e.target.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-gray-900 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 flex-1"
                  >
                    {mockShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {selectedShop.address}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Desktop tabs */}
          <div className="hidden sm:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile tabs */}
          <div className="sm:hidden">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-2 border-b-2 font-medium text-xs flex flex-col items-center space-y-1 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Estadísticas Simplificadas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 lg:mb-8">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-gray-900">{bookingStats.total}</div>
              <div className="text-sm text-gray-600">Total Reservas</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmadas</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</div>
              <div className="text-sm text-gray-600">Canceladas</div>
            </div>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 lg:space-y-8">
            <ModernCalendar
              selectedShopId={selectedShopId}
              onSelectBooking={(booking) => {
                setSelectedBooking(booking);
              }}
              onSelectSlot={handleCalendarSlotSelect}
            />
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-4 lg:space-y-8">
            <AvailabilityDemo />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 lg:space-y-8 max-w-4xl">
            <Card title="Configuración del Negocio">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Información del Negocio
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-900">Nombre:</span> <span className="text-gray-700">{selectedShop.name}</span></p>
                      <p><span className="font-medium text-gray-900">Dirección:</span> <span className="text-gray-700">{selectedShop.address}</span></p>
                      <p><span className="font-medium text-gray-900">Categorías:</span> <span className="text-gray-700">{getShopCategoryText(selectedShop)}</span></p>
                      <p><span className="font-medium text-gray-900">Estado:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedShop.shopStatus === 'ENABLED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedShop.shopStatus === 'ENABLED' ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                      <p><span className="font-medium text-gray-900">Servicios:</span> <span className="text-gray-700">{shopBundles.length} bundles disponibles</span></p>
                      <p><span className="font-medium text-gray-900">Recursos:</span> <span className="text-gray-700">{selectedShop.resources?.length || 0} recursos configurados</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Acciones Rápidas
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowBusinessHoursForm(true)}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Configurar Horarios</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lista de Bundles */}
            <Card title="Bundles Disponibles">
              <div className="space-y-4">
                {shopBundles.map((bundle) => (
                  <div key={bundle.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        {bundle.items.length} items • {bundle.extras.length} extras
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bundle.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bundle.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      {showBusinessHoursForm && (
        <BusinessHoursForm
          initialData={selectedShop.businessHours || []}
          onSubmit={handleBusinessHoursSubmit}
          onCancel={() => setShowBusinessHoursForm(false)}
        />
      )}

      {/* Tutorial Interactivo */}
      <InteractiveTutorial
        isOpen={tutorial.isOpen}
        onClose={tutorial.closeTutorial}
        onStepChange={tutorial.setCurrentStep}
      />
    </div>
  );
}

export default App;
