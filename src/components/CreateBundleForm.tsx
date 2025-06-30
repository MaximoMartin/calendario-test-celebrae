import React, { useState } from 'react';
import { Package, DollarSign, Settings, X, Check, Tag, Image, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { useEntitiesState } from '../hooks/useEntitiesState';
import type { CreateBundleData } from '../hooks/types';

interface CreateBundleFormProps {
  shopId: string;
  shopName: string;
  onBundleCreated?: (bundleId: string) => void;
  onClose?: () => void;
}

export const CreateBundleForm: React.FC<CreateBundleFormProps> = ({ 
  shopId,
  shopName,
  onBundleCreated, 
  onClose 
}) => {
  const { createBundle } = useEntitiesState();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateBundleData>({
    name: '',
    description: '',
    shortDescription: '',
    basePrice: 0,
    maxCapacity: 1,
    duration: 60,
    allowInstantBooking: true,
    requiresApproval: false,
    cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes',
    refundPolicy: 'Reembolso total hasta 24 horas antes',
    tags: [],
    isFeatured: false,
    order: 1,
    imageUrls: []
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del bundle es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (formData.basePrice < 0) {
      newErrors.basePrice = 'El precio base no puede ser negativo';
    }
    
    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
    }
    
    if (formData.duration < 15) {
      newErrors.duration = 'La duración debe ser al menos 15 minutos';
    }

    if (!formData.cancellationPolicy.trim()) {
      newErrors.cancellationPolicy = 'La política de cancelación es obligatoria';
    }

    if (!formData.refundPolicy.trim()) {
      newErrors.refundPolicy = 'La política de reembolso es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateBundleData, value: any) => {
    setFormData((prev: CreateBundleData) => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar tags
  const handleTagsKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagsInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev: CreateBundleData) => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagsInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: CreateBundleData) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  // Manejar URLs de imágenes
  const handleImageUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const url = imageUrlInput.trim();
      if (url && !formData.imageUrls?.includes(url)) {
        setFormData((prev: CreateBundleData) => ({ 
          ...prev, 
          imageUrls: [...(prev.imageUrls || []), url] 
        }));
        setImageUrlInput('');
      }
    }
  };

  const removeImageUrl = (urlToRemove: string) => {
    setFormData((prev: CreateBundleData) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((url: string) => url !== urlToRemove) || []
    }));
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
      
      const newBundle = createBundle(formData, shopId);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Callback de éxito
      onBundleCreated?.(newBundle.id);
      
      // Auto-cerrar después de mostrar éxito
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (error) {
      console.error('Error creando bundle:', error);
      setErrors({ submit: 'Error al crear el bundle. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      basePrice: 0,
      maxCapacity: 1,
      duration: 60,
      allowInstantBooking: true,
      requiresApproval: false,
      cancellationPolicy: 'Cancelación gratuita hasta 24 horas antes',
      refundPolicy: 'Reembolso total hasta 24 horas antes',
      tags: [],
      isFeatured: false,
      order: 1,
      imageUrls: []
    });
    setTagsInput('');
    setImageUrlInput('');
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
          ¡Bundle creado exitosamente!
        </h3>
        <p className="text-gray-600 mb-4">
          El bundle "{formData.name}" ha sido creado en "{shopName}". Ya puedes agregar items y extras.
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mr-2"
        >
          Crear otro Bundle
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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Nuevo Bundle
              </h2>
              <p className="text-sm text-gray-500">
                Para el shop: {shopName}
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
              <Package className="w-5 h-5" />
              Información del Bundle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Nombre del Bundle *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Experiencia Spa Premium"
                  error={errors.name}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Input
                  label="Descripción corta"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Resumen breve del bundle..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción completa *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente qué incluye este bundle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Configuración de precios y capacidad */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Precios y Capacidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Precio base *"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  error={errors.basePrice}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Capacidad máxima *"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  error={errors.maxCapacity}
                  disabled={isSubmitting}
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
                />
              </div>
            </div>
          </div>

          {/* Configuración de reservas */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Reservas
            </h3>
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Política de cancelación *"
                  value={formData.cancellationPolicy}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                  placeholder="Ej: Cancelación gratuita hasta 24 horas antes"
                  error={errors.cancellationPolicy}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Política de reembolso *"
                  value={formData.refundPolicy}
                  onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                  placeholder="Ej: Reembolso total hasta 24 horas antes"
                  error={errors.refundPolicy}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Configuración de presentación */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Configuración de Presentación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Orden de visualización"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  disabled={isSubmitting}
                  helpText="Orden en que aparecerá en la lista (1 = primero)"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Bundle destacado
                    </span>
                    <p className="text-xs text-gray-500">
                      Aparecerá como destacado en la lista de bundles
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* URLs de imágenes */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Imágenes del Bundle
              </h4>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    label="Agregar URL de imagen"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={handleImageUrlKeyPress}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const url = imageUrlInput.trim();
                      if (url && !formData.imageUrls?.includes(url)) {
                        setFormData(prev => ({ 
                          ...prev, 
                          imageUrls: [...(prev.imageUrls || []), url] 
                        }));
                        setImageUrlInput('');
                      }
                    }}
                    variant="outline"
                    disabled={isSubmitting || !imageUrlInput.trim()}
                    className="mt-6"
                  >
                    Agregar
                  </Button>
                </div>

                {formData.imageUrls && formData.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Imágenes agregadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                          <span className="text-xs text-gray-600 truncate max-w-32">{url}</span>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(url)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Etiquetas
            </h3>
            
            <div>
              <Input
                label="Agregar etiquetas"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyPress={handleTagsKeyPress}
                placeholder="Escribe una etiqueta y presiona Enter o coma"
                helpText="Ej: spa, relajacion, premium, etc."
                disabled={isSubmitting}
              />
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ Información sobre Bundles</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Los bundles agrupan múltiples items y extras en una experiencia completa</li>
              <li>• El precio base se suma al precio de los items y extras seleccionados</li>
              <li>• Los bundles destacados aparecen primero en las listas</li>
              <li>• Las políticas de cancelación y reembolso se aplican a todo el bundle</li>
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
                'Crear Bundle'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 