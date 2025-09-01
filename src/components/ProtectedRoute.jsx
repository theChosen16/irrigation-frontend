import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

// Componente HOC para proteger rutas
const ProtectedRoute = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8">
        <Lock size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Acceso Restringido</h3>
        <p className="text-gray-500">No tienes permisos para ver esta sección</p>
      </div>
    );
  }
  
  return children;
};

export default ProtectedRoute;
