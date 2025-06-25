// ========================================
// GESTOR DE CONFIGURACIONES DEL SISTEMA
// ========================================

import React, { useState, useCallback, useMemo } from 'react';
import type { BookingSettings, BusinessHours, Shop } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Settings, Save, RotateCcw, Check, X, Bell,
  Clock, Shield, Mail, Smartphone, Globe,
  DollarSign, Users, Package, Calendar,
  AlertTriangle, Info, Eye, EyeOff, Copy,
  Database, Cloud, Download, Upload
} from 'lucide-react';

// ========================================
// TIPOS DE CONFIGURACIONES
// ========================================

export type SettingsCategory = 
  | 'GENERAL'
  | 'BOOKINGS'
  | 'NOTIFICATIONS'
  | 'BUSINESS_HOURS'
  | 'PRICING'
  | 'SECURITY'
  | 'INTEGRATIONS'
  | 'BACKUP'
  | 'APPEARANCE';

export interface SystemSettings {
  general: GeneralSettings;
  bookings: BookingSettings;
  notifications: NotificationSettings;
  businessHours: BusinessHours[];
  pricing: PricingSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  backup: BackupSettings;
  appearance: AppearanceSettings;
}

export interface GeneralSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  reminderTiming: number; // horas antes
  confirmationAutoSend: boolean;
  cancellationNotifications: boolean;
  adminAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  templates: {
    confirmation: string;
    reminder: string;
    cancellation: string;
  };
}

export interface PricingSettings {
  taxRate: number;
  currency: string;
  priceDisplayMode: 'WITH_TAX' | 'WITHOUT_TAX' | 'BOTH';
  discountSettings: {
    allowPercentage: boolean;
    allowFixed: boolean;
    maxDiscountPercent: number;
  };
  paymentSettings: {
    requiresDeposit: boolean;
    depositPercentage: number;
    paymentMethods: string[];
    cancellationPolicy: string;
  };
}

export interface SecuritySettings {
  requireTwoFactor: boolean;
  sessionTimeout: number; // minutos
  passwordRequirements: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  accessControl: {
    allowGuestBooking: boolean;
    requirePhoneVerification: boolean;
    requireEmailVerification: boolean;
  };
  auditLog: {
    enabled: boolean;
    retentionDays: number;
  };
}

export interface IntegrationSettings {
  googleCalendar: {
    enabled: boolean;
    calendarId?: string;
    syncDirection: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';
  };
  emailProvider: {
    provider: 'SMTP' | 'SENDGRID' | 'MAILGUN';
    configuration: Record<string, string>;
  };
  smsProvider: {
    provider: 'TWILIO' | 'NEXMO' | 'AWS_SNS';
    configuration: Record<string, string>;
  };
  paymentGateway: {
    provider: 'STRIPE' | 'PAYPAL' | 'MERCADOPAGO';
    configuration: Record<string, string>;
  };
  webhooks: {
    url?: string;
    events: string[];
    secret?: string;
  };
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  backupRetention: number; // días
  includeImages: boolean;
  cloudStorage: {
    provider: 'AWS_S3' | 'GOOGLE_DRIVE' | 'DROPBOX';
    configuration: Record<string, string>;
  };
}

export interface AppearanceSettings {
  theme: 'LIGHT' | 'DARK' | 'AUTO';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  compactMode: boolean;
  showAdvancedFeatures: boolean;
  dashboardLayout: 'CARDS' | 'LIST' | 'GRID';
}

// ========================================
// CONFIGURACIONES POR CATEGORÍA
// ========================================

interface SettingsCategoryConfig {
  id: SettingsCategory;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const SETTINGS_CATEGORIES: SettingsCategoryConfig[] = [
  {
    id: 'GENERAL',
    title: 'General',
    description: 'Información básica del negocio y configuración regional',
    icon: Settings,
    color: 'bg-gray-600'
  },
  {
    id: 'BOOKINGS',
    title: 'Reservas',
    description: 'Configuración de políticas y restricciones de reservas',
    icon: Calendar,
    color: 'bg-blue-600'
  },
  {
    id: 'NOTIFICATIONS',
    title: 'Notificaciones',
    description: 'Configuración de emails, SMS y notificaciones push',
    icon: Bell,
    color: 'bg-purple-600'
  },
  {
    id: 'BUSINESS_HOURS',
    title: 'Horarios',
    description: 'Horarios de atención y disponibilidad',
    icon: Clock,
    color: 'bg-green-600'
  },
  {
    id: 'PRICING',
    title: 'Precios',
    description: 'Configuración de precios, impuestos y descuentos',
    icon: DollarSign,
    color: 'bg-yellow-600'
  },
  {
    id: 'SECURITY',
    title: 'Seguridad',
    description: 'Configuración de seguridad y control de acceso',
    icon: Shield,
    color: 'bg-red-600'
  },
  {
    id: 'INTEGRATIONS',
    title: 'Integraciones',
    description: 'Conexiones con servicios externos y APIs',
    icon: Globe,
    color: 'bg-indigo-600'
  },
  {
    id: 'BACKUP',
    title: 'Respaldos',
    description: 'Configuración de respaldos automáticos',
    icon: Database,
    color: 'bg-teal-600'
  },
  {
    id: 'APPEARANCE',
    title: 'Apariencia',
    description: 'Personalización de tema y diseño',
    icon: Eye,
    color: 'bg-pink-600'
  }
];

// ========================================
// PROPS DEL COMPONENTE
// ========================================

interface SettingsManagerProps {
  currentSettings: SystemSettings;
  onSettingsUpdate: (settings: SystemSettings) => void;
  onSave: (settings: SystemSettings) => void;
  onExportSettings?: () => void;
  onImportSettings?: (file: File) => void;
  canEditAdvanced?: boolean;
  shop?: Shop;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  currentSettings,
  onSettingsUpdate,
  onSave,
  onExportSettings,
  onImportSettings,
  canEditAdvanced = true,
  shop
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>('GENERAL');
  const [settings, setSettings] = useState<SystemSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // ========================================
  // HANDLERS
  // ========================================

  const updateSettings = useCallback(<T extends keyof SystemSettings>(
    category: T, 
    updates: Partial<SystemSettings[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onSettingsUpdate(settings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSave, onSettingsUpdate]);

  const handleReset = useCallback(() => {
    setSettings(currentSettings);
    setHasChanges(false);
  }, [currentSettings]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `configuraciones-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    onExportSettings?.();
  }, [settings, onExportSettings]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasChanges(true);
        onImportSettings?.(file);
      } catch (error) {
        console.error('Error importando configuraciones:', error);
        alert('Error al importar el archivo de configuraciones');
      }
    };
    reader.readAsText(file);
  }, [onImportSettings]);

  // ========================================
  // RENDERIZADO POR CATEGORÍA
  // ========================================

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Negocio
          </label>
          <Input
            type="text"
            value={settings.general.businessName}
            onChange={(e) => updateSettings('general', { businessName: e.target.value })}
            placeholder="Mi Negocio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email del Negocio
          </label>
          <Input
            type="email"
            value={settings.general.businessEmail}
            onChange={(e) => updateSettings('general', { businessEmail: e.target.value })}
            placeholder="contacto@minegocio.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <Input
          type="text"
          value={settings.general.businessAddress}
          onChange={(e) => updateSettings('general', { businessAddress: e.target.value })}
          placeholder="Calle, Ciudad, País"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona Horaria
          </label>
          <Select
            value={settings.general.timezone}
            onChange={(e) => updateSettings('general', { timezone: e.target.value })}
            options={[
              { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
              { value: 'America/Mexico_City', label: 'México (GMT-6)' },
              { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
              { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moneda
          </label>
          <Select
            value={settings.general.currency}
            onChange={(e) => updateSettings('general', { currency: e.target.value })}
            options={[
              { value: 'ARS', label: 'Peso Argentino (ARS)' },
              { value: 'USD', label: 'Dólar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'MXN', label: 'Peso Mexicano (MXN)' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formato de Hora
          </label>
          <Select
            value={settings.general.timeFormat}
            onChange={(e) => updateSettings('general', { timeFormat: e.target.value as '12h' | '24h' })}
            options={[
              { value: '24h', label: '24 horas (15:30)' },
              { value: '12h', label: '12 horas (3:30 PM)' }
            ]}
          />
        </div>
      </div>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horas mínimas de anticipación
          </label>
          <Input
            type="number"
            min="0"
            value={settings.bookings.hoursBeforeBooking}
            onChange={(e) => updateSettings('bookings', { hoursBeforeBooking: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días máximos de anticipación
          </label>
          <Input
            type="number"
            min="1"
            value={settings.bookings.maxAdvanceBookingDays}
            onChange={(e) => updateSettings('bookings', { maxAdvanceBookingDays: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Máximo reservas simultáneas por cliente
          </label>
          <Input
            type="number"
            min="1"
            value={settings.bookings.maxSimultaneousBookings}
            onChange={(e) => updateSettings('bookings', { maxSimultaneousBookings: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.bookings.allowSameDayBooking}
              onChange={(e) => updateSettings('bookings', { allowSameDayBooking: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Permitir reservas el mismo día
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.bookings.autoConfirmBookings}
              onChange={(e) => updateSettings('bookings', { autoConfirmBookings: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Confirmar reservas automáticamente
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.bookings.requiresPhoneVerification}
              onChange={(e) => updateSettings('bookings', { requiresPhoneVerification: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Requerir verificación telefónica
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.notifications.emailEnabled}
            onChange={(e) => updateSettings('notifications', { emailEnabled: e.target.checked })}
            className="rounded"
          />
          <Mail className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">
            Notificaciones por Email
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.notifications.smsEnabled}
            onChange={(e) => updateSettings('notifications', { smsEnabled: e.target.checked })}
            className="rounded"
          />
          <Smartphone className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">
            Notificaciones por SMS
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.notifications.pushEnabled}
            onChange={(e) => updateSettings('notifications', { pushEnabled: e.target.checked })}
            className="rounded"
          />
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700">
            Notificaciones Push
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recordatorios (horas antes)
          </label>
          <Input
            type="number"
            min="1"
            max="168"
            value={settings.notifications.reminderTiming}
            onChange={(e) => updateSettings('notifications', { reminderTiming: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.confirmationAutoSend}
              onChange={(e) => updateSettings('notifications', { confirmationAutoSend: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Enviar confirmaciones automáticamente
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.cancellationNotifications}
              onChange={(e) => updateSettings('notifications', { cancellationNotifications: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Notificar cancelaciones
            </span>
          </label>
        </div>
      </div>

      {/* Horarios silenciosos */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            checked={settings.notifications.quietHours.enabled}
            onChange={(e) => updateSettings('notifications', {
              quietHours: { ...settings.notifications.quietHours, enabled: e.target.checked }
            })}
            className="rounded"
          />
          <Clock className="w-4 h-4" />
          <span className="font-medium text-gray-900">Horarios Silenciosos</span>
        </div>

        {settings.notifications.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Desde</label>
              <Input
                type="time"
                value={settings.notifications.quietHours.start}
                onChange={(e) => updateSettings('notifications', {
                  quietHours: { ...settings.notifications.quietHours, start: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hasta</label>
              <Input
                type="time"
                value={settings.notifications.quietHours.end}
                onChange={(e) => updateSettings('notifications', {
                  quietHours: { ...settings.notifications.quietHours, end: e.target.value }
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasa de Impuesto (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={settings.pricing.taxRate}
            onChange={(e) => updateSettings('pricing', { taxRate: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mostrar Precios
          </label>
          <Select
            value={settings.pricing.priceDisplayMode}
            onChange={(e) => updateSettings('pricing', { priceDisplayMode: e.target.value as any })}
            options={[
              { value: 'WITH_TAX', label: 'Con impuestos incluidos' },
              { value: 'WITHOUT_TAX', label: 'Sin impuestos' },
              { value: 'BOTH', label: 'Ambos (con y sin)' }
            ]}
          />
        </div>
      </div>

      {/* Configuración de descuentos */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Configuración de Descuentos</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pricing.discountSettings.allowPercentage}
              onChange={(e) => updateSettings('pricing', {
                discountSettings: { 
                  ...settings.pricing.discountSettings, 
                  allowPercentage: e.target.checked 
                }
              })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Permitir descuentos porcentuales
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pricing.discountSettings.allowFixed}
              onChange={(e) => updateSettings('pricing', {
                discountSettings: { 
                  ...settings.pricing.discountSettings, 
                  allowFixed: e.target.checked 
                }
              })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Permitir descuentos fijos
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento máximo (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={settings.pricing.discountSettings.maxDiscountPercent}
              onChange={(e) => updateSettings('pricing', {
                discountSettings: { 
                  ...settings.pricing.discountSettings, 
                  maxDiscountPercent: parseInt(e.target.value) 
                }
              })}
            />
          </div>
        </div>
      </div>

      {/* Configuración de pagos */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Configuración de Pagos</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pricing.paymentSettings.requiresDeposit}
              onChange={(e) => updateSettings('pricing', {
                paymentSettings: { 
                  ...settings.pricing.paymentSettings, 
                  requiresDeposit: e.target.checked 
                }
              })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Requerir depósito
            </span>
          </label>

          {settings.pricing.paymentSettings.requiresDeposit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de depósito (%)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={settings.pricing.paymentSettings.depositPercentage}
                onChange={(e) => updateSettings('pricing', {
                  paymentSettings: { 
                    ...settings.pricing.paymentSettings, 
                    depositPercentage: parseInt(e.target.value) 
                  }
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center space-x-2"
        >
          {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.security.requireTwoFactor}
            onChange={(e) => updateSettings('security', { requireTwoFactor: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Requerir autenticación de dos factores
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo de sesión (minutos)
          </label>
          <Input
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSettings('security', { sessionTimeout: parseInt(e.target.value) })}
          />
        </div>
      </div>

      {/* Requisitos de contraseña */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Requisitos de Contraseña</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud mínima
            </label>
            <Input
              type="number"
              min="4"
              max="64"
              value={settings.security.passwordRequirements.minLength}
              onChange={(e) => updateSettings('security', {
                passwordRequirements: { 
                  ...settings.security.passwordRequirements, 
                  minLength: parseInt(e.target.value) 
                }
              })}
            />
          </div>

          <div className="space-y-2">
            {[
              { key: 'requireUppercase', label: 'Mayúsculas requeridas' },
              { key: 'requireLowercase', label: 'Minúsculas requeridas' },
              { key: 'requireNumbers', label: 'Números requeridos' },
              { key: 'requireSymbols', label: 'Símbolos requeridos' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.security.passwordRequirements[key as keyof typeof settings.security.passwordRequirements] as boolean}
                  onChange={(e) => updateSettings('security', {
                    passwordRequirements: { 
                      ...settings.security.passwordRequirements, 
                      [key]: e.target.checked 
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Control de acceso */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Control de Acceso</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.security.accessControl.allowGuestBooking}
              onChange={(e) => updateSettings('security', {
                accessControl: { 
                  ...settings.security.accessControl, 
                  allowGuestBooking: e.target.checked 
                }
              })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Permitir reservas como invitado
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.security.accessControl.requireEmailVerification}
              onChange={(e) => updateSettings('security', {
                accessControl: { 
                  ...settings.security.accessControl, 
                  requireEmailVerification: e.target.checked 
                }
              })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Requerir verificación de email
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tema
          </label>
          <Select
            value={settings.appearance.theme}
            onChange={(e) => updateSettings('appearance', { theme: e.target.value as any })}
            options={[
              { value: 'LIGHT', label: 'Claro' },
              { value: 'DARK', label: 'Oscuro' },
              { value: 'AUTO', label: 'Automático' }
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color Primario
          </label>
          <Input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => updateSettings('appearance', { primaryColor: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diseño del Dashboard
          </label>
          <Select
            value={settings.appearance.dashboardLayout}
            onChange={(e) => updateSettings('appearance', { dashboardLayout: e.target.value as any })}
            options={[
              { value: 'CARDS', label: 'Tarjetas' },
              { value: 'LIST', label: 'Lista' },
              { value: 'GRID', label: 'Grilla' }
            ]}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.appearance.compactMode}
            onChange={(e) => updateSettings('appearance', { compactMode: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Modo compacto
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.appearance.showAdvancedFeatures}
            onChange={(e) => updateSettings('appearance', { showAdvancedFeatures: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Mostrar funciones avanzadas
          </span>
        </label>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (selectedCategory) {
      case 'GENERAL': return renderGeneralSettings();
      case 'BOOKINGS': return renderBookingSettings();
      case 'NOTIFICATIONS': return renderNotificationSettings();
      case 'PRICING': return renderPricingSettings();
      case 'SECURITY': return renderSecuritySettings();
      case 'APPEARANCE': return renderAppearanceSettings();
      default: 
        return (
          <div className="text-center py-8 text-gray-500">
            <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Configuración en desarrollo</p>
          </div>
        );
    }
  };

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <span>Configuraciones del Sistema</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Gestiona todas las configuraciones de tu negocio
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-settings"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-settings')?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>

            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center space-x-2 text-orange-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetear</span>
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Navegación por categorías */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedCategory === category.id
                  ? `${category.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{category.title}</div>
            </button>
          ))}
        </div>

        {/* Descripción de la categoría seleccionada */}
        {(() => {
          const category = SETTINGS_CATEGORIES.find(c => c.id === selectedCategory);
          return category ? (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ) : null;
        })()}
      </Card>

      {/* Contenido de configuraciones */}
      <Card className="p-6">
        {renderSettingsContent()}
      </Card>

      {/* Indicador de cambios */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Tienes cambios sin guardar</span>
          </div>
        </div>
      )}
    </div>
  );
}; 