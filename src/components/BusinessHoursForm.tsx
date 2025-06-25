// ========================================
// CONFIGURACIÓN DE HORARIOS DE NEGOCIO - NUEVO MODELO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import type { BusinessHours, BusinessHoursPeriod } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Clock, Plus, Trash2, Copy, Save, RotateCcw, 
  Sun, Moon, Coffee, Utensils, AlertTriangle,
  Check, X, Calendar, Settings
} from 'lucide-react';

interface BusinessHoursFormProps {
  initialHours?: BusinessHours[];
  onSave?: (hours: BusinessHours[]) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  shopName?: string;
}

interface DayTemplate {
  name: string;
  periods: BusinessHoursPeriod[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

const COMMON_TEMPLATES: DayTemplate[] = [
  {
    name: 'Horario Comercial (9-17)',
    periods: [{ id: '1', startTime: '09:00', endTime: '17:00', name: 'Horario Comercial' }]
  },
  {
    name: 'Mañana y Tarde',
    periods: [
      { id: '1', startTime: '09:00', endTime: '13:00', name: 'Mañana' },
      { id: '2', startTime: '15:00', endTime: '19:00', name: 'Tarde' }
    ]
  },
  {
    name: 'Restaurante',
    periods: [
      { id: '1', startTime: '12:00', endTime: '15:00', name: 'Almuerzo' },
      { id: '2', startTime: '19:00', endTime: '23:00', name: 'Cena' }
    ]
  },
  {
    name: 'Spa/Wellness',
    periods: [
      { id: '1', startTime: '08:00', endTime: '12:00', name: 'Mañana' },
      { id: '2', startTime: '14:00', endTime: '20:00', name: 'Tarde' }
    ]
  },
  {
    name: '24 Horas',
    periods: [{ id: '1', startTime: '00:00', endTime: '23:59', name: '24h' }]
  }
];

export const BusinessHoursForm: React.FC<BusinessHoursFormProps> = ({
  initialHours = [],
  onSave,
  onCancel,
  isEditing = false,
  shopName = 'Negocio'
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(() => {
    // Inicializar con horarios por defecto si no hay datos
    if (initialHours.length === 0) {
      return DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day.value,
        isActive: day.value >= 1 && day.value <= 5, // Lunes a Viernes activos por defecto
        periods: day.value >= 1 && day.value <= 5 ? [
          { id: `${day.value}-1`, startTime: '09:00', endTime: '17:00', name: 'Horario Comercial' }
        ] : []
      }));
    }
    return initialHours;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // ========================================
  // VALIDACIONES
  // ========================================

  const validatePeriods = useCallback((periods: BusinessHoursPeriod[]): string[] => {
    const errors: string[] = [];

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      
      // Validar formato de horas
      if (!period.startTime || !period.endTime) {
        errors.push(`Período ${i + 1}: Debe especificar hora de inicio y fin`);
        continue;
      }

      // Validar que inicio < fin
      if (period.startTime >= period.endTime) {
        errors.push(`Período ${i + 1}: La hora de inicio debe ser menor que la hora de fin`);
      }

      // Validar solapamientos
      for (let j = i + 1; j < periods.length; j++) {
        const otherPeriod = periods[j];
        if (
          (period.startTime < otherPeriod.endTime && period.endTime > otherPeriod.startTime) ||
          (otherPeriod.startTime < period.endTime && otherPeriod.endTime > period.startTime)
        ) {
          errors.push(`Período ${i + 1} y ${j + 1}: Los horarios se solapan`);
        }
      }
    }

    return errors;
  }, []);

  const allErrors = useMemo(() => {
    const newErrors: Record<string, string[]> = {};

    businessHours.forEach(day => {
      if (day.isActive && day.periods.length > 0) {
        const dayErrors = validatePeriods(day.periods);
        if (dayErrors.length > 0) {
          newErrors[day.dayOfWeek.toString()] = dayErrors;
        }
      }
    });

    return newErrors;
  }, [businessHours, validatePeriods]);

  // ========================================
  // HANDLERS
  // ========================================

  const updateDay = useCallback((dayOfWeek: number, updates: Partial<BusinessHours>) => {
    setBusinessHours(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    ));
    setHasChanges(true);
  }, []);

  const toggleDayActive = useCallback((dayOfWeek: number) => {
    updateDay(dayOfWeek, { 
      isActive: !businessHours.find(d => d.dayOfWeek === dayOfWeek)?.isActive 
    });
  }, [businessHours, updateDay]);

  const addPeriod = useCallback((dayOfWeek: number) => {
    const day = businessHours.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const newPeriod: BusinessHoursPeriod = {
      id: `${dayOfWeek}-${Date.now()}`,
      startTime: '09:00',
      endTime: '17:00',
      name: `Período ${day.periods.length + 1}`
    };

    updateDay(dayOfWeek, { 
      periods: [...day.periods, newPeriod] 
    });
  }, [businessHours, updateDay]);

  const removePeriod = useCallback((dayOfWeek: number, periodId: string) => {
    const day = businessHours.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    updateDay(dayOfWeek, { 
      periods: day.periods.filter(p => p.id !== periodId) 
    });
  }, [businessHours, updateDay]);

  const updatePeriod = useCallback((
    dayOfWeek: number, 
    periodId: string, 
    updates: Partial<BusinessHoursPeriod>
  ) => {
    const day = businessHours.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    updateDay(dayOfWeek, {
      periods: day.periods.map(p => 
        p.id === periodId ? { ...p, ...updates } : p
      )
    });
  }, [businessHours, updateDay]);

  const applyTemplate = useCallback((template: DayTemplate, dayOfWeek?: number) => {
    if (dayOfWeek !== undefined) {
      // Aplicar a un día específico
      updateDay(dayOfWeek, {
        isActive: true,
        periods: template.periods.map(p => ({ 
          ...p, 
          id: `${dayOfWeek}-${Date.now()}-${p.id}` 
        }))
      });
    } else {
      // Aplicar a todos los días activos
      setBusinessHours(prev => prev.map(day => ({
        ...day,
        periods: day.isActive ? template.periods.map(p => ({ 
          ...p, 
          id: `${day.dayOfWeek}-${Date.now()}-${p.id}` 
        })) : day.periods
      })));
    }
    setHasChanges(true);
    setShowTemplates(false);
  }, [updateDay]);

  const copyFromDay = useCallback((fromDay: number, toDay: number) => {
    const sourceDay = businessHours.find(d => d.dayOfWeek === fromDay);
    if (!sourceDay) return;

    updateDay(toDay, {
      isActive: sourceDay.isActive,
      periods: sourceDay.periods.map(p => ({
        ...p,
        id: `${toDay}-${Date.now()}-${p.id}`
      }))
    });
  }, [businessHours, updateDay]);

  const handleSave = useCallback(() => {
    if (Object.keys(allErrors).length === 0) {
      onSave?.(businessHours);
    }
  }, [businessHours, allErrors, onSave]);

  const handleReset = useCallback(() => {
    setBusinessHours(initialHours);
    setHasChanges(false);
  }, [initialHours]);

  // ========================================
  // ESTADÍSTICAS Y RESUMEN
  // ========================================

  const hoursStats = useMemo(() => {
    const activeDays = businessHours.filter(d => d.isActive).length;
    const totalHours = businessHours.reduce((sum, day) => {
      if (!day.isActive) return sum;
      
      return sum + day.periods.reduce((daySum, period) => {
        const start = new Date(`2000-01-01T${period.startTime}:00`);
        const end = new Date(`2000-01-01T${period.endTime}:00`);
        return daySum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);
    }, 0);

    const averageHoursPerDay = activeDays > 0 ? totalHours / activeDays : 0;

    return {
      activeDays,
      totalWeeklyHours: totalHours,
      averageHoursPerDay: averageHoursPerDay.toFixed(1)
    };
  }, [businessHours]);

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <span>Horarios de Atención - {shopName}</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Configura los horarios de atención para cada día de la semana
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{hoursStats.activeDays}</div>
                <div>Días activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{hoursStats.totalWeeklyHours.toFixed(1)}</div>
                <div>Horas/semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{hoursStats.averageHoursPerDay}</div>
                <div>Promedio/día</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles globales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Plantillas</span>
            </Button>
            
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center space-x-2 text-orange-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetear</span>
              </Button>
            )}
          </div>

          {Object.keys(allErrors).length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Hay errores en la configuración</span>
            </div>
          )}
        </div>

        {/* Panel de plantillas */}
        {showTemplates && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Plantillas Predefinidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {COMMON_TEMPLATES.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template.name);
                    // Aplicar a todos los días activos
                    applyTemplate(template);
                  }}
                  className="text-left justify-start"
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500">
                      {template.periods.map(p => `${p.startTime}-${p.endTime}`).join(', ')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Configuración por día */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayData = businessHours.find(d => d.dayOfWeek === day.value);
          const dayErrors = allErrors[day.value.toString()] || [];
          
          return (
            <Card key={day.value} className="overflow-hidden">
              <div className="p-6">
                {/* Header del día */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={dayData?.isActive || false}
                        onChange={() => toggleDayActive(day.value)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{day.label}</h3>
                        {dayData?.isActive && (
                          <p className="text-sm text-gray-600">
                            {dayData.periods.length} período(s) configurado(s)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {dayData?.isActive && (
                      <div className="flex items-center space-x-1">
                        {day.value === 0 || day.value === 6 ? (
                          <Sun className="w-4 h-4 text-orange-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {dayData?.isActive && (
                    <div className="flex items-center space-x-2">
                      {/* Copiar desde otro día */}
                      <Select
                        value=""
                        onChange={(e) => e.target.value && copyFromDay(parseInt(e.target.value), day.value)}
                        options={[
                          { value: '', label: 'Copiar desde...' },
                          ...DAYS_OF_WEEK
                            .filter(d => d.value !== day.value)
                            .map(d => ({ 
                              value: d.value.toString(), 
                              label: d.label 
                            }))
                        ]}
                        className="text-xs"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPeriod(day.value)}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Período</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Períodos del día */}
                {dayData?.isActive && (
                  <div className="space-y-3">
                    {dayData.periods.map((period, periodIndex) => (
                      <div 
                        key={period.id} 
                        className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Nombre
                            </label>
                            <Input
                              type="text"
                              value={period.name}
                              onChange={(e) => updatePeriod(day.value, period.id, { name: e.target.value })}
                              placeholder="Ej: Mañana"
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Hora Inicio
                            </label>
                            <Input
                              type="time"
                              value={period.startTime}
                              onChange={(e) => updatePeriod(day.value, period.id, { startTime: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Hora Fin
                            </label>
                            <Input
                              type="time"
                              value={period.endTime}
                              onChange={(e) => updatePeriod(day.value, period.id, { endTime: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <div className="text-xs text-gray-600">
                              Duración: {
                                (() => {
                                  const start = new Date(`2000-01-01T${period.startTime}:00`);
                                  const end = new Date(`2000-01-01T${period.endTime}:00`);
                                  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                  return `${hours.toFixed(1)}h`;
                                })()
                              }
                            </div>
                          </div>
                        </div>
                        
                        {dayData.periods.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePeriod(day.value, period.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {/* Errores del día */}
                    {dayErrors.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Errores de validación:</span>
                        </div>
                        <ul className="text-sm text-red-700 space-y-1 ml-6">
                          {dayErrors.map((error, index) => (
                            <li key={index} className="list-disc">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Estado inactivo */}
                {!dayData?.isActive && (
                  <div className="text-center py-8 text-gray-500">
                    <Moon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Día inactivo - Sin atención</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Acciones */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasChanges ? (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Tienes cambios sin guardar</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Configuración guardada</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing && (
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={Object.keys(allErrors).length > 0}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Horarios</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 