import React, { useState } from 'react';
import { Calendar, Building, Package, Shield, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { AvailabilityRule } from '../types';
import { mockAvailabilityRules } from '../mockData/availabilityRules';
import { extendedShops, bundles, items } from '../mockData/entitiesData';

interface AvailabilityRulesManagerProps {
  shopId?: string;
  onClose?: () => void;
}

export const AvailabilityRulesManager: React.FC<AvailabilityRulesManagerProps> = ({
  shopId
}) => {
  const [rules] = useState<AvailabilityRule[]>(mockAvailabilityRules);

  // Filtrar reglas por shop seleccionado
  const filteredRules = rules.filter(rule => {
    if (!shopId) return true;
    
    if (rule.level === 'SHOP' && rule.targetId !== shopId) return false;
    if (rule.level === 'BUNDLE') {
      const bundle = bundles.find(b => b.id === rule.targetId);
      if (!bundle || bundle.shopId !== shopId) return false;
    }
    if (rule.level === 'ITEM') {
      const item = items.find(i => i.id === rule.targetId);
      if (!item) return false;
      const bundle = bundles.find(b => b.id === item.bundleId);
      if (!bundle || bundle.shopId !== shopId) return false;
    }
    
    return true;
  });

  const getTypeIcon = (type: string) => {
    return type === 'CLOSED' ? 
      <AlertCircle className="w-4 h-4 text-red-500" /> : 
      <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'SHOP':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'BUNDLE':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'ITEM':
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTargetName = (rule: AvailabilityRule) => {
    switch (rule.level) {
      case 'SHOP':
        const shop = extendedShops.find(s => s.id === rule.targetId);
        return shop?.name || 'Shop desconocido';
      case 'BUNDLE':
        const bundle = bundles.find(b => b.id === rule.targetId);
        return bundle?.name || 'Bundle desconocido';
      case 'ITEM':
        const item = items.find(i => i.id === rule.targetId);
        return item?.title || 'Item desconocido';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Card className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reglas de Disponibilidad</h2>
            <p className="text-sm text-gray-600">Gestiona bloqueos y horarios especiales</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Regla</span>
          </Button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Reglas Activas ({filteredRules.length})
        </h3>
        
        {filteredRules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay reglas configuradas</p>
            <p className="text-sm">Las reglas te permiten bloquear horarios específicos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`border rounded-lg p-4 ${
                  rule.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1 flex items-center space-x-1">
                      {getTypeIcon(rule.type)}
                      {getLevelIcon(rule.level)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.type === 'CLOSED' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {rule.type === 'CLOSED' ? 'Bloqueo' : 'Apertura'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {rule.level}
                        </span>
                        {!rule.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactivo
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">Target:</span> {getTargetName(rule)}</div>
                        <div><span className="font-medium">Razón:</span> {rule.reason}</div>
                        <div><span className="font-medium">Prioridad:</span> {rule.priority}</div>
                        {rule.weekdays && rule.weekdays.length > 0 && (
                          <div><span className="font-medium">Días:</span> {rule.weekdays.join(', ')}</div>
                        )}
                        {rule.specificDates && rule.specificDates.length > 0 && (
                          <div><span className="font-medium">Fechas:</span> {rule.specificDates.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm">
                      {rule.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}; 