import { Section } from "./section";
import { Question } from "./question";
import { ScoringCriterion } from "./scoring_criterion";

export class Post {
    constructor(
      public readonly id: string,
      public readonly title: string,
      public readonly slug: string,
      public readonly section: Section,
      public readonly problem: string,
      public readonly knowledge: string,
      public readonly column: string,
      public readonly fact: string,
      public readonly questions: Question[],
      public readonly navigate: string,
      public readonly comment: string,
      public readonly scoring_criteria: ScoringCriterion[],
      public readonly createdAt: string,
      public readonly updatedAt: string,
      public readonly publishedAt: string,
      public readonly revisedAt: string
    ) {}
  
    static fromResponse(response: any): Post {
      return new Post(
        response.id,
        response.title,
        response.slug,
        response.section,
        response.problem,
        response.knowledge,
        response.column,
        response.fact,
        response.question?.map(Question.fromResponse) ?? [],
        response.navigate,
        response.comment,
        response.scoring_criteria?.map(ScoringCriterion.fromResponse) ?? [],
        response.createdAt,
        response.updatedAt,
        response.publishedAt,
        response.revisedAt
      );
    }
  }