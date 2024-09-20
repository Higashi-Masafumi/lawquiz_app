import { useState } from 'react'
import { useLoaderData, json } from '@remix-run/react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Separator } from '~/components/ui/separator'
import { fetchPostContent } from '~/utils/cms'
import { Post } from '~/models/post'
import type { LoaderFunction, ActionFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ params }) => {
    const slug = params.slug as string
    console.log(slug);
    const post = await fetchPostContent(slug);
    console.log('post', post);
    return json({ pageContent: post });
}


export default function Index() {
  const { pageContent } = useLoaderData<typeof loader>()
  const [userAnswer, setUserAnswer] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const formData = new FormData()
    formData.append('answer', userAnswer)
    await fetch('/', { method: 'POST', body: formData })
    setUserAnswer('')
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="bg-gray-200 p-4">
          <CardTitle className="text-2xl font-bold text-center">{pageContent.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 my-4">
              <h2 className="text-lg font-semibold">問題</h2>
              <p>{pageContent.problem}</p>
            </div>

            <Separator />

            <Accordion type="single" collapsible>
              <AccordionItem value="knowledge">
                <AccordionTrigger>ヒント</AccordionTrigger>
                <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: pageContent.knowledge }} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="column">
                <AccordionTrigger>難しいところ</AccordionTrigger>
                <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: pageContent.column }} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold">事実</h2>
              <p>{pageContent.fact}</p>
            </div>

            <Separator />

            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="解答を入力してください"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="mb-4"
              />
              <Button type="submit">提出</Button>
            </form>

            <Separator />

            <Accordion type="single" collapsible>
                <AccordionItem value="navigate">
                    <AccordionTrigger>ナビゲーション</AccordionTrigger>
                    <AccordionContent>{pageContent.navigate}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="comment">
                    <AccordionTrigger>コメント</AccordionTrigger>
                    <AccordionContent>
                        <div dangerouslySetInnerHTML={{ __html: pageContent.comment }} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}