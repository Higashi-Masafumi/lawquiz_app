import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupLabel,
} from "./ui/sidebar";
import { Section } from "~/domain/entities/section";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

interface AppSidebarProps {
  sections: Section[];
}

export function AppSidebar({ sections }: AppSidebarProps) {
  return (
    <Sidebar className="top-[64px] h-[calc(100vh-64px)]">
      <SidebarHeader>
        <Button variant="ghost">司法試験対策サイト</Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>セクション一覧</SidebarGroupLabel>
          {sections.map((section) => (
            <SidebarMenu key={section.id}>
              <Collapsible
                key={section.id}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Link to={`/sections/${section.slug}`}>
                        {section.section}
                      </Link>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.posts.map((post) => (
                        <SidebarMenuItem key={post.id}>
                          <SidebarMenuButton>
                            <Link to={`/article/${post.slug}`}>
                              {post.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
