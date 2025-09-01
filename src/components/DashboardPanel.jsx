import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, BarChart3, AlertCircle, Database } from 'lucide-react';

// Panel de Control Principal
const DashboardPanel = () => {
  const { user, hasPermission } = useAuth();
  
  const stats = [
    { label: 'Clientes Activos', value: hasPermission('view_all_data') ? '12' : '1', icon: Users },
    { label: 'Análisis Realizados', value: '47', icon: BarChart3 },
    { label: 'Alertas Activas', value: '3', icon: AlertCircle },
    { label: 'Datos Procesados', value: '2.3 TB', icon: Database }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="text-blue-600" size={24} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Nuevo análisis NDVI completado - Campo Norte</span>
            <span className="text-xs text-gray-500 ml-auto">Hace 5 min</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Alerta de estrés hídrico detectada - Sector 3</span>
            <span className="text-xs text-gray-500 ml-auto">Hace 1 hora</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Reporte semanal generado exitosamente</span>
            <span className="text-xs text-gray-500 ml-auto">Hace 2 horas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPanel;
