import { ScoringCriterion } from "./scoring_criterion";

export class Question {
  constructor(
    public readonly theme: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly comment: string,
    public readonly scoring_criteria: ScoringCriterion[]
  ) {}
}
