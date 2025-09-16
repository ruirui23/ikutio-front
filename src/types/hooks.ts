import type { PathData } from './streetView';

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
