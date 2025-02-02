
export class ScoringCriterion {
    constructor(
      public readonly item_title: string,
      public readonly score: number,
      public readonly scoring_criterion: string
    ) {}
  
    static fromResponse(response: any): ScoringCriterion {
      return new ScoringCriterion(
        response.item_title,
        response.score,
        response.scoring_criterion
      );
  }
}
