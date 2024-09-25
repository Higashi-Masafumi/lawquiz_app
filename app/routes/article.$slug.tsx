import { useState } from 'react'
import { useLoaderData, json } from '@remix-run/react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { fetchPostContent } from '~/utils/cms'
import type { LoaderFunction } from '@remix-run/node'

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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <CardTitle className="text-2xl font-bold text-center text-white">
              {<div dangerouslySetInnerHTML={{ __html: pageContent.title }} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">問題</h2>
                <div className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.problem }} />
              </div>

              <Accordion type="multiple">
                <AccordionItem value="knowledge">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                    使う知識
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.knowledge }} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="column">
                  <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
                    細かい知識
                  </AccordionTrigger>
                  <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.column }} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">要件事実</h2>
                <div className="mt-4 text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.fact }} />
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">解答</h2>
                <Textarea
                  placeholder="解答を入力してください"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="mt-4 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-right mt-4">
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md">
                    提出
                  </Button>
                </div>
              </form>

              <Accordion type="multiple">
                  <AccordionItem value="navigate">
                      <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md">
                        解答方針
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.navigate }} />
                      </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="comment">
                      <AccordionTrigger className="text-lg font-medium bg-gray-200 hover:bg-gray-300 p-3 rounded-md mt-2">
                        アドバイス
                      </AccordionTrigger>
                      <AccordionContent className="bg-white p-4 rounded-md shadow-inner">
                          <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: pageContent.comment }} />
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
