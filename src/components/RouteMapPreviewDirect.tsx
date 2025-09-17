import { useMemo } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface RouteMapPreviewProps {
  locations: Location[];
}

export default function RouteMapPreviewDirect({ locations }: RouteMapPreviewProps) {
  const mapUrl = useMemo(() => {
    if (locations.length < 2) return null;

    // Use Google Maps directions URL (web) which works without an API key.
    // Note: embedding third-party pages in an iframe may be blocked by X-Frame-Options.
    const baseUrl = 'https://www.google.com/maps/dir/';

    const startPoint = `${locations[0].latitude},${locations[0].longitude}`;
    const endPoint = `${locations[locations.length - 1].latitude},${locations[locations.length - 1].longitude}`;

    const sampled = locations
      .slice(1, -1)
      .filter((_, index) => index % Math.ceil(Math.max(1, locations.length) / 20) === 0)
      .map(loc => `${loc.latitude},${loc.longitude}`);

    const params = new URLSearchParams({ api: '1', origin: startPoint, destination: endPoint });
    if (sampled.length > 0) params.set('waypoints', sampled.join('|'));

    return `${baseUrl}?${params.toString()}`;
  }, [locations]);

  if (!mapUrl) {
    return <div style={styles.container}>ルート情報が不十分です。</div>;
  }

  return (
    <div style={styles.container}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>
      <div style={{ padding: 8, background: '#222', color: '#ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small>注: 一部の外部サイトは iframe 埋め込みを拒否します。表示されない場合は下のボタンで新しいタブで開いてください。</small>
        <div>
          <button onClick={() => window.open(mapUrl, '_blank', 'noopener')} style={{ marginLeft: 8 }}>地図を新しいタブで開く</button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '180px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '15px',
    background: '#333',
  },
};