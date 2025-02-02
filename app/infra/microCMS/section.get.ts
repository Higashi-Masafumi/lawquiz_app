import { Section } from "~/core/domain/entities/section";
import { Post } from "~/core/domain/entities/post";
import { createClient } from "microcms-js-sdk";
import { MicroCMSResponse, MicroCMSContentBase } from "./types";

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

export const getSectionsWithPosts = async (): Promise<Section[]> => {
  const sections = await client.get<MicroCMSResponse<MicroCMSContentBase>>({
    endpoint: "section",
  });
  const sectionsWithPosts = await Promise.all(
    sections.contents.map(async (sectionData: MicroCMSContentBase) => {
      const posts = await client.get<MicroCMSResponse<MicroCMSContentBase>>({
        endpoint: "article",
        queries: { filters: `section[equals]${sectionData.id}` },
      });
      return Section.fromResponse({
        ...sectionData,
        posts: posts.contents,
      });
    })
  );
  return sectionsWithPosts;
};

export const getSectionBySlugWithPosts = async (
  slug: string
): Promise<Section | null> => {
  const section_data = await client.get({
    endpoint: "section",
    queries: { filters: `slug[equals]${slug}` },
  });
  console.log(section_data);
  const posts = await client.get({
    endpoint: "article",
    queries: { filters: `section[equals]${section_data.contents[0].id}` },
  });
  console.log(posts);
  return Section.fromResponse({
    ...section_data.contents[0],
    posts: posts.contents,
  });
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const response = await client.get({
    endpoint: "article",
    queries: { filters: `slug[equals]${slug}` },
  });
  return response.contents ? Post.fromResponse(response.contents) : null;
};
