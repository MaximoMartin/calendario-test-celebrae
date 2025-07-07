import React, { useState } from 'react';
import { 
  Package, 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  ArrowLeft,
  ListTodo,
  Settings,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useEntitiesState } from '../hooks/useEntitiesState';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ItemCreator } from './ItemCreator';
import { ExtraCreator } from './ExtraCreator';
import type { Bundle, Item, Extra } from '../types';

interface EditBundlesManagerProps {
  shopId: string;
  onClose: () => void;
}

interface EditItemModalProps {
  item: Item;
  bundleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<Item>) => void;
}

interface EditExtraModalProps {
  extra: Extra;
  bundleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (extraData: Partial<Extra>) => void;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'item' | 'extra';
}

type TabType = 'general' | 'items' | 'extras';

// Modal para editar item
const EditItemModal: React.FC<EditItemModalProps> = ({ item, bundleId, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    price: item.price,
    isPerGroup: item.isPerGroup,
    isForAdult: item.isForAdult,
    isActive: item.isActive
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Editar Item: {item.title}</h3>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <Input
            label="Precio"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPerGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, isPerGroup: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Precio por grupo</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isForAdult}
                onChange={(e) => setFormData(prev => ({ ...prev, isForAdult: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Solo para adultos</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Activo</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
};

// Modal para editar extra
const EditExtraModal: React.FC<EditExtraModalProps> = ({ extra, bundleId, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: extra.title,
    description: extra.description,
    price: extra.price,
    isPerGroup: extra.isPerGroup,
    isForAdult: extra.isForAdult,
    isRequired: extra.isRequired || false,
    maxQuantity: extra.maxQuantity || 1,
    isActive: extra.isActive
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Editar Extra: {extra.title}</h3>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            />
            
            <Input
              label="Cantidad máxima"
              type="number"
              min="1"
              value={formData.maxQuantity}
              onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 1 }))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPerGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, isPerGroup: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Precio por grupo</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isForAdult}
                onChange={(e) => setFormData(prev => ({ ...prev, isForAdult: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Solo para adultos</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Obligatorio</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Activo</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmación para eliminar
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            ¿Estás seguro de que quieres eliminar este {type === 'item' ? 'item' : 'extra'}?
          </p>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button onClick={onClose} variant="outline">Cancelar</Button>
          <Button onClick={onConfirm} variant="danger">Eliminar</Button>
        </div>
      </div>
    </div>
  );
};

export const EditBundlesManager: React.FC<EditBundlesManagerProps> = ({ shopId, onClose }) => {
  const { 
    allBundles, 
    getBundleWithContent, 
    updateBundle, 
    deleteItem, 
    deleteExtra 
  } = useEntitiesState();
  
  const bundles = allBundles.filter(b => b.shopId === shopId);
  
  // Estados principales
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [editData, setEditData] = useState<Partial<Bundle> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados para formularios de edición
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [showCreateExtra, setShowCreateExtra] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showEditExtra, setShowEditExtra] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estados para edición
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; title: string } | null>(null);
  const [deletingExtra, setDeletingExtra] = useState<{ id: string; title: string } | null>(null);

  const selectedBundle = selectedBundleId ? getBundleWithContent(selectedBundleId) : null;

  // Seleccionar bundle para editar
  const handleSelectBundle = (bundleId: string) => {
    const bundle = getBundleWithContent(bundleId);
    if (bundle) {
      setSelectedBundleId(bundleId);
      setEditData({ ...bundle });
      setActiveTab('general');
      setHasChanges(false);
    }
  };

  // Manejar cambios en el formulario general
  const handleGeneralChange = (field: keyof Bundle, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Guardar cambios generales del bundle
  const handleSaveGeneral = () => {
    if (selectedBundleId && editData) {
      updateBundle(selectedBundleId, editData);
      setHasChanges(false);
    }
  };

  // Manejar edición de item
  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowEditItem(true);
  };

  // Manejar edición de extra
  const handleEditExtra = (extra: Extra) => {
    setEditingExtra(extra);
    setShowEditExtra(true);
  };

  // Manejar eliminación de item
  const handleDeleteItem = (item: Item) => {
    setDeletingItem({ id: item.id, title: item.title });
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = () => {
    if (selectedBundleId && deletingItem) {
      deleteItem(selectedBundleId, deletingItem.id);
      setDeletingItem(null);
      setShowDeleteModal(false);
    }
  };

  // Manejar eliminación de extra
  const handleDeleteExtra = (extra: Extra) => {
    setDeletingExtra({ id: extra.id, title: extra.title });
    setShowDeleteModal(true);
  };

  const confirmDeleteExtra = () => {
    if (selectedBundleId && deletingExtra) {
      deleteExtra(selectedBundleId, deletingExtra.id);
      setDeletingExtra(null);
      setShowDeleteModal(false);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setDeletingItem(null);
    setDeletingExtra(null);
    setShowDeleteModal(false);
  };

  // Volver a la lista de bundles
  const handleBackToList = () => {
    setSelectedBundleId(null);
    setEditData(null);
    setActiveTab('general');
    setHasChanges(false);
  };

  // Cerrar formularios de edición
  const handleCloseEditForms = () => {
    setShowEditItem(false);
    setShowEditExtra(false);
    setShowCreateItem(false);
    setShowCreateExtra(false);
    setEditingItem(null);
    setEditingExtra(null);
  };

  // Tabs de navegación
  const tabs = [
    { id: 'general' as TabType, name: 'Datos Generales', icon: Settings },
    { id: 'items' as TabType, name: 'Items', icon: ListTodo },
    { id: 'extras' as TabType, name: 'Extras', icon: Plus }
  ];

  // Renderizar formulario de creación de item
  if (showCreateItem && selectedBundle) {
    return (
      <ItemCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        onItemCreated={handleCloseEditForms}
        onClose={handleCloseEditForms}
      />
    );
  }

  // Renderizar formulario de edición de item
  if (showEditItem && editingItem && selectedBundle) {
    return (
      <ItemCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        itemToEdit={editingItem}
        onItemCreated={handleCloseEditForms}
        onItemUpdated={handleCloseEditForms}
        onClose={handleCloseEditForms}
      />
    );
  }

  // Renderizar formulario de creación de extra
  if (showCreateExtra && selectedBundle) {
    return (
      <ExtraCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        availableItems={selectedBundle.items.map(item => ({ id: item.id, title: item.title }))}
        onExtraCreated={handleCloseEditForms}
        onClose={handleCloseEditForms}
      />
    );
  }

  // Renderizar formulario de edición de extra
  if (showEditExtra && editingExtra && selectedBundle) {
    return (
      <ExtraCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        availableItems={selectedBundle.items.map(item => ({ id: item.id, title: item.title }))}
        extraToEdit={editingExtra}
        onExtraCreated={handleCloseEditForms}
        onExtraUpdated={handleCloseEditForms}
        onClose={handleCloseEditForms}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedBundle && (
            <Button onClick={handleBackToList} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedBundle ? `Editando: ${selectedBundle.name}` : 'Editar Bundles'}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedBundle ? 'Gestiona los datos, items y extras del bundle' : 'Selecciona un bundle para editar'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedBundle && hasChanges && activeTab === 'general' && (
            <Button onClick={handleSaveGeneral} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
          <Button variant="outline" onClick={onClose} size="sm">
            Cerrar
          </Button>
        </div>
      </div>

      {!selectedBundle ? (
        // Lista de bundles
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Selecciona un bundle para editar
          </h3>
          <div className="space-y-3">
            {bundles.map(bundle => (
              <div key={bundle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                    {bundle.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    )}
                    {!bundle.isActive && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{bundle.items.length} items</span>
                    <span>{bundle.extras.length} extras</span>
                    <span>€{bundle.basePrice} precio base</span>
                    <span>Hasta {bundle.maxCapacity} personas</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleSelectBundle(bundle.id)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            ))}
            
            {bundles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No hay bundles en este shop.</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        // Vista de edición del bundle seleccionado
        <div className="space-y-6">
          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      isActive
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                    {tab.id === 'items' && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {selectedBundle.items.length}
                      </span>
                    )}
                    {tab.id === 'extras' && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {selectedBundle.extras.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de cada tab */}
          {activeTab === 'general' && editData && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Datos Generales del Bundle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Nombre del Bundle"
                  value={editData.name || ''}
                  onChange={(e) => handleGeneralChange('name', e.target.value)}
                />
                
                <Input
                  label="Precio base"
                  type="number"
                  step="0.01"
                  value={editData.basePrice || 0}
                  onChange={(e) => handleGeneralChange('basePrice', parseFloat(e.target.value) || 0)}
                />
                
                <Input
                  label="Capacidad máxima"
                  type="number"
                  min="1"
                  value={editData.maxCapacity || 1}
                  onChange={(e) => handleGeneralChange('maxCapacity', parseInt(e.target.value) || 1)}
                />
                
                <Input
                  label="Duración (minutos)"
                  type="number"
                  min="15"
                  value={editData.duration || 60}
                  onChange={(e) => handleGeneralChange('duration', parseInt(e.target.value) || 60)}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => handleGeneralChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Política de cancelación"
                  value={editData.bookingSettings?.cancellationPolicy || ''}
                  onChange={(e) => handleGeneralChange('bookingSettings', {
                    ...editData.bookingSettings,
                    cancellationPolicy: e.target.value
                  })}
                />
                
                <Input
                  label="Política de reembolso"
                  value={editData.bookingSettings?.refundPolicy || ''}
                  onChange={(e) => handleGeneralChange('bookingSettings', {
                    ...editData.bookingSettings,
                    refundPolicy: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.isFeatured || false}
                    onChange={(e) => handleGeneralChange('isFeatured', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Bundle destacado</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.isActive !== false}
                    onChange={(e) => handleGeneralChange('isActive', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Bundle activo</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.bookingSettings?.allowInstantBooking || false}
                    onChange={(e) => handleGeneralChange('bookingSettings', {
                      ...editData.bookingSettings,
                      allowInstantBooking: e.target.checked
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Permitir reservas instantáneas</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.bookingSettings?.requiresApproval || false}
                    onChange={(e) => handleGeneralChange('bookingSettings', {
                      ...editData.bookingSettings,
                      requiresApproval: e.target.checked
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Requiere aprobación manual</span>
                </label>
              </div>
            </Card>
          )}

          {activeTab === 'items' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Items del Bundle</h3>
                <Button onClick={() => setShowCreateItem(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {selectedBundle.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        {!item.isActive && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Inactivo
                          </span>
                        )}
                        {item.isForAdult && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            +18
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>€{item.price} {item.isPerGroup ? 'por grupo' : 'por persona'}</span>
                        <span>Capacidad: {item.bookingConfig?.maxCapacity || 'N/A'}</span>
                        <span>Duración: {item.bookingConfig?.duration || 'N/A'} min</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {selectedBundle.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No hay items en este bundle.</p>
                    <p className="text-sm">Agrega items para que los clientes puedan reservar este bundle.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'extras' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Extras del Bundle</h3>
                <Button onClick={() => setShowCreateExtra(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Extra
                </Button>
              </div>
              
              <div className="space-y-3">
                {selectedBundle.extras.map(extra => (
                  <div key={extra.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{extra.title}</h4>
                        {!extra.isActive && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Inactivo
                          </span>
                        )}
                        {extra.isRequired && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Obligatorio
                          </span>
                        )}
                        {extra.isForAdult && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            +18
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{extra.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>€{extra.price} {extra.isPerGroup ? 'por grupo' : 'por persona'}</span>
                        <span>Cantidad máxima: {extra.maxQuantity || 'Ilimitada'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditExtra(extra)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteExtra(extra)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {selectedBundle.extras.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No hay extras en este bundle.</p>
                    <p className="text-sm">Los extras son opcionales y permiten personalizar la experiencia.</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modales */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={deletingItem ? confirmDeleteItem : confirmDeleteExtra}
        title={deletingItem?.title || deletingExtra?.title || ''}
        message={
          deletingItem 
            ? 'Esta acción no se puede deshacer. El item será eliminado permanentemente del bundle.'
            : 'Esta acción no se puede deshacer. El extra será eliminado permanentemente del bundle.'
        }
        type={deletingItem ? 'item' : 'extra'}
      />
    </div>
  );
}; 