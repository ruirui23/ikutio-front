import { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import { AuthService } from './services/auth';
import type { User } from './types/user';
import Map from './pages/map';
import './styles/App.css';

type AppState = 'login' | 'home' | 'game';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user: savedUser } = AuthService.getAuthData();
    if (token && savedUser) {
      setUser(savedUser);
      setAppState('home');
    }
    setLoading(false);
  }, []);
  const handleLogin = (userData: User) => {
  setUser(userData);
  setAppState('home');
};

  const handleStartGame = () => {
    setAppState('game');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setAppState('login');
  };

  const handleReturnHome = () => {
    setAppState('login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }


  return (
    <div className="app-root">
      {appState === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {appState === 'home' && (
        <HomeScreen
          user={user}
          onStartGame={handleStartGame}
          onLogout={handleLogout}
        />
      )}
      {appState === 'game' && (
        <Map onReturnHome={handleReturnHome} />
      )}
    </div>
  );
}
