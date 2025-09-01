import React, { createContext, useContext, useState, useEffect } from 'react';
import { Shield, User, BarChart3 } from 'lucide-react';

// Context de Autenticación
const AuthContext = createContext(null);

// Definición de roles y permisos
const ROLES = {
  ADMIN: {
    name: 'Administrador',
    permissions: [
      'manage_users',
      'manage_clients',
      'view_all_data',
      'edit_all_data',
      'create_analysis',
      'export_data',
      'system_settings',
      'view_logs'
    ],
    icon: Shield,
    color: 'text-purple-600'
  },
  ANALYST: {
    name: 'Analista',
    permissions: [
      'view_all_data',
      'create_analysis',
      'edit_analysis',
      'export_data',
      'create_indices',
      'use_qgis_tools',
      'view_clients'
    ],
    icon: BarChart3,
    color: 'text-blue-600'
  },
  CLIENT: {
    name: 'Cliente',
    permissions: [
      'view_own_data',
      'view_reports',
      'download_reports',
      'view_recommendations'
    ],
    icon: User,
    color: 'text-green-600'
  }
};

// Provider de Autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de usuario desde localStorage o API
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // Aquí iría la llamada real a la API
    // Por ahora simulamos usuarios demo
    const demoUsers = {
      'admin@semillero.cl': { 
        id: 1, 
        email: 'admin@semillero.cl', 
        name: 'Administrador', 
        role: 'ADMIN',
        avatar: '👨‍💼'
      },
      'analista@semillero.cl': { 
        id: 2, 
        email: 'analista@semillero.cl', 
        name: 'Ana Lista', 
        role: 'ANALYST',
        avatar: '👩‍🔬'
      },
      'ricardo@torres.cl': { 
        id: 3, 
        email: 'ricardo@torres.cl', 
        name: 'Ricardo Torres', 
        role: 'CLIENT',
        avatar: '👨‍🌾',
        clientId: 'ricardo_torres'
      }
    };

    const user = demoUsers[credentials.email];
    if (user && credentials.password === 'demo123') {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Credenciales inválidas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return ROLES[user.role]?.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
