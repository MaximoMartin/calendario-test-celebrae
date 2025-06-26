import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BookingFormData, Kit, TimeSlot, Booking } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { formatDate, getAvailableTimeSlots } from '../utils/dateHelpers';

const bookingSchema = z.object({
  kitId: z.string().min(1, 'Debe seleccionar un servicio'),
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(8, 'Teléfono debe tener al menos 8 dígitos'),
  date: z.string().min(1, 'Debe seleccionar una fecha'),
  timeSlot: z.string().min(1, 'Debe seleccionar un horario'),
  numberOfPeople: z.number().min(1, 'Debe ser al menos 1 persona'),
  notes: z.string().optional(),
});

interface BookingFormProps {
  kits: Kit[];
  timeSlots: TimeSlot[];
  existingBookings: Booking[];
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BookingFormData>;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  kits,
  timeSlots,
  existingBookings,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  // Estado local removido - usando watch() directamente para mayor consistencia
  // const [selectedKitId, setSelectedKitId] = useState(initialData?.kitId || '');
  // const [selectedDate, setSelectedDate] = useState(initialData?.date || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      kitId: initialData?.kitId || '',
      customerName: initialData?.customerName || '',
      customerEmail: initialData?.customerEmail || '',
      customerPhone: initialData?.customerPhone || '',
      date: initialData?.date || '',
      timeSlot: initialData?.timeSlot || '',
      numberOfPeople: initialData?.numberOfPeople || 1,
      notes: initialData?.notes || '',
    },
  });

  const watchedKitId = watch('kitId');
  const watchedDate = watch('date');

  // Opciones de kits
  const kitOptions = useMemo(() => [
    { value: '', label: 'Seleccionar servicio...' },
    ...kits.map(kit => ({ 
      value: kit.id, 
      label: `${kit.name} - €${kit.price} (Max: ${kit.maxCapacity} personas)` 
    }))
  ], [kits]);

  // Kit seleccionado
  const selectedKit = useMemo(() => 
    kits.find(kit => kit.id === watchedKitId), 
    [kits, watchedKitId]
  );

  // Slots disponibles para el kit y fecha seleccionados
  const availableSlots = useMemo(() => {
    if (!watchedKitId || !watchedDate) return [];
    
    return getAvailableTimeSlots(watchedDate, watchedKitId, timeSlots, existingBookings);
  }, [watchedKitId, watchedDate, timeSlots, existingBookings]);

  // Opciones de horarios
  const timeSlotOptions = useMemo(() => [
    { value: '', label: 'Seleccionar horario...' },
    ...availableSlots.map(slot => ({
      value: slot.startTime,
      label: `${slot.startTime} - ${slot.endTime}`,
    }))
  ], [availableSlots]);

  // Manejar cambio de kit
  const handleKitChange = (kitId: string) => {
    setValue('kitId', kitId);
    setValue('timeSlot', ''); // Reset time slot when kit changes
  };

  // Manejar cambio de fecha
  const handleDateChange = (date: string) => {
    setValue('date', date);
    setValue('timeSlot', ''); // Reset time slot when date changes
  };

  const onFormSubmit = (data: BookingFormData) => {
    const kit = kits.find(k => k.id === data.kitId);
    if (kit) {
      onSubmit({
        ...data,
        numberOfPeople: Number(data.numberOfPeople),
      });
    }
  };

  // Fecha mínima (mañana)
  const minDate = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card title="Nueva Reserva">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Select
              label="Servicio/Kit *"
              options={kitOptions}
              value={watchedKitId}
              onChange={(e) => handleKitChange(e.target.value)}
              error={errors.kitId?.message}
            />
          </div>

          <Input
            label="Nombre del cliente *"
            type="text"
            {...register('customerName')}
            error={errors.customerName?.message}
            placeholder="Nombre completo"
          />

          <Input
            label="Email *"
            type="email"
            {...register('customerEmail')}
            error={errors.customerEmail?.message}
            placeholder="email@ejemplo.com"
          />

          <Input
            label="Teléfono *"
            type="tel"
            {...register('customerPhone')}
            error={errors.customerPhone?.message}
            placeholder="+34 600 123 456"
          />

          <Input
            label="Número de personas *"
            type="number"
            min="1"
            max={selectedKit?.maxCapacity || 10}
            {...register('numberOfPeople', { valueAsNumber: true })}
            error={errors.numberOfPeople?.message}
            helpText={selectedKit ? `Máximo: ${selectedKit.maxCapacity} personas` : undefined}
          />

          <Input
            label="Fecha *"
            type="date"
            min={minDate}
            value={watchedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            error={errors.date?.message}
          />

          <div className="md:col-span-2">
            <Select
              label="Horario *"
              options={timeSlotOptions}
              {...register('timeSlot')}
              error={errors.timeSlot?.message}
              disabled={!watchedKitId || !watchedDate}
            />
            {watchedKitId && watchedDate && availableSlots.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No hay horarios disponibles para esta fecha y servicio
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Información adicional sobre la reserva..."
            />
          </div>
        </div>

        {selectedKit && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Resumen del servicio</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Precio:</span>
                <span className="ml-2 font-medium">€{selectedKit.price}</span>
              </div>
              <div>
                <span className="text-blue-700">Duración:</span>
                <span className="ml-2 font-medium">{selectedKit.duration} min</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
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
            disabled={!watchedKitId || !watchedDate || availableSlots.length === 0}
          >
            Crear Reserva
          </Button>
        </div>
      </form>
    </Card>
      </div>
    </div>
  );
}; 