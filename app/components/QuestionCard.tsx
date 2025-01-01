import { useState } from "react";
import { Question } from "~/domain/entities/section";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState<string | null>(null);

  const handleGrade = async () => {
    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: userAnswer,
          questionId: question.theme || "default",
        }),
      });
      const result = await response.json();
      setGradingResult(result.grade);
    } catch (error) {
      console.error("Error grading answer:", error);
      setGradingResult("採点に失敗しました");
    }
  };

  return (
    <Card className="shadow-lg rounded-lg overflow-hidden">
      <CardHeader>
        {question.theme && <CardTitle>{question.theme}</CardTitle>}
      </CardHeader>
      <Separator />
      <CardContent>
        <h3 className="text-lg font-medium my-2">考えてみよう</h3>
        <div
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
        <Textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="あなたの答えを入力してください"
          className="w-full p-2 border rounded-md"
        />
        <Button onClick={handleGrade} className="mt-2">
          採点する
        </Button>
        {gradingResult && <p className="mt-2">{gradingResult}</p>}
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="answer">
            <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
              解答
            </AccordionTrigger>
            <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
              <div dangerouslySetInnerHTML={{ __html: question.answer }} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="comment">
            <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
              講評
            </AccordionTrigger>
            <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
              <div dangerouslySetInnerHTML={{ __html: question.comment }} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
