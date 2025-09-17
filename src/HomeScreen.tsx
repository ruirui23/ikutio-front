import type { User } from './types/user.ts';

interface HomeScreenProps {
  user: User | null;
  onStartGame: () => void;
  onLogout: () => void;
}

export default function HomeScreen({ user, onStartGame, onLogout }: HomeScreenProps) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white'
    }}>
      {/* ヘッダー */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ fontSize: '16px' }}>
          Welcome, {user?.username || user?.email}
        </span>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ログアウト
        </button>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          24時間疑似マラソン
        </h1>

        <p style={{
          fontSize: '20px',
          marginBottom: '40px',
          opacity: 0.9,
          lineHeight: '1.6'
        }}>
          VRを使ってマラソンをしよう！
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onStartGame}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              minWidth: '200px'
            }}
          >
            マラソンスタート
          </button>

        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          width: '100%',
          marginTop: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '10px' }}>360度体験</h3>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              マウスやVRコントローラーで自由に視点を変更
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '10px' }}>位置取得</h3>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              自分の走った場所を取得
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '10px' }}>VR対応</h3>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              Meta Quest 3で没入感のある体験
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}