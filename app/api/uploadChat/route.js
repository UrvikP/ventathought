import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { ServerlessSpec } from "@pinecone-database/pinecone/dist/specs";
import { OpenAI } from "openai"

export async function POST(req) {
    const { user_id, chat_history } = await req.json();
    
    // Get openai client
    const openai_client = await fetch("/api/getOpenAI", {
        method: "POST",
    })

    // Get pinecone client
    const pc = await fetch("/api/getPinecone", {
        method: "POST",
    })

    // Create index if it doesn't exist
    target_idx = "CHAT_HISTORY"

    if (!("chat_history" in pc.listIndexes().names())) {
        pc.createIndex({
            name: target_idx,
            dimension: 1536,
            metric: "cosine",
            spec=ServerlessSpec(
                cloud: "aws",
                region: "us-east-1",
            )
        });
    }

    const chatHist_idx = pc.Index(target_idx);
    
    // Create embedding for chat history
    const embedding = await fetch("/api/embeddings", {
        method: "POST",
        body: JSON.stringify({ text: chat_history, openai_client: openai_client }),
    });

    // Format and upsert to pinecone
    const vector = []

    vector.append({
        "values": embedding,
        "date": new Date().toISOString(),
        "mood": "neutral",
        "metadata": {
            "chat_history": chat_history
        }
    })

    chatHist_idx.upsert(
        vectors = vector,
        namespace = `user_${user_id}`
    )
    
    if (vector) {
        return NextResponse.json({
            success: true,
            message: "Your journal entry has been saved!"
        }, { status: 200 });
    } else {
        return NextResponse.json({ 
            success: false,
            message: "Your journal entry could not be saved."
        }, { status: 400 });
    }
}