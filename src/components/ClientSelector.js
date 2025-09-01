import React, { useState, useEffect } from 'react';
import { irrigationService } from '../services/irrigationService';
import './ClientSelector.css';

const ClientSelector = ({ onClientSelect, selectedClient }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const clientsData = await irrigationService.getClients();
            setClients(clientsData);
        } catch (err) {
            setError('Error al cargar clientes');
            console.error('Error loading clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        const client = clients.find(c => c.id === clientId);
        onClientSelect(client);
    };

    const handleRefresh = () => {
        loadClients();
    };

    if (loading) {
        return (
            <div className="client-selector">
                <label>Cliente:</label>
                <select disabled>
                    <option>Cargando clientes...</option>
                </select>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="client-selector">
                <label>Cliente:</label>
                <select disabled>
                    <option>Error al cargar</option>
                </select>
                <button onClick={handleRefresh} className="refresh-btn">
                    🔄 Reintentar
                </button>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="client-selector">
            <label htmlFor="client-select">Cliente:</label>
            <select 
                id="client-select"
                value={selectedClient?.id || ''}
                onChange={handleClientChange}
            >
                <option value="">Seleccionar cliente...</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                        {client.name} - {client.location}
                    </option>
                ))}
            </select>
            <button onClick={handleRefresh} className="refresh-btn">
                🔄 Actualizar
            </button>
            {clients.length === 0 && (
                <div className="no-clients">No hay clientes disponibles</div>
            )}
        </div>
    );
};

export default ClientSelector;
