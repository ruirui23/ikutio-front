import { useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { PathData } from '../types/streetView';
import '../styles/DebugInfo.css';

interface DebugInfoProps {
  apiKey?: string;
  pathData?: PathData | null;
  currentPointIndex?: number;
  visible?: boolean;
}

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

  // APIキーの状態をログ出力
  useEffect(() => {
    console.log('🔑 API Key Status:', apiKey ? '✅ Available' : '❌ Missing');
    if (pathData) {
      console.log('🗺️ PathData:', pathData.pathData.length, 'points loaded');
      console.log('📌 Current Point:', pathData.pathData[currentPointIndex]);
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
API Key: ${apiKey ? '✅ OK' : '❌ Missing'}
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
