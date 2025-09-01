import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ClientSelector from './components/ClientSelector';
import ReportsSection from './components/ReportsSection';
import AnalysisSection from './components/AnalysisSection';
import { irrigationService } from './services/irrigationService';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    checkBackendHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await irrigationService.healthCheck();
      setBackendStatus(health);
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus(null);
    }
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  return (
    <div className="App">
      <Header backendStatus={backendStatus} />
      
      <main className="app-main">
        <div className="controls-section">
          <ClientSelector 
            onClientSelect={handleClientSelect}
            selectedClient={selectedClient}
          />
        </div>

        <div className="content-grid">
          <ReportsSection selectedClient={selectedClient} />
          <AnalysisSection selectedClient={selectedClient} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Sistema de Riego de Precisión v{process.env.REACT_APP_VERSION || '1.0.0'} - 
          Powered by GCP & GitHub Pages
        </p>
        <p>
          <small>
            Backend: {process.env.REACT_APP_API_URL} | 
            Status: {backendStatus?.status || 'Checking...'}
          </small>
        </p>
      </footer>
    </div>
  );
}

export default App;
