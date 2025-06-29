import React, { useState, useEffect } from 'react';
import { Store, Phone, Building, X, Check, Clock, Plus, AlertCircle, Settings, MapPin, Mail, Users, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useEntitiesState, type CreateShopData } from '../hooks/useEntitiesState';
import type { Shop, BusinessHours } from '../types';

interface ShopFormData extends CreateShopData {
  shopStatus: 'ENABLED' | 'DISABLED';
  businessHours: BusinessHours;
  maxCapacity: number;
  advanceBookingDays: number;
  cancellationPolicy: string;
  refundPolicy: string;
  allowInstantBooking: boolean;
  requiresApproval: boolean;
}

interface ShopFormProps {
  shopToEdit?: Shop | null;
  onShopCreated?: (shopId: string) => void;
  onShopUpdated?: (shopId: string) => void;
  onClose?: () => void;
}

interface TimeRange {
  from: string;
  to: string;
}

const DAYS_CONFIG: Array<{ dayName: keyof BusinessHours; displayName: string }> = [
  { dayName: 'monday', displayName: 'Lunes' },
  { dayName: 'tuesday', displayName: 'Martes' },
  { dayName: 'wednesday', displayName: 'Miércoles' },
  { dayName: 'thursday', displayName: 'Jueves' },
  { dayName: 'friday', displayName: 'Viernes' },
  { dayName: 'saturday', displayName: 'Sábado' },
  { dayName: 'sunday', displayName: 'Domingo' }
];

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { openRanges: [{ from: '09:00', to: '17:00' }] },
  tuesday: { openRanges: [{ from: '09:00', to: '17:00' }] },
  wednesday: { openRanges: [{ from: '09:00', to: '17:00' }] },
  thursday: { openRanges: [{ from: '09:00', to: '17:00' }] },
  friday: { openRanges: [{ from: '09:00', to: '17:00' }] },
  saturday: { openRanges: [{ from: '10:00', to: '14:00' }] },
  sunday: { openRanges: [] }
};

export const CreateShopForm: React.FC<ShopFormProps> = ({ 
  shopToEdit,
  onShopCreated, 
  onShopUpdated,
  onClose 
}) => {
  const { createShop, updateShop, updateShopBusinessHours } = useEntitiesState();
  const isEditing = !!shopToEdit;
  
  // Estado del formulario
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    category: '',
    subCategory: '',
    shopStatus: 'ENABLED',
    businessHours: DEFAULT_BUSINESS_HOURS,
    maxCapacity: 20,
    advanceBookingDays: 30,
    cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes',
    refundPolicy: 'Reembolso total hasta 24 horas antes',
    allowInstantBooking: true,
    requiresApproval: false
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessHoursErrors, setBusinessHoursErrors] = useState<Record<string, string[]>>({});

  // Cargar datos del shop a editar
  useEffect(() => {
    if (shopToEdit) {
      setFormData({
        name: shopToEdit.name,
        address: shopToEdit.address,
        description: shopToEdit.description || '',
        phone: shopToEdit.phone || '',
        email: shopToEdit.email || '',
        category: shopToEdit.category || '',
        subCategory: shopToEdit.subCategory || '',
        shopStatus: shopToEdit.shopStatus,
        businessHours: shopToEdit.businessHours,
        maxCapacity: shopToEdit.maxCapacity || 20,
        advanceBookingDays: shopToEdit.advanceBookingDays || 30,
        cancellationPolicy: shopToEdit.cancellationPolicy || 'Cancelación gratuita hasta 24 horas antes',
        refundPolicy: shopToEdit.refundPolicy || 'Reembolso total hasta 24 horas antes',
        allowInstantBooking: shopToEdit.allowInstantBooking !== false,
        requiresApproval: shopToEdit.requiresApproval || false
      });
    }
  }, [shopToEdit]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del shop es obligatorio';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = 'La capacidad máxima debe ser al menos 1';
    }

    if (formData.advanceBookingDays < 0) {
      newErrors.advanceBookingDays = 'Los días de anticipación no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar horarios de atención
  const validateBusinessHours = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    DAYS_CONFIG.forEach(({ dayName }) => {
      const dayErrors: string[] = [];
      const ranges = formData.businessHours[dayName].openRanges;

      ranges.forEach((range, index) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(range.from)) {
          dayErrors.push(`Rango ${index + 1}: Hora de inicio inválida`);
        }
        if (!timeRegex.test(range.to)) {
          dayErrors.push(`Rango ${index + 1}: Hora de fin inválida`);
        }

        if (range.from >= range.to) {
          dayErrors.push(`Rango ${index + 1}: La hora de inicio debe ser antes que la de fin`);
        }
      });

      for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
          const range1 = ranges[i];
          const range2 = ranges[j];
          
          if ((range1.from < range2.to && range1.to > range2.from)) {
            dayErrors.push(`Los rangos ${i + 1} y ${j + 1} se solapan`);
          }
        }
      }

      if (dayErrors.length > 0) {
        newErrors[dayName] = dayErrors;
        isValid = false;
      }
    });

    setBusinessHoursErrors(newErrors);
    return isValid;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof ShopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar cambios en horarios de atención
  const updateDayRanges = (dayName: keyof BusinessHours, ranges: TimeRange[]) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [dayName]: { openRanges: ranges }
      }
    }));
    
    // Limpiar errores del día
    setBusinessHoursErrors(prev => ({
      ...prev,
      [dayName]: []
    }));
  };

  const addTimeRange = (dayName: keyof BusinessHours) => {
    const currentRanges = formData.businessHours[dayName].openRanges;
    const newRange: TimeRange = { from: '09:00', to: '17:00' };
    updateDayRanges(dayName, [...currentRanges, newRange]);
  };

  const removeTimeRange = (dayName: keyof BusinessHours, index: number) => {
    const currentRanges = formData.businessHours[dayName].openRanges;
    const newRanges = currentRanges.filter((_, i) => i !== index);
    updateDayRanges(dayName, newRanges);
  };

  const updateTimeRange = (
    dayName: keyof BusinessHours,
    index: number,
    field: 'from' | 'to',
    value: string
  ) => {
    const currentRanges = [...formData.businessHours[dayName].openRanges];
    currentRanges[index] = { ...currentRanges[index], [field]: value };
    updateDayRanges(dayName, currentRanges);
  };

  // Plantillas rápidas de horarios
  const applyTemplate = (template: 'normal' | 'weekend' | 'always' | 'closed') => {
    let newBusinessHours: BusinessHours = { ...formData.businessHours };

    switch (template) {
      case 'normal':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newBusinessHours[day as keyof BusinessHours] = {
            openRanges: [{ from: '09:00', to: '17:00' }]
          };
        });
        newBusinessHours.saturday = { openRanges: [{ from: '10:00', to: '14:00' }] };
        newBusinessHours.sunday = { openRanges: [] };
        break;
      
      case 'weekend':
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newBusinessHours[day as keyof BusinessHours] = { openRanges: [] };
        });
        newBusinessHours.saturday = { openRanges: [{ from: '10:00', to: '20:00' }] };
        newBusinessHours.sunday = { openRanges: [{ from: '10:00', to: '18:00' }] };
        break;
      
      case 'always':
        DAYS_CONFIG.forEach(({ dayName }) => {
          newBusinessHours[dayName] = { openRanges: [{ from: '00:00', to: '23:59' }] };
        });
        break;
      
      case 'closed':
        DAYS_CONFIG.forEach(({ dayName }) => {
          newBusinessHours[dayName] = { openRanges: [] };
        });
        break;
    }

    setFormData(prev => ({ ...prev, businessHours: newBusinessHours }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !validateBusinessHours()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing && shopToEdit) {
        // Actualizar shop existente
        updateShop(shopToEdit.id, {
          name: formData.name,
          address: formData.address,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          category: formData.category,
          subCategory: formData.subCategory,
          businessHours: formData.businessHours,
          maxCapacity: formData.maxCapacity,
          advanceBookingDays: formData.advanceBookingDays,
          cancellationPolicy: formData.cancellationPolicy,
          refundPolicy: formData.refundPolicy,
          allowInstantBooking: formData.allowInstantBooking,
          requiresApproval: formData.requiresApproval
        });
        onShopUpdated?.(shopToEdit.id);
      } else {
        // Crear nuevo shop
        const newShop = createShop({
          name: formData.name,
          address: formData.address,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          category: formData.category,
          subCategory: formData.subCategory,
          businessHours: formData.businessHours,
          maxCapacity: formData.maxCapacity,
          advanceBookingDays: formData.advanceBookingDays,
          cancellationPolicy: formData.cancellationPolicy,
          refundPolicy: formData.refundPolicy,
          allowInstantBooking: formData.allowInstantBooking,
          requiresApproval: formData.requiresApproval
        });
        onShopCreated?.(newShop.id);
      }
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Auto-cerrar después de mostrar éxito
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.error('Error procesando shop:', error);
      setErrors({ submit: 'Error al procesar el shop. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      description: '',
      phone: '',
      email: '',
      category: '',
      subCategory: '',
      shopStatus: 'ENABLED',
      businessHours: DEFAULT_BUSINESS_HOURS,
      maxCapacity: 20,
      advanceBookingDays: 30,
      cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes',
      refundPolicy: 'Reembolso total hasta 24 horas antes',
      allowInstantBooking: true,
      requiresApproval: false
    });
    setErrors({});
    setBusinessHoursErrors({});
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡{isEditing ? 'Shop actualizado' : 'Shop creado'} exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          El shop "{formData.name}" ha sido {isEditing ? 'actualizado' : 'creado'} y ya está disponible.
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mr-2"
        >
          {isEditing ? 'Editar otro Shop' : 'Crear otro Shop'}
        </Button>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Shop' : 'Crear Nuevo Shop'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Modifica la configuración de tu negocio' : 'Configura tu nuevo espacio de negocios'}
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Información básica */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Nombre del Shop *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Mi Café Especial"
                  error={errors.name}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Categoría"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Ej: Gastronomía, Servicios, etc."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Input
                label="Dirección *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ej: Av. Principal 123, Ciudad"
                error={errors.address}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu negocio y lo que ofreces..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Teléfono *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+54 351 123-4567"
                  error={errors.phone}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@mitienda.com"
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Input
                label="Subcategoría"
                value={formData.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                placeholder="Ej: Café Gourmet, Spa Premium, etc."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Configuración de reservas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Configuración de Reservas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Capacidad máxima *"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 1)}
                  placeholder="20"
                  error={errors.maxCapacity}
                  disabled={isSubmitting}
                  helpText="Máximo de personas por reserva"
                />
              </div>
              
              <div>
                <Input
                  label="Días de anticipación"
                  type="number"
                  min="0"
                  value={formData.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value) || 0)}
                  placeholder="30"
                  error={errors.advanceBookingDays}
                  disabled={isSubmitting}
                  helpText="Con cuánta anticipación se pueden hacer reservas"
                />
              </div>

              <div>
                <Select
                  label="Estado del Shop"
                  value={formData.shopStatus}
                  onChange={(e) => handleInputChange('shopStatus', e.target.value as 'ENABLED' | 'DISABLED')}
                  disabled={isSubmitting}
                  options={[
                    { value: 'ENABLED', label: 'Habilitado' },
                    { value: 'DISABLED', label: 'Deshabilitado' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Política de cancelación"
                  value={formData.cancellationPolicy}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                  placeholder="Ej: Cancelación gratuita hasta 24 horas antes"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Política de reembolso"
                  value={formData.refundPolicy}
                  onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                  placeholder="Ej: Reembolso total hasta 24 horas antes"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowInstantBooking}
                  onChange={(e) => handleInputChange('allowInstantBooking', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">
                  Permitir reservas instantáneas (sin aprobación manual)
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">
                  Requerir aprobación manual para todas las reservas
                </span>
              </label>
            </div>
          </div>

          {/* Horarios de atención */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horarios de Atención
              </h3>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => applyTemplate('normal')}
                  variant="outline"
                  size="sm"
                >
                  Horario Normal
                </Button>
                <Button
                  type="button"
                  onClick={() => applyTemplate('weekend')}
                  variant="outline"
                  size="sm"
                >
                  Solo Fines de Semana
                </Button>
                <Button
                  type="button"
                  onClick={() => applyTemplate('always')}
                  variant="outline"
                  size="sm"
                >
                  Siempre Abierto
                </Button>
                <Button
                  type="button"
                  onClick={() => applyTemplate('closed')}
                  variant="outline"
                  size="sm"
                >
                  Siempre Cerrado
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {DAYS_CONFIG.map(({ dayName, displayName }) => {
                const dayRanges = formData.businessHours[dayName].openRanges;
                const dayErrors = businessHoursErrors[dayName] || [];
                
                return (
                  <Card key={dayName} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {displayName}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => addTimeRange(dayName)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Horario
                      </Button>
                    </div>

                    {dayRanges.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p>Cerrado este día</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayRanges.map((range, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Input
                              type="time"
                              value={range.from}
                              onChange={(e) => updateTimeRange(dayName, index, 'from', e.target.value)}
                              disabled={isSubmitting}
                              className="w-32"
                            />
                            <span className="text-gray-500">a</span>
                            <Input
                              type="time"
                              value={range.to}
                              onChange={(e) => updateTimeRange(dayName, index, 'to', e.target.value)}
                              disabled={isSubmitting}
                              className="w-32"
                            />
                            <Button
                              type="button"
                              onClick={() => removeTimeRange(dayName, index)}
                              variant="outline"
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {dayErrors.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-800 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Errores:</span>
                        </div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {dayErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                isEditing ? 'Actualizar Shop' : 'Crear Shop'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 