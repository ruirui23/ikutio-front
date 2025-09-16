import React, { useState,} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
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

// XRストアを作成
const xrStore = createXRStore({
  controller: { 
    rayPointer: true,
  },
  frameRate: 'high',
  hand: { 
    rayPointer: true,
  },
  foveation: 0.5,
});

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
      {/* VRボタン */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '120px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1001,
        maxWidth: '250px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ECDC4' }}>VR体験</h4>
        <button
          onClick={() => xrStore.enterVR()}
          style={{
            width: '100%',
            padding: '12px 15px',
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          VRで360度体験
        </button>
        <div style={{ 
          marginTop: '8px', 
          fontSize: '11px', 
          opacity: 0.8,
          lineHeight: '1.3'
        }}>
          ※VRゴーグルが必要です<br/>
          Meta Quest, Vive等に対応
        </div>
      </div>

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
        <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}> 場所を変更</h3>
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
          移動
        </button>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
          現在: {location}
        </div>
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ background: '#000' }}
        gl={{ antialias: true, alpha: false }}
      >
        <XR store={xrStore}>
          {/* VR環境でのユーザー位置を中心に設定 */}
          <XROrigin position={[0, 0, 0]} />
          <ambientLight intensity={1} />
          <PanoramaSphere location={location} apiKey={apiKey} />
          <CameraInfo />
          <PerformanceMonitor onFpsUpdate={setFps} />
          {/* VR環境では OrbitControls は自動的に無効化される */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0, 0]}
            maxDistance={10}
            minDistance={0.1}
          />
        </XR>
      </Canvas>
    </div>
  );
}
