import React, { useRef, useState, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

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
  
  const createTestTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#98D8E8');
    gradient.addColorStop(0.7, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.4;
      const radius = Math.random() * 30 + 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= 8; i++) {
      const x = (canvas.width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i <= 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.mapping = THREE.UVMapping;
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
    canvasTexture.flipY = false;
    setTexture(canvasTexture);
  }, []);
  
  React.useEffect(() => {
    if (location && location !== lastLocation) {
      setLastLocation(location);
      
      if (apiKey && apiKey.trim() !== '') {
        setLoading(true);
        setError(null);
        
        const size = '1024x512'; 
        const fov = 120; 
        const heading = 0;
        const pitch = 0;
        
        const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(location)}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;
        
        const loader = new THREE.TextureLoader();
        loader.load(
          url,
          (loadedTexture) => {
            loadedTexture.mapping = THREE.UVMapping;
            loadedTexture.wrapS = THREE.RepeatWrapping;
            loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
            loadedTexture.flipY =false;
            loadedTexture.needsUpdate = true;
            setTexture(loadedTexture);
            setLoading(false);
          },
          (progress) => {
            console.log('Loading progress:', progress);
          },
          (error) => {
            console.error('❌ Error loading Street View image:', error);
            setError('Street View画像の読み込みに失敗しました');
            setLoading(false);
            createTestTexture();
          }
        );
      } else {
        createTestTexture();
      }
    } else if (!texture) {
      createTestTexture();
    }
  }, [location, apiKey, createTestTexture, lastLocation, texture]);
  
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
