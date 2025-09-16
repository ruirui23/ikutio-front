import * as THREE from 'three';

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
}
