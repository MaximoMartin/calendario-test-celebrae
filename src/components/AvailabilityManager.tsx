import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, Ban, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { mockAvailabilityBlocks } from '../mockData';
import type { AvailabilityBlock, Kit } from '../types';

interface AvailabilityManagerProps {
  shopId: string;
  kits: Kit[];
  onClose?: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  shopId,
  kits,
  onClose
}) => {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(mockAvailabilityBlocks);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AvailabilityBlock>>({
    type: 'BLOCKED',
    isActive: true,
    settings: {}
  });

  const blockTypes = [
    {
      value: 'BLOCKED',
      label: 'Bloqueado',
      icon: <Ban className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800',
      description: 'Bloquea completamente la disponibilidad'
    },
    {
      value: 'SPECIAL_PRICING',
      label: 'Precios Especiales',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800',
      description: 'Aplica multiplicador de precio especial'
    },
    {
      value: 'LIMITED_CAPACITY',
      label: 'Capacidad Limitada',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Reduce la capacidad máxima de reservas'
    }
  ];

  const kitOptions = [
    { value: '', label: 'Todos los servicios' },
    ...kits.map(kit => ({
      value: kit.id,
      label: kit.name
    }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.type || !formData.reason) {
      return;
    }

    const newBlock: AvailabilityBlock = {
      id: editingId || `block_${Date.now()}`,
      shopId,
      itemId: formData.itemId || undefined,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      type: formData.type as AvailabilityBlock['type'],
      reason: formData.reason!,
      settings: formData.settings,
      isActive: formData.isActive ?? true
    };

    if (editingId) {
      setBlocks(prev => prev.map(block => 
        block.id === editingId ? newBlock : block
      ));
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'BLOCKED',
      isActive: true
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (block: AvailabilityBlock) => {
    setFormData(block);
    setEditingId(block.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este bloque de disponibilidad?')) {
      setBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, isActive: !block.isActive } : block
    ));
  };

  const getTypeInfo = (type: string) => {
    return blockTypes.find(t => t.value === type) || blockTypes[0];
  };

  const getKitName = (kitId?: string) => {
    if (!kitId) return 'Todos los servicios';
    const kit = kits.find(k => k.id === kitId);
    return kit?.name || 'Servicio desconocido';
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('es-ES');
    const end = new Date(endDate).toLocaleDateString('es-ES');
    return startDate === endDate ? start : `${start} - ${end}`;
  };

  const isDateRangeValid = (startDate: string, endDate: string) => {
    return new Date(startDate) <= new Date(endDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Disponibilidad Avanzada</h2>
              <p className="text-sm text-gray-600">Administra bloques especiales, precios y capacidades</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Bloque</span>
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </div>
        </div>

        <div className="flex h-full">
          {/* Lista de Bloques */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">Bloques de Disponibilidad</h3>
              
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay bloques de disponibilidad configurados</p>
                  <p className="text-sm">Crea bloques para gestionar períodos especiales</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block) => {
                    const typeInfo = getTypeInfo(block.type);
                    return (
                      <div
                        key={block.id}
                        className={`border rounded-lg p-4 ${
                          block.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1">{typeInfo.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{block.reason}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                                {!block.isActive && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Inactivo
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDateRange(block.startDate, block.endDate)}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{getKitName(block.itemId)}</span>
                                </div>

                                {block.settings && (
                                  <div className="flex items-center space-x-1">
                                    {block.type === 'SPECIAL_PRICING' && block.settings.priceMultiplier && (
                                      <>
                                        <TrendingUp className="w-4 h-4" />
                                        <span>x{block.settings.priceMultiplier} precio</span>
                                      </>
                                    )}
                                    {block.type === 'LIMITED_CAPACITY' && block.settings.maxBookings && (
                                      <>
                                        <Users className="w-4 h-4" />
                                        <span>Máx. {block.settings.maxBookings} reservas</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 mt-2">{typeInfo.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(block.id)}
                              className="flex items-center space-x-1"
                            >
                              {block.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(block)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(block.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          {isCreating && (
            <div className="w-96 border-l bg-gray-50 overflow-y-auto">
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  {editingId ? 'Editar Bloque' : 'Nuevo Bloque'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Bloque *
                    </label>
                    <Select
                      required
                      value={formData.type || 'BLOCKED'}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          type: e.target.value as any,
                          settings: {} // Reset settings when type changes
                        }));
                      }}
                      options={blockTypes.map(type => ({
                        value: type.value,
                        label: type.label
                      }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getTypeInfo(formData.type || 'BLOCKED').description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razón *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.reason || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Ej: Promoción Black Friday"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha inicio *
                      </label>
                      <Input
                        type="date"
                        required
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha fin *
                      </label>
                      <Input
                        type="date"
                        required
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formData.startDate && formData.endDate && !isDateRangeValid(formData.startDate, formData.endDate) && (
                    <div className="text-sm text-red-600">
                      La fecha de fin debe ser posterior o igual a la fecha de inicio
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicio Afectado
                    </label>
                    <Select
                      value={formData.itemId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value || undefined }))}
                      options={kitOptions}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deja vacío para afectar a todos los servicios
                    </p>
                  </div>

                  {/* Settings específicos por tipo */}
                  {formData.type === 'SPECIAL_PRICING' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Multiplicador de Precio *
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        required
                        value={formData.settings?.priceMultiplier || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { 
                            ...prev.settings, 
                            priceMultiplier: parseFloat(e.target.value) || 1
                          }
                        }))}
                        placeholder="1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ej: 1.5 = 50% más caro, 0.8 = 20% de descuento
                      </p>
                    </div>
                  )}

                  {formData.type === 'LIMITED_CAPACITY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de Reservas *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={formData.settings?.maxBookings || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { 
                            ...prev.settings, 
                            maxBookings: parseInt(e.target.value) || 1
                          }
                        }))}
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Número máximo de reservas permitidas por slot
                      </p>
                    </div>
                  )}

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
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={formData.startDate && formData.endDate && !isDateRangeValid(formData.startDate, formData.endDate)}
                    >
                      {editingId ? 'Actualizar' : 'Crear'} Bloque
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