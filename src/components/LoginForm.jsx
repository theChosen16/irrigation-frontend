import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    const result = await login({ email, password });
    if (!result.success) {
      setError(result.error);
    }
  };

  const demoCredentials = [
    { email: 'admin@semillero.cl', password: 'demo123', role: 'Admin' },
    { email: 'analista@semillero.cl', password: 'demo123', role: 'Analista' },
    { email: 'ricardo@torres.cl', password: 'demo123', role: 'Cliente' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🌱 Semillero</h1>
          <p className="text-gray-600">Sistema de Riego de Precisión</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="correo@ejemplo.cl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Iniciar Sesión
          </button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">Credenciales de demo:</p>
          <div className="space-y-2">
            {demoCredentials.map((cred, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                }}
                className="w-full text-left text-xs bg-gray-50 p-2 rounded hover:bg-gray-100 transition"
              >
                <span className="font-semibold">{cred.role}:</span> {cred.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
