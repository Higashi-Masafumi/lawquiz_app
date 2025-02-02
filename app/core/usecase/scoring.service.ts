import { Post } from "~/core/domain/entities/post";
import { IScoringRepository } from "~/core/domain/repositories/scoring.repository";
import { IGradingRepository } from "../domain/repositories/grading.repository";
import { GradingAnswer } from "~/core/domain/entities/grading";

export class ScoringService {
  constructor(
    private scoringRepository: IScoringRepository,
    private gradingRepository: IGradingRepository
  ) {}

  async scoreAnswer(answer: string, post: Post): Promise<string> {
    // 答案を採点する
    const gradingResult = await this.scoringRepository.score(answer, post);

    // 採点結果を保存する
    const gradingAnswerId = await this.gradingRepository.registerGradingResult(
      gradingResult
    );

    return gradingAnswerId;
  }

  async getGradingAnswer(gradingAnswerId: string): Promise<GradingAnswer> {
    return this.gradingRepository.getGradingAnswer(gradingAnswerId);
  }
}
