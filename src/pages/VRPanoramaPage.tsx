import { useState } from 'react';
import { VRPanorama } from '../components/VRPanorama';
import type { PathData } from '../types/streetView';

export default function VRPanoramaPage() {
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
    <div className="vr-panorama-page-container">
      {/* ページヘッダー */}
      <div className="page-header">
        <h1>VR 360度パノラマビュー</h1>
        <p>VRヘッドセットで没入型の360度パノラマ体験ができます</p>
        <div className="vr-requirements">
          <h4>VR要件</h4>
          <ul>
            <li>WebXR対応のVRヘッドセット（Oculus Quest、HTC Vive等）</li>
            <li>WebXR対応ブラウザ（Chrome、Firefox等）</li>
            <li>HTTPS接続が必要</li>
          </ul>
        </div>
      </div>
      
      {/* VRパノラマビュー */}
      <div className="vr-panorama-section">
        <VRPanorama
          pathData={pathData || undefined}
          currentPointIndex={currentPointIndex}
          apiKey={apiKey}
          height="600px"
          autoRotate={false}
        />
      </div>

      {/* 座標データ入力UI */}
      <div className="location-controls-container">
        <h3 className="location-controls-title">座標データを設定</h3>
        
        {/* pathData入力 */}
        <div className="path-data-input-group">
          <h4>座標データ (JSON形式)</h4>
          <textarea
            value={inputPathData}
            onChange={(e) => setInputPathData(e.target.value)}
            placeholder='{"pathData": [{"latitude": 33.881582, "longitude": 130.8789885, "timestamp": "2025-09-16T05:31:50Z"}]}'
            className="path-data-textarea"
            rows={4}
          />
          <div className="path-data-buttons">
            <button onClick={handlePathDataSubmit} className="path-data-submit-button">
              座標データを設定
            </button>
            <button onClick={loadSampleData} className="sample-data-button">
              サンプルデータを読み込み
            </button>
            <button
              onClick={() => {
                setPathData(null);
                setInputPathData('');
                setCurrentPointIndex(0);
              }}
              className="clear-data-button"
            >
              クリア
            </button>
          </div>
        </div>
        
        {/* ナビゲーションコントロール */}
        {pathData && pathData.pathData && pathData.pathData.length > 1 && (
          <div className="navigation-controls">
            <h4>ナビゲーション</h4>
            <div className="navigation-buttons">
              <button
                onClick={() => setCurrentPointIndex(Math.max(0, currentPointIndex - 1))}
                disabled={currentPointIndex === 0}
                className="nav-button prev-button"
              >
                ← 前の地点
              </button>
              <span className="point-indicator">
                {currentPointIndex + 1} / {pathData.pathData.length}
              </span>
              <button
                onClick={() => setCurrentPointIndex(Math.min(pathData.pathData.length - 1, currentPointIndex + 1))}
                disabled={currentPointIndex === pathData.pathData.length - 1}
                className="nav-button next-button"
              >
                次の地点 →
              </button>
            </div>
            {pathData.pathData[currentPointIndex] && (
              <div className="current-coordinate">
                現在の座標: {pathData.pathData[currentPointIndex].latitude.toFixed(6)}, {pathData.pathData[currentPointIndex].longitude.toFixed(6)}
              </div>
            )}
          </div>
        )}
        
        <div className="current-location-text">
          {pathData ? 
            `座標データ使用中 (${pathData.pathData.length}地点)` : 
            'データが設定されていません'
          }
        </div>
      </div>
    </div>
  );
}
