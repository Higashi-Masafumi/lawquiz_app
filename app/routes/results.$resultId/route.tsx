// app/routes/grading-result.tsx
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { serviceResolver } from "~/resolvers/service.resolver";

export async function loader({ params }: LoaderFunctionArgs) {
  const resultId = params.resultId as string;
  const result = await serviceResolver.scoringService.getGradingAnswer(
    resultId
  );
  const scores = result.scores.map((score) => ({
    criteria: score.title,
    criterion: score.criterion,
    description: score.description,
    score: score.score,
  }));
  const criteria = result.article.scoring_criteria.map((criterion) => ({
    criteria: criterion.item_title,
    maxScore: criterion.score,
    description: criterion.scoring_criterion,
  }));
  return {
    scores,
    criteria,
    answer: result.answer,
    commentary: result.commentary,
    article_slug: result.article.slug,
  };
}

export default function GradingResultPage() {
  const { scores, criteria, answer, commentary, article_slug } =
    useLoaderData<typeof loader>();

  // レーダーチャート用のデータを加工
  const radarData = scores.map((item) => {
    const maxScore = criteria.find(
      (criterion) => criterion.criteria === item.criteria
    )!.maxScore;
    return {
      subject: item.criteria,
      score: (item.score / maxScore) * 100, // 各項目の得点を最大値の割合に変換
      fullMark: 100, // 全ての項目を100点満点でスケーリング
    };
  });

  const totalScore = scores.reduce((acc, item) => acc + item.score, 0);
  const totalMaxScore = criteria.reduce((acc, item) => acc + item.maxScore, 0);
  return (
    <div className="container mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 左側: 採点結果と講評 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">採点結果</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 総合得点の表示 */}
            <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-800">総合得点</h2>
              <p className="text-lg text-gray-700 mt-2">
                {totalScore} / {totalMaxScore} 点
              </p>
            </div>
            <ul className="space-y-4">
              {criteria.map((item) => {
                const scoreItem = scores.find(
                  (score) => score.criteria === item.criteria
                );
                return (
                  <li
                    key={item.criteria}
                    className="bg-white rounded-lg shadow p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">
                        {item.criteria}
                      </span>
                      <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                        {scoreItem?.score || 0} / {item.maxScore} 点
                      </span>
                    </div>
                    {scoreItem?.description && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: scoreItem.description,
                        }}
                        className="text-sm text-gray-600 border-t pt-2 mt-2"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <Separator className="my-6" />
            <div className="bg-blue-50 p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold text-blue-700">講評</h2>
              <p className="text-gray-700 mt-2">{commentary}</p>
              <NavLink
                to={`/articles/${article_slug}`}
                className="block mt-4 text-blue-600"
              >
                <Button>元の記事を見る</Button>
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右側: レーダーチャート */}
      <Card>
        <CardHeader>
          <CardTitle>採点結果の視覚化</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="得点"
                  dataKey="score"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/*回答の表示 */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">
              あなたの回答
            </h2>
            <div
              className="mt-4 text-gray-700"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 採点基準の詳細 */}
      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>採点基準の詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {criteria.map((item) => (
                <AccordionItem key={item.criteria} value={item.criteria}>
                  <AccordionTrigger className="text-lg font-semibold text-gray-800">
                    {item.criteria}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">{item.description}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
