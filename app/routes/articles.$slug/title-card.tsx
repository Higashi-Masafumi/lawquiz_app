import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";

interface TitleCardProps {
  title: string;
  background_color: string;
  section_url: {
    name: string;
    url: string;
  };
}

export function TitleCard({ title, background_color, section_url }: TitleCardProps) {
  return (
    <div className="space-y-4 mb-12">
      {/* パンくずリスト */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="hover:text-gray-900 flex items-center"
            >
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={section_url.url}
                className="hover:text-gray-900"
              >
                {section_url.name}
              </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-gray-900">{title}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* タイトル */}
      <div className="w-full h-48 flex items-center justify-center rounded-lg" style={{ backgroundColor: background_color }}>
        <h1 className="text-3xl font-bold text-center">{title}</h1>
      </div>
    </div>
  );
}
