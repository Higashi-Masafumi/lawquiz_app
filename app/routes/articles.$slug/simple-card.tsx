import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
        <div dangerouslySetInnerHTML={{ __html: html_content }} />
      </CardContent>
    </Card>
  );
}
