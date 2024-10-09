import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useRouteLoaderData, useRouteError } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import Navigation from "./components/Navigation"
import { fetchAllSections, Section } from "./utils/cms.server";
import styles from "./tailwind.css?url";

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const sections = await fetchAllSections();
  if (!sections || sections.length === 0) {
    throw new Response("No Sections Found", { status: 404 });
    return { error: true };
  }
  return { sections : sections };
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: styles,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {

  // root の loader で取得したデータを取得
  const { sections } = useRouteLoaderData("root") as { sections: Section[] };
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation sections={sections} />
        <main>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
