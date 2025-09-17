/**
 * VRコントローラーカウント達成時に切り替える緯度経度のプリセット
 * 10回カウントごとに順番に変更される
 */
export interface LocationPreset {
    latitude: number;
    longitude: number;
    name: string;
}

export const LOCATION_PRESETS: LocationPreset[] = [
    {
        latitude: 35.6762,
        longitude: 139.6503,
        name: '東京タワー'
    },
    {
        latitude: 35.3606,
        longitude: 138.7274,
        name: '富士山'
    },
    {
        latitude: 34.0522,
        longitude: -118.2437,
        name: 'ロサンゼルス'
    },
    {
        latitude: 40.7589,
        longitude: -73.9851,
        name: 'タイムズスクエア'
    },
    {
        latitude: 51.5007,
        longitude: -0.1246,
        name: 'ロンドン'
    },
    {
        latitude: 48.8584,
        longitude: 2.2945,
        name: 'エッフェル塔'
    },
    {
        latitude: 41.8902,
        longitude: 12.4922,
        name: 'ローマ・コロッセオ'
    },
    {
        latitude: 35.6586,
        longitude: 139.7454,
        name: '皇居'
    },
    {
        latitude: 34.6937,
        longitude: 135.5023,
        name: '大阪城'
    },
    {
        latitude: 35.0116,
        longitude: 135.7681,
        name: '清水寺'
    }
];

/**
 * カウント数に基づいて次の場所を取得する
 * @param totalCount 総カウント数
 * @returns LocationPreset
 */
export function getLocationByCount(totalCount: number): LocationPreset {
    const index = Math.floor(totalCount / 10) % LOCATION_PRESETS.length;
    return LOCATION_PRESETS[index];
}
