import { Post } from "~/core/domain/entities/post";
import { IScoringRepository } from "~/core/domain/repositories/scoring.repository";
import { IGradingRepository } from "../domain/repositories/grading.repository";
import { IScoringGateway } from "../domain/gateway/scoring_gateway";
import { GradingAnswer, GradingResult } from "~/core/domain/entities/grading";
import { Question } from "~/core/domain/entities/question";

export class ScoringService {
  /**
   * コンストラクタ
   * @param scoringRepository 採点結果保存用リポジトリ
   * @param gradingRepository 採点結果保存用リポジトリ
   * @param scoringGateway 採点用ゲートウェイ
   */
  constructor(
    private scoringRepository: IScoringRepository,
    private gradingRepository: IGradingRepository,
    private scoringGateway: IScoringGateway
  ) {}

  /**
   * 採点を行う
   * @param answer ユーザーの回答
   * @param post 問題
   * @returns 採点結果のID
   */
  async scoreAnswer(answer: string, post: Post): Promise<string> {
    // 答案を採点する
    const gradingResult = await this.scoringRepository.score(answer, post);

    // 採点結果を保存する
    const gradingAnswerId = await this.gradingRepository.registerGradingResult(
      post.id,
      gradingResult
    );

    return gradingAnswerId;
  }

  /**
   * 登録は行わずに採点のみを行う
   * @param problem 大問
   * @param question 小問
   * @param answer ユーザーの回答
   * @returns 採点結果
   */
  async scoreAnswerWithoutRegister(
    problem: string,
    question: Question,
    answer: string
  ): Promise<GradingResult> {
    return this.scoringGateway.score(problem, question, answer);
  }

  /**
   * 採点結果を取得する
   * @param gradingAnswerId 採点結果のID
   * @returns 採点結果
   */
  async getGradingAnswer(gradingAnswerId: string): Promise<GradingAnswer> {
    return this.gradingRepository.getGradingAnswer(gradingAnswerId);
  }
}
