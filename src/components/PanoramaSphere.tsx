import React, { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StreetViewService } from '../services/streetViewService';
import { StatusDisplay } from './StatusDisplay';
import type { TextureLoadResult, PathData } from '../types/streetView';

interface PanoramaSphereProps {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
}

export function PanoramaSphere({ pathData, currentPointIndex = 0, apiKey }: PanoramaSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | THREE.Texture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCoordinate, setLastCoordinate] = useState<{latitude: number, longitude: number} | null>(null);
  
  const loadTextureFromCoordinates = useCallback(async (latitude: number, longitude: number, key?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result: TextureLoadResult = await StreetViewService.getTextureFromCoordinates(latitude, longitude, key);
      setTexture(result.texture);
      
      if (!result.isFromApi && key && key.trim() !== '') {
        setError('Street View画像の読み込みに失敗しました');
      }
    } catch (err) {
      console.error('Error loading texture from coordinates:', err);
      setError('テクスチャの読み込み中にエラーが発生しました');
      
      // エラーの場合はテストテクスチャを作成
      const testTexture = StreetViewService.createTestTexture();
      setTexture(testTexture);
    } finally {
      setLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    if (pathData && pathData.pathData && pathData.pathData.length > 0) {
      const currentPoint = pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)];
      const currentCoordinate = { latitude: currentPoint.latitude, longitude: currentPoint.longitude };
      
      // 前回と同じ座標でない場合のみ読み込み
      if (!lastCoordinate || 
          currentCoordinate.latitude !== lastCoordinate.latitude || 
          currentCoordinate.longitude !== lastCoordinate.longitude) {
        setLastCoordinate(currentCoordinate);
        loadTextureFromCoordinates(currentPoint.latitude, currentPoint.longitude, apiKey);
      }
    }
    else if (!texture && !pathData) {
      const testTexture = StreetViewService.createTestTexture();
      setTexture(testTexture);
    }
  }, [pathData, currentPointIndex, apiKey, loadTextureFromCoordinates, lastCoordinate, texture]);
  
  React.useEffect(() => {
    if (meshRef.current && texture) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.map = texture;
      material.needsUpdate = true;
    }
  }, [texture]);

  return (
    <>
      <mesh ref={meshRef} scale={[-1, 1, 1]} rotation={[0, 0, Math.PI]}>
        <sphereGeometry args={[50, 64, 32]} />
        <meshBasicMaterial 
          map={texture} 
          side={THREE.BackSide} 
          transparent={false}
        />
      </mesh>
      
      <StatusDisplay
        loading={loading}
        error={error}
      />
    </>
  );
}
