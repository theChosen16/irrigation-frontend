import React, { useState } from 'react';
import { Calculator, Settings, Play } from 'lucide-react';

// Bandas disponibles de Sentinel-2
const SENTINEL_BANDS = {
  B1: { name: 'Coastal aerosol', wavelength: '443nm', resolution: '60m', color: '#6B46C1' },
  B2: { name: 'Blue', wavelength: '490nm', resolution: '10m', color: '#2563EB' },
  B3: { name: 'Green', wavelength: '560nm', resolution: '10m', color: '#16A34A' },
  B4: { name: 'Red', wavelength: '665nm', resolution: '10m', color: '#DC2626' },
  B5: { name: 'Red Edge 1', wavelength: '705nm', resolution: '20m', color: '#EA580C' },
  B6: { name: 'Red Edge 2', wavelength: '740nm', resolution: '20m', color: '#D97706' },
  B7: { name: 'Red Edge 3', wavelength: '783nm', resolution: '20m', color: '#CA8A04' },
  B8: { name: 'NIR', wavelength: '842nm', resolution: '10m', color: '#B91C1C' },
  B8A: { name: 'Narrow NIR', wavelength: '865nm', resolution: '20m', color: '#991B1B' },
  B9: { name: 'Water vapour', wavelength: '945nm', resolution: '60m', color: '#1E40AF' },
  B10: { name: 'SWIR - Cirrus', wavelength: '1375nm', resolution: '60m', color: '#7C3AED' },
  B11: { name: 'SWIR 1', wavelength: '1610nm', resolution: '20m', color: '#A21CAF' },
  B12: { name: 'SWIR 2', wavelength: '2190nm', resolution: '20m', color: '#BE185D' }
};

// Paletas de colores disponibles
const COLOR_RAMPS = {
  RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
  Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
  BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
  Spectral: ['#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'],
  RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061']
};

// Constructor de índices personalizado
const IndexBuilder = ({ onCreateIndex }) => {
  const [indexName, setIndexName] = useState('');
  const [selectedBands, setSelectedBands] = useState({ band1: '', band2: '' });
  const [operation, setOperation] = useState('normalized_difference');
  const [customFormula, setCustomFormula] = useState('');
  const [colorRamp, setColorRamp] = useState('RdYlGn');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const operations = {
    normalized_difference: {
      name: 'Diferencia Normalizada',
      formula: (b1, b2) => `(${b1} - ${b2}) / (${b1} + ${b2})`,
      description: 'Fórmula estándar para índices normalizados'
    },
    ratio: {
      name: 'Ratio Simple',
      formula: (b1, b2) => `${b1} / ${b2}`,
      description: 'División simple entre bandas'
    },
    difference: {
      name: 'Diferencia',
      formula: (b1, b2) => `${b1} - ${b2}`,
      description: 'Resta simple entre bandas'
    },
    custom: {
      name: 'Fórmula Personalizada',
      formula: () => customFormula,
      description: 'Define tu propia fórmula'
    }
  };

  const handleCreate = () => {
    if (!indexName || !selectedBands.band1 || !selectedBands.band2) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const formula = operation === 'custom' 
      ? customFormula 
      : operations[operation].formula(selectedBands.band1, selectedBands.band2);

    onCreateIndex({
      name: indexName,
      bands: selectedBands,
      operation,
      formula,
      colorRamp,
      timestamp: new Date().toISOString()
    });

    // Reset form
    setIndexName('');
    setSelectedBands({ band1: '', band2: '' });
    setCustomFormula('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator className="text-blue-600" size={20} />
        Constructor de Índices Espectrales
      </h3>

      <div className="space-y-4">
        {/* Nombre del índice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Índice
          </label>
          <input
            type="text"
            value={indexName}
            onChange={(e) => setIndexName(e.target.value)}
            placeholder="Ej: Mi NDVI Personalizado"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Selección de bandas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banda 1 (Numerador)
            </label>
            <select
              value={selectedBands.band1}
              onChange={(e) => setSelectedBands({ ...selectedBands, band1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar banda...</option>
              {Object.entries(SENTINEL_BANDS).map(([key, band]) => (
                <option key={key} value={key}>
                  {key} - {band.name} ({band.wavelength})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banda 2 (Denominador)
            </label>
            <select
              value={selectedBands.band2}
              onChange={(e) => setSelectedBands({ ...selectedBands, band2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar banda...</option>
              {Object.entries(SENTINEL_BANDS).map(([key, band]) => (
                <option key={key} value={key}>
                  {key} - {band.name} ({band.wavelength})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de bandas seleccionadas */}
        {selectedBands.band1 && selectedBands.band2 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: SENTINEL_BANDS[selectedBands.band1].color }}
                />
                <span>{SENTINEL_BANDS[selectedBands.band1].name}</span>
              </div>
              <span className="text-gray-500">↔</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: SENTINEL_BANDS[selectedBands.band2].color }}
                />
                <span>{SENTINEL_BANDS[selectedBands.band2].name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tipo de operación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Operación
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(operations).map(([key, op]) => (
              <option key={key} value={key}>{op.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {operations[operation].description}
          </p>
        </div>

        {/* Fórmula resultante o personalizada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fórmula
          </label>
          {operation === 'custom' ? (
            <textarea
              value={customFormula}
              onChange={(e) => setCustomFormula(e.target.value)}
              placeholder="Ej: (B8 - B4) / (B8 + B4)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={3}
            />
          ) : (
            <div className="bg-gray-50 px-3 py-2 rounded-lg font-mono text-sm">
              {selectedBands.band1 && selectedBands.band2
                ? operations[operation].formula(selectedBands.band1, selectedBands.band2)
                : 'Selecciona las bandas para ver la fórmula'}
            </div>
          )}
        </div>

        {/* Paleta de colores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paleta de Colores
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(COLOR_RAMPS).map(([key, colors]) => (
              <button
                key={key}
                onClick={() => setColorRamp(key)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  colorRamp === key ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex h-6 rounded overflow-hidden">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs mt-1">{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Opciones avanzadas */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Settings size={16} />
          {showAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
        </button>

        {showAdvanced && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de valores
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mín (-1)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Máx (1)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de clasificación
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Cuantiles</option>
                <option>Intervalos iguales</option>
                <option>Desviación estándar</option>
                <option>Cortes naturales (Jenks)</option>
              </select>
            </div>
          </div>
        )}

        {/* Botón crear */}
        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Play size={18} />
          Calcular Índice
        </button>
      </div>
    </div>
  );
};

export default IndexBuilder;
