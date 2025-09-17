import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useApiOnce } from '../hooks/useApiOnce';
import { calculateTotalDistance } from '../utils/geolocation'; // エラー1の箇所
import RouteMapPreviewDirect from '../components/RouteMapPreviewDirect';

// APIから返ってくるデータの型定義
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}
interface LocationGroup {
  location_id: string;
  locations: LocationData[];
}

// 画面表示用に加工した後のルート情報の型定義
interface RouteInfo {
  id: string;
  name: string;
  distance: number; // km
  points: number;
  path: LocationData[];
}

export default function SelectRoute() {
  const navigate = useNavigate();
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const { data, error, isLoading } = useApiOnce('http://localhost:50052/get_locations');

  const availableRoutes: RouteInfo[] = useMemo(() => {
    if (!data || !data.location_groups) return [];
    
    return data.location_groups.map((group: LocationGroup, index: number) => ({
      id: group.location_id,
      name: `ルート ${index + 1}`,
      distance: parseFloat(calculateTotalDistance(group.locations).toFixed(2)),
      points: group.locations.length,
      path: group.locations,
    }));
  }, [data]);

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const handleStart = () => {
    if (selectedRouteId) {
      navigate(`/game?routeId=${selectedRouteId}`);
    }
  };

  if (isLoading) return <div style={styles.container}>ルートを読み込み中...</div>;
  if (error) return <div style={styles.container}>エラー: {error.message}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ルート選択</h1>
      <p style={styles.subtitle}>挑戦したいマラソンルートを選んでください。</p>
      
      <div style={styles.cardGrid}>
        {availableRoutes.map((route) => (
          <div
            key={route.id}
            style={{
              ...styles.card,
              ...(selectedRouteId === route.id ? styles.selectedCard : {}),
            }}
            onClick={() => handleSelectRoute(route.id)}
          >
            <RouteMapPreviewDirect locations={route.path} />
            <h3 style={styles.cardTitle}>{route.name}</h3>
            <div style={styles.cardInfo}>
              <p><strong>距離:</strong> {route.distance} km</p>
              <p><strong>経由地点:</strong> {route.points} 箇所</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.buttonSecondary} onClick={() => navigate('/')}>ホームに戻る</button>
        <button style={styles.buttonPrimary} disabled={!selectedRouteId} onClick={handleStart}>
          このルートで開始
        </button>
      </div>
    </div>
  );
}

// --- スタイル定義 ---
const styles: { [key: string]: React.CSSProperties } = {
  container: { width: '100vw', minHeight: '100vh', background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { fontSize: '42px', marginBottom: '10px' },
  subtitle: { fontSize: '18px', opacity: 0.9, marginBottom: '40px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', width: '100%', maxWidth: '1200px' },
  card: { background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '25px', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease', overflow: 'hidden' },
  selectedCard: { borderColor: '#3498db', transform: 'scale(1.05)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)' },
  cardTitle: { margin: '0 0 10px 0', fontSize: '24px' },
  cardInfo: { fontSize: '16px', opacity: 0.8 },
  buttonGroup: { marginTop: '50px', display: 'flex', gap: '20px' },
  buttonPrimary: { padding: '15px 30px', fontSize: '16px', borderRadius: '8px', border: 'none', background: '#e74c3c', color: 'white', cursor: 'pointer', opacity: 1, transition: 'opacity 0.3s' },
  buttonSecondary: { padding: '15px 30px', fontSize: '16px', borderRadius: '8px', border: '1px solid white', background: 'transparent', color: 'white', cursor: 'pointer' },
};