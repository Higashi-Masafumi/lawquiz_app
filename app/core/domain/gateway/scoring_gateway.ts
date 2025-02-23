import { Question } from "../entities/question";
import { GradingResult } from "../entities/grading";

export interface IScoringGateway {
  score(
    problem: string,
    question: Question,
    userAnswer: string
  ): Promise<GradingResult>;
}
