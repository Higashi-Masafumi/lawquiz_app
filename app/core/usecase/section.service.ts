import { Section } from "~/core/domain/entities/section";
import { ISectionRepository } from "~/core/domain/repositories/section.repository";

export class SectionService {

  /**
   * コンストラクタ
   * @param sectionRepository セクションリポジトリ
   */
  constructor(private readonly sectionRepository: ISectionRepository) {}

  /**
   * セクション一覧を取得
   * @returns セクション一覧
   */
  async listAll(): Promise<Section[]> {
    return await this.sectionRepository.listAll();
  }

  /**
   * セクションを取得
   * @param slug セクションのスラッグ
   * @returns セクション
   */
  async getBySlug(slug: string): Promise<Section> {
    return await this.sectionRepository.getBySlug(slug);
  }
}
