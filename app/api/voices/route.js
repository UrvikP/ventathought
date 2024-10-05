import { PollyClient, DescribeVoicesCommand } from "@aws-sdk/client-polly";
import { NextResponse } from "next/server";

const client = new PollyClient({ region: "us-east-2" });

export async function GET() {
  try {
    const command = new DescribeVoicesCommand({ Engine: "neural" });
    const response = await client.send(command);
    const voices = response.Voices
      .filter(voice => voice.SupportedEngines.includes("neural"))
      .map(voice => ({
        id: voice.Id,
        name: voice.Name,
        gender: voice.Gender,
        language: voice.LanguageName,
        languageCode: voice.LanguageCode,
      }));
    return NextResponse.json(voices);
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}