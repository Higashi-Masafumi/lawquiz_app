import { LoaderFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { Post } from "~/core/domain/entities/post";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";
import { serviceResolver } from "~/resolvers/service.resolver";

type LoaderData = {
  posts: Post[];
  query: string;
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const query = new URL(request.url).searchParams.get("q");
  const posts = await serviceResolver.postService.search(query || "");
  return json({ posts, query });
};

export default function SearchPage() {
  const { posts, query } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-12 px-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <Search className="w-6 h-6 text-gray-600 mr-2" />
          <h1 className="text-3xl font-bold">
            {query ? `"${query}" の検索結果` : "検索結果"}
          </h1>
        </div>

        {/* 検索結果の表示 */}
        {posts.length === 0 ? (
          <p className="text-gray-700">
            「{query}」に該当する記事が見つかりませんでした。
          </p>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 flex-grow">
                    <div dangerouslySetInnerHTML={{ __html: post.problem }} />
                  </p>
                  <div className="mt-6">
                    <NavLink to={`/article/${post.slug}`} prefetch="render">
                      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-center">
                        記事を読む
                      </Button>
                    </NavLink>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
