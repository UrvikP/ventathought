import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { NextResponse } from "next/server";

// Initialize Polly client
const client = new PollyClient({ region: "us-east-2" });

export async function POST(req) {
  const { text } = await req.json();

  const params = {
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Matthew", // Change the voice as needed
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const data = await client.send(command);

    // Check if AudioStream is available
    if (data.AudioStream) {
      // Return the AudioStream directly
      return new NextResponse(data.AudioStream, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="speech.mp3"',
        },
      });
    } else {
      console.log("No AudioStream returned.");
      return NextResponse.json({ error: "No AudioStream returned." }, { status: 500 });
    }

  } catch (error) {
    console.error("Error synthesizing speech:", error);
    return NextResponse.json({ error: "Error synthesizing speech" }, { status: 500 });
  }
}
