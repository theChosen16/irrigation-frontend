/**
 * Servicio para funcionalidades avanzadas de Google Earth Engine
 * Maneja ML, predicción de riego, fenología y mapas de prescripción
 */

import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://34.16.137.64:5000';

class AdvancedGeeService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/gee`;
  }

  /**
   * Obtiene headers con autenticación
   */
  getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Maneja respuestas de la API
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Detecta estrés de cultivos usando machine learning
   * @param {string} clientName - Nombre del cliente
   * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Análisis de estrés con ML
   */
  async detectCropStress(clientName, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${this.baseURL}/crop-stress/${clientName}?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error detecting crop stress:', error);
      throw error;
    }
  }

  /**
   * Predice necesidades de riego
   * @param {string} clientName - Nombre del cliente
   * @param {number} forecastDays - Días a predecir (default: 7)
   * @returns {Promise<Object>} Predicción de riego
   */
  async predictIrrigationNeeds(clientName, forecastDays = 7) {
    try {
      const response = await fetch(
        `${this.baseURL}/irrigation-prediction/${clientName}?forecast_days=${forecastDays}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error predicting irrigation needs:', error);
      throw error;
    }
  }

  /**
   * Analiza fenología del cultivo
   * @param {string} clientName - Nombre del cliente
   * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Análisis fenológico
   */
  async analyzeCropPhenology(clientName, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(
        `${this.baseURL}/phenology/${clientName}?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error analyzing crop phenology:', error);
      throw error;
    }
  }

  /**
   * Genera mapa de prescripción variable
   * @param {string} clientName - Nombre del cliente
   * @returns {Promise<Object>} Mapa de prescripción
   */
  async generatePrescriptionMap(clientName) {
    try {
      const response = await fetch(
        `${this.baseURL}/prescription-map/${clientName}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error generating prescription map:', error);
      throw error;
    }
  }

  /**
   * Obtiene condiciones en tiempo real
   * @param {string} clientName - Nombre del cliente
   * @returns {Promise<Object>} Condiciones actuales
   */
  async getRealTimeConditions(clientName) {
    try {
      const response = await fetch(
        `${this.baseURL}/real-time-conditions/${clientName}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error getting real-time conditions:', error);
      throw error;
    }
  }

  /**
   * Obtiene análisis completo (combina múltiples funcionalidades)
   * @param {string} clientName - Nombre del cliente
   * @returns {Promise<Object>} Análisis completo
   */
  async getComprehensiveAnalysis(clientName) {
    try {
      const [
        stressAnalysis,
        irrigationPrediction,
        phenologyAnalysis,
        realTimeConditions
      ] = await Promise.allSettled([
        this.detectCropStress(clientName),
        this.predictIrrigationNeeds(clientName),
        this.analyzeCropPhenology(clientName),
        this.getRealTimeConditions(clientName)
      ]);

      return {
        cropStress: stressAnalysis.status === 'fulfilled' ? stressAnalysis.value : null,
        irrigationPrediction: irrigationPrediction.status === 'fulfilled' ? irrigationPrediction.value : null,
        phenology: phenologyAnalysis.status === 'fulfilled' ? phenologyAnalysis.value : null,
        realTimeConditions: realTimeConditions.status === 'fulfilled' ? realTimeConditions.value : null,
        errors: [
          stressAnalysis.status === 'rejected' ? stressAnalysis.reason : null,
          irrigationPrediction.status === 'rejected' ? irrigationPrediction.reason : null,
          phenologyAnalysis.status === 'rejected' ? phenologyAnalysis.reason : null,
          realTimeConditions.status === 'rejected' ? realTimeConditions.reason : null
        ].filter(Boolean)
      };
    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      throw error;
    }
  }

  /**
   * Formatea datos de estrés para visualización
   * @param {Object} stressData - Datos de estrés
   * @returns {Object} Datos formateados
   */
  formatStressData(stressData) {
    if (!stressData || !stressData.stress_distribution) {
      return null;
    }

    const distribution = stressData.stress_distribution;
    const chartData = Object.entries(distribution).map(([level, data]) => ({
      name: level,
      value: data.percentage,
      area: data.area_pixels
    }));

    return {
      chartData,
      accuracy: stressData.model_accuracy,
      recommendations: stressData.recommendations || [],
      analysisDate: stressData.analysis_date
    };
  }

  /**
   * Formatea datos de fenología para gráfico temporal
   * @param {Object} phenologyData - Datos de fenología
   * @returns {Object} Datos formateados
   */
  formatPhenologyData(phenologyData) {
    if (!phenologyData || !phenologyData.time_series_data) {
      return null;
    }

    const timeSeriesData = phenologyData.time_series_data.map(item => ({
      date: new Date(item.date),
      ndvi: item.ndvi_mean,
      phase: item.phase_name,
      phaseId: item.phenology_phase
    }));

    return {
      timeSeriesData,
      currentPhase: phenologyData.phenology_summary?.current_phase,
      transitions: phenologyData.phenology_summary?.phase_transitions || [],
      recommendations: phenologyData.recommendations || []
    };
  }

  /**
   * Formatea datos de prescripción para visualización
   * @param {Object} prescriptionData - Datos de prescripción
   * @returns {Object} Datos formateados
   */
  formatPrescriptionData(prescriptionData) {
    if (!prescriptionData || !prescriptionData.zone_statistics) {
      return null;
    }

    const zoneData = prescriptionData.zone_statistics.map(zone => ({
      id: zone.zone_id,
      intensity: zone.irrigation_intensity,
      ndvi: zone.ndvi_mean,
      ndmi: zone.ndmi_mean,
      area: zone.area_percentage
    }));

    return {
      zones: zoneData,
      summary: prescriptionData.prescription_summary,
      recommendations: prescriptionData.recommendations || []
    };
  }
}

export const advancedGeeService = new AdvancedGeeService();
