import React, { useState, useMemo } from 'react';
import { Plus, Settings, Calendar as CalendarIcon, Search, AlertTriangle, Calendar } from 'lucide-react';
import type { BookingFormData, CalendarEvent, BusinessHours } from './types';
import { useBookings } from './hooks/useBookings';
import { mockKits, mockTimeSlots, mockShop } from './mockData';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingForm } from './components/BookingForm';
import { BookingList } from './components/BookingList';
import { BookingStats } from './components/BookingStats';
import { BusinessHoursForm } from './components/BusinessHoursForm';
import { GlobalSearch } from './components/GlobalSearch';
import { ExceptionManager } from './components/ExceptionManager';
import { AvailabilityManager } from './components/AvailabilityManager';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings' | 'settings'>('calendar');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBusinessHoursForm, setShowBusinessHoursForm] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showExceptionManager, setShowExceptionManager] = useState(false);
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [selectedKitFilter, setSelectedKitFilter] = useState<string>('all');

  const {
    bookings,
    addBooking,
    updateBooking,
    convertBookingsToCalendarEvents,
    getBookingStats,
  } = useBookings();

  // Filtrar reservas por shop (en un escenario real vendría como prop)
  const shopBookings = useMemo(() => 
    bookings.filter(booking => booking.shopId === mockShop.id),
    [bookings]
  );

  // Convertir reservas a eventos de calendario
  const calendarEvents: CalendarEvent[] = useMemo(() => 
    convertBookingsToCalendarEvents(shopBookings, mockKits),
    [shopBookings, convertBookingsToCalendarEvents]
  );

  // Estadísticas
  const stats = useMemo(() => 
    getBookingStats(mockShop.id),
    [getBookingStats]
  );

  const handleCreateBooking = (data: BookingFormData) => {
    const kit = mockKits.find(k => k.id === data.kitId);
    if (kit) {
      addBooking({
        ...data,
        kitName: kit.name,
        shopId: mockShop.id,
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
    console.log('Selected event:', event);
    // Aquí podrías abrir un modal con detalles de la reserva
  };

  const handleCalendarSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    console.log('Selected slot:', slotInfo);
    // Aquí podrías abrir el formulario de reserva con la fecha preseleccionada
  };

  const tabs = [
    { id: 'calendar' as const, label: 'Calendario', icon: CalendarIcon },
    { id: 'bookings' as const, label: 'Reservas', icon: Plus },
    { id: 'settings' as const, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema de Reservas
              </h1>
              <p className="text-gray-600 mt-1">
                {mockShop.name} - {mockShop.address}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowGlobalSearch(true)}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Búsqueda Global</span>
              </Button>
              <Button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Reserva</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <BookingStats stats={stats} className="mb-8" />

        {/* Content based on active tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-8">
            <BookingCalendar
              events={calendarEvents}
              kits={mockKits}
              onSelectEvent={handleCalendarEventSelect}
              onSelectSlot={handleCalendarSlotSelect}
              selectedKitId={selectedKitFilter}
              onKitFilter={setSelectedKitFilter}
            />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <BookingList
              bookings={shopBookings}
              kits={mockKits}
              onUpdateBooking={handleUpdateBooking}
              onViewBooking={(booking) => console.log('View booking:', booking)}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <Card title="Configuración del Negocio">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Información del Negocio
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium text-gray-900">Nombre:</span> <span className="text-gray-700">{mockShop.name}</span></p>
                      <p><span className="font-medium text-gray-900">Dirección:</span> <span className="text-gray-700">{mockShop.address}</span></p>
                      <p><span className="font-medium text-gray-900">Estado:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          mockShop.shopStatus === 'ENABLED' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mockShop.shopStatus === 'ENABLED' ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Servicios Disponibles
                    </h3>
                    <div className="space-y-2">
                      {mockKits.map(kit => (
                        <div key={kit.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{kit.name}</span>
                          <span className="text-gray-600 font-medium">€{kit.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setShowBusinessHoursForm(true)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Horarios de Atención</span>
                    </Button>
                    <Button
                      onClick={() => setShowExceptionManager(true)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Gestión de Excepciones</span>
                    </Button>
                    <Button
                      onClick={() => setShowAvailabilityManager(true)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Disponibilidad Avanzada</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BookingForm
              kits={mockKits}
              timeSlots={mockTimeSlots}
              existingBookings={shopBookings}
              onSubmit={handleCreateBooking}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}

      {showBusinessHoursForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BusinessHoursForm
              initialData={mockShop.businessHours}
              onSubmit={handleBusinessHoursSubmit}
              onCancel={() => setShowBusinessHoursForm(false)}
            />
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {showGlobalSearch && (
        <GlobalSearch
          kits={mockKits}
          onResultClick={(result) => {
            console.log('Selected search result:', result);
            setShowGlobalSearch(false);
          }}
          onClose={() => setShowGlobalSearch(false)}
        />
      )}

      {/* Exception Manager Modal */}
      {showExceptionManager && (
        <ExceptionManager
          shopId={mockShop.id}
          kits={mockKits}
          onClose={() => setShowExceptionManager(false)}
        />
      )}

      {/* Availability Manager Modal */}
      {showAvailabilityManager && (
        <AvailabilityManager
          shopId={mockShop.id}
          kits={mockKits}
          onClose={() => setShowAvailabilityManager(false)}
        />
      )}
    </div>
  );
}

export default App;
