export interface Profile {
  // BFF現行仕様では name のみ返る想定。id 追加時はここを拡張。
  name: string;
  // id?: string; // 将来: BFFが id を返すようになったらコメントアウト解除
}