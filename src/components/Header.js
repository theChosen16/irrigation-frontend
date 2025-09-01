import React from 'react';
import './Header.css';

const Header = ({ backendStatus }) => {
    const getStatusDisplay = () => {
        if (!backendStatus) {
            return <span className="status-checking">🟡 Verificando conexión...</span>;
        }
        
        if (backendStatus.status === 'healthy') {
            return (
                <div className="status-online">
                    <span>🟢 Backend Online</span>
                    <small>Última verificación: {new Date(backendStatus.timestamp).toLocaleString()}</small>
                </div>
            );
        }
        
        return <span className="status-offline">🔴 Backend Offline</span>;
    };

    return (
        <header className="app-header">
            <h1>🌱 {process.env.REACT_APP_APP_NAME || 'Sistema de Riego de Precisión'}</h1>
            <div className="status-indicator">
                {getStatusDisplay()}
            </div>
        </header>
    );
};

export default Header;
