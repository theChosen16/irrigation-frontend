import React, { useState } from 'react';
import { irrigationService } from '../services/irrigationService';
import './AnalysisSection.css';

const AnalysisSection = ({ selectedClient }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerateAnalysis = async () => {
        if (!selectedClient) {
            alert('Por favor selecciona un cliente primero');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResult(null);

            const analysisResult = await irrigationService.generateAnalysis(selectedClient.id, {
                analysis_type: 'irrigation_optimization',
                include_weather: true,
                include_soil: true,
                include_satellite: true
            });

            setResult(analysisResult);
        } catch (err) {
            setError(err.message);
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAnalysis = () => {
        if (result?.download_url) {
            window.open(result.download_url, '_blank');
        }
    };

    return (
        <div className="analysis-section">
            <h2>🔬 Generar Análisis de Riego</h2>
            
            <div className="analysis-controls">
                <button 
                    onClick={handleGenerateAnalysis}
                    disabled={loading || !selectedClient}
                    className="generate-btn"
                >
                    {loading ? (
                        <>
                            <div className="loading-spinner"></div>
                            Generando Análisis...
                        </>
                    ) : (
                        '🔬 Generar Análisis'
                    )}
                </button>
                
                {!selectedClient && (
                    <p className="no-client-message">
                        Selecciona un cliente para generar análisis
                    </p>
                )}
            </div>

            {error && (
                <div className="analysis-error">
                    <h3>❌ Error al Generar Análisis</h3>
                    <p>{error}</p>
                    <button onClick={handleGenerateAnalysis} className="retry-btn">
                        Reintentar
                    </button>
                </div>
            )}

            {result && (
                <div className="analysis-success">
                    <h3>✅ Análisis Generado Exitosamente</h3>
                    <div className="analysis-details">
                        <p><strong>ID de Análisis:</strong> {result.analysis_id}</p>
                        <p><strong>Estado:</strong> {result.status}</p>
                        <p><strong>Fecha:</strong> {new Date(result.created_at).toLocaleString()}</p>
                        {result.summary && (
                            <div className="analysis-summary">
                                <h4>Resumen:</h4>
                                <p>{result.summary}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="analysis-actions">
                        {result.download_url && (
                            <button onClick={handleDownloadAnalysis} className="download-analysis-btn">
                                📥 Descargar Reporte Completo
                            </button>
                        )}
                        {result.preview_url && (
                            <button 
                                onClick={() => window.open(result.preview_url, '_blank')}
                                className="preview-analysis-btn"
                            >
                                👁️ Vista Previa
                            </button>
                        )}
                    </div>

                    {result.recommendations && (
                        <div className="recommendations">
                            <h4>💡 Recomendaciones:</h4>
                            <ul>
                                {result.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalysisSection;
