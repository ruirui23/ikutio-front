import type { User } from './types/user.ts';

interface HomeScreenProps {
  user: User | null;
  onStartGame: () => void;
  onLogout: () => void;
  onStartVRDemo?: () => void;
}

export default function HomeScreen({ user, onStartGame, onLogout, onStartVRDemo }: HomeScreenProps) {
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 80% at 50% 20%, #f5f7fa 80%, #e3e6ee 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Segoe UI", "Hiragino Sans", "Meiryo", sans-serif',
      color: '#222'
    }}>
      <header style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 64px',
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#3b3b3b',
          letterSpacing: '-0.02em',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{fontSize: '1.3em'}}>🏃‍♂️</span> 24時間疑似マラソン
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ 
            fontSize: '16px', 
            color: '#666',
            fontWeight: '500',
            letterSpacing: '-0.01em'
          }}>
            {user?.username || user?.email}
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)',
              color: '#444',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            ログアウト
          </button>
        </div>
      </header>

      <main style={{
        textAlign: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 32px',
        marginTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '32px',
          padding: '56px 44px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.10)',
          border: '1px solid #e5e7eb',
          marginBottom: '40px',
          width: '100%',
          maxWidth: '700px'
        }}>
          <h1 style={{
            fontSize: '38px',
            fontWeight: '800',
            marginBottom: '18px',
            color: '#222',
            letterSpacing: '-0.02em',
            fontFamily: 'inherit'
          }}>
            24時間疑似マラソン
          </h1>
          <p style={{ 
            fontSize: '20px', 
            marginBottom: '38px', 
            color: '#555',
            fontWeight: '400',
            lineHeight: '1.6'
          }}>
            VRを使ってマラソンをしよう！
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
            marginBottom: '44px',
            justifyContent: 'center'
          }}>
            <button
              onClick={onStartGame}
              style={{
                padding: '20px 56px',
                fontSize: '20px',
                fontWeight: '700',
                background: 'linear-gradient(90deg, #6366f1 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                minWidth: '240px',
                boxShadow: '0 6px 24px rgba(99,102,241,0.18)',
                transition: 'all 0.2s ease'
              }}
            >
              マラソンスタート
            </button>

            {onStartVRDemo && (
              <button
                onClick={onStartVRDemo}
                style={{
                  padding: '18px 44px',
                  fontSize: '18px',
                  fontWeight: '700',
                  background: 'linear-gradient(90deg, #fff 0%, #ede9fe 100%)',
                  color: '#7c3aed',
                  border: '2px solid #7c3aed',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  minWidth: '240px',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                VRコントローラーデモ
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '32px',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          marginBottom: '60px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
            borderRadius: '18px',
            padding: '32px',
            border: '1px solid #e0e7ff',
            position: 'relative',
            boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
            minWidth: '260px',
            maxWidth: '340px',
            flex: '1 1 0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '22px'
            }}>
              360°
            </div>
            <h3 style={{ 
              color: '#222', 
              fontSize: '19px',
              fontWeight: '700',
              margin: '0 0 12px 0'
            }}>360度体験</h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#64748B',
              margin: 0,
              lineHeight: '1.6'
            }}>
              マウスやVRコントローラーで自由に視点を変更
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%)',
            borderRadius: '18px',
            padding: '32px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 12px rgba(16,185,129,0.06)',
            minWidth: '260px',
            maxWidth: '340px',
            flex: '1 1 0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '24px'
            }}>
              📍
            </div>
            <h3 style={{ 
              color: '#222', 
              fontSize: '19px',
              fontWeight: '700',
              margin: '0 0 12px 0'
            }}>位置取得</h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#64748B',
              margin: 0,
              lineHeight: '1.6'
            }}>
              自分の走った場所を取得
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fef3f2 0%, #fff7ed 100%)',
            borderRadius: '18px',
            padding: '32px',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 12px rgba(251,191,36,0.06)',
            minWidth: '260px',
            maxWidth: '340px',
            flex: '1 1 0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '24px'
            }}>
              🥽
            </div>
            <h3 style={{ 
              color: '#222', 
              fontSize: '19px',
              fontWeight: '700',
              margin: '0 0 12px 0'
            }}>VR対応</h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#64748B',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Meta Quest 3で没入感のある体験
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}