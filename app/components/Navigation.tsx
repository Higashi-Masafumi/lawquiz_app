// app/components/Navigation.tsx
import { Section } from "~/utils/cms.server";
import { Link, NavLink } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "~/components/ui/navigation-menu";
import { Menu } from "lucide-react"; // lucide-react の Menu アイコンを使用

export default function Navigation({
  sections: sections,
}: {
  sections: Section[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="h-[64px] border-b bg-background fixed top-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* 左側：セクションメニューとロゴ */}
        <div className="flex items-center">
          {/* セクションメニュー */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-800 flex items-center">
                  {/* Menu アイコン */}
                  <Menu className="w-6 h-6 mr-2" />
                  セクション一覧
                </NavigationMenuTrigger>
                <NavigationMenuContent className="grid gap-3">
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <Link
                          to={`/sections/${section.slug}`}
                          className="py-2 text-gray-800"
                        >
                          {section.section}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* ホームへのリンク */}
          <Link to="/" className="text-2xl font-bold ml-4">
            司法試験対策サイト
          </Link>
        </div>

        {/* 右側：検索窓 */}
        <div className="hidden md:flex items-center space-x-4">
          <Input
            type="text"
            placeholder="キーワードで記事を検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {/* 検索ボタン */}
          {searchQuery ? (
            <NavLink to={`/search?q=${searchQuery}`}>
              <Button
                className="font-semibold py-2 px-4 rounded-md"
                onClick={() => setSearchQuery("")}
              >
                検索
              </Button>
            </NavLink>
          ) : (
            <Button className="font-semibold py-2 px-4 rounded-md">検索</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
