import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Section } from "~/core/domain/entities/section";
import { CarouselSlider } from "./theme-carousel";
import { serviceResolver } from "~/resolvers/service.resolver";

export const loader: LoaderFunction = async () => {
  const sections = await serviceResolver.sectionService.listAll();
  if (!sections || sections.length === 0) {
    throw new Response("No Sections Found", { status: 404 });
  }
  return { sections };
};

export default function HomePage() {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-4xl font-bold text-center mb-12">法律問題集</h1>

        <div className="space-y-8 py-8">
          {sections.map((section: Section) => (
            <div key={section.id} className="space-y-4 border-b pb-8">
              <CarouselSlider
                title={section.section}
                description={section.description}
                rootUrl={`/sections/${section.slug}`}
                cards={section.posts.map((post) => ({
                title: post.title,
                description: post.problem,
                url: `/articles/${post.slug}`,
                }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
