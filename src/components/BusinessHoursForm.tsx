import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BusinessHoursFormData, BusinessHours, BusinessHoursPeriod } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { generateTimeOptions } from '../utils/dateHelpers';

const businessHoursPeriodSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
}).refine((data) => {
  return data.startTime < data.endTime;
}, {
  message: "La hora de inicio debe ser anterior a la hora de fin",
  path: ["endTime"],
});

const businessHoursDaySchema = z.object({
  isActive: z.boolean(),
  periods: z.array(businessHoursPeriodSchema).min(0),
});

const businessHoursSchema = z.object({
  monday: businessHoursDaySchema,
  tuesday: businessHoursDaySchema,
  wednesday: businessHoursDaySchema,
  thursday: businessHoursDaySchema,
  friday: businessHoursDaySchema,
  saturday: businessHoursDaySchema,
  sunday: businessHoursDaySchema,
});

interface BusinessHoursFormProps {
  initialData?: BusinessHours[];
  onSubmit: (data: BusinessHours[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BusinessHoursForm: React.FC<BusinessHoursFormProps> = ({
  initialData = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const timeOptions = generateTimeOptions(6, 23, 30);
  
  // Estado local para manejar los períodos de cada día
  const [dayPeriods, setDayPeriods] = useState<Record<string, BusinessHoursPeriod[]>>(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const initial: Record<string, BusinessHoursPeriod[]> = {};
    
    days.forEach((dayName, index) => {
      const dayData = initialData.find(bh => bh.dayOfWeek === index);
      initial[dayName] = dayData?.periods?.length ? dayData.periods : [{ startTime: '09:00', endTime: '18:00' }];
    });
    
    return initial;
  });

  // Convertir BusinessHours[] a BusinessHoursFormData
  const getFormData = (businessHours: BusinessHours[]): BusinessHoursFormData => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    const formData: BusinessHoursFormData = {} as BusinessHoursFormData;
    
    days.forEach((dayName, index) => {
      const dayData = businessHours.find(bh => bh.dayOfWeek === index);
      formData[dayName] = {
        isActive: dayData?.isActive || false,
        periods: dayData?.periods || [{ startTime: '09:00', endTime: '18:00' }],
      };
    });
    
    return formData;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: getFormData(initialData),
  });

  const watchedData = watch();

  const onFormSubmit = (data: BusinessHoursFormData) => {
    const businessHours: BusinessHours[] = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    days.forEach((dayName, index) => {
      const dayData = data[dayName];
      businessHours.push({
        dayOfWeek: index,
        isActive: dayData.isActive,
        periods: dayPeriods[dayName] || [],
      });
    });

    onSubmit(businessHours);
  };

  const setAllDays = (isActive: boolean) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    days.forEach(day => {
      setValue(`${day}.isActive`, isActive);
    });
  };

  const setWeekdays = () => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
    const weekend = ['sunday', 'saturday'] as const;
    
    weekdays.forEach(day => {
      setValue(`${day}.isActive`, true);
      setDayPeriods(prev => ({
        ...prev,
        [day]: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '14:00', endTime: '18:00' }]
      }));
    });
    
    weekend.forEach(day => {
      setValue(`${day}.isActive`, false);
    });
  };

  const setWeekend = () => {
    const weekend = ['sunday', 'saturday'] as const;
    
    weekend.forEach(day => {
      setValue(`${day}.isActive`, true);
      setDayPeriods(prev => ({
        ...prev,
        [day]: [{ startTime: '10:00', endTime: '16:00' }]
      }));
    });
  };

  const addPeriod = (dayKey: string) => {
    setDayPeriods(prev => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), { startTime: '09:00', endTime: '18:00' }]
    }));
  };

  const removePeriod = (dayKey: string, periodIndex: number) => {
    setDayPeriods(prev => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((_, index) => index !== periodIndex)
    }));
  };

  const updatePeriod = (dayKey: string, periodIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setDayPeriods(prev => ({
      ...prev,
      [dayKey]: prev[dayKey].map((period, index) => 
        index === periodIndex ? { ...period, [field]: value } : period
      )
    }));
  };

  const copyPeriods = (fromDay: string, toDay: string) => {
    setDayPeriods(prev => ({
      ...prev,
      [toDay]: [...prev[fromDay]]
    }));
  };

  const days = [
    { key: 'monday' as const, name: 'Lunes', dayOfWeek: 1 },
    { key: 'tuesday' as const, name: 'Martes', dayOfWeek: 2 },
    { key: 'wednesday' as const, name: 'Miércoles', dayOfWeek: 3 },
    { key: 'thursday' as const, name: 'Jueves', dayOfWeek: 4 },
    { key: 'friday' as const, name: 'Viernes', dayOfWeek: 5 },
    { key: 'saturday' as const, name: 'Sábado', dayOfWeek: 6 },
    { key: 'sunday' as const, name: 'Domingo', dayOfWeek: 0 },
  ];

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Horarios de Atención</h2>
              <p className="text-sm text-gray-600">Define múltiples períodos de atención para cada día</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cerrar</span>
          </Button>
        </div>

        {/* Contenido del Modal con scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setWeekdays}
              >
                Días laborales (L-V)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setWeekend}
              >
                Fines de semana
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDays(true)}
              >
                Activar todos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAllDays(false)}
              >
                Desactivar todos
              </Button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {days.map(({ key, name }) => {
                const dayData = watchedData[key];
                const dayErrors = errors[key];
                const periods = dayPeriods[key] || [];
                
                return (
                  <div 
                    key={key}
                    className={`p-6 border rounded-lg ${dayData?.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register(`${key}.isActive`)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-lg font-medium text-gray-900">
                          {name}
                        </span>
                      </label>
                      
                      <div className="flex items-center space-x-2">
                        {dayData?.isActive && (
                          <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            {periods.length} período{periods.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        
                        {/* Dropdown para copiar horarios */}
                        {dayData?.isActive && (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  copyPeriods(e.target.value, key);
                                  e.target.value = '';
                                }
                              }}
                              className="text-xs px-2 py-1 border rounded bg-white text-gray-600"
                            >
                              <option value="">Copiar desde...</option>
                              {days.filter(d => d.key !== key && watchedData[d.key]?.isActive).map(d => (
                                <option key={d.key} value={d.key}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {dayData?.isActive && (
                      <div className="space-y-3">
                        {periods.map((period, periodIndex) => (
                          <div key={periodIndex} className="flex items-center space-x-3 p-3 bg-white rounded border">
                            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                                {periodIndex + 1}
                              </span>
                              <span>Período</span>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Hora de apertura
                                </label>
                                <select
                                  value={period.startTime}
                                  onChange={(e) => updatePeriod(key, periodIndex, 'startTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {timeOptions.map(time => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Hora de cierre
                                </label>
                                <select
                                  value={period.endTime}
                                  onChange={(e) => updatePeriod(key, periodIndex, 'endTime', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  {timeOptions.map(time => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                                {period.startTime >= period.endTime && (
                                  <p className="mt-1 text-xs text-red-600">
                                    La hora de fin debe ser posterior a la de inicio
                                  </p>
                                )}
                              </div>
                            </div>

                            {periods.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePeriod(key, periodIndex)}
                                className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPeriod(key)}
                          className="w-full flex items-center justify-center space-x-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Agregar período</span>
                        </Button>

                        {dayErrors && (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {dayErrors.message || 'Revisa los horarios de este día'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </form>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50 sticky bottom-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            loading={isLoading}
          >
            Guardar Horarios
          </Button>
        </div>
      </Card>
    </div>
  );
}; 