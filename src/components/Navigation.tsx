import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Panorama Viewer</h2>
        </div>
        <div className="nav-links">
          <Link 
            to="/panorama" 
            className={`nav-link ${location.pathname === '/panorama' ? 'active' : ''}`}
          >
            360度パノラマ
          </Link>
          <Link 
            to="/vr-panorama" 
            className={`nav-link ${location.pathname === '/vr-panorama' ? 'active' : ''}`}
          >
            VRパノラマ
          </Link>
          <Link 
            to="/map" 
            className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}
          >
            マップ設定
          </Link>
        </div>
      </div>
    </nav>
  );
}
