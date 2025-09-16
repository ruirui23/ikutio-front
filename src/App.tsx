import { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import { AuthService } from './services/auth';
import type { User } from './types/user';
import Map from './pages/map';
import { VRControllerDemo } from './pages/VRControllerDemo';

type AppState = 'login' | 'home' | 'game' | 'vr-demo';

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

  const handleStartVRDemo = () => {
    setAppState('vr-demo');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setAppState('login');
  };

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {appState === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      {appState === 'home' && (
        <HomeScreen 
          user={user} 
          onStartGame={handleStartGame}
          onLogout={handleLogout}
          onStartVRDemo={handleStartVRDemo}
        />
      )}
      {appState === 'game' && (
        <Map />
      )}
      {appState === 'vr-demo' && (
        <VRControllerDemo />
      )}
    </div>
  );
}
