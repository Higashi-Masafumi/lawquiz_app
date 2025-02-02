import { Post } from "~/core/domain/entities/post";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";
import { Question } from "~/core/domain/entities/question";
import { createClient } from "microcms-js-sdk";
import { IPostRepository } from "~/core/domain/repositories/post.repository";

export class PostRepository implements IPostRepository {
  constructor(private readonly client: ReturnType<typeof createClient>) {}

  async getBySlug(slug: string): Promise<Post> {
    const response = await this.client.get({
      endpoint: "article",
      queries: { filters: `slug[equals]${slug}` },
    });

    return {
      id: response.contents[0].id,
      title: response.contents[0].title,
      slug: response.contents[0].slug,
      section: response.contents[0].section,
      problem: response.contents[0].problem,
      knowledge: response.contents[0].knowledge,
      column: response.contents[0].column,
      fact: response.contents[0].fact,
      questions:
        response.contents[0].question?.map((question: Question) => {
          return {
            theme: question.theme,
            question: question.question,
            answer: question.answer,
            comment: question.comment,
          };
        }) ?? [],
      navigate: response.contents[0].navigate,
      comment: response.contents[0].comment,
      scoring_criteria:
        response.contents[0].scoring_criteria?.map(
          (scoring_criterion: ScoringCriterion) => {
            return {
              item_title: scoring_criterion.item_title,
              score: scoring_criterion.score,
              scoring_criterion: scoring_criterion.scoring_criterion,
            };
          }
        ) ?? [],
      createdAt: response.contents[0].createdAt,
      updatedAt: response.contents[0].updatedAt,
      publishedAt: response.contents[0].publishedAt,
      revisedAt: response.contents[0].revisedAt,
    };
  }

  async getBySectionId(id: string): Promise<Post[]> {
    const response = await this.client.get({
      endpoint: "article",
      queries: { filters: `section[equals]${id}` },
    });

    return response.contents.map((post: Post) => {
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        section: post.section,
        problem: post.problem,
        knowledge: post.knowledge,
        column: post.column,
        fact: post.fact,
        questions: post.questions?.map((question: Question) => {
          return {
            theme: question.theme,
            question: question.question,
            answer: question.answer,
            comment: question.comment,
          };
        }) ?? [],
        navigate: post.navigate,
        comment: post.comment,
        scoring_criteria: post.scoring_criteria?.map((scoring_criterion: ScoringCriterion) => {
          return {
            item_title: scoring_criterion.item_title,
            score: scoring_criterion.score,
            scoring_criterion: scoring_criterion.scoring_criterion,
          };
        }) ?? [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
        revisedAt: post.revisedAt,
      };
    });
  }

  async search(query: string): Promise<Post[]> {
    const response = await this.client.get({
      endpoint: "article",
      queries: { q: query },
    });

    return response.contents.map((post: Post) => {
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        section: post.section,
        problem: post.problem,
        knowledge: post.knowledge,
        column: post.column,
        fact: post.fact,
        questions: post.questions?.map((question: Question) => {
          return {
            theme: question.theme,
            question: question.question,
            answer: question.answer,
            comment: question.comment,
          };
        }) ?? [],
        navigate: post.navigate,
        comment: post.comment,
        scoring_criteria: post.scoring_criteria?.map((scoring_criterion: ScoringCriterion) => {
          return {
            item_title: scoring_criterion.item_title,
            score: scoring_criterion.score,
            scoring_criterion: scoring_criterion.scoring_criterion,
          };
        }) ?? [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
        revisedAt: post.revisedAt,
      };
    });
  }
}
