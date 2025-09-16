import type { LoginRequest, LoginResponse, User } from '../types/user';

const API_BASE_URL = 'http://localhost:50052';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('バックエンド /login エンドポイントに接続中...', credentials);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('メールアドレスまたはパスワードが間違っています');
        }
        if (response.status === 422) {
          throw new Error('入力データの形式が正しくありません');
        }
        if (response.status === 500) {
          throw new Error('サーバーエラーが発生しました');
        }
        throw new Error(`ログインに失敗しました (エラーコード: ${response.status})`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (parseError) {
        console.error('JSON解析エラー:', parseError);
        throw new Error('サーバーレスポンスの形式が正しくありません');
      }
      
      // バックエンドの実際のレスポンス形式に合わせて変換
      if (!data.jwt) {
        throw new Error('認証トークンが見つかりません');
      }

      return {
        token: data.jwt,  // バックエンドは "jwt" フィールドを使用
        user: {
          id: data.id,
          email: credentials.email,  // emailはレスポンスに含まれていないため入力値を使用
          username: credentials.email.split('@')[0]  // ユーザー名をemailから生成
        }
      };
      
    } catch (error) {
      console.error('ログインエラー:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
      }
      
      throw error;
    }
  }

  static saveAuthData(token: string, user: User): void {
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user-data', JSON.stringify(user));
  }

  static getAuthData(): { token: string | null; user: User | null } {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user-data');
    
    return {
      token,
      user: userData ? JSON.parse(userData) as User : null
    };
  }

  static logout(): void {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
  }
}