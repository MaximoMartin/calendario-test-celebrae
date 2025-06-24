import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BusinessHoursFormData, BusinessHours } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getDayOfWeekName, generateTimeOptions } from '../utils/dateHelpers';

const businessHoursDaySchema = z.object({
  isActive: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
}).refine((data) => {
  if (!data.isActive) return true;
  return data.startTime < data.endTime;
}, {
  message: "La hora de inicio debe ser anterior a la hora de fin",
  path: ["endTime"],
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

  // Convertir BusinessHours[] a BusinessHoursFormData
  const getFormData = (businessHours: BusinessHours[]): BusinessHoursFormData => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    
    const formData: BusinessHoursFormData = {} as BusinessHoursFormData;
    
    days.forEach((dayName, index) => {
      const dayData = businessHours.find(bh => bh.dayOfWeek === index);
      formData[dayName] = {
        isActive: dayData?.isActive || false,
        startTime: dayData?.startTime || '09:00',
        endTime: dayData?.endTime || '18:00',
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
        startTime: dayData.startTime,
        endTime: dayData.endTime,
        isActive: dayData.isActive,
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
      setValue(`${day}.startTime`, '09:00');
      setValue(`${day}.endTime`, '18:00');
    });
    
    weekend.forEach(day => {
      setValue(`${day}.isActive`, false);
    });
  };

  const setWeekend = () => {
    const weekend = ['sunday', 'saturday'] as const;
    
    weekend.forEach(day => {
      setValue(`${day}.isActive`, true);
      setValue(`${day}.startTime`, '10:00');
      setValue(`${day}.endTime`, '16:00');
    });
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
    <Card title="Configuración de Horarios de Atención">
      <div className="space-y-6">
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {days.map(({ key, name }) => {
            const dayData = watchedData[key];
            const dayErrors = errors[key];
            
            return (
              <div 
                key={key}
                className={`p-4 border rounded-lg ${dayData?.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
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
                  
                  {dayData?.isActive && (
                    <span className="text-sm text-green-600 font-medium">
                      Abierto
                    </span>
                  )}
                </div>

                {dayData?.isActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de apertura
                      </label>
                      <select
                        {...register(`${key}.startTime`)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de cierre
                      </label>
                      <select
                        {...register(`${key}.endTime`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {dayErrors?.endTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {dayErrors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isLoading}
            >
              Guardar Horarios
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}; 