import { ScoringCriterion } from "./cms.server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { fetchPostContent } from "./cms.server";
import { registerGrade } from "./cms.server";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 一つの採点項目の採点結果のスキーマ
const scoringCriterionSchema = z.object({
  item_title: z.string(),
  score: z.number(),
});

// 採点結果のスキーマ
const gradingDataSchema = z.object({
    results: z.array(scoringCriterionSchema),
    commentary: z.string(),
});

// スキーマの動的生成
const createScoringSchema = (scoring_criteria: ScoringCriterion[]) => {
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

// 結果画面に表示するデータ
export interface Grading {
    title: string;
    score: number;
    maxScore: number;
    criterion: string;
    description: string;
}

export interface GradingResult {
    grading: Grading[];
    commentary: string;
}

// 採点基準と回答をOpenAI APIに送信して採点結果を取得
export const gradeAnswer = async (answer: string, page_slug: string): Promise<string> => {
    const page_content = await fetchPostContent(page_slug);
    const scoring_criteria = page_content.scoring_criteria;
    const problem = page_content.problem;
    const fact = page_content.fact;
    const scoringSchema = createScoringSchema(scoring_criteria);
    const prompt = `あなたは次の司法試験に関連する問題の採点官です。以下の採点基準基づいて与えられた回答を採点してください。
    問題: ${problem}
    要件事実: ${fact}
    採点基準: ${scoring_criteria.map((criterion) => `${criterion.item_title}(${criterion.score}点)`).join(', ')}
    
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

    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: answer },
        ],
        response_format: zodResponseFormat(scoringSchema, 'results'),
    });

    const gradingData = completion.choices[0].message.parsed;
    if (!gradingData) {
        throw new Error('Failed to parse grading data');
    }

    console.log(gradingData);

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
        grading: grading,
        commentary: gradingData.commentary,
    }

    const gradeId = await registerGrade(page_content, answer, gradedata);

    return gradeId.id;
}


