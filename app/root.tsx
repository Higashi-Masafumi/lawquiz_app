import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  Link,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import styles from "./tailwind.css?url";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar/app-sidebar";

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
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.log("error boundary", error);
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return <Error404 />;
      case 500:
        return <Error500 />;
    }
  } else if (error instanceof Error) {
    return <Error500 />;
  } else {
    return (
      <div className="flex items-center justify-center w-full h-screen px-4">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">不明なエラー</CardTitle>
            <CardDescription>
              予期せぬエラーが発生しました。画面を更新してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full space-y-3">
              <Button
                className="w-full"
                onClick={() => window.location.reload()}
              >
                画面を更新
              </Button>
              <NavTopButton variant="outline" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

function NavTopButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Link to="/" onClick={() => setIsLoading(true)}>
      <Button className="w-full" disabled={isLoading} variant={variant}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            読み込み中...
          </>
        ) : (
          "トップページに戻る"
        )}
      </Button>
    </Link>
  );
}

function Error404() {
  return (
    <div className="flex items-center justify-center w-full h-screen px-4">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページが見つかりませんでした。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <NavTopButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Error500() {
  return (
    <div className="flex items-center justify-center w-full h-screen px-4">
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">エラー</CardTitle>
          <CardDescription>
            予期せぬエラーが発生しました。画面を更新してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col w-full space-y-3">
            <Button className="w-full" onClick={() => window.location.reload()}>
              画面を更新
            </Button>
            <NavTopButton variant="outline" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
