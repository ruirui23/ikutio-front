import { useState, useRef } from 'react';
import { useXR } from '@react-three/xr';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function ControllerVisualizer({ hand }: { hand: 'left' | 'right' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const session = useXR(state => state.session);
  
  useFrame(() => {
    if (!meshRef.current || !session || !gl.xr.isPresenting) return;
    
    // WebXRのreferenceSpaceを取得
    const referenceSpace = gl.xr.getReferenceSpace();
    if (!referenceSpace) return;
    
    // 現在のフレームを取得
    const frame = gl.xr.getFrame();
    if (!frame) return;
    
    // 指定した手のinputSourceを検索
    const inputSource = Array.from(session.inputSources).find(
      source => source.handedness === hand && source.targetRayMode === 'tracked-pointer'
    );
    
    if (!inputSource) return;
    
    // gripSpaceまたはtargetRaySpaceから位置を取得
    const space = inputSource.gripSpace || inputSource.targetRaySpace;
    if (!space) return;
    
    // ポーズを取得
    const pose = frame.getPose(space, referenceSpace);
    if (!pose) return;
    
    // 位置を更新
    const position = pose.transform.position;
    meshRef.current.position.set(position.x, position.y, position.z);
    meshRef.current.visible = true;
  });
  
  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color={hand === 'left' ? '#ff6b6b' : '#4ecdc4'} />
    </mesh>
  );
}

// コントローラー間を結ぶ線を表示するコンポーネント
export function ControllerConnectionLine() {
  const lineRef = useRef<THREE.Line>(null);
  const { gl } = useThree();
  const session = useXR(state => state.session);
  
  useFrame(() => {
    if (!lineRef.current || !session || !gl.xr.isPresenting) return;
    
    const referenceSpace = gl.xr.getReferenceSpace();
    const frame = gl.xr.getFrame();
    if (!referenceSpace || !frame) return;
    
    // 左右のinputSourceを検索
    const leftSource = Array.from(session.inputSources).find(
      source => source.handedness === 'left' && source.targetRayMode === 'tracked-pointer'
    );
    const rightSource = Array.from(session.inputSources).find(
      source => source.handedness === 'right' && source.targetRayMode === 'tracked-pointer'
    );
    
    if (!leftSource || !rightSource) return;
    
    // 両方のポーズを取得
    const leftSpace = leftSource.gripSpace || leftSource.targetRaySpace;
    const rightSpace = rightSource.gripSpace || rightSource.targetRaySpace;
    
    if (!leftSpace || !rightSpace) return;
    
    const leftPose = frame.getPose(leftSpace, referenceSpace);
    const rightPose = frame.getPose(rightSpace, referenceSpace);
    
    if (!leftPose || !rightPose) return;
    
    // 線を更新
    const leftPos = leftPose.transform.position;
    const rightPos = rightPose.transform.position;
    
    const positions = new Float32Array([
      leftPos.x, leftPos.y, leftPos.z,
      rightPos.x, rightPos.y, rightPos.z
    ]);
    
    const geometry = lineRef.current.geometry as THREE.BufferGeometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.attributes.position.needsUpdate = true;
    
    lineRef.current.visible = true;
  });
  
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#ffff00' }))} ref={lineRef} />
  );
}

interface VRControllerCounterProps {
  onCount?: (count: number, hand: 'left' | 'right') => void;
  threshold?: number;
  cooldownMs?: number;
}

export function VRControllerCounter({ 
  onCount, 
  cooldownMs = 300 
}: VRControllerCounterProps) {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  
  // Three.js WebXR関連の状態を取得
  const { gl } = useThree();
  const session = useXR(state => state.session);
  
  const lastCrossTime = useRef<number>(0);
  const wasLeftAbove = useRef<boolean | null>(null);
  const bothInitialized = useRef(false);

  useFrame(() => {
    if (!session || !gl.xr.isPresenting) {
      return;
    }
    
    const now = Date.now();
    
    // WebXRの状態をチェック
    const referenceSpace = gl.xr.getReferenceSpace();
    const frame = gl.xr.getFrame();
    
    if (!referenceSpace || !frame) {
      return;
    }
    
    // 左右のコントローラーを検索
    const leftSource = Array.from(session.inputSources).find(
      source => source.handedness === 'left' && source.targetRayMode === 'tracked-pointer'
    );
    const rightSource = Array.from(session.inputSources).find(
      source => source.handedness === 'right' && source.targetRayMode === 'tracked-pointer'
    );
    
    if (!leftSource || !rightSource) {
      bothInitialized.current = false;
      return;
    }
    
    // スペースの取得（gripSpace優先、なければtargetRaySpace）
    const leftSpace = leftSource.gripSpace || leftSource.targetRaySpace;
    const rightSpace = rightSource.gripSpace || rightSource.targetRaySpace;
    
    if (!leftSpace || !rightSpace) {
      return;
    }
    
    // ポーズの取得
    const leftPose = frame.getPose(leftSpace, referenceSpace);
    const rightPose = frame.getPose(rightSpace, referenceSpace);
    
    if (!leftPose || !rightPose) {
      return;
    }
    
    // 位置データを取得
    const leftPos = leftPose.transform.position;
    const rightPos = rightPose.transform.position;
    
    // 初期化完了
    if (!bothInitialized.current) {
      bothInitialized.current = true;
    }
    
    // Y軸での上下関係を判定
    const isLeftAbove = leftPos.y > rightPos.y;
    const yDifference = Math.abs(leftPos.y - rightPos.y);
    
    // クールダウン期間をチェック
    const cooldownRemaining = Math.max(0, cooldownMs - (now - lastCrossTime.current));
    
    if (wasLeftAbove.current !== null && 
        wasLeftAbove.current !== isLeftAbove && 
        cooldownRemaining === 0 && 
        yDifference > 0.02) { 
      
      // 交差が発生！
      const totalCount = leftCount + rightCount + 1;
      const triggerHand = isLeftAbove ? 'right' : 'left';
      
      // カウントを更新
      const newLeftCount = Math.ceil(totalCount / 2);
      const newRightCount = Math.floor(totalCount / 2);
      
      setLeftCount(newLeftCount);
      setRightCount(newRightCount);
      
      onCount?.(totalCount, triggerHand);
      lastCrossTime.current = now;
    }
    
    // 上下関係を保存（次回の比較用）
    wasLeftAbove.current = isLeftAbove;
  });

  return { leftCount, rightCount };
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '10px',
      zIndex: 1000,
      maxWidth: '450px',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ color: '#ff6b6b' }}>左:</span> {leftCount}回 | 
        <span style={{ color: '#4ecdc4' }}> 右:</span> {rightCount}回
      </div>
      <div style={{ 
        fontSize: '16px', 
        color: '#ffd93d', 
        marginBottom: '10px' 
      }}>
        総計: {leftCount + rightCount}回
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        💡 左右のコントローラーをY軸で交差させてください
      </div>
    </div>
  );
}
