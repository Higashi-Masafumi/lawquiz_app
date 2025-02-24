import { GradingAnswer, GradingResult } from "~/core/domain/entities/grading";
import { IGradingRepository } from "~/core/domain/repositories/grading.repository";
import { createClient } from "microcms-js-sdk";

export class GradingRepository implements IGradingRepository {
    /**
     * コンストラクタ
     * @param client 
     */
    constructor(private readonly client: ReturnType<typeof createClient>) {}

    /**
     * 採点結果を登録する
     * @param gradingResult 採点結果
     */
    async registerGradingResult(post_id: string, gradingResult: GradingResult): Promise<string> {
        const registeringData = {
            'article': post_id,
            'commentary': gradingResult.commentary,
            'answer': gradingResult.answer,
            'scores': gradingResult.grading.map((grading) => ({
                'fieldId': 'scoring_item',
                'title': grading.title,
                'score': grading.score,
                'maxScore': grading.maxScore,
                'criterion': grading.criterion,
                'description': grading.description,
            })),
        };

        const data = await this.client.create({
            endpoint: "answers",
            content: registeringData,
        });

        return data.id;
    }

    /**
     * 採点結果を取得する
     * @param gradingAnswerId 採点結果のID
     * @returns 採点結果
     */
    async getGradingAnswer(gradingAnswerId: string): Promise<GradingAnswer> {
        const data = await this.client.get({
            endpoint: "answers",
            queries: { filters: `id[equals]${gradingAnswerId}` },
        });
        return data.contents[0] as GradingAnswer;
    }
}