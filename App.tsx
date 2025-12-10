import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import { User, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<User | null>(null);

  // Simple persisted session check
  useEffect(() => {
    const savedUser = localStorage.getItem('globalchat_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.username) {
          setUser(parsedUser);
          setAppState(AppState.CHAT);
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const handleLogin = (username: string) => {
    // Generate a random avatar using picsum
    // We use a deterministic seed so the user keeps the same avatar
    const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatar = `https://picsum.photos/seed/${seed}/200`;

    const newUser: User = {
      username,
      avatar
    };

    setUser(newUser);
    setAppState(AppState.CHAT);
    localStorage.setItem('globalchat_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setAppState(AppState.LOGIN);
    localStorage.removeItem('globalchat_user');
  };

  if (appState === AppState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  return user ? (
    <ChatInterface currentUser={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
};

export default App;