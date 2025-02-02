import { GradingAnswer, GradingResult } from "~/core/domain/entities/grading";

export interface IGradingRepository {

    // 答案と採点結果を登録する
    registerGradingResult(gradingResult: GradingResult): Promise<string>;

    // 採点結果を取得する
    getGradingAnswer(gradingAnswerId: string): Promise<GradingAnswer>;
}
