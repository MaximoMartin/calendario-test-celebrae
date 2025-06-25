// ========================================
// FORMULARIO INTELIGENTE DE RESERVAS - ETAPA 4
// ========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import type { 
  Bundle, 
  Shop, 
  CreateBookingData, 
  FormValidationResult,
  BundleItem,
  BundleExtra
} from '../types/newModel';
import { useAvailability } from '../hooks/useAvailability';
import { validateBookingForm } from '../utils/bookingValidations';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Clock, Users, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface IntelligentBookingFormProps {
  shop: Shop;
  bundles: Bundle[];
  selectedBundleId?: string;
  preselectedDate?: string;
  onSubmit: (data: CreateBookingData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

export const IntelligentBookingForm: React.FC<IntelligentBookingFormProps> = ({
  shop,
  bundles,
  selectedBundleId,
  preselectedDate,
  onSubmit,
  onCancel
}) => {
  // ========================================
  // ESTADO DEL FORMULARIO
  // ========================================

  const [formData, setFormData] = useState<CreateBookingData>({
    bundleId: selectedBundleId || '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: preselectedDate || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    numberOfPeople: 1,
    itemSelections: [],
    extraSelections: [],
    notes: '',
    isManual: true
  });

  const [validationResult, setValidationResult] = useState<FormValidationResult>({
    isValid: false,
    errors: [],
    warnings: []
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    isAvailable: boolean;
    conflicts: string[];
    pricing?: { totalPrice: number };
  }>({
    checking: false,
    isAvailable: false,
    conflicts: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de disponibilidad
  const availability = useAvailability({ shop, bundles, bookings: [] });

  // ========================================
  // BUNDLE Y DATOS DERIVADOS
  // ========================================

  const selectedBundle = useMemo(() => 
    bundles.find(b => b.id === formData.bundleId), 
    [bundles, formData.bundleId]
  );

  const bundleOptions = useMemo(() => [
    { value: '', label: 'Selecciona un bundle...' },
    ...bundles.map(bundle => ({ 
      value: bundle.id, 
      label: `${bundle.name} - €${bundle.basePrice}` 
    }))
  ], [bundles]);

  // ========================================
  // INICIALIZACIÓN DE SELECCIONES DE ITEMS
  // ========================================

  useEffect(() => {
    if (selectedBundle && formData.itemSelections.length === 0) {
      const defaultSelections = selectedBundle.items.map(item => ({
        itemId: item.id,
        timeSlotId: item.timeSlots[0]?.id || '',
        numberOfPeople: formData.numberOfPeople
      }));
      
      setFormData(prev => ({
        ...prev,
        itemSelections: defaultSelections
      }));
    }
  }, [selectedBundle, formData.numberOfPeople, formData.itemSelections.length]);

  // ========================================
  // VALIDACIÓN EN TIEMPO REAL
  // ========================================

  const validateForm = useCallback(async () => {
    if (!selectedBundle || formData.itemSelections.length === 0) {
      setValidationResult({
        isValid: false,
        errors: [{ field: 'bundle', message: 'Selecciona un bundle y configura los items' }],
        warnings: []
      });
      return;
    }

    // Validación básica del formulario
    const validationErrors = validateBookingForm({
      bundleId: formData.bundleId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      date: formData.date,
      itemSelections: formData.itemSelections,
      extraSelections: formData.extraSelections || []
    }, selectedBundle, shop);

    const basicValidation: FormValidationResult = {
      isValid: validationErrors.length === 0,
      errors: validationErrors.filter(e => e.severity === 'error'),
      warnings: validationErrors.filter(e => e.severity === 'warning')
    };

    setValidationResult(basicValidation);

    // Si la validación básica es exitosa, verificar disponibilidad
    if (basicValidation.isValid) {
      setAvailabilityStatus(prev => ({ ...prev, checking: true }));
      
      try {
        const availabilityResult = await availability.checkAvailability({
          bundleId: formData.bundleId,
          date: formData.date,
          itemSelections: formData.itemSelections,
          extraSelections: formData.extraSelections || []
        });

        setAvailabilityStatus({
          checking: false,
          isAvailable: availabilityResult.isAvailable,
          conflicts: availabilityResult.conflicts.map(c => c.message),
          pricing: availabilityResult.pricing
        });
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailabilityStatus({
          checking: false,
          isAvailable: false,
          conflicts: ['Error al verificar disponibilidad']
        });
      }
    }
  }, [formData, selectedBundle, availability, shop]);

  // Ejecutar validación cuando cambian los datos del formulario
  useEffect(() => {
    const timeoutId = setTimeout(validateForm, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [validateForm]);

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  const handleInputChange = useCallback((field: keyof CreateBookingData, value: string | number | CreateBookingData['itemSelections'] | CreateBookingData['extraSelections']) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleItemTimeSlotChange = useCallback((itemId: string, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      itemSelections: prev.itemSelections.map(selection =>
        selection.itemId === itemId
          ? { ...selection, timeSlotId }
          : selection
      )
    }));
  }, []);

  const handleItemPeopleChange = useCallback((itemId: string, numberOfPeople: number) => {
    setFormData(prev => ({
      ...prev,
      itemSelections: prev.itemSelections.map(selection =>
        selection.itemId === itemId
          ? { ...selection, numberOfPeople }
          : selection
      )
    }));
  }, []);

  const handleExtraChange = useCallback((extraId: string, quantity: number) => {
    setFormData(prev => {
      const existingExtras = prev.extraSelections || [];
      const existingIndex = existingExtras.findIndex(e => e.extraId === extraId);
      
      let newExtras;
      if (quantity === 0) {
        // Remover extra
        newExtras = existingExtras.filter(e => e.extraId !== extraId);
      } else if (existingIndex >= 0) {
        // Actualizar extra existente
        newExtras = existingExtras.map(e =>
          e.extraId === extraId ? { ...e, quantity } : e
        );
      } else {
        // Agregar nuevo extra
        newExtras = [...existingExtras, { extraId, quantity }];
      }
      
      return { ...prev, extraSelections: newExtras };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationResult.isValid || !availabilityStatus.isAvailable) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        alert('✅ Reserva creada exitosamente!');
        // Reset form or redirect
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('❌ Error interno del sistema');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationResult, availabilityStatus, onSubmit]);

  // ========================================
  // COMPONENTES AUXILIARES
  // ========================================

  const ValidationStatus = () => (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        {availabilityStatus.checking ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : availabilityStatus.isAvailable && validationResult.isValid ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        <span className="font-semibold text-sm">
          {availabilityStatus.checking 
            ? 'Verificando disponibilidad...' 
            : availabilityStatus.isAvailable && validationResult.isValid
            ? 'Disponible para reservar'
            : 'No disponible'
          }
        </span>
      </div>
      
      {/* Errores */}
      {validationResult.errors.map((error, index) => (
        <div key={index} className="text-xs text-red-600 mb-1">
          • {error.message}
        </div>
      ))}
      
      {/* Conflictos de disponibilidad */}
      {availabilityStatus.conflicts.map((conflict, index) => (
        <div key={index} className="text-xs text-red-600 mb-1">
          • {conflict}
        </div>
      ))}
      
      {/* Advertencias */}
      {validationResult.warnings.map((warning, index) => (
        <div key={index} className="text-xs text-yellow-600 mb-1">
          ⚠ {warning.message}
        </div>
      ))}
      
      {/* Precio */}
      {availabilityStatus.pricing && (
        <div className="text-sm text-green-600 mt-2 font-semibold">
          💰 Total: €{availabilityStatus.pricing.totalPrice}
        </div>
      )}
    </div>
  );

  const ItemConfigurator = ({ item }: { item: BundleItem }) => {
    const selection = formData.itemSelections.find(s => s.itemId === item.id);
    
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">{item.name}</h4>
          <span className="text-sm text-gray-600">€{item.price}/persona</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Selector de horario */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Clock className="w-3 h-3 inline mr-1" />
              Horario
            </label>
            <Select
              value={selection?.timeSlotId || ''}
              onChange={(e) => handleItemTimeSlotChange(item.id, e.target.value)}
              options={[
                { value: '', label: 'Selecciona horario...' },
                ...item.timeSlots.map(slot => ({
                  value: slot.id,
                  label: `${slot.startTime} - ${slot.endTime}`
                }))
              ]}
            />
          </div>
          
          {/* Número de personas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Users className="w-3 h-3 inline mr-1" />
              Personas
            </label>
            <Input
              type="number"
              min="1"
              max={item.maxCapacity}
              value={selection?.numberOfPeople || 1}
              onChange={(e) => handleItemPeopleChange(item.id, parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    );
  };

  const ExtraSelector = ({ extra }: { extra: BundleExtra }) => {
    const selection = formData.extraSelections?.find(e => e.extraId === extra.id);
    const quantity = selection?.quantity || 0;
    
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{extra.name}</h5>
          <p className="text-xs text-gray-600">{extra.description}</p>
          <span className="text-sm text-green-600 font-semibold">€{extra.price}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExtraChange(extra.id, Math.max(0, quantity - 1))}
            disabled={quantity === 0}
            className="w-8 h-8 p-0"
          >
            -
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExtraChange(extra.id, Math.min(extra.maxQuantity, quantity + 1))}
            disabled={quantity >= extra.maxQuantity}
            className="w-8 h-8 p-0"
          >
            +
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📋 Formulario Inteligente de Reservas
          </h2>
          <p className="text-gray-600">
            Validación en tiempo real con motor de disponibilidad integrado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Bundle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Bundle / Experiencia
            </label>
            <Select
              value={formData.bundleId}
              onChange={(e) => handleInputChange('bundleId', e.target.value)}
              options={bundleOptions}
            />
          </div>

          {/* Información del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <Input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="juan@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="+34 123 456 789"
              />
            </div>
          </div>

          {/* Fecha y Personas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número total de personas
              </label>
              <Input
                type="number"
                min="1"
                max={selectedBundle?.maxCapacity || 10}
                value={formData.numberOfPeople}
                onChange={(e) => handleInputChange('numberOfPeople', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Configuración de Items */}
          {selectedBundle && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Configuración de Actividades
              </h3>
              <div className="space-y-4">
                {selectedBundle.items.map(item => (
                  <ItemConfigurator key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Extras Opcionales */}
          {selectedBundle && selectedBundle.extras.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ Extras Opcionales
              </h3>
              <div className="space-y-3">
                {selectedBundle.extras.map(extra => (
                  <ExtraSelector key={extra.id} extra={extra} />
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Comentarios especiales, alergias, preferencias..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Estado de Validación */}
          <ValidationStatus />

          {/* Botones */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={!validationResult.isValid || !availabilityStatus.isAvailable || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Creando reserva...' : 'Crear Reserva'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}; 