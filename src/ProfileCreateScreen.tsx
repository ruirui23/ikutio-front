import React, { useState } from 'react';
import type { User } from './types/user';
import { AuthService } from './services/auth';
import { ProfileService } from './services/profile';

interface ProfileCreateScreenProps {
  user: User | null;
  onProfileCreated: (updatedUser: User) => void;
  onLogout: () => void;
}

const ProfileCreateScreen: React.FC<ProfileCreateScreenProps> = ({ 
  user, 
  onProfileCreated, 
  onLogout 
}) => {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setError('表示名を入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Service 経由で実行 (レスポンスは { name })
      await ProfileService.createProfile({ name: displayName.trim() });
      const authData = AuthService.getAuthData();
      const token = authData.token!; // ここまで来て null のはずはない
      const updatedUser: User = {
        ...user!,
        displayName: displayName.trim(),
        // profileId: 将来 id が返るようになったら設定
      };
      AuthService.saveAuthData(token, updatedUser);
      onProfileCreated(updatedUser);
    } catch (err) {
      console.error('Profile creation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('プロフィールの作成に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          プロフィール作成
        </h2>
        
        <p style={{
          margin: '0 0 24px 0',
          color: '#666',
          fontSize: '14px'
        }}>
          ゲームで使用する名前を設定してください
        </p>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c00',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              color: '#555',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: プレイヤー太郎"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? '作成中...' : 'プロフィールを作成'}
          </button>
        </form>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
          disabled={loading}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default ProfileCreateScreen;