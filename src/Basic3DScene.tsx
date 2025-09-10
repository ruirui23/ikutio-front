import React, { useState,} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { PanoramaSphere } from './components/PanoramaSphere';
// カメラ情報表示
function CameraInfo() {
  const { camera } = useThree();
  const [position, setPosition] = useState<number[]>([0, 0, 0]);
  const [rotation, setRotation] = useState<number[]>([0, 0, 0]);
  
  useFrame(() => {
    setPosition([
      Math.round(camera.position.x * 100) / 100,
      Math.round(camera.position.y * 100) / 100,
      Math.round(camera.position.z * 100) / 100
    ]);
    setRotation([
      Math.round(camera.rotation.x * 100) / 100,
      Math.round(camera.rotation.y * 100) / 100,
      Math.round(camera.rotation.z * 100) / 100
    ]);
  });
  
  return (
    <Text
      position={[0, 10, -20]}
      fontSize={2}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {`Position: ${position.join(', ')}\nRotation: ${rotation.join(', ')}`}
    </Text>
  );
}

// パフォーマンス監視
function PerformanceMonitor({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  useFrame((state) => {
    if (state.clock) {
      const fps = Math.round(1 / state.clock.getDelta());
      onFpsUpdate(fps);
    }
  });
  
  return null;
}

// メインコンポーネント
export default function Basic3DScene() {
  const [fps, setFps] = useState<number>(0);
  const [location, setLocation] = useState<string>('Shibuya Crossing, Tokyo');
  const [inputLocation, setInputLocation] = useState<string>('Shibuya Crossing, Tokyo');

  // 環境変数からAPIキーを取得
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // ログは一度だけ出力
  React.useEffect(() => {
    console.log('App initialized. API Key:', apiKey ? '✅ Available' : '❌ Missing');
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 場所変更UI */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>🌍 場所を変更</h3>
        <input
          type="text"
          value={inputLocation}
          onChange={(e) => setInputLocation(e.target.value)}
          placeholder="場所を入力（例: Shibuya Crossing, Tokyo）"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={() => setLocation(inputLocation)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📍 移動
        </button>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
          現在: {location}
        </div>
      </div>

      {/* FPS表示 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <div>FPS: {fps}</div>
        <div style={{ 
          color: fps > 30 ? '#4CAF50' : fps > 15 ? '#FF9800' : '#F44336' 
        }}>
          Status: {fps > 30 ? '良好' : fps > 15 ? '注意' : '低下'}
        </div>
        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
          API: {apiKey ? '✅' : '❌'}
        </div>
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ background: '#000' }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={1} />
        <PanoramaSphere location={location} apiKey={apiKey} />
        <CameraInfo />
        <PerformanceMonitor onFpsUpdate={setFps} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0, 0]}
          maxDistance={10}
          minDistance={0.1}
        />
      </Canvas>
    </div>
  );
}