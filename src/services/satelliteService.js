const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SatelliteService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/satellite`;
  }

  // Obtener token de autenticación del localStorage
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Manejar respuestas de la API
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error de conexión' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Obtener lista de clientes con datos satelitales disponibles
   */
  async getAvailableClients() {
    try {
      const response = await fetch(`${this.baseURL}/clients`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  /**
   * Obtener datos completos de un cliente específico
   */
  async getClientData(clientName, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const url = `${this.baseURL}/client/${clientName}${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error obteniendo datos de ${clientName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener análisis actual de un cliente
   */
  async getCurrentAnalysis(clientName) {
    try {
      const response = await fetch(`${this.baseURL}/client/${clientName}/current`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error obteniendo análisis actual de ${clientName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener datos históricos con filtros específicos
   */
  async getHistoricalData(clientName, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('start_date', options.startDate);
      if (options.endDate) params.append('end_date', options.endDate);
      if (options.indices) params.append('indices', options.indices.join(','));
      
      const url = `${this.baseURL}/client/${clientName}/historical${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error obteniendo datos históricos de ${clientName}:`, error);
      throw error;
    }
  }

  /**
   * Crear índice personalizado
   */
  async createCustomIndex(indexData) {
    try {
      const response = await fetch(`${this.baseURL}/custom-index`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(indexData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creando índice personalizado:', error);
      throw error;
    }
  }

  /**
   * Obtener índices personalizados de un cliente
   */
  async getCustomIndices(clientName) {
    try {
      const response = await fetch(`${this.baseURL}/client/${clientName}/indices`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error obteniendo índices personalizados de ${clientName}:`, error);
      throw error;
    }
  }

  /**
   * Inicializar datos de un cliente (solo admin)
   */
  async initializeClientData(clientName) {
    try {
      const response = await fetch(`${this.baseURL}/initialize/${clientName}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error inicializando datos de ${clientName}:`, error);
      throw error;
    }
  }

  /**
   * Formatear datos para visualización en gráficos
   */
  formatDataForChart(historicalData, indices = ['ndvi', 'ndwi', 'msavi']) {
    if (!historicalData || !Array.isArray(historicalData)) {
      return { labels: [], datasets: [] };
    }

    // Ordenar datos por fecha
    const sortedData = historicalData
      .filter(record => record.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedData.map(record => {
      const date = new Date(record.date);
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        year: '2-digit' 
      });
    });

    const colors = {
      ndvi: { border: '#16A34A', background: '#16A34A20' },
      ndwi: { border: '#2563EB', background: '#2563EB20' },
      msavi: { border: '#DC2626', background: '#DC262620' },
      savi: { border: '#EA580C', background: '#EA580C20' },
      evi: { border: '#7C2D12', background: '#7C2D1220' },
      ndmi: { border: '#1E40AF', background: '#1E40AF20' }
    };

    const datasets = indices.map(index => ({
      label: index.toUpperCase(),
      data: sortedData.map(record => record[index]),
      borderColor: colors[index]?.border || '#6B7280',
      backgroundColor: colors[index]?.background || '#6B728020',
      borderWidth: 2,
      fill: false,
      tension: 0.1
    }));

    return { labels, datasets };
  }

  /**
   * Calcular estadísticas básicas de un conjunto de datos
   */
  calculateStatistics(data, field) {
    if (!data || !Array.isArray(data)) return null;

    const values = data
      .map(record => record[field])
      .filter(value => value !== null && value !== undefined && !isNaN(value));

    if (values.length === 0) return null;

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean,
      median: sorted[Math.floor(sorted.length / 2)],
      std: Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)
    };
  }

  /**
   * Generar recomendaciones basadas en datos actuales
   */
  generateRecommendations(currentAnalysis, historicalStats) {
    if (!currentAnalysis || !historicalStats) return [];

    const recommendations = [];
    const current = currentAnalysis.current_values;
    const alerts = currentAnalysis.alerts;

    // Recomendaciones basadas en NDVI
    if (alerts.ndvi === 'LOW' || (current.ndvi && current.ndvi < 0.3)) {
      recommendations.push({
        type: 'warning',
        title: 'Vegetación Baja',
        message: 'El NDVI está por debajo del promedio. Considere revisar el estado de los cultivos.',
        priority: 'high'
      });
    }

    // Recomendaciones basadas en NDWI
    if (alerts.ndwi === 'LOW' || (current.ndwi && current.ndwi < 0.1)) {
      recommendations.push({
        type: 'info',
        title: 'Contenido de Agua',
        message: 'El contenido de agua en la vegetación es bajo. Evalúe la necesidad de riego.',
        priority: 'medium'
      });
    }

    // Recomendaciones de riego
    if (currentAnalysis.recommendations) {
      recommendations.push({
        type: 'success',
        title: 'Recomendación de Riego',
        message: currentAnalysis.recommendations.irrigation_recommendation,
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Validar fórmula de índice personalizado
   */
  validateCustomFormula(formula, availableBands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']) {
    const errors = [];

    // Verificar que la fórmula no esté vacía
    if (!formula || formula.trim().length === 0) {
      errors.push('La fórmula no puede estar vacía');
      return { isValid: false, errors };
    }

    // Verificar caracteres permitidos
    const allowedPattern = /^[B0-9A-Za-z+\-*/().\s]+$/;
    if (!allowedPattern.test(formula)) {
      errors.push('La fórmula contiene caracteres no permitidos');
    }

    // Verificar que las bandas existan
    const bandPattern = /B\d+A?/g;
    const usedBands = formula.match(bandPattern) || [];
    const invalidBands = usedBands.filter(band => !availableBands.includes(band));
    
    if (invalidBands.length > 0) {
      errors.push(`Bandas no válidas: ${invalidBands.join(', ')}`);
    }

    // Verificar paréntesis balanceados
    const openParens = (formula.match(/\(/g) || []).length;
    const closeParens = (formula.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Paréntesis no balanceados');
    }

    return {
      isValid: errors.length === 0,
      errors,
      usedBands: [...new Set(usedBands)]
    };
  }
}

export const satelliteService = new SatelliteService();
