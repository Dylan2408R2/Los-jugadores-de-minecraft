import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn, Github, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGithubLoading, setIsGithubLoading] = useState(false);

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

  const handleGithubLogin = () => {
    setIsGithubLoading(true);
    setError('');
    
    // Simulating OAuth delay
    setTimeout(() => {
      setIsGithubLoading(false);
      // We prefix with gh_ to identify github users in the main app logic if needed
      // In a real app, this would come from the OAuth provider
      const mockGithubUser = "Dev_GitHub_" + Math.floor(Math.random() * 1000);
      onLogin(mockGithubUser);
    }, 1500);
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
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Tu nombre de usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2
              ${isRegistering 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25'
              }`}
          >
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700"></div>
          <span className="text-slate-500 text-xs uppercase tracking-wider">O continuar con</span>
          <div className="h-px flex-1 bg-slate-700"></div>
        </div>

        <button
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGithubLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5 group-hover:text-white transition-colors" />
          )}
          <span>GitHub</span>
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;