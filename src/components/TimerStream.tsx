import React, { useEffect, useState } from "react";

export type TimerMessage = {
  timer: number;
};

export interface TimerStreamProps {
  jwt: string;
}

const TimerStream: React.FC<TimerStreamProps> = ({ jwt }) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) return;
  const ws = new WebSocket(`ws://localhost:50052/start_game?jwt=${jwt}`);

    ws.onmessage = (event) => {
      try {
        const data: TimerMessage = JSON.parse(event.data);
        setTimer(data.timer);
      } catch (e) {
        setError("データの解析に失敗しました");
      }
    };

    ws.onerror = () => {
      setError("WebSocketエラーが発生しました");
    };

    ws.onclose = () => {
      // 必要なら接続終了時の処理
    };

    return () => {
      ws.close();
    };
  }, [jwt]);

  return (
    <div>
      {error ? (
        <span style={{ color: "red" }}>{error}</span>
      ) : timer !== null ? (
        <h2>Timer: {timer}</h2>
      ) : (
        <span>待機中...</span>
      )}
    </div>
  );
};

export default TimerStream;
