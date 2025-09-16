import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { StreetViewService } from '../services/streetViewService';
import { Panorama360Sphere } from './Panorama360Sphere';
import type { TextureLoadResult, PathData } from '../types/streetView';

interface InteractivePanoramaProps {
  /** パスデータ */
  pathData?: PathData;
  /** 現在のポイントインデックス */
  currentPointIndex?: number;
  /** Google Maps API Key */
  apiKey?: string;
  /** キャンバスの高さ */
  height?: string;
  /** 自動回転の有効/無効 */
  autoRotate?: boolean;
  /** 自動回転速度 */
  autoRotateSpeed?: number;
  /** VRサポート */
  vrSupport?: boolean;
}

// カメラコンポーネント（パノラマの中心に配置）
function PanoramaCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    // カメラを球体の中心に配置
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0); // 東向きを初期方向とする
  }, [camera]);

  return null;
}

// パノラマローダーコンポーネント
function PanoramaLoader({ 
  pathData, 
  currentPointIndex = 0, 
  apiKey,
  autoRotate = false,
  autoRotateSpeed = 0.005 
}: {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}) {
  const [panoramaUrl, setPanoramaUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const loadPanorama = useCallback(async (latitude: number, longitude: number, key?: string) => {
    setLoading(true);

    try {
      const result: TextureLoadResult = await StreetViewService.getPanoramaFromCoordinates(
        latitude, 
        longitude, 
        key
      );
      
      if (result.texture instanceof THREE.CanvasTexture) {
        // CanvasTextureの場合は、data URLとして設定
        const canvas = result.texture.image as HTMLCanvasElement;
        if (canvas && canvas.toDataURL) {
          setPanoramaUrl(canvas.toDataURL());
        }
      }
      
      if (!result.isFromApi && key && key.trim() !== '') {
        console.warn('Street View APIでの画像取得に失敗しました。テストパノラマを表示しています。');
      }
    } catch (err) {
      console.error('Error loading panorama:', err);
      console.warn('パノラマの読み込み中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathData && pathData.pathData && pathData.pathData.length > 0) {
      const currentPoint = pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)];
      loadPanorama(currentPoint.latitude, currentPoint.longitude, apiKey);
    } else {
      // デフォルトの場所（東京駅）
      loadPanorama(35.6812, 139.7671, apiKey);
    }
  }, [pathData, currentPointIndex, apiKey, loadPanorama]);

  return (
    <>
      <PanoramaCamera />
      <ambientLight intensity={1} />
      <Panorama360Sphere
        imageUrl={panoramaUrl}
        radius={100}
        widthSegments={32}
        heightSegments={16}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
      
      {/* ローディング表示 */}
      {loading && (
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[2, 1]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
      )}
    </>
  );
}

export function InteractivePanorama({
  pathData,
  currentPointIndex = 0,
  apiKey,
  height = '600px',
  autoRotate = false,
  autoRotateSpeed = 0.005
}: InteractivePanoramaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  // フルスクリーン切り替え
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (canvasRef.current?.requestFullscreen) {
        canvasRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // フルスクリーンイベントリスナー
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="interactive-panorama-container" style={{ position: 'relative' }}>
      {/* コントロールパネル */}
      <div 
        className="panorama-controls"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isFullscreen ? '通常表示' : 'フルスクリーン'}
        </button>
        
        <button
          onClick={() => setControlsEnabled(!controlsEnabled)}
          style={{
            padding: '8px 16px',
            backgroundColor: controlsEnabled ? 'rgba(0, 150, 0, 0.7)' : 'rgba(150, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {controlsEnabled ? '操作ON' : '操作OFF'}
        </button>
      </div>

      {/* 座標情報表示 */}
      {pathData && pathData.pathData && pathData.pathData.length > 0 && (
        <div
          className="panorama-info"
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          座標: {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].latitude.toFixed(6)}, {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].longitude.toFixed(6)}
          <br />
          地点: {currentPointIndex + 1} / {pathData.pathData.length}
        </div>
      )}

      {/* 操作説明 */}
      <div
        className="panorama-help"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '12px',
          maxWidth: '200px'
        }}
      >
        <div><strong>操作方法:</strong></div>
        <div>• マウスドラッグ: 視点回転</div>
        <div>• スクロール: ズーム</div>
        <div>• フルスクリーン推奨</div>
      </div>

      {/* 3Dキャンバス */}
      <div
        ref={canvasRef}
        style={{
          height: isFullscreen ? '100vh' : height,
          width: '100%',
          backgroundColor: '#000000'
        }}
      >
        <Canvas
          camera={{
            position: [0, 0, 0],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            alpha: false
          }}
        >
          <PanoramaLoader
            pathData={pathData}
            currentPointIndex={currentPointIndex}
            apiKey={apiKey}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
          
          {/* インタラクティブコントロール */}
          <OrbitControls
            enabled={controlsEnabled}
            enablePan={false} // パンを無効化（パノラマでは中心から動かない）
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 0]}
            minDistance={0.1}
            maxDistance={5}
            rotateSpeed={0.5}
            zoomSpeed={1}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotate ? autoRotateSpeed * 10 : 0}
          />
        </Canvas>
      </div>
    </div>
  );
}
