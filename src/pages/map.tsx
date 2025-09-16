import { useState } from 'react';
import { VRPanorama } from '../components/VRPanorama';
import { WebPanorama } from '../components/WebPanorama';
import type { PathData } from '../types/streetView';
import '../styles/map.css';

export default function VRPanoramaPage() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0); 
  const [viewMode, setViewMode] = useState<'web' | 'vr'>('web'); // デフォルトはWeb版

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return (
    <div className="vr-panorama-page">
      {/* ビューモード切替ボタン */}
      <div className="view-mode-switcher">
        <button
          onClick={() => setViewMode('web')}
          className={`view-mode-button ${viewMode === 'web' ? 'active' : 'inactive'}`}
        >
          Web版（360度ビュー）
        </button>
        <button
          onClick={() => setViewMode('vr')}
          className={`view-mode-button ${viewMode === 'vr' ? 'active' : 'inactive'}`}
        >
          VR版
        </button>
      </div>

      {/* パノラマビュー */}
      <div className="panorama-view-container">
        {viewMode === 'web' ? (
          <WebPanorama
            pathData={pathData || undefined}
            currentPointIndex={currentPointIndex}
            apiKey={apiKey}
            height="600px"
            autoRotate={false}
          />
        ) : (
          <VRPanorama
            pathData={pathData || undefined}
            currentPointIndex={currentPointIndex}
            apiKey={apiKey}
            height="600px"
            autoRotate={false}
          />
        )}
      </div>
    </div>
  );
}
