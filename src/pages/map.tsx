import { useState, useCallback } from 'react';
import { VRPanorama } from '../components/VRPanorama';
import { WebPanorama } from '../components/WebPanorama';
import type { PathData } from '../types/streetView';
import { getLocationByCount, type LocationPreset } from '../constants/locations';
import '../styles/map.css';

export default function VRPanoramaPage() {
  const [pathData, _setPathData] = useState<PathData | null>(null);
  const [currentPointIndex, _setCurrentPointIndex] = useState<number>(0); 
  const [viewMode, setViewMode] = useState<'web' | 'vr'>('web'); 
  const [currentLocation, setCurrentLocation] = useState<LocationPreset>({
    latitude: 35.6762,
    longitude: 139.6503,
    name: '東京タワー'
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // VRコントローラーカウントが10の倍数に達したときのコールバック
  const handleCountReached = useCallback((totalCount: number) => {
    if (totalCount > 0 && totalCount % 10 === 0) {
      const newLocation = getLocationByCount(totalCount);
      setCurrentLocation(newLocation);
      console.log(`カウント${totalCount}回達成！新しい場所: ${newLocation.name}`);
    }
  }, []);
  
  return (
    <div className="vr-panorama-page">
      {/* 現在の場所表示 */}
      <div className="location-display">
        <h2>現在の場所: {currentLocation.name}</h2>
        <p>緯度: {currentLocation.latitude.toFixed(6)}, 経度: {currentLocation.longitude.toFixed(6)}</p>
        <p>VRコントローラーを10回交差させると新しい場所に移動します</p>
      </div>

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
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
          />
        ) : (
          <VRPanorama
            pathData={pathData || undefined}
            currentPointIndex={currentPointIndex}
            apiKey={apiKey}
            height="600px"
            autoRotate={false}
            showControllers={true}
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            onCountReached={handleCountReached}
          />
        )}
      </div>
    </div>
  );
}
