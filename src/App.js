import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Navigation from './components/Navigation';
import DashboardPanel from './components/DashboardPanel';
import ClientSelector from './components/ClientSelector';
import ReportsSection from './components/ReportsSection';
import AnalysisSection from './components/AnalysisSection';
import QGISAnalysisPanel from './components/QGISAnalysisPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { irrigationService } from './services/irrigationService';
import './App.css';

// Componente principal de la aplicación autenticada
function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'analysis':
        return (
          <ProtectedRoute permission="create_analysis">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Análisis</h2>
              <AnalysisSection selectedClient={selectedClient} />
            </div>
          </ProtectedRoute>
        );
      case 'qgis':
        return (
          <ProtectedRoute permission="create_analysis">
            <QGISAnalysisPanel />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute permission="view_reports">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Reportes</h2>
              <ReportsSection selectedClient={selectedClient} />
            </div>
          </ProtectedRoute>
        );
      case 'clients':
        return (
          <ProtectedRoute permission="view_clients">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Clientes</h2>
              <ClientSelector 
                onClientSelect={handleClientSelect}
                selectedClient={selectedClient}
              />
            </div>
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute permission="manage_users">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
              <p className="text-gray-600">Funcionalidad de gestión de usuarios en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute permission="system_settings">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Configuración del Sistema</h2>
              <p className="text-gray-600">Configuraciones del sistema en desarrollo...</p>
            </div>
          </ProtectedRoute>
        );
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
      
      <footer className="bg-white border-t mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Sistema de Riego de Precisión v{process.env.REACT_APP_VERSION || '1.0.0'} - 
            Powered by GCP & GitHub Pages
          </p>
          <p>
            Backend: {process.env.REACT_APP_API_URL} | 
            Status: {backendStatus?.status || 'Checking...'}
          </p>
        </div>
      </footer>
    </div>
  );
}

// Wrapper principal con AuthProvider
function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
