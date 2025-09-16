import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './pages/map';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/map" element={<Map />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
