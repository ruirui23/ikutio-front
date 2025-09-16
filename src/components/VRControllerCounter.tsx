import { useState, useRef } from 'react';
import { useXR, useXREvent } from '@react-three/xr';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VRControllerCounterProps {
  onCount?: (count: number, hand: 'left' | 'right') => void;
  threshold?: number;
  cooldownMs?: number;
}

export function VRControllerCounter({ 
  onCount, 
  threshold = 0.3, 
  cooldownMs = 300 
}: VRControllerCounterProps) {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const { controllers, isPresenting } = useXR();
  
  const leftPrevPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const rightPrevPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const leftLastShake = useRef<number>(0);
  const rightLastShake = useRef<number>(0);
  const leftInitialized = useRef(false);
  const rightInitialized = useRef(false);

  const detectShake = (
    controller: any,
    prevPos: { current: THREE.Vector3 },
    lastShake: { current: number },
    isInitialized: { current: boolean },
    hand: 'left' | 'right'
  ) => {
    if (!controller) return;

    // Try different properties to access position
    let position: THREE.Vector3 | null = null;
    if (controller.grip?.position) {
      position = controller.grip.position;
    } else if (controller.controller?.position) {
      position = controller.controller.position;
    } else if (controller.position) {
      position = controller.position;
    }

    if (!position) return;

    const now = Date.now();
    
    if (!isInitialized.current) {
      prevPos.current.copy(position);
      isInitialized.current = true;
      return;
    }

    const deltaY = Math.abs(position.y - prevPos.current.y);
    
    if (deltaY > threshold && (now - lastShake.current) > cooldownMs) {
      if (hand === 'left') {
        const newCount = leftCount + 1;
        setLeftCount(newCount);
        onCount?.(newCount, 'left');
      } else {
        const newCount = rightCount + 1;
        setRightCount(newCount);
        onCount?.(newCount, 'right');
      }
      lastShake.current = now;
    }
    
    prevPos.current.copy(position);
  };

  useFrame(() => {
    if (!isPresenting) return;
    
    setDebugInfo(`Controllers: ${controllers.length}, Presenting: ${isPresenting}`);
    
    if (controllers.length > 0) {
      const leftController = controllers.find((c: any) => c.inputSource?.handedness === 'left');
      const rightController = controllers.find((c: any) => c.inputSource?.handedness === 'right');
      
      if (leftController) {
        detectShake(leftController, leftPrevPos, leftLastShake, leftInitialized, 'left');
      }
      if (rightController) {
        detectShake(rightController, rightPrevPos, rightLastShake, rightInitialized, 'right');
      }
    }
  });

  return (
    <group>
      <mesh position={[0, 2, -2]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[-1, 2, -1.99]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[1, 2, -1.99]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function VRControllerCounterDisplay({ 
  leftCount, 
  rightCount 
}: { 
  leftCount: number; 
  rightCount: number; 
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '10px',
      zIndex: 1000
    }}>
      <div>左コントローラー: {leftCount}回</div>
      <div>右コントローラー: {rightCount}回</div>
      <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
        コントローラーを上下に振ってください
      </div>
    </div>
  );
}