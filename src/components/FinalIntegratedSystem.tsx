// ========================================
// SISTEMA INTEGRADO FINAL - ETAPA 5
// ========================================

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Shop, Bundle, Booking, User } from '../types/newModel';

// Importar todos los componentes desarrollados
import { AdvancedDashboard } from './AdvancedDashboard';
import { NewBookingCalendar } from './NewBookingCalendar';
import { IntelligentBookingForm } from './IntelligentBookingForm';
import { Stage4Demo } from './Stage4Demo';
import { BookingList } from './BookingList';
import { BookingStats } from './BookingStats';
import { GlobalSearch } from './GlobalSearch';
import { AvailabilityManager } from './AvailabilityManager';
import { BusinessHoursForm } from './BusinessHoursForm';
import { ExceptionManager } from './ExceptionManager';

// Importar hooks personalizados
import { useIntelligentBookings } from '../hooks/useIntelligentBookings';
import { useAvailability } from '../hooks/useAvailability';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

// Importar datos mock
import { mockShop, mockBundle, mockBookings, mockUser } from '../mockData/newModel';

// Componentes UI
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  Search, 
  List, 
  Settings, 
  BarChart3,
  Clock,
  Shield,
  Users,
  MapPin,
  Target
} from 'lucide-react';

type ActiveView = 
  | 'dashboard' 
  | 'calendar' 
  | 'create-booking' 
  | 'bookings-list' 
  | 'analytics' 
  | 'search'
  | 'availability'
  | 'business-hours'
  | 'exceptions'
  | 'stats';

interface NavigationItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: number;
}

export const FinalIntegratedSystem: React.FC = () => {
  // ========================================
  // ESTADO PRINCIPAL
  // ========================================

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedShop] = useState<Shop>(mockShop);
  const [user] = useState<User>(mockUser);
  const [loading, setLoading] = useState(false);
  
  // Crear array de bundles desde el mock
  const bundles = [mockBundle];

  // ========================================
  // HOOKS PERSONALIZADOS
  // ========================================

  const {
    bookings,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    rescheduleBooking
  } = useIntelligentBookings(selectedShop, bundles);

  const {
    checkAvailability,
    getAvailableSlots,
    isChecking: availabilityLoading
  } = useAvailability({ shop: selectedShop, bundles, bookings });

  const {
    searchResults,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    isSearching
  } = useGlobalSearch();

  // ========================================
  // MÉTRICAS Y ESTADÍSTICAS
  // ========================================

  const systemMetrics = useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0);
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const todayBookings = bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).length;
    const uniqueCustomers = new Set(bookings.map(b => b.customerEmail)).size;

    return {
      totalBookings,
      totalRevenue,
      pendingBookings,
      confirmedBookings,
      todayBookings,
      uniqueCustomers,
      activeBundles: bundles.filter(b => b.isActive).length,
      totalResources: bundles.reduce((sum, bundle) => sum + bundle.items.length, 0)
    };
  }, [bookings, bundles]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleCreateBooking = async (bookingData: any) => {
    try {
      const result = await createBooking(bookingData);
      if (result.success) {
        setActiveView('dashboard');
        // Mostrar notificación de éxito
      }
      return result;
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'Error interno del sistema' };
    }
  };

  const handleNavigateToBooking = (bookingId: string) => {
    // Navegar al detalle de la reserva
    setActiveView('bookings-list');
    // TODO: Implementar navegación específica al booking
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    // TODO: Implementar exportación de datos
    console.log(`Exporting data as ${format}`);
  };

  // ========================================
  // CONFIGURACIÓN DE NAVEGACIÓN
  // ========================================

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Vista general del negocio'
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      description: 'Vista de calendario inteligente',
      badge: systemMetrics.todayBookings
    },
    {
      id: 'create-booking',
      label: 'Nueva Reserva',
      icon: Plus,
      description: 'Crear nueva reserva'
    },
    {
      id: 'bookings-list',
      label: 'Lista de Reservas',
      icon: List,
      description: 'Gestionar todas las reservas',
      badge: systemMetrics.pendingBookings
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Métricas avanzadas'
    },
    {
      id: 'search',
      label: 'Búsqueda Global',
      icon: Search,
      description: 'Buscar en todo el sistema'
    },
    {
      id: 'availability',
      label: 'Disponibilidad',
      icon: Clock,
      description: 'Gestión de disponibilidad'
    },
    {
      id: 'business-hours',
      label: 'Horarios',
      icon: Settings,
      description: 'Configurar horarios de atención'
    },
    {
      id: 'exceptions',
      label: 'Excepciones',
      icon: Shield,
      description: 'Gestionar días especiales'
    },
    {
      id: 'stats',
      label: 'Estadísticas',
      icon: Target,
      description: 'Estadísticas generales'
    }
  ];

  // ========================================
  // RENDERIZADO DE VISTAS
  // ========================================

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <AdvancedDashboard
            shop={selectedShop}
            bundles={bundles}
            bookings={bookings}
            onNavigateToBooking={handleNavigateToBooking}
            onCreateBooking={() => setActiveView('create-booking')}
            onExportData={handleExportData}
          />
        );

      case 'calendar':
        return (
          <NewBookingCalendar
            bundles={bundles}
            bookings={bookings}
            onSelectSlot={(slotInfo) => {
              // TODO: Pre-llenar formulario con fecha/hora
              setActiveView('create-booking');
            }}
            onEventClick={(event) => handleNavigateToBooking(event.resource.data.booking.id)}
            onCreateBooking={() => setActiveView('create-booking')}
          />
        );

      case 'create-booking':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">🎯 Crear Nueva Reserva</h1>
              <p className="text-gray-600">Sistema inteligente con validación en tiempo real</p>
            </div>
            
            <IntelligentBookingForm
              bundles={bundles}
              onSubmit={handleCreateBooking}
              onCancel={() => setActiveView('dashboard')}
            />
          </div>
        );

      case 'bookings-list':
        return (
          <Stage4Demo />
        );

      case 'analytics':
        return (
          <AdvancedDashboard
            shop={selectedShop}
            bundles={bundles}
            bookings={bookings}
            onNavigateToBooking={handleNavigateToBooking}
            onCreateBooking={() => setActiveView('create-booking')}
            onExportData={handleExportData}
          />
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">🔍 Búsqueda Global</h1>
              <p className="text-sm text-gray-500">
                {searchResults.length} resultados
              </p>
            </div>
            
            <GlobalSearch
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              searchResults={searchResults}
              isSearching={isSearching}
              onBookingClick={handleNavigateToBooking}
              onBundleClick={(bundleId) => console.log('Navigate to bundle:', bundleId)}
              onCustomerClick={(email) => console.log('Navigate to customer:', email)}
            />
          </div>
        );

      case 'availability':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">⏰ Gestión de Disponibilidad</h1>
              <p className="text-gray-600">Configurar disponibilidad de recursos y servicios</p>
            </div>
            
            <AvailabilityManager
              shop={selectedShop}
              bundles={bundles}
              bookings={bookings}
              onUpdateAvailability={(bundleId, availability) => {
                console.log('Update availability:', bundleId, availability);
              }}
            />
          </div>
        );

      case 'business-hours':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">⏰ Horarios de Atención</h1>
              <p className="text-gray-600">Configurar horarios de funcionamiento del negocio</p>
            </div>
            
            <BusinessHoursForm
              shop={selectedShop}
              onSave={(hours) => {
                console.log('Save business hours:', hours);
              }}
            />
          </div>
        );

      case 'exceptions':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">🛡️ Gestión de Excepciones</h1>
              <p className="text-gray-600">Configurar días especiales, cierres y eventos</p>
            </div>
            
            <ExceptionManager
              shop={selectedShop}
              onAddException={(exception) => {
                console.log('Add exception:', exception);
              }}
              onRemoveException={(exceptionId) => {
                console.log('Remove exception:', exceptionId);
              }}
            />
          </div>
        );

      case 'stats':
        return (
          <BookingStats
            bookings={mockBookings || []}
            bundles={bundles}
            shop={selectedShop}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vista no implementada
            </h2>
            <p className="text-gray-600">
              La vista "{activeView}" está en desarrollo
            </p>
          </div>
        );
    }
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del sistema */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Sistema de Reservas
                  </h1>
                  <p className="text-xs text-gray-500">Etapa 5 - Integración Final</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{selectedShop.name}</p>
                <p className="text-xs text-gray-500">{user.name}</p>
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
          {/* Sidebar de navegación */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Navegación Principal
                </h3>
                
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Métricas rápidas */}
            <Card className="p-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Resumen Rápido
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reservas</span>
                  <span className="font-semibold text-gray-900">{systemMetrics.totalBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hoy</span>
                  <span className="font-semibold text-blue-600">{systemMetrics.todayBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pendientes</span>
                  <span className="font-semibold text-yellow-600">{systemMetrics.pendingBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirmadas</span>
                  <span className="font-semibold text-green-600">{systemMetrics.confirmedBookings}</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Clientes</span>
                  <span className="font-semibold text-gray-900">{systemMetrics.uniqueCustomers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bundles Activos</span>
                  <span className="font-semibold text-gray-900">{systemMetrics.activeBundles}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="col-span-12 lg:col-span-9">
            {loading || availabilityLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
              </Card>
            ) : (
              renderActiveView()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 