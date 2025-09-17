import { useState, useCallback, useEffect } from 'react';
import { VRPanorama } from '../components/VRPanorama';
import { WebPanorama } from '../components/WebPanorama';
import { RouteSelection } from '../components/RouteSelection';
import type { PathData } from '../types/streetView';
import type { LocationGroup, LocationData } from '../services/locationService';
import { fetchLocationGroups, findLocationGroupById, getCurrentLocation } from '../services/locationService';
import '../styles/map.css';
import '../styles/RouteSelection.css';

export default function VRPanoramaPage() {
  const [pathData, _setPathData] = useState<PathData | null>(null);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0); 
  const [viewMode, setViewMode] = useState<'web' | 'vr'>('web'); 
  
  // APIから取得するデータの状態
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoadingLocationGroups, setIsLoadingLocationGroups] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // APIから位置情報グループを取得
  useEffect(() => {
    const loadLocationGroups = async () => {
      try {
        setIsLoadingLocationGroups(true);
        const response = await fetchLocationGroups();
        setLocationGroups(response.location_groups);
      } catch (error) {
        console.error('Failed to load location groups:', error);
      } finally {
        setIsLoadingLocationGroups(false);
      }
    };
    
    loadLocationGroups();
  }, []);
  
  // 選択された道の変更を処理
  useEffect(() => {
    if (selectedLocationId && locationGroups.length > 0) {
      const selectedGroup = findLocationGroupById(locationGroups, selectedLocationId);
      if (selectedGroup && selectedGroup.locations.length > 0) {
        setCurrentPointIndex(0);
        setCurrentLocation(selectedGroup.locations[0]);
      }
    }
  }, [selectedLocationId, locationGroups]);
  
  useEffect(() => {
    if (selectedLocationId && locationGroups.length > 0) {
      const selectedGroup = findLocationGroupById(locationGroups, selectedLocationId);
      if (selectedGroup) {
        const location = getCurrentLocation(selectedGroup, currentPointIndex);
        setCurrentLocation(location);
      }
    }
  }, [currentPointIndex, selectedLocationId, locationGroups]);
  
  // VRコントローラーカウントが達成されたときのコールバック
  const handleCountReached = useCallback((totalCount: number) => {
    if (selectedLocationId && locationGroups.length > 0) {
      const selectedGroup = findLocationGroupById(locationGroups, selectedLocationId);
      if (selectedGroup) {
        // 1回カウントごとに次の地点に進む
        const newIndex = Math.min(currentPointIndex + 1, selectedGroup.locations.length - 1);
        setCurrentPointIndex(newIndex);
        
        if (newIndex < selectedGroup.locations.length - 1) {
          console.log(`カウント${totalCount}回達成！次の地点に移動しました (${newIndex + 1}/${selectedGroup.locations.length})`);
        } else {
          console.log('道の最後まで到達しました！');
        }
      }
    }
  }, [selectedLocationId, locationGroups, currentPointIndex]);
  
  // 道を選択したときの処理
  const handleRouteSelect = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
  }, []);
  
  return (
    <div className="vr-panorama-page">
      {/* 道の選択 */}
      <RouteSelection
        locationGroups={locationGroups}
        selectedLocationId={selectedLocationId}
        onRouteSelect={handleRouteSelect}
        isLoading={isLoadingLocationGroups}
      />

      {/* 道が選択されていない場合のメッセージ */}
      {!selectedLocationId && !isLoadingLocationGroups && (
        <div className="no-route-selected">
          <p>上から道を選択してVRパノラマを開始してください。</p>
        </div>
      )}

      {/* ビューモード切替ボタン */}
      {selectedLocationId && currentLocation && (
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
      )}

      {/* パノラマビュー */}
      {selectedLocationId && currentLocation && (
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
      )}
    </div>
  );
}
