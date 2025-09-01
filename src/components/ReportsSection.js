import React, { useState, useEffect } from 'react';
import { irrigationService } from '../services/irrigationService';
import './ReportsSection.css';

const ReportsSection = ({ selectedClient }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedClient) {
            loadReports(selectedClient.id);
        } else {
            setReports([]);
        }
    }, [selectedClient]);

    const loadReports = async (clientId) => {
        try {
            setLoading(true);
            setError(null);
            const reportsData = await irrigationService.getReports(clientId);
            setReports(reportsData);
        } catch (err) {
            setError('Error al cargar reportes');
            console.error('Error loading reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (reportId) => {
        try {
            await irrigationService.downloadReport(reportId);
        } catch (err) {
            alert('Error al descargar el reporte');
            console.error('Download error:', err);
        }
    };

    if (!selectedClient) {
        return (
            <div className="reports-section">
                <h2>📊 Reportes del Cliente</h2>
                <div className="no-selection">
                    <p>Selecciona un cliente para ver sus reportes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reports-section">
            <h2>📊 Reportes de {selectedClient.name}</h2>
            
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando reportes...</p>
                </div>
            )}

            {error && (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => loadReports(selectedClient.id)}>
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && reports.length === 0 && (
                <div className="no-reports">
                    <p>No hay reportes disponibles para este cliente.</p>
                </div>
            )}

            {!loading && !error && reports.length > 0 && (
                <div className="reports-grid">
                    {reports.map(report => (
                        <div key={report.id} className="report-card">
                            <h3>{report.title}</h3>
                            <div className="report-meta">
                                <p><strong>Fecha:</strong> {new Date(report.date).toLocaleDateString()}</p>
                                <p><strong>Tipo:</strong> {report.type}</p>
                                <span className={`status-badge ${report.status}`}>
                                    {report.status}
                                </span>
                            </div>
                            <p className="report-description">{report.description}</p>
                            <div className="report-actions">
                                <button 
                                    onClick={() => handleDownload(report.id)}
                                    className="download-btn"
                                >
                                    📥 Descargar
                                </button>
                                {report.preview_url && (
                                    <button 
                                        onClick={() => window.open(report.preview_url, '_blank')}
                                        className="preview-btn"
                                    >
                                        👁️ Vista Previa
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsSection;
