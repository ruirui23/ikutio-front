import { useApiOnce } from '../hooks/useApiOnce'; // 先ほど作成したフック

export function LocationDisplay() {
  // コンポーネントのトップレベルでフックを呼び出し、状態を受け取る
  const { data, error, isLoading } = useApiOnce('http://localhost:50052/get_locations');

  // 1. ローディング中の表示
  if (isLoading) {
    return <div>📍 位置情報を読み込み中...</div>;
  }

  // 2. エラーが発生した場合の表示
  if (error) {
    return <div>エラー: {error.message}</div>;
  }

  // 3. データの取得に成功した場合の表示
  return (
    <div>
      <h1>取得した位置情報</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>データがありませんでした。</p>
      )}
    </div>
  );
}