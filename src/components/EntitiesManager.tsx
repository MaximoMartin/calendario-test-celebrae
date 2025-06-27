import React, { useState } from 'react';
import { Store, Package, Target, Plus, Settings, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CreateShopForm } from './CreateShopForm';
import { CreateBundleForm } from './CreateBundleForm';
import { ItemCreator } from './ItemCreator';
import { ExtraCreator } from './ExtraCreator';
import { useEntitiesState } from '../hooks/useEntitiesState';
import { useShopState } from '../hooks/useShopState';

// 🎯 CHECKPOINT 10: ADMINISTRADOR DE ENTIDADES DEL SISTEMA

type EntityFormType = 'shop' | 'bundle' | 'item' | 'extra' | null;

interface SelectedBundle {
  id: string;
  name: string;
  items: Array<{ id: string; title: string }>;
}

export const EntitiesManager: React.FC = () => {
  const { allShops, allBundles, allItems, dynamicEntitiesCount } = useEntitiesState();
  const { selectedShopId, selectedShop } = useShopState();
  
  // Estados para formularios
  const [activeForm, setActiveForm] = useState<EntityFormType>(null);
  const [selectedBundle, setSelectedBundle] = useState<SelectedBundle | null>(null);

  // Cerrar formularios
  const closeForm = () => {
    setActiveForm(null);
    setSelectedBundle(null);
  };

  // Manejo de callbacks de éxito
  const handleShopCreated = (shopId: string) => {
    console.log('✅ Shop creado con ID:', shopId);
    // Aquí podrías cambiar al shop recién creado automáticamente
  };

  const handleBundleCreated = (bundleId: string) => {
    console.log('✅ Bundle creado con ID:', bundleId);
    // Aquí podrías mostrar opciones para agregar items/extras
  };

  const handleItemCreated = (itemId: string) => {
    console.log('✅ Item creado con ID:', itemId);
  };

  const handleExtraCreated = (extraId: string) => {
    console.log('✅ Extra creado con ID:', extraId);
  };

  // Obtener bundles del shop seleccionado
  const shopBundles = allBundles.filter(bundle => bundle.shopId === selectedShopId);
  
  // Renderizar formulario activo
  if (activeForm === 'shop') {
    return (
      <CreateShopForm
        onShopCreated={handleShopCreated}
        onClose={closeForm}
      />
    );
  }

  if (activeForm === 'bundle') {
    return (
      <CreateBundleForm
        shopId={selectedShopId}
        shopName={selectedShop.name}
        onBundleCreated={handleBundleCreated}
        onClose={closeForm}
      />
    );
  }

  if (activeForm === 'item' && selectedBundle) {
    return (
      <ItemCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        onItemCreated={handleItemCreated}
        onClose={closeForm}
      />
    );
  }

  if (activeForm === 'extra' && selectedBundle) {
    return (
      <ExtraCreator
        bundleId={selectedBundle.id}
        bundleName={selectedBundle.name}
        availableItems={selectedBundle.items}
        onExtraCreated={handleExtraCreated}
        onClose={closeForm}
      />
    );
  }

  // Vista principal del administrador
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Administrador de Entidades
        </h1>
        <p className="text-gray-600">
          Crea y gestiona shops, bundles, items y extras desde esta interfaz
        </p>
      </div>

      {/* Estadísticas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Estado del Sistema
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Store className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{allShops.length}</div>
            <div className="text-sm text-blue-600">Shops Totales</div>
            {dynamicEntitiesCount.shops > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{dynamicEntitiesCount.shops} creados
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{allBundles.length}</div>
            <div className="text-sm text-purple-600">Bundles Totales</div>
            {dynamicEntitiesCount.bundles > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{dynamicEntitiesCount.bundles} creados
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{allItems.length}</div>
            <div className="text-sm text-green-600">Items Totales</div>
            {dynamicEntitiesCount.items > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{dynamicEntitiesCount.items} creados
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Plus className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{allItems.reduce((total, item) => total + (allBundles.find(b => b.id === item.bundleId)?.extras?.length || 0), 0)}</div>
            <div className="text-sm text-orange-600">Extras Totales</div>
            {dynamicEntitiesCount.extras > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{dynamicEntitiesCount.extras} creados
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear Shop */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Shop</h3>
              <p className="text-sm text-gray-500">Configurar un nuevo espacio de negocios</p>
            </div>
          </div>
          <Button
            onClick={() => setActiveForm('shop')}
            className="w-full"
          >
            <Store className="w-4 h-4 mr-2" />
            Crear Shop
          </Button>
        </Card>

        {/* Crear Bundle */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crear Bundle</h3>
              <p className="text-sm text-gray-500">Para el shop: {selectedShop.name}</p>
            </div>
          </div>
          <Button
            onClick={() => setActiveForm('bundle')}
            className="w-full"
            variant="secondary"
          >
            <Package className="w-4 h-4 mr-2" />
            Crear Bundle
          </Button>
        </Card>
      </div>

      {/* Gestión de bundles existentes */}
      {shopBundles.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Agregar Contenido a Bundles Existentes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Shop seleccionado: {selectedShop.name}
          </p>
          
          <div className="space-y-3">
            {shopBundles.map(bundle => {
              const bundleItems = allItems.filter(item => item.bundleId === bundle.id);
              
              return (
                <div key={bundle.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                      <p className="text-sm text-gray-500">
                        {bundleItems.length} items • {bundle.extras?.length || 0} extras
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedBundle({
                          id: bundle.id,
                          name: bundle.name,
                          items: bundleItems.map(item => ({ id: item.id, title: item.title }))
                        });
                        setActiveForm('item');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Agregar Item
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setSelectedBundle({
                          id: bundle.id,
                          name: bundle.name,
                          items: bundleItems.map(item => ({ id: item.id, title: item.title }))
                        });
                        setActiveForm('extra');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Extra
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Información del usuario */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">¡Construye tu negocio paso a paso!</h3>
            <p className="text-sm text-gray-600">
              1. Crea un Shop → 2. Agrega Bundles → 3. Define Items → 4. Añade Extras → 5. ¡Recibe reservas!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}; 