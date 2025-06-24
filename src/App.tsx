import { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Calendar as CalendarIcon, Search, AlertTriangle, Calendar, Building2, Menu, X } from 'lucide-react';
import type { BookingFormData, CalendarEvent, BusinessHours, Shop, ViewType, Booking } from './types';
import { useBookings } from './hooks/useBookings';
import { mockKits, mockTimeSlots, mockShops } from './mockData';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingForm } from './components/BookingForm';
import { BookingList } from './components/BookingList';
import { BookingStats } from './components/BookingStats';
import { BusinessHoursForm } from './components/BusinessHoursForm';
import { GlobalSearch } from './components/GlobalSearch';
import { ExceptionManager } from './components/ExceptionManager';
import { AvailabilityManager } from './components/AvailabilityManager';
import { BookingDetailModal } from './components/BookingDetailModal';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings' | 'settings'>('calendar');
  const [selectedShopId, setSelectedShopId] = useState<string>(mockShops[0].id);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBusinessHoursForm, setShowBusinessHoursForm] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showExceptionManager, setShowExceptionManager] = useState(false);
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedKitFilter, setSelectedKitFilter] = useState<string>('all');
  const [calendarView, setCalendarView] = useState<ViewType>('week');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Resetear filtro de kit cuando cambia el shop
  useEffect(() => {
    setSelectedKitFilter('all');
  }, [selectedShopId]);

  const {
    bookings,
    addBooking,
    updateBooking,
    convertBookingsToCalendarEvents,
  } = useBookings();

  // Negocio seleccionado
  const selectedShop = useMemo(() => 
    mockShops.find(shop => shop.id === selectedShopId) || mockShops[0],
    [selectedShopId]
  );

  // Kits del negocio seleccionado
  const shopKits = useMemo(() => 
    mockKits.filter(kit => kit.shopId === selectedShopId),
    [selectedShopId]
  );

  // Filtrar reservas por shop
  const shopBookings = useMemo(() => 
    bookings.filter(booking => booking.shopId === selectedShopId),
    [bookings, selectedShopId]
  );

  // Convertir reservas a eventos de calendario
  const calendarEvents: CalendarEvent[] = useMemo(() => 
    convertBookingsToCalendarEvents(shopBookings, shopKits),
    [shopBookings, shopKits, convertBookingsToCalendarEvents]
  );



  const handleCreateBooking = (data: BookingFormData) => {
    const kit = shopKits.find(k => k.id === data.kitId);
    if (kit) {
      addBooking({
        ...data,
        kitName: kit.name,
        shopId: selectedShopId,
        status: 'PENDING',
        isManual: true,
      });
      setShowBookingForm(false);
    }
  };

  const handleUpdateBooking = (bookingId: string, updates: any) => {
    updateBooking(bookingId, updates);
  };

  const handleBusinessHoursSubmit = (businessHours: BusinessHours[]) => {
    console.log('Updating business hours:', businessHours);
    // En un escenario real, aquí actualizarías el shop
    setShowBusinessHoursForm(false);
  };

  const handleCalendarEventSelect = (event: CalendarEvent) => {
    setSelectedBooking(event.resource);
    setShowBookingDetail(true);
  };

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    console.log('Selected slot:', slotInfo);
    // Aquí podrías abrir el formulario de reserva con la fecha preseleccionada
  };

  const handleCalendarViewChange = (view: ViewType, date: Date) => {
    setCalendarView(view);
    setCalendarDate(date);
  };

  const getShopCategoryText = (shop: Shop) => {
    switch (shop.id) {
      case 'ab55132c-dcc8-40d6-9ac4-5f573285f55f':
        return 'Ofertas y Descuentos • Relajación y bienestar';
      case 'cb4813f2-3bb9-48d3-ae7d-a72eb1e1f4bf':
        return 'Al mediodía • A la noche';
      case '75cdf85a-67f9-40c4-9fc1-ee1019138bec':
        return 'Al mediodía';
      default:
        return '';
    }
  };

  const tabs = [
    { id: 'calendar' as const, label: 'Calendario', icon: CalendarIcon },
    { id: 'bookings' as const, label: 'Reservas', icon: Plus },
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            {/* Logo y título */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Sistema de Reservas
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
            
            {/* Actions - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowGlobalSearch(true)}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Búsqueda</span>
              </Button>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xl:inline">Nueva Reserva</span>
                <span className="xl:hidden">Nueva</span>
              </Button>
            </div>

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

              {/* Mobile Actions */}
              <div className="px-4 py-3 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGlobalSearch(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Búsqueda Global</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowBookingForm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Reserva</span>
                </Button>
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
        {/* Estadísticas */}
        <BookingStats 
          bookings={shopBookings}
          selectedKitId={selectedKitFilter}
          selectedView={calendarView}
          currentDate={calendarDate}
          kits={shopKits}
          className="mb-4 lg:mb-8" 
        />

        {/* Content based on active tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 lg:space-y-8">
            <BookingCalendar
              events={calendarEvents}
              kits={shopKits}
              onSelectEvent={handleCalendarEventSelect}
              onSelectSlot={handleCalendarSlotSelect}
              selectedKitId={selectedKitFilter}
              onKitFilter={setSelectedKitFilter}
              onViewChange={handleCalendarViewChange}
            />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4 lg:space-y-8">
            <BookingList
              bookings={shopBookings}
              kits={shopKits}
              onUpdateBooking={handleUpdateBooking}
              onViewBooking={(booking) => {
                setSelectedBooking(booking);
                setShowBookingDetail(true);
              }}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 lg:space-y-8">
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
                      <p><span className="font-medium text-gray-900">Servicios:</span> <span className="text-gray-700">{shopKits.length} kits disponibles</span></p>
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
                        <Calendar className="w-4 h-4" />
                        <span>Configurar Horarios</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowExceptionManager(true)}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Gestionar Excepciones</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAvailabilityManager(true)}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Disponibilidad Avanzada</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      {showBookingForm && (
        <BookingForm
          kits={shopKits}
          timeSlots={mockTimeSlots.filter(slot => 
            shopKits.some(kit => kit.id === slot.kitId)
          )}
          existingBookings={shopBookings}
          onSubmit={handleCreateBooking}
          onCancel={() => setShowBookingForm(false)}
        />
      )}

      {showBusinessHoursForm && (
        <BusinessHoursForm
          initialData={selectedShop.businessHours || []}
          onSubmit={handleBusinessHoursSubmit}
          onCancel={() => setShowBusinessHoursForm(false)}
        />
      )}

      {showGlobalSearch && (
        <GlobalSearch
          kits={mockKits}
          onClose={() => setShowGlobalSearch(false)}
        />
      )}

      {showExceptionManager && (
        <ExceptionManager
          shopId={selectedShopId}
          kits={shopKits}
          onClose={() => setShowExceptionManager(false)}
        />
      )}

      {showAvailabilityManager && (
        <AvailabilityManager
          shopId={selectedShopId}
          kits={shopKits}
          onClose={() => setShowAvailabilityManager(false)}
        />
      )}

      {showBookingDetail && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          kit={shopKits.find(kit => kit.id === selectedBooking.kitId)}
          onClose={() => {
            setShowBookingDetail(false);
            setSelectedBooking(null);
          }}
          onUpdateBooking={handleUpdateBooking}
        />
      )}
    </div>
  );
}

export default App;
