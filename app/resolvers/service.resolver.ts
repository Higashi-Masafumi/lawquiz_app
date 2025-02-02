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

// microCMSのクライアント
const microCMSClient = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

// OpenAIのクライアント
const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// microCMSのリポジトリ
const microCMSGradingRepository = new GradingRepository(microCMSClient);
const microCMSPostRepository = new PostRepository(microCMSClient);
const microCMSSectionRepository = new SectionRepository(microCMSClient);

// OpenAIのリポジトリ
const openAIScoringRepository = new ScoringRepository(openAIClient);

// 依存関係の解決
export const serviceResolver = {
  scoringService: new ScoringService(
    openAIScoringRepository,
    microCMSGradingRepository
  ),
  postService: new PostService(microCMSPostRepository),
  sectionService: new SectionService(
    microCMSSectionRepository,
    microCMSPostRepository
  ),
};
