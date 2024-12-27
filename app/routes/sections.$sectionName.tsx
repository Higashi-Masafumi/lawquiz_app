import { json } from "@remix-run/node";
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getSectionBySlugWithPosts } from "~/infra/microCMS/section.get";
import type { Section, Post } from "~/domain/entities/section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { NavLink, useLoaderData } from "@remix-run/react";
import { formatDate } from "~/utils/date";

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  console.log("SectionPage loader called with:", params.sectionName);
  try {
    const section = await getSectionBySlugWithPosts(params.sectionName!);
    console.log("Section data:", section);
    if (!section) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({ section });
  } catch (error) {
    console.error("Error in section loader:", error);
    throw new Response("Error loading section", { status: 500 });
  }
};

export default function SectionPage() {
  const { section } = useLoaderData<{ section: Section }>();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          {section.section} の記事一覧
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
          {section.posts.map((post: Post) => (
            <Card
              key={post.id}
              className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  更新日: {formatDate(post.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-hidden">
                  <h6 className="text-sm font-bold text-gray-500">問題文</h6>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: post.problem }}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <NavLink to={`/article/${post.slug}`}>
                  <Button>記事を見る</Button>
                </NavLink>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
