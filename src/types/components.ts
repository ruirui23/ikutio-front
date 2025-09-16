import type { PathData } from './streetView';

export interface BasePanoramaProps {
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

export interface InteractivePanoramaProps extends BasePanoramaProps {
    /** VRサポート */
    vrSupport?: boolean;
}

export interface VRPanoramaProps extends BasePanoramaProps {
    // VR固有のプロパティがあれば追加
}

// Panorama360Sphereコンポーネントのプロパティ
export interface Panorama360SphereProps {
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

// StatusDisplayコンポーネントのプロパティ
export interface StatusDisplayProps {
    loading?: boolean;
    error?: string | null;
    loadingMessage?: string;
    position?: [number, number, number];
}

// DebugInfoコンポーネントのプロパティ
export interface DebugInfoProps {
    apiKey?: string;
    pathData?: PathData | null;
    currentPointIndex?: number;
    visible?: boolean;
}
