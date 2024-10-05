import { OpenAI } from "openai"

export async function POST(req) {
    const openai_client = new OpenAI()
    return openai_client
}
