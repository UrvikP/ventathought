import { Pinecone } from "@pinecone-database/pinecone"

export async function POST(req) {
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    return pc
}