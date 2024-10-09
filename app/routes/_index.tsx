import type { MetaFunction } from "@remix-run/node";
import { fetchAllSections, Section } from "~/utils/cms.server";
import { NavLink, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

export const loader: LoaderFunction = async () => {
  const sections = await fetchAllSections();

  if (!sections || sections.length === 0) {
    throw new Response('No Sections Found', { status: 404 });
  }

  return json({ sections });
};

export default function HomePage() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          セクション一覧
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section: Section) => (
            <Card
              key={section.id}
              className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {section.section}
                </h2>
                <p className="text-gray-600 flex-grow">
                  {section.description || 'このセクションの説明はありません。'}
                </p>
                <div className="mt-6">
                <NavLink to={`/sections/${section.slug}`} prefetch='render'>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-center"
                  >
                    セクションを見る
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
