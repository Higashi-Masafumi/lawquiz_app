import { IScoringGateway } from "~/core/domain/gateway/scoring_gateway";
import { OpenAI } from "openai";
import { Question } from "~/core/domain/entities/question";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";
import { GradingResult } from "~/core/domain/entities/grading";

export class OpenAIScoringGateway implements IScoringGateway {
  constructor(private readonly openai: OpenAI) {}

  /**
   * システムプロンプトを作成
   * @param question 質問
   * @param userAnswer ユーザーの回答
   * @returns システムプロンプト
   */
  private createSystemPrompt(
    problem: string,
    question: Question,
    userAnswer: string
  ): string {
    return `
        あなたは司法試験の問題の回答を採点する採点者です。ユーザーの回答を模範解答と採点基準をもとに採点してください。
        【質問情報】
        大問: ${problem}
        小問テーマ: ${question.theme}
        小問: ${question.question}
        小問模範解答: ${question.answer}
        小問解説: ${question.comment}
        【採点基準】
        ${question.scoring_criteria
          .map(
            (criterion) =>
              `${criterion.item_title}: ${criterion.scoring_criterion} 配点${criterion.score}点`
          )
          .join("\n")}
        【ユーザーの小問に対する回答】
        ${userAnswer}
        
        出力は次に与えるJSONスキーマに従って、余計なテキストを含まずに出力してください。
        `;
  }

  /**
   * 出力JSONのスキーマを作成
   * @param scoringCriteria 採点基準
   * @returns 出力JSONのスキーマ
   */
  private createJsonSchema(scoringCriteria: ScoringCriterion[]): string {
    // 採点項目ごとにJSONスキーマを定義
    interface CriterionSchema {
      type: "object";
      properties: {
        score: { type: "number"; description: string };
        description: { type: "string"; description: string };
      };
      required: string[];
      additionalProperties: boolean;
    }
    // 採点項目ごとにJSONスキーマを定義
    const criteriaProperties = scoringCriteria.reduce(
      (accumulator, criterion) => {
        const safeKey = encodeURIComponent(criterion.item_title); // 日本語キーをエンコード
        accumulator[safeKey] = {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "この採点項目の得点",
            },
            description: {
              type: "string",
              description: "この採点項目に対する評価コメント",
            },
          },
          required: ["score", "description"],
          additionalProperties: false, // 各採点項目オブジェクトに追加
        };
        return accumulator;
      },
      {} as Record<string, CriterionSchema>
    );

    const fullSchema = {
      type: "object",
      properties: {
        grading: {
          type: "object",
          properties: criteriaProperties,
          additionalProperties: false,
          required: Object.keys(criteriaProperties),
          description: "各採点項目ごとの採点結果",
        },
        commentary: {
          type: "string",
          description: "総評",
        },
      },
      required: ["grading", "commentary"],
      additionalProperties: false,
    };

    return JSON.stringify(fullSchema);
  }

  /**
   * 採点結果を取得
   * @param response レスポンス
   * @param scoringCriteria 採点基準
   * @param userAnswer ユーザーの回答
   * @returns 採点結果
   */
  private getGradingResult(
    response: string,
    scoringCriteria: ScoringCriterion[],
    userAnswer: string
  ): GradingResult {
    const gradingResult = JSON.parse(response);
    const grading = scoringCriteria.map((criterion) => {
      const safeKey = encodeURIComponent(criterion.item_title); // 同じエンコードを使用
      return {
        title: criterion.item_title,
        score: gradingResult.grading[safeKey].score,
        maxScore: criterion.score,
        criterion: criterion.item_title,
        description: gradingResult.grading[safeKey].description,
      };
    });

    return {
      grading,
      commentary: gradingResult.commentary,
      answer: userAnswer,
    };
  }

  /**
   * 採点を行う
   * @param question 質問
   * @param userAnswer ユーザーの回答
   * @returns 採点結果
   */
  async score(
    problem: string,
    question: Question,
    userAnswer: string
  ): Promise<GradingResult> {
    const systemPrompt = this.createSystemPrompt(problem, question, userAnswer);
    const jsonSchema = this.createJsonSchema(question.scoring_criteria);

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userAnswer },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scoring",
          strict: true,
          schema: JSON.parse(jsonSchema),
        },
      },
    });

    const message = response.choices[0].message;
    if (message.content) {
      return this.getGradingResult(
        message.content,
        question.scoring_criteria,
        userAnswer
      );
    } else {
      throw new Error("採点結果が取得できませんでした");
    }
  }
}
