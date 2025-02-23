import { Section } from "~/core/domain/entities/section";
import { Post } from "~/core/domain/entities/post";
import { Card, CardContent } from "~/components/ui/card";
import { NavLink, useLoaderData } from "@remix-run/react";
import { formatDate } from "~/utils/date";
import { serviceResolver } from "~/resolvers/service.resolver";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.slug) {
    throw new Response("Not Found", { status: 404 });
  }
  const section = await serviceResolver.sectionService.getBySlug(params.slug);
  if (!section) {
    throw new Response("Not Found", { status: 404 });
  }
  return { section };
}

export default function SectionPage() {
  const { section } = useLoaderData<{ section: Section }>();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-6">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold">{section.section}</h1>
          <p className="text-gray-600">
            {section.section}に関連する問題と解説をご覧いただけます
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {section.posts.map((post: Post) => (
            <NavLink to={`/articles/${post.slug}`} key={post.id}>
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 h-full flex flex-col">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      更新日: {formatDate(post.updatedAt)}
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2">
                      {post.title}
                    </h3>
                    <div
                      className="text-sm text-gray-600 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: post.problem }}
                    />
                  </div>

                  <div className="mt-4 text-sm text-emerald-600 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                    記事を見る
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
