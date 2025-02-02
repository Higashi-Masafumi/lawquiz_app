import { Post } from "../entities/post";

export interface IPostRepository {
  // 記事のslugから記事を取得
  getBySlug(slug: string): Promise<Post>;
  // sectionのidから記事を取得
  getBySectionId(id: string): Promise<Post[]>;
  // 記事を検索
  search(query: string): Promise<Post[]>;
}
