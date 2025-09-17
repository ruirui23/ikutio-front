import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { Panorama360Sphere } from './Panorama360Sphere';
import { ControllerVisualizer, ControllerConnectionLine } from './VRControllerCounter';
import { usePanoramaLoader } from '../hooks/usePanoramaLoader';
import type { VRPanoramaProps } from '../types/components';
import type { PathData } from '../types/streetView';
import '../styles/VRPanorama.css';

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

function VRPanoramaCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.lookAt(1, 0, 0); 
  }, [camera]);

  return null;
}

function VRPanoramaLoader({ 
  pathData, 
  currentPointIndex = 0, 
  apiKey,
  autoRotate = false,
  autoRotateSpeed = 0.002,
  showControllers = false
}: {
  pathData?: PathData;
  currentPointIndex?: number;
  apiKey?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showControllers?: boolean;
}) {
  const { panoramaUrl, loading, error } = usePanoramaLoader({
    pathData,
    currentPointIndex,
    apiKey
  });

  return (
    <>
      <VRPanoramaCamera />
      <ambientLight intensity={1.2} /> 
      <XROrigin position={[0, 0, 0]} />
      
      {/* コントローラー表示 */}
      {showControllers && (
        <>
          <ControllerVisualizer hand="left" />
          <ControllerVisualizer hand="right" />
          <ControllerConnectionLine />
        </>
      )}
      
      <Panorama360Sphere
        imageUrl={panoramaUrl}
        radius={50} 
        widthSegments={128}
        heightSegments={64}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
      {loading && (
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[4, 2]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
      )}
      
      {error && (
        <mesh position={[0, 1, -2]}>
          <planeGeometry args={[4, 1]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
        </mesh>
      )}
      
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
  autoRotateSpeed = 0.002,
  showControllers = false
}: VRPanoramaProps) {
  return (
    <div className="vr-panorama-container" style={{ position: 'relative' }}>
      {/* 3DキャンバスwithVR */}
      <div className="vr-panorama-canvas" style={{ height: height }}>
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
              showControllers={showControllers}
            />
          </XR>
        </Canvas>
      </div>
    </div>
  );
}
