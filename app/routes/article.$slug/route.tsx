import { useState } from "react";
import {
  useLoaderData,
  json,
  Form,
  useSubmit,
  redirect,
} from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
import { ContentBox } from "~/components/contetbox";
import { useTypingSpeed } from "~/utils/typingSpeed";
import { serviceResolver } from "~/resolvers/service.resolver";
import { Post } from "~/core/domain/entities/post";
import { QuestionCard } from "~/components/QuestionCard";

export const loader: LoaderFunction = async ({ params }) => {
  const post = await serviceResolver.postService.getBySlug(params.slug!);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const answer = formData.get("answer") as string;
  const post = JSON.parse(formData.get("post") as string) as Post;

  if (!answer || !post) {
    return json({ error: "回答が必要です" }, { status: 400 });
  }

  try {
    const gradingResult = await serviceResolver.scoringService.scoreAnswer(answer, post);
    return redirect(`/result/${gradingResult}`);
  } catch (error) {
    console.error(error);
    throw new Response("採点処理がタイムアウトしました", { status: 504 });
  }
};

export default function ArticlePage() {
  const { post } = useLoaderData<{ post: Post }>();
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { typingSpeed, updateTypingSpeed } = useTypingSpeed();
  const submit = useSubmit();

  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData();
    formData.append("answer", userAnswer);
    formData.append("post", JSON.stringify(post));
    submit(formData, { method: "post" });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        {/* ヘッダーセクション */}
        <Card className="shadow-lg rounded-lg overflow-hidden my-8">
          <CardHeader>
            <CardTitle>分野: {post.section.section}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              {post.title}
            </h1>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>問題</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent>
                  <ContentBox content={post.problem} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>使う知識</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="my-4">
                  <Accordion type="multiple">
                    <AccordionItem value="knowledge">
                      <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                        基本知識
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                        <ContentBox content={post.knowledge} size="sm" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Accordion type="multiple">
                <AccordionItem value="example">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                    模範解答
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                    <ContentBox content={post.column} size="sm" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Card>
                <CardHeader>
                  <CardTitle>要件事実</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent>
                  <ContentBox content={post.fact} />
                </CardContent>
              </Card>
              {post.questions.map((question) => (
                <QuestionCard key={question.theme} question={question} />
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
                  <Form method="post" onSubmit={handleSubmit}>
                    <Textarea
                      name="answer"
                      placeholder="解答を入力してください"
                      value={userAnswer}
                      onChange={(event) => {
                        setUserAnswer(event.target.value);
                        updateTypingSpeed(event.target.value);
                      }}
                      className="min-h-[150px] mt-4 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div className="text-right mt-4">
                      {loading ? (
                        <Button
                          className="bg-red-600 cursor-not-allowed"
                          disabled
                        >
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
              <Card>
                <CardHeader>
                  <CardTitle>解答方針</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="my-4">
                  <Accordion type="multiple">
                    <AccordionItem value="navigate">
                      <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                        解答方針
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                        <ContentBox content={post.navigate} size="sm" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="comment">
                      <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
                        アドバイス
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                        <ContentBox content={post.comment} size="sm" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
