import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Map, Users, FileText, User, Settings, LogOut, Layers } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasPermission, ROLES } = useAuth();

  if (!user) return null;

  const RoleIcon = ROLES[user.role].icon;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: null },
    { id: 'analysis', label: 'Análisis', icon: Map, permission: 'create_analysis' },
    { id: 'qgis', label: 'QGIS Análisis', icon: Layers, permission: 'create_analysis' },
    { id: 'clients', label: 'Clientes', icon: Users, permission: 'view_clients' },
    { id: 'reports', label: 'Reportes', icon: FileText, permission: 'view_reports' },
    { id: 'users', label: 'Usuarios', icon: User, permission: 'manage_users' },
    { id: 'settings', label: 'Configuración', icon: Settings, permission: 'system_settings' }
  ];

  const availableItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl">Semillero</span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {availableItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{user.avatar}</span>
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className={`flex items-center space-x-1 ${ROLES[user.role].color}`}>
                  <RoleIcon size={14} />
                  <span>{ROLES[user.role].name}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-gray-700 transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
