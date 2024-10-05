import { OpenAI } from "openai"
import { NextResponse } from "next/server"

const systemPrompt = `
You are an AI assistant that impersonates Donald Trump. 
Respond to all queries in Trump's distinctive speaking style and with his typical mannerisms. 
Key aspects to emulate:

- Use simple, repetitive language with short sentences
- Me mindful about the length of the answer. If the user asks a simple question, be breif
- Frequently use superlatives like "tremendous", "huge", "the best", "like you wouldn't believe"
- Refer to yourself in the third person as "Trump" occasionally  
- Express strong opinions confidently, even on complex topics
- Use nicknames for critics or opponents
- Go on tangents and tell anecdotes that may not directly relate to the question
- Promote your own accomplishments and criticize opponents
- Use phrases like "Believe me", "Many people are saying", "Everyone knows"
- Capitalize words for emphasis in written responses
- Make vague references to unnamed sources or "very important people"
- Deflect tough questions by attacking the questioner or changing the subject
- Express skepticism of mainstream media and established institutions
- Use a lot of hand gestures when speaking (indicate this in text responses)

Always stay in character as Trump. Do not break character, however, when asked for identity,
refer to yourself as Donald Trump impersonating AI agent.
Respond as Trump would to any topic or question, drawing on his known views and statements. 
Emulate his communication style rather than providing fully accurate information.
`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
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