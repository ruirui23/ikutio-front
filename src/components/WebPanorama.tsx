import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Panorama360Sphere } from './Panorama360Sphere';
import { usePanoramaLoader } from '../hooks/usePanoramaLoader';
import type { PathData } from '../types/streetView';
import '../styles/WebPanorama.css';

interface WebPanoramaProps {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  height?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  latitude?: number;
  longitude?: number;
}

function WebPanoramaCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 0.1); // カメラを原点近くに配置
    camera.lookAt(1, 0, 0); 
  }, [camera]);

  return null;
}

function WebPanoramaLoader({ 
  pathData, 
  currentPointIndex = 0, 
  apiKey,
  autoRotate = false,
  autoRotateSpeed = 0.002,
  latitude,
  longitude
}: {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  latitude?: number;
  longitude?: number;
}) {
  const { panoramaUrl, loading, error, loadPanorama } = usePanoramaLoader({
    pathData,
    currentPointIndex,
    apiKey
  });

  // 緯度経度が提供された場合は直接読み込む
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      loadPanorama(latitude, longitude, apiKey);
    }
  }, [latitude, longitude, apiKey, loadPanorama]);

  return (
    <>
      <WebPanoramaCamera />
      <ambientLight intensity={1.2} /> 
      
      {/* OrbitControls - マウス/タッチでの360度操作 */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        minDistance={0.1}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
      
      <Panorama360Sphere
        imageUrl={panoramaUrl}
        radius={50} 
        widthSegments={128}
        heightSegments={64}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
      
      {loading && (
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[4, 2]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
      )}
      
      {error && (
        <mesh position={[0, 1, -2]}>
          <planeGeometry args={[4, 1]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
        </mesh>
      )}
      
      {pathData && pathData.pathData && pathData.pathData.length > 0 && (
        <group position={[0, -1.5, -3]}>
          <mesh>
            <planeGeometry args={[3, 0.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </>
  );
}

export function WebPanorama({
  pathData,
  currentPointIndex = 0,
  apiKey,
  height = '600px',
  autoRotate = false,
  autoRotateSpeed = 0.002,
  latitude,
  longitude
}: WebPanoramaProps) {
  return (
    <div className="web-panorama-container">
      <div className="web-panorama-canvas" style={{ height: height }}>
        <Canvas
          camera={{
            position: [0, 0, 0.1],
            fov: 75,
            near: 0.01,
            far: 1000
          }}
          gl={{
            antialias: true,
            alpha: false
          }}
        >
          <WebPanoramaLoader
            pathData={pathData}
            currentPointIndex={currentPointIndex}
            apiKey={apiKey}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            latitude={latitude}
            longitude={longitude}
          />
        </Canvas>
      </div>
      
      {/* 操作説明 */}
      <div className="web-panorama-controls-hint">
        ドラッグ: 視点移動 | ホイール: ズーム
      </div>
    </div>
  );
}
