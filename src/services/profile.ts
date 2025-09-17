import { AuthService } from './auth';

const API_BASE_URL = 'http://localhost:50052';  // TODO: 環境変数化(import.meta.env.VITE_API_BASE 等)検討

export interface CreateProfileRequest {
  name: string;
}

import type { Profile } from '../types/profile';

export class ProfileService {
  /**
   * BFF仕様: POST /create_profile へ { name } を送り { name } が返る想定。
   * まだ id/profile_id は返らないため Profile 型も最小(name のみ)を許容。
   */
  static async createProfile(request: CreateProfileRequest): Promise<Profile> {
    const { token } = AuthService.getAuthData();
    if (!token) throw new Error('認証トークンがありません');

    console.log('[ProfileService] createProfile ->', request);
    const resp = await fetch(`${API_BASE_URL}/create_profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    console.log('[ProfileService] status', resp.status);
    if (!resp.ok) {
      if (resp.status === 401) throw new Error('認証エラー: 再ログインしてください');
      let msg = `プロフィール作成に失敗しました (${resp.status})`;
      try {
        const errJson = await resp.json();
        if (errJson?.message) msg = errJson.message;
      } catch {/* ignore */}
      throw new Error(msg);
    }
    let data: any = null;
    try { data = await resp.json(); } catch {/* 空レスポンス許容 */}
    // 期待: { name: string }
    if (!data || typeof data.name !== 'string') {
      throw new Error('APIレスポンス形式が不正です (name がありません)');
    }
    return { name: data.name } as Profile; // id は未定義（将来拡張）
  }
}