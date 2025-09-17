import { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import ProfileCreateScreen from './ProfileCreateScreen';
import HomeScreen from './HomeScreen';
import Basic3DScene from './Basic3DScene';
import { AuthService } from './services/auth';
import type { User } from './types/user';


type AppState = 'login' | 'profile-create' | 'home' | 'game';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user: savedUser } = AuthService.getAuthData();
    if (token && savedUser) {
      setUser(savedUser);
      // displayNameがあればプロフィール作成済みとみなす
      if (savedUser.displayName && savedUser.displayName.trim() !== '') {
        setAppState('home');
      } else {
        setAppState('profile-create');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // displayNameがあればホーム画面へ、なければプロフィール作成画面へ
    if (userData.displayName && userData.displayName.trim() !== '') {
      setAppState('home');
    } else {
      setAppState('profile-create');
    }
  };

  const handleProfileCreated = (updatedUser: User) => {
    setUser(updatedUser);
    AuthService.saveAuthData(AuthService.getAuthData().token!, updatedUser);
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
      {appState === 'profile-create' && (
        <ProfileCreateScreen 
          user={user} 
          onProfileCreated={handleProfileCreated}
          onLogout={handleLogout}
        />
      )}
      {appState === 'home' && (
        <HomeScreen 
          user={user} 
          onStartGame={handleStartGame}
          onLogout={handleLogout}
        />
      )}
      {appState === 'game' && (
        <Basic3DScene />
      )}
    </div>
  );
}