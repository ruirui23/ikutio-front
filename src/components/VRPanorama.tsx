import { useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import * as THREE from 'three';
import { StreetViewService } from '../services/streetViewService';
import { Panorama360Sphere } from './Panorama360Sphere';
import type { TextureLoadResult, PathData } from '../types/streetView';

interface VRPanoramaProps {
  /** パスデータ */
  pathData?: PathData;
  /** 現在のポイントインデックス */
  currentPointIndex?: number;
  /** Google Maps API Key */
  apiKey?: string;
  /** キャンバスの高さ */
  height?: string;
  /** 自動回転の有効/無効 */
  autoRotate?: boolean;
  /** 自動回転速度 */
  autoRotateSpeed?: number;
}

// XRストアを作成
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

// VR用カメラコンポーネント
function VRPanoramaCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    // VRではカメラを原点に配置
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0); // 東向きを初期方向とする
  }, [camera]);

  return null;
}

// VR用パノラマローダーコンポーネント
function VRPanoramaLoader({ 
  pathData, 
  currentPointIndex = 0, 
  apiKey,
  autoRotate = false,
  autoRotateSpeed = 0.002 // VRでは少し遅めに
}: {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}) {
  const [panoramaUrl, setPanoramaUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const loadPanorama = useCallback(async (latitude: number, longitude: number, key?: string) => {
    setLoading(true);

    try {
      const result: TextureLoadResult = await StreetViewService.getPanoramaFromCoordinates(
        latitude, 
        longitude, 
        key
      );
      
      if (result.texture instanceof THREE.CanvasTexture) {
        // CanvasTextureの場合は、data URLとして設定
        const canvas = result.texture.image as HTMLCanvasElement;
        if (canvas && canvas.toDataURL) {
          setPanoramaUrl(canvas.toDataURL());
        }
      }
      
      if (!result.isFromApi && key && key.trim() !== '') {
        console.warn('Street View APIでの画像取得に失敗しました。テストパノラマを表示しています。');
      }
    } catch (err) {
      console.error('Error loading panorama:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathData && pathData.pathData && pathData.pathData.length > 0) {
      const currentPoint = pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)];
      loadPanorama(currentPoint.latitude, currentPoint.longitude, apiKey);
    } else {
      // デフォルトの場所（東京駅）
      loadPanorama(35.6812, 139.7671, apiKey);
    }
  }, [pathData, currentPointIndex, apiKey, loadPanorama]);

  return (
    <>
      <VRPanoramaCamera />
      <ambientLight intensity={1.2} /> {/* VRではやや明るめに */}
      
      {/* VR環境でのユーザー位置を中心に設定 */}
      <XROrigin position={[0, 0, 0]} />
      
      <Panorama360Sphere
        imageUrl={panoramaUrl}
        radius={50} // VRでは少し小さめの半径
        widthSegments={64} // VRでは高品質
        heightSegments={32}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
      
      {/* ローディング表示（VR用） */}
      {loading && (
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[4, 2]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* VR用の座標情報表示（浮遊テキスト） */}
      {pathData && pathData.pathData && pathData.pathData.length > 0 && (
        <group position={[0, -1.5, -3]}>
          <mesh>
            <planeGeometry args={[3, 0.5]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </>
  );
}

export function VRPanorama({
  pathData,
  currentPointIndex = 0,
  apiKey,
  height = '600px',
  autoRotate = false,
  autoRotateSpeed = 0.002
}: VRPanoramaProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);

  // VRサポートチェック
  useEffect(() => {
    if ('xr' in navigator && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      }).catch(() => {
        setIsVRSupported(false);
      });
    }
  }, []);

  return (
    <div className="vr-panorama-container" style={{ position: 'relative' }}>
      {/* VRコントロールパネル */}
      <div 
        className="vr-panorama-controls"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          flexDirection: 'column'
        }}
      >
        <button
          onClick={() => xrStore.enterVR()}
          disabled={!isVRSupported}
          style={{
            padding: '12px 20px',
            backgroundColor: isVRSupported ? 'rgba(0, 150, 0, 0.8)' : 'rgba(100, 100, 100, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isVRSupported ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isVRSupported ? 'VR体験開始' : 'VR未対応'}
        </button>
        
        {!isVRSupported && (
          <div
            style={{
              backgroundColor: 'rgba(255, 150, 0, 0.8)',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              maxWidth: '200px'
            }}
          >
            VRヘッドセット (Quest, Vive等) を接続してください
          </div>
        )}
      </div>

      {/* 座標情報表示 */}
      {pathData && pathData.pathData && pathData.pathData.length > 0 && (
        <div
          className="vr-panorama-info"
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <div><strong>VR 360°パノラマ</strong></div>
          座標: {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].latitude.toFixed(6)}, {pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)].longitude.toFixed(6)}
          <br />
          地点: {currentPointIndex + 1} / {pathData.pathData.length}
        </div>
      )}

      {/* VR操作説明 */}
      <div
        className="vr-panorama-help"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '250px'
        }}
      >
        <div><strong>VR操作方法:</strong></div>
        <div>• VRヘッドセットで頭を動かして360°確認</div>
        <div>• コントローラーでポイント操作</div>
        <div>• 没入感のある体験をお楽しみください</div>
      </div>

      {/* 3DキャンバスwithVR */}
      <div
        style={{
          height: height,
          width: '100%',
          backgroundColor: '#000000'
        }}
      >
        <Canvas
          camera={{
            position: [0, 0, 0],
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
            <VRPanoramaLoader
              pathData={pathData}
              currentPointIndex={currentPointIndex}
              apiKey={apiKey}
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
            />
          </XR>
        </Canvas>
      </div>
    </div>
  );
}
