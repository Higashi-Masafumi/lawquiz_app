import { LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { Post } from "~/core/domain/entities/post";
import { Card, CardContent } from "~/components/ui/card";
import { Search } from "lucide-react";
import { serviceResolver } from "~/resolvers/service.resolver";
import { HtmlWithCustomStyling } from "~/components/htmlbox";

type LoaderData = {
  posts: Post[];
  query: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const query = new URL(request.url).searchParams.get("q");
  const posts = await serviceResolver.postService.search(query || "");
  return { posts, query };
}

export default function SearchPage() {
  const { posts, query } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center items-center gap-2">
            <Search className="w-6 h-6" />
            <h1 className="text-2xl font-bold">
              {query ? `"${query}" の検索結果` : "検索結果"}
            </h1>
          </div>
        </div>

        {/* 検索結果の表示 */}
        {posts.length === 0 ? (
          <Card className="h-[300px] bg-gray-50">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">
                  「{query}」に該当する記事が見つかりませんでした。
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <NavLink
                key={post.id}
                to={`/articles/${post.slug}`}
                prefetch="render"
              >
                <Card className="h-full overflow-hidden group">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 h-full flex flex-col">
                    <h3 className="font-bold mb-3 text-lg line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-4">
                      <div className="text-sm whitespace-pre-wrap">
                        <HtmlWithCustomStyling htmlString={post.problem} />
                      </div>
                    </p>
                    <div className="text-sm text-emerald-600 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                      もっとみる
                      <span className="inline-block transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Card>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
