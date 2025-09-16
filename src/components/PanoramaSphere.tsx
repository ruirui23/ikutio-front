import React, { useRef, useState, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { StreetViewService } from '../services/streetViewService';
import type { TextureLoadResult } from '../types/streetView';

interface PanoramaSphereProps {
  location?: string;
  apiKey?: string;
}

export function PanoramaSphere({ location, apiKey }: PanoramaSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | THREE.Texture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<string>('');
  
  const loadTexture = useCallback(async (loc: string, key?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result: TextureLoadResult = await StreetViewService.getTexture(loc, key);
      setTexture(result.texture);
      
      if (!result.isFromApi && key && key.trim() !== '') {
        setError('Street View画像の読み込みに失敗しました');
      }
    } catch (err) {
      console.error('Error loading texture:', err);
      setError('テクスチャの読み込み中にエラーが発生しました');
      
      // エラーの場合はテストテクスチャを作成
      const testTexture = StreetViewService.createTestTexture();
      setTexture(testTexture);
    } finally {
      setLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    if (location && location !== lastLocation) {
      setLastLocation(location);
      loadTexture(location, apiKey);
    } else if (!texture) {
      loadTexture('', undefined);
    }
  }, [location, apiKey, loadTexture, lastLocation, texture]);
  
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
      
      {loading && (
        <Text
          position={[0, 0, -10]}
          fontSize={3}
          color="yellow"
          anchorX="center"
          anchorY="middle"
        >
          Loading Street View...
        </Text>
      )}
      
      {error && (
        <Text
          position={[0, -5, -10]}
          fontSize={2}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          {error}
        </Text>
      )}
    </>
  );
}
