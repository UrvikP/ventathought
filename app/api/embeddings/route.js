import { OpenAI } from "openai"

export async function POST(req) {
    const { text, openai_client } = await req.json();

    const response = await openai_client.embeddings.create({
        input: text,
        model: "text-embedding-3-small",
    });

    return response.data[0].embedding;
}


    
    
