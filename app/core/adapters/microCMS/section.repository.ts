import { Section } from "~/core/domain/entities/section";
import { createClient } from "microcms-js-sdk";
import { ISectionRepository } from "~/core/domain/repositories/section.repository";
import { Post } from "~/core/domain/entities/post";
import { Question } from "~/core/domain/entities/question";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";

export class SectionRepository implements ISectionRepository {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async listAll(): Promise<Section[]> {
    const response = await this.client.get({
      endpoint: "section",
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
        posts: section.posts?.map((post: Post) => {
          return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            section: post.section,
            problem: post.problem,
            knowledge: post.knowledge,
            column: post.column,
            fact: post.fact,
            questions: post.questions.map((question: Question) => {
              return {
                theme: question.theme,
                question: question.question,
                answer: question.answer,
                comment: question.comment,
              };
            }),
            navigate: post.navigate,
            comment: post.comment,
            scoring_criteria: post.scoring_criteria.map((scoring_criterion: ScoringCriterion) => {
              return {
                item_title: scoring_criterion.item_title,
                score: scoring_criterion.score,
                scoring_criterion: scoring_criterion.scoring_criterion,
              };
            }),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            publishedAt: post.publishedAt,
            revisedAt: post.revisedAt,
          };
        }) ?? [],
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
        posts: response.contents[0].posts?.map((post: Post) => {
          return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            section: post.section,
            problem: post.problem,
            knowledge: post.knowledge,
            column: post.column,
            fact: post.fact,
            questions: post.questions.map((question: Question) => {
              return {
                theme: question.theme,
                question: question.question,
                answer: question.answer,
                comment: question.comment,
              };
            }),
            navigate: post.navigate,
            comment: post.comment,
            scoring_criteria: post.scoring_criteria.map((scoring_criterion: ScoringCriterion) => {
              return {
                item_title: scoring_criterion.item_title,
                score: scoring_criterion.score,
                scoring_criterion: scoring_criterion.scoring_criterion,
              };
            }),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            publishedAt: post.publishedAt,
          revisedAt: post.revisedAt,
        };
      }) ?? [],
    };
  }
}
