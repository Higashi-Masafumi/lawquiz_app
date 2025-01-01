export class Section {
  constructor(
    public readonly id: string,
    public readonly section: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly updatedAt: string,
    public readonly createdAt: string,
    public readonly publishedAt: string,
    public readonly revisedAt: string,
    public readonly posts: Post[] = []
  ) {}

  static fromResponse(response: any): Section {
    return new Section(
      response.id,
      response.section,
      response.slug,
      response.description,
      response.updatedAt,
      response.createdAt,
      response.publishedAt,
      response.revisedAt,
      response.posts?.map(Post.fromResponse) ?? []
    );
  }
}

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

export class Question {
  constructor(
    public readonly theme: string,
    public readonly question: string,
    public readonly answer: string,
    public readonly comment: string,
  ) {}

  static fromResponse(response: any): Question {
    return new Question(response.theme, response.question, response.answer, response.comment);
  }
}

