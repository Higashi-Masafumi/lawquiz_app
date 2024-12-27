import { Post } from "~/domain/entities/section";
import { createClient } from "microcms-js-sdk";
import { MicroCMSResponse, MicroCMSContentBase } from "./types";

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

export const getPostContent = async (slug: string): Promise<Post | null> => {
  const response = await client.get<MicroCMSResponse<MicroCMSContentBase>>({
    endpoint: "article",
    queries: { filters: `slug[equals]${slug}` },
  });
  return response.contents[0] ? Post.fromResponse(response.contents[0]) : null;
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  const response = await client.get<MicroCMSResponse<MicroCMSContentBase>>({
    endpoint: "article",
    queries: { q: query },
  });
  return response.contents.map(Post.fromResponse);
};
