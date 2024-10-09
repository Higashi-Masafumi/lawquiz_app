import { createClient } from "microcms-js-sdk";
import { Grading, GradingResult } from "./openai.server";
import dotenv from "dotenv";
dotenv.config();
export const client = createClient({
    serviceDomain: process.env.VITE_MICROCMS_SERVICE_DOMAIN!,
    apiKey: process.env.VITE_MICROCMS_API_KEY!,
});

export interface Section {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    section: string;
    slug: string;
    description: string;
}

export interface ScoringCriterion {
    item_title: string;
    score: number;
    scoring_criterion: string;
}

export interface Post {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    slug: string;
    section: Section;
    problem: string;
    knowledge: string;
    column: string;
    fact: string;
    navigate: string;
    comment: string;
    scoring_criteria: ScoringCriterion[];
}

export interface gradeAnswer {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    article: Post;
    answer: string;
    commentary: string;
    scores: {
        fieldId: string;
        title: string;
        score: number;
    }[];
}

export const fetchPostContent = async (slug: string) => {
    const data = await client.get({
        endpoint: "article",
        queries: { filters: `slug[equals]${slug}` },
    });
    return data.contents[0] as Post;
}

export const searchPosts = async (query: string) => {
    const data = await client.get({
        endpoint: "article",
        queries: { q: query },
    });
    return data.contents as Post[];
}

export const fetchSectionBySlug = async (slug: string) => {
    const data = await client.get({
        endpoint: "section",
        queries: { filters: `slug[equals]${slug}` },
    });
    return data.contents[0] as Section;
}

export const fetchAllSections = async () => {
    const data = await client.get({ endpoint: "section" });
    return data.contents as Section[];
}

export const fetchPostsBySection = async (section: Section) => {
    const data = await client.get({
        endpoint: "article",
        queries: { filters: `section[equals]${section.id}` },
    });
    return data.contents as Post[];
}

export const registerGrade = async (post_content: Post, answer: string, gradeData: GradingResult) => {
    // その記事に対して採点結果を登録
    const registeringData = {
        'article': post_content.id,
        'commentary': gradeData.commentary,
        'answer': answer,
        'scores': gradeData.grading.map((grading) => ({
            'fieldId': 'scoring_item',
            'title': grading.title,
            'score': grading.score,
        })),
    };

    const data = await client.create({
        endpoint: "answers",
        content: registeringData,
    });
    return data;
}

export const fetchGrade = async (id: string) => {
    const data = await client.get({
        endpoint: "answers",
        queries: { filters: `id[equals]${id}` },
    });
    return data.contents[0] as gradeAnswer;
}