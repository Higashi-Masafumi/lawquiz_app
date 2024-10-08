// app/routes/grading-result.tsx
import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '~/components/ui/accordion';
import { LoaderFunction, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { fetchGrade } from '~/utils/cms';

type LoaderData = {
  scores: { criteria: string; score: number }[];
  criteria: { criteria: string; maxScore: number; description: string }[];
  commentary: string;
};

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  const resultId = params.resultId as string;
  const result = await fetchGrade(resultId);
  const scores = result.scores.map((score) => ({
    criteria: score.title,
    score: score.score,
  }));
  const criteria = result.article.scoring_criteria.map((criterion) => ({
    criteria: criterion.item_title,
    maxScore: criterion.score,
    description: criterion.scoring_criterion,
  }));
  return { scores, criteria, commentary: result.commentary };
};

export default function GradingResultPage() {
  const { scores, criteria, commentary } = useLoaderData<LoaderData>();

  // レーダーチャート用のデータを加工
  const radarData = scores.map((item) => ({
    subject: item.criteria,
    score: item.score,
    fullMark: criteria.find((criterion) => criterion.criteria === item.criteria)?.maxScore || 20,
  }));

  return (
    <div className="container mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 左側: 採点結果と講評 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>採点結果</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {criteria.map((item) => (
                <li
                  key={item.criteria}
                  className="flex justify-between items-center bg-white rounded-lg shadow p-4"
                >
                  <span className="text-lg font-semibold text-gray-800">{item.criteria}</span>
                  <span className="text-sm text-gray-600">
                    {scores.find((score) => score.criteria === item.criteria)?.score || 0} / {item.maxScore} 点
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-6" />
            <div className="bg-blue-50 p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold text-blue-700">講評</h2>
              <p className="text-gray-700 mt-2">{commentary}</p>
              <Button className="mt-4">次の問題に進む</Button>
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
                <PolarRadiusAxis angle={30} domain={[0, 20]} />
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
