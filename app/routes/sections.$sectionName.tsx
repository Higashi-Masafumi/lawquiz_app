import { useLoaderData, json, NavLink } from "@remix-run/react";
import {
  fetchPostsBySection,
  fetchSectionBySlug,
  Post,
} from "~/utils/cms.server";
import type { LoaderFunction } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const loader: LoaderFunction = async ({ params }) => {
  const sectionName = params.sectionName as string;
  const section = await fetchSectionBySlug(sectionName);
  if (!section) {
    throw new Response("Not Found", { status: 404 });
  }
  const posts = await fetchPostsBySection(section);
  // 記事が存在しない場合のエラーハンドリング
  if (!posts || posts.length === 0) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ posts, section });
};

export default function SectionPage() {
  const { posts, section } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          {section.section} の記事一覧
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
          {posts.map((post: Post) => (
            <Card
              key={post.id}
              className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  更新日: {new Date(post.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-hidden">
                  <h6 className="text-sm font-bold text-gray-500">問題文</h6>
                  <p className="text-sm text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: post.problem }} />
                  </p>
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
