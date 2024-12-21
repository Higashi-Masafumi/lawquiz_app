import { fetchAllSections, Section } from "~/utils/cms.server";
import { NavLink, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
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
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold text-center mb-12">
          セクション一覧
        </h1>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start">
          {sections.map((section: Section) => (
            <Card
              key={section.id}
              className="shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle>
                  {section.section}
                </CardTitle>
                <CardDescription>
                  更新日: {new Date(section.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {section.description}
                </p>
              </CardContent>
              <CardFooter>
                <NavLink to={`/sections/${section.slug}`}>
                  <Button>
                    記事一覧を見る
                  </Button>
                </NavLink>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
