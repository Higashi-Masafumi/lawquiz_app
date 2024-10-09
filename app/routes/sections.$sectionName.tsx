import { useLoaderData, json, NavLink } from '@remix-run/react';
import { fetchPostsBySection, fetchSectionBySlug, Post } from '~/utils/cms.server';
import type { LoaderFunction } from '@remix-run/node';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

export const loader: LoaderFunction = async ({ params }) => {
  const sectionName = params.sectionName as string;
  const section = await fetchSectionBySlug(sectionName);
  if (!section) {
    throw new Response('Not Found', { status: 404 });
  }
  const posts = await fetchPostsBySection(section);
  // 記事が存在しない場合のエラーハンドリング
  if (!posts || posts.length === 0) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ posts, section });
};

export default function SectionPage() {
  const { posts, section } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          {section.section} の記事一覧
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              {/* 記事のサムネイル画像（存在する場合） */}
              {/* {post.thumbnail && (
                <img
                  src={post.thumbnail.url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )} */}
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {post.title}
                </h2>
                <p className="text-gray-600 flex-grow">
                  {post.problem.replace(/(<([^>]+)>)/gi, '').substring(0, 100) + '...'}
                </p>
                <div className="mt-6">
                <NavLink to={`/article/${post.slug}`}>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-center">
                    記事を読む
                  </Button>
                </NavLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
