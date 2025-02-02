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
  }