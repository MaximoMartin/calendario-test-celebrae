import React, { useState } from 'react';
import { AlertTriangle, Calendar, Clock, Settings, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { mockExceptions, mockKits } from '../mockData';
import type { ShopException, Kit } from '../types';

interface ExceptionManagerProps {
  shopId: string;
  kits: Kit[];
  onClose?: () => void;
}

export const ExceptionManager: React.FC<ExceptionManagerProps> = ({
  shopId,
  kits,
  onClose
}) => {
  const [exceptions, setExceptions] = useState<ShopException[]>(mockExceptions);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ShopException>>({
    type: 'CLOSED',
    isActive: true,
    affectedKits: []
  });

  const exceptionTypes = [
    { value: 'CLOSED', label: 'Cerrado', icon: '🔒', description: 'El negocio estará cerrado' },
    { value: 'SPECIAL_HOURS', label: 'Horario Especial', icon: '⏰', description: 'Horarios diferentes a los habituales' },
    { value: 'PRIVATE_EVENT', label: 'Evento Privado', icon: '🎉', description: 'Evento privado - acceso restringido' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', icon: '🔧', description: 'Mantenimiento de equipos o instalaciones' }
  ];

  const kitOptions = kits.map(kit => ({
    value: kit.id,
    label: kit.name
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.type) {
      return;
    }

    const newException: ShopException = {
      id: editingId || `exc_${Date.now()}`,
      shopId,
      date: formData.date!,
      type: formData.type as ShopException['type'],
      title: formData.title!,
      description: formData.description,
      specialHours: formData.specialHours,
      affectedKits: formData.affectedKits || [],
      isActive: formData.isActive ?? true,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      setExceptions(prev => prev.map(exc => 
        exc.id === editingId ? newException : exc
      ));
    } else {
      setExceptions(prev => [...prev, newException]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'CLOSED',
      isActive: true,
      affectedKits: []
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (exception: ShopException) => {
    setFormData(exception);
    setEditingId(exception.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta excepción?')) {
      setExceptions(prev => prev.filter(exc => exc.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setExceptions(prev => prev.map(exc => 
      exc.id === id ? { ...exc, isActive: !exc.isActive } : exc
    ));
  };

  const getTypeInfo = (type: string) => {
    return exceptionTypes.find(t => t.value === type) || exceptionTypes[0];
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = getTypeInfo(type);
    return typeInfo.icon;
  };

  const getKitNames = (kitIds: string[]) => {
    if (kitIds.length === 0) return 'Todos los servicios';
    return kitIds.map(id => {
      const kit = kits.find(k => k.id === id);
      return kit?.name || id;
    }).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Excepciones</h2>
              <p className="text-sm text-gray-600">Administra días especiales, cierres y eventos</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Excepción</span>
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </div>
        </div>

        <div className="flex h-full">
          {/* Lista de Excepciones */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Excepciones Programadas</h3>
              
              {exceptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay excepciones programadas</p>
                  <p className="text-sm">Crea una nueva excepción para eventos especiales</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exceptions.map((exception) => (
                    <div
                      key={exception.id}
                      className={`border rounded-lg p-4 ${
                        exception.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-2xl">{getTypeIcon(exception.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{exception.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                exception.type === 'CLOSED' ? 'bg-red-100 text-red-800' :
                                exception.type === 'SPECIAL_HOURS' ? 'bg-blue-100 text-blue-800' :
                                exception.type === 'PRIVATE_EVENT' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {getTypeInfo(exception.type).label}
                              </span>
                              {!exception.isActive && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{exception.date}</span>
                              </div>
                              {exception.specialHours && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{exception.specialHours.startTime} - {exception.specialHours.endTime}</span>
                                </div>
                              )}
                            </div>

                            {exception.description && (
                              <p className="text-sm text-gray-600 mb-2">{exception.description}</p>
                            )}

                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Afecta a:</span> {getKitNames(exception.affectedKits || [])}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(exception.id)}
                            className="flex items-center space-x-1"
                          >
                            {exception.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exception)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(exception.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          {isCreating && (
            <div className="w-96 border-l bg-gray-50 overflow-y-auto">
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  {editingId ? 'Editar Excepción' : 'Nueva Excepción'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Mantenimiento general"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <Select
                      required
                      value={formData.type || 'CLOSED'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      options={exceptionTypes.map(type => ({
                        value: type.value,
                        label: `${type.icon} ${type.label}`
                      }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getTypeInfo(formData.type || 'CLOSED').description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <Input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  {formData.type === 'SPECIAL_HOURS' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora inicio
                        </label>
                        <Input
                          type="time"
                          value={formData.specialHours?.startTime || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specialHours: { 
                              ...prev.specialHours, 
                              startTime: e.target.value,
                              endTime: prev.specialHours?.endTime || ''
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora fin
                        </label>
                        <Input
                          type="time"
                          value={formData.specialHours?.endTime || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specialHours: { 
                              ...prev.specialHours, 
                              startTime: prev.specialHours?.startTime || '',
                              endTime: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalles adicionales..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicios Afectados
                    </label>
                    <Select
                      multiple
                      value={formData.affectedKits || []}
                      onChange={(e) => {
                        const selectedKits = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, affectedKits: selectedKits }));
                      }}
                      options={kitOptions}
                      className="h-32"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deja vacío para afectar a todos los servicios
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Activar inmediatamente
                    </label>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Actualizar' : 'Crear'} Excepción
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 