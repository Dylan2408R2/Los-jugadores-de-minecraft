import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Get existing users from storage
    const storedUsers = JSON.parse(localStorage.getItem('chat_users_db') || '{}');

    if (isRegistering) {
      // Registration Logic
      if (storedUsers[username]) {
        setError('El nombre de usuario ya existe. Intenta iniciar sesión.');
        return;
      }

      // Save new user
      storedUsers[username] = password;
      localStorage.setItem('chat_users_db', JSON.stringify(storedUsers));
      
      setSuccess('¡Cuenta creada! Iniciando sesión...');
      setTimeout(() => {
        onLogin(username);
      }, 1000);

    } else {
      // Login Logic
      if (!storedUsers[username]) {
        setError('Usuario no encontrado. ¿Quieres registrarte?');
        return;
      }

      if (storedUsers[username] !== password) {
        setError('Contraseña incorrecta.');
        return;
      }

      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-colors duration-500 ${isRegistering ? 'bg-purple-600 shadow-purple-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>
            {isRegistering ? <UserPlus className="text-white w-8 h-8" /> : <User className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-slate-400">
            {isRegistering ? 'Regístrate para unirte a la comunidad' : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Nombre de usuario</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej. Alex123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3 text-center animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg p-3 text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            className={`w-full flex items-center justify-center py-3 px-4 font-bold rounded-xl shadow-lg text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              isRegistering 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
            }`}
          >
            <span>{isRegistering ? 'Registrarse' : 'Entrar al Chat'}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? (
              <>
                <LogIn className="w-4 h-4" />
                ¿Ya tienes cuenta? Inicia sesión
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                ¿No tienes cuenta? Regístrate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;