// 2点間の緯度経度から距離(km)を計算する関数
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ルート全体の総距離を計算する関数
export function calculateTotalDistance(locations: { latitude: number, longitude: number }[]): number {
  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    const start = locations[i];
    const end = locations[i + 1];
    totalDistance += haversineDistance(start.latitude, start.longitude, end.latitude, end.longitude);
  }
  return totalDistance;
}