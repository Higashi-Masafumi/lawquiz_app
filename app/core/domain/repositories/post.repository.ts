import { Post } from "../entities/post";

export interface IPostRepository {
  // 記事を取得
  getBySlug(slug: string): Promise<Post>;
  // 記事を検索
  search(query: string): Promise<Post[]>;
}
