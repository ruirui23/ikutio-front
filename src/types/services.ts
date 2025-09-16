export interface PanoramaLoadResult {
    url?: string;
    isFromApi: boolean;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
}
