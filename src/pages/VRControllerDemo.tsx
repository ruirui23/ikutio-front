import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { VRControllerCounter, VRControllerCounterDisplay } from '../components/VRControllerCounter';

const xrStore = createXRStore({
  controller: { 
    left: true,
    right: true,
  },
  hand: false,
});

interface VRControllerDemoSceneProps {
  onCount: (count: number, hand: 'left' | 'right') => void;
}

function VRControllerDemoScene({ onCount }: VRControllerDemoSceneProps) {
  VRControllerCounter({
    onCount,
    cooldownMs: 300
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
      <XROrigin position={[0, 0, 0]} />
      
      {/* シンプルなVR空間 */}
      {/* 床 */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      
      {/* 正面の壁 */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* カウント表示用のパネル */}
      <mesh position={[0, 2, -2.9]}>
        <planeGeometry args={[5, 1]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
      </mesh>
      
      {/* 左右のインジケーター */}
      <mesh position={[-1.5, 1, -2]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#ff6b6b" />
      </mesh>
      
      <mesh position={[1.5, 1, -2]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#4ecdc4" />
      </mesh>
    </>
  );
}

export function VRControllerDemo() {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  const handleCount = (count: number, hand: 'left' | 'right') => {
    if (hand === 'left') {
      setLeftCount(count);
    } else {
      setRightCount(count);
    }
  };

  const resetCounts = () => {
    setLeftCount(0);
    setRightCount(0);
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <VRControllerCounterDisplay 
        leftCount={leftCount} 
        rightCount={rightCount}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={resetCounts}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          リセット
        </button>
        
        <button
          onClick={() => xrStore.enterVR()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          VRモード開始
        </button>
      </div>

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        zIndex: 100
      }}>
        <h1>VRコントローラー交差デモ</h1>
        <p style={{ fontSize: '18px', marginTop: '20px' }}>
          Meta Quest 3でVRモードに入り、<br/>
          左右のコントローラーをY軸上で交差させてカウントを増やしてください！
        </p>
      </div>

      <Canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        camera={{
          position: [0, 1.6, 0],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: false
        }}
      >
        <XR store={xrStore}>
          <VRControllerDemoScene onCount={handleCount} />
        </XR>
      </Canvas>
    </div>
  );
}
