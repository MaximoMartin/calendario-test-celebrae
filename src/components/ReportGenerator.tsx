// ========================================
// GENERADOR DE REPORTES AVANZADO
// ========================================

import React, { useState, useMemo, useCallback } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Booking, Bundle, BookingStatus, Shop } from '../types/newModel';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  FileText, Download, Calendar, TrendingUp, Users,
  DollarSign, Package, BarChart3, PieChart, Activity,
  Filter, Settings, Eye, Share2, Clock, Star,
  CheckCircle, XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';

// ========================================
// TIPOS DE REPORTES
// ========================================

export type ReportType = 
  | 'BOOKINGS_SUMMARY'
  | 'REVENUE_ANALYSIS'
  | 'CUSTOMER_INSIGHTS'
  | 'SERVICE_PERFORMANCE'
  | 'OPERATIONAL_METRICS'
  | 'CANCELLATION_ANALYSIS'
  | 'PEAK_HOURS_REPORT'
  | 'CUSTOMER_RETENTION'
  | 'COMPARATIVE_ANALYSIS'
  | 'CUSTOM_REPORT';

export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
export type ReportPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export interface ReportTemplate {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'ANALYSIS';
  estimatedTime: string;
  requiredData: string[];
  supportedFormats: ReportFormat[];
  isPremium?: boolean;
}

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  period?: ReportPeriod;
  statuses?: BookingStatus[];
  bundleIds?: string[];
  shopIds?: string[];
  customerEmails?: string[];
  includeArchived?: boolean;
  groupBy?: 'DATE' | 'STATUS' | 'BUNDLE' | 'CUSTOMER' | 'SHOP';
  sortBy?: 'DATE' | 'AMOUNT' | 'COUNT' | 'ALPHABETIC';
  sortDirection?: 'ASC' | 'DESC';
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  period: { from: string; to: string };
  filters: ReportFilter;
  summary: ReportSummary;
  sections: ReportSection[];
  metadata: {
    totalRecords: number;
    processingTime: number;
    generatedBy: string;
    version: string;
  };
}

export interface ReportSummary {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  uniqueCustomers: number;
  topPerformingService: string;
  occupancyRate: number;
  cancellationRate: number;
  growthRate?: number;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'TABLE' | 'CHART' | 'METRIC' | 'TEXT';
  data: any;
  chartType?: 'LINE' | 'BAR' | 'PIE' | 'AREA';
  columns?: { key: string; label: string; type: 'text' | 'number' | 'currency' | 'date' }[];
}

// ========================================
// PLANTILLAS DE REPORTES
// ========================================

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'BOOKINGS_SUMMARY',
    name: 'Resumen de Reservas',
    description: 'Resumen completo de todas las reservas con estadísticas clave',
    icon: Calendar,
    category: 'OPERATIONAL',
    estimatedTime: '1-2 min',
    requiredData: ['bookings', 'bundles'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: 'REVENUE_ANALYSIS',
    name: 'Análisis de Ingresos',
    description: 'Análisis detallado de ingresos por período, servicio y cliente',
    icon: DollarSign,
    category: 'FINANCIAL',
    estimatedTime: '2-3 min',
    requiredData: ['bookings', 'bundles', 'payments'],
    supportedFormats: ['PDF', 'EXCEL']
  },
  {
    id: 'CUSTOMER_INSIGHTS',
    name: 'Insights de Clientes',
    description: 'Análisis del comportamiento y segmentación de clientes',
    icon: Users,
    category: 'CUSTOMER',
    estimatedTime: '1-2 min',
    requiredData: ['bookings', 'customers'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: 'SERVICE_PERFORMANCE',
    name: 'Performance de Servicios',
    description: 'Rendimiento y popularidad de cada servicio ofrecido',
    icon: Package,
    category: 'ANALYSIS',
    estimatedTime: '1-2 min',
    requiredData: ['bookings', 'bundles'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: 'OPERATIONAL_METRICS',
    name: 'Métricas Operacionales',
    description: 'KPIs operacionales: ocupación, eficiencia, capacidad',
    icon: Activity,
    category: 'OPERATIONAL',
    estimatedTime: '2-3 min',
    requiredData: ['bookings', 'resources', 'schedules'],
    supportedFormats: ['PDF', 'EXCEL'],
    isPremium: true
  },
  {
    id: 'CANCELLATION_ANALYSIS',
    name: 'Análisis de Cancelaciones',
    description: 'Análisis detallado de patrones de cancelación',
    icon: XCircle,
    category: 'ANALYSIS',
    estimatedTime: '1-2 min',
    requiredData: ['bookings', 'cancellations'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: 'PEAK_HOURS_REPORT',
    name: 'Reporte de Horarios Pico',
    description: 'Análisis de demanda por horarios y días de la semana',
    icon: Clock,
    category: 'OPERATIONAL',
    estimatedTime: '1-2 min',
    requiredData: ['bookings', 'timeSlots'],
    supportedFormats: ['PDF', 'EXCEL', 'CSV']
  },
  {
    id: 'CUSTOMER_RETENTION',
    name: 'Retención de Clientes',
    description: 'Análisis de retención y valor de vida del cliente',
    icon: Star,
    category: 'CUSTOMER',
    estimatedTime: '2-3 min',
    requiredData: ['bookings', 'customers', 'payments'],
    supportedFormats: ['PDF', 'EXCEL'],
    isPremium: true
  },
  {
    id: 'COMPARATIVE_ANALYSIS',
    name: 'Análisis Comparativo',
    description: 'Comparación entre períodos para identificar tendencias',
    icon: TrendingUp,
    category: 'ANALYSIS',
    estimatedTime: '2-4 min',
    requiredData: ['bookings', 'historical'],
    supportedFormats: ['PDF', 'EXCEL'],
    isPremium: true
  }
];

// ========================================
// PROPS DEL COMPONENTE
// ========================================

interface ReportGeneratorProps {
  bookings: Booking[];
  bundles: Bundle[];
  shops?: Shop[];
  onReportGenerated?: (report: ReportData) => void;
  onExportComplete?: (format: ReportFormat, filename: string) => void;
  isPremium?: boolean;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  bookings,
  bundles,
  shops = [],
  onReportGenerated,
  onExportComplete,
  isPremium = false
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [filters, setFilters] = useState<ReportFilter>({
    period: 'MONTH',
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    statuses: ['CONFIRMED', 'COMPLETED'],
    includeArchived: false,
    groupBy: 'DATE',
    sortBy: 'DATE',
    sortDirection: 'DESC'
  });

  // ========================================
  // FILTROS APLICADOS
  // ========================================

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filtrar por fecha
    if (filters.dateFrom && filters.dateTo) {
      filtered = filtered.filter(booking => {
        const bookingDate = booking.date;
        return bookingDate >= filters.dateFrom! && bookingDate <= filters.dateTo!;
      });
    }

    // Filtrar por estados
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(booking => filters.statuses!.includes(booking.status));
    }

    // Filtrar por bundles
    if (filters.bundleIds && filters.bundleIds.length > 0) {
      filtered = filtered.filter(booking => filters.bundleIds!.includes(booking.bundleId));
    }

    // Filtrar por shops
    if (filters.shopIds && filters.shopIds.length > 0) {
      filtered = filtered.filter(booking => filters.shopIds!.includes(booking.shopId));
    }

    return filtered;
  }, [bookings, filters]);

  // ========================================
  // GENERACIÓN DE REPORTES
  // ========================================

  const generateReportData = useCallback(async (template: ReportTemplate): Promise<ReportData> => {
    const startTime = Date.now();

    // Simular tiempo de procesamiento
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            setGenerationProgress(100);
            clearInterval(interval);
            resolve();
          } else {
            setGenerationProgress(progress);
          }
        }, 100);
      });
    };

    await simulateProgress();

    // Calcular métricas del resumen
    const summary: ReportSummary = {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0),
      averageBookingValue: filteredBookings.length > 0 
        ? filteredBookings.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0) / filteredBookings.length 
        : 0,
      uniqueCustomers: new Set(filteredBookings.map(booking => booking.customerEmail)).size,
      topPerformingService: getTopPerformingService(),
      occupancyRate: calculateOccupancyRate(),
      cancellationRate: calculateCancellationRate()
    };

    // Generar secciones según el tipo de reporte
    const sections = generateReportSections(template, filteredBookings);

    const reportData: ReportData = {
      id: `report-${Date.now()}`,
      type: template.id,
      title: `${template.name} - ${format(new Date(), 'dd/MM/yyyy', { locale: es })}`,
      generatedAt: new Date().toISOString(),
      period: { 
        from: filters.dateFrom!, 
        to: filters.dateTo! 
      },
      filters,
      summary,
      sections,
      metadata: {
        totalRecords: filteredBookings.length,
        processingTime: Date.now() - startTime,
        generatedBy: 'Sistema de Reportes',
        version: '1.0'
      }
    };

    return reportData;
  }, [filteredBookings, filters]);

  const getTopPerformingService = useCallback(() => {
    const serviceCounts = filteredBookings.reduce((acc, booking) => {
      acc[booking.bundleName] = (acc[booking.bundleName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topService = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return topService ? topService[0] : 'N/A';
  }, [filteredBookings]);

  const calculateOccupancyRate = useCallback(() => {
    // Simplificación: calcular basado en reservas confirmadas vs total de slots posibles
    const confirmedBookings = filteredBookings.filter(b => b.status === 'CONFIRMED').length;
    const totalSlots = filteredBookings.length * 1.5; // Estimación
    return totalSlots > 0 ? (confirmedBookings / totalSlots) * 100 : 0;
  }, [filteredBookings]);

  const calculateCancellationRate = useCallback(() => {
    const cancelledBookings = filteredBookings.filter(b => b.status === 'CANCELLED').length;
    return filteredBookings.length > 0 ? (cancelledBookings / filteredBookings.length) * 100 : 0;
  }, [filteredBookings]);

  const generateReportSections = useCallback((template: ReportTemplate, data: Booking[]): ReportSection[] => {
    const sections: ReportSection[] = [];

    switch (template.id) {
      case 'BOOKINGS_SUMMARY':
        sections.push(
          {
            id: 'bookings-table',
            title: 'Lista de Reservas',
            type: 'TABLE',
            data: data.map(booking => ({
              fecha: format(parseISO(booking.date), 'dd/MM/yyyy', { locale: es }),
              cliente: booking.customerName,
              servicio: booking.bundleName,
              estado: booking.status,
              monto: booking.pricing.totalAmount,
              personas: booking.itemBookings.reduce((sum, item) => sum + item.numberOfPeople, 0)
            })),
            columns: [
              { key: 'fecha', label: 'Fecha', type: 'date' },
              { key: 'cliente', label: 'Cliente', type: 'text' },
              { key: 'servicio', label: 'Servicio', type: 'text' },
              { key: 'estado', label: 'Estado', type: 'text' },
              { key: 'monto', label: 'Monto', type: 'currency' },
              { key: 'personas', label: 'Personas', type: 'number' }
            ]
          },
          {
            id: 'status-distribution',
            title: 'Distribución por Estado',
            type: 'CHART',
            chartType: 'PIE',
            data: Object.entries(
              data.reduce((acc, booking) => {
                acc[booking.status] = (acc[booking.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([status, count]) => ({ label: status, value: count }))
          }
        );
        break;

      case 'REVENUE_ANALYSIS':
        sections.push(
          {
            id: 'revenue-by-day',
            title: 'Ingresos por Día',
            type: 'CHART',
            chartType: 'LINE',
            data: generateDailyRevenue(data)
          },
          {
            id: 'revenue-by-service',
            title: 'Ingresos por Servicio',
            type: 'CHART',
            chartType: 'BAR',
            data: generateRevenueByService(data)
          }
        );
        break;

      case 'CUSTOMER_INSIGHTS':
        sections.push(
          {
            id: 'customer-segments',
            title: 'Segmentación de Clientes',
            type: 'TABLE',
            data: generateCustomerSegments(data),
            columns: [
              { key: 'email', label: 'Cliente', type: 'text' },
              { key: 'bookings', label: 'Reservas', type: 'number' },
              { key: 'totalSpent', label: 'Total Gastado', type: 'currency' },
              { key: 'avgBookingValue', label: 'Valor Promedio', type: 'currency' },
              { key: 'segment', label: 'Segmento', type: 'text' }
            ]
          }
        );
        break;

      default:
        sections.push({
          id: 'default-summary',
          title: 'Resumen General',
          type: 'METRIC',
          data: {
            totalBookings: data.length,
            totalRevenue: data.reduce((sum, booking) => sum + booking.pricing.totalAmount, 0)
          }
        });
    }

    return sections;
  }, []);

  const generateDailyRevenue = (data: Booking[]) => {
    const dailyRevenue = data.reduce((acc, booking) => {
      const date = booking.date;
      acc[date] = (acc[date] || 0) + booking.pricing.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        label: format(parseISO(date), 'dd/MM', { locale: es }),
        value: revenue
      }));
  };

  const generateRevenueByService = (data: Booking[]) => {
    const serviceRevenue = data.reduce((acc, booking) => {
      acc[booking.bundleName] = (acc[booking.bundleName] || 0) + booking.pricing.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceRevenue)
      .sort(([, a], [, b]) => b - a)
      .map(([service, revenue]) => ({ label: service, value: revenue }));
  };

  const generateCustomerSegments = (data: Booking[]) => {
    const customerData = data.reduce((acc, booking) => {
      if (!acc[booking.customerEmail]) {
        acc[booking.customerEmail] = {
          email: booking.customerEmail,
          bookings: 0,
          totalSpent: 0
        };
      }
      acc[booking.customerEmail].bookings++;
      acc[booking.customerEmail].totalSpent += booking.pricing.totalAmount;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(customerData).map((customer: any) => {
      const avgBookingValue = customer.totalSpent / customer.bookings;
      let segment = 'Nuevo';
      
      if (customer.bookings >= 5 && avgBookingValue >= 100) {
        segment = 'VIP';
      } else if (customer.bookings >= 3) {
        segment = 'Recurrente';
      } else if (avgBookingValue >= 150) {
        segment = 'Premium';
      }

      return {
        ...customer,
        avgBookingValue,
        segment
      };
    });
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleGenerateReport = useCallback(async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const reportData = await generateReportData(selectedTemplate);
      setPreviewData(reportData);
      onReportGenerated?.(reportData);
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [selectedTemplate, generateReportData, onReportGenerated]);

  const handleExportReport = useCallback((format: ReportFormat) => {
    if (!previewData) return;

    // Simular exportación
    const filename = `${previewData.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    
    // Aquí se implementaría la lógica real de exportación
    console.log(`Exportando reporte como ${format}:`, previewData);
    
    onExportComplete?.(format, filename);
  }, [previewData, onExportComplete]);

  const updateFilter = useCallback((key: keyof ReportFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const setPeriod = useCallback((period: ReportPeriod) => {
    const now = new Date();
    let dateFrom: string, dateTo: string;

    switch (period) {
      case 'TODAY':
        dateFrom = dateTo = format(now, 'yyyy-MM-dd');
        break;
      case 'WEEK':
        dateFrom = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        dateTo = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'MONTH':
        dateFrom = format(startOfMonth(now), 'yyyy-MM-dd');
        dateTo = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'YEAR':
        dateFrom = format(startOfYear(now), 'yyyy-MM-dd');
        dateTo = format(endOfYear(now), 'yyyy-MM-dd');
        break;
      default:
        return; // Para CUSTOM no cambiar las fechas
    }

    setFilters(prev => ({ ...prev, period, dateFrom, dateTo }));
  }, []);

  const availableTemplates = useMemo(() => 
    REPORT_TEMPLATES.filter(template => isPremium || !template.isPremium)
  , [isPremium]);

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Generador de Reportes</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Genera reportes detallados y análisis de tu negocio
            </p>
          </div>

          {previewData && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Vista Previa</span>
              </Button>
              
              <Select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                options={selectedTemplate?.supportedFormats.map(format => ({
                  value: format,
                  label: format
                })) || []}
              />

              <Button
                onClick={() => handleExportReport(reportFormat)}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </Button>
            </div>
          )}
        </div>

        {/* Plantillas de reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {availableTemplates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  template.category === 'FINANCIAL' ? 'bg-green-100 text-green-600' :
                  template.category === 'OPERATIONAL' ? 'bg-blue-100 text-blue-600' :
                  template.category === 'CUSTOMER' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <template.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.isPremium && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⏱ {template.estimatedTime}</span>
                    <div className="flex space-x-1">
                      {template.supportedFormats.map(format => (
                        <span key={format} className="px-1 py-0.5 bg-gray-100 rounded">
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filtros de reporte */}
        {selectedTemplate && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Configuración del Reporte</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <Select
                  value={filters.period}
                  onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                  options={[
                    { value: 'TODAY', label: 'Hoy' },
                    { value: 'WEEK', label: 'Esta Semana' },
                    { value: 'MONTH', label: 'Este Mes' },
                    { value: 'QUARTER', label: 'Trimestre' },
                    { value: 'YEAR', label: 'Este Año' },
                    { value: 'CUSTOM', label: 'Personalizado' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estados de Reserva
                </label>
                <div className="flex flex-wrap gap-2">
                  {['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(status => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.statuses?.includes(status as BookingStatus)}
                        onChange={(e) => {
                          const currentStatuses = filters.statuses || [];
                          if (e.target.checked) {
                            updateFilter('statuses', [...currentStatuses, status]);
                          } else {
                            updateFilter('statuses', currentStatuses.filter(s => s !== status));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agrupar por
                </label>
                <Select
                  value={filters.groupBy}
                  onChange={(e) => updateFilter('groupBy', e.target.value)}
                  options={[
                    { value: 'DATE', label: 'Fecha' },
                    { value: 'STATUS', label: 'Estado' },
                    { value: 'BUNDLE', label: 'Servicio' },
                    { value: 'CUSTOMER', label: 'Cliente' }
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Se procesarán <strong>{filteredBookings.length}</strong> reservas
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando... {Math.round(generationProgress)}%</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    <span>Generar Reporte</span>
                  </>
                )}
              </Button>
            </div>

            {/* Progreso de generación */}
            {isGenerating && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Vista previa del reporte */}
      {showPreview && previewData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Vista Previa del Reporte</h3>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Cerrar
            </Button>
          </div>

          {/* Resumen del reporte */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Reservas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${previewData.summary.totalRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Ingresos Totales</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{previewData.summary.uniqueCustomers}</div>
              <div className="text-sm text-gray-600">Clientes Únicos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {previewData.summary.occupancyRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Ocupación</div>
            </div>
          </div>

          {/* Secciones del reporte */}
          <div className="space-y-6">
            {previewData.sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h4>
                
                {section.type === 'TABLE' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {section.columns?.map((column) => (
                            <th
                              key={column.key}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.data.slice(0, 5).map((row: any, index: number) => (
                          <tr key={index}>
                            {section.columns?.map((column) => (
                              <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {column.type === 'currency' ? `$${row[column.key]?.toFixed(2)}` : row[column.key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {section.data.length > 5 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        ... y {section.data.length - 5} filas más
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'CHART' && (
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Gráfico: {section.chartType}</p>
                      <p className="text-sm">{section.data.length} elementos</p>
                    </div>
                  </div>
                )}

                {section.type === 'METRIC' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(section.data).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-gray-900">
                          {typeof value === 'number' && key.includes('revenue') 
                            ? `$${value.toFixed(2)}` 
                            : String(value)
                          }
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Metadata del reporte */}
          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong>Registros:</strong> {previewData.metadata.totalRecords}
              </div>
              <div>
                <strong>Tiempo:</strong> {previewData.metadata.processingTime}ms
              </div>
              <div>
                <strong>Generado:</strong> {format(parseISO(previewData.generatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
              <div>
                <strong>Versión:</strong> {previewData.metadata.version}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 