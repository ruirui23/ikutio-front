import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth'; // AuthServiceのパスはプロジェクトに合わせて調整してください

/**
 * APIから一度だけデータを取得するためのカスタムフック
 * @param url リクエスト先のURL
 * @param enabled trueの場合にのみリクエストを実行する
 * @returns { data, error, isLoading }
 */
export function useApiOnce(url: string, enabled: boolean = true) {
  // 取得したデータ、エラー、ローディング状態を管理するState
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // enabledがfalse、またはURLが指定されていない場合は何もしない
    if (!enabled || !url) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      // データの取得を開始する前に、各Stateを初期状態にリセット
      setIsLoading(true);
      setData(null);
      setError(null);

      try {
        const { token } = AuthService.getAuthData();
        const resp = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const text = await resp.text();
        const json = text ? JSON.parse(text) : null;
        setData(json); // 取得したデータをStateに保存

      } catch (e: any) {
        // fetchが中断されたことによるエラーは無視する
        if (e?.name !== 'AbortError') {
          setError(e); // それ以外のエラーはStateに保存
        }
      } finally {
        // 成功・失敗にかかわらず、ローディング状態を解除
        setIsLoading(false);
      }
    })();

    // クリーンアップ関数：コンポーネントが不要になったらリクエストを中断
    return () => {
      controller.abort();
    };
  }, [url, enabled]); // urlかenabledが変更されたら再実行

  // コンポーネント側で利用できるよう、3つの状態を返す
  return { data, error, isLoading };
}