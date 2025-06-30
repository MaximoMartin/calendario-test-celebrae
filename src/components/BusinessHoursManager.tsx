import React, { useState } from 'react';
import { Clock, Plus, X, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import type { BusinessHours, Shop } from '../types';
import { useEntitiesState } from '../hooks/useEntitiesState';


interface BusinessHoursManagerProps {
  shop: Shop;
  onSave?: (businessHours: BusinessHours) => void;
  onClose?: () => void;
  isReadOnly?: boolean;
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

export const BusinessHoursManager: React.FC<BusinessHoursManagerProps> = ({
  shop,
  onSave,
  onClose,
  isReadOnly = false
}) => {
  const { updateShopBusinessHours } = useEntitiesState();
  
  // Estado inicial desde el shop
  const [businessHours, setBusinessHours] = useState<BusinessHours>(shop.businessHours);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Actualizar un día específico
  const updateDayRanges = (dayName: keyof BusinessHours, ranges: TimeRange[]) => {
    setBusinessHours(prev => ({
      ...prev,
      [dayName]: { openRanges: ranges }
    }));
    setHasChanges(true);
    
    // Limpiar errores del día
    setErrors(prev => ({
      ...prev,
      [dayName]: []
    }));
  };

  // Agregar nuevo rango a un día
  const addTimeRange = (dayName: keyof BusinessHours) => {
    const currentRanges = businessHours[dayName].openRanges;
    const newRange: TimeRange = { from: '09:00', to: '17:00' };
    updateDayRanges(dayName, [...currentRanges, newRange]);
  };

  // Eliminar rango de un día
  const removeTimeRange = (dayName: keyof BusinessHours, index: number) => {
    const currentRanges = businessHours[dayName].openRanges;
    const newRanges = currentRanges.filter((_, i) => i !== index);
    updateDayRanges(dayName, newRanges);
  };

  // Actualizar rango específico
  const updateTimeRange = (
    dayName: keyof BusinessHours,
    index: number,
    field: 'from' | 'to',
    value: string
  ) => {
    const currentRanges = [...businessHours[dayName].openRanges];
    currentRanges[index] = { ...currentRanges[index], [field]: value };
    updateDayRanges(dayName, currentRanges);
  };

  // Validar horarios
  const validateBusinessHours = (): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    DAYS_CONFIG.forEach(({ dayName }) => {
      const dayErrors: string[] = [];
      const ranges = businessHours[dayName].openRanges;

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

    setErrors(newErrors);
    return isValid;
  };

  // Guardar cambios
  const handleSave = () => {
    if (!validateBusinessHours()) {
      return;
    }
    
    updateShopBusinessHours(shop.id, businessHours);
    onSave?.(businessHours);
    setHasChanges(false);
  };

  // Resetear cambios
  const handleReset = () => {
    setBusinessHours(shop.businessHours);
    setHasChanges(false);
    setErrors({});
  };

  // Copiar horarios de un día a otros
  const copyDayToOthers = (sourceDayName: keyof BusinessHours, targetDays: Array<keyof BusinessHours>) => {
    const sourceRanges = businessHours[sourceDayName].openRanges;
    
    let updatedHours = { ...businessHours };
    targetDays.forEach(targetDay => {
      updatedHours[targetDay] = { openRanges: [...sourceRanges] };
    });
    
    setBusinessHours(updatedHours);
    setHasChanges(true);
  };

  // Plantillas rápidas
  const applyTemplate = (template: 'normal' | 'weekend' | 'always' | 'closed') => {
    let newBusinessHours: BusinessHours = { ...businessHours };

    switch (template) {
      case 'normal':
        // Lunes a viernes 9-17, sábado 10-14, domingo cerrado
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newBusinessHours[day as keyof BusinessHours] = {
            openRanges: [{ from: '09:00', to: '17:00' }]
          };
        });
        newBusinessHours.saturday = { openRanges: [{ from: '10:00', to: '14:00' }] };
        newBusinessHours.sunday = { openRanges: [] };
        break;
      
      case 'weekend':
        // Solo fines de semana
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          newBusinessHours[day as keyof BusinessHours] = { openRanges: [] };
        });
        newBusinessHours.saturday = { openRanges: [{ from: '10:00', to: '20:00' }] };
        newBusinessHours.sunday = { openRanges: [{ from: '10:00', to: '18:00' }] };
        break;
      
      case 'always':
        // Todos los días 24 horas
        DAYS_CONFIG.forEach(({ dayName }) => {
          newBusinessHours[dayName] = { openRanges: [{ from: '00:00', to: '23:59' }] };
        });
        break;
      
      case 'closed':
        // Cerrado todos los días
        DAYS_CONFIG.forEach(({ dayName }) => {
          newBusinessHours[dayName] = { openRanges: [] };
        });
        break;
    }

    setBusinessHours(newBusinessHours);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Horarios de Atención
            </h2>
            <p className="text-sm text-gray-500">
              {shop.name}
            </p>
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetear
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Plantillas rápidas */}
      {!isReadOnly && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Plantillas Rápidas
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => applyTemplate('normal')}
              variant="outline"
              size="sm"
            >
              Horario Normal
            </Button>
            <Button
              onClick={() => applyTemplate('weekend')}
              variant="outline"
              size="sm"
            >
              Solo Fines de Semana
            </Button>
            <Button
              onClick={() => applyTemplate('always')}
              variant="outline"
              size="sm"
            >
              Siempre Abierto
            </Button>
            <Button
              onClick={() => applyTemplate('closed')}
              variant="outline"
              size="sm"
            >
              Siempre Cerrado
            </Button>
          </div>
        </Card>
      )}

      {/* Configuración por día */}
      <div className="space-y-4">
        {DAYS_CONFIG.map(({ dayName, displayName }) => {
          const dayRanges = businessHours[dayName].openRanges;
          const dayErrors = errors[dayName] || [];
          
          return (
            <Card key={dayName} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {displayName}
                </h3>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addTimeRange(dayName)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Horario
                    </Button>
                  </div>
                )}
              </div>

              {/* Rangos de horario */}
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
                        disabled={isReadOnly}
                        className="w-32"
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="time"
                        value={range.to}
                        onChange={(e) => updateTimeRange(dayName, index, 'to', e.target.value)}
                        disabled={isReadOnly}
                        className="w-32"
                      />
                      {!isReadOnly && (
                        <Button
                          onClick={() => removeTimeRange(dayName, index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Errores del día */}
              {dayErrors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Errores de configuración:</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {dayErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Copiar a otros días */}
              {!isReadOnly && dayRanges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">
                    Copiar este horario a otros días:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {DAYS_CONFIG.filter(d => d.dayName !== dayName).map(({ dayName: targetDay, displayName: targetDisplay }) => (
                      <Button
                        key={targetDay}
                        onClick={() => copyDayToOthers(dayName, [targetDay])}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {targetDisplay}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Resumen */}
      <Card className="p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Resumen de Horarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {DAYS_CONFIG.map(({ dayName, displayName }) => {
            const ranges = businessHours[dayName].openRanges;
            return (
              <div key={dayName} className="flex justify-between">
                <span className="font-medium">{displayName}:</span>
                <span className="text-gray-600">
                  {ranges.length === 0
                    ? 'Cerrado'
                    : ranges.map(r => `${r.from}-${r.to}`).join(', ')
                  }
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Footer con botones */}
      {onClose && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}; 