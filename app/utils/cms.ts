import { createClient } from "microcms-js-sdk";

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
    apiKey: process.env.MICROCMS_API_KEY!,
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
}

export const fetchPostContent = async (slug: string) => {
    const data = await client.get({
        endpoint: "article",
        queries: { filters: `slug[equals]${slug}` },
    });
    console.log(data);
    return data.contents[0] as Post;
}

export const fetchSectionBySlug = async (slug: string) => {
    const data = await client.get({
        endpoint: "section",
        queries: { filters: `slug[equals]${slug}` },
    });
    console.log(data);
    return data.contents[0] as Section;
}

export const fetchAllSections = async () => {
    const data = await client.get({ endpoint: "section" });
    console.log(data);
    return data.contents as Section[];
}

export const fetchPostsBySection = async (section: Section) => {
    const data = await client.get({
        endpoint: "article",
        queries: { filters: `section[equals]${section.id}` },
    });
    console.log(data);
    return data.contents as Post[];
}