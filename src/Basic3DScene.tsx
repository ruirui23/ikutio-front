import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// テスト用のパノラマ球体コンポーネント
function PanoramaSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  
  React.useEffect(() => {
    // テスト用のグラデーションテクスチャを作成
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return; // null チェック
    
    // 空のようなグラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');    // 空色
    gradient.addColorStop(0.4, '#98D8E8');  // 薄い空色
    gradient.addColorStop(0.7, '#90EE90');  // 薄い緑
    gradient.addColorStop(1, '#228B22');    // 緑
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 雲のような模様を追加
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.4; // 上半分に雲
      const radius = Math.random() * 30 + 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // グリッドを追加して空間感を出す
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // 縦線
    for (let i = 0; i <= 8; i++) {
      const x = (canvas.width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 横線
    for (let i = 0; i <= 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.mapping = THREE.EquirectangularReflectionMapping;
    setTexture(canvasTexture);
  }, []);
  
  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// カメラコントロールのテスト表示
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

// パフォーマンス表示（Canvas内で使用）
function PerformanceMonitor({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  useFrame((state) => {
    if (state.clock) {
      const fps = Math.round(1 / state.clock.getDelta());
      onFpsUpdate(fps);
    }
  });
  
  return null; // 何も描画しない
}

// 操作説明のUI
function Instructions() {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.4',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>操作方法</h3>
      <div style={{ marginBottom: '8px' }}>🖱️ <strong>マウス左ドラッグ:</strong> 視点回転</div>
      <div style={{ marginBottom: '8px' }}>🖱️ <strong>マウス右ドラッグ:</strong> 視点移動</div>
      <div style={{ marginBottom: '8px' }}>⚪ <strong>マウスホイール:</strong> ズーム</div>
      <div style={{ marginTop: '15px', padding: '8px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '4px' }}>
        <strong>✅ 動作確認ポイント:</strong><br/>
        • 360度回転できるか<br/>
        • 球体の内側にいるか<br/>
        • テクスチャが正しく表示されるか
      </div>
    </div>
  );
}

// メインコンポーネント
export default function Basic3DScene() {
  const [fps, setFps] = useState<number>(0);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Instructions />
      
      {/* FPS表示（Canvas外） */}
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
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ background: '#000' }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* 環境光 */}
        <ambientLight intensity={1} />
        
        {/* パノラマ球体 */}
        <PanoramaSphere />
        
        {/* カメラ情報表示 */}
        <CameraInfo />
        
        {/* パフォーマンス監視（Canvas内） */}
        <PerformanceMonitor onFpsUpdate={setFps} />
        
        {/* マウス操作コントロール */}
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