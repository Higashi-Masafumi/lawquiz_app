// Complete implementation replacing the original, strictly returning JSON in a fixed format
// and implementing IScoringRepository. This version:
// 1. Loads local PDF into memory
// 2. Embeds it using OpenAIEmbeddings
// 3. Stores embeddings in an HNSWLib vector store
// 4. For each answer to score, does a similarity search
// 5. Sends context & prompt instructions to GPT-4 via ChatOpenAI
// 6. Strictly parses JSON using StructuredOutputParser & Zod
// 7. Returns a GradingResult that satisfies IScoringRepository

import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

import { IScoringRepository } from "~/core/domain/repositories/scoring.repository";
import { Post } from "~/core/domain/entities/post";
import { GradingResult } from "~/core/domain/entities/grading";
import { ScoringCriterion } from "~/core/domain/entities/scoring_criterion";

const ScoringOutputSchema = z.object({
  results: z.array(
    z.object({
      item_title: z.string(),
      score: z.number(),
    })
  ),
  commentary: z.string(),
});

export class LangChainScoringRepository implements IScoringRepository {
  private vectorStore: HNSWLib | null = null;
  private initPromise: Promise<void>;

  /**
   * @param embeddings Pre-configured OpenAIEmbeddings instance
   * @param chatModel Pre-configured ChatOpenAI instance
   * @param pdfFilename Name (or path) of the PDF file containing law or reference docs
   */
  constructor(
    private readonly embeddings: OpenAIEmbeddings,
    private readonly chatModel: ChatOpenAI,
    private readonly pdfFilename: string = "m29hou89.pdf"
  ) {
    // 初期化をPromiseとして保持
    this.initPromise = this.initVectorStore();
  }

  /**
   * Reads the local PDF file, loads into memory, and builds the vector store.
   * If you want a different loader or a different format, adjust accordingly.
   */
  private async initVectorStore(): Promise<void> {
    const pdfPath = path.join(process.cwd(), "public", this.pdfFilename);
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    this.vectorStore = await HNSWLib.fromDocuments(docs, this.embeddings);
  }

  private createScoringSchema(criteria: ScoringCriterion[]): z.ZodSchema {
    const itemTitles = criteria.map((c) => c.item_title);
    return z.object({
      results: z.array(
        z.object({
          item_title: z.enum([itemTitles[0], ...itemTitles.slice(1)]),
          score: z.number(),
        })
      ),
      commentary: z.string(),
    });
  }

  /**
   * Score an answer using the LLM, retrieving the relevant docs from the vector store.
   * @param answer The user's essay/answer
   * @param post The post object that includes the problem, fact, and scoring criteria.
   * @returns A GradingResult containing the structured results.
   */
  public async score(answer: string, post: Post): Promise<GradingResult> {
    await this.initPromise;
    if (!this.vectorStore) {
      throw new Error("Vector store not initialized");
    }

    const relevantDocs = await this.vectorStore.similaritySearch(
      `${post.problem} ${post.fact}`,
      3
    );
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `あなたは次の司法試験に関連する問題の採点官です。以下の採点基準に基づいて与えられた回答を採点してください。
        問題: {problem}
        要件事実: {fact}
        採点基準: {criteria}

        次に示す回答を採点し、それぞれの採点基準に基づいた点数評価と総評を指定されたフォーマットで返してください。
        総評では引用などを用いて、回答の内容をより具体的に評価してください。
        フォーマット:
        {{
          "results": [
            {{
              "item_title": <採点基準名>,
              "score": <点数>
            }}
          ],
          "commentary": <総評>
        }}`,
      ],
      ["user", "{answer}"],
    ]);

    const criteriaString = post.scoring_criteria
      .map((c) => `${c.item_title}(${c.score}点)`)
      .join(", ");

    this.chatModel.withStructuredOutput(ScoringOutputSchema);

    const chain = prompt.pipe(this.chatModel);
    const response = await chain.invoke({
      problem: post.problem,
      fact: post.fact,
      context,
      criteria: criteriaString,
      answer,
    });

    const parser = new StructuredOutputParser(ScoringOutputSchema);
    let parsedResult;
    try {
      parsedResult = await parser.parse(response.text);
    } catch (err) {
      console.error("Failed to parse scoring response:", err);
      throw new Error("Failed to parse scoring data.");
    }

    // 採点結果をGradingResultの形式に変換
    const grading = post.scoring_criteria.map((criterion) => {
      const result = parsedResult.results.find(
        (r) => r.item_title === criterion.item_title
      );
      if (!result) {
        throw new Error(`Missing score for criterion: ${criterion.item_title}`);
      }

      return {
        title: criterion.item_title,
        score: result.score,
        maxScore: criterion.score,
        criterion: criterion.scoring_criterion,
        description: criterion.scoring_criterion,
      };
    });

    return {
      article: post,
      answer,
      grading,
      commentary: parsedResult.commentary,
    };
  }
}
