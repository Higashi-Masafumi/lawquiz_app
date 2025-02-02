import { Post } from "~/core/domain/entities/post";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";
import { GradingResult } from "~/core/domain/entities/grading";
import { IScoringRepository } from "~/core/domain/repositories/scoring.repository";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export class ScoringRepository implements IScoringRepository {
  constructor(private readonly openai: OpenAI) {}

  // 一つの採点項目の採点結果のスキーマ
  scoringCriterionSchema = z.object({
    item_title: z.string(),
    score: z.number(),
  });

  // 採点結果のスキーマ
  gradingDataSchema = z.object({
    results: z.array(this.scoringCriterionSchema),
    commentary: z.string(),
  });

  // スキーマの動的生成
  createScoringSchema = (scoring_criteria: ScoringCriterion[]) => {
    const schemaObject = scoring_criteria.reduce((acc, criterion) => {
      acc[criterion.item_title] = z.object({
        item_title: z.literal(criterion.item_title),
        score: z.number(),
      });
      return acc;
    }, {} as Record<string, z.ZodTypeAny>);

    return z.object({
      results: z.object(schemaObject),
      commentary: z.string(),
    });
  };

  /**
   * 採点する
   * @param answer 回答
   * @param scoring_criterion 採点基準
   * @returns 採点結果
   */
  async score(answer: string, post: Post): Promise<GradingResult> {
    const scoring_criteria = post.scoring_criteria;
    const scoringSchema = this.createScoringSchema(scoring_criteria);
    const problem = post.problem;
    const fact = post.fact;
    const prompt = `あなたは次の司法試験に関連する問題の採点官です。以下の採点基準基づいて与えられた回答を採点してください。
    問題: ${problem}
    要件事実: ${fact}
    採点基準: ${scoring_criteria
      .map((criterion) => `${criterion.item_title}(${criterion.score}点)`)
      .join(", ")}
    
    次に示す回答を採点し、それぞれの採点基準に基づいた点数評価と総評を指定されたフォーマットで返してください。
    フォーマット:
    {
        "results": [
            {
                "item_title": <採点基準名>,
                "score": <点数>
            },
            {
                "item_title": <採点基準名>,
                "score": <点数>
            },
        ],
        "commentary": <総評>
     }`;

    const completion = await this.openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [{ role: "system", content: prompt }, { role: "user", content: answer }],
      response_format: zodResponseFormat(scoringSchema, "results"),
    });

    const gradingData = completion.choices[0].message.parsed;
    if (!gradingData) {
      throw new Error("Failed to parse grading data");
    }

    const grading = scoring_criteria.map((criterion) => {
      const score = gradingData.results[criterion.item_title].score;
      return {
        title: criterion.item_title,
        score: score,
        maxScore: criterion.score,
        criterion: criterion.scoring_criterion,
        description: criterion.scoring_criterion,
      };
    });

    const gradedata: GradingResult = {
      article: post,
      answer: answer,
      grading: grading,
      commentary: gradingData.commentary,
    };

    return gradedata;
  }
}
