// ========================================
// GESTOR DE EXCEPCIONES Y DÍAS ESPECIALES
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO, addDays, startOfDay, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ShopException, BusinessHoursPeriod } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Calendar, Plus, Edit3, Trash2, AlertTriangle, 
  X, Check, Shield, Clock, MapPin, Users,
  Briefcase, Coffee, Wrench, Gift, Star,
  ChevronDown, ChevronUp, Eye, Copy
} from 'lucide-react';

interface ExceptionManagerProps {
  initialExceptions?: ShopException[];
  onSave?: (exceptions: ShopException[]) => void;
  onDeleteException?: (exceptionId: string) => void;
  shopName?: string;
  canEdit?: boolean;
}

interface CreateExceptionForm {
  title: string;
  description: string;
  type: ShopException['type'];
  date: string;
  endDate?: string;
  affectedServices: string[];
  customHours?: BusinessHoursPeriod[];
  isRecurring: boolean;
  recurringType?: 'weekly' | 'monthly' | 'yearly';
  notes?: string;
}

const EXCEPTION_TYPES = [
  {
    value: 'CLOSED' as const,
    label: 'Cerrado',
    icon: X,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Día completamente cerrado al público'
  },
  {
    value: 'SPECIAL_HOURS' as const,
    label: 'Horarios Especiales',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Horarios diferentes a los habituales'
  },
  {
    value: 'PRIVATE_EVENT' as const,
    label: 'Evento Privado',
    icon: Users,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Evento cerrado al público general'
  },
  {
    value: 'MAINTENANCE' as const,
    label: 'Mantenimiento',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Mantenimiento de instalaciones'
  },
  {
    value: 'HOLIDAY' as const,
    label: 'Feriado',
    icon: Gift,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Día feriado o festivo'
  },
  {
    value: 'SPECIAL_PROMOTION' as const,
    label: 'Promoción Especial',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Día con promociones especiales'
  }
];

export const ExceptionManager: React.FC<ExceptionManagerProps> = ({
  initialExceptions = [],
  onSave,
  onDeleteException,
  shopName = 'Negocio',
  canEdit = true
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [exceptions, setExceptions] = useState<ShopException[]>(initialExceptions);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedExceptions, setExpandedExceptions] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const [formData, setFormData] = useState<CreateExceptionForm>({
    title: '',
    description: '',
    type: 'CLOSED',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    affectedServices: [],
    isRecurring: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ========================================
  // FILTROS Y ORDENAMIENTO
  // ========================================

  const filteredExceptions = useMemo(() => {
    let filtered = exceptions;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(exc => exc.type === filterType);
    }

    // Filtrar por fecha
    if (filterDate) {
      filtered = filtered.filter(exc => 
        exc.date === filterDate || 
        (exc.endDate && exc.date <= filterDate && exc.endDate >= filterDate)
      );
    }

    // Ordenar por fecha
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exceptions, filterType, filterDate]);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = exceptions.filter(exc => new Date(exc.date) > now);
    const active = exceptions.filter(exc => {
      const start = new Date(exc.date);
      const end = exc.endDate ? new Date(exc.endDate) : start;
      return start <= now && end >= now;
    });

    const byType = exceptions.reduce((acc, exc) => {
      acc[exc.type] = (acc[exc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: exceptions.length,
      upcoming: upcoming.length,
      active: active.length,
      byType
    };
  }, [exceptions]);

  // ========================================
  // VALIDACIONES
  // ========================================

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else if (isBefore(new Date(formData.date), startOfDay(new Date()))) {
      newErrors.date = 'La fecha no puede ser en el pasado';
    }

    if (formData.endDate && isAfter(new Date(formData.date), new Date(formData.endDate))) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (formData.type === 'SPECIAL_HOURS' && (!formData.customHours || formData.customHours.length === 0)) {
      newErrors.customHours = 'Debe especificar horarios especiales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleCreateException = useCallback(() => {
    if (!validateForm()) return;

    const newException: ShopException = {
      id: `exc-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: formData.date,
      endDate: formData.endDate,
      affectedServices: formData.affectedServices,
      customHours: formData.customHours,
      isRecurring: formData.isRecurring,
      recurringType: formData.recurringType,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setExceptions(prev => [...prev, newException]);
    setIsCreating(false);
    resetForm();
    onSave?.([...exceptions, newException]);
  }, [formData, validateForm, exceptions, onSave]);

  const handleEditException = useCallback((exception: ShopException) => {
    setFormData({
      title: exception.title,
      description: exception.description,
      type: exception.type,
      date: exception.date,
      endDate: exception.endDate,
      affectedServices: exception.affectedServices || [],
      customHours: exception.customHours,
      isRecurring: exception.isRecurring || false,
      recurringType: exception.recurringType,
      notes: exception.notes
    });
    setEditingId(exception.id);
    setIsCreating(true);
  }, []);

  const handleUpdateException = useCallback(() => {
    if (!validateForm() || !editingId) return;

    const updatedExceptions = exceptions.map(exc => 
      exc.id === editingId 
        ? {
            ...exc,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            date: formData.date,
            endDate: formData.endDate,
            affectedServices: formData.affectedServices,
            customHours: formData.customHours,
            isRecurring: formData.isRecurring,
            recurringType: formData.recurringType,
            notes: formData.notes,
            updatedAt: new Date().toISOString()
          }
        : exc
    );

    setExceptions(updatedExceptions);
    setIsCreating(false);
    setEditingId(null);
    resetForm();
    onSave?.(updatedExceptions);
  }, [formData, editingId, exceptions, validateForm, onSave]);

  const handleDeleteException = useCallback((exceptionId: string) => {
    setExceptions(prev => prev.filter(exc => exc.id !== exceptionId));
    onDeleteException?.(exceptionId);
  }, [onDeleteException]);

  const handleDuplicateException = useCallback((exception: ShopException) => {
    const newException: ShopException = {
      ...exception,
      id: `exc-${Date.now()}`,
      title: `${exception.title} (Copia)`,
      date: format(addDays(new Date(exception.date), 7), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString()
    };

    setExceptions(prev => [...prev, newException]);
    onSave?.([...exceptions, newException]);
  }, [exceptions, onSave]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      type: 'CLOSED',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      affectedServices: [],
      isRecurring: false,
      notes: ''
    });
    setErrors({});
  }, []);

  const toggleExpanded = useCallback((exceptionId: string) => {
    setExpandedExceptions(prev => 
      prev.includes(exceptionId)
        ? prev.filter(id => id !== exceptionId)
        : [...prev, exceptionId]
    );
  }, []);

  // ========================================
  // UTILIDADES DE RENDERIZADO
  // ========================================

  const getExceptionTypeConfig = (type: ShopException['type']) => {
    return EXCEPTION_TYPES.find(t => t.value === type) || EXCEPTION_TYPES[0];
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = format(parseISO(startDate), 'dd/MM/yyyy', { locale: es });
    if (!endDate || startDate === endDate) return start;
    const end = format(parseISO(endDate), 'dd/MM/yyyy', { locale: es });
    return `${start} - ${end}`;
  };

  const isExceptionActive = (exception: ShopException) => {
    const now = new Date();
    const start = new Date(exception.date);
    const end = exception.endDate ? new Date(exception.endDate) : start;
    return start <= now && end >= now;
  };

  const isExceptionUpcoming = (exception: ShopException) => {
    return new Date(exception.date) > new Date();
  };

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
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Gestión de Excepciones - {shopName}</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Gestiona días cerrados, horarios especiales y eventos
            </p>
          </div>
          
          {canEdit && (
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Excepción</span>
            </Button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Activas</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Próximas</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byType).length}
            </div>
            <div className="text-sm text-gray-600">Tipos</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                ...EXCEPTION_TYPES.map(type => ({
                  value: type.value,
                  label: type.label
                }))
              ]}
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filtrar por fecha"
            />
          </div>
          {(filterType !== 'all' || filterDate) && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterType('all');
                setFilterDate('');
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Modal de creación/edición */}
      {isCreating && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Excepción' : 'Nueva Excepción'}
          </h3>
          
          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Día de Mantenimiento"
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ShopException['type'] }))}
                  options={EXCEPTION_TYPES.map(type => ({
                    value: type.value,
                    label: type.label
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional..."
              />
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className={errors.date ? 'border-red-300' : ''}
                />
                {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin (opcional)
                </label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                  className={errors.endDate ? 'border-red-300' : ''}
                />
                {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Horarios especiales */}
            {formData.type === 'SPECIAL_HOURS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horarios Especiales *
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Configura los horarios especiales para este día
                  </p>
                  {/* Aquí puedes agregar un mini editor de horarios */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      placeholder="Inicio"
                      onChange={(e) => {
                        const period: BusinessHoursPeriod = {
                          id: '1',
                          startTime: e.target.value,
                          endTime: formData.customHours?.[0]?.endTime || '17:00',
                          name: 'Horario Especial'
                        };
                        setFormData(prev => ({ ...prev, customHours: [period] }));
                      }}
                    />
                    <Input
                      type="time"
                      placeholder="Fin"
                      onChange={(e) => {
                        const period: BusinessHoursPeriod = {
                          id: '1',
                          startTime: formData.customHours?.[0]?.startTime || '09:00',
                          endTime: e.target.value,
                          name: 'Horario Especial'
                        };
                        setFormData(prev => ({ ...prev, customHours: [period] }));
                      }}
                    />
                  </div>
                </div>
                {errors.customHours && <p className="text-sm text-red-600 mt-1">{errors.customHours}</p>}
              </div>
            )}

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingId ? handleUpdateException : handleCreateException}
                className="flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'Actualizar' : 'Crear'}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de excepciones */}
      <div className="space-y-4">
        {filteredExceptions.length > 0 ? (
          filteredExceptions.map((exception) => {
            const typeConfig = getExceptionTypeConfig(exception.type);
            const isActive = isExceptionActive(exception);
            const isUpcoming = isExceptionUpcoming(exception);
            const isExpanded = expandedExceptions.includes(exception.id);

            return (
              <Card key={exception.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${typeConfig.color}`}>
                        <typeConfig.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{typeConfig.label}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{exception.title}</h3>
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Activa
                            </span>
                          )}
                          {isUpcoming && !isActive && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Próxima
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{formatDateRange(exception.date, exception.endDate)}</p>
                        {exception.description && (
                          <p className="text-sm text-gray-500 mt-1">{exception.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpanded(exception.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {canEdit && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateException(exception)}
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditException(exception)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteException(exception.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {exception.customHours && exception.customHours.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Horarios Especiales:</h4>
                          <div className="space-y-1">
                            {exception.customHours.map((period) => (
                              <div key={period.id} className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{period.name}: {period.startTime} - {period.endTime}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {exception.affectedServices && exception.affectedServices.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Servicios Afectados:</h4>
                          <div className="flex flex-wrap gap-1">
                            {exception.affectedServices.map((serviceId) => (
                              <span key={serviceId} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {serviceId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {exception.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Notas:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{exception.notes}</p>
                        </div>
                      )}

                      {exception.isRecurring && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recurrencia:</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {exception.recurringType === 'weekly' ? 'Semanal' :
                             exception.recurringType === 'monthly' ? 'Mensual' :
                             exception.recurringType === 'yearly' ? 'Anual' : 'Personalizada'}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Creada: {format(parseISO(exception.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        {exception.updatedAt && (
                          <> • Actualizada: {format(parseISO(exception.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay excepciones</h3>
            <p className="text-gray-600 mb-4">
              {filterType !== 'all' || filterDate
                ? 'No se encontraron excepciones que coincidan con los filtros.'
                : 'No tienes excepciones configuradas aún.'
              }
            </p>
            {canEdit && (filterType === 'all' && !filterDate) && (
              <Button
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Excepción</span>
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}; 