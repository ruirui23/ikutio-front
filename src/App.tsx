import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import { AuthService } from './services/auth';
import type { User } from './types/user';
import Map from './pages/map';
import './styles/App.css';
import SelectRoute from './pages/select-route.tsx';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, user: savedUser } = AuthService.getAuthData();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onGuestAccess={() => { /* guest -> handleLogin maybe */ }} />;
  }

  // When logged in, render routes
  return (
    <div className="app-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRouteWrapper user={user} onLogout={handleLogout} />} />
          <Route path="/select-route" element={<SelectRoute />} />
          <Route path="/game" element={<Map />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function HomeRouteWrapper({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate();
  return (
    <HomeScreen
      user={user}
      onStartGame={() => navigate('/game')}
      onLogout={onLogout}
      onSelectRoute={() => navigate('/select-route')}
    />
  );
}
