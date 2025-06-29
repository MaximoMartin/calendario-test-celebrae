import React, { useState } from 'react';
import { Target, DollarSign, Users, X, Check, Clock, Settings, Plus, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useEntitiesState, type CreateItemData } from '../hooks/useEntitiesState';
import { useShopState } from '../hooks/useShopState';
import { getDayNameForBusinessHours } from '../utils/dateHelpers';

interface ItemCreatorProps {
  bundleId: string;
  bundleName: string;
  onItemCreated?: (itemId: string) => void;
  onClose?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

const SCHEDULE_TYPES = [
  { value: 'FIXED', label: 'Horarios Fijos' },
  { value: 'FLEXIBLE', label: 'Horarios Flexibles' },
  { value: 'CONTINUOUS', label: 'Horarios Continuos' }
];

// Array fijo para mapear dayOfWeek (0=Domingo, 6=Sábado) a nombres de días
const DAY_NAMES_EN: Array<keyof import('../types').BusinessHours> = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

export const ItemCreator: React.FC<ItemCreatorProps> = ({ 
  bundleId,
  bundleName,
  onItemCreated, 
  onClose 
}) => {
  const { createItem } = useEntitiesState();
  const { selectedShop } = useShopState();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    price: 0,
    isPerGroup: false,
    maxCapacity: 1,
    duration: 60,
    isForAdult: false,
    isRequired: false,
    order: 1,
    requiresConfirmation: false,
    advanceBookingDays: 7,
    groupCapacity: 1,
    isExclusive: false,
    timeSlots: {
      scheduleType: 'FIXED',
      weeklySchedule: {
        0: { isAvailable: false, slots: [] },
        1: { isAvailable: false, slots: [] },
        2: { isAvailable: false, slots: [] },
        3: { isAvailable: false, slots: [] },
        4: { isAvailable: false, slots: [] },
        5: { isAvailable: false, slots: [] },
        6: { isAvailable: false, slots: [] }
      },
      bookingLimits: {
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        sameDayBooking: true,
        lastMinuteBooking: true
      }
    }
  });

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Función para verificar si el shop está abierto en un día específico
  const isShopOpenOnDay = (dayOfWeek: number): boolean => {
    const dayName = DAY_NAMES_EN[dayOfWeek];
    const daySchedule = selectedShop.businessHours[dayName];
    return daySchedule.openRanges && daySchedule.openRanges.length > 0;
  };

  // Función para obtener los horarios del shop en un día específico
  const getShopHoursForDay = (dayOfWeek: number): string => {
    const dayName = DAY_NAMES_EN[dayOfWeek];
    const daySchedule = selectedShop.businessHours[dayName];
    
    if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
      return 'Cerrado';
    }
    
    return daySchedule.openRanges
      .map(range => `${range.from} - ${range.to}`)
      .join(', ');
  };

  // Función para verificar si un horario está dentro del rango del shop
  const isTimeSlotWithinShopHours = (dayOfWeek: number, startTime: string, endTime: string): boolean => {
    const dayName = DAY_NAMES_EN[dayOfWeek];
    const daySchedule = selectedShop.businessHours[dayName];
    
    if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
      return false;
    }
    
    // Convertir horarios a minutos para comparación
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    
    return daySchedule.openRanges.some(range => {
      const rangeStart = timeToMinutes(range.from);
      const rangeEnd = timeToMinutes(range.to);
      return slotStart >= rangeStart && slotEnd <= rangeEnd;
    });
  };

  // Función para sugerir horarios automáticamente basados en el shop
  const suggestTimeSlots = (dayOfWeek: number): Array<{
    startTime: string;
    endTime: string;
    maxBookingsPerSlot: number;
    isActive: boolean;
  }> => {
    const dayName = DAY_NAMES_EN[dayOfWeek];
    const daySchedule = selectedShop.businessHours[dayName];
    
    if (!daySchedule.openRanges || daySchedule.openRanges.length === 0) {
      return [];
    }
    
    const suggestedSlots: Array<{
      startTime: string;
      endTime: string;
      maxBookingsPerSlot: number;
      isActive: boolean;
    }> = [];
    
    daySchedule.openRanges.forEach((range) => {
      // Convertir horarios a minutos
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const rangeStart = timeToMinutes(range.from);
      const rangeEnd = timeToMinutes(range.to);
      
      // Crear slots de 1 hora cada 2 horas
      for (let start = rangeStart; start + 60 <= rangeEnd; start += 120) {
        const end = start + 60;
        
        // Convertir de vuelta a formato HH:mm
        const startTime = `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`;
        const endTime = `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`;
        
        suggestedSlots.push({
          startTime,
          endTime,
          maxBookingsPerSlot: formData.maxCapacity,
          isActive: true
        });
      }
    });
    
    return suggestedSlots;
  };

  // Función para aplicar horarios sugeridos
  const applySuggestedSlots = (dayOfWeek: number) => {
    const suggestedSlots = suggestTimeSlots(dayOfWeek);
    
    if (suggestedSlots.length === 0) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots!,
        weeklySchedule: {
          ...prev.timeSlots!.weeklySchedule!,
          [dayOfWeek]: {
            ...prev.timeSlots!.weeklySchedule![dayOfWeek],
            isAvailable: true,
            slots: suggestedSlots
          }
        }
      }
    }));
    
    // Limpiar errores del día
    if (errors[`day_${dayOfWeek}`]) {
      setErrors(prev => ({ ...prev, [`day_${dayOfWeek}`]: '' }));
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    // Validar horarios del item contra horarios del shop
    if (formData.timeSlots?.weeklySchedule) {
      Object.entries(formData.timeSlots.weeklySchedule).forEach(([dayStr, schedule]) => {
        const dayOfWeek = parseInt(dayStr);
        
        if (schedule.isAvailable && !isShopOpenOnDay(dayOfWeek)) {
          newErrors[`day_${dayOfWeek}`] = `El shop no está abierto los ${DAYS_OF_WEEK[dayOfWeek].label.toLowerCase()}s`;
        }
        
        if (schedule.isAvailable && schedule.slots.length > 0) {
          schedule.slots.forEach((slot, slotIndex) => {
            if (!isTimeSlotWithinShopHours(dayOfWeek, slot.startTime, slot.endTime)) {
              newErrors[`slot_${dayOfWeek}_${slotIndex}`] = `El horario ${slot.startTime}-${slot.endTime} está fuera del horario de atención del shop`;
            }
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof CreateItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar cambios en horarios
  const updateDayAvailability = (dayOfWeek: number, isAvailable: boolean) => {
    // Verificar si el shop está abierto en ese día
    if (isAvailable && !isShopOpenOnDay(dayOfWeek)) {
      setErrors(prev => ({
        ...prev,
        [`day_${dayOfWeek}`]: `El shop no está abierto los ${DAYS_OF_WEEK[dayOfWeek].label.toLowerCase()}s`
      }));
      return;
    }

    // Limpiar error del día si existe
    if (errors[`day_${dayOfWeek}`]) {
      setErrors(prev => ({ ...prev, [`day_${dayOfWeek}`]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots!,
        weeklySchedule: {
          ...prev.timeSlots!.weeklySchedule!,
          [dayOfWeek]: {
            ...prev.timeSlots!.weeklySchedule![dayOfWeek],
            isAvailable
          }
        }
      }
    }));
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const newSlot = {
      startTime: '09:00',
      endTime: '10:00',
      maxBookingsPerSlot: formData.maxCapacity,
      isActive: true
    };

    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots!,
        weeklySchedule: {
          ...prev.timeSlots!.weeklySchedule!,
          [dayOfWeek]: {
            ...prev.timeSlots!.weeklySchedule![dayOfWeek],
            slots: [...prev.timeSlots!.weeklySchedule![dayOfWeek].slots, newSlot]
          }
        }
      }
    }));
  };

  const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    // Limpiar error del slot si existe
    if (errors[`slot_${dayOfWeek}_${slotIndex}`]) {
      setErrors(prev => ({ ...prev, [`slot_${dayOfWeek}_${slotIndex}`]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots!,
        weeklySchedule: {
          ...prev.timeSlots!.weeklySchedule!,
          [dayOfWeek]: {
            ...prev.timeSlots!.weeklySchedule![dayOfWeek],
            slots: prev.timeSlots!.weeklySchedule![dayOfWeek].slots.filter((_, i) => i !== slotIndex)
          }
        }
      }
    }));
  };

  const updateTimeSlot = (dayOfWeek: number, slotIndex: number, field: string, value: any) => {
    // Si se está actualizando startTime o endTime, validar contra horarios del shop
    if ((field === 'startTime' || field === 'endTime') && formData.timeSlots?.weeklySchedule?.[dayOfWeek]?.slots?.[slotIndex]) {
      const currentSlot = formData.timeSlots.weeklySchedule[dayOfWeek].slots[slotIndex];
      const newStartTime = field === 'startTime' ? value : currentSlot.startTime;
      const newEndTime = field === 'endTime' ? value : currentSlot.endTime;
      
      if (!isTimeSlotWithinShopHours(dayOfWeek, newStartTime, newEndTime)) {
        setErrors(prev => ({
          ...prev,
          [`slot_${dayOfWeek}_${slotIndex}`]: `El horario ${newStartTime}-${newEndTime} está fuera del horario de atención del shop`
        }));
      } else {
        // Limpiar error si el horario es válido
        if (errors[`slot_${dayOfWeek}_${slotIndex}`]) {
          setErrors(prev => ({ ...prev, [`slot_${dayOfWeek}_${slotIndex}`]: '' }));
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots!,
        weeklySchedule: {
          ...prev.timeSlots!.weeklySchedule!,
          [dayOfWeek]: {
            ...prev.timeSlots!.weeklySchedule![dayOfWeek],
            slots: prev.timeSlots!.weeklySchedule![dayOfWeek].slots.map((slot, i) => 
              i === slotIndex ? { ...slot, [field]: value } : slot
            )
          }
        }
      }
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newItem = createItem(formData, bundleId);
      
      setShowSuccess(true);
      onItemCreated?.(newItem.id);
      
      setTimeout(() => {
        onClose?.();
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
      duration: 60,
      isForAdult: false,
      isRequired: false,
      order: 1,
      requiresConfirmation: false,
      advanceBookingDays: 7,
      groupCapacity: 1,
      isExclusive: false,
      timeSlots: {
        scheduleType: 'FIXED',
        weeklySchedule: {
          0: { isAvailable: false, slots: [] },
          1: { isAvailable: false, slots: [] },
          2: { isAvailable: false, slots: [] },
          3: { isAvailable: false, slots: [] },
          4: { isAvailable: false, slots: [] },
          5: { isAvailable: false, slots: [] },
          6: { isAvailable: false, slots: [] }
        },
        bookingLimits: {
          minAdvanceHours: 2,
          maxAdvanceDays: 30,
          sameDayBooking: true,
          lastMinuteBooking: true
        }
      }
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
    <div className="max-w-6xl mx-auto">
      <Card>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Información básica */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Información del Item
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Título del Item *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Masaje Relajante, Escape Room, etc."
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
                placeholder="Describe este item, qué incluye, beneficios..."
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
                      Si está marcado, se cobra un precio fijo por grupo
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Configuración de capacidad */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Configuración de Capacidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div>
                <Input
                  label="Días de anticipación"
                  type="number"
                  min="0"
                  value={formData.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value) || 7)}
                  placeholder="7"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Configuración de horarios */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configuración de Horarios
              </h3>
            </div>

            {/* Información del shop */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Horarios del Shop: {selectedShop.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                    {DAYS_OF_WEEK.map(({ value, label }) => {
                      const isOpen = isShopOpenOnDay(value);
                      const hours = getShopHoursForDay(value);
                      return (
                        <div key={value} className={`flex justify-between items-center p-2 rounded ${isOpen ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <span className={`font-medium ${isOpen ? 'text-blue-900' : 'text-gray-500'}`}>
                            {label}
                          </span>
                          <span className={`text-xs ${isOpen ? 'text-blue-700' : 'text-gray-500'}`}>
                            {isOpen ? hours : 'Cerrado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                    <p className="font-medium mb-1">📋 Reglas de configuración:</p>
                    <ul className="space-y-1">
                      <li>• Los items solo pueden configurarse en días donde el shop esté abierto</li>
                      <li>• Los horarios del item deben estar dentro del horario de atención del shop</li>
                      <li>• Los días cerrados aparecen en gris y no se pueden seleccionar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Tipo de horario"
                  value={formData.timeSlots?.scheduleType || 'FIXED'}
                  onChange={(e) => handleInputChange('timeSlots', {
                    ...formData.timeSlots,
                    scheduleType: e.target.value as 'FIXED' | 'FLEXIBLE' | 'CONTINUOUS'
                  })}
                  disabled={isSubmitting}
                  options={SCHEDULE_TYPES}
                />
              </div>
            </div>

            {/* Horarios por día */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Horarios por día de la semana</h4>
              
              {DAYS_OF_WEEK.map(({ value, label }) => {
                const daySchedule = formData.timeSlots?.weeklySchedule?.[value];
                const isShopOpen = isShopOpenOnDay(value);
                const shopHours = getShopHoursForDay(value);
                
                return (
                  <Card key={value} className={`p-4 ${!isShopOpen ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={daySchedule?.isAvailable || false}
                          onChange={(e) => updateDayAvailability(value, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isSubmitting || !isShopOpen}
                        />
                        <div>
                          <span className={`font-medium ${!isShopOpen ? 'text-gray-500' : 'text-gray-900'}`}>
                            {label}
                          </span>
                          <p className="text-xs text-gray-500">
                            Shop: {shopHours}
                          </p>
                        </div>
                      </div>
                      
                      {!isShopOpen && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Shop cerrado
                        </span>
                      )}
                      
                      {daySchedule?.isAvailable && isShopOpen && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => applySuggestedSlots(value)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Sugerir Horarios
                          </Button>
                          <Button
                            type="button"
                            onClick={() => addTimeSlot(value)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar Manual
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Error del día */}
                    {errors[`day_${value}`] && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {errors[`day_${value}`]}
                      </div>
                    )}

                    {daySchedule?.isAvailable && daySchedule.slots.length > 0 && (
                      <div className="space-y-3">
                        {daySchedule.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                Horario {slotIndex + 1}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeTimeSlot(value, slotIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Input
                                  label="Hora inicio"
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(value, slotIndex, 'startTime', e.target.value)}
                                  disabled={isSubmitting}
                                />
                              </div>
                              
                              <div>
                                <Input
                                  label="Hora fin"
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(value, slotIndex, 'endTime', e.target.value)}
                                  disabled={isSubmitting}
                                />
                              </div>
                              
                              <div>
                                <Input
                                  label="Capacidad por slot"
                                  type="number"
                                  min="1"
                                  value={slot.maxBookingsPerSlot}
                                  onChange={(e) => updateTimeSlot(value, slotIndex, 'maxBookingsPerSlot', parseInt(e.target.value) || 1)}
                                  disabled={isSubmitting}
                                />
                              </div>
                            </div>

                            {/* Error del slot */}
                            {errors[`slot_${value}_${slotIndex}`] && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                {errors[`slot_${value}_${slotIndex}`]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Configuración avanzada */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración Avanzada
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
            
            {showAdvancedConfig && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
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
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isRequired}
                        onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">
                        Item obligatorio
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.requiresConfirmation}
                        onChange={(e) => handleInputChange('requiresConfirmation', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">
                        Requerir confirmación manual
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isExclusive}
                        onChange={(e) => handleInputChange('isExclusive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">
                        Horario exclusivo (solo 1 grupo)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ Información sobre Items</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Los items son los servicios principales que se pueden reservar</li>
              <li>• Cada item puede tener horarios específicos diferentes</li>
              <li>• Los horarios del item deben respetar los horarios del shop</li>
              <li>• Los horarios fijos permiten definir slots exactos</li>
              <li>• Los horarios flexibles generan slots automáticamente</li>
              <li>• Los horarios continuos están disponibles 24/7</li>
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
    </div>
  );
}; 