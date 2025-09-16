import React, { useState,} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { PanoramaSphere } from './components/PanoramaSphere';
import './styles/Basic3DScene.css';

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
    <div className="basic3d-scene-container">
      {/* VRボタン */}
      <div className="vr-controls-container">
        <h4 className="vr-controls-title">VR体験</h4>
        <button
          onClick={() => xrStore.enterVR()}
          className="vr-enter-button"
        >
          VRで360度体験
        </button>
        <div className="vr-help-text">
          ※VRゴーグルが必要です<br/>
          Meta Quest, Vive等に対応
        </div>
      </div>

      {/* 場所変更UI */}
      <div className="location-controls-container">
        <h3 className="location-controls-title"> 場所を変更</h3>
        <input
          type="text"
          value={inputLocation}
          onChange={(e) => setInputLocation(e.target.value)}
          placeholder="場所を入力（例: Shibuya Crossing, Tokyo）"
          className="location-input"
        />
        <button
          onClick={() => setLocation(inputLocation)}
          className="location-submit-button"
        >
          移動
        </button>
        <div className="current-location-text">
          現在: {location}
        </div>
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        className="basic3d-canvas"
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
