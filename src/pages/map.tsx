import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PathData } from '../types/streetView';
import '../styles/MapPage.css';

export default function Map() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);
  const [inputPathData, setInputPathData] = useState<string>('');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const handlePathDataSubmit = () => {
    try {
      const parsedData: PathData = JSON.parse(inputPathData);
      if (parsedData.pathData && Array.isArray(parsedData.pathData)) {
        setPathData(parsedData);
        setCurrentPointIndex(0);
        // データが設定されたことを知らせる
        alert(`座標データが設定されました (${parsedData.pathData.length}地点)`);
      } else {
        alert('pathDataの形式が正しくありません');
      }
    } catch (error) {
      alert('無効なJSON形式です');
    }
  };
  
  // サンプルデータを設定する関数
  const loadSampleData = () => {
    const sampleData: PathData = {
      pathData: [
        { latitude: 35.4122, longitude: 139.4130, timestamp: "2025-09-16T05:31:50Z" },
        { latitude: 33.8815906, longitude: 130.8789872, timestamp: "2025-09-16T05:32:10Z" },
        { latitude: 33.8815732, longitude: 130.8789877, timestamp: "2025-09-16T05:32:29Z" }
      ]
    };
    setPathData(sampleData);
    setCurrentPointIndex(0);
    setInputPathData(JSON.stringify(sampleData, null, 2));
  };
  
  return (
    <div className="map-settings-container">
      {/* ページヘッダー */}
      <div className="page-header">
        <h1>座標データ設定</h1>
        <p>パノラマビューで使用する座標データを設定できます</p>
      </div>

      {/* 現在の状態表示 */}
      <div className="current-status">
        <h3>現在の設定状況</h3>
        <div className="status-card">
          <div className="status-item">
            <strong>API Key:</strong> {apiKey ? '設定済み' : '未設定'}
          </div>
          <div className="status-item">
            <strong>座標データ:</strong> {pathData ? `${pathData.pathData.length}地点設定済み` : '未設定'}
          </div>
          {pathData && (
            <div className="status-item">
              <strong>現在地点:</strong> {currentPointIndex + 1} / {pathData.pathData.length}
            </div>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="quick-actions">
        <h3>クイックアクション</h3>
        <div className="action-buttons">
          <Link to="/panorama" className="action-button panorama-btn">
            360度パノラマを見る
          </Link>
          <Link to="/vr-panorama" className="action-button vr-btn">
            VRパノラマを見る
          </Link>
        </div>
      </div>
    </div>
  );
}
