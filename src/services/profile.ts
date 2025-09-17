import { AuthService } from './auth';

const API_BASE_URL = 'http://localhost:50052';

export interface CreateProfileRequest {
  name: string;
}

import type { Profile } from '../types/profile';

export class ProfileService {
  static async createProfile(request: CreateProfileRequest): Promise<Profile> {
    try {
      const { token } = AuthService.getAuthData();
      
      if (!token) {
        throw new Error('認証トークンがありません');
      }

      console.log('プロフィール作成API呼び出し:', request);

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      });

      console.log('Profile API Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認証エラーが発生しました。再ログインしてください。');
        }
        throw new Error(`プロフィール作成に失敗しました (${response.status})`);
      }

      const data = await response.json();
      console.log('Profile created:', data);
      // idが含まれていない場合はエラー
      if (!('id' in data)) {
        throw new Error('APIレスポンスにidが含まれていません');
      }
      return data as Profile;
    } catch (error) {
      console.error('プロフィール作成エラー:', error);
      throw error;
    }
  }
}