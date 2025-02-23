import { Post } from "~/core/domain/entities/post";

export class Grading {
  constructor(
    public readonly title: string,
    public readonly score: number,
    public readonly maxScore: number,
    public readonly criterion: string,
    public readonly description: string
  ) {}
}

export class GradingResult {
  constructor(
    public readonly answer: string,
    public readonly grading: Grading[],
    public readonly commentary: string
  ) {}
}

export class GradingAnswer {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly publishedAt: string,
    public readonly revisedAt: string,
    public readonly article: Post,
    public readonly answer: string,
    public readonly commentary: string,
    public readonly scores: Grading[]
  ) {}
}