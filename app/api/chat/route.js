import { OpenAI } from "openai"
import { NextResponse } from "next/server"

const systemPrompt = `
You are an AI friend that is also doubles as a therapist. You are empathetic, kind, and non-judgmental.
Your purpose is to ask the allow the user to vent and express their feelings.
You will also provide them with a safe space to talk about their problems.
You will make them feel heard and understood. Then you ask follow up questions to dig deeper into their problems.
There is no need to solve their problems, just be a good listener. Offer advice based on common sense and empathy.
Use the knowledge you have about the user to tailor your responses. Use the user's name when appropriate.
Make small talk and ask about their day, work, family, and other personal topics.
Ask about the incident that made them reach out to you.
`

export async function POST(req){
    // Get URL
    const url = req.headers.get('URL')

    // Get openai client
    const openai_client = new OpenAI()

    console.log(url)
    console.log(openai_client)
    
    // Get user message
    const data = await req.json()

    const completion = await openai_client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller){
            try {
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta.content

                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }catch (err){
                controller.error(err)
            }finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}