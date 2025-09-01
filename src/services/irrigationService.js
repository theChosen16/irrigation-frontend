import api from '../config/api';

export const irrigationService = {
    // Health check
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            throw new Error(`Health check failed: ${error.message}`);
        }
    },

    // Get all clients
    async getClients() {
        try {
            const response = await api.get('/clients');
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
    },

    // Get client details
    async getClient(clientId) {
        try {
            const response = await api.get(`/clients/${clientId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching client ${clientId}: ${error.message}`);
        }
    },

    // Get reports for a client
    async getReports(clientId) {
        try {
            const response = await api.get(`/reports/${clientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    // Generate analysis
    async generateAnalysis(clientId, parameters = {}) {
        try {
            const response = await api.post('/analysis', {
                client_id: clientId,
                analysis_type: 'irrigation_optimization',
                include_weather: true,
                include_soil: true,
                ...parameters
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error generating analysis: ${error.message}`);
        }
    },

    // Download report
    async downloadReport(reportId) {
        try {
            const response = await api.get(`/reports/download/${reportId}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            throw new Error(`Error downloading report: ${error.message}`);
        }
    },

    // Get weather data
    async getWeatherData(clientId) {
        try {
            const response = await api.get(`/weather/${clientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    },

    // Get soil data
    async getSoilData(clientId) {
        try {
            const response = await api.get(`/soil/${clientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching soil data:', error);
            return null;
        }
    }
};
