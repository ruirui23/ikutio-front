import * as THREE from 'three';

/**
 * パス上の座標点のインターフェース
 */
export interface PathPoint {
    latitude: number;
    longitude: number;
    timestamp: string;
}

/**
 * パスデータのインターフェース
 */
export interface PathData {
    pathData: PathPoint[];
}

/**
 * Street View API設定のインターフェース
 */
export interface StreetViewConfig {
    size?: string;
    fov?: number;
    heading?: number;
    pitch?: number;
}

/**
 * テクスチャ読み込み結果のインターフェース
 */
export interface TextureLoadResult {
    texture: THREE.Texture | THREE.CanvasTexture;
    isFromApi: boolean;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
}
