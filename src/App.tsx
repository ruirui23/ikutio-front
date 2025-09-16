import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Map from './pages/map';
import PanoramaPage from './pages/PanoramaPage';
import VRPanoramaPage from './pages/VRPanoramaPage';
import Navigation from './components/Navigation';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/panorama" replace />} />
            <Route path="/map" element={<Map />} />
            <Route path="/panorama" element={<PanoramaPage />} />
            <Route path="/vr-panorama" element={<VRPanoramaPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
