import React, { useState } from 'react';
import { Store, Phone, Building, X, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { useEntitiesState, type CreateShopData } from '../hooks/useEntitiesState';

// 🎯 CHECKPOINT 10: FORMULARIO PARA CREAR NUEVOS SHOPS

interface CreateShopFormProps {
  onShopCreated?: (shopId: string) => void;
  onClose?: () => void;
}

export const CreateShopForm: React.FC<CreateShopFormProps> = ({ 
  onShopCreated, 
  onClose 
}) => {
  const { createShop } = useEntitiesState();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateShopData>({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    category: '',
    subCategory: ''
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateShopData, value: string) => {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newShop = createShop(formData);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Callback de éxito
      onShopCreated?.(newShop.id);
      
      // Auto-cerrar después de mostrar éxito
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.error('Error creando shop:', error);
      setErrors({ submit: 'Error al crear el shop. Intenta nuevamente.' });
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
      subCategory: ''
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
          ¡Shop creado exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          El shop "{formData.name}" ha sido creado y ya está disponible para agregar bundles.
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mr-2"
        >
          Crear otro Shop
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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Nuevo Shop
            </h2>
            <p className="text-sm text-gray-500">
              Configura tu nuevo espacio de negocios
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
            <Building className="w-4 h-4" />
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Información de Contacto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              'Crear Shop'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 