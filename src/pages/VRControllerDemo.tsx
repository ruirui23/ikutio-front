import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { VRControllerCounter, VRControllerCounterDisplay } from '../components/VRControllerCounter';
import '../styles/VRPanorama.css';

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

function VRControllerDemoScene() {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  const handleCount = (count: number, hand: 'left' | 'right') => {
    if (hand === 'left') {
      setLeftCount(count);
    } else {
      setRightCount(count);
    }
    console.log(`${hand} controller shake count: ${count}`);
  };

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <XROrigin position={[0, 0, 0]} />
      
      <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      <mesh position={[0, 1, -4.9]}>
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#4a90e2" transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[0, -1, -4.9]}>
        <planeGeometry args={[7, 0.5]} />
        <meshBasicMaterial color="#333" transparent opacity={0.9} />
      </mesh>
      
      <VRControllerCounter 
        onCount={handleCount}
        threshold={0.3}
        cooldownMs={300}
      />
      
      <VRControllerCounterDisplay 
        leftCount={leftCount} 
        rightCount={rightCount} 
      />
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
          カウントリセット
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
        <h1>VRコントローラーデモ</h1>
        <p style={{ fontSize: '18px', marginTop: '20px' }}>
          Meta Quest 3でVRモードに入り、<br/>
          コントローラーを上下に振ってカウントを増やしてください！
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
          <VRControllerDemoScene />
          <VRControllerCounter 
            onCount={handleCount}
            threshold={0.3}
            cooldownMs={300}
          />
        </XR>
      </Canvas>
    </div>
  );
}