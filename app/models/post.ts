// types/post.ts
export interface Post {
    title: string;           // 記事のタイトル
    section: string;         // セクション名
    slug: string;            // 記事のURLスラッグ
    problem: string;         // 問題文（テキストエリア）
    knowledge: string;       // リッチテキストエディタ（HTML形式）
    column: string;          // リッチテキストエディタ（HTML形式）
    fact: string;            // 事実のテキストエリア
    navigate: string;        // ナビゲーションのテキストエリア
    comment: string;         // コメント（リッチテキストエディタ、HTML形式）
  }
  