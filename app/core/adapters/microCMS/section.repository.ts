import { Section } from "~/core/domain/entities/section";
import { createClient } from "microcms-js-sdk";
import { ISectionRepository } from "~/core/domain/repositories/section.repository";

export class SectionRepository implements ISectionRepository {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async listAll(): Promise<Section[]> {
    const response = await this.client.get({
      endpoint: "section",
      queries: {
        limit: 100,
      }
    });

    return response.contents.map((section: Section) => {
      return {
        id: section.id,
        section: section.section,
        slug: section.slug,
        description: section.description,
        updatedAt: section.updatedAt,
        createdAt: section.createdAt,
        publishedAt: section.publishedAt,
        revisedAt: section.revisedAt,
        posts:[],
      };
    });
  }

  async getBySlug(slug: string): Promise<Section> {
    const response = await this.client.get({
      endpoint: "section",
      queries: { filters: `slug[equals]${slug}` },
    });

    return {
        id: response.contents[0].id,
        section: response.contents[0].section,
        slug: response.contents[0].slug,
        description: response.contents[0].description,
        updatedAt: response.contents[0].updatedAt,
        createdAt: response.contents[0].createdAt,
        publishedAt: response.contents[0].publishedAt,
        revisedAt: response.contents[0].revisedAt,
        posts: [],
      };
  }
}
