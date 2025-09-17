export interface LocationData {
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface LocationGroup {
    location_id: string;
    locations: LocationData[];
}

export interface LocationGroupsResponse {
    location_groups: LocationGroup[];
}

/**
 * APIから位置情報グループを取得する
 */
export async function fetchLocationGroups(): Promise<LocationGroupsResponse> {
    try {
        console.log('APIからデータを取得します');
        const response = await fetch('https://ikutio-back.tatsuya871-1005.workers.dev/locations');

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data: LocationGroupsResponse = await response.json();
        console.log('APIからデータを正常に取得しました:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch location groups:', error);
        throw error;
    }
}

/**
 * location_idで特定のLocationGroupを取得する
 */
export function findLocationGroupById(locationGroups: LocationGroup[], locationId: string): LocationGroup | null {
    return locationGroups.find(group => group.location_id === locationId) || null;
}

/**
 * LocationGroupから現在の位置を取得する（インデックス指定）
 */
export function getCurrentLocation(locationGroup: LocationGroup, currentIndex: number): LocationData | null {
    if (currentIndex < 0 || currentIndex >= locationGroup.locations.length) {
        return null;
    }
    return locationGroup.locations[currentIndex];
}

/**
 * LocationGroupの進行状況を計算する
 */
export function calculateProgress(locationGroup: LocationGroup, currentIndex: number): {
    current: number;
    total: number;
    percentage: number;
} {
    const current = Math.max(0, Math.min(currentIndex + 1, locationGroup.locations.length));
    const total = locationGroup.locations.length;
    const percentage = total > 0 ? (current / total) * 100 : 0;

    return { current, total, percentage };
}
