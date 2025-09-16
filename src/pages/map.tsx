import { useState } from 'react';
import { VRPanorama } from '../components/VRPanorama';
import type { PathData } from '../types/streetView';

export default function VRPanoramaPage() {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0); 

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return (
    <div>
      {/* VRパノラマビュー */}
      <div >
        <VRPanorama
          pathData={pathData || undefined}
          currentPointIndex={currentPointIndex}
          apiKey={apiKey}
          height="600px"
          autoRotate={false}
        />
      </div>
    </div>
  );
}
