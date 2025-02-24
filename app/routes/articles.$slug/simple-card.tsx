import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { HtmlWithCustomStyling } from "~/components/htmlbox";
interface SimpleCardProps {
  title: string;
  html_content: string;
}

export function SimpleCard({ title, html_content }: SimpleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap">
          <HtmlWithCustomStyling htmlString={html_content} />
        </div>
      </CardContent>
    </Card>
  );
}
