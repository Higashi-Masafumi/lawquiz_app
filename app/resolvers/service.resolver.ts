import { createClient } from "microcms-js-sdk";
import { GradingRepository } from "~/core/adapters/microCMS/grading.repository";
import { PostRepository } from "~/core/adapters/microCMS/post.repository";
import { SectionRepository } from "~/core/adapters/microCMS/section.repository";
import { ScoringRepository } from "~/core/adapters/openai/scoring.repository";
import { ScoringService } from "~/core/usecase/scoring.service";
import { PostService } from "~/core/usecase/post.service";
import { SectionService } from "~/core/usecase/section.service";
import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { LangChainScoringRepository } from "~/core/adapters/langchain/scoring.repository";

export const USE_LANGCHAIN = true;

// microCMSのクライアント
const microCMSClient = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

// OpenAIのクライアント
const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

// microCMSのリポジトリ
const microCMSGradingRepository = new GradingRepository(microCMSClient);
const microCMSPostRepository = new PostRepository(microCMSClient);
const microCMSSectionRepository = new SectionRepository(microCMSClient);

// OpenAIのリポジトリ
const openAIScoringRepository = new ScoringRepository(openAIClient);
const langChainScoringRepository = new LangChainScoringRepository(
  embeddings,
  chatModel
);

// 依存関係の解決
export const serviceResolver = {
  scoringService: new ScoringService(
    USE_LANGCHAIN ? langChainScoringRepository : openAIScoringRepository,
    microCMSGradingRepository
  ),
  postService: new PostService(microCMSPostRepository),
  sectionService: new SectionService(
    microCMSSectionRepository,
    microCMSPostRepository
  ),
};
