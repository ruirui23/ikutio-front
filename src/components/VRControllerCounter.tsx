import { useState, useRef } from 'react';
import { useXR } from '@react-three/xr';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VRControllerService } from '../services/vrControllerService';
import type { VRControllerCountCallback } from '../types/vrController';
import '../styles/VRControllerCounter.css';

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
  onCount?: VRControllerCountCallback;
  onCountReached?: (totalCount: number) => void; // 10の倍数に達したときのコールバック
  threshold?: number;
  cooldownMs?: number;
}

export function VRControllerCounter({ 
  onCount, 
  onCountReached,
  cooldownMs = 300 
}: VRControllerCounterProps) {
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0); // 前回の総カウント数を記録
  
  const { gl } = useThree();
  const session = useXR(state => state.session);
  
  const vrControllerService = useRef(VRControllerService.getInstance());

  useFrame(() => {
    const service = vrControllerService.current;
    
    // コントローラーデータを取得
    const controllerData = service.getControllerData(gl, session || null);
    
    // 交差検出を実行
    const crossingResult = service.detectCrossing(controllerData, cooldownMs, onCount);
    
    // カウント状態を更新
    if (crossingResult.occurred) {
      setLeftCount(crossingResult.leftCount);
      setRightCount(crossingResult.rightCount);
      
      // 総カウント数をチェックし、10の倍数に達した場合にコールバックを実行
      const totalCount = crossingResult.totalCount;
      if (onCountReached && totalCount > previousTotal && totalCount % 10 === 0) {
        onCountReached(totalCount);
      }
      setPreviousTotal(totalCount);
    }
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
    <div className="vr-counter-display">
      <div className="vr-counter-count-row">
        <span className="vr-counter-left">左:</span> {leftCount}回 | 
        <span className="vr-counter-right"> 右:</span> {rightCount}回
      </div>
      <div className="vr-counter-total">
        総計: {leftCount + rightCount}回
      </div>
      <div className="vr-counter-instruction">
        左右のコントローラーをY軸で交差させてください
      </div>
    </div>
  );
}
