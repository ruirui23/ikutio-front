import { useState, useEffect, useCallback } from 'react';
import { PanoramaLoaderService, type PanoramaLoadResult } from '../services/panoramaLoaderService';
import type { PathData } from '../types/streetView';

export interface UsePanoramaLoaderOptions {
    pathData?: PathData;
    currentPointIndex?: number;
    apiKey?: string;
}

export interface UsePanoramaLoaderReturn {
    panoramaUrl?: string;
    loading: boolean;
    error?: string;
    loadPanorama: (latitude: number, longitude: number, key?: string) => Promise<void>;
}

export function usePanoramaLoader({
    pathData,
    currentPointIndex = 0,
    apiKey
}: UsePanoramaLoaderOptions): UsePanoramaLoaderReturn {
    const [panoramaUrl, setPanoramaUrl] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const loadPanorama = useCallback(async (latitude: number, longitude: number, key?: string) => {
        setLoading(true);
        setError(undefined);

        try {
            const result: PanoramaLoadResult = await PanoramaLoaderService.loadPanoramaUrl(
                latitude,
                longitude,
                key
            );

            setPanoramaUrl(result.url);

            if (!result.isFromApi && key && key.trim() !== '') {
                console.warn('Street View APIでの画像取得に失敗しました。');
            }
        } catch (err) {
            console.error('Error loading panorama:', err);
            setError('パノラマの読み込み中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadFromPath = async () => {
            try {
                const result = await PanoramaLoaderService.loadPanoramaFromPath(
                    pathData,
                    currentPointIndex,
                    apiKey
                );

                setPanoramaUrl(result.url);

                if (!result.isFromApi && apiKey && apiKey.trim() !== '') {
                    console.warn('Street View APIでの画像取得に失敗しました。');
                }
            } catch (err) {
                console.error('Error loading panorama:', err);
                setError('パノラマの読み込み中にエラーが発生しました。');
            } finally {
                setLoading(false);
            }
        };

        loadFromPath();
    }, [pathData, currentPointIndex, apiKey]);

    return {
        panoramaUrl,
        loading,
        error,
        loadPanorama
    };
}
