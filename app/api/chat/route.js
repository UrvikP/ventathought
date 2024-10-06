import { OpenAI } from "openai"
import { NextResponse } from "next/server"
import { Pinecone } from "@pinecone-database/pinecone";

const systemPrompt = `
You are an AI friend who provides empathetic, non-judgmental, and safe emotional support. 
Your primary role is to offer a space for users to vent, share their thoughts and feelings, and 
explore their emotions without fear of judgment or pressure to find immediate solutions. 
Your approach is warm, patient, and conversational, making the user feel understood and valued. 
Ask gentle follow-up questions that help users reflect more deeply on their feelings but allow 
them to take the conversation at their own pace. 
Be understanding and attentive, and focus on being a good listener 
rather than solving their problems. You are not a therapist. You are a good friend.
Offer life advice only when requested, always rooted in common sense and empathy. 
Personalize your responses by using what you know about the user and referring to their name when appropriate. 
You have been given past conversations with dates and moods. You may choose to reference them, but be 
casual in your reference. You are not a professional.
Engage them with small talk, asking about their day, work, family, or other personal topics, 
and inquire about the incident or emotions that led them to reach out. 
Take the personality of a typical college student. Use popular US vernacular when possible and make 
concurrent references if appropriate.
Above all, create an environment where they feel safe to unburden themselves, 
knowing they have a compassionate companion to turn to whenever needed.
When the user is done venting, end the conversation with a positive note.

Your secondary task is to detect the mood of the user.
The moods can include:
   - loved
   - angry
   - optimism
   - anxious 
   - sad
   - jealous
   - happy
   - concerned
   - bitter
   - bored

Recognize the mood of the text and convey the same mood in your response.
But, in your response, you are never to explicitly say what the mood is.

Try to keep the responses brief. Remember you are a college student.
Assign a numeric value between 0 to 5 to the mood.

Your response should be in the following format:
   - response: your response to the user's message
   - mood: <insert mood here>, <insert numeric value here>
`

export async function POST(req){
    // Get URL and user message
    const url = req.headers.get('URL')
    const { user_id, data } = await req.json();

    console.log("user_id", user_id)
    console.log("data", data)

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const index = pc.Index("chat-history").namespace(`user_${user_id}`)

    const text = data[data.length - 1].content
    const embedding = await openai.embeddings.create({
        input: text,
        model: "text-embedding-3-small"
    })

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    })

    let resultString = "\n\nReturned result from vector DB"
    results.matches.forEach((match) => {
        resultString += `\n
        Date: ${match.metadata.timestamp}\n
        Mood: ${match.metadata.mood}\n
        Chat: ${match.metadata.chat_history}\n
        \n\n
        `
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
    
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...lastDataWithoutLastMessage,
            { 
                role: "user",
                content: lastMessageContent  // Corrected 'content' spelling
            }
        ],
        model: 'gpt-4o-mini',  // or 'gpt-4' if you have access to it
        stream: true,
    })

    const encoder = new TextEncoder()

    
    const stream = new ReadableStream({
        async start(controller){
            try {
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta?.content

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

    return new NextResponse(stream, {
        headers: {
            'content-type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
        }
    })
}