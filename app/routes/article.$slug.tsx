import { useState } from "react";
import {
  useLoaderData,
  json,
  Form,
  useActionData,
  useNavigate,
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
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { AutosizeTextarea } from "~/components/AutoresizeTextarea";
import { fetchPostContent } from "~/utils/cms.server";
import { gradeAnswer } from "~/utils/openai.server";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Loader2, Keyboard } from "lucide-react";
import { ContentBox } from "~/components/contetbox";
import { useTypingSpeed } from "~/utils/typingSpeed";

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug as string;
  const post = await fetchPostContent(slug);
  return json({ pageContent: post });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const answer = formData.get("answer") as string;
  const slug = formData.get("slug") as string;

  if (!answer || !slug) {
    return json({ error: "回答が必要です" }, { status: 400 });
  }

  try {
    const gradingResult = await gradeAnswer(answer, slug);
    return redirect(`/result/${gradingResult}`);
  } catch (error) {
    console.error(error);
    throw new Response("採点処理がタイムアウトしました", { status: 504 });
  }
};

export default function Index() {
  const { pageContent } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { typingSpeed, isTyping, updateTypingSpeed, resetTypingStats } =
    useTypingSpeed();
  const [isSubQuestionMode, setIsSubQuestionMode] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData();
    formData.append("answer", userAnswer);
    formData.append("slug", pageContent.slug);
    submit(formData, { method: "post" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        {/* ヘッダーセクション */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500">
                法律問題集
              </div>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                {pageContent.title}
              </h1>
            </div>
          </div>
        </div>
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-md shadow-md border-2">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  問題
                </h2>
                <ContentBox content={pageContent.problem} />
              </div>

              <Accordion type="multiple">
                <AccordionItem value="knowledge">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                    使う知識
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                    <ContentBox content={pageContent.knowledge} size="sm" />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="column">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
                    細かい知識
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                    <ContentBox content={pageContent.column} size="sm" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-white p-6 rounded-md shadow-md border-2">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  要件事実
                </h2>
                <ContentBox content={pageContent.fact} />
              </div>

              <div className="bg-white p-6 rounded-md shadow-md border-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                    解答
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        小問採点モード
                      </span>
                      <Switch
                        checked={isSubQuestionMode}
                        onCheckedChange={setIsSubQuestionMode}
                      />
                    </div>
                  </div>
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
                <Form method="post" onSubmit={handleSubmit}>
                  <AutosizeTextarea
                    name="answer"
                    placeholder="解答を入力してください"
                    value={userAnswer}
                    onChange={(event) => {
                      setUserAnswer(event.target.value);
                      updateTypingSpeed(event.target.value);
                    }}
                    className="min-h-[40px] mt-4 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <Accordion type="multiple">
                <AccordionItem value="navigate">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                    解答方針
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                    <ContentBox content={pageContent.navigate} size="sm" />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="comment">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
                    アドバイス
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                    <ContentBox content={pageContent.comment} size="sm" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
