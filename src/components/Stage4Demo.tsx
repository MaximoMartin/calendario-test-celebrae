// ========================================
// DEMO COMPLETO ETAPA 4 - FORMULARIOS INTELIGENTES
// ========================================

import React, { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CreateBookingData } from '../types/newModel';
import { sampleShop, sampleBundles, sampleBookings } from '../mockData/newModel';
import { IntelligentBookingForm } from './IntelligentBookingForm';
import { useIntelligentBookings } from '../hooks/useIntelligentBookings';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Calendar, Plus, Users, Clock, Euro, CheckCircle, AlertTriangle } from 'lucide-react';

export const Stage4Demo: React.FC = () => {
  // ========================================
  // ESTADO PRINCIPAL
  // ========================================

  const [activeView, setActiveView] = useState<'overview' | 'create' | 'bookings'>('overview');

  // Hook para gestión de reservas
  const bookingManager = useIntelligentBookings(sampleShop, sampleBundles, sampleBookings);

  // ========================================
  // ESTADÍSTICAS CALCULADAS
  // ========================================

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const bookingsToday = bookingManager.getBookingsByDate(today);
    
    const totalBookings = bookingManager.bookings.length;
    const pendingBookings = bookingManager.bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookingManager.bookings.filter(b => b.status === 'CONFIRMED').length;
    
    const totalRevenue = bookingManager.bookings.reduce((sum, booking) => 
      sum + booking.pricing.totalAmount, 0
    );

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      bookingsToday: bookingsToday.length
    };
  }, [bookingManager]);

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  const handleCreateBooking = async (data: CreateBookingData) => {
    const result = await bookingManager.createBooking(data);
    
    if (result.success) {
      setActiveView('bookings');
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED' | 'PARTIAL_REFUND') => {
    const success = await bookingManager.updateBookingStatus(bookingId, newStatus);
    if (!success) {
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      const success = await bookingManager.deleteBooking(bookingId);
      if (!success) {
        alert('Error al eliminar la reserva');
      }
    }
  };

  // ========================================
  // COMPONENTES AUXILIARES
  // ========================================

  const StatsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Reservas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Hoy</p>
            <p className="text-2xl font-bold text-purple-600">{stats.bookingsToday}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Ingresos</p>
            <p className="text-2xl font-bold text-green-600">€{stats.totalRevenue}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const BookingsList = () => (
    <Card>
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">📋 Gestión de Reservas</h3>
        <p className="text-gray-600">Lista de todas las reservas con acciones rápidas</p>
      </div>
      <div className="p-6">
        {bookingManager.bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay reservas aún</p>
            <Button 
              onClick={() => setActiveView('create')}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear primera reserva
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingManager.bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Bundle:</strong> {booking.bundleName}</p>
                      <p><strong>Fecha:</strong> {format(new Date(booking.date), 'dd/MM/yyyy', { locale: es })}</p>
                      <p><strong>Email:</strong> {booking.customerEmail}</p>
                      <p><strong>Total:</strong> €{booking.pricing.totalAmount}</p>
                    </div>

                    {/* Detalle de Items */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Actividades:</p>
                      <div className="space-y-1">
                        {booking.itemBookings.map((item) => (
                          <div key={item.id} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                            <span className="font-medium">{item.itemName}</span>
                            <span className="mx-2">•</span>
                            <span>{item.startTime} - {item.endTime}</span>
                            <span className="mx-2">•</span>
                            <span>{item.numberOfPeople} personas</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Extras */}
                    {booking.extraBookings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Extras:</p>
                        <div className="space-y-1">
                          {booking.extraBookings.map((extra) => (
                            <div key={extra.id} className="text-xs text-gray-600">
                              {extra.extraName} x{extra.quantity} (€{extra.unitPrice * extra.quantity})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === 'PENDING' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Confirmar
                      </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Completar
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Etapa 4: Formularios Inteligentes
        </h2>
        <p className="text-gray-700 mb-4">
          Sistema completo de formularios con validación en tiempo real, motor de disponibilidad integrado y gestión avanzada de reservas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-900 mb-2">✨ Características Principales</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Validación en tiempo real de formularios</li>
              <li>• Verificación automática de disponibilidad</li>
              <li>• Configuración granular por item</li>
              <li>• Cálculo dinámico de precios</li>
              <li>• Gestión inteligente de recursos</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 Funcionalidades Nuevas</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Formulario inteligente adaptativo</li>
              <li>• Hook de gestión de reservas mejorado</li>
              <li>• Interfaces TypeScript completas</li>
              <li>• Validaciones robustas de negocio</li>
              <li>• Estado de carga y errores</li>
            </ul>
          </div>
        </div>
      </div>

      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Próximas Acciones
          </h3>
          <div className="space-y-3">
            <Button 
              onClick={() => setActiveView('create')} 
              className="w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Nueva Reserva
            </Button>
            <Button 
              onClick={() => setActiveView('bookings')} 
              variant="outline"
              className="w-full justify-start"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Ver Todas las Reservas
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Estado del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Motor de Disponibilidad</span>
              <span className="text-sm text-green-600 font-medium">✅ Activo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Validaciones</span>
              <span className="text-sm text-green-600 font-medium">✅ Operando</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Gestión de Recursos</span>
              <span className="text-sm text-green-600 font-medium">✅ Funcionando</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Formularios Inteligentes</span>
              <span className="text-sm text-green-600 font-medium">✅ Listos</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">
              📋 Etapa 4: Formularios Inteligentes
            </h1>
            
            <nav className="flex space-x-4">
              <Button
                variant={activeView === 'overview' ? 'primary' : 'outline'}
                onClick={() => setActiveView('overview')}
                size="sm"
              >
                Resumen
              </Button>
              <Button
                variant={activeView === 'create' ? 'primary' : 'outline'}
                onClick={() => setActiveView('create')}
                size="sm"
              >
                Crear Reserva
              </Button>
              <Button
                variant={activeView === 'bookings' ? 'primary' : 'outline'}
                onClick={() => setActiveView('bookings')}
                size="sm"
              >
                Gestionar Reservas
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookingManager.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Procesando...</span>
            </div>
          </div>
        )}

        {bookingManager.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{bookingManager.error}</span>
            </div>
          </div>
        )}

        {activeView === 'overview' && <OverviewContent />}
        
        {activeView === 'create' && (
          <IntelligentBookingForm
            shop={sampleShop}
            bundles={sampleBundles}
            selectedBundleId={sampleBundles[0]?.id}
            preselectedDate={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
            onSubmit={handleCreateBooking}
            onCancel={() => setActiveView('overview')}
          />
        )}
        
        {activeView === 'bookings' && <BookingsList />}
      </main>
    </div>
  );
}; 