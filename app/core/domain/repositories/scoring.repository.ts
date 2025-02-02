import { Post } from "~/core/domain/entities/post";
import { GradingResult } from "~/core/domain/entities/grading";

export interface IScoringRepository {

    // 採点する
    score(answer: string, post: Post): Promise<GradingResult>;
}
