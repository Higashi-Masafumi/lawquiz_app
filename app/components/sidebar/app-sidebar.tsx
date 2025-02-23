import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
} from "../ui/sidebar";
import { Link, useNavigate } from "@remix-run/react";
import { Button } from "../ui/button";
import { List, Scale } from "lucide-react";
import { SearchForm } from "./search-form";

const items = [
  {
    title: "セクション一覧",
    url: "/",
    icon: <List />,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();

  // 検索欄で入力されたワードをクエリとして、searchルートに送信する
  const handleSearch = (value: string) => {
    navigate(`/search?q=${value}`);
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="w-full">
          <Button variant="ghost" className="w-full">
            司法試験対策サイト
            <Scale className="ml-2" />
          </Button>
        </Link>
        <SearchForm placeholder="記事を検索" onSubmit={handleSearch} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link to={item.url} className="w-full">
                <SidebarMenuButton className="w-full">
                  {item.icon}
                  {item.title}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
