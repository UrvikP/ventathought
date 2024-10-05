import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

export async function POST(req) {
    try {
        const { user_id, chat_history } = await req.json();

        // Get openai client
        const openai_client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // Make sure this is set
        });

        // Get pinecone client
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

        // Get the index
        const target_idx = "chat-history";
        const chatHist_idx = pc.index(target_idx);

        // Create embedding for chat history
        const response = await openai_client.embeddings.create({
            input: chat_history,
            model: "text-embedding-3-small",
        });

        const embedding = response.data[0].embedding;

        //console.log("embedding", embedding);

        // Format and upsert to pinecone
        const upsertResponse = await chatHist_idx.namespace(`user_${user_id}`).upsert([
            {
                id: `${user_id}-${Date.now()}`,
                values: embedding,
                metadata: {
                    user_id,
                    chat_history,
                    timestamp: new Date().toISOString(),
                    mood: "neutral",
                }
            }
        ]);

       // console.log('Upsert response:', upsertResponse);

        return NextResponse.json({
            success: true,
            message: "Your chat history has been saved!"
        }, { status: 200 });

    } catch (error) {
        console.error('Error in uploadChat:', error);
        return NextResponse.json({ 
            success: false,
            message: "Your chat history could not be saved.",
            error: error.message
        }, { status: 500 });
    }
}