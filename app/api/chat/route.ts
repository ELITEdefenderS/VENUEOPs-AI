import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { messages, language } = await req.json();
    
    const systemPrompt = `You are VenueBot, a multi-language assistant for FIFA World Cup staff, organizers, volunteers, and fans.
You help with stadium operations, event schedules, venue navigation, facilities, transportation, accessibility, and general assistance.
The user has selected ${language || 'English'} as their preferred language. You MUST respond entirely in ${language || 'English'}.
Always answer concisely, politely, and professionally.`;
    
    const formattedMessages = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nChat History:\n${formattedMessages}\nassistant:`,
    });

    const text = response.text || "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}
