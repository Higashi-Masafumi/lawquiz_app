import { Post } from "~/core/domain/entities/post";
import { IPostRepository } from "~/core/domain/repositories/post.repository";

export class PostService {

  /**
   * コンストラクタ
   * @param postRepository 記事リポジトリ
   */
  constructor(private readonly postRepository: IPostRepository) {}

  /**
   * 記事を取得
   * @param slug 記事のスラッグ
   * @returns 記事
   */
  async getBySlug(slug: string): Promise<Post> {
    return await this.postRepository.getBySlug(slug);
  }

  /**
   * 記事を検索
   * @param query 検索クエリ
   * @returns 記事一覧
   */
  async search(query: string): Promise<Post[]> {
    return await this.postRepository.search(query);
  }
}
