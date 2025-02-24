import { Form } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Question } from "~/core/domain/entities/question";
import { useForm } from "react-hook-form";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { PencilLine, Loader2 } from "lucide-react";
import { GradingResult } from "~/core/domain/entities/grading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { HtmlWithCustomStyling } from "~/components/htmlbox";

const answerFormSchema = z.object({
  answer: z.string().min(1, { message: "回答を入力してください" }),
});

interface QuestionCardProps {
  problem: string;
  question: Question;
}

export function QuestionCard({ problem, question }: QuestionCardProps) {
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(
    null
  );
  const form = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
  });
  const fetcher = useFetcher<{ gradingResult: GradingResult, error: string }>();
  const submitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data) {
      console.log("useEffect", fetcher.data);
      setGradingResult(fetcher.data.gradingResult);
      if (fetcher.data.error) {
        form.setError("answer", { message: fetcher.data.error });
      }
    }
  }, [fetcher.data, gradingResult, form]);

  const onSubmit = (data: z.infer<typeof answerFormSchema>) => {
    fetcher.submit(
      {
        type: "question",
        answer: data.answer,
        problem: problem,
        question: JSON.stringify(question),
      },
      { method: "POST" }
    );
  };

  return (
    <Card>
      <CardHeader className="bg-muted">
        <div className="flex items-center gap-2">
          <PencilLine className="w-5 h-5" />
          <CardDescription>小問</CardDescription>
        </div>
        <CardTitle>{question.theme}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="text-lg">
          <HtmlWithCustomStyling htmlString={question.question} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="回答を入力してください..."
                {...form.register("answer", { required: true })}
                className="min-h-[150px] mt-4 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.formState.errors.answer && (
                <p className="text-sm text-destructive">
                  回答を入力してください
                </p>
              )}
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  採点中...
                </>
              ) : (
                "回答を送信"
              )}
            </Button>
          </form>
        </Form>

        {gradingResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">採点結果</h4>
                <p className="text-lg font-bold">
                  {gradingResult.grading.reduce((acc, g) => acc + g.score, 0)} /
                  {gradingResult.grading.reduce(
                    (acc, g) => acc + g.maxScore,
                    0
                  )}
                  点
                </p>
              </div>

              <div className="space-y-2">
                {gradingResult.grading.map((grade, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{grade.criterion}</span>
                    <span>{grade.score}点</span>
                  </div>
                ))}
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="feedback">
                <AccordionTrigger>フィードバック</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {gradingResult.commentary}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="model-answer">
                <AccordionTrigger>模範解答</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm whitespace-pre-wrap">
                    <HtmlWithCustomStyling htmlString={question.answer} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="comment">
                <AccordionTrigger>解説</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm whitespace-pre-wrap">
                    <HtmlWithCustomStyling htmlString={question.comment} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
