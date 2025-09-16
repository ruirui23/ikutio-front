import { useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { DebugInfoProps } from '../types/components';
import '../styles/DebugInfo.css';

export function DebugInfo({ 
  apiKey, 
  pathData, 
  currentPointIndex = 0, 
  visible = true 
}: DebugInfoProps) {
  const { camera } = useThree();
  const [cameraPosition, setCameraPosition] = useState<number[]>([0, 0, 0]);
  const [cameraRotation, setCameraRotation] = useState<number[]>([0, 0, 0]);
  
  useFrame(() => {
    setCameraPosition([
      Math.round(camera.position.x * 100) / 100,
      Math.round(camera.position.y * 100) / 100,
      Math.round(camera.position.z * 100) / 100
    ]);
    setCameraRotation([
      Math.round(camera.rotation.x * 100) / 100,
      Math.round(camera.rotation.y * 100) / 100,
      Math.round(camera.rotation.z * 100) / 100
    ]);
  });

  useEffect(() => {
    if (pathData) {
      console.log('PathData:', pathData.pathData.length, 'points loaded');
      console.log('Current Point:', pathData.pathData[currentPointIndex]);
    }
  }, [apiKey, pathData, currentPointIndex]);

  if (!visible) return null;

  // 現在の座標情報を取得
  const getCurrentCoordinate = () => {
    if (pathData && pathData.pathData && pathData.pathData.length > 0) {
      const point = pathData.pathData[currentPointIndex];
      return `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
    }
    return 'データなし';
  };

  const debugText = `=== DEBUG INFO ===
Camera Pos: ${cameraPosition.join(', ')}
Camera Rot: ${cameraRotation.join(', ')}
API Key: ${apiKey ? 'OK' : ' Missing'}
Current: ${getCurrentCoordinate()}
${pathData ? `PathData: ${pathData.pathData.length} points (${currentPointIndex + 1}/${pathData.pathData.length})` : 'データ未設定'}`;

  return (
    <Text
      position={[0, 15, -25]}
      fontSize={1.5}
      color="cyan"
      anchorX="center"
      anchorY="middle"
    >
      {debugText}
    </Text>
  );
}
