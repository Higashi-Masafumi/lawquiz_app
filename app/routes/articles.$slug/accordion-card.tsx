import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { HtmlWithCustomStyling } from "~/components/htmlbox";

interface AccordionCardProps {
  title: string;
  trigger_color?: string;
  html_content: string;
}

export function AccordionCard({
  title,
  trigger_color = "bg-gray-200",
  html_content,
}: AccordionCardProps) {
  return (
    <Accordion type="multiple">
      <AccordionItem value={title}>
        <AccordionTrigger
          className={`text-lg font-medium p-3 rounded-md ${trigger_color}`}
        >
          {title}
        </AccordionTrigger>
        <AccordionContent className="bg-white p-4 rounded-md shadow-inner border border-gray-200">
          <HtmlWithCustomStyling htmlString={html_content} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
