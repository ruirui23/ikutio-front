import  { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import '../styles/Panorama360Sphere.css';

interface Panorama360SphereProps {
  /** パノラマ画像のURL */
  imageUrl?: string;
  /** 球体の半径 */
  radius?: number;
  /** 球体の分割数（詳細度） */
  widthSegments?: number;
  heightSegments?: number;
  /** カメラの初期回転角度（Y軸回転、ラジアン） */
  initialRotationY?: number;
  /** カメラの初期回転角度（X軸回転、ラジアン） */
  initialRotationX?: number;
  /** 自動回転の有効/無効 */
  autoRotate?: boolean;
  /** 自動回転速度 */
  autoRotateSpeed?: number;
}

export function Panorama360Sphere({
  imageUrl,
  radius = 500,
  widthSegments = 32,
  heightSegments = 16,
  initialRotationY = 0,
  initialRotationX = 0,
  autoRotate = false,
  autoRotateSpeed = 0.005
}: Panorama360SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // デフォルトのテストテクスチャを作成
  const createTestTexture = () => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size / 2; 
    
    const context = canvas.getContext('2d');
    if (!context) return null;

    // グラデーション背景
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // 空色
    gradient.addColorStop(0.7, '#98FB98'); // 淡い緑
    gradient.addColorStop(1, '#8FBC8F'); // 暗い緑

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // グリッドパターン
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    context.globalAlpha = 0.3;

    // 縦線
    for (let x = 0; x < canvas.width; x += canvas.width / 8) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    // 横線
    for (let y = 0; y < canvas.height; y += canvas.height / 4) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    // テキストラベル
    context.globalAlpha = 1;
    context.fillStyle = '#FFFFFF';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText('360° パノラマテスト', canvas.width / 2, canvas.height / 2);

    // 方角ラベル
    context.font = '32px Arial';
    context.fillText('北', canvas.width / 2, 60);
    context.fillText('南', canvas.width / 2, canvas.height - 30);
    context.fillText('東', canvas.width - 50, canvas.height / 2);
    context.fillText('西', 50, canvas.height / 2);

    const testTexture = new THREE.CanvasTexture(canvas);
    testTexture.mapping = THREE.EquirectangularReflectionMapping;
    testTexture.wrapS = THREE.RepeatWrapping;
    testTexture.wrapT = THREE.ClampToEdgeWrapping;
    return testTexture;
  };

  // テクスチャのロード
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (imageUrl) {
      const loader = new TextureLoader();
      loader.load(
        imageUrl,
        (loadedTexture) => {
          loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          
          setTexture(loadedTexture);
          setLoading(false);
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        (err) => {
          console.error('Error loading texture:', err);
          setError('画像の読み込みに失敗しました');
          
          // エラー時はテストテクスチャを使用
          const testTexture = createTestTexture();
          if (testTexture) {
            setTexture(testTexture);
          }
          setLoading(false);
        }
      );
    } else {
      // 画像URLが指定されていない場合はテストテクスチャ
      const testTexture = createTestTexture();
      if (testTexture) {
        setTexture(testTexture);
      }
      setLoading(false);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = initialRotationY;
      meshRef.current.rotation.x = initialRotationX;
    }
  }, [initialRotationY, initialRotationX]);

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += autoRotateSpeed * delta * 60; 
    }
  });

  if (loading) {
    return null;
  }

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}> 
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide} 
        transparent={false}
      />
    </mesh>
  );
}
