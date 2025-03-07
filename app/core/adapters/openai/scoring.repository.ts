import { Post } from "~/core/domain/entities/post";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";
import { GradingResult } from "~/core/domain/entities/grading";
import { IScoringRepository } from "~/core/domain/repositories/scoring.repository";
import OpenAI from "openai";

export class ScoringRepository implements IScoringRepository {
  constructor(private readonly openai: OpenAI) {}

  private createSystemPrompt(post: Post, userAnswer: string): string {
    return `
      あなたは司法試験の問題の回答を採点する採点者です。ユーザーの回答を模範解答と採点基準をもとに採点してください。
      【質問情報】
      大問: ${post.problem}
      要件事実: ${post.fact}
      模範解答: ${post.answer}
      解説: ${post.comment}
      【採点基準】
      ${post.scoring_criteria
        .map(
          (criterion) =>
            `${criterion.item_title}: ${criterion.scoring_criterion} 配点${criterion.score}点`
        )
        .join("\n")}
      【ユーザーの回答】
      ${userAnswer}
      
      出力は次に与えるJSONスキーマに従って、余計なテキストを含まずに出力してください。
    `;
  }

  private createJsonSchema(scoringCriteria: ScoringCriterion[]): string {
    interface CriterionSchema {
      type: "object";
      properties: {
        score: { type: "number"; description: string };
        description: { type: "string"; description: string };
      };
      required: string[];
      additionalProperties: boolean;
    }

    const criteriaProperties = scoringCriteria.reduce(
      (accumulator, criterion) => {
        const safeKey = encodeURIComponent(criterion.item_title);
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
          additionalProperties: false,
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

  private getGradingResult(
    response: string,
    scoringCriteria: ScoringCriterion[],
    userAnswer: string
  ): GradingResult {
    const gradingResult = JSON.parse(response);
    const grading = scoringCriteria.map((criterion) => {
      const safeKey = encodeURIComponent(criterion.item_title);
      return {
        title: criterion.item_title,
        score: gradingResult.grading[safeKey].score,
        maxScore: criterion.score,
        criterion: criterion.scoring_criterion,
        description: gradingResult.grading[safeKey].description,
      };
    });

    return {
      grading,
      commentary: gradingResult.commentary,
      answer: userAnswer,
    };
  }

  async score(answer: string, post: Post): Promise<GradingResult> {
    const systemPrompt = this.createSystemPrompt(post, answer);
    const jsonSchema = this.createJsonSchema(post.scoring_criteria);

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: answer },
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
        post.scoring_criteria,
        answer
      );
    } else {
      throw new Error("採点結果が取得できませんでした");
    }
  }
}
