import { Section } from "~/core/domain/entities/section";
import { ISectionRepository } from "~/core/domain/repositories/section.repository";
import { IPostRepository } from "~/core/domain/repositories/post.repository";
export class SectionService {
  /**
   * コンストラクタ
   * @param sectionRepository セクションリポジトリ
   */
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly postRepository: IPostRepository
  ) {}

  /**
   * セクション一覧を取得
   * @returns セクション一覧
   */
  async listAll(): Promise<Section[]> {
    const sections = await this.sectionRepository.listAll();
    return await Promise.all(
      sections.map(async (section) => ({
        ...section,
        posts: await this.postRepository.getBySectionId(section.id),
      }))
    );
  }

  /**
   * セクションを取得
   * @param slug セクションのスラッグ
   * @returns セクション
   */
  async getBySlug(slug: string): Promise<Section> {
    const section = await this.sectionRepository.getBySlug(slug);
    return {
      ...section,
      posts: await this.postRepository.getBySectionId(section.id),
    };
  }
}
