import * as THREE from 'three';
import { StreetViewService } from './streetViewService';
import type { TextureLoadResult, PathData } from '../types/streetView';

export interface PanoramaLoadResult {
    url?: string;
    isFromApi: boolean;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
}

export class PanoramaLoaderService {
    /**
     * 座標からパノラマ画像URLを取得
     */
    static async loadPanoramaUrl(
        latitude: number,
        longitude: number,
        apiKey?: string
    ): Promise<PanoramaLoadResult> {
        try {
            const result: TextureLoadResult = await StreetViewService.getPanoramaFromCoordinates(
                latitude,
                longitude,
                apiKey
            );

            let url: string | undefined;

            if (result.texture instanceof THREE.CanvasTexture) {
                const canvas = result.texture.image as HTMLCanvasElement;
                if (canvas && canvas.toDataURL) {
                    url = canvas.toDataURL();
                }
            }

            return {
                url,
                isFromApi: result.isFromApi,
                coordinate: { latitude, longitude }
            };
        } catch (error) {
            console.error('Error loading panorama:', error);
            throw error;
        }
    }

    /**
     * パスデータから現在のポイントのパノラマを取得
     */
    static async loadPanoramaFromPath(
        pathData?: PathData,
        currentPointIndex: number = 0,
        apiKey?: string
    ): Promise<PanoramaLoadResult> {
        if (pathData && pathData.pathData && pathData.pathData.length > 0) {
            const currentPoint = pathData.pathData[Math.min(currentPointIndex, pathData.pathData.length - 1)];
            return this.loadPanoramaUrl(currentPoint.latitude, currentPoint.longitude, apiKey);
        } else {
            // pathDataが存在しない場合はエラーを投げる
            throw new Error('有効なパスデータが提供されていません');
        }
    }

    /**
     * VRサポートをチェック
     */
    static async checkVRSupport(): Promise<boolean> {
        if ('xr' in navigator && navigator.xr) {
            try {
                return await navigator.xr.isSessionSupported('immersive-vr');
            } catch {
                return false;
            }
        }
        return false;
    }
}
