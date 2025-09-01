import React, { useState, useEffect } from 'react';
import { 
  Database, TrendingUp, AlertTriangle, CheckCircle, 
  Calendar, BarChart3, Download, RefreshCw, Info
} from 'lucide-react';
import { satelliteService } from '../services/satelliteService';

const SatelliteDataPanel = ({ clientName = 'ricardo_torres' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('6months');
  const [selectedIndices, setSelectedIndices] = useState(['ndvi', 'ndwi', 'msavi']);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadClientData();
  }, [clientName, selectedDateRange]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular rango de fechas
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      switch (selectedDateRange) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'all':
          startDate.setFullYear(2020, 0, 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 6);
      }

      // Cargar datos del cliente
      const [clientResponse, currentResponse, historicalResponse] = await Promise.all([
        satelliteService.getClientData(clientName),
        satelliteService.getCurrentAnalysis(clientName).catch(() => null),
        satelliteService.getHistoricalData(clientName, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate,
          indices: selectedIndices
        })
      ]);

      setClientData(clientResponse.data);
      setCurrentAnalysis(currentResponse?.current_analysis || null);
      setHistoricalData(historicalResponse.historical_data || []);

      // Generar recomendaciones
      if (currentResponse?.current_analysis) {
        const recs = satelliteService.generateRecommendations(
          currentResponse.current_analysis,
          historicalResponse.historical_data
        );
        setRecommendations(recs);
      }

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAlertIcon = (alertLevel) => {
    switch (alertLevel) {
      case 'HIGH':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'MEDIUM':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'LOW':
        return <AlertTriangle className="text-orange-500" size={16} />;
      case 'NORMAL':
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Info className="text-gray-500" size={16} />;
    }
  };

  const getIndexColor = (index) => {
    const colors = {
      ndvi: 'text-green-600',
      ndwi: 'text-blue-600',
      msavi: 'text-red-600',
      savi: 'text-orange-600',
      evi: 'text-purple-600',
      ndmi: 'text-indigo-600'
    };
    return colors[index] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-lg">Cargando datos satelitales...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertTriangle size={24} />
          <h3 className="text-lg font-semibold">Error al cargar datos</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadClientData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del cliente */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold">
                Datos Satelitales - {clientData?.client_info?.name?.replace('_', ' ').toUpperCase()}
              </h2>
              <p className="text-gray-600">
                {clientData?.client_info?.location} • {clientData?.client_info?.area_hectares} ha • {clientData?.client_info?.crop_type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Último mes</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último año</option>
              <option value="all">Todos los datos</option>
            </select>
            <button
              onClick={loadClientData}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Resumen de datos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-blue-600" size={20} />
              <span className="font-medium">Total Registros</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {clientData?.data_summary?.total_records || 0}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="text-green-600" size={20} />
              <span className="font-medium">Primer Registro</span>
            </div>
            <p className="text-sm font-medium text-green-600">
              {clientData?.data_summary?.date_range?.start ? 
                formatDate(clientData.data_summary.date_range.start) : 'N/A'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={20} />
              <span className="font-medium">Último Registro</span>
            </div>
            <p className="text-sm font-medium text-purple-600">
              {clientData?.data_summary?.date_range?.end ? 
                formatDate(clientData.data_summary.date_range.end) : 'N/A'}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="text-orange-600" size={20} />
              <span className="font-medium">Índices Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {selectedIndices.length}
            </p>
          </div>
        </div>
      </div>

      {/* Análisis Actual */}
      {currentAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp size={20} />
            <span>Análisis Actual - {formatDate(currentAnalysis.analysis_date)}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valores Actuales */}
            <div>
              <h4 className="font-medium mb-3">Valores Actuales</h4>
              <div className="space-y-2">
                {Object.entries(currentAnalysis.current_values).map(([index, value]) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className={`font-medium ${getIndexColor(index)}`}>
                      {index.toUpperCase()}
                    </span>
                    <span className="font-mono">{value?.toFixed(3) || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas */}
            <div>
              <h4 className="font-medium mb-3">Estado de Alertas</h4>
              <div className="space-y-2">
                {Object.entries(currentAnalysis.alerts).map(([index, alert]) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className={`font-medium ${getIndexColor(index)}`}>
                      {index.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert)}
                      <span className="text-sm">{alert}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <div>
              <h4 className="font-medium mb-3">Recomendaciones</h4>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Riego</p>
                  <p className="text-sm text-blue-600">
                    {currentAnalysis.recommendations?.irrigation_recommendation || 'No disponible'}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Intensidad: {currentAnalysis.recommendations?.irrigation_intensity || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones del Sistema */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Recomendaciones del Analista</span>
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  rec.type === 'info' ? 'bg-blue-50 border-blue-400' :
                  'bg-green-50 border-green-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {rec.type === 'warning' ? 
                    <AlertTriangle className="text-yellow-600 mt-1" size={18} /> :
                    rec.type === 'info' ?
                    <Info className="text-blue-600 mt-1" size={18} /> :
                    <CheckCircle className="text-green-600 mt-1" size={18} />
                  }
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.message}</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Prioridad: {rec.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datos Históricos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>Datos Históricos ({historicalData.length} registros)</span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <select
              multiple
              value={selectedIndices}
              onChange={(e) => setSelectedIndices(Array.from(e.target.selectedOptions, option => option.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ndvi">NDVI</option>
              <option value="ndwi">NDWI</option>
              <option value="msavi">MSAVI</option>
              <option value="savi">SAVI</option>
              <option value="evi">EVI</option>
              <option value="ndmi">NDMI</option>
            </select>
            <button className="p-2 text-gray-500 hover:text-gray-700 transition">
              <Download size={18} />
            </button>
          </div>
        </div>

        {historicalData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Fecha</th>
                  {selectedIndices.map(index => (
                    <th key={index} className={`text-left py-2 ${getIndexColor(index)}`}>
                      {index.toUpperCase()}
                    </th>
                  ))}
                  <th className="text-left py-2">Nubosidad</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.slice(0, 20).map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-mono text-sm">{formatDate(record.date)}</td>
                    {selectedIndices.map(indexName => (
                      <td key={indexName} className="py-2 font-mono">
                        {record[indexName]?.toFixed(3) || 'N/A'}
                      </td>
                    ))}
                    <td className="py-2 font-mono">
                      {record.cloud_cover ? `${record.cloud_cover.toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {historicalData.length > 20 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Mostrando los primeros 20 registros de {historicalData.length} total
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay datos históricos disponibles para el rango seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteDataPanel;
