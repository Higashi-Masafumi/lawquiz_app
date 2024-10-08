import { ScoringCriterion } from "./cms";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { fetchPostContent } from "./cms";
import { registerGrade } from "./cms";
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
    const prompt = `あなたは次の司法試験に関連する問題の採点官です。以下の採点基準基づいて与えられた回答を採点してください。
    問題: ${problem}
    要件事実: ${fact}
    採点基準: ${scoring_criteria.map((criterion) => `${criterion.item_title}(${criterion.score}点)`).join(', ')}
    
    次に示す回答を採点し、それぞれの採点基準に基づいた点数評価と総評を指定されたフォーマットで返してください。
    フォーマット:
    {
        "results": [
            {
                "item_title": "論理性",
                "score": 20
            },
            {
                "item_title": "独創性",
                "score": 20
            },
            {
                "item_title": "構成力",
                "score": 20
            },
            {
                "item_title": "表現力",
                "score": 20
            }
        ],
        "commentary": "この解答は全体的に良好ですが、表現力と構成力においてもう少し改善が必要です。特に論理性はしっかりしているので、その点をさらに強化すると良いでしょう。"
    }`;

    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: answer },
        ],
        response_format: zodResponseFormat(gradingDataSchema, 'results'),
    });

    const gradingData = completion.choices[0].message.parsed;
    if (!gradingData) {
        throw new Error('Failed to parse grading data');
    }

    const grading: Grading[] = scoring_criteria.map((criterion) => {
        const result = gradingData.results.find((result) => result.item_title === criterion.item_title);
        if (!result) {
            throw new Error(`Missing result for criterion: ${criterion.item_title}`);
        }
        return {
            title: criterion.item_title,
            score: result.score,
            maxScore: criterion.score,
            criterion: criterion.scoring_criterion,
            description: criterion.item_title,
        };
    });

    const gradedata: GradingResult = {
        grading: grading,
        commentary: gradingData.commentary,
    }

    const gradeId = await registerGrade(page_content, gradedata);

    return gradeId.id;
}


