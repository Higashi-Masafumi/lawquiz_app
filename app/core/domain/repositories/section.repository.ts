import { Section } from "../entities/section";

export interface ISectionRepository {
  // セクション一覧を取得
  listAll(): Promise<Section[]>;
  // セクションを取得
  getBySlug(slug: string): Promise<Section>;
}
