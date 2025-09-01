import React, { useState } from 'react';
import { 
  Layers, Calculator, Download, Eye, EyeOff, 
  Save, Plus, Map, BarChart, Sliders, Trash2,
  ZoomIn, ZoomOut, Move, Square, Circle, Database
} from 'lucide-react';
import IndexBuilder from './IndexBuilder';
import SatelliteDataPanel from './SatelliteDataPanel';
import AdvancedGeePanel from './AdvancedGeePanel';

// Índices espectrales predefinidos
const PREDEFINED_INDICES = {
  NDVI: {
    name: 'NDVI',
    description: 'Normalized Difference Vegetation Index',
    formula: '(B8 - B4) / (B8 + B4)',
    bands: ['B8', 'B4'],
    range: [-1, 1],
    colorRamp: 'vegetation'
  },
  NDWI: {
    name: 'NDWI',
    description: 'Normalized Difference Water Index',
    formula: '(B3 - B8) / (B3 + B8)',
    bands: ['B3', 'B8'],
    range: [-1, 1],
    colorRamp: 'water'
  },
  MSAVI: {
    name: 'MSAVI',
    description: 'Modified Soil-Adjusted Vegetation Index',
    formula: '(2 * B8 + 1 - sqrt((2 * B8 + 1)^2 - 8 * (B8 - B4))) / 2',
    bands: ['B8', 'B4'],
    range: [-1, 1],
    colorRamp: 'vegetation'
  },
  SAVI: {
    name: 'SAVI',
    description: 'Soil-Adjusted Vegetation Index',
    formula: '((B8 - B4) / (B8 + B4 + 0.5)) * 1.5',
    bands: ['B8', 'B4'],
    range: [-1, 1],
    colorRamp: 'vegetation'
  },
  EVI: {
    name: 'EVI',
    description: 'Enhanced Vegetation Index',
    formula: '2.5 * ((B8 - B4) / (B8 + 6 * B4 - 7.5 * B2 + 1))',
    bands: ['B8', 'B4', 'B2'],
    range: [-1, 1],
    colorRamp: 'vegetation'
  },
  NDMI: {
    name: 'NDMI',
    description: 'Normalized Difference Moisture Index',
    formula: '(B8 - B11) / (B8 + B11)',
    bands: ['B8', 'B11'],
    range: [-1, 1],
    colorRamp: 'moisture'
  }
};

export default function QGISAnalysisPanel() {
  const [layers, setLayers] = useState([
    { id: 1, name: 'Sentinel-2 True Color', type: 'raster', visible: true },
    { id: 2, name: 'NDVI - 2025-08-20', type: 'index', visible: true, formula: '(B8 - B4) / (B8 + B4)' }
  ]);
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [showIndexBuilder, setShowIndexBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  const handleCreateIndex = (indexData) => {
    const newLayer = {
      id: layers.length + 1,
      name: indexData.name,
      type: 'index',
      visible: true,
      formula: indexData.formula,
      colorRamp: indexData.colorRamp
    };
    setLayers([...layers, newLayer]);
    setShowIndexBuilder(false);
  };

  const toggleLayer = (id) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const addPredefinedIndex = (indexKey) => {
    const index = PREDEFINED_INDICES[indexKey];
    const newLayer = {
      id: layers.length + 1,
      name: `${index.name} - ${new Date().toISOString().split('T')[0]}`,
      type: 'index',
      visible: true,
      formula: index.formula,
      colorRamp: index.colorRamp
    };
    setLayers([...layers, newLayer]);
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">QGIS Analysis Panel - Ricardo Torres</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowIndexBuilder(!showIndexBuilder)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Calculator size={18} />
                <span>Constructor de Índices</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Save size={18} />
                <span>Guardar Proyecto</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                <Download size={18} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                activeTab === 'map' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map size={18} />
              <span>Análisis Espacial</span>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                activeTab === 'data' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database size={18} />
              <span>Datos Satelitales</span>
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                activeTab === 'advanced' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart size={18} />
              <span>GEE Avanzado</span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 h-[calc(100vh-120px)]">
          {activeTab === 'map' ? (
            <div className="flex h-full">
              {/* Panel izquierdo */}
              <div className="w-80 p-4 space-y-4 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Layers size={18} />
                      Capas
                    </h3>
                    <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayer(layer.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedLayer === layer.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayer(layer.id);
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <span className="font-medium text-sm">{layer.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLayer(layer.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {layer.type === 'index' && (
                          <div className="mt-2 text-xs text-gray-500">
                            {layer.formula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {showIndexBuilder && (
                  <IndexBuilder onCreateIndex={handleCreateIndex} />
                )}

                {/* Panel de índices predefinidos */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sliders size={18} />
                    Índices Predefinidos
                  </h3>
                  
                  <div className="space-y-2">
                    {Object.entries(PREDEFINED_INDICES).map(([key, index]) => (
                      <button
                        key={key}
                        onClick={() => addPredefinedIndex(key)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{index.name}</div>
                            <div className="text-xs text-gray-500">{index.description}</div>
                          </div>
                          <Plus size={16} className="text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visor central */}
              <div className="flex-1 p-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full">
                  {/* Barra de herramientas del mapa */}
                  <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Move size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <ZoomIn size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <ZoomOut size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Square size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Circle size={18} />
                    </button>
                  </div>

                  {/* Información del cursor */}
                  <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
                    <div className="text-xs space-y-1">
                      <div>Coordenadas: -70.123456, -33.456789</div>
                      <div>Valor: 0.6543</div>
                      <div>Zoom: 100%</div>
                    </div>
                  </div>

                  {/* Escala */}
                  <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-20 h-1 bg-black"></div>
                      <span>100m</span>
                    </div>
                  </div>

                  {/* Área del mapa (simulada) */}
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Map size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="opacity-50">Área de visualización del mapa</p>
                      <p className="text-sm opacity-30 mt-2">Los datos se cargarán desde el servidor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho */}
              <div className="w-80 p-4 space-y-4 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart size={18} />
                    Estadísticas
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mínimo:</span>
                      <span className="font-medium">-0.2300</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Máximo:</span>
                      <span className="font-medium">0.8900</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Media:</span>
                      <span className="font-medium">0.5600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Desv. Est.:</span>
                      <span className="font-medium">0.1800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Píxeles:</span>
                      <span className="font-medium">1,048,576</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Histograma</h4>
                    <div className="h-32 bg-gray-50 rounded flex items-end justify-between p-2">
                      {[0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3, 0.4, 0.6].map((val, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-500 w-8"
                          style={{ height: `${val * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'data' ? (
            <div className="h-full overflow-y-auto p-4">
              <SatelliteDataPanel clientName="ricardo_torres" />
            </div>
          ) : activeTab === 'advanced' ? (
            <div className="h-full overflow-y-auto p-4">
              <AdvancedGeePanel selectedClient={{ name: "ricardo_torres" }} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
