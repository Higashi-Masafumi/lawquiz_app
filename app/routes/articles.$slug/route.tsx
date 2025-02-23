import { useEffect } from "react";
import { useLoaderData, Form, useFetcher, redirect } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Loader2, Keyboard } from "lucide-react";
import { useTypingSpeed } from "~/utils/typingSpeed";
import { serviceResolver } from "~/resolvers/service.resolver";
import { Post } from "~/core/domain/entities/post";
import { TitleCard } from "./title-card";
import { SimpleCard } from "./simple-card";
import { AccordionCard } from "./accordion-card";
import { QuestionCard } from "./question-card";
import { Question } from "~/core/domain/entities/question";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const answerFormSchema = z.object({
  answer: z.string().min(1, { message: "解答を入力してください" }),
});

export const loader: LoaderFunction = async ({ params }) => {
  const post = await serviceResolver.postService.getBySlug(params.slug!);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return { post };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  // 小問の採点リクエストの場合
  if (formData.get("type") === "question") {
    const problem = formData.get("problem") as string;
    const question = JSON.parse(formData.get("question") as string) as Question;
    const userAnswer = formData.get("answer") as string;
    try {
      const gradingResult =
        await serviceResolver.scoringService.scoreAnswerWithoutRegister(
          problem,
          question,
          userAnswer
        );
      return { gradingResult };
    } catch (error) {
      return { error: `採点に失敗しました: ${error}` };
    }
  } else {
    // 大問の採点リクエストの場合
    const answer = formData.get("answer") as string;
    const post = JSON.parse(formData.get("post") as string) as Post;
    try {
      const gradingResult = await serviceResolver.scoringService.scoreAnswer(
        answer,
        post
      );
      return redirect(`/results/${gradingResult}`);
    } catch (error) {
      return { error: `採点に失敗しました: ${error}` };
    }
  }
};

export default function ArticlePage() {
  const { post } = useLoaderData<{ post: Post }>();
  const { typingSpeed, updateTypingSpeed } = useTypingSpeed();
  const fetcher = useFetcher<{ error: string }>();
  const submitting = fetcher.state === "submitting" || fetcher.state === "loading";

  const form = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
  });

  const onSubmit = (data: z.infer<typeof answerFormSchema>) => {
    fetcher.submit(
      {
        type: "post",
        answer: data.answer,
        post: JSON.stringify(post),
      },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      form.setError("answer", { message: fetcher.data.error });
    }
  }, [fetcher.data, form]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <TitleCard
          title={post.title}
          background_color="#87CEEB"
          section_url={{
            name: post.section.section,
            url: `/sections/${post.section.slug}`,
          }}
        />

        {/* 問題内容カード */}
        <div className="space-y-6">
          <SimpleCard title="問題" html_content={post.problem} />

          <AccordionCard title="使う知識" html_content={post.knowledge} />

          <AccordionCard title="模範解答" html_content={post.answer} />

          <AccordionCard title="要件事実" html_content={post.fact} />

          {post.questions.map((question) => (
            <QuestionCard
              key={question.theme}
              problem={post.problem}
              question={question}
            />
          ))}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>解答入力</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2">
                      <Keyboard className="w-6 h-6" />
                      <span className="text-sm text-gray-600">
                        {typingSpeed} 文字/分
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      入力を開始してからのタイピングスピードです
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <Form onSubmit={form.handleSubmit(onSubmit)}>
                <Textarea
                  {...form.register("answer")}
                  placeholder="解答を入力してください"
                  onChange={(e) => {
                    form.setValue("answer", e.target.value);
                    updateTypingSpeed(e.target.value);
                  }}
                  className="min-h-[150px] mt-4 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                {form.formState.errors.answer && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.answer.message}
                  </p>
                )}
                <div className="text-right mt-4">
                  {submitting ? (
                    <Button className="bg-red-600 cursor-not-allowed" disabled>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      採点中
                    </Button>
                  ) : (
                    <Button type="submit">採点する</Button>
                  )}
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* 解答方針 */}
          <AccordionCard title="解答方針" html_content={post.navigate} />
          <AccordionCard title="アドバイス" html_content={post.comment} />
        </div>
      </div>
    </div>
  );
}
