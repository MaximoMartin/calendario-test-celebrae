import React, { useState } from 'react';
import { Plus, DollarSign, Link, X, Check, UserCheck, AlertCircle, Settings, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useEntitiesState } from '../hooks/useEntitiesState';
import type { CreateExtraData } from '../hooks/types';

interface ExtraCreatorProps {
  bundleId: string;
  bundleName: string;
  availableItems?: Array<{ id: string; title: string }>; // Items del bundle para relaciones condicionales
  onExtraCreated?: (extraId: string) => void;
  onClose?: () => void;
}

export const ExtraCreator: React.FC<ExtraCreatorProps> = ({ 
  bundleId,
  bundleName,
  availableItems = [],
  onExtraCreated, 
  onClose 
}) => {
  const { createExtra } = useEntitiesState();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateExtraData>({
    title: '',
    description: '',
    price: 0,
    isPerGroup: false,
    isForAdult: false,
    maxQuantity: 5,
    isRequired: false,
    requiredItemId: undefined,
    order: 1,
    defaultQuantity: 1,
    isActive: true
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.title.trim()) {
      newErrors.title = 'El título del extra es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }
    
    if (formData.maxQuantity && formData.maxQuantity < 1) {
      newErrors.maxQuantity = 'La cantidad máxima debe ser al menos 1';
    }

    if (formData.defaultQuantity && formData.defaultQuantity < 0) {
      newErrors.defaultQuantity = 'La cantidad por defecto no puede ser negativa';
    }

    if (formData.defaultQuantity && formData.maxQuantity && formData.defaultQuantity > formData.maxQuantity) {
      newErrors.defaultQuantity = 'La cantidad por defecto no puede ser mayor que la máxima';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateExtraData, value: any) => {
    setFormData((prev: CreateExtraData) => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular delay de creación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newExtra = createExtra(formData, bundleId);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Callback de éxito
      onExtraCreated?.(newExtra.id);
      
      // Auto-cerrar después de mostrar éxito
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error creando extra:', error);
      setErrors({ submit: 'Error al crear el extra. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      isPerGroup: false,
      isForAdult: false,
      maxQuantity: 5,
      isRequired: false,
      requiredItemId: undefined,
      order: 1,
      defaultQuantity: 1,
      isActive: true
    });
    setErrors({});
    setShowSuccess(false);
    setShowAdvancedConfig(false);
  };

  if (showSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Extra creado exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          El extra "{formData.title}" ha sido agregado al bundle "{bundleName}".
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mr-2"
        >
          Crear otro Extra
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
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Nuevo Extra
              </h2>
              <p className="text-sm text-gray-500">
                Al bundle: {bundleName}
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
              <Plus className="w-5 h-5" />
              Información del Extra
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Título del Extra *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: GPS, Aromaterapia, Postres, etc."
                  error={errors.title}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Input
                  label="Orden de visualización"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  disabled={isSubmitting}
                  helpText="Orden en que aparecerá en la lista"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe este extra, qué incluye, beneficios adicionales..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Configuración de precio */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Configuración de Precio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Precio *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  error={errors.price}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPerGroup}
                    onChange={(e) => handleInputChange('isPerGroup', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Precio por grupo completo
                    </span>
                    <p className="text-xs text-gray-500">
                      Si está marcado, se cobra un precio fijo por grupo. Si no, se cobra por cantidad.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {formData.isPerGroup && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-blue-800">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Extra Grupal</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Este extra se cobrará una vez por grupo, independientemente del número de personas.
                </p>
              </div>
            )}
          </div>

          {/* Configuración de cantidad */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Configuración de Cantidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Cantidad máxima"
                  type="number"
                  min="1"
                  value={formData.maxQuantity || ''}
                  onChange={(e) => handleInputChange('maxQuantity', parseInt(e.target.value) || undefined)}
                  placeholder="5"
                  error={errors.maxQuantity}
                  disabled={isSubmitting || formData.isPerGroup}
                  helpText={formData.isPerGroup ? "No aplica para extras grupales" : "Máximo que se puede seleccionar"}
                />
              </div>

              <div>
                <Input
                  label="Cantidad por defecto"
                  type="number"
                  min="0"
                  value={formData.defaultQuantity || ''}
                  onChange={(e) => handleInputChange('defaultQuantity', parseInt(e.target.value) || undefined)}
                  placeholder="1"
                  error={errors.defaultQuantity}
                  disabled={isSubmitting}
                  helpText="Cantidad que se selecciona automáticamente"
                />
              </div>
            </div>
          </div>

          {/* Configuración de reservas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Reservas
              </h3>
              <Button
                type="button"
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                variant="outline"
                size="sm"
              >
                {showAdvancedConfig ? 'Ocultar' : 'Mostrar'} Configuración Avanzada
              </Button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isForAdult}
                  onChange={(e) => handleInputChange('isForAdult', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">
                  Solo para adultos (18+ años)
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Extra obligatorio
                  </span>
                  <p className="text-xs text-gray-500">
                    Se incluirá automáticamente en todas las reservas
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Extra activo
                  </span>
                  <p className="text-xs text-gray-500">
                    Si está desactivado, no aparecerá en las opciones de reserva
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Relaciones condicionales */}
          {availableItems.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Link className="w-5 h-5" />
                Relaciones Condicionales
              </h3>
              
              <div>
                <Select
                  label="Requiere item específico"
                  value={formData.requiredItemId || ''}
                  onChange={(e) => handleInputChange('requiredItemId', e.target.value || undefined)}
                  disabled={isSubmitting}
                  options={[
                    { value: '', label: 'No requerido - Disponible siempre' },
                    ...availableItems.map(item => ({
                      value: item.id,
                      label: item.title
                    }))
                  ]}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si seleccionas un item, este extra solo estará disponible cuando se reserve ese item específico
                </p>
              </div>

              {formData.requiredItemId && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Extra Condicional</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Este extra solo aparecerá como opción cuando el cliente seleccione el item "{availableItems.find(item => item.id === formData.requiredItemId)?.title}".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ Información sobre Extras</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Los extras complementan los items principales del bundle</li>
              <li>• Se pueden seleccionar opcionalmente durante la reserva</li>
              <li>• Los extras obligatorios se incluyen automáticamente</li>
              <li>• Los extras condicionales solo aparecen con items específicos</li>
              <li>• Los extras grupales se cobran una vez por grupo completo</li>
            </ul>
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
                  Creando...
                </div>
              ) : (
                'Agregar Extra'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 