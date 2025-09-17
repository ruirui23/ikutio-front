import type { LocationGroup } from '../services/locationService';

interface RouteSelectionProps {
  locationGroups: LocationGroup[];
  selectedLocationId: string | null;
  onRouteSelect: (locationId: string) => void;
  isLoading: boolean;
}

export function RouteSelection({ locationGroups, selectedLocationId, onRouteSelect, isLoading }: RouteSelectionProps) {
  if (isLoading) {
    return (
      <div className="route-selection">
        <h3>道を読み込み中...</h3>
        <div className="loading-spinner">⌛</div>
      </div>
    );
  }

  if (locationGroups.length === 0) {
    return (
      <div className="route-selection">
        <h3>利用可能な道がありません</h3>
        <p>APIから道のデータを取得できませんでした。</p>
      </div>
    );
  }

  return (
    <div className="route-selection">
      <h3>走りたい道を選択してください</h3>
      <div className="route-list">
        {locationGroups.map((group, index) => (
          <div 
            key={group.location_id}
            className={`route-item ${selectedLocationId === group.location_id ? 'selected' : ''}`}
            onClick={() => onRouteSelect(group.location_id)}
          >
            <div className="route-info">
              <h4>道 {index + 1}</h4>
              <p className="route-id">ID: {group.location_id.substring(0, 8)}...</p>
              <p className="route-points">{group.locations.length} ポイント</p>
              {group.locations.length > 0 && (
                <div className="route-start-location">
                  <small>
                    開始地点: {group.locations[0].latitude.toFixed(6)}, {group.locations[0].longitude.toFixed(6)}
                  </small>
                </div>
              )}
            </div>
            {selectedLocationId === group.location_id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
