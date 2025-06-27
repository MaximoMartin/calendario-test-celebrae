import React, { useState } from 'react';
import { Target, DollarSign, Users, X, Check, UserCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { useEntitiesState, type CreateItemData } from '../hooks/useEntitiesState';

// 🎯 CHECKPOINT 10: COMPONENTE PARA CREAR ITEMS

interface ItemCreatorProps {
  bundleId: string;
  bundleName: string;
  onItemCreated?: (itemId: string) => void;
  onClose?: () => void;
}

export const ItemCreator: React.FC<ItemCreatorProps> = ({ 
  bundleId,
  bundleName,
  onItemCreated, 
  onClose 
}) => {
  const { createItem } = useEntitiesState();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    price: 0,
    isPerGroup: false,
    maxCapacity: 1,
    duration: 60
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.title.trim()) {
      newErrors.title = 'El título del item es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'El precio no puede ser negativo';
    }
    
    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
    }
    
    if (formData.duration < 15) {
      newErrors.duration = 'La duración debe ser al menos 15 minutos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      
      const newItem = createItem(formData, bundleId);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Callback de éxito
      onItemCreated?.(newItem.id);
      
      // Auto-cerrar después de mostrar éxito
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error creando item:', error);
      setErrors({ submit: 'Error al crear el item. Intenta nuevamente.' });
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
      maxCapacity: 1,
      duration: 60
    });
    setErrors({});
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ¡Item creado exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          El item "{formData.title}" ha sido agregado al bundle "{bundleName}".
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mr-2"
        >
          Crear otro Item
        </Button>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Agregar Nuevo Item
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
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Información del Item
          </h3>
          
          <div>
            <Input
              label="Título del Item *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Masaje Relajante, BMW X3 Premium, etc."
              error={errors.title}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe detalladamente este item, qué incluye, características especiales..."
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
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Configuración de Precio
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Si está marcado, se cobra un precio fijo por grupo. Si no, se cobra por persona.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {formData.isPerGroup && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-800">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Configuración Grupal</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Este item será exclusivo por grupo (solo un grupo puede reservar este horario) y se cobrará el precio fijo independientemente del número de personas.
              </p>
            </div>
          )}
        </div>

        {/* Configuración de capacidad y tiempo */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacidad y Duración
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={formData.isPerGroup ? "Capacidad del grupo *" : "Capacidad máxima *"}
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 1)}
                placeholder="1"
                error={errors.maxCapacity}
                disabled={isSubmitting}
                helpText={formData.isPerGroup ? "Máximo de personas por grupo" : "Máximo total de personas"}
              />
            </div>

            <div>
              <Input
                label="Duración (minutos) *"
                type="number"
                min="15"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                placeholder="60"
                error={errors.duration}
                disabled={isSubmitting}
                helpText="Tiempo estimado de duración del servicio"
              />
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ Información Adicional</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Los horarios de disponibilidad se pueden configurar más tarde desde la gestión del bundle</li>
            <li>• Los items pueden ser reservados individualmente o como parte del bundle completo</li>
            <li>• El precio del item se suma al precio base del bundle</li>
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
              'Agregar Item'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 