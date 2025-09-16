import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Panorama360Sphere } from './Panorama360Sphere';
import { usePanoramaLoader } from '../hooks/usePanoramaLoader';
import type { PathData } from '../types/streetView';
import '../styles/InteractivePanorama.css';

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

// カメラコンポーネント
function PanoramaCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0); 
  }, [camera]);

  return null;
}

// パノラマローダー
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
  const { panoramaUrl, loading, error } = usePanoramaLoader({
    pathData,
    currentPointIndex,
    apiKey
  });

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
      
      {/* エラー表示 */}
      {error && (
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[3, 1.5]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
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
      <div className="panorama-controls">
        <button
          onClick={toggleFullscreen}
          className="panorama-control-button panorama-control-button--fullscreen"
        >
          {isFullscreen ? '通常表示' : 'フルスクリーン'}
        </button>
        
        <button
          onClick={() => setControlsEnabled(!controlsEnabled)}
          className={`panorama-control-button ${controlsEnabled ? 'panorama-control-button--controls-enabled' : 'panorama-control-button--controls-disabled'}`}
        >
          {controlsEnabled ? '操作ON' : '操作OFF'}
        </button>
      </div>

      {/* 座標情報表示 */}
      {pathData && pathData.pathData && pathData.pathData.length > 0 && (
        <div className="panorama-info">
          座標: {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].latitude.toFixed(6)}, {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].longitude.toFixed(6)}
          <br />
          地点: {currentPointIndex + 1} / {pathData.pathData.length}
        </div>
      )}
      {/* 3Dキャンバス */}
      <div
        ref={canvasRef}
        className={`panorama-canvas-container ${isFullscreen ? 'panorama-canvas-container--fullscreen' : 'panorama-canvas-container--normal'}`}
        style={{ height: isFullscreen ? '100vh' : height }}
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
            enablePan={false} 
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
