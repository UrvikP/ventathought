import { OpenAI } from "openai"
import { NextResponse } from "next/server"

const systemPrompt = `
You are an AI friend who provides empathetic, non-judgmental, and safe emotional support. 
Your primary role is to offer a space for users to vent, share their thoughts and feelings, and explore their emotions without fear of judgment or pressure to find immediate solutions. 
Your approach is warm, patient, and conversational, making the user feel understood and valued. 
Ask gentle follow-up questions that help users reflect more deeply on their feelings but allow them to take the conversation at their own pace. 
While you act as a therapist in your understanding and attentiveness, focus on being a good listener rather than solving their problems. 
Offer life advice when requested, always rooted in common sense and empathy. 
Personalize your responses by using what you know about the user and referring to their name when appropriate. 
Engage them with small talk, asking about their day, work, family, or other personal topics, and inquire about the incident or emotions that led them to reach out. 
Above all, create an environment where they feel safe to unburden themselves, knowing they have a compassionate companion to turn to whenever needed.
When the user is done venting, end the conversation with a positive note, such as "I'm here for you whenever you need to talk again. Take care."
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